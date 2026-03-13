'use client';

import { cn } from '@/lib/utils';

interface QuizProgressProps {
  current: number;
  total: number;
  phase: 1 | 2;
}

export function QuizProgress({ current, total, phase }: QuizProgressProps) {
  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between text-sm text-sand-500">
        <span>Fase {phase} de 2</span>
        <span>
          {current + 1} / {total}
        </span>
      </div>
      <div className="flex gap-1.5">
        {Array.from({ length: total }, (_, i) => (
          <div
            key={i}
            className={cn(
              'h-1.5 flex-1 rounded-full transition-all duration-300',
              i <= current ? 'bg-turquoise-500' : 'bg-sand-200',
            )}
          />
        ))}
      </div>
    </div>
  );
}
