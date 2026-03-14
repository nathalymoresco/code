'use client';

import { Shield, Lock, RefreshCcw, Headphones } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';

const GUARANTEES = [
  {
    icon: Lock,
    title: 'Pagamento Protegido',
    description: 'Seu dinheiro fica em escrow até a viagem ser concluída.',
  },
  {
    icon: Shield,
    title: 'Seguro Incluso',
    description: 'Cancelamento, emergência médica e bagagem cobertos.',
  },
  {
    icon: RefreshCcw,
    title: 'Reembolso Garantido',
    description: 'Cancelamento gratuito até 7 dias antes da viagem.',
  },
  {
    icon: Headphones,
    title: 'Concierge 24h',
    description: 'Suporte por WhatsApp antes, durante e após a viagem.',
  },
];

export function Guarantees() {
  return (
    <Card data-testid="guarantees">
      <CardContent className="pt-4">
        <h3 className="mb-3 text-sm font-semibold text-sand-800">Garantias TravelMatch</h3>
        <div className="grid grid-cols-2 gap-3">
          {GUARANTEES.map((g) => {
            const Icon = g.icon;
            return (
              <div key={g.title} className="space-y-1 rounded-lg bg-sand-50 p-3">
                <Icon className="size-4 text-turquoise-600" />
                <p className="text-xs font-medium text-sand-700">{g.title}</p>
                <p className="text-[10px] text-sand-400">{g.description}</p>
              </div>
            );
          })}
        </div>
      </CardContent>
    </Card>
  );
}
