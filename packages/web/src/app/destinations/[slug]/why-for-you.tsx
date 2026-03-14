import type { DNADimension } from '@travelmatch/shared';

interface WhyForYouProps {
  dimensions: { dimension: DNADimension; label: string; score: number }[];
  destinationName: string;
}

const DIMENSION_DESCRIPTIONS: Record<string, string> = {
  ritmo: 'combina com seu ritmo de viagem',
  natureza: 'oferece experiências ricas em natureza',
  urbano: 'tem infraestrutura urbana que você valoriza',
  praia: 'tem praias incríveis esperando por você',
  cultura: 'é repleto de cultura e história',
  gastronomia: 'vai encantar seu paladar com sabores locais',
  sociabilidade: 'é perfeito para socializar e conhecer pessoas',
  fitness: 'oferece atividades para manter seu corpo ativo',
  aventura: 'tem aventuras que vão acelerar seu coração',
  relax: 'é ideal para relaxar e recarregar energias',
};

export function WhyForYou({ dimensions, destinationName }: WhyForYouProps) {
  return (
    <section data-testid="why-for-you">
      <h2 className="text-xl font-bold text-sand-800">Por que {destinationName} é para você</h2>
      <ul className="mt-3 space-y-3">
        {dimensions.map((d) => (
          <li key={d.dimension} className="flex items-start gap-3">
            <div className="mt-0.5 flex size-8 shrink-0 items-center justify-center rounded-full bg-turquoise-100">
              <span className="text-sm font-bold text-turquoise-700">{d.score}</span>
            </div>
            <div>
              <p className="font-medium text-sand-800">{d.label}</p>
              <p className="text-sm text-sand-500">
                {destinationName} {DIMENSION_DESCRIPTIONS[d.dimension] ?? 'combina com seu perfil'}
              </p>
            </div>
          </li>
        ))}
      </ul>
    </section>
  );
}
