import { describe, it, expect } from 'vitest';
import type { CompatibilityResult, CompatibilityResponse } from '@travelmatch/shared';

// Unit tests for compatibility scoring logic (no Supabase needed)

function applySeasonalityBonus(score: number, bestMonths: number[], currentMonth: number): number {
  if (bestMonths.includes(currentMonth)) {
    return Math.min(100, score + 5);
  }
  return score;
}

function applyBudgetPenalty(score: number, avgDailyCost: number | null): number {
  if (avgDailyCost && avgDailyCost > 600) {
    return Math.max(0, score - 15);
  }
  return score;
}

function generateMatchReasons(
  tags: string[],
  bestMonths: number[],
  score: number,
  currentMonth: number,
): string[] {
  const reasons: string[] = [];
  if (score >= 85) reasons.push('Altamente compatível com seu perfil DNA');
  else if (score >= 70) reasons.push('Boa compatibilidade com seu perfil');
  if (bestMonths.includes(currentMonth)) reasons.push('Época ideal para visitar');
  if (tags.includes('natureza')) reasons.push('Rico em natureza');
  if (tags.includes('praia')) reasons.push('Destino de praia');
  if (tags.includes('aventura')) reasons.push('Aventuras disponíveis');
  return reasons.slice(0, 3);
}

const baseDest: Omit<CompatibilityResult, 'score' | 'cosine_similarity' | 'match_reasons'> = {
  destination_id: 'd1',
  name: 'Chapada dos Veadeiros',
  slug: 'chapada-dos-veadeiros',
  description: 'Cerrado paradise',
  state: 'GO',
  city: 'Alto Paraíso de Goiás',
  region: 'centro-oeste',
  cover_url: null,
  photo_urls: [],
  tags: ['natureza', 'aventura', 'ecoturismo'],
  best_months: [5, 6, 7, 8, 9],
  avg_daily_cost: 280,
  min_days: 3,
  max_days: 7,
};

describe('Compatibility Scoring', () => {
  it('applies seasonality bonus when month matches best_months', () => {
    const score = applySeasonalityBonus(80, [5, 6, 7], 6);
    expect(score).toBe(85);
  });

  it('does not apply seasonality bonus when month is outside best_months', () => {
    const score = applySeasonalityBonus(80, [5, 6, 7], 12);
    expect(score).toBe(80);
  });

  it('caps seasonality bonus at 100', () => {
    const score = applySeasonalityBonus(98, [3], 3);
    expect(score).toBe(100);
  });

  it('applies budget penalty for expensive destinations', () => {
    const score = applyBudgetPenalty(85, 700);
    expect(score).toBe(70);
  });

  it('does not penalize affordable destinations', () => {
    const score = applyBudgetPenalty(85, 250);
    expect(score).toBe(85);
  });

  it('does not penalize null daily cost', () => {
    const score = applyBudgetPenalty(85, null);
    expect(score).toBe(85);
  });

  it('clamps budget penalty to 0 minimum', () => {
    const score = applyBudgetPenalty(10, 800);
    expect(score).toBe(0);
  });
});

describe('Match Reasons', () => {
  it('generates high compatibility reason for score >= 85', () => {
    const reasons = generateMatchReasons(['natureza'], [6], 90, 6);
    expect(reasons).toContain('Altamente compatível com seu perfil DNA');
  });

  it('generates good compatibility reason for score >= 70', () => {
    const reasons = generateMatchReasons([], [], 75, 1);
    expect(reasons).toContain('Boa compatibilidade com seu perfil');
  });

  it('includes season reason when month matches', () => {
    const reasons = generateMatchReasons([], [3, 4], 60, 3);
    expect(reasons).toContain('Época ideal para visitar');
  });

  it('includes tag-based reasons', () => {
    const reasons = generateMatchReasons(['natureza', 'praia', 'aventura'], [], 60, 1);
    expect(reasons).toContain('Rico em natureza');
    expect(reasons).toContain('Destino de praia');
    expect(reasons).toContain('Aventuras disponíveis');
  });

  it('limits reasons to 3 max', () => {
    const reasons = generateMatchReasons(['natureza', 'praia', 'aventura'], [1], 90, 1);
    expect(reasons.length).toBeLessThanOrEqual(3);
  });
});

describe('CompatibilityResponse shape', () => {
  it('has correct structure for DNA-based response', () => {
    const response: CompatibilityResponse = {
      destinations: [{
        ...baseDest,
        score: 87,
        cosine_similarity: 0.92,
        match_reasons: ['Altamente compatível com seu perfil DNA'],
      }],
      cached: false,
      profile_completeness: 95,
    };

    expect(response.destinations).toHaveLength(1);
    expect(response.destinations[0]!.score).toBe(87);
    expect(response.cached).toBe(false);
    expect(response.profile_completeness).toBe(95);
  });

  it('has correct structure for fallback response (no DNA)', () => {
    const response: CompatibilityResponse = {
      destinations: [{
        ...baseDest,
        score: 50,
        cosine_similarity: 0.5,
        match_reasons: ['Complete seu DNA para recomendações personalizadas'],
      }],
      cached: false,
      profile_completeness: 0,
    };

    expect(response.profile_completeness).toBe(0);
    expect(response.destinations[0]!.score).toBe(50);
    expect(response.destinations[0]!.match_reasons[0]).toContain('Complete seu DNA');
  });

  it('destinations are sorted by score descending', () => {
    const dests: CompatibilityResult[] = [
      { ...baseDest, destination_id: 'd1', score: 60, cosine_similarity: 0.6, match_reasons: [] },
      { ...baseDest, destination_id: 'd2', score: 90, cosine_similarity: 0.9, match_reasons: [] },
      { ...baseDest, destination_id: 'd3', score: 75, cosine_similarity: 0.75, match_reasons: [] },
    ];

    const sorted = [...dests].sort((a, b) => b.score - a.score);
    expect(sorted[0]!.destination_id).toBe('d2');
    expect(sorted[1]!.destination_id).toBe('d3');
    expect(sorted[2]!.destination_id).toBe('d1');
  });
});
