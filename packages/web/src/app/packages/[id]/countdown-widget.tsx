'use client';

import { useState, useEffect } from 'react';
import { Plane, Calendar } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';

interface CountdownWidgetProps {
  startDate: string;
  destinationName: string;
}

interface TimeLeft {
  days: number;
  hours: number;
  minutes: number;
}

function calcTimeLeft(target: Date): TimeLeft | null {
  const diff = target.getTime() - Date.now();
  if (diff <= 0) return null;
  return {
    days: Math.floor(diff / 86400000),
    hours: Math.floor((diff % 86400000) / 3600000),
    minutes: Math.floor((diff % 3600000) / 60000),
  };
}

export function CountdownWidget({ startDate, destinationName }: CountdownWidgetProps) {
  const target = new Date(startDate + 'T00:00:00');
  const [timeLeft, setTimeLeft] = useState<TimeLeft | null>(() => calcTimeLeft(target));

  useEffect(() => {
    const interval = setInterval(() => {
      setTimeLeft(calcTimeLeft(target));
    }, 60000); // Update every minute
    return () => clearInterval(interval);
  }, [startDate]);

  if (!timeLeft) {
    return (
      <Card data-testid="countdown-widget">
        <CardContent className="flex items-center gap-3 py-3">
          <Plane className="size-5 text-turquoise-600" />
          <p className="text-sm font-medium text-turquoise-700">Boa viagem! 🎉</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card data-testid="countdown-widget">
      <CardContent className="pt-4">
        <div className="flex items-center gap-2 text-sm text-sand-500">
          <Calendar className="size-4 text-turquoise-600" />
          <span>Contagem regressiva para {destinationName}</span>
        </div>
        <div className="mt-3 flex justify-center gap-4" data-testid="countdown-values">
          <div className="text-center">
            <p className="text-3xl font-bold text-turquoise-600" data-testid="countdown-days">{timeLeft.days}</p>
            <p className="text-[10px] text-sand-400">dias</p>
          </div>
          <div className="text-center">
            <p className="text-3xl font-bold text-sand-700" data-testid="countdown-hours">{timeLeft.hours}</p>
            <p className="text-[10px] text-sand-400">horas</p>
          </div>
          <div className="text-center">
            <p className="text-3xl font-bold text-sand-700" data-testid="countdown-minutes">{timeLeft.minutes}</p>
            <p className="text-[10px] text-sand-400">min</p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
