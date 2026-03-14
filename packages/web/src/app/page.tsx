import { redirect } from 'next/navigation';
import { createClient } from '@/lib/supabase/server';

export default async function HomePage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    return (
      <main className="flex min-h-screen flex-col items-center justify-center p-8 bg-sand-50">
        <div className="text-center max-w-lg">
          <h1 className="mb-4 text-4xl font-bold tracking-tight text-turquoise-600">
            TravelMatch BR
          </h1>
          <p className="mb-8 text-lg text-sand-600">
            Descubra seu DNA de Viagem e encontre destinos perfeitos para seu perfil.
          </p>
          <a
            href="/login"
            className="inline-flex items-center rounded-lg bg-turquoise-600 px-6 py-3 text-white font-medium hover:bg-turquoise-700 transition"
          >
            Começar agora
          </a>
        </div>
      </main>
    );
  }

  // Check if user has completed onboarding
  const { data: profile } = await supabase
    .from('profiles')
    .select('full_name, lgpd_consent')
    .eq('user_id', user.id)
    .single();

  if (!profile?.full_name || !profile?.lgpd_consent) {
    redirect('/onboarding');
  }

  // Check if user has DNA profile
  const { data: dna } = await supabase
    .from('dna_profiles')
    .select('id')
    .eq('profile_id', (await supabase.from('profiles').select('id').eq('user_id', user.id).single()).data?.id ?? '')
    .single();

  if (!dna) {
    redirect('/quiz');
  }

  // User has everything — go to destinations feed
  redirect('/destinations');
}
