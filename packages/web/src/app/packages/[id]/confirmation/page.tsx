import { redirect } from 'next/navigation';
import { createClient } from '@/lib/supabase/server';
import { ConfirmationView } from './confirmation-view';

export const metadata = {
  title: 'Confirmação — TravelMatch',
};

export default async function ConfirmationPage({
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
    .select('id, profile_id, status, total_price, start_date, end_date, num_travelers, destination:destinations(name)')
    .eq('id', id)
    .single();

  if (!pkg || pkg.profile_id !== user.id) redirect('/packages');

  const { data: payment } = await supabase
    .from('package_payments')
    .select('id, status, method, amount, installments, created_at')
    .eq('package_id', id)
    .order('created_at', { ascending: false })
    .limit(1)
    .single();

  const destinationName = Array.isArray(pkg.destination)
    ? pkg.destination[0]?.name ?? 'Destino'
    : (pkg.destination as { name: string } | null)?.name ?? 'Destino';

  return (
    <main className="mx-auto max-w-xl px-4 py-8">
      <ConfirmationView
        packageId={id}
        destinationName={destinationName}
        startDate={pkg.start_date}
        endDate={pkg.end_date}
        numTravelers={pkg.num_travelers}
        totalPrice={pkg.total_price}
        packageStatus={pkg.status}
        payment={payment}
      />
    </main>
  );
}
