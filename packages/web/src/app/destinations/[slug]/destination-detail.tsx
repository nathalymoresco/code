'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { ChevronRight, MapPin, Calendar, Star } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { DNA_DIMENSION_LABELS } from '@travelmatch/shared';
import type { Destination, DestinationScore } from '@travelmatch/shared';
import { DestinationGallery } from './destination-gallery';
import { MonthCalendar } from './month-calendar';
import { WhyForYou } from './why-for-you';
import { PartnerSection } from './partner-section';

interface PartnerData {
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
}

interface DestinationDetailProps {
  destination: Destination;
  scores: Pick<DestinationScore, 'dimension' | 'score'>[];
  partners: PartnerData[];
}

export function DestinationDetail({ destination, scores, partners }: DestinationDetailProps) {
  const [userScore, setUserScore] = useState<number | null>(null);

  // Fetch user's compatibility score for this destination
  useEffect(() => {
    async function fetchScore() {
      try {
        const res = await fetch('/api/compatibility');
        if (!res.ok) return;
        const data = await res.json();
        const match = data.destinations?.find(
          (d: { destination_id: string }) => d.destination_id === destination.id,
        );
        if (match) setUserScore(match.score);
      } catch {
        // silently fail
      }
    }
    fetchScore();
  }, [destination.id]);

  const accommodations = partners.filter((p) =>
    ['hotel', 'pousada', 'airbnb'].includes(p.type),
  );
  const experiences = partners.filter((p) =>
    ['guia', 'experiencia', 'restaurante'].includes(p.type),
  );
  const transfers = partners.filter((p) => p.type === 'transfer');

  // Top 3 dimensions for this destination
  const topDimensions = [...scores]
    .sort((a, b) => b.score - a.score)
    .slice(0, 3)
    .map((s) => ({
      dimension: s.dimension,
      label: DNA_DIMENSION_LABELS[s.dimension],
      score: s.score,
    }));

  return (
    <div className="mx-auto max-w-6xl px-4 py-6">
      {/* Breadcrumb */}
      <nav className="mb-4 flex items-center gap-1 text-sm text-sand-400" data-testid="breadcrumb">
        <Link href="/destinations" className="hover:text-turquoise-600 transition-colors">
          Destinos
        </Link>
        <ChevronRight className="size-3" />
        <span className="text-sand-700">{destination.name}</span>
      </nav>

      {/* Hero */}
      <div className="relative mb-8 overflow-hidden rounded-2xl">
        {destination.cover_url ? (
          <img
            src={destination.cover_url}
            alt={destination.name}
            className="h-64 w-full object-cover sm:h-80 lg:h-96"
          />
        ) : (
          <div className="flex h-64 items-center justify-center bg-sand-100 sm:h-80 lg:h-96">
            <MapPin className="size-16 text-sand-300" />
          </div>
        )}
        <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
        <div className="absolute bottom-0 left-0 p-6 sm:p-8">
          <h1 className="text-3xl font-bold text-white sm:text-4xl">{destination.name}</h1>
          <p className="mt-1 flex items-center gap-1 text-white/80">
            <MapPin className="size-4" />
            {destination.city}, {destination.state}
          </p>
          {userScore !== null && (
            <div className="mt-3 inline-flex items-center gap-2 rounded-full bg-white/20 px-4 py-1.5 backdrop-blur-sm">
              <span className="text-sm font-medium text-white">Compatibilidade</span>
              <span className="text-lg font-bold text-white">{userScore}%</span>
            </div>
          )}
        </div>
      </div>

      {/* Gallery */}
      {destination.photo_urls.length > 0 && (
        <DestinationGallery photos={destination.photo_urls} name={destination.name} />
      )}

      <div className="mt-8 grid gap-8 lg:grid-cols-3">
        {/* Main content */}
        <div className="space-y-8 lg:col-span-2">
          {/* Description */}
          {destination.description && (
            <section>
              <h2 className="text-xl font-bold text-sand-800">Sobre {destination.name}</h2>
              <p className="mt-2 leading-relaxed text-sand-600">{destination.description}</p>
            </section>
          )}

          {/* Why it's for you */}
          {topDimensions.length > 0 && (
            <WhyForYou dimensions={topDimensions} destinationName={destination.name} />
          )}

          {/* Best season calendar */}
          {destination.best_months.length > 0 && (
            <section>
              <h2 className="text-xl font-bold text-sand-800">Melhor Época</h2>
              <MonthCalendar bestMonths={destination.best_months} />
            </section>
          )}

          {/* Experiences */}
          {experiences.length > 0 && (
            <PartnerSection title="O que fazer" partners={experiences} />
          )}

          {/* Accommodations */}
          {accommodations.length > 0 && (
            <PartnerSection title="Onde ficar" partners={accommodations} />
          )}

          {/* Transfers */}
          {transfers.length > 0 && (
            <PartnerSection title="Como se locomover" partners={transfers} />
          )}
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Quick info */}
          <Card>
            <CardContent className="space-y-4 pt-6">
              <div className="flex items-center gap-3">
                <Calendar className="size-5 text-turquoise-600" />
                <div>
                  <p className="text-sm font-medium text-sand-700">Duração ideal</p>
                  <p className="text-sand-500">{destination.min_days}-{destination.max_days} dias</p>
                </div>
              </div>

              {destination.avg_daily_cost && (
                <div className="flex items-center gap-3">
                  <span className="flex size-5 items-center justify-center text-turquoise-600 font-bold text-sm">R$</span>
                  <div>
                    <p className="text-sm font-medium text-sand-700">Custo médio/dia</p>
                    <p className="text-sand-500">R$ {destination.avg_daily_cost}</p>
                  </div>
                </div>
              )}

              {destination.climate_type && (
                <div className="flex items-center gap-3">
                  <span className="flex size-5 items-center justify-center text-turquoise-600">☀️</span>
                  <div>
                    <p className="text-sm font-medium text-sand-700">Clima</p>
                    <p className="text-sand-500 capitalize">{destination.climate_type}</p>
                  </div>
                </div>
              )}

              {destination.tags.length > 0 && (
                <div className="flex flex-wrap gap-1 pt-2">
                  {destination.tags.map((tag) => (
                    <span
                      key={tag}
                      className="rounded-full bg-sand-100 px-2.5 py-1 text-xs text-sand-600"
                    >
                      {tag}
                    </span>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>

          {/* CTA */}
          <Card className="border-turquoise-200 bg-turquoise-50">
            <CardContent className="pt-6 text-center">
              <h3 className="font-semibold text-turquoise-800">
                Pronto para {destination.name}?
              </h3>
              <p className="mt-1 text-sm text-turquoise-600">
                Monte seu pacote personalizado
              </p>
              <Button
                className="mt-4 w-full bg-turquoise-600 hover:bg-turquoise-700"
                size="lg"
              >
                Montar meu pacote
              </Button>
            </CardContent>
          </Card>

          {/* Travelers placeholder */}
          <Card>
            <CardContent className="pt-6">
              <h3 className="font-semibold text-sand-800">Viajantes como você</h3>
              <div className="mt-3 flex items-center gap-2 text-sand-400">
                <Star className="size-4" />
                <p className="text-sm">Em breve: avaliações de viajantes</p>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
