import { describe, it, expect } from 'vitest';
import { calculateDNA } from '../dna-calculator';
import type { QuizAnswer } from '../../types/quiz';

function makeAnswer(
  questionIndex: number,
  dims: Record<string, number>,
): QuizAnswer {
  return {
    questionIndex,
    optionIds: ['test'],
    dimensionsAffected: dims,
  };
}

describe('calculateDNA', () => {
  it('calculates "Explorador Zen" profile (natureza + relax high)', () => {
    const answers: QuizAnswer[] = [
      makeAnswer(0, { relax: 80, natureza: 30 }),
      makeAnswer(1, { natureza: 90, praia: 20, urbano: 10 }),
      makeAnswer(2, { sociabilidade: 45 }),
      makeAnswer(3, { natureza: 80, relax: 60 }),
      makeAnswer(4, { relax: 70, natureza: 60 }),
      makeAnswer(5, { gastronomia: 10, urbano: 10 }),
      makeAnswer(6, { cultura: 15, urbano: 10 }),
      makeAnswer(7, { relax: 60, natureza: 40 }),
      makeAnswer(8, { cultura: 25, natureza: 50 }),
      makeAnswer(9, { natureza: 70, relax: 40 }),
    ];
    const result = calculateDNA(answers);
    expect(result.label).toBe('Explorador Zen');
    expect(result.labelEmoji).toBe('🌿');
    expect(result.completeness).toBe(95);
    expect(result.dimensions.natureza).toBeGreaterThan(result.dimensions.urbano);
  });

  it('calculates "Alma Praiana" profile (praia + relax high)', () => {
    const answers: QuizAnswer[] = [
      makeAnswer(0, { ritmo: 20, relax: 80, aventura: 15 }),
      makeAnswer(1, { praia: 90, natureza: 40, urbano: 10 }),
      makeAnswer(2, { sociabilidade: 45 }),
      makeAnswer(3, { praia: 30, natureza: 20 }),
      makeAnswer(4, { fitness: 15, relax: 60 }),
      makeAnswer(5, { gastronomia: 10 }),
      makeAnswer(6, { cultura: 15 }),
      makeAnswer(7, { relax: 60, aventura: 10 }),
      makeAnswer(8, { relax: 40, urbano: 20 }),
      makeAnswer(9, { praia: 50, relax: 20 }),
    ];
    const result = calculateDNA(answers);
    expect(result.label).toBe('Alma Praiana');
    expect(result.labelEmoji).toBe('🏖️');
  });

  it('calculates "Cosmopolita" profile (urbano + cultura high)', () => {
    const answers: QuizAnswer[] = [
      makeAnswer(0, { urbano: 80, cultura: 60 }),
      makeAnswer(1, { urbano: 85, cultura: 70, sociabilidade: 30 }),
      makeAnswer(2, { sociabilidade: 30 }),
      makeAnswer(3, { urbano: 70, cultura: 60 }),
      makeAnswer(4, { cultura: 65, urbano: 50 }),
      makeAnswer(5, { gastronomia: 30, urbano: 40 }),
      makeAnswer(6, { cultura: 70, urbano: 60 }),
      makeAnswer(7, { cultura: 60, urbano: 40 }),
      makeAnswer(8, { urbano: 50, cultura: 40 }),
      makeAnswer(9, { urbano: 60, cultura: 50 }),
    ];
    const result = calculateDNA(answers);
    expect(result.label).toBe('Cosmopolita');
    expect(result.labelEmoji).toBe('🌆');
  });

  it('calculates "Extremo" profile (aventura + fitness high)', () => {
    const answers: QuizAnswer[] = [
      makeAnswer(0, { aventura: 85, fitness: 70 }),
      makeAnswer(1, { aventura: 80, fitness: 60, natureza: 20 }),
      makeAnswer(2, { sociabilidade: 40 }),
      makeAnswer(3, { aventura: 70, fitness: 65 }),
      makeAnswer(4, { fitness: 85, aventura: 60 }),
      makeAnswer(5, { aventura: 60, fitness: 50, gastronomia: 10 }),
      makeAnswer(6, { aventura: 75, fitness: 55 }),
      makeAnswer(7, { aventura: 70, fitness: 50 }),
      makeAnswer(8, { aventura: 65, fitness: 45 }),
      makeAnswer(9, { fitness: 70, aventura: 60 }),
    ];
    const result = calculateDNA(answers);
    expect(['Extremo', 'Desbravador', 'Atleta da Natureza']).toContain(result.label);
    expect(result.dimensions.fitness).toBeGreaterThan(40);
    expect(result.dimensions.aventura).toBeGreaterThan(40);
  });

  it('calculates "Lobo Solitário" when sociabilidade < 30', () => {
    const answers: QuizAnswer[] = [
      makeAnswer(0, { ritmo: 50, relax: 50, aventura: 50 }),
      makeAnswer(1, { natureza: 90, praia: 20, fitness: 40 }),
      makeAnswer(2, { sociabilidade: 15 }),
      makeAnswer(3, { natureza: 40, fitness: 30 }),
      makeAnswer(4, { fitness: 50, relax: 40 }),
      makeAnswer(5, { gastronomia: 50 }),
      makeAnswer(6, { cultura: 60, sociabilidade: 10 }),
      makeAnswer(7, { relax: 30, aventura: 30, cultura: 30 }),
      makeAnswer(8, { cultura: 25, natureza: 15 }),
      makeAnswer(9, { natureza: 50, fitness: 20 }),
    ];
    const result = calculateDNA(answers);
    expect(result.label).toBe('Lobo Solitário');
    expect(result.labelEmoji).toBe('🐺');
    expect(result.dimensions.sociabilidade).toBeLessThan(30);
  });

  it('normalizes dimensions to 0-100 range', () => {
    const answers: QuizAnswer[] = [
      makeAnswer(0, { ritmo: 100, relax: 0 }),
      makeAnswer(1, { praia: 100 }),
      makeAnswer(2, { sociabilidade: 50 }),
    ];
    const result = calculateDNA(answers);
    for (const dim of Object.values(result.dimensions)) {
      expect(dim).toBeGreaterThanOrEqual(0);
      expect(dim).toBeLessThanOrEqual(100);
    }
  });

  it('generates L2-normalized vector', () => {
    const answers: QuizAnswer[] = [
      makeAnswer(0, { ritmo: 85, relax: 15, aventura: 85 }),
      makeAnswer(1, { natureza: 90 }),
      makeAnswer(2, { sociabilidade: 65 }),
    ];
    const result = calculateDNA(answers);
    expect(result.vector).toHaveLength(10);
    const magnitude = Math.sqrt(result.vector.reduce((sum, v) => sum + v * v, 0));
    expect(magnitude).toBeCloseTo(1, 3);
  });

  it('returns 40% completeness for phase 1 (3 answers)', () => {
    const answers: QuizAnswer[] = [
      makeAnswer(0, { ritmo: 50 }),
      makeAnswer(1, { praia: 50 }),
      makeAnswer(2, { sociabilidade: 50 }),
    ];
    const result = calculateDNA(answers);
    expect(result.completeness).toBe(40);
  });

  it('returns 95% completeness for full quiz (10 answers)', () => {
    const answers = Array.from({ length: 10 }, (_, i) =>
      makeAnswer(i, { ritmo: 50 }),
    );
    const result = calculateDNA(answers);
    expect(result.completeness).toBe(95);
  });
});
