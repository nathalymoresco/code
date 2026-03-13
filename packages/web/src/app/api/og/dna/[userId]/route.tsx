import { ImageResponse } from '@vercel/og';
import { createClient } from '@supabase/supabase-js';
import { DNA_DIMENSION_LABELS } from '@travelmatch/shared';
import type { DNADimension } from '@travelmatch/shared';

export const runtime = 'edge';

const DIMENSION_COLORS: Record<DNADimension, string> = {
  natureza: '#2D7D46',
  praia: '#0EA5E9',
  urbano: '#6366F1',
  cultura: '#D946EF',
  gastronomia: '#F59E0B',
  aventura: '#EF4444',
  relax: '#06B6D4',
  fitness: '#10B981',
  sociabilidade: '#F97316',
  ritmo: '#8B5CF6',
};

// Simple in-memory rate limiting (per-instance, resets on cold start)
const rateLimitMap = new Map<string, number[]>();
const RATE_LIMIT = 10;
const RATE_WINDOW_MS = 60_000;

function isRateLimited(ip: string): boolean {
  const now = Date.now();
  const timestamps = rateLimitMap.get(ip) ?? [];
  const recent = timestamps.filter((t) => now - t < RATE_WINDOW_MS);

  if (recent.length >= RATE_LIMIT) return true;

  recent.push(now);
  rateLimitMap.set(ip, recent);
  return false;
}

export async function GET(
  request: Request,
  { params }: { params: Promise<{ userId: string }> },
) {
  const { userId } = await params;
  const { searchParams } = new URL(request.url);
  const format = searchParams.get('format');

  const ip = request.headers.get('x-forwarded-for') ?? 'unknown';
  if (isRateLimited(ip)) {
    return new Response('Rate limit exceeded', { status: 429 });
  }

  const isStories = format === 'stories';
  const width = isStories ? 1080 : 1200;
  const height = isStories ? 1920 : 630;

  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
  );

  const { data: profile } = await supabase
    .from('profiles')
    .select('id')
    .eq('user_id', userId)
    .single();

  if (!profile) {
    return new Response('User not found', { status: 404 });
  }

  const { data: dna } = await supabase
    .from('dna_profiles')
    .select('label, label_emoji, dimensions, completeness_percentage')
    .eq('profile_id', profile.id)
    .single();

  if (!dna) {
    return new Response('DNA not found', { status: 404 });
  }

  const dimensions = dna.dimensions as Record<DNADimension, number>;
  const sorted = (Object.entries(dimensions) as [DNADimension, number][])
    .sort((a, b) => b[1] - a[1])
    .slice(0, 5);

  return new ImageResponse(
    (
      <div
        style={{
          width: '100%',
          height: '100%',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          background: 'linear-gradient(135deg, #FFF8F0 0%, #E0F7F4 100%)',
          fontFamily: 'sans-serif',
          padding: isStories ? '80px 60px' : '40px 60px',
        }}
      >
        {/* Emoji + Label */}
        <div
          style={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            marginBottom: isStories ? 60 : 24,
          }}
        >
          <span style={{ fontSize: isStories ? 120 : 64 }}>{dna.label_emoji}</span>
          <span
            style={{
              fontSize: isStories ? 52 : 32,
              fontWeight: 700,
              color: '#0D9488',
              marginTop: 12,
            }}
          >
            {dna.label}
          </span>
        </div>

        {/* Top 5 dimensions */}
        <div
          style={{
            display: 'flex',
            flexDirection: 'column',
            gap: isStories ? 24 : 12,
            width: '100%',
            maxWidth: isStories ? 900 : 800,
          }}
        >
          {sorted.map(([dim, score]) => (
            <div
              key={dim}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: 16,
              }}
            >
              <span
                style={{
                  fontSize: isStories ? 28 : 16,
                  color: '#57534E',
                  width: isStories ? 220 : 130,
                  textAlign: 'right',
                }}
              >
                {DNA_DIMENSION_LABELS[dim]}
              </span>
              <div
                style={{
                  display: 'flex',
                  flex: 1,
                  height: isStories ? 32 : 20,
                  borderRadius: 999,
                  backgroundColor: '#E7E5E4',
                  overflow: 'hidden',
                }}
              >
                <div
                  style={{
                    width: `${score}%`,
                    height: '100%',
                    borderRadius: 999,
                    backgroundColor: DIMENSION_COLORS[dim],
                  }}
                />
              </div>
              <span
                style={{
                  fontSize: isStories ? 24 : 14,
                  color: '#78716C',
                  width: 50,
                }}
              >
                {score}%
              </span>
            </div>
          ))}
        </div>

        {/* Footer */}
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: 8,
            marginTop: isStories ? 80 : 32,
          }}
        >
          <span style={{ fontSize: isStories ? 24 : 14, color: '#A8A29E' }}>
            travelmatch.com.br
          </span>
          <span style={{ fontSize: isStories ? 24 : 14, color: '#0D9488' }}>
            · Descubra o seu!
          </span>
        </div>
      </div>
    ),
    { width, height },
  );
}
