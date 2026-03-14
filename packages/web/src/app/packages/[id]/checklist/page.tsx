import { redirect } from 'next/navigation';
import { createClient } from '@/lib/supabase/server';
import { ChecklistView } from './checklist-view';

export const metadata = {
  title: 'Checklist Pré-Viagem — TravelMatch',
};

export default async function ChecklistPage({
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
    .select('id, profile_id, start_date, destination:destinations(id, name, state)')
    .eq('id', id)
    .single();

  if (!pkg || pkg.profile_id !== user.id) redirect('/packages');

  const dest = Array.isArray(pkg.destination) ? pkg.destination[0] : pkg.destination;

  // Fetch checklist items
  const { data: checklistItems } = await supabase
    .from('package_checklist_items')
    .select('*')
    .eq('package_id', id)
    .order('sort_order');

  // If no checklist items yet, populate from system defaults + destination requirements
  let items = checklistItems ?? [];
  if (items.length === 0 && dest?.id) {
    // Fetch destination requirements
    const { data: requirements } = await supabase
      .from('destination_requirements')
      .select('*')
      .eq('destination_id', dest.id)
      .order('sort_order');

    // System defaults
    const systemItems = [
      { title: 'Documento de identidade (RG/CPF)', description: 'Leve documento original com foto', type: 'obrigatorio' as const, source: 'system' as const, sort_order: 1 },
      { title: 'Seguro viagem', description: 'Incluso no seu pacote ✅', type: 'automatico' as const, source: 'system' as const, sort_order: 2 },
      { title: 'Confirmar reservas', description: 'Verifique datas de hospedagem e passeios', type: 'obrigatorio' as const, source: 'system' as const, sort_order: 3 },
      { title: 'Malas adequadas ao clima', description: 'Confira a previsão do tempo no destino', type: 'recomendado' as const, source: 'system' as const, sort_order: 4 },
      { title: 'Carregador e adaptador', description: 'Leve carregador portátil para passeios', type: 'recomendado' as const, source: 'system' as const, sort_order: 5 },
      { title: 'Medicamentos pessoais', description: 'Leve receitas médicas se necessário', type: 'recomendado' as const, source: 'system' as const, sort_order: 6 },
    ];

    // Destination-specific items
    const destItems = (requirements ?? []).map((r, i) => ({
      title: r.title,
      description: r.description,
      type: r.is_required ? 'obrigatorio' as const : 'recomendado' as const,
      source: 'destination' as const,
      sort_order: 10 + i,
    }));

    const allItems = [...systemItems, ...destItems].map((item) => ({
      ...item,
      package_id: id,
      is_completed: item.title === 'Seguro viagem', // Auto-check insurance
    }));

    if (allItems.length > 0) {
      const { data: inserted } = await supabase
        .from('package_checklist_items')
        .insert(allItems)
        .select();
      items = inserted ?? [];
    }
  }

  const nowMs = new Date().getTime();
  const daysUntilTrip = Math.ceil(
    (new Date(pkg.start_date).getTime() - nowMs) / 86400000,
  );

  return (
    <main className="mx-auto max-w-xl px-4 py-8">
      <ChecklistView
        packageId={id}
        destinationName={dest?.name ?? 'Destino'}
        items={items}
        daysUntilTrip={daysUntilTrip}
      />
    </main>
  );
}
