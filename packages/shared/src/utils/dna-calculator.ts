import { DNA_DIMENSIONS, type DNADimension } from '../constants/dna-dimensions';
import type { QuizAnswer, DNAResult, DNALabelEntry } from '../types/quiz';

const DNA_LABELS: DNALabelEntry[] = [
  { top1: 'natureza', top2: 'relax', label: 'Explorador Zen', emoji: '🌿' },
  { top1: 'natureza', top2: 'aventura', label: 'Desbravador', emoji: '🏔️' },
  { top1: 'natureza', top2: 'fitness', label: 'Atleta da Natureza', emoji: '🥾' },
  { top1: 'natureza', top2: 'gastronomia', label: 'Orgânico', emoji: '🌱' },
  { top1: 'praia', top2: 'relax', label: 'Alma Praiana', emoji: '🏖️' },
  { top1: 'praia', top2: 'aventura', label: 'Surfista de Alma', emoji: '🏄' },
  { top1: 'praia', top2: 'sociabilidade', label: 'Festeiro do Litoral', emoji: '🎉' },
  { top1: 'urbano', top2: 'cultura', label: 'Cosmopolita', emoji: '🌆' },
  { top1: 'urbano', top2: 'gastronomia', label: 'Foodie Urbano', emoji: '🍜' },
  { top1: 'urbano', top2: 'sociabilidade', label: 'Noctívago', emoji: '🌙' },
  { top1: 'cultura', top2: 'gastronomia', label: 'Imersivo Cultural', emoji: '🎭' },
  { top1: 'cultura', top2: 'relax', label: 'Contemplativo', emoji: '🧘' },
  { top1: 'aventura', top2: 'fitness', label: 'Extremo', emoji: '⚡' },
  { top1: 'aventura', top2: 'sociabilidade', label: 'Aventureiro Social', emoji: '🪂' },
  { top1: 'relax', top2: 'gastronomia', label: 'Hedonista', emoji: '🍷' },
  { top1: 'relax', top2: 'sociabilidade', label: 'Anfitrião', emoji: '🏡' },
  { top1: 'fitness', top2: 'praia', label: 'Aquático', emoji: '🤿' },
  { top1: 'gastronomia', top2: 'aventura', label: 'Gastrônomade', emoji: '🗺️' },
  { top1: 'sociabilidade', top2: 'cultura', label: 'Conector', emoji: '🤝' },
];

function lookupLabel(
  sorted: { dimension: DNADimension; score: number }[],
): { label: string; emoji: string } {
  const s0 = sorted[0];
  const s1 = sorted[1];
  const s2 = sorted[2];

  if (!s0 || !s1) return { label: 'Viajante', emoji: '✈️' };

  const top1 = s0.dimension;
  const top2 = s1.dimension;

  // Try Top1 + Top2
  let entry = DNA_LABELS.find((e) => e.top1 === top1 && e.top2 === top2);
  if (entry) return { label: entry.label, emoji: entry.emoji };

  // Try reversed
  entry = DNA_LABELS.find((e) => e.top1 === top2 && e.top2 === top1);
  if (entry) return { label: entry.label, emoji: entry.emoji };

  // If tie (diff < 5 between Top2 & Top3), try Top1 + Top3
  if (s2 && s1.score - s2.score < 5) {
    const top3 = s2.dimension;
    entry = DNA_LABELS.find(
      (e) =>
        (e.top1 === top1 && e.top2 === top3) || (e.top1 === top3 && e.top2 === top1),
    );
    if (entry) return { label: entry.label, emoji: entry.emoji };
  }

  return { label: 'Viajante', emoji: '✈️' };
}

export function calculateDNA(answers: QuizAnswer[]): DNAResult {
  // 1. Accumulate weights per dimension
  const raw: Record<string, number[]> = {};
  for (const dim of DNA_DIMENSIONS) {
    raw[dim] = [];
  }

  for (const answer of answers) {
    for (const [dim, weight] of Object.entries(answer.dimensionsAffected)) {
      const arr = raw[dim];
      if (arr && typeof weight === 'number') {
        arr.push(weight);
      }
    }
  }

  // 2. Normalize to 0-100 (average of all contributions, default 50 if no data)
  const dimensions = {} as Record<DNADimension, number>;
  for (const dim of DNA_DIMENSIONS) {
    const values = raw[dim] ?? [];
    if (values.length === 0) {
      dimensions[dim] = 50; // neutral default
    } else {
      const avg = values.reduce((sum, v) => sum + v, 0) / values.length;
      dimensions[dim] = Math.round(Math.min(100, Math.max(0, avg)));
    }
  }

  // 3. Generate 10-dimensional vector (L2 normalized)
  const rawVector = DNA_DIMENSIONS.map((d) => dimensions[d]);
  const magnitude = Math.sqrt(rawVector.reduce((sum, v) => sum + v * v, 0));
  const vector = magnitude > 0 ? rawVector.map((v) => Number((v / magnitude).toFixed(6))) : rawVector;

  // 4. Determine label + emoji
  const sorted = DNA_DIMENSIONS.map((d) => ({ dimension: d, score: dimensions[d] })).sort(
    (a, b) => b.score - a.score,
  );

  // Special case: sociabilidade < 30 → Lobo Solitário
  if (dimensions.sociabilidade < 30) {
    return {
      dimensions,
      vector,
      label: 'Lobo Solitário',
      labelEmoji: '🐺',
      completeness: answers.length >= 10 ? 95 : answers.length >= 3 ? 40 : Math.round((answers.length / 10) * 100),
    };
  }

  const { label, emoji: labelEmoji } = lookupLabel(sorted);

  return {
    dimensions,
    vector,
    label,
    labelEmoji,
    completeness: answers.length >= 10 ? 95 : answers.length >= 3 ? 40 : Math.round((answers.length / 10) * 100),
  };
}
