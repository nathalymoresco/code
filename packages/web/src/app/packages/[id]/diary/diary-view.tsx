'use client';

import { Share2, Camera, MapPin, Calendar } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';

interface DiaryItem {
  id: string;
  title: string;
  type: string;
  day_number: number;
  description: string | null;
}

interface DiaryViewProps {
  packageId: string;
  destinationName: string;
  destinationState: string;
  coverUrl: string | null;
  startDate: string;
  endDate: string;
  numTravelers: number;
  items: DiaryItem[];
}

const TYPE_ICONS: Record<string, string> = {
  transfer: '🚗',
  hospedagem: '🏨',
  passeio: '🧭',
  experiencia: '✨',
  alimentacao: '🍽️',
  seguro: '🛡️',
};

export function DiaryView({
  packageId,
  destinationName,
  destinationState,
  coverUrl,
  startDate,
  endDate,
  numTravelers,
  items,
}: DiaryViewProps) {
  const formatDate = (d: string) =>
    new Date(d + 'T12:00:00').toLocaleDateString('pt-BR', { day: '2-digit', month: 'short', year: 'numeric' });

  const totalDays = Math.ceil(
    (new Date(endDate).getTime() - new Date(startDate).getTime()) / 86400000,
  );

  // Group by day
  const days: Record<number, DiaryItem[]> = {};
  for (const item of items) {
    if (!days[item.day_number]) days[item.day_number] = [];
    days[item.day_number]!.push(item);
  }

  const handleShare = async () => {
    const shareUrl = `${window.location.origin}/packages/${packageId}/diary`;
    if (navigator.share) {
      await navigator.share({
        title: `Minha viagem para ${destinationName} 🌴`,
        text: `Confira meu diário de viagem para ${destinationName}!`,
        url: shareUrl,
      });
    } else {
      await navigator.clipboard.writeText(shareUrl);
    }
  };

  return (
    <div className="space-y-6" data-testid="diary-view">
      {/* Cover */}
      <div className="relative overflow-hidden rounded-2xl" data-testid="diary-cover">
        {coverUrl ? (
          <img src={coverUrl} alt={destinationName} className="h-48 w-full object-cover" />
        ) : (
          <div className="flex h-48 items-center justify-center bg-gradient-to-br from-turquoise-400 to-turquoise-600">
            <MapPin className="size-12 text-white/50" />
          </div>
        )}
        <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
        <div className="absolute bottom-4 left-4 text-white">
          <h1 className="text-2xl font-bold">{destinationName}</h1>
          {destinationState && <p className="text-sm opacity-80">{destinationState}</p>}
        </div>
      </div>

      {/* Trip summary */}
      <div className="flex items-center justify-between text-sm text-sand-500">
        <div className="flex items-center gap-1">
          <Calendar className="size-3" />
          <span>{formatDate(startDate)} — {formatDate(endDate)}</span>
        </div>
        <span>{totalDays} dias · {numTravelers} viajante{numTravelers > 1 ? 's' : ''}</span>
      </div>

      {/* Timeline */}
      <div className="space-y-4" data-testid="diary-timeline">
        {Array.from({ length: totalDays }, (_, i) => {
          const dayNum = i + 1;
          const dayItems = days[dayNum] ?? [];

          return (
            <Card key={dayNum} data-testid={`diary-day-${dayNum}`}>
              <CardContent className="pt-4">
                <h2 className="text-sm font-semibold text-turquoise-600">Dia {dayNum}</h2>
                {dayItems.length > 0 ? (
                  <div className="mt-2 space-y-2">
                    {dayItems.map((item) => (
                      <div key={item.id} className="flex items-start gap-2">
                        <span className="text-sm">{TYPE_ICONS[item.type] ?? '📌'}</span>
                        <div>
                          <p className="text-sm text-sand-700">{item.title}</p>
                          {item.description && (
                            <p className="text-xs text-sand-400">{item.description}</p>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="mt-1 text-xs text-sand-400 italic">Dia livre</p>
                )}

                {/* Photo upload placeholder */}
                <Button
                  variant="ghost"
                  size="sm"
                  className="mt-2 h-7 gap-1 text-xs text-sand-400"
                  data-testid={`upload-photo-${dayNum}`}
                >
                  <Camera className="size-3" />
                  Adicionar foto
                </Button>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* Share */}
      <Button
        className="w-full gap-2 bg-turquoise-600 hover:bg-turquoise-700"
        onClick={handleShare}
        data-testid="share-diary"
      >
        <Share2 className="size-4" />
        Compartilhar diário
      </Button>

      {/* CTA */}
      <p className="text-center text-xs text-sand-400" data-testid="diary-cta">
        Planeje sua próxima viagem com a TravelMatch 🌍
      </p>
    </div>
  );
}
