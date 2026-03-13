import { createClient } from '@/lib/supabase/server';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Users, Dna, MapPin, Handshake } from 'lucide-react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';

interface MetricCardProps {
  title: string;
  value: number;
  icon: React.ReactNode;
  emptyLabel?: string;
  emptyHref?: string;
}

function MetricCard({ title, value, icon, emptyLabel, emptyHref }: MetricCardProps) {
  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="text-sm text-sand-500">{title}</CardTitle>
          <span className="text-sand-400">{icon}</span>
        </div>
      </CardHeader>
      <CardContent>
        {value > 0 ? (
          <p className="text-3xl font-bold text-sand-800" data-testid={`metric-${title.toLowerCase().replace(/\s/g, '-')}`}>
            {value}
          </p>
        ) : (
          <div className="space-y-2">
            <p className="text-2xl font-bold text-sand-300">0</p>
            {emptyLabel && emptyHref && (
              <Link href={emptyHref}>
                <Button size="sm" variant="outline" className="text-xs">
                  {emptyLabel}
                </Button>
              </Link>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );
}

export default async function DashboardPage() {
  const supabase = await createClient();

  const [
    { count: usersCount },
    { count: dnasCount },
    { count: destinationsCount },
    { count: partnersCount },
  ] = await Promise.all([
    supabase.from('profiles').select('*', { count: 'exact', head: true }),
    supabase.from('dna_profiles').select('*', { count: 'exact', head: true }),
    supabase.from('destinations').select('*', { count: 'exact', head: true }).eq('is_active', true),
    supabase.from('partners').select('*', { count: 'exact', head: true }),
  ]);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-sand-800">Dashboard</h1>
        <p className="text-sm text-sand-500">Visão geral do TravelMatch</p>
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <MetricCard
          title="Usuários"
          value={usersCount ?? 0}
          icon={<Users className="size-5" />}
        />
        <MetricCard
          title="DNAs Criados"
          value={dnasCount ?? 0}
          icon={<Dna className="size-5" />}
        />
        <MetricCard
          title="Destinos Ativos"
          value={destinationsCount ?? 0}
          icon={<MapPin className="size-5" />}
          emptyLabel="Adicionar destino"
          emptyHref="/destinations"
        />
        <MetricCard
          title="Parceiros"
          value={partnersCount ?? 0}
          icon={<Handshake className="size-5" />}
          emptyLabel="Adicionar parceiro"
          emptyHref="/partners"
        />
      </div>
    </div>
  );
}
