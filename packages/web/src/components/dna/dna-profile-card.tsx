import { getDNADescription } from '@travelmatch/shared';
import type { DNADimension } from '@travelmatch/shared';
import { DNA_DIMENSION_LABELS } from '@travelmatch/shared';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import Link from 'next/link';

interface DNAProfileCardProps {
  label: string;
  labelEmoji: string;
  dimensions: Record<DNADimension, number>;
  completenessPercentage: number;
}

export function DNAProfileCard({
  label,
  labelEmoji,
  dimensions,
  completenessPercentage,
}: DNAProfileCardProps) {
  const descriptions = getDNADescription(dimensions);
  const isPartial = completenessPercentage < 95;

  const sorted = (Object.entries(dimensions) as [DNADimension, number][])
    .sort((a, b) => b[1] - a[1])
    .slice(0, 3);

  return (
    <Card className="space-y-5 p-6">
      {/* Label + Emoji */}
      <div className="text-center">
        <span className="text-6xl">{labelEmoji}</span>
        <h2 className="mt-2 text-2xl font-bold text-turquoise-600">{label}</h2>
      </div>

      {/* Completeness bar */}
      <div className="space-y-1">
        <div className="flex justify-between text-xs text-sand-400">
          <span>Completude do DNA</span>
          <span>{completenessPercentage}%</span>
        </div>
        <div className="h-1.5 overflow-hidden rounded-full bg-sand-200">
          <div
            className="h-full rounded-full bg-coral-500 transition-all duration-500"
            style={{ width: `${completenessPercentage}%` }}
          />
        </div>
        {isPartial && (
          <Link href="/quiz?phase=2" className="mt-2 block">
            <Button
              className="w-full bg-turquoise-600 hover:bg-turquoise-700"
              size="sm"
            >
              Completar meu DNA
            </Button>
          </Link>
        )}
      </div>

      {/* What it means */}
      <div className="space-y-2">
        <h3 className="text-sm font-semibold text-sand-700">O que isso significa</h3>
        {descriptions.map((desc) => (
          <p key={desc} className="text-sm text-sand-600">
            {desc}
          </p>
        ))}
      </div>

      {/* Top 3 dimensions */}
      <div className="space-y-2">
        <h3 className="text-sm font-semibold text-sand-700">Suas top dimensões</h3>
        {sorted.map(([dim, score]) => (
          <div key={dim} className="space-y-1">
            <div className="flex justify-between text-sm">
              <span className="text-sand-700">{DNA_DIMENSION_LABELS[dim]}</span>
              <span className="text-sand-500">{score}%</span>
            </div>
            <div className="h-2 overflow-hidden rounded-full bg-sand-200">
              <div
                className="h-full rounded-full bg-turquoise-500 transition-all duration-500"
                style={{ width: `${score}%` }}
              />
            </div>
          </div>
        ))}
      </div>
    </Card>
  );
}
