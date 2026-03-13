import { createClient } from '@/lib/supabase/server';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { MapPin, Plus, Search } from 'lucide-react';
import Link from 'next/link';
import { DestinationActions } from './destination-actions';

export default async function DestinationsPage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string; region?: string }>;
}) {
  const params = await searchParams;
  const supabase = await createClient();

  let query = supabase
    .from('destinations')
    .select('id, name, slug, state, city, region, cover_url, is_active, tags, avg_daily_cost')
    .order('name');

  if (params.q) {
    query = query.ilike('name', `%${params.q}%`);
  }
  if (params.region) {
    query = query.eq('region', params.region);
  }

  const { data: destinations } = await query;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-sand-800">Destinos</h1>
          <p className="text-sm text-sand-500">{destinations?.length ?? 0} destinos cadastrados</p>
        </div>
        <Link href="/destinations/new">
          <Button className="gap-2 bg-turquoise-600 hover:bg-turquoise-700">
            <Plus className="size-4" />
            Novo Destino
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
              placeholder="Buscar destinos..."
              className="h-9 w-full rounded-md border border-sand-200 bg-white pl-9 pr-3 text-sm outline-none focus:border-turquoise-500"
            />
          </div>
          <select
            name="region"
            defaultValue={params.region}
            className="h-9 rounded-md border border-sand-200 bg-white px-3 text-sm text-sand-700 outline-none focus:border-turquoise-500"
          >
            <option value="">Todas as regiões</option>
            <option value="norte">Norte</option>
            <option value="nordeste">Nordeste</option>
            <option value="centro-oeste">Centro-Oeste</option>
            <option value="sudeste">Sudeste</option>
            <option value="sul">Sul</option>
          </select>
          <Button type="submit" variant="outline" size="sm">
            Filtrar
          </Button>
        </form>
      </Card>

      {/* List */}
      {!destinations || destinations.length === 0 ? (
        <Card className="p-12 text-center">
          <MapPin className="mx-auto mb-4 size-12 text-sand-300" />
          <p className="text-lg font-medium text-sand-600">Nenhum destino cadastrado</p>
          <p className="mt-1 text-sm text-sand-400">Comece adicionando o primeiro destino curado.</p>
          <Link href="/destinations/new" className="mt-4 inline-block">
            <Button className="bg-turquoise-600 hover:bg-turquoise-700">
              Adicionar primeiro destino
            </Button>
          </Link>
        </Card>
      ) : (
        <div className="grid gap-4">
          {destinations.map((dest) => (
            <Card key={dest.id} className="flex flex-row items-center gap-4 p-4">
              <div className="flex size-12 shrink-0 items-center justify-center rounded-lg bg-sand-100">
                {dest.cover_url ? (
                  <img
                    src={dest.cover_url}
                    alt={dest.name}
                    className="size-12 rounded-lg object-cover"
                  />
                ) : (
                  <MapPin className="size-6 text-sand-400" />
                )}
              </div>

              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                  <h3 className="font-semibold text-sand-800 truncate">{dest.name}</h3>
                  <span
                    className={`rounded-full px-2 py-0.5 text-[10px] font-medium ${
                      dest.is_active
                        ? 'bg-emerald-100 text-emerald-700'
                        : 'bg-sand-100 text-sand-500'
                    }`}
                  >
                    {dest.is_active ? 'Ativo' : 'Inativo'}
                  </span>
                </div>
                <p className="text-sm text-sand-500">
                  {dest.city}, {dest.state} · {dest.region}
                  {dest.avg_daily_cost ? ` · R$ ${dest.avg_daily_cost}/dia` : ''}
                </p>
                {dest.tags.length > 0 && (
                  <div className="mt-1 flex gap-1">
                    {dest.tags.slice(0, 4).map((tag: string) => (
                      <span
                        key={tag}
                        className="rounded bg-turquoise-50 px-1.5 py-0.5 text-[10px] text-turquoise-700"
                      >
                        {tag}
                      </span>
                    ))}
                  </div>
                )}
              </div>

              <DestinationActions id={dest.id} isActive={dest.is_active} />
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
