'use client';

import { useState } from 'react';
import Link from 'next/link';
import { ChevronRight, Calendar, Users, Plane, MapPin } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { PackageTimeline } from './package-timeline';
import { PackageSummary } from './package-summary';
import type { Package, PackageItem } from '@travelmatch/shared';

interface DestinationInfo {
  name: string;
  slug: string;
  cover_url: string | null;
  city: string;
  state: string;
}

interface ItemWithPartner extends PackageItem {
  partners: { name: string; cover_url: string | null; rating: number; review_count: number } | null;
}

interface PackageViewProps {
  pkg: Package & { destinations: DestinationInfo };
  items: ItemWithPartner[];
}

const STATUS_LABELS: Record<string, { label: string; color: string }> = {
  draft: { label: 'Rascunho', color: 'bg-amber-100 text-amber-700' },
  confirmed: { label: 'Confirmado', color: 'bg-turquoise-100 text-turquoise-700' },
  paid: { label: 'Pago', color: 'bg-emerald-100 text-emerald-700' },
  active: { label: 'Em viagem', color: 'bg-coral-100 text-coral-700' },
  completed: { label: 'Concluído', color: 'bg-sand-100 text-sand-600' },
  cancelled: { label: 'Cancelado', color: 'bg-red-100 text-red-700' },
};

export function PackageView({ pkg, items }: PackageViewProps) {
  const [view, setView] = useState<'summary' | 'timeline'>('summary');
  const dest = pkg.destinations as unknown as DestinationInfo;
  const status = STATUS_LABELS[pkg.status] ?? { label: 'Rascunho', color: 'bg-amber-100 text-amber-700' };

  const totalDays = Math.round(
    (new Date(pkg.end_date).getTime() - new Date(pkg.start_date).getTime()) / 86400000,
  );

  const formatDate = (d: string) =>
    new Date(d + 'T12:00:00').toLocaleDateString('pt-BR', { day: '2-digit', month: 'short' });

  return (
    <div className="mx-auto max-w-4xl px-4 py-6">
      {/* Breadcrumb */}
      <nav className="mb-4 flex items-center gap-1 text-sm text-sand-400" data-testid="breadcrumb">
        <Link href="/destinations" className="hover:text-turquoise-600">Destinos</Link>
        <ChevronRight className="size-3" />
        <Link href={`/destinations/${dest.slug}`} className="hover:text-turquoise-600">{dest.name}</Link>
        <ChevronRight className="size-3" />
        <span className="text-sand-700">Meu Pacote</span>
      </nav>

      {/* Hero */}
      <div className="relative mb-6 overflow-hidden rounded-2xl">
        {dest.cover_url ? (
          <img src={dest.cover_url} alt={dest.name} className="h-48 w-full object-cover sm:h-56" />
        ) : (
          <div className="flex h-48 items-center justify-center bg-sand-100 sm:h-56">
            <MapPin className="size-12 text-sand-300" />
          </div>
        )}
        <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
        <div className="absolute bottom-0 left-0 right-0 p-6">
          <div className="flex items-center gap-3">
            <h1 className="text-2xl font-bold text-white sm:text-3xl">{dest.name}</h1>
            <span className={`rounded-full px-3 py-0.5 text-xs font-medium ${status.color}`}>
              {status.label}
            </span>
          </div>
          <div className="mt-2 flex flex-wrap items-center gap-4 text-sm text-white/80">
            <span className="flex items-center gap-1">
              <Calendar className="size-3.5" />
              {formatDate(pkg.start_date)} → {formatDate(pkg.end_date)} ({totalDays} dias)
            </span>
            <span className="flex items-center gap-1">
              <Users className="size-3.5" />
              {pkg.num_travelers} viajante{pkg.num_travelers > 1 ? 's' : ''}
            </span>
            <span className="flex items-center gap-1">
              <Plane className="size-3.5" />
              {pkg.compatibility_score}% compatível
            </span>
          </div>
        </div>
      </div>

      {/* Compatibility badge */}
      {pkg.compatibility_score >= 80 && (
        <div className="mb-6 rounded-xl border border-turquoise-200 bg-turquoise-50 p-3 text-center text-sm text-turquoise-800" data-testid="compat-badge">
          Este pacote é <strong>{pkg.compatibility_score}%</strong> compatível com seu DNA de Viagem
        </div>
      )}

      {/* View toggle */}
      <div className="mb-6 flex items-center gap-2">
        <Button
          variant={view === 'summary' ? 'default' : 'outline'}
          size="sm"
          onClick={() => setView('summary')}
          className={view === 'summary' ? 'bg-turquoise-600 hover:bg-turquoise-700' : ''}
        >
          Resumo
        </Button>
        <Button
          variant={view === 'timeline' ? 'default' : 'outline'}
          size="sm"
          onClick={() => setView('timeline')}
          className={view === 'timeline' ? 'bg-turquoise-600 hover:bg-turquoise-700' : ''}
        >
          Dia a Dia
        </Button>
      </div>

      {/* Content */}
      {view === 'summary' ? (
        <PackageSummary pkg={pkg} items={items} totalDays={totalDays} />
      ) : (
        <PackageTimeline items={items} startDate={pkg.start_date} totalDays={totalDays} />
      )}

      {/* Price + CTA */}
      <Card className="mt-8 border-turquoise-200">
        <CardContent className="flex items-center justify-between pt-6">
          <div>
            <p className="text-sm text-sand-500">Valor total</p>
            <p className="text-2xl font-bold text-sand-800">
              R$ {pkg.total_price.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
            </p>
            <p className="text-xs text-sand-400">
              {pkg.num_travelers} viajante{pkg.num_travelers > 1 ? 's' : ''} · {totalDays} dias · seguro incluso
            </p>
          </div>
          {pkg.status === 'draft' && (
            <Button className="bg-turquoise-600 hover:bg-turquoise-700" size="lg">
              Finalizar Pacote
            </Button>
          )}
        </CardContent>
      </Card>

      {/* Draft note */}
      {pkg.status === 'draft' && (
        <p className="mt-3 text-center text-sm text-sand-400">
          Rascunho — personalize e finalize quando estiver pronto
        </p>
      )}
    </div>
  );
}
