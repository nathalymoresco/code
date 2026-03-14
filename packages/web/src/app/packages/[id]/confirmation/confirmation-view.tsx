'use client';

import { CheckCircle2, Clock, AlertTriangle, MapPin, Calendar, Users } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import Link from 'next/link';

interface PaymentInfo {
  id: string;
  status: string;
  method: string;
  amount: number;
  installments: number;
  created_at: string;
}

interface ConfirmationViewProps {
  packageId: string;
  destinationName: string;
  startDate: string;
  endDate: string;
  numTravelers: number;
  totalPrice: number;
  packageStatus: string;
  payment: PaymentInfo | null;
}

const METHOD_LABELS: Record<string, string> = {
  pix: 'Pix',
  credit_card: 'Cartão de Crédito',
  boleto: 'Boleto Bancário',
};

const STATUS_CONFIG: Record<string, { icon: typeof CheckCircle2; color: string; title: string; message: string }> = {
  confirmed: {
    icon: CheckCircle2,
    color: 'text-green-500',
    title: 'Pagamento Confirmado!',
    message: 'Seu pacote está confirmado. Você receberá o itinerário completo por e-mail.',
  },
  pending: {
    icon: Clock,
    color: 'text-amber-500',
    title: 'Aguardando Pagamento',
    message: 'Seu pagamento está sendo processado. Assim que confirmado, você receberá uma notificação.',
  },
  overdue: {
    icon: AlertTriangle,
    color: 'text-red-500',
    title: 'Pagamento Vencido',
    message: 'O prazo de pagamento expirou. Gere uma nova cobrança para continuar.',
  },
};

export function ConfirmationView({
  packageId,
  destinationName,
  startDate,
  endDate,
  numTravelers,
  totalPrice: _totalPrice,
  packageStatus: _packageStatus,
  payment,
}: ConfirmationViewProps) {
  const paymentStatus = payment?.status ?? 'pending';
  const config = STATUS_CONFIG[paymentStatus] ?? STATUS_CONFIG.pending!;
  const Icon = config.icon;

  const formatDate = (d: string) =>
    new Date(d + 'T12:00:00').toLocaleDateString('pt-BR', { day: '2-digit', month: 'short' });

  return (
    <div className="space-y-6" data-testid="confirmation-view">
      {/* Status hero */}
      <div className="text-center">
        <Icon className={`mx-auto size-16 ${config.color}`} data-testid="status-icon" />
        <h1 className="mt-4 text-2xl font-bold text-sand-800" data-testid="status-title">
          {config.title}
        </h1>
        <p className="mt-2 text-sm text-sand-500">{config.message}</p>
      </div>

      {/* Trip summary */}
      <Card>
        <CardContent className="space-y-3 pt-4">
          <div className="flex items-center gap-2 text-sand-700">
            <MapPin className="size-4 text-turquoise-600" />
            <span className="font-medium">{destinationName}</span>
          </div>
          <div className="flex items-center gap-2 text-sm text-sand-500">
            <Calendar className="size-4" />
            <span>{formatDate(startDate)} — {formatDate(endDate)}</span>
          </div>
          <div className="flex items-center gap-2 text-sm text-sand-500">
            <Users className="size-4" />
            <span>{numTravelers} viajante{numTravelers > 1 ? 's' : ''}</span>
          </div>
        </CardContent>
      </Card>

      {/* Payment details */}
      {payment && (
        <Card>
          <CardContent className="space-y-2 pt-4 text-sm" data-testid="payment-details">
            <div className="flex justify-between">
              <span className="text-sand-500">Forma de pagamento</span>
              <span className="text-sand-700">{METHOD_LABELS[payment.method] ?? payment.method}</span>
            </div>
            {payment.method === 'credit_card' && payment.installments > 1 && (
              <div className="flex justify-between">
                <span className="text-sand-500">Parcelas</span>
                <span className="text-sand-700">
                  {payment.installments}x de R$ {(payment.amount / payment.installments).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                </span>
              </div>
            )}
            <div className="flex justify-between border-t border-sand-100 pt-2 font-medium">
              <span className="text-sand-600">Total</span>
              <span className="text-sand-800">
                R$ {payment.amount.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
              </span>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Escrow notice */}
      <p className="text-center text-xs text-sand-400" role="note" data-testid="escrow-notice">
        Seu pagamento fica protegido em escrow até a conclusão da viagem.
      </p>

      {/* Actions */}
      <div className="space-y-3">
        <Link href={`/packages/${packageId}`} className="block">
          <Button className="w-full bg-turquoise-600 hover:bg-turquoise-700">
            Ver meu pacote
          </Button>
        </Link>
        <Link href="/destinations" className="block">
          <Button variant="outline" className="w-full">
            Explorar mais destinos
          </Button>
        </Link>
      </div>
    </div>
  );
}
