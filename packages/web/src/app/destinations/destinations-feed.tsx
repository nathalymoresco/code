'use client';

import { useState, useMemo } from 'react';
import { MapPin, Compass } from 'lucide-react';
import Link from 'next/link';
import { useCompatibility } from '@/hooks/use-compatibility';
import { DestinationCard } from './destination-card';
import { FeedSkeleton } from './feed-skeleton';
import { FeedFilters } from './feed-filters';
import type { CompatibilityResult } from '@travelmatch/shared';

function filterDestinations(
  destinations: CompatibilityResult[],
  region: string,
  priceRange: string,
): CompatibilityResult[] {
  return destinations.filter((d) => {
    if (region && d.region !== region) return false;
    if (priceRange) {
      const cost = d.avg_daily_cost;
      if (!cost) return priceRange === '';
      if (priceRange === 'budget' && cost > 200) return false;
      if (priceRange === 'mid' && (cost < 200 || cost > 400)) return false;
      if (priceRange === 'premium' && cost < 400) return false;
    }
    return true;
  });
}

export function DestinationsFeed() {
  const { data, loading, error } = useCompatibility();
  const [region, setRegion] = useState('');
  const [priceRange, setPriceRange] = useState('');

  const filtered = useMemo(() => {
    if (!data?.destinations) return [];
    return filterDestinations(data.destinations, region, priceRange);
  }, [data, region, priceRange]);

  if (loading) return <FeedSkeleton />;

  if (error) {
    return (
      <div className="rounded-xl border border-sand-200 bg-white p-12 text-center">
        <Compass className="mx-auto mb-4 size-12 text-sand-300" />
        <p className="text-lg font-medium text-sand-600">Erro ao carregar destinos</p>
        <p className="mt-1 text-sm text-sand-400">{error}</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Incomplete DNA banner */}
      {data && data.profile_completeness < 80 && data.profile_completeness > 0 && (
        <div className="rounded-xl border border-turquoise-200 bg-turquoise-50 p-4" data-testid="dna-incomplete-banner">
          <p className="text-sm text-turquoise-800">
            <strong>Seu DNA está {data.profile_completeness}% completo.</strong>{' '}
            <Link href="/quiz" className="underline hover:text-turquoise-600">
              Complete o quiz
            </Link>{' '}
            para recomendações mais precisas.
          </p>
        </div>
      )}

      {/* No DNA banner */}
      {data && data.profile_completeness === 0 && (
        <div className="rounded-xl border border-coral-200 bg-coral-50 p-4" data-testid="dna-missing-banner">
          <p className="text-sm text-coral-800">
            <strong>Faça o Quiz DNA de Viagem</strong> para receber recomendações personalizadas.{' '}
            <Link href="/quiz" className="font-medium underline hover:text-coral-600">
              Começar agora
            </Link>
          </p>
        </div>
      )}

      {/* Filters */}
      <FeedFilters
        region={region}
        priceRange={priceRange}
        onRegionChange={setRegion}
        onPriceRangeChange={setPriceRange}
      />

      {/* Feed */}
      {filtered.length === 0 ? (
        <div className="rounded-xl border border-sand-200 bg-white p-12 text-center">
          <MapPin className="mx-auto mb-4 size-12 text-sand-300" />
          <p className="text-lg font-medium text-sand-600">Em breve!</p>
          <p className="mt-1 text-sm text-sand-400">
            Novos destinos estão sendo curados para você.
          </p>
        </div>
      ) : (
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3" data-testid="destinations-grid">
          {filtered.map((dest, i) => (
            <DestinationCard key={dest.destination_id} destination={dest} rank={i} />
          ))}
        </div>
      )}
    </div>
  );
}
