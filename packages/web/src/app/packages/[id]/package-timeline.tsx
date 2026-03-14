'use client';

import { Car, Hotel, Compass, UtensilsCrossed, Shield } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import type { PackageItem } from '@travelmatch/shared';

const TYPE_ICONS: Record<string, { icon: typeof Car; color: string }> = {
  transfer: { icon: Car, color: 'bg-blue-100 text-blue-600' },
  hospedagem: { icon: Hotel, color: 'bg-purple-100 text-purple-600' },
  passeio: { icon: Compass, color: 'bg-turquoise-100 text-turquoise-600' },
  experiencia: { icon: Compass, color: 'bg-coral-100 text-coral-600' },
  alimentacao: { icon: UtensilsCrossed, color: 'bg-amber-100 text-amber-600' },
  seguro: { icon: Shield, color: 'bg-emerald-100 text-emerald-600' },
};

interface PackageTimelineProps {
  items: PackageItem[];
  startDate: string;
  totalDays: number;
}

export function PackageTimeline({ items, startDate, totalDays }: PackageTimelineProps) {
  // Group items by day
  const dayGroups: Record<number, PackageItem[]> = {};
  for (let d = 1; d <= totalDays; d++) dayGroups[d] = [];
  items.forEach((item) => {
    if (!dayGroups[item.day_number]) dayGroups[item.day_number] = [];
    dayGroups[item.day_number]!.push(item);
  });

  return (
    <div className="space-y-6" data-testid="package-timeline">
      {Object.entries(dayGroups).map(([dayStr, dayItems]) => {
        const day = parseInt(dayStr);
        const date = new Date(startDate);
        date.setDate(date.getDate() + day - 1);
        const dateLabel = date.toLocaleDateString('pt-BR', {
          weekday: 'short',
          day: '2-digit',
          month: 'short',
        });

        return (
          <div key={day}>
            {/* Day header */}
            <div className="mb-3 flex items-center gap-3">
              <div className="flex size-8 items-center justify-center rounded-full bg-turquoise-600 text-sm font-bold text-white">
                {day}
              </div>
              <div>
                <h3 className="font-semibold text-sand-800">Dia {day}</h3>
                <p className="text-xs capitalize text-sand-400">{dateLabel}</p>
              </div>
            </div>

            {/* Timeline items */}
            <div className="ml-4 space-y-3 border-l-2 border-sand-200 pl-6">
              {dayItems.length === 0 ? (
                <p className="py-4 text-sm italic text-sand-400">Dia livre — aproveite como quiser!</p>
              ) : (
                dayItems.map((item) => {
                  const config = TYPE_ICONS[item.type] ?? TYPE_ICONS.passeio!;
                  const Icon = config.icon;

                  return (
                    <Card key={item.id} className="relative">
                      {/* Timeline dot */}
                      <div className={`absolute -left-[33px] top-4 size-3 rounded-full border-2 border-white ${config.color.split(' ')[0]}`} />

                      <CardContent className="flex items-start gap-3 pt-3 pb-3">
                        <div className={`flex size-9 shrink-0 items-center justify-center rounded-lg ${config.color}`}>
                          <Icon className="size-4" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-start justify-between gap-2">
                            <div>
                              <h4 className="text-sm font-medium text-sand-800">{item.title}</h4>
                              {item.start_time && (
                                <p className="text-xs text-sand-400">
                                  {item.start_time}{item.end_time ? ` — ${item.end_time}` : ''}
                                </p>
                              )}
                            </div>
                            {item.price > 0 && (
                              <span className="shrink-0 text-sm font-medium text-sand-600">
                                R$ {item.price.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                              </span>
                            )}
                          </div>
                          {item.description && (
                            <p className="mt-1 line-clamp-2 text-xs text-sand-500">{item.description}</p>
                          )}
                        </div>
                      </CardContent>
                    </Card>
                  );
                })
              )}
            </div>
          </div>
        );
      })}
    </div>
  );
}
