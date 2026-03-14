'use client';

interface FeedFiltersProps {
  region: string;
  priceRange: string;
  onRegionChange: (v: string) => void;
  onPriceRangeChange: (v: string) => void;
}

const REGIONS = [
  { value: '', label: 'Todas as regiões' },
  { value: 'norte', label: 'Norte' },
  { value: 'nordeste', label: 'Nordeste' },
  { value: 'centro-oeste', label: 'Centro-Oeste' },
  { value: 'sudeste', label: 'Sudeste' },
  { value: 'sul', label: 'Sul' },
];

const PRICE_RANGES = [
  { value: '', label: 'Qualquer preço' },
  { value: 'budget', label: 'Até R$200/dia' },
  { value: 'mid', label: 'R$200-400/dia' },
  { value: 'premium', label: 'R$400+/dia' },
];

export function FeedFilters({
  region,
  priceRange,
  onRegionChange,
  onPriceRangeChange,
}: FeedFiltersProps) {
  return (
    <div className="flex flex-wrap gap-3" data-testid="feed-filters">
      <select
        value={region}
        onChange={(e) => onRegionChange(e.target.value)}
        className="h-9 rounded-lg border border-sand-200 bg-white px-3 text-sm text-sand-700 outline-none focus:border-turquoise-500"
        data-testid="filter-region"
      >
        {REGIONS.map((r) => (
          <option key={r.value} value={r.value}>{r.label}</option>
        ))}
      </select>

      <select
        value={priceRange}
        onChange={(e) => onPriceRangeChange(e.target.value)}
        className="h-9 rounded-lg border border-sand-200 bg-white px-3 text-sm text-sand-700 outline-none focus:border-turquoise-500"
        data-testid="filter-price"
      >
        {PRICE_RANGES.map((p) => (
          <option key={p.value} value={p.value}>{p.label}</option>
        ))}
      </select>
    </div>
  );
}
