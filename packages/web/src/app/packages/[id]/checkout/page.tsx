import { redirect } from 'next/navigation';
import { createClient } from '@/lib/supabase/server';
import { CheckoutForm } from './checkout-form';

export const metadata = {
  title: 'Checkout — TravelMatch',
};

export default async function CheckoutPage({
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
    .select('id, profile_id, total_price, status, start_date, end_date, num_travelers, destination:destinations(name)')
    .eq('id', id)
    .single();

  if (!pkg || pkg.profile_id !== user.id) redirect('/packages');
  if (pkg.status !== 'draft' && pkg.status !== 'ready') redirect(`/packages/${id}`);

  // Check for existing pending payment
  const { data: existingPayment } = await supabase
    .from('package_payments')
    .select('id, status, method, pix_qr_code, pix_copy_paste, pix_expiration, asaas_invoice_url')
    .eq('package_id', id)
    .in('status', ['pending'])
    .limit(1)
    .single();

  const destinationName = Array.isArray(pkg.destination)
    ? pkg.destination[0]?.name ?? 'Destino'
    : (pkg.destination as { name: string } | null)?.name ?? 'Destino';

  return (
    <main className="mx-auto max-w-xl px-4 py-8">
      <h1 className="text-2xl font-bold text-sand-800">Finalizar Pacote</h1>
      <p className="mt-1 text-sm text-sand-500">
        {destinationName} · {pkg.num_travelers} viajante{pkg.num_travelers > 1 ? 's' : ''}
      </p>
      <CheckoutForm
        packageId={id}
        totalPrice={pkg.total_price}
        userEmail={user.email ?? ''}
        existingPayment={existingPayment}
      />
    </main>
  );
}
