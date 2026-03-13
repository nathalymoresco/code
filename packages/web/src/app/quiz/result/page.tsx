import { redirect } from 'next/navigation';
import { createClient } from '@/lib/supabase/server';
import { getExistingDNA } from '../actions';
import { DNA_DIMENSION_LABELS } from '@travelmatch/shared';
import type { DNADimension } from '@travelmatch/shared';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import Link from 'next/link';

export default async function QuizResultPage({
  searchParams,
}: {
  searchParams: Promise<{ phase?: string }>;
}) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) redirect('/login');

  const dna = await getExistingDNA();
  if (!dna) redirect('/quiz');

  const params = await searchParams;
  const isPartial = params.phase === '1';
  const dimensions = dna.dimensions as Record<DNADimension, number>;

  // Sort dimensions by score for display
  const sorted = Object.entries(dimensions)
    .map(([dim, score]) => ({
      dimension: dim as DNADimension,
      label: DNA_DIMENSION_LABELS[dim as DNADimension],
      score: score as number,
    }))
    .sort((a, b) => b.score - a.score);

  const topDimension = sorted[0]!;

  return (
    <main className="flex min-h-screen flex-col items-center bg-sand-50 px-4 py-8">
      <Card className="w-full max-w-lg space-y-6 p-8">
        <div className="text-center">
          <span className="text-5xl">{dna.label_emoji}</span>
          <h1 className="mt-3 text-2xl font-bold text-turquoise-600">{dna.label}</h1>
          {isPartial && (
            <p className="mt-1 text-sm text-sand-500">Resultado parcial — {dna.completeness_percentage}%</p>
          )}
        </div>

        <p className="text-center text-sand-600">
          Parece que você gosta de <strong>{topDimension.label.toLowerCase()}</strong>!
          {sorted[1] && (
            <>
              {' '}
              Também tem um lado forte de{' '}
              <strong>{sorted[1].label.toLowerCase()}</strong>.
            </>
          )}
        </p>

        {/* Score bars */}
        <div className="space-y-3">
          {sorted.map(({ dimension, label, score }) => (
            <div key={dimension} className="space-y-1">
              <div className="flex justify-between text-sm">
                <span className="text-sand-700">{label}</span>
                <span className="text-sand-500">{score}%</span>
              </div>
              <div className="h-2 overflow-hidden rounded-full bg-sand-200">
                <div
                  className="h-full rounded-full bg-turquoise-500 transition-all duration-500"
                  style={{ width: `${score}%` }}
                />
              </div>
            </div>
          ))}
        </div>

        {/* Progress */}
        <div className="space-y-1">
          <div className="flex justify-between text-xs text-sand-400">
            <span>Completude do DNA</span>
            <span>{dna.completeness_percentage}%</span>
          </div>
          <div className="h-1.5 overflow-hidden rounded-full bg-sand-200">
            <div
              className="h-full rounded-full bg-coral-500"
              style={{ width: `${dna.completeness_percentage}%` }}
            />
          </div>
        </div>

        {/* CTAs */}
        <div className="space-y-3">
          {isPartial ? (
            <>
              <Link href="/quiz?phase=2" className="block">
                <Button className="w-full bg-turquoise-600 hover:bg-turquoise-700" size="lg">
                  Completar meu DNA
                </Button>
              </Link>
              <Link href="/" className="block text-center text-sm text-sand-500 hover:text-sand-700">
                Ver meus destinos assim mesmo
              </Link>
            </>
          ) : (
            <>
              <Link href="/" className="block">
                <Button className="w-full bg-turquoise-600 hover:bg-turquoise-700" size="lg">
                  Ver meus destinos
                </Button>
              </Link>
              <Link href="/quiz" className="block text-center text-sm text-sand-500 hover:text-sand-700">
                Refazer quiz
              </Link>
            </>
          )}
        </div>
      </Card>
    </main>
  );
}
