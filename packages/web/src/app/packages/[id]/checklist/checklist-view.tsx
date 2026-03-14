'use client';

import { useState, useCallback } from 'react';
import { AlertTriangle, Lightbulb, CheckCircle2, Circle, Loader2 } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import Link from 'next/link';
import { Button } from '@/components/ui/button';

interface ChecklistItem {
  id: string;
  package_id: string;
  title: string;
  description: string | null;
  type: string; // 'obrigatorio' | 'recomendado' | 'automatico'
  source: string; // 'system' | 'destination' | 'user'
  is_completed: boolean;
  completed_at: string | null;
  sort_order: number;
}

interface ChecklistViewProps {
  packageId: string;
  destinationName: string;
  items: ChecklistItem[];
  daysUntilTrip: number;
}

const _TYPE_CONFIG: Record<string, { icon: typeof AlertTriangle; label: string; color: string }> = {
  obrigatorio: { icon: AlertTriangle, label: 'Obrigatório', color: 'text-red-500' },
  recomendado: { icon: Lightbulb, label: 'Recomendado', color: 'text-amber-500' },
  automatico: { icon: CheckCircle2, label: 'Automático', color: 'text-green-500' },
};

export function ChecklistView({ packageId, destinationName, items: initialItems, daysUntilTrip }: ChecklistViewProps) {
  const [items, setItems] = useState(initialItems);
  const [loading, setLoading] = useState<string | null>(null);

  const completedCount = items.filter((i) => i.is_completed).length;
  const totalCount = items.length;
  const progress = totalCount > 0 ? Math.round((completedCount / totalCount) * 100) : 0;
  const incompleteRequired = items.filter((i) => i.type === 'obrigatorio' && !i.is_completed);

  const toggleItem = useCallback(async (itemId: string, completed: boolean) => {
    setLoading(itemId);
    try {
      const res = await fetch(`/api/packages/${packageId}/checklist`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ item_id: itemId, is_completed: completed }),
      });
      if (res.ok) {
        setItems((prev) =>
          prev.map((i) =>
            i.id === itemId
              ? { ...i, is_completed: completed, completed_at: completed ? new Date().toISOString() : null }
              : i,
          ),
        );
      }
    } catch {
      // Silent fail — item will remain in previous state
    } finally {
      setLoading(null);
    }
  }, [packageId]);

  // Group by type
  const required = items.filter((i) => i.type === 'obrigatorio');
  const recommended = items.filter((i) => i.type === 'recomendado');
  const automatic = items.filter((i) => i.type === 'automatico');

  return (
    <div className="space-y-6" data-testid="checklist-view">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-sand-800">Checklist Pré-Viagem</h1>
        <p className="mt-1 text-sm text-sand-500">{destinationName}</p>
      </div>

      {/* Progress */}
      <Card>
        <CardContent className="pt-4">
          <div className="flex items-center justify-between text-sm">
            <span className="text-sand-600">{completedCount} de {totalCount} itens</span>
            <span className="font-medium text-turquoise-600" data-testid="progress-percent">{progress}%</span>
          </div>
          <div className="mt-2 h-2 rounded-full bg-sand-100">
            <div
              className="h-2 rounded-full bg-turquoise-500 transition-all"
              style={{ width: `${progress}%` }}
              data-testid="progress-bar"
            />
          </div>
        </CardContent>
      </Card>

      {/* Urgency alert */}
      {daysUntilTrip <= 3 && incompleteRequired.length > 0 && (
        <div className="flex items-center gap-2 rounded-lg bg-red-50 px-4 py-3" data-testid="urgency-alert">
          <AlertTriangle className="size-5 text-red-500" />
          <div>
            <p className="text-sm font-medium text-red-700">
              {incompleteRequired.length} item{incompleteRequired.length > 1 ? 's' : ''} obrigatório{incompleteRequired.length > 1 ? 's' : ''} pendente{incompleteRequired.length > 1 ? 's' : ''}
            </p>
            <p className="text-xs text-red-500">Sua viagem é em {daysUntilTrip} dia{daysUntilTrip !== 1 ? 's' : ''}!</p>
          </div>
        </div>
      )}

      {/* Required items */}
      {required.length > 0 && (
        <ChecklistSection
          title="Obrigatório"
          icon="⚠️"
          items={required}
          loading={loading}
          onToggle={toggleItem}
        />
      )}

      {/* Automatic items */}
      {automatic.length > 0 && (
        <ChecklistSection
          title="Automático"
          icon="✅"
          items={automatic}
          loading={loading}
          onToggle={toggleItem}
        />
      )}

      {/* Recommended items */}
      {recommended.length > 0 && (
        <ChecklistSection
          title="Recomendado"
          icon="💡"
          items={recommended}
          loading={loading}
          onToggle={toggleItem}
        />
      )}

      {/* Back link */}
      <Link href={`/packages/${packageId}`} className="block">
        <Button variant="outline" className="w-full">Voltar ao pacote</Button>
      </Link>
    </div>
  );
}

function ChecklistSection({
  title,
  icon,
  items,
  loading,
  onToggle,
}: {
  title: string;
  icon: string;
  items: ChecklistItem[];
  loading: string | null;
  onToggle: (id: string, completed: boolean) => void;
}) {
  return (
    <Card data-testid={`section-${title.toLowerCase()}`}>
      <CardContent className="pt-4">
        <h2 className="mb-3 text-sm font-semibold text-sand-700">
          {icon} {title}
        </h2>
        <div className="space-y-2">
          {items.map((item) => {
            const isLoading = loading === item.id;
            return (
              <button
                key={item.id}
                type="button"
                className={`flex w-full items-start gap-3 rounded-lg p-2 text-left transition hover:bg-sand-50 ${
                  item.is_completed ? 'opacity-60' : ''
                }`}
                onClick={() => onToggle(item.id, !item.is_completed)}
                disabled={isLoading}
                data-testid={`checklist-item-${item.id}`}
              >
                {isLoading ? (
                  <Loader2 className="mt-0.5 size-4 shrink-0 animate-spin text-sand-400" />
                ) : item.is_completed ? (
                  <CheckCircle2 className="mt-0.5 size-4 shrink-0 text-turquoise-500" data-testid={`check-done-${item.id}`} />
                ) : (
                  <Circle className="mt-0.5 size-4 shrink-0 text-sand-300" data-testid={`check-pending-${item.id}`} />
                )}
                <div className="min-w-0 flex-1">
                  <p className={`text-sm ${item.is_completed ? 'text-sand-400 line-through' : 'text-sand-700'}`}>
                    {item.title}
                  </p>
                  {item.description && (
                    <p className="text-xs text-sand-400">{item.description}</p>
                  )}
                </div>
              </button>
            );
          })}
        </div>
      </CardContent>
    </Card>
  );
}
