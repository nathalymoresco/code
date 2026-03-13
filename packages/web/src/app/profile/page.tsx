import { redirect } from 'next/navigation';
import { createClient } from '@/lib/supabase/server';
import { getExistingDNA } from '@/app/quiz/actions';
import type { DNADimension } from '@travelmatch/shared';
import { DNA_DIMENSION_LABELS } from '@travelmatch/shared';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { LogoutButton } from '@/components/atoms/logout-button';
import Link from 'next/link';

export default async function ProfilePage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) redirect('/login');

  const { data: profile } = await supabase
    .from('profiles')
    .select('full_name')
    .eq('user_id', user.id)
    .single();

  const dna = await getExistingDNA();

  const initials = (profile?.full_name ?? user.email ?? '?')
    .split(' ')
    .map((w: string) => w[0])
    .join('')
    .toUpperCase()
    .slice(0, 2);

  return (
    <main className="flex min-h-screen flex-col items-center bg-sand-50 px-4 py-8">
      <div className="w-full max-w-lg space-y-6">
        {/* Profile Card */}
        <Card className="p-6">
          <div className="flex items-center gap-4">
            <div className="flex h-14 w-14 items-center justify-center rounded-full bg-turquoise-100 text-lg font-bold text-turquoise-700">
              {initials}
            </div>
            <div>
              <h1 className="text-lg font-bold text-sand-900">
                {profile?.full_name ?? 'Viajante'}
              </h1>
              <p className="text-sm text-sand-500">{user.email}</p>
            </div>
          </div>
        </Card>

        {/* DNA Summary */}
        {dna ? (
          <Card className="p-6">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <span className="text-4xl">{dna.label_emoji}</span>
                <div>
                  <h2 className="font-bold text-turquoise-600">{dna.label}</h2>
                  <p className="text-xs text-sand-400">
                    DNA {dna.completeness_percentage}% completo
                  </p>
                </div>
              </div>
              <Link href="/profile/dna">
                <Button variant="outline" size="sm">
                  Ver DNA completo
                </Button>
              </Link>
            </div>

            {/* Mini dimension bars */}
            <div className="mt-4 space-y-1.5">
              {(Object.entries(dna.dimensions as Record<DNADimension, number>) as [DNADimension, number][])
                .sort((a, b) => b[1] - a[1])
                .slice(0, 3)
                .map(([dim, score]) => (
                  <div key={dim} className="flex items-center gap-2">
                    <span className="w-24 text-xs text-sand-600">
                      {DNA_DIMENSION_LABELS[dim]}
                    </span>
                    <div className="h-1.5 flex-1 overflow-hidden rounded-full bg-sand-200">
                      <div
                        className="h-full rounded-full bg-turquoise-400"
                        style={{ width: `${score}%` }}
                      />
                    </div>
                    <span className="w-8 text-right text-xs text-sand-400">{score}%</span>
                  </div>
                ))}
            </div>
          </Card>
        ) : (
          <Card className="p-6 text-center">
            <span className="text-4xl">🧬</span>
            <h2 className="mt-2 font-bold text-sand-700">Descubra seu DNA de Viagem</h2>
            <p className="mt-1 text-sm text-sand-500">
              Responda o quiz e descubra seu perfil de viajante.
            </p>
            <Link href="/quiz" className="mt-4 block">
              <Button className="w-full bg-turquoise-600 hover:bg-turquoise-700">
                Fazer o quiz
              </Button>
            </Link>
          </Card>
        )}

        {/* Actions */}
        <div className="space-y-3">
          {dna && (
            <Link href="/quiz" className="block">
              <Button variant="outline" className="w-full">
                Refazer quiz
              </Button>
            </Link>
          )}
          <LogoutButton />
        </div>
      </div>
    </main>
  );
}
