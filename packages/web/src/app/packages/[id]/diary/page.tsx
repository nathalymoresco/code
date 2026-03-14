import { redirect } from 'next/navigation';
import { createClient } from '@/lib/supabase/server';
import { DiaryView } from './diary-view';

export const metadata = {
  title: 'Diário de Viagem — TravelMatch',
};

export default async function DiaryPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) redirect('/login');

  const { data: pkg } = await supabase
    .from('packages')
    .select('id, profile_id, start_date, end_date, num_travelers, total_price, destination:destinations(name, state, cover_url)')
    .eq('id', id)
    .single();

  if (!pkg || pkg.profile_id !== user.id) redirect('/packages');

  const { data: items } = await supabase
    .from('package_items')
    .select('id, title, type, day_number, description')
    .eq('package_id', id)
    .order('day_number')
    .order('sort_order');

  const dest = Array.isArray(pkg.destination) ? pkg.destination[0] : pkg.destination;

  return (
    <main className="mx-auto max-w-xl px-4 py-8">
      <DiaryView
        packageId={id}
        destinationName={dest?.name ?? 'Destino'}
        destinationState={dest?.state ?? ''}
        coverUrl={dest?.cover_url ?? null}
        startDate={pkg.start_date}
        endDate={pkg.end_date}
        numTravelers={pkg.num_travelers}
        items={items ?? []}
      />
    </main>
  );
}
