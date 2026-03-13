import { createClient } from '@/lib/supabase/server';
import { notFound } from 'next/navigation';
import { DestinationForm } from '../../destination-form';
import type { Destination, DestinationScore } from '@travelmatch/shared';

export default async function EditDestinationPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const supabase = await createClient();

  const { data: destination } = await supabase
    .from('destinations')
    .select('*')
    .eq('id', id)
    .single();

  if (!destination) notFound();

  const { data: scores } = await supabase
    .from('destination_scores')
    .select('id, destination_id, dimension, score')
    .eq('destination_id', id);

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-sand-800">Editar: {destination.name}</h1>
      <DestinationForm
        destination={destination as Destination}
        scores={(scores ?? []) as DestinationScore[]}
      />
    </div>
  );
}
