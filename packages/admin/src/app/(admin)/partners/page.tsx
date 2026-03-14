import { createClient } from '@/lib/supabase/server';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Users, Plus, Search } from 'lucide-react';
import Link from 'next/link';
import { PartnerActions } from './partner-actions';

const TYPE_LABELS: Record<string, string> = {
  hotel: 'Hotel',
  pousada: 'Pousada',
  airbnb: 'Airbnb',
  guia: 'Guia',
  restaurante: 'Restaurante',
  transfer: 'Transfer',
  experiencia: 'Experiência',
};

const STATUS_STYLES: Record<string, { bg: string; text: string; label: string }> = {
  pending: { bg: 'bg-amber-100', text: 'text-amber-700', label: 'Pendente' },
  active: { bg: 'bg-emerald-100', text: 'text-emerald-700', label: 'Ativo' },
  inactive: { bg: 'bg-sand-100', text: 'text-sand-500', label: 'Inativo' },
  suspended: { bg: 'bg-red-100', text: 'text-red-700', label: 'Suspenso' },
};

export default async function PartnersPage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string; type?: string; destination?: string }>;
}) {
  const params = await searchParams;
  const supabase = await createClient();

  // Fetch destinations for filter
  const { data: destinations } = await supabase
    .from('destinations')
    .select('id, name')
    .order('name');

  let query = supabase
    .from('partners')
    .select('id, name, type, destination_id, is_curated, contract_status, price_range, rating, review_count, cover_url, destinations(name)')
    .order('name');

  if (params.q) {
    query = query.ilike('name', `%${params.q}%`);
  }
  if (params.type) {
    query = query.eq('type', params.type);
  }
  if (params.destination) {
    query = query.eq('destination_id', params.destination);
  }

  const { data: partners } = await query;

  const totalCurated = partners?.filter((p) => p.is_curated).length ?? 0;
  const totalPending = partners?.filter((p) => p.contract_status === 'pending').length ?? 0;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-sand-800">Parceiros</h1>
          <p className="text-sm text-sand-500">
            {partners?.length ?? 0} parceiros ({totalCurated} curados, {totalPending} pendentes)
          </p>
        </div>
        <Link href="/partners/new">
          <Button className="gap-2 bg-turquoise-600 hover:bg-turquoise-700">
            <Plus className="size-4" />
            Novo Parceiro
          </Button>
        </Link>
      </div>

      {/* Filters */}
      <Card className="p-4">
        <form className="flex flex-wrap gap-3">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-sand-400" />
            <input
              name="q"
              defaultValue={params.q}
              placeholder="Buscar parceiros..."
              className="h-9 w-full rounded-md border border-sand-200 bg-white pl-9 pr-3 text-sm outline-none focus:border-turquoise-500"
            />
          </div>
          <select
            name="type"
            defaultValue={params.type}
            className="h-9 rounded-md border border-sand-200 bg-white px-3 text-sm text-sand-700 outline-none"
          >
            <option value="">Todos os tipos</option>
            {Object.entries(TYPE_LABELS).map(([value, label]) => (
              <option key={value} value={value}>{label}</option>
            ))}
          </select>
          <select
            name="destination"
            defaultValue={params.destination}
            className="h-9 rounded-md border border-sand-200 bg-white px-3 text-sm text-sand-700 outline-none"
          >
            <option value="">Todos os destinos</option>
            {destinations?.map((d) => (
              <option key={d.id} value={d.id}>{d.name}</option>
            ))}
          </select>
          <Button type="submit" variant="outline" size="sm">Filtrar</Button>
        </form>
      </Card>

      {/* List */}
      {!partners || partners.length === 0 ? (
        <Card className="p-12 text-center">
          <Users className="mx-auto mb-4 size-12 text-sand-300" />
          <p className="text-lg font-medium text-sand-600">Nenhum parceiro cadastrado</p>
          <p className="mt-1 text-sm text-sand-400">Adicione parceiros para compor pacotes de viagem.</p>
          <Link href="/partners/new" className="mt-4 inline-block">
            <Button className="bg-turquoise-600 hover:bg-turquoise-700">Adicionar primeiro parceiro</Button>
          </Link>
        </Card>
      ) : (
        <div className="grid gap-4">
          {partners.map((partner) => {
            const status = STATUS_STYLES[partner.contract_status] ?? { bg: 'bg-amber-100', text: 'text-amber-700', label: 'Pendente' };
            const dest = partner.destinations as unknown as { name: string } | null;
            return (
              <Card key={partner.id} className="flex flex-row items-center gap-4 p-4">
                <div className="flex size-12 shrink-0 items-center justify-center rounded-lg bg-sand-100">
                  {partner.cover_url ? (
                    <img src={partner.cover_url} alt={partner.name} className="size-12 rounded-lg object-cover" />
                  ) : (
                    <Users className="size-6 text-sand-400" />
                  )}
                </div>

                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <h3 className="font-semibold text-sand-800 truncate">{partner.name}</h3>
                    <span className={`rounded-full px-2 py-0.5 text-[10px] font-medium ${status.bg} ${status.text}`}>
                      {status.label}
                    </span>
                    {partner.is_curated && (
                      <span className="rounded-full bg-turquoise-100 px-2 py-0.5 text-[10px] font-medium text-turquoise-700">
                        Curado
                      </span>
                    )}
                  </div>
                  <p className="text-sm text-sand-500">
                    {TYPE_LABELS[partner.type] ?? partner.type}
                    {dest ? ` · ${dest.name}` : ''}
                    {partner.price_range ? ` · ${partner.price_range}` : ''}
                    {partner.rating > 0 ? ` · ★ ${partner.rating.toFixed(1)}` : ''}
                  </p>
                </div>

                <PartnerActions
                  id={partner.id}
                  isCurated={partner.is_curated}
                  status={partner.contract_status}
                />
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
}
