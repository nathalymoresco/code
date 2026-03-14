import { createClient } from '@/lib/supabase/server';
import { PartnerForm } from '../partner-form';

export default async function NewPartnerPage() {
  const supabase = await createClient();
  const { data: destinations } = await supabase
    .from('destinations')
    .select('id, name')
    .order('name');

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-sand-800">Novo Parceiro</h1>
      <PartnerForm destinations={destinations ?? []} />
    </div>
  );
}
