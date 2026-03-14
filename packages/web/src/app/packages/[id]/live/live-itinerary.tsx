'use client';

import { useState, useMemo } from 'react';
import { ChevronLeft, ChevronRight, MapPin, Clock, CheckCircle2, SkipForward, AlertTriangle, Navigation } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';

interface PartnerInfo {
  name: string;
  phone: string | null;
  address: string | null;
}

interface LiveItem {
  id: string;
  type: string;
  title: string;
  description: string | null;
  day_number: number;
  start_time: string | null;
  end_time: string | null;
  price: number;
  maps_url: string | null;
  partner: PartnerInfo | null;
}

interface LiveItineraryProps {
  packageId: string;
  destinationName: string;
  startDate: string;
  endDate: string;
  items: LiveItem[];
}

type ItemStatus = 'pending' | 'done' | 'skipped' | 'issue';

const TYPE_ICONS: Record<string, string> = {
  transfer: '🚗',
  hospedagem: '🏨',
  passeio: '🧭',
  experiencia: '✨',
  alimentacao: '🍽️',
  seguro: '🛡️',
};

const STATUS_CONFIG: Record<ItemStatus, { icon: typeof CheckCircle2; label: string; color: string }> = {
  pending: { icon: Clock, label: 'Pendente', color: 'text-sand-400' },
  done: { icon: CheckCircle2, label: 'Feito', color: 'text-green-500' },
  skipped: { icon: SkipForward, label: 'Pulou', color: 'text-amber-500' },
  issue: { icon: AlertTriangle, label: 'Problema', color: 'text-red-500' },
};

