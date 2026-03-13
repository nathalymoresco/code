import { redirect } from 'next/navigation';
import { createClient } from '@/lib/supabase/server';
import { getExistingDNA } from '@/app/quiz/actions';
import type { DNADimension } from '@travelmatch/shared';
import { DNARadarChart } from '@/components/dna/dna-radar-chart';
import { DNAProfileCard } from '@/components/dna/dna-profile-card';
import { DnaShareSheet } from '@/components/dna/dna-share-sheet';
import { Card } from '@/components/ui/card';

export default async function DNAResultPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) redirect('/login');

  const dna = await getExistingDNA();
  if (!dna) redirect('/quiz');

  const dimensions = dna.dimensions as Record<DNADimension, number>;

  return (
    <main className="flex min-h-screen flex-col items-center bg-sand-50 px-4 py-8">
      <div className="w-full max-w-lg space-y-6">
        {/* DNA Profile Card */}
        <div className="animate-fade-in-up">
          <DNAProfileCard
            label={dna.label}
            labelEmoji={dna.label_emoji}
            dimensions={dimensions}
            completenessPercentage={dna.completeness_percentage}
          />
        </div>

        {/* Radar Chart */}
        <div className="animate-fade-in-up" style={{ animationDelay: '200ms', opacity: 0 }}>
          <Card className="p-4">
            <h3 className="mb-2 text-center text-sm font-semibold text-sand-700">
              Seu DNA de Viagem
            </h3>
            <DNARadarChart dimensions={dimensions} />
          </Card>
        </div>

        {/* Share Button */}
        <div className="animate-fade-in-up" style={{ animationDelay: '300ms', opacity: 0 }}>
          <DnaShareSheet
            userId={user.id}
            dnaLabel={dna.label}
            dnaEmoji={dna.label_emoji}
          />
        </div>

        {/* Destination Teaser */}
        <div className="animate-fade-in-up" style={{ animationDelay: '400ms', opacity: 0 }}>
          <h3 className="mb-3 text-center text-sm font-semibold text-sand-700">
            Destinos compatíveis com você
          </h3>
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
            {TEASER_DESTINATIONS.map((dest) => (
              <Card key={dest.name} className="relative overflow-hidden p-4 text-center">
                <span className="text-3xl">{dest.emoji}</span>
                <p className="mt-1 text-sm font-medium text-sand-800">{dest.name}</p>
                <p className="text-xs text-turquoise-600">{dest.score}% match</p>
                <span className="absolute right-2 top-2 rounded-full bg-sand-100 px-2 py-0.5 text-[10px] text-sand-400">
                  Em breve
                </span>
              </Card>
            ))}
          </div>
        </div>
      </div>
    </main>
  );
}

const TEASER_DESTINATIONS = [
  { name: 'Chapada Diamantina', emoji: '🏔️', score: 94 },
  { name: 'Fernando de Noronha', emoji: '🏝️', score: 89 },
  { name: 'Gramado', emoji: '🍷', score: 85 },
];
