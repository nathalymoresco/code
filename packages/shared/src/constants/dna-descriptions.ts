import type { DNADimension } from './dna-dimensions';

export const DNA_DESCRIPTIONS: Record<DNADimension, { high: string; low: string }> = {
  ritmo: {
    high: 'Você curte um ritmo intenso, com agenda cheia e muitas atividades por dia.',
    low: 'Você prefere um ritmo tranquilo, sem correria, aproveitando cada momento.',
  },
  natureza: {
    high: 'Você se conecta profundamente com a natureza e busca experiências ao ar livre.',
    low: 'Ambientes naturais não são sua prioridade — você prefere o conforto urbano.',
  },
  urbano: {
    high: 'Cidades vibrantes são seu habitat — museus, restaurantes, vida noturna.',
    low: 'Grandes centros não te atraem tanto — você busca destinos mais tranquilos.',
  },
  praia: {
    high: 'Pé na areia e mar azul são seu paraíso — praia é essencial para você.',
    low: 'Praia não é prioridade nas suas viagens — outros cenários te atraem mais.',
  },
  cultura: {
    high: 'Você adora mergulhar na cultura local — história, arte, tradições e costumes.',
    low: 'Experiências culturais não são o foco principal das suas viagens.',
  },
  gastronomia: {
    high: 'Comida é experiência! Você busca sabores locais e restaurantes especiais.',
    low: 'Gastronomia não é decisiva na escolha do destino para você.',
  },
  sociabilidade: {
    high: 'Você adora conhecer pessoas novas e viajar em grupo é uma alegria.',
    low: 'Você prefere viagens mais reservadas, curtindo momentos a sós ou em pequenos grupos.',
  },
  fitness: {
    high: 'Atividade física faz parte da sua viagem — trilhas, surf, bike, academia.',
    low: 'Exercícios não são prioridade durante suas viagens — é hora de descansar!',
  },
  aventura: {
    high: 'Adrenalina é seu combustível — esportes radicais e experiências únicas te movem.',
    low: 'Você prefere atividades mais seguras e previsíveis nas suas viagens.',
  },
  relax: {
    high: 'Relaxar é sagrado — spa, piscina, rede e zero preocupações.',
    low: 'Ficar parado não é pra você — prefere estar sempre em movimento.',
  },
};

export function getDNADescription(
  dimensions: Record<DNADimension, number>,
): string[] {
  const sorted = (Object.entries(dimensions) as [DNADimension, number][])
    .sort((a, b) => b[1] - a[1]);

  const top1 = sorted[0];
  const top2 = sorted[1];
  const lowest = sorted[sorted.length - 1];

  const descriptions: string[] = [];

  if (top1) {
    descriptions.push(DNA_DESCRIPTIONS[top1[0]].high);
  }
  if (top2) {
    descriptions.push(DNA_DESCRIPTIONS[top2[0]].high);
  }
  if (lowest && lowest[1] < 30) {
    descriptions.push(DNA_DESCRIPTIONS[lowest[0]].low);
  }

  return descriptions;
}
