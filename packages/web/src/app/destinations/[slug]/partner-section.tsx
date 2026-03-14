import { Star } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';

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

const TYPE_LABELS: Record<string, string> = {
  hotel: 'Hotel',
  pousada: 'Pousada',
  airbnb: 'Airbnb',
  guia: 'Guia',
  restaurante: 'Restaurante',
  transfer: 'Transfer',
  experiencia: 'Experiência',
};

interface PartnerSectionProps {
  title: string;
  partners: PartnerData[];
}

export function PartnerSection({ title, partners }: PartnerSectionProps) {
  return (
    <section>
      <h2 className="text-xl font-bold text-sand-800">{title}</h2>
      <div className="mt-3 grid gap-4 sm:grid-cols-2">
        {partners.map((p) => (
          <Card key={p.id} className="overflow-hidden">
            {p.cover_url && (
              <img
                src={p.cover_url}
                alt={p.name}
                className="h-36 w-full object-cover"
              />
            )}
            <CardContent className="pt-4">
              <div className="flex items-start justify-between">
                <div>
                  <h3 className="font-semibold text-sand-800">{p.name}</h3>
                  <p className="text-xs text-sand-400">{TYPE_LABELS[p.type] ?? p.type}</p>
                </div>
                {p.rating > 0 && (
                  <div className="flex items-center gap-1 text-sm">
                    <Star className="size-3.5 fill-amber-400 text-amber-400" />
                    <span className="font-medium text-sand-700">{p.rating.toFixed(1)}</span>
                    <span className="text-sand-400">({p.review_count})</span>
                  </div>
                )}
              </div>

              {p.description && (
                <p className="mt-2 line-clamp-2 text-sm text-sand-500">{p.description}</p>
              )}

              <div className="mt-3 flex items-center justify-between">
                {p.daily_rate ? (
                  <span className="text-sm font-medium text-sand-700">
                    R$ {p.daily_rate}/dia
                  </span>
                ) : p.price_range ? (
                  <span className="rounded-full bg-sand-100 px-2 py-0.5 text-xs text-sand-600 capitalize">
                    {p.price_range}
                  </span>
                ) : null}

                {p.amenities.length > 0 && (
                  <span className="text-xs text-sand-400">
                    {p.amenities.slice(0, 2).join(', ')}
                  </span>
                )}
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </section>
  );
}
