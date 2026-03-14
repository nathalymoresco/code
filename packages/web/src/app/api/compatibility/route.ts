import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { createHash } from 'crypto';
import type { CompatibilityResult, CompatibilityResponse } from '@travelmatch/shared';

const CACHE_TTL_HOURS = 24;
const SEASONALITY_BONUS = 5;
const BUDGET_PENALTY = 15;

function hashVector(vector: number[]): string {
  return createHash('md5').update(JSON.stringify(vector)).digest('hex');
}

function generateMatchReasons(
  dest: { tags: string[]; best_months: number[]; avg_daily_cost: number | null },
  score: number,
  currentMonth: number,
): string[] {
  const reasons: string[] = [];

  if (score >= 85) reasons.push('Altamente compatível com seu perfil DNA');
  else if (score >= 70) reasons.push('Boa compatibilidade com seu perfil');

  if (dest.best_months.includes(currentMonth)) {
    reasons.push('Época ideal para visitar');
  }

  if (dest.tags.includes('natureza')) reasons.push('Rico em natureza');
  if (dest.tags.includes('praia')) reasons.push('Destino de praia');
  if (dest.tags.includes('aventura')) reasons.push('Aventuras disponíveis');
  if (dest.tags.includes('cultural')) reasons.push('Experiências culturais');
  if (dest.tags.includes('gastronomia')) reasons.push('Gastronomia local');

  return reasons.slice(0, 3);
}

export async function GET() {
  try {
    const supabase = await createClient();

    // Check auth
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Get profile
    const { data: profile } = await supabase
      .from('profiles')
      .select('id')
      .eq('user_id', user.id)
      .single();

    if (!profile) {
      return NextResponse.json({ error: 'Profile not found' }, { status: 404 });
    }

    // Get DNA profile
    const { data: dnaProfile } = await supabase
      .from('dna_profiles')
      .select('compatibility_vector, completeness_percentage')
      .eq('profile_id', profile.id)
      .single();

    // Fallback: no DNA — return active destinations by name
    if (!dnaProfile?.compatibility_vector) {
      const { data: fallbackDests } = await supabase
        .from('destinations')
        .select('id, name, slug, description, state, city, region, cover_url, photo_urls, tags, best_months, avg_daily_cost, min_days, max_days')
        .eq('is_active', true)
        .order('name');

      const results: CompatibilityResult[] = (fallbackDests ?? []).map((d) => ({
        destination_id: d.id,
        name: d.name,
        slug: d.slug,
        description: d.description,
        state: d.state,
        city: d.city,
        region: d.region,
        cover_url: d.cover_url,
        photo_urls: d.photo_urls,
        tags: d.tags,
        best_months: d.best_months,
        avg_daily_cost: d.avg_daily_cost,
        min_days: d.min_days,
        max_days: d.max_days,
        score: 50,
        cosine_similarity: 0.5,
        match_reasons: ['Complete seu DNA para recomendações personalizadas'],
      }));

      return NextResponse.json({
        destinations: results,
        cached: false,
        profile_completeness: 0,
      } satisfies CompatibilityResponse);
    }

    // compatibility_vector comes as string from Supabase pgvector: "[1,2,3,...]"
    const rawVector = dnaProfile.compatibility_vector;
    const vectorArray: number[] = typeof rawVector === 'string'
      ? rawVector.replace(/[\[\]]/g, '').split(',').map(Number)
      : Array.isArray(rawVector) ? rawVector : [];

    const vectorHash = hashVector(vectorArray);
    const completeness = dnaProfile.completeness_percentage;

    // Check cache
    const { data: cached } = await supabase
      .from('recommendation_cache')
      .select('recommendations, dna_vector_hash, expires_at')
      .eq('profile_id', profile.id)
      .single();

    if (
      cached &&
      cached.dna_vector_hash === vectorHash &&
      new Date(cached.expires_at) > new Date()
    ) {
      return NextResponse.json({
        destinations: cached.recommendations as CompatibilityResult[],
        cached: true,
        profile_completeness: completeness,
      } satisfies CompatibilityResponse);
    }

    // Call pgvector matching RPC
    const vectorStr = typeof rawVector === 'string' ? rawVector : `[${vectorArray.join(',')}]`;
    const { data: matches, error: matchError } = await supabase
      .rpc('match_destinations', {
        query_vector: vectorStr,
        match_count: 20,
        completeness,
      });

    if (matchError) {
      return NextResponse.json({ error: 'Matching failed' }, { status: 500 });
    }

    const currentMonth = new Date().getMonth() + 1;

    // Apply adjustments and build results
    const results: CompatibilityResult[] = (matches ?? []).map((m: {
      id: string;
      name: string;
      slug: string;
      description: string | null;
      state: string;
      city: string;
      region: string;
      cover_url: string | null;
      photo_urls: string[];
      tags: string[];
      best_months: number[];
      avg_daily_cost: number | null;
      min_days: number;
      max_days: number;
      cosine_similarity: number;
      raw_score: number;
    }) => {
      let score = m.raw_score;

      // Seasonality bonus
      if (m.best_months.includes(currentMonth)) {
        score = Math.min(100, score + SEASONALITY_BONUS);
      }

      // Budget penalty — if destination costs > 2x median
      // We use 300 BRL/day as a reference median for Brazilian travel
      if (m.avg_daily_cost && m.avg_daily_cost > 600) {
        score = Math.max(0, score - BUDGET_PENALTY);
      }

      const reasons = generateMatchReasons(
        { tags: m.tags, best_months: m.best_months, avg_daily_cost: m.avg_daily_cost },
        score,
        currentMonth,
      );

      return {
        destination_id: m.id,
        name: m.name,
        slug: m.slug,
        description: m.description,
        state: m.state,
        city: m.city,
        region: m.region,
        cover_url: m.cover_url,
        photo_urls: m.photo_urls,
        tags: m.tags,
        best_months: m.best_months,
        avg_daily_cost: m.avg_daily_cost,
        min_days: m.min_days,
        max_days: m.max_days,
        score,
        cosine_similarity: m.cosine_similarity,
        match_reasons: reasons,
      };
    });

    // Sort by final score descending
    results.sort((a, b) => b.score - a.score);

    // Save to cache
    const expiresAt = new Date();
    expiresAt.setHours(expiresAt.getHours() + CACHE_TTL_HOURS);

    await supabase
      .from('recommendation_cache')
      .upsert({
        profile_id: profile.id,
        recommendations: results,
        dna_vector_hash: vectorHash,
        expires_at: expiresAt.toISOString(),
      }, { onConflict: 'profile_id' });

    return NextResponse.json({
      destinations: results,
      cached: false,
      profile_completeness: completeness,
    } satisfies CompatibilityResponse);
  } catch (err) {
    console.error('Compatibility API error:', err);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
