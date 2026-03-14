'use client';

import { Plane, Hotel, Compass, UtensilsCrossed, Shield, Car } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import type { Package, PackageItem } from '@travelmatch/shared';

const TYPE_CONFIG: Record<string, { icon: typeof Plane; label: string; color: string }> = {
  transfer: { icon: Car, label: 'Transfers', color: 'text-blue-600 bg-blue-50' },
  hospedagem: { icon: Hotel, label: 'Hospedagem', color: 'text-purple-600 bg-purple-50' },
  passeio: { icon: Compass, label: 'Passeios', color: 'text-turquoise-600 bg-turquoise-50' },
  experiencia: { icon: Compass, label: 'Experiências', color: 'text-coral-600 bg-coral-50' },
  alimentacao: { icon: UtensilsCrossed, label: 'Alimentação', color: 'text-amber-600 bg-amber-50' },
  seguro: { icon: Shield, label: 'Seguro', color: 'text-emerald-600 bg-emerald-50' },
};

interface PackageSummaryProps {
  pkg: Package;
  items: PackageItem[];
  totalDays: number;
}

export function PackageSummary({ pkg, items, totalDays: _totalDays }: PackageSummaryProps) {
  // Group items by type
  const grouped = items.reduce<Record<string, { items: PackageItem[]; total: number }>>((acc, item) => {
    const key = item.type;
    if (!acc[key]) acc[key] = { items: [], total: 0 };
    acc[key].items.push(item);
    acc[key].total += item.price;
    return acc;
  }, {});

  const subtotal = items.reduce((s, i) => s + i.price, 0);
  const markup = pkg.total_price - subtotal;

  return (
    <div className="space-y-4" data-testid="package-summary">
      {/* Category cards */}
      {Object.entries(grouped).map(([type, group]) => {
        const config = TYPE_CONFIG[type] ?? TYPE_CONFIG.passeio!;
        const Icon = config.icon;
        return (
          <Card key={type}>
            <CardContent className="pt-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className={`flex size-10 items-center justify-center rounded-lg ${config.color}`}>
                    <Icon className="size-5" />
                  </div>
                  <div>
                    <h3 className="font-medium text-sand-800">{config.label}</h3>
                    <p className="text-sm text-sand-400">
                      {group.items.length} item{group.items.length > 1 ? 's' : ''}
                    </p>
                  </div>
                </div>
                <span className="font-semibold text-sand-700">
                  R$ {group.total.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                </span>
              </div>
            </CardContent>
          </Card>
        );
      })}

      {/* Price breakdown */}
      <Card className="bg-sand-50">
        <CardContent className="space-y-2 pt-4 text-sm" data-testid="price-breakdown">
          {Object.entries(grouped).map(([type, group]) => {
            const config = TYPE_CONFIG[type] ?? TYPE_CONFIG.passeio!;
            return (
              <div key={type} className="flex justify-between text-sand-600">
                <span>{config.label}</span>
                <span>R$ {group.total.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</span>
              </div>
            );
          })}
          <div className="flex justify-between border-t border-sand-200 pt-2 text-sand-600">
            <span>Taxa de serviço ({pkg.markup_percentage}%)</span>
            <span>R$ {markup.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</span>
          </div>
          <div className="flex justify-between border-t border-sand-200 pt-2 font-bold text-sand-800">
            <span>Total</span>
            <span>R$ {pkg.total_price.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</span>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
