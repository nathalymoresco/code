import { describe, it, expect } from 'vitest';
import { getDNADescription, DNA_DESCRIPTIONS } from '../dna-descriptions';
import { DNA_DIMENSIONS } from '../dna-dimensions';
import type { DNADimension } from '../dna-dimensions';

function makeDimensions(overrides: Partial<Record<DNADimension, number>> = {}): Record<DNADimension, number> {
  const base: Record<string, number> = {};
  for (const dim of DNA_DIMENSIONS) {
    base[dim] = 50;
  }
  return { ...base, ...overrides } as Record<DNADimension, number>;
}

describe('getDNADescription', () => {
  it('returns description for top 2 dimensions', () => {
    const dims = makeDimensions({ natureza: 90, relax: 80 });
    const result = getDNADescription(dims);
    expect(result.length).toBeGreaterThanOrEqual(2);
    expect(result[0]).toBe(DNA_DESCRIPTIONS.natureza.high);
    expect(result[1]).toBe(DNA_DESCRIPTIONS.relax.high);
  });

  it('includes low description when lowest < 30', () => {
    const dims = makeDimensions({ natureza: 90, relax: 80, urbano: 10 });
    const result = getDNADescription(dims);
    expect(result).toContain(DNA_DESCRIPTIONS.urbano.low);
  });

  it('does not include low description when all >= 30', () => {
    const dims = makeDimensions({ natureza: 90, relax: 80 });
    const result = getDNADescription(dims);
    expect(result.length).toBe(2);
  });

  it('has descriptions for all 10 dimensions', () => {
    for (const dim of DNA_DIMENSIONS) {
      expect(DNA_DESCRIPTIONS[dim].high).toBeTruthy();
      expect(DNA_DESCRIPTIONS[dim].low).toBeTruthy();
    }
  });
});
