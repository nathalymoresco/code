'use client';

import { useState, useMemo, useCallback } from 'react';
import { RotateCcw, Minus, Calendar, Users, Sparkles } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import type { PackageItem, ComfortLevel } from '@travelmatch/shared';

interface BudgetSimulatorProps {
  items: PackageItem[];
  startDate: string;
  endDate: string;
  numTravelers: number;
  comfortLevel: ComfortLevel;
  markupPercentage: number;
  onItemRemove: (itemId: string) => void;
  onRestore: () => void;
}

const COMFORT_LABELS: Record<ComfortLevel, string> = {
  economico: 'Econômico',
  conforto: 'Conforto',
  premium: 'Premium',
};

const TYPE_LABELS: Record<string, string> = {
  transfer: 'Transfers',
  hospedagem: 'Hospedagem',
  passeio: 'Passeios',
  experiencia: 'Experiências',
  alimentacao: 'Alimentação',
  seguro: 'Seguro',
};

export function BudgetSimulator({
  items,
  startDate,
  endDate,
  numTravelers,
  comfortLevel,
  markupPercentage,
  onItemRemove,
  onRestore,
}: BudgetSimulatorProps) {
  const [removedIds, setRemovedIds] = useState<Set<string>>(new Set());

  const activeItems = useMemo(
    () => items.filter((i) => !removedIds.has(i.id)),
    [items, removedIds],
  );

  const handleRemove = useCallback(
    (id: string) => {
      setRemovedIds((prev) => new Set([...prev, id]));
      onItemRemove(id);
    },
    [onItemRemove],
  );

  const handleRestore = useCallback(() => {
    setRemovedIds(new Set());
    onRestore();
  }, [onRestore]);

  // Price breakdown
  const breakdown = useMemo(() => {
    const groups: Record<string, number> = {};
    for (const item of activeItems) {
      groups[item.type] = (groups[item.type] ?? 0) + item.price;
    }
    return groups;
  }, [activeItems]);

  const subtotal = useMemo(
    () => activeItems.reduce((s, i) => s + i.price, 0),
    [activeItems],
  );

  const markup = Math.round(subtotal * (markupPercentage / 100) * 100) / 100;
  const total = Math.round((subtotal + markup) * 100) / 100;

  const totalDays = Math.round(
    (new Date(endDate).getTime() - new Date(startDate).getTime()) / 86400000,
  );

  const perPerson = numTravelers > 0 ? Math.round((total / numTravelers) * 100) / 100 : total;
  const perDay = totalDays > 0 ? Math.round((total / totalDays) * 100) / 100 : total;

  const hasChanges = removedIds.size > 0;
  const removableItems = activeItems.filter((i) => i.is_removable);

  return (
    <div className="space-y-4" data-testid="budget-simulator">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-bold text-sand-800">Simulador de Orçamento</h2>
        {hasChanges && (
          <Button variant="ghost" size="sm" onClick={handleRestore} className="gap-1 text-sand-500">
            <RotateCcw className="size-3.5" />
            Restaurar original
          </Button>
        )}
      </div>

      {/* Quick stats */}
      <div className="grid grid-cols-3 gap-3">
        <Card>
          <CardContent className="p-3 text-center">
            <Calendar className="mx-auto size-4 text-turquoise-600" />
            <p className="mt-1 text-lg font-bold text-sand-800">{totalDays}</p>
            <p className="text-[10px] text-sand-400">dias</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-3 text-center">
            <Users className="mx-auto size-4 text-turquoise-600" />
            <p className="mt-1 text-lg font-bold text-sand-800">{numTravelers}</p>
            <p className="text-[10px] text-sand-400">viajante{numTravelers > 1 ? 's' : ''}</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-3 text-center">
            <Sparkles className="mx-auto size-4 text-turquoise-600" />
            <p className="mt-1 text-lg font-bold text-sand-800">{COMFORT_LABELS[comfortLevel]}</p>
            <p className="text-[10px] text-sand-400">conforto</p>
          </CardContent>
        </Card>
      </div>

      {/* Price breakdown */}
      <Card>
        <CardContent className="space-y-2 pt-4 text-sm" data-testid="budget-breakdown">
          {Object.entries(breakdown).map(([type, amount]) => (
            <div key={type} className="flex justify-between text-sand-600">
              <span>{TYPE_LABELS[type] ?? type}</span>
              <span>R$ {amount.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</span>
            </div>
          ))}
          <div className="flex justify-between border-t border-sand-200 pt-2 text-sand-500">
            <span>Taxa de serviço ({markupPercentage}%)</span>
            <span>R$ {markup.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</span>
          </div>
          <div className="flex justify-between border-t border-sand-200 pt-2 text-lg font-bold text-sand-800">
            <span>Total</span>
            <span>R$ {total.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</span>
          </div>
          <div className="flex justify-between text-xs text-sand-400">
            <span>R$ {perPerson.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}/pessoa</span>
            <span>R$ {perDay.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}/dia</span>
          </div>
        </CardContent>
      </Card>

      {/* Removable items */}
      {removableItems.length > 0 && (
        <Card>
          <CardContent className="pt-4">
            <h3 className="mb-3 text-sm font-medium text-sand-700">Ajustar passeios</h3>
            <div className="space-y-2">
              {removableItems.map((item) => (
                <div
                  key={item.id}
                  className="flex items-center justify-between rounded-lg bg-sand-50 p-2"
                >
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-sm text-sand-700">{item.title}</p>
                    <p className="text-xs text-sand-400">
                      Dia {item.day_number} · R$ {item.price.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                    </p>
                  </div>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="shrink-0"
                    onClick={() => handleRemove(item.id)}
                    title="Remover"
                  >
                    <Minus className="size-4 text-red-400" />
                  </Button>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Removed items count */}
      {removedIds.size > 0 && (
        <p className="text-center text-xs text-sand-400" data-testid="removed-count">
          {removedIds.size} item{removedIds.size > 1 ? 's' : ''} removido{removedIds.size > 1 ? 's' : ''} — dias livres adicionados
        </p>
      )}
    </div>
  );
}
