'use client';

import { cn } from '@/lib/utils';

interface QuizCardProps {
  emoji: string;
  label: string;
  description: string;
  selected: boolean;
  onClick: () => void;
}

export function QuizCard({ emoji, label, description, selected, onClick }: QuizCardProps) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={cn(
        'flex w-full flex-col items-center gap-2 rounded-2xl border-2 p-6 text-center transition-all duration-200',
        'hover:shadow-md focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-turquoise-500',
        'min-h-[120px] min-w-[44px]',
        selected
          ? 'scale-[1.02] border-turquoise-500 bg-turquoise-50 shadow-md'
          : 'border-sand-200 bg-white',
      )}
    >
      <span className="text-3xl">{emoji}</span>
      <span className="font-semibold text-sand-900">{label}</span>
      <span className="text-sm text-sand-500">{description}</span>
    </button>
  );
}
