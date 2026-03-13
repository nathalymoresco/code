export const DNA_DIMENSIONS = [
  'ritmo',
  'natureza',
  'urbano',
  'praia',
  'cultura',
  'gastronomia',
  'sociabilidade',
  'fitness',
  'aventura',
  'relax',
] as const;

export type DNADimension = (typeof DNA_DIMENSIONS)[number];

export const DNA_DIMENSION_LABELS: Record<DNADimension, string> = {
  ritmo: 'Ritmo',
  natureza: 'Natureza',
  urbano: 'Urbano',
  praia: 'Praia',
  cultura: 'Cultura',
  gastronomia: 'Gastronomia',
  sociabilidade: 'Sociabilidade',
  fitness: 'Fitness',
  aventura: 'Aventura',
  relax: 'Relax',
};
