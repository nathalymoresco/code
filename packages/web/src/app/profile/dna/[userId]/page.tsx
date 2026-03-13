import { createClient } from '@/lib/supabase/server';
import type { DNADimension } from '@travelmatch/shared';
import { DNARadarChart } from '@/components/dna/dna-radar-chart';
import { DNAProfileCard } from '@/components/dna/dna-profile-card';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import Link from 'next/link';

export default async function PublicDNAPage({
  params,
}: {
  params: Promise<{ userId: string }>;
}) {
  const { userId } = await params;
  const supabase = await createClient();

  // Fetch profile by user_id
  const { data: profile } = await supabase
    .from('profiles')
    .select('id')
    .eq('user_id', userId)
    .single();

  if (!profile) {
    return (
      <main className="flex min-h-screen flex-col items-center justify-center bg-sand-50 px-4">
        <Card className="max-w-sm space-y-4 p-8 text-center">
          <span className="text-5xl">🔍</span>
          <h1 className="text-xl font-bold text-sand-800">DNA não encontrado</h1>
          <p className="text-sm text-sand-500">
            Esse viajante ainda não descobriu seu DNA de Viagem.
          </p>
          <Link href="/login">
            <Button className="w-full bg-turquoise-600 hover:bg-turquoise-700">
              Descubra seu DNA de Viagem!
            </Button>
          </Link>
        </Card>
      </main>
    );
  }

  const { data: dna } = await supabase
    .from('dna_profiles')
    .select('label, label_emoji, dimensions, completeness_percentage')
    .eq('profile_id', profile.id)
    .single();

  if (!dna) {
    return (
      <main className="flex min-h-screen flex-col items-center justify-center bg-sand-50 px-4">
        <Card className="max-w-sm space-y-4 p-8 text-center">
          <span className="text-5xl">🧬</span>
          <h1 className="text-xl font-bold text-sand-800">DNA ainda não criado</h1>
          <p className="text-sm text-sand-500">
            Esse viajante ainda não completou o quiz.
          </p>
          <Link href="/login">
            <Button className="w-full bg-turquoise-600 hover:bg-turquoise-700">
              Descubra seu DNA de Viagem!
            </Button>
          </Link>
        </Card>
      </main>
    );
  }

  const dimensions = dna.dimensions as Record<DNADimension, number>;

  return (
    <main className="flex min-h-screen flex-col items-center bg-sand-50 px-4 py-8">
      <div className="w-full max-w-lg space-y-6">
        <DNAProfileCard
          label={dna.label}
          labelEmoji={dna.label_emoji}
          dimensions={dimensions}
          completenessPercentage={dna.completeness_percentage}
        />

        <Card className="p-4">
          <h3 className="mb-2 text-center text-sm font-semibold text-sand-700">
            DNA de Viagem
          </h3>
          <DNARadarChart dimensions={dimensions} />
        </Card>

        <div className="text-center">
          <Link href="/login">
            <Button className="bg-turquoise-600 hover:bg-turquoise-700" size="lg">
              Descubra seu DNA de Viagem!
            </Button>
          </Link>
        </div>
      </div>
    </main>
  );
}
