'use client';

import { useEffect, useState } from 'react';
import { Cloud, Droplets, Thermometer, Sun } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';

interface MonthlyWeather {
  month: number;
  avg_temp_c: number;
  avg_rain_mm: number | null;
  avg_humidity: number;
  condition: string;
  is_high_season: boolean;
}

interface ClimateWidgetProps {
  destinationId: string;
  destinationName: string;
}

const MONTH_LABELS = ['Jan', 'Fev', 'Mar', 'Abr', 'Mai', 'Jun', 'Jul', 'Ago', 'Set', 'Out', 'Nov', 'Dez'];

const CONDITION_ICONS: Record<string, typeof Sun> = {
  ensolarado: Sun,
  chuvoso: Droplets,
  nublado: Cloud,
};

export function ClimateWidget({ destinationId, destinationName }: ClimateWidgetProps) {
  const [weather, setWeather] = useState<MonthlyWeather[] | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchWeather() {
      try {
        const res = await fetch(`/api/weather/${destinationId}`);
        if (!res.ok) return;
        const data = await res.json();
        setWeather(data.weather);
      } catch {
        // silently fail — widget is non-critical
      } finally {
        setLoading(false);
      }
    }
    fetchWeather();
  }, [destinationId]);

  if (loading) {
    return (
      <Card>
        <CardContent className="pt-6">
          <div className="animate-pulse space-y-3">
            <div className="h-5 w-32 rounded bg-sand-100" />
            <div className="h-20 rounded bg-sand-100" />
          </div>
        </CardContent>
      </Card>
    );
  }

  if (!weather || weather.length === 0) return null;

  const currentMonth = new Date().getMonth() + 1;
  const currentWeather = weather.find((w) => w.month === currentMonth);

  // Find best month (highest temp with lowest rain among high season)
  const bestMonth = weather
    .filter((w) => w.is_high_season)
    .sort((a, b) => {
      const rainA = a.avg_rain_mm ?? 0;
      const rainB = b.avg_rain_mm ?? 0;
      return rainA - rainB || b.avg_temp_c - a.avg_temp_c;
    })[0];

  // Unfavorable alert: current month has heavy rain
  const isUnfavorable = currentWeather &&
    currentWeather.avg_rain_mm !== null &&
    currentWeather.avg_rain_mm > 150 &&
    !currentWeather.is_high_season;

  return (
    <Card data-testid="climate-widget">
      <CardContent className="space-y-4 pt-6">
        <h3 className="font-semibold text-sand-800">Clima em {destinationName}</h3>

        {/* Current weather */}
        {currentWeather && (
          <div className="flex items-center gap-4 rounded-lg bg-sand-50 p-3">
            <Thermometer className="size-8 text-coral-500" />
            <div>
              <p className="text-lg font-bold text-sand-800">{currentWeather.avg_temp_c}°C</p>
              <p className="text-xs capitalize text-sand-500">
                {MONTH_LABELS[currentMonth - 1]} · {currentWeather.condition}
              </p>
            </div>
            {currentWeather.avg_humidity > 0 && (
              <div className="ml-auto text-right">
                <p className="text-sm text-sand-600">{currentWeather.avg_humidity}%</p>
                <p className="text-[10px] text-sand-400">umidade</p>
              </div>
            )}
          </div>
        )}

        {/* Unfavorable alert */}
        {isUnfavorable && (
          <div className="rounded-lg bg-amber-50 border border-amber-200 p-3" data-testid="climate-alert">
            <p className="text-xs text-amber-700">
              ⚠️ Período chuvoso em {destinationName}. Considere viajar em{' '}
              {bestMonth ? MONTH_LABELS[bestMonth.month - 1] : 'outra época'} para melhor clima.
            </p>
          </div>
        )}

        {/* Monthly temperature bar chart */}
        <div className="space-y-1">
          <p className="text-xs font-medium text-sand-500">Temperatura média mensal</p>
          <div className="flex items-end gap-[3px]" data-testid="temp-chart">
            {weather.map((w) => {
              const maxTemp = Math.max(...weather.map((x) => x.avg_temp_c));
              const minTemp = Math.min(...weather.map((x) => x.avg_temp_c));
              const range = maxTemp - minTemp || 1;
              const height = 20 + ((w.avg_temp_c - minTemp) / range) * 40;
              const isCurrent = w.month === currentMonth;
              const ConditionIcon = CONDITION_ICONS[w.condition] ?? Cloud;

              return (
                <div key={w.month} className="flex flex-1 flex-col items-center gap-1">
                  <ConditionIcon className={`size-3 ${w.is_high_season ? 'text-turquoise-500' : 'text-sand-300'}`} />
                  <div
                    className={`w-full rounded-t transition ${
                      isCurrent
                        ? 'bg-coral-400'
                        : w.is_high_season
                          ? 'bg-turquoise-400'
                          : 'bg-sand-200'
                    }`}
                    style={{ height: `${height}px` }}
                    title={`${MONTH_LABELS[w.month - 1]}: ${w.avg_temp_c}°C`}
                  />
                  <span className={`text-[9px] ${isCurrent ? 'font-bold text-coral-600' : 'text-sand-400'}`}>
                    {MONTH_LABELS[w.month - 1]}
                  </span>
                </div>
              );
            })}
          </div>
          <div className="flex justify-between text-[9px] text-sand-400 pt-1">
            <span className="flex items-center gap-1">
              <span className="inline-block size-2 rounded-sm bg-turquoise-400" /> Alta temporada
            </span>
            <span className="flex items-center gap-1">
              <span className="inline-block size-2 rounded-sm bg-coral-400" /> Mês atual
            </span>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
