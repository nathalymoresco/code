'use client';

import { useState } from 'react';
import { Star, ChevronLeft, ChevronRight, Sparkles } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';

interface AccommodationOption {
  id: string;
  name: string;
  type: string;
  description: string | null;
  cover_url: string | null;
  price_range: string | null;
  daily_rate: number | null;
  rating: number;
  review_count: number;
  amenities: string[];
  dna_score: number;
}

interface AccommodationComparatorProps {
  options: AccommodationOption[];
  currentPartnerId: string | null;
  nights: number;
  numTravelers: number;
  onSelect: (partnerId: string) => void;
}

const TYPE_LABELS: Record<string, string> = {
  hotel: 'Hotel',
  pousada: 'Pousada',
  airbnb: 'Airbnb',
};

export function AccommodationComparator({
  options,
  currentPartnerId,
  nights,
  numTravelers,
  onSelect,
}: AccommodationComparatorProps) {
  const [carouselIdx, setCarouselIdx] = useState(0);

  if (options.length < 2) {
    return (
      <div className="rounded-xl border border-sand-200 bg-sand-50 p-6 text-center" data-testid="no-comparator">
        <p className="text-sm text-sand-500">
          {options.length === 1
            ? 'Apenas uma opção de hospedagem disponível neste destino.'
            : 'Nenhuma hospedagem disponível — mais opções em breve!'}
        </p>
      </div>
    );
  }

  // Sort by DNA score descending
  const sorted = [...options].sort((a, b) => b.dna_score - a.dna_score);
  const recommended = sorted[0]!;

  // Mobile carousel navigation
  const canPrev = carouselIdx > 0;
  const canNext = carouselIdx < sorted.length - 1;

  return (
    <section data-testid="accommodation-comparator">
      <h2 className="text-xl font-bold text-sand-800">Compare Hospedagens</h2>
      <p className="mt-1 text-sm text-sand-400">
        Escolha a hospedagem ideal para seu perfil
      </p>

      {/* Mobile carousel controls */}
      <div className="mt-4 flex items-center gap-2 sm:hidden">
        <Button
          variant="outline"
          size="icon"
          onClick={() => setCarouselIdx((i) => Math.max(0, i - 1))}
          disabled={!canPrev}
        >
          <ChevronLeft className="size-4" />
        </Button>
        <span className="flex-1 text-center text-sm text-sand-500">
          {carouselIdx + 1} de {sorted.length}
        </span>
        <Button
          variant="outline"
          size="icon"
          onClick={() => setCarouselIdx((i) => Math.min(sorted.length - 1, i + 1))}
          disabled={!canNext}
        >
          <ChevronRight className="size-4" />
        </Button>
      </div>

      {/* Desktop grid / Mobile single card */}
      <div className="mt-4 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {sorted.map((opt, idx) => {
          const isRecommended = opt.id === recommended.id;
          const isCurrent = opt.id === currentPartnerId;
          const totalPrice = (opt.daily_rate ?? 0) * numTravelers * nights;

          // On mobile, only show current carousel item
          const mobileClass = idx === carouselIdx ? '' : 'hidden sm:block';

          return (
            <Card
              key={opt.id}
              className={`relative overflow-hidden transition ${mobileClass} ${
                isCurrent ? 'ring-2 ring-turquoise-500' : ''
              } ${isRecommended ? 'border-turquoise-300' : ''}`}
              data-testid={`accom-card-${opt.id}`}
            >
              {/* Recommended badge */}
              {isRecommended && (
                <div className="absolute right-3 top-3 z-10 flex items-center gap-1 rounded-full bg-turquoise-600 px-2.5 py-1 text-xs font-medium text-white shadow">
                  <Sparkles className="size-3" />
                  Recomendado
                </div>
              )}

              {/* Image */}
              {opt.cover_url ? (
                <img src={opt.cover_url} alt={opt.name} className="h-36 w-full object-cover" />
              ) : (
                <div className="flex h-36 items-center justify-center bg-sand-100 text-sand-300 text-sm">
                  Sem foto
                </div>
              )}

              <CardContent className="space-y-3 pt-4">
                {/* Name + type */}
                <div>
                  <h3 className="font-semibold text-sand-800">{opt.name}</h3>
                  <p className="text-xs text-sand-400">{TYPE_LABELS[opt.type] ?? opt.type}</p>
                </div>

                {/* DNA score */}
                <div className="flex items-center gap-2">
                  <div className="h-2 flex-1 rounded-full bg-sand-100">
                    <div
                      className="h-2 rounded-full bg-turquoise-500 transition-all"
                      style={{ width: `${opt.dna_score}%` }}
                    />
                  </div>
                  <span className="text-sm font-medium text-turquoise-700">{opt.dna_score}%</span>
                </div>

                {/* Rating */}
                {opt.rating > 0 && (
                  <div className="flex items-center gap-1 text-sm">
                    <Star className="size-3.5 fill-amber-400 text-amber-400" />
                    <span className="font-medium text-sand-700">{opt.rating.toFixed(1)}</span>
                    <span className="text-sand-400">({opt.review_count})</span>
                  </div>
                )}

                {/* Amenities */}
                {opt.amenities.length > 0 && (
                  <div className="flex flex-wrap gap-1">
                    {opt.amenities.slice(0, 4).map((a) => (
                      <span key={a} className="rounded-full bg-sand-50 px-2 py-0.5 text-[10px] text-sand-500">
                        {a}
                      </span>
                    ))}
                  </div>
                )}

                {/* Price */}
                <div className="border-t border-sand-100 pt-3">
                  <div className="flex items-baseline justify-between">
                    <div>
                      <span className="text-lg font-bold text-sand-800">
                        R$ {(opt.daily_rate ?? 0).toLocaleString('pt-BR')}
                      </span>
                      <span className="text-xs text-sand-400">/noite</span>
                    </div>
                    <span className="text-sm text-sand-500">
                      Total: R$ {totalPrice.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                    </span>
                  </div>
                </div>

                {/* Select button */}
                <Button
                  className={`w-full ${
                    isCurrent
                      ? 'bg-turquoise-600 hover:bg-turquoise-700'
                      : ''
                  }`}
                  variant={isCurrent ? 'default' : 'outline'}
                  onClick={() => onSelect(opt.id)}
                  disabled={isCurrent}
                >
                  {isCurrent ? 'Selecionado' : 'Selecionar'}
                </Button>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* WCAG note */}
      <p className="mt-2 text-xs text-sand-400" role="note">
        Pontuação baseada na compatibilidade com seu DNA de Viagem
      </p>
    </section>
  );
}
