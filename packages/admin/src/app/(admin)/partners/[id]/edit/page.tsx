import { createClient } from '@/lib/supabase/server';
import { notFound } from 'next/navigation';
import { PartnerForm } from '../../partner-form';
import type { Partner } from '@travelmatch/shared';

export default async function EditPartnerPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const supabase = await createClient();

  const { data: partner } = await supabase
    .from('partners')
    .select('*')
    .eq('id', id)
    .single();

  if (!partner) notFound();

  const { data: destinations } = await supabase
    .from('destinations')
    .select('id, name')
    .order('name');

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-sand-800">Editar: {partner.name}</h1>
      <PartnerForm partner={partner as Partner} destinations={destinations ?? []} />
    </div>
  );
}