export function LiveItinerary({ packageId: _packageId, destinationName, startDate, endDate, items }: LiveItineraryProps) {
  const totalDays = Math.max(
    ...items.map((i) => i.day_number),
    Math.ceil((new Date(endDate).getTime() - new Date(startDate).getTime()) / 86400000),
  );

  // Calculate current day based on trip dates
  const now = new Date();
  const tripStart = new Date(startDate + 'T00:00:00');
  const rawCurrentDay = Math.floor((now.getTime() - tripStart.getTime()) / 86400000) + 1;
  const autoDay = Math.max(1, Math.min(rawCurrentDay, totalDays));

  const [selectedDay, setSelectedDay] = useState(autoDay);
  const [statuses, setStatuses] = useState<Record<string, ItemStatus>>({});

  const dayItems = useMemo(
    () => items.filter((i) => i.day_number === selectedDay),
    [items, selectedDay],
  );

  const dayDate = useMemo(() => {
    const d = new Date(startDate + 'T12:00:00');
    d.setDate(d.getDate() + selectedDay - 1);
    return d.toLocaleDateString('pt-BR', { weekday: 'long', day: '2-digit', month: 'long' });
  }, [startDate, selectedDay]);

  // Find current/next item based on time
  const currentItemId = useMemo(() => {
    const nowTime = `${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}`;
    if (selectedDay !== autoDay) return null;
    for (const item of dayItems) {
      const status = statuses[item.id];
      if (status === 'done' || status === 'skipped') continue;
      if (!item.start_time || item.start_time >= nowTime) return item.id;
      if (item.end_time && item.end_time >= nowTime) return item.id;
    }
    return dayItems[0]?.id ?? null;
  }, [dayItems, selectedDay, autoDay, statuses]);

  const handleStatusChange = (itemId: string, status: ItemStatus) => {
    setStatuses((prev) => ({ ...prev, [itemId]: status }));
  };

  const canPrev = selectedDay > 1;
  const canNext = selectedDay < totalDays;

  return (
    <div className="space-y-4" data-testid="live-itinerary">
      {/* Header */}
      <div>
        <p className="text-xs text-turquoise-600 font-medium">{destinationName}</p>
        <h1 className="text-xl font-bold text-sand-800">Itinerário Ativo</h1>
      </div>

      {/* Day navigation */}
      <div className="flex items-center gap-2" data-testid="day-navigation">
        <Button variant="outline" size="icon" onClick={() => setSelectedDay((d) => d - 1)} disabled={!canPrev} data-testid="prev-day">
          <ChevronLeft className="size-4" />
        </Button>
        <div className="flex-1 text-center">
          <p className="text-sm font-semibold text-sand-800" data-testid="day-label">Dia {selectedDay}</p>
          <p className="text-xs text-sand-400">{dayDate}</p>
        </div>
        <Button variant="outline" size="icon" onClick={() => setSelectedDay((d) => d + 1)} disabled={!canNext} data-testid="next-day">
          <ChevronRight className="size-4" />
        </Button>
      </div>

      {/* Day dots */}
      <div className="flex justify-center gap-1.5" data-testid="day-dots">
        {Array.from({ length: totalDays }, (_, i) => (
          <button
            key={i}
            type="button"
            onClick={() => setSelectedDay(i + 1)}
            className={`size-2 rounded-full transition ${
              i + 1 === selectedDay ? 'bg-turquoise-500 scale-125' : 'bg-sand-200'
            }`}
            aria-label={`Dia ${i + 1}`}
          />
        ))}
      </div>

      {/* Items */}
      <div className="space-y-3" data-testid="day-items">
        {dayItems.length > 0 ? (
          dayItems.map((item) => {
            const status = statuses[item.id] ?? 'pending';
            const isCurrent = item.id === currentItemId;
            const statusConfig = STATUS_CONFIG[status];
            const StatusIcon = statusConfig.icon;

            return (
              <Card
                key={item.id}
                className={`transition ${isCurrent ? 'ring-2 ring-turquoise-500 shadow-md' : ''} ${
                  status === 'done' || status === 'skipped' ? 'opacity-60' : ''
                }`}
                data-testid={`live-item-${item.id}`}
              >
                <CardContent className="pt-4">
                  <div className="flex items-start gap-3">
                    {/* Icon + time */}
                    <div className="text-center">
                      <span className="text-lg">{TYPE_ICONS[item.type] ?? '📌'}</span>
                      {item.start_time && (
                        <p className="mt-1 text-[10px] font-medium text-sand-500">{item.start_time}</p>
                      )}
                    </div>

                    {/* Content */}
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center gap-2">
                        <h3 className={`text-sm font-semibold ${status === 'done' ? 'text-sand-400 line-through' : 'text-sand-800'}`}>
                          {item.title}
                        </h3>
                        {isCurrent && status === 'pending' && (
                          <span className="rounded-full bg-turquoise-100 px-2 py-0.5 text-[10px] font-medium text-turquoise-700" data-testid="current-badge">
                            Agora
                          </span>
                        )}
                      </div>

                      {item.description && (
                        <p className="mt-0.5 text-xs text-sand-400">{item.description}</p>
                      )}

                      {/* Partner info */}
                      {item.partner && (
                        <p className="mt-1 text-xs text-sand-400">
                          <MapPin className="inline size-3" /> {item.partner.name}
                          {item.partner.phone && ` · ${item.partner.phone}`}
                        </p>
                      )}

                      {/* Time range */}
                      {item.start_time && item.end_time && (
                        <p className="mt-1 text-[10px] text-sand-300">
                          {item.start_time} — {item.end_time}
                        </p>
                      )}

                      {/* Actions */}
                      <div className="mt-2 flex items-center gap-2">
                        {/* Maps */}
                        {item.maps_url && (
                          <a href={item.maps_url} target="_blank" rel="noopener noreferrer">
                            <Button variant="outline" size="sm" className="h-7 gap-1 text-xs" data-testid={`maps-${item.id}`}>
                              <Navigation className="size-3" />
                              Maps
                            </Button>
                          </a>
                        )}

                        {/* Status buttons */}
                        <div className="ml-auto flex gap-1">
                          {status === 'pending' && (
                            <>
                              <Button
                                variant="ghost" size="sm" className="h-7 gap-1 text-xs text-green-600"
                                onClick={() => handleStatusChange(item.id, 'done')}
                                data-testid={`mark-done-${item.id}`}
                              >
                                <CheckCircle2 className="size-3" /> Feito
                              </Button>
                              <Button
                                variant="ghost" size="sm" className="h-7 gap-1 text-xs text-amber-500"
                                onClick={() => handleStatusChange(item.id, 'skipped')}
                                data-testid={`mark-skip-${item.id}`}
                              >
                                <SkipForward className="size-3" /> Pular
                              </Button>
                              <Button
                                variant="ghost" size="sm" className="h-7 gap-1 text-xs text-red-500"
                                onClick={() => handleStatusChange(item.id, 'issue')}
                                data-testid={`mark-issue-${item.id}`}
                              >
                                <AlertTriangle className="size-3" /> Problema
                              </Button>
                            </>
                          )}
                          {status !== 'pending' && (
                            <span className={`flex items-center gap-1 text-xs ${statusConfig.color}`} data-testid={`status-${item.id}`}>
                              <StatusIcon className="size-3" />
                              {statusConfig.label}
                            </span>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            );
          })
        ) : (
          <Card>
            <CardContent className="py-8 text-center text-sm text-sand-400" data-testid="empty-day">
              Dia livre — aproveite para explorar! 🌴
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}
