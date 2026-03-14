import { redirect } from 'next/navigation';
import { createClient } from '@/lib/supabase/server';
import { ReviewForm } from './review-form';

export const metadata = {
  title: 'Avaliar Viagem — TravelMatch',
};

export default async function ReviewPage({
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
    .select('id, profile_id, status, destination:destinations(name)')
    .eq('id', id)
    .single();

  if (!pkg || pkg.profile_id !== user.id) redirect('/packages');

  const { data: items } = await supabase
    .from('package_items')
    .select('id, title, type, partner_id, partner:partners(name)')
    .eq('package_id', id)
    .order('day_number')
    .order('sort_order');

  const dest = Array.isArray(pkg.destination) ? pkg.destination[0] : pkg.destination;

  return (
    <main className="mx-auto max-w-xl px-4 py-8">
      <ReviewForm
        packageId={id}
        destinationName={dest?.name ?? 'Destino'}
        items={(items ?? []).map((i) => ({
          id: i.id,
          title: i.title,
          type: i.type,
          partnerName: Array.isArray(i.partner) ? i.partner[0]?.name ?? null : (i.partner as { name: string } | null)?.name ?? null,
        }))}
      />
    </main>
  );
}
