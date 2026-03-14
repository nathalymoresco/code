import { redirect } from 'next/navigation';
import { createClient } from '@/lib/supabase/server';
import { LiveItinerary } from './live-itinerary';

export const metadata = {
  title: 'Itinerário Ativo — TravelMatch',
};

export default async function LivePage({
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
    .select('id, profile_id, status, start_date, end_date, num_travelers, destination:destinations(name)')
    .eq('id', id)
    .single();

  if (!pkg || pkg.profile_id !== user.id) redirect('/packages');

  const { data: items } = await supabase
    .from('package_items')
    .select('*, partner:partners(name, phone, address)')
    .eq('package_id', id)
    .order('day_number')
    .order('sort_order');

  const dest = Array.isArray(pkg.destination) ? pkg.destination[0] : pkg.destination;

  return (
    <main className="mx-auto max-w-xl px-4 py-4">
      <LiveItinerary
        packageId={id}
        destinationName={dest?.name ?? 'Destino'}
        startDate={pkg.start_date}
        endDate={pkg.end_date}
        items={items ?? []}
      />
    </main>
  );
}
