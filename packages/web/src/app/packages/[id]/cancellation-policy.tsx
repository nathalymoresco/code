'use client';

import { useState } from 'react';
import { AlertCircle, ChevronDown, ChevronUp, Check } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';

interface CancellationPolicyProps {
  termsAccepted: boolean;
  onTermsChange: (accepted: boolean) => void;
}

const POLICY_TIERS = [
  {
    label: 'Até 7 dias antes',
    refund: '100%',
    description: 'Reembolso integral',
    color: 'text-green-600',
    bg: 'bg-green-50',
  },
  {
    label: '3 a 7 dias antes',
    refund: '50%',
    description: 'Reembolso de 50% do valor',
    color: 'text-amber-600',
    bg: 'bg-amber-50',
  },
  {
    label: 'Menos de 3 dias',
    refund: '0%',
    description: 'Sem reembolso',
    color: 'text-red-600',
    bg: 'bg-red-50',
  },
];

export function CancellationPolicy({ termsAccepted, onTermsChange }: CancellationPolicyProps) {
  const [expanded, setExpanded] = useState(false);

  return (
    <Card data-testid="cancellation-policy">
      <CardContent className="space-y-3 pt-4">
        {/* Header */}
        <button
          type="button"
          className="flex w-full items-center justify-between"
          onClick={() => setExpanded(!expanded)}
          data-testid="policy-toggle"
        >
          <div className="flex items-center gap-2">
            <AlertCircle className="size-4 text-sand-500" />
            <h3 className="text-sm font-semibold text-sand-800">Política de Cancelamento</h3>
          </div>
          {expanded ? <ChevronUp className="size-4 text-sand-400" /> : <ChevronDown className="size-4 text-sand-400" />}
        </button>

        {/* Policy tiers */}
        {expanded && (
          <div className="space-y-2" data-testid="policy-tiers">
            {POLICY_TIERS.map((tier) => (
              <div key={tier.label} className={`flex items-center justify-between rounded-lg ${tier.bg} px-3 py-2`}>
                <div>
                  <p className={`text-xs font-medium ${tier.color}`}>{tier.label}</p>
                  <p className="text-[10px] text-sand-500">{tier.description}</p>
                </div>
                <span className={`text-sm font-bold ${tier.color}`}>{tier.refund}</span>
              </div>
            ))}
          </div>
        )}

        {/* Terms checkbox */}
        <label className="flex cursor-pointer items-start gap-2" data-testid="terms-label">
          <div className="relative mt-0.5">
            <input
              type="checkbox"
              checked={termsAccepted}
              onChange={(e) => onTermsChange(e.target.checked)}
              className="peer sr-only"
              data-testid="terms-checkbox"
            />
            <div className={`flex size-4 items-center justify-center rounded border transition ${
              termsAccepted
                ? 'border-turquoise-500 bg-turquoise-500'
                : 'border-sand-300 bg-white'
            }`}>
              {termsAccepted && <Check className="size-3 text-white" />}
            </div>
          </div>
          <span className="text-xs text-sand-500">
            Li e aceito os{' '}
            <span className="font-medium text-turquoise-600">termos de uso</span>
            {' '}e a{' '}
            <span className="font-medium text-turquoise-600">política de cancelamento</span>.
          </span>
        </label>
      </CardContent>
    </Card>
  );
}
