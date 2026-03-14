'use client';

import Link from 'next/link';
import { MapPin } from 'lucide-react';
import type { CompatibilityResult } from '@travelmatch/shared';

const TOP_BADGES = ['🥇', '🥈', '🥉'];

interface DestinationCardProps {
  destination: CompatibilityResult;
  rank: number;
}

export function DestinationCard({ destination, rank }: DestinationCardProps) {
  const isTopMatch = rank < 3;
  const badge = TOP_BADGES[rank];

  return (
    <Link
      href={`/destinations/${destination.slug}`}
      className="group block overflow-hidden rounded-xl border border-sand-200 bg-white shadow-sm transition hover:shadow-md"
      data-testid={`destination-card-${destination.slug}`}
    >
      {/* Image */}
      <div className="relative aspect-[4/3] overflow-hidden bg-sand-100">
        {destination.cover_url ? (
          <img
            src={destination.cover_url}
            alt={destination.name}
            className="size-full object-cover transition group-hover:scale-105"
          />
        ) : (
          <div className="flex size-full items-center justify-center text-sand-300">
            <MapPin className="size-12" />
          </div>
        )}

        {/* Score badge */}
        <div className="absolute right-3 top-3 rounded-full bg-white/90 px-3 py-1 text-sm font-bold text-turquoise-700 shadow backdrop-blur-sm">
          {destination.score}%
        </div>

        {/* Top match badge */}
        {isTopMatch && badge && (
          <div className="absolute left-3 top-3 rounded-full bg-coral-500 px-3 py-1 text-xs font-bold text-white shadow">
            {badge} Top Match
          </div>
        )}
      </div>

      {/* Content */}
      <div className="p-4">
        <h3 className="font-semibold text-sand-800 group-hover:text-turquoise-700 transition-colors">
          {destination.name}
        </h3>
        <p className="mt-0.5 flex items-center gap-1 text-sm text-sand-500">
          <MapPin className="size-3" />
          {destination.city}, {destination.state}
        </p>

        {/* Tags */}
        {destination.tags.length > 0 && (
          <div className="mt-2 flex flex-wrap gap-1">
            {destination.tags.slice(0, 3).map((tag) => (
              <span
                key={tag}
                className="rounded-full bg-sand-100 px-2 py-0.5 text-[11px] text-sand-600"
              >
                {tag}
              </span>
            ))}
          </div>
        )}

        {/* Price + days */}
        <div className="mt-3 flex items-center justify-between text-sm">
          {destination.avg_daily_cost ? (
            <span className="font-medium text-sand-700">
              R$ {destination.avg_daily_cost}/dia
            </span>
          ) : (
            <span className="text-sand-400">Preço sob consulta</span>
          )}
          <span className="text-sand-400">
            {destination.min_days}-{destination.max_days} dias
          </span>
        </div>

        {/* Match reasons */}
        {destination.match_reasons.length > 0 && (
          <p className="mt-2 text-xs text-turquoise-600">
            {destination.match_reasons[0]}
          </p>
        )}
      </div>
    </Link>
  );
}
