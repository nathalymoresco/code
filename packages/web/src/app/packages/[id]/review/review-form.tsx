'use client';

import { useState } from 'react';
import { Star, Send, Loader2, CheckCircle2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';

interface ReviewItem {
  id: string;
  title: string;
  type: string;
  partnerName: string | null;
}

interface ReviewFormProps {
  packageId: string;
  destinationName: string;
  items: ReviewItem[];
}

interface ItemReview {
  rating: number;
  comment: string;
}

const NPS_LABELS = ['Não recomendaria', '', '', '', '', '', 'Neutro', '', '', '', 'Com certeza!'];

export function ReviewForm({ packageId, destinationName, items }: ReviewFormProps) {
  const [itemReviews, setItemReviews] = useState<Record<string, ItemReview>>({});
  const [overallRating, setOverallRating] = useState(0);
  const [nps, setNps] = useState<number | null>(null);
  const [generalComment, setGeneralComment] = useState('');
  const [loading, setLoading] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  const setItemRating = (itemId: string, rating: number) => {
    setItemReviews((prev) => ({
      ...prev,
      [itemId]: { ...prev[itemId], rating, comment: prev[itemId]?.comment ?? '' },
    }));
  };

  const setItemComment = (itemId: string, comment: string) => {
    setItemReviews((prev) => ({
      ...prev,
      [itemId]: { rating: prev[itemId]?.rating ?? 0, comment },
    }));
  };

  const handleSubmit = async () => {
    setLoading(true);
    try {
      const res = await fetch(`/api/packages/${packageId}/review`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          overall_rating: overallRating,
          nps,
          general_comment: generalComment,
          item_reviews: Object.entries(itemReviews).map(([itemId, review]) => ({
            item_id: itemId,
            rating: review.rating,
            comment: review.comment,
          })),
        }),
      });
      if (res.ok) setSubmitted(true);
    } catch {
      // Silent fail
    } finally {
      setLoading(false);
    }
  };

  if (submitted) {
    return (
      <div className="space-y-6 text-center py-12" data-testid="review-success">
        <CheckCircle2 className="mx-auto size-16 text-green-500" />
        <h1 className="text-2xl font-bold text-sand-800">Obrigado pela avaliação!</h1>
        <p className="text-sm text-sand-500">Sua opinião nos ajuda a melhorar cada vez mais.</p>
      </div>
    );
  }

  return (
    <div className="space-y-6" data-testid="review-form">
      <div>
        <h1 className="text-2xl font-bold text-sand-800">Avaliar Viagem</h1>
        <p className="mt-1 text-sm text-sand-500">{destinationName}</p>
      </div>

      {/* Overall rating */}
      <Card>
        <CardContent className="pt-4">
          <h2 className="text-sm font-semibold text-sand-700">Avaliação geral</h2>
          <div className="mt-2 flex gap-1" data-testid="overall-stars">
            {[1, 2, 3, 4, 5].map((n) => (
              <button
                key={n}
                type="button"
                onClick={() => setOverallRating(n)}
                data-testid={`overall-star-${n}`}
              >
                <Star
                  className={`size-8 ${n <= overallRating ? 'fill-amber-400 text-amber-400' : 'text-sand-200'}`}
                />
              </button>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Item reviews */}
      <div className="space-y-3">
        <h2 className="text-sm font-semibold text-sand-700">Avalie cada etapa</h2>
        {items.filter((i) => i.type !== 'seguro').map((item) => {
          const review = itemReviews[item.id];
          return (
            <Card key={item.id} data-testid={`review-item-${item.id}`}>
              <CardContent className="space-y-2 pt-4">
                <div>
                  <p className="text-sm font-medium text-sand-700">{item.title}</p>
                  {item.partnerName && (
                    <p className="text-xs text-sand-400">{item.partnerName}</p>
                  )}
                </div>
                <div className="flex gap-0.5">
                  {[1, 2, 3, 4, 5].map((n) => (
                    <button
                      key={n}
                      type="button"
                      onClick={() => setItemRating(item.id, n)}
                      data-testid={`item-star-${item.id}-${n}`}
                    >
                      <Star
                        className={`size-5 ${n <= (review?.rating ?? 0) ? 'fill-amber-400 text-amber-400' : 'text-sand-200'}`}
                      />
                    </button>
                  ))}
                </div>
                <textarea
                  placeholder="Comentário opcional..."
                  value={review?.comment ?? ''}
                  onChange={(e) => setItemComment(item.id, e.target.value)}
                  className="w-full rounded-lg border border-sand-200 px-3 py-2 text-xs text-sand-700 placeholder:text-sand-300"
                  rows={2}
                  data-testid={`item-comment-${item.id}`}
                />
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* NPS */}
      <Card>
        <CardContent className="pt-4">
          <h2 className="text-sm font-semibold text-sand-700">
            Recomendaria a TravelMatch?
          </h2>
          <div className="mt-3 flex justify-between gap-1" data-testid="nps-scale">
            {Array.from({ length: 11 }, (_, i) => (
              <button
                key={i}
                type="button"
                onClick={() => setNps(i)}
                className={`flex size-8 items-center justify-center rounded-lg text-xs font-medium transition ${
                  nps === i
                    ? i <= 6 ? 'bg-red-500 text-white' : i <= 8 ? 'bg-amber-500 text-white' : 'bg-green-500 text-white'
                    : 'bg-sand-100 text-sand-500'
                }`}
                data-testid={`nps-${i}`}
              >
                {i}
              </button>
            ))}
          </div>
          {nps !== null && (
            <p className="mt-2 text-center text-xs text-sand-400">{NPS_LABELS[nps]}</p>
          )}
        </CardContent>
      </Card>

      {/* General comment */}
      <textarea
        placeholder="Algum comentário geral sobre a viagem?"
        value={generalComment}
        onChange={(e) => setGeneralComment(e.target.value)}
        className="w-full rounded-lg border border-sand-200 px-3 py-2 text-sm text-sand-700 placeholder:text-sand-300"
        rows={3}
        data-testid="general-comment"
      />

      {/* Submit */}
      <Button
        className="w-full bg-turquoise-600 hover:bg-turquoise-700"
        onClick={handleSubmit}
        disabled={loading || overallRating === 0}
        data-testid="submit-review"
      >
        {loading ? <Loader2 className="mr-2 size-4 animate-spin" /> : <Send className="mr-2 size-4" />}
        Enviar avaliação
      </Button>
    </div>
  );
}
