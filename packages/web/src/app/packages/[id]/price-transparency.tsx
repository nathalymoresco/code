'use client';

import { useState } from 'react';
import { Shield, Info, ChevronDown, ChevronUp } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import type { PackageItem } from '@travelmatch/shared';

interface PriceTransparencyProps {
  items: PackageItem[];
  markupPercentage: number;
  insuranceIncluded: boolean;
}

const TYPE_LABELS: Record<string, string> = {
  transfer: 'Transfers',
  hospedagem: 'Hospedagem',
  passeio: 'Passeios',
  experiencia: 'Experiências',
  alimentacao: 'Alimentação',
  seguro: 'Seguro Viagem',
};

const TYPE_TOOLTIPS: Record<string, string> = {
  transfer: 'Transporte de ida e volta ao destino (aeroporto, rodoviária)',
  hospedagem: 'Acomodação selecionada para todas as noites da viagem',
  passeio: 'Atividades e passeios incluídos no roteiro',
  experiencia: 'Experiências exclusivas e imersivas no destino',
  alimentacao: 'Refeições inclusas (almoços, jantares típicos)',
  seguro: 'Seguro viagem básico: cancelamento, emergência médica e bagagem',
};

export function PriceTransparency({ items, markupPercentage, insuranceIncluded }: PriceTransparencyProps) {
  const [expandedType, setExpandedType] = useState<string | null>(null);
  const [showTooltip, setShowTooltip] = useState<string | null>(null);

  // Group items by type
  const groups: Record<string, { items: PackageItem[]; total: number }> = {};
  for (const item of items) {
    if (!groups[item.type]) {
      groups[item.type] = { items: [], total: 0 };
    }
    groups[item.type]!.items.push(item);
    groups[item.type]!.total += item.price;
  }

  const subtotal = items.reduce((s, i) => s + i.price, 0);
  const markup = Math.round(subtotal * (markupPercentage / 100) * 100) / 100;
  const total = Math.round((subtotal + markup) * 100) / 100;

  return (
    <Card data-testid="price-transparency">
      <CardContent className="space-y-3 pt-4">
        <h3 className="flex items-center gap-2 text-sm font-semibold text-sand-800">
          <Shield className="size-4 text-turquoise-600" />
          Transparência de Preço
        </h3>

        {/* Breakdown by type */}
        <div className="space-y-1" data-testid="price-breakdown-detail">
          {Object.entries(groups).map(([type, group]) => (
            <div key={type}>
              <button
                type="button"
                className="flex w-full items-center justify-between rounded-lg px-2 py-1.5 text-sm hover:bg-sand-50"
                onClick={() => setExpandedType(expandedType === type ? null : type)}
                data-testid={`breakdown-row-${type}`}
              >
                <div className="flex items-center gap-2">
                  <span className="text-sand-600">{TYPE_LABELS[type] ?? type}</span>
                  <span
                    role="button"
                    tabIndex={0}
                    className="text-sand-300 hover:text-sand-500"
                    onClick={(e) => { e.stopPropagation(); setShowTooltip(showTooltip === type ? null : type); }}
                    onKeyDown={(e) => { if (e.key === 'Enter') { e.stopPropagation(); setShowTooltip(showTooltip === type ? null : type); } }}
                    aria-label={`Info sobre ${TYPE_LABELS[type] ?? type}`}
                    data-testid={`tooltip-trigger-${type}`}
                  >
                    <Info className="size-3" />
                  </span>
                </div>
                <div className="flex items-center gap-1">
                  <span className="text-sand-700">
                    R$ {group.total.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                  </span>
                  {group.items.length > 1 && (
                    expandedType === type
                      ? <ChevronUp className="size-3 text-sand-400" />
                      : <ChevronDown className="size-3 text-sand-400" />
                  )}
                </div>
              </button>

              {/* Tooltip */}
              {showTooltip === type && (
                <p className="mx-2 mb-1 rounded bg-sand-800 px-2 py-1 text-[10px] text-white" data-testid={`tooltip-${type}`}>
                  {TYPE_TOOLTIPS[type] ?? 'Item do pacote'}
                </p>
              )}

              {/* Expanded items */}
              {expandedType === type && group.items.length > 1 && (
                <div className="ml-4 space-y-0.5 border-l-2 border-sand-100 pl-3" data-testid={`expanded-${type}`}>
                  {group.items.map((item) => (
                    <div key={item.id} className="flex justify-between text-xs text-sand-400">
                      <span className="truncate">{item.title}</span>
                      <span>R$ {item.price.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</span>
                    </div>
                  ))}
                </div>
              )}
            </div>
          ))}
        </div>

        {/* Markup */}
        <div className="flex items-center justify-between border-t border-sand-100 px-2 pt-2 text-sm">
          <div className="flex items-center gap-2">
            <span className="text-sand-500">Taxa de serviço ({markupPercentage}%)</span>
            <button
              type="button"
              className="text-sand-300 hover:text-sand-500"
              onClick={() => setShowTooltip(showTooltip === 'markup' ? null : 'markup')}
              data-testid="tooltip-trigger-markup"
            >
              <Info className="size-3" />
            </button>
          </div>
          <span className="text-sand-600">
            R$ {markup.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
          </span>
        </div>
        {showTooltip === 'markup' && (
          <p className="mx-2 rounded bg-sand-800 px-2 py-1 text-[10px] text-white" data-testid="tooltip-markup">
            Cobre curadoria, suporte concierge e garantias TravelMatch
          </p>
        )}

        {/* Total */}
        <div className="flex justify-between border-t border-sand-200 px-2 pt-2 text-lg font-bold text-sand-800">
          <span>Total</span>
          <span data-testid="transparency-total">
            R$ {total.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
          </span>
        </div>

        {/* Insurance badge */}
        {insuranceIncluded && (
          <div className="flex items-center gap-2 rounded-lg bg-turquoise-50 px-3 py-2" data-testid="insurance-badge">
            <Shield className="size-4 text-turquoise-600" />
            <div>
              <p className="text-xs font-medium text-turquoise-700">Seguro viagem incluso</p>
              <p className="text-[10px] text-turquoise-500">Cancelamento · Emergência médica · Bagagem</p>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
