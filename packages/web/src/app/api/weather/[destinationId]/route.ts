import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

const OPENWEATHER_API_KEY = process.env.OPENWEATHER_API_KEY;
const CACHE_TTL_HOURS = 24;

// Rate limiter: max 50 requests/hour (free tier = 60/min, but we're conservative)
const rateLimitMap = new Map<string, { count: number; resetAt: number }>();
const RATE_LIMIT = 50;
const RATE_WINDOW_MS = 3600_000; // 1 hour

function checkRateLimit(): boolean {
  const key = 'openweather';
  const now = Date.now();
  const entry = rateLimitMap.get(key);

  if (!entry || now > entry.resetAt) {
    rateLimitMap.set(key, { count: 1, resetAt: now + RATE_WINDOW_MS });
    return true;
  }

  if (entry.count >= RATE_LIMIT) return false;
  entry.count++;
  return true;
}

interface MonthlyWeather {
  month: number;
  avg_temp_c: number;
  avg_rain_mm: number;
  avg_humidity: number;
  condition: string;
  is_high_season: boolean;
}

// Static fallback data for Brazilian climate zones
function getStaticFallback(latitude: number, bestMonths: number[]): MonthlyWeather[] {
  // Approximate Brazilian climate: tropical (lat < -15) vs subtropical (lat > -23)
  const isTropical = latitude > -20;
  const baseTemp = isTropical ? 28 : 22;
  const tempVariation = isTropical ? 3 : 8;

  return Array.from({ length: 12 }, (_, i) => {
    const month = i + 1;
    // Simple seasonal model: cooler Jun-Aug, warmer Dec-Feb
    const seasonFactor = Math.cos(((month - 1) / 12) * 2 * Math.PI);
    const temp = Math.round(baseTemp + seasonFactor * tempVariation);
    // Rainy season: Oct-Mar for most of Brazil
    const isRainy = month >= 10 || month <= 3;
    const rain = isRainy ? Math.round(150 + Math.random() * 50) : Math.round(30 + Math.random() * 40);

    return {
      month,
      avg_temp_c: temp,
      avg_rain_mm: rain,
      avg_humidity: isRainy ? 80 : 60,
      condition: isRainy ? 'chuvoso' : 'ensolarado',
      is_high_season: bestMonths.includes(month),
    };
  });
}

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ destinationId: string }> },
) {
  try {
    const { destinationId } = await params;
    const supabase = await createClient();

    // Check cached data first
    const { data: cached } = await supabase
      .from('destination_weather')
      .select('month, avg_temp_c, avg_rain_mm, avg_humidity, condition, is_high_season, updated_at')
      .eq('destination_id', destinationId)
      .order('month');

    // If we have 12 months cached and freshest data is < 24h old, return it
    if (cached && cached.length === 12) {
      const freshest = cached.reduce((a, b) =>
        new Date(a.updated_at) > new Date(b.updated_at) ? a : b,
      );
      const age = Date.now() - new Date(freshest.updated_at).getTime();
      if (age < CACHE_TTL_HOURS * 3600_000) {
        return NextResponse.json({
          weather: cached.map(({ updated_at: _, ...w }) => w),
          source: 'cache',
        });
      }
    }

    // Get destination coords
    const { data: dest } = await supabase
      .from('destinations')
      .select('latitude, longitude, best_months')
      .eq('id', destinationId)
      .single();

    if (!dest) {
      return NextResponse.json({ error: 'Destination not found' }, { status: 404 });
    }

    // Try OpenWeather API
    if (OPENWEATHER_API_KEY && checkRateLimit()) {
      try {
        const url = `https://api.openweathermap.org/data/2.5/weather?lat=${dest.latitude}&lon=${dest.longitude}&units=metric&lang=pt_br&appid=${OPENWEATHER_API_KEY}`;
        const res = await fetch(url, { signal: AbortSignal.timeout(5000) });

        if (res.ok) {
          const data = await res.json();
          const currentMonth = new Date().getMonth() + 1;

          // Update current month in cache
          await supabase
            .from('destination_weather')
            .upsert({
              destination_id: destinationId,
              month: currentMonth,
              avg_temp_c: Math.round(data.main.temp),
              avg_rain_mm: data.rain?.['1h'] ? Math.round(data.rain['1h'] * 24 * 30) : null,
              avg_humidity: data.main.humidity,
              condition: data.weather?.[0]?.description ?? 'desconhecido',
              is_high_season: dest.best_months.includes(currentMonth),
              updated_at: new Date().toISOString(),
            }, { onConflict: 'destination_id,month' });

          // If we have partial cache, return mix of real + cached
          if (cached && cached.length > 0) {
            const merged = cached.map(({ updated_at: _, ...w }) => w);
            const idx = merged.findIndex((w) => w.month === currentMonth);
            if (idx >= 0) {
              merged[idx] = {
                month: currentMonth,
                avg_temp_c: Math.round(data.main.temp),
                avg_rain_mm: data.rain?.['1h'] ? Math.round(data.rain['1h'] * 24 * 30) : merged[idx]!.avg_rain_mm,
                avg_humidity: data.main.humidity,
                condition: data.weather?.[0]?.description ?? merged[idx]!.condition,
                is_high_season: dest.best_months.includes(currentMonth),
              };
            }
            return NextResponse.json({ weather: merged, source: 'api+cache' });
          }
        }
      } catch {
        // API call failed, fall through to fallback
      }
    }

    // Return cached if available (even if stale)
    if (cached && cached.length > 0) {
      return NextResponse.json({
        weather: cached.map(({ updated_at: _, ...w }) => w),
        source: 'cache-stale',
      });
    }

    // Static fallback
    const fallback = getStaticFallback(dest.latitude, dest.best_months);

    // Seed fallback into cache for future
    const upserts = fallback.map((w) => ({
      destination_id: destinationId,
      ...w,
      updated_at: new Date().toISOString(),
    }));

    await supabase
      .from('destination_weather')
      .upsert(upserts, { onConflict: 'destination_id,month' });

    return NextResponse.json({ weather: fallback, source: 'fallback' });
  } catch {
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
