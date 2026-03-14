'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { CreditCard, QrCode, FileText, Loader2, Copy, Check } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import type { PaymentMethod } from '@travelmatch/shared';

interface ExistingPayment {
  id: string;
  status: string;
  method: string;
  pix_qr_code: string | null;
  pix_copy_paste: string | null;
  pix_expiration: string | null;
  asaas_invoice_url: string | null;
}

interface CheckoutFormProps {
  packageId: string;
  totalPrice: number;
  userEmail: string;
  existingPayment: ExistingPayment | null;
}

const METHODS: { value: PaymentMethod; label: string; icon: typeof QrCode; description: string }[] = [
  { value: 'pix', label: 'Pix', icon: QrCode, description: 'Aprovação instantânea · Válido por 30 min' },
  { value: 'credit_card', label: 'Cartão de Crédito', icon: CreditCard, description: 'Até 12x · Aprovação imediata' },
  { value: 'boleto', label: 'Boleto Bancário', icon: FileText, description: 'Compensação em até 3 dias úteis' },
];

const INSTALLMENT_OPTIONS = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12];

export function CheckoutForm({ packageId, totalPrice, userEmail, existingPayment }: CheckoutFormProps) {
  const router = useRouter();
  const [method, setMethod] = useState<PaymentMethod>('pix');
  const [installments, setInstallments] = useState(1);
  const [name, setName] = useState('');
  const [cpf, setCpf] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [pixData, setPixData] = useState<{ qr_code: string; copy_paste: string; expiration: string } | null>(null);
  const [copied, setCopied] = useState(false);

  // If existing pending payment with pix data, show it
  if (existingPayment && existingPayment.pix_copy_paste) {
    return (
      <PixDisplay
        qrCode={existingPayment.pix_qr_code}
        copyPaste={existingPayment.pix_copy_paste}
        expiration={existingPayment.pix_expiration}
        invoiceUrl={existingPayment.asaas_invoice_url}
      />
    );
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      const res = await fetch('/api/payments/create', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          package_id: packageId,
          method,
          installments: method === 'credit_card' ? installments : 1,
          customer: { name, email: userEmail, cpf },
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data.error ?? 'Erro ao processar pagamento');
        return;
      }

      if (method === 'pix' && data.pix) {
        setPixData(data.pix);
      } else if (data.invoice_url) {
        window.open(data.invoice_url, '_blank');
        router.push(`/packages/${packageId}/confirmation`);
      } else {
        router.push(`/packages/${packageId}/confirmation`);
      }
    } catch {
      setError('Erro de conexão. Tente novamente.');
    } finally {
      setLoading(false);
    }
  };

  const handleCopyPix = async (text: string) => {
    await navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  if (pixData) {
    return (
      <PixDisplay
        qrCode={pixData.qr_code}
        copyPaste={pixData.copy_paste}
        expiration={pixData.expiration}
        invoiceUrl={null}
      />
    );
  }

  return (
    <form onSubmit={handleSubmit} className="mt-6 space-y-6" data-testid="checkout-form">
      {/* Total */}
      <Card>
        <CardContent className="flex items-baseline justify-between pt-4">
          <span className="text-sand-600">Total a pagar</span>
          <span className="text-2xl font-bold text-sand-800" data-testid="checkout-total">
            R$ {totalPrice.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
          </span>
        </CardContent>
      </Card>

      {/* Payment method selection */}
      <div className="space-y-3">
        <h2 className="text-sm font-medium text-sand-700">Forma de pagamento</h2>
        <div className="grid gap-3" data-testid="payment-methods">
          {METHODS.map((m) => {
            const Icon = m.icon;
            const isSelected = method === m.value;
            return (
              <button
                key={m.value}
                type="button"
                onClick={() => { setMethod(m.value); if (m.value !== 'credit_card') setInstallments(1); }}
                className={`flex items-center gap-3 rounded-xl border-2 p-4 text-left transition ${
                  isSelected
                    ? 'border-turquoise-500 bg-turquoise-50'
                    : 'border-sand-200 hover:border-sand-300'
                }`}
                data-testid={`method-${m.value}`}
              >
                <Icon className={`size-5 ${isSelected ? 'text-turquoise-600' : 'text-sand-400'}`} />
                <div>
                  <p className={`font-medium ${isSelected ? 'text-turquoise-700' : 'text-sand-700'}`}>{m.label}</p>
                  <p className="text-xs text-sand-400">{m.description}</p>
                </div>
              </button>
            );
          })}
        </div>
      </div>

      {/* Installments for credit card */}
      {method === 'credit_card' && (
        <div className="space-y-2" data-testid="installments-section">
          <label className="text-sm font-medium text-sand-700">Parcelas</label>
          <select
            value={installments}
            onChange={(e) => setInstallments(Number(e.target.value))}
            className="w-full rounded-lg border border-sand-200 bg-white px-3 py-2 text-sm text-sand-700"
            data-testid="installments-select"
          >
            {INSTALLMENT_OPTIONS.map((n) => (
              <option key={n} value={n}>
                {n}x de R$ {(totalPrice / n).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                {n === 1 ? ' (à vista)' : ''}
              </option>
            ))}
          </select>
        </div>
      )}

      {/* Customer info */}
      <div className="space-y-3">
        <h2 className="text-sm font-medium text-sand-700">Seus dados</h2>
        <input
          type="text"
          placeholder="Nome completo"
          value={name}
          onChange={(e) => setName(e.target.value)}
          required
          className="w-full rounded-lg border border-sand-200 px-3 py-2 text-sm text-sand-700 placeholder:text-sand-300"
          data-testid="input-name"
        />
        <input
          type="text"
          placeholder="CPF"
          value={cpf}
          onChange={(e) => setCpf(e.target.value)}
          required
          className="w-full rounded-lg border border-sand-200 px-3 py-2 text-sm text-sand-700 placeholder:text-sand-300"
          data-testid="input-cpf"
        />
      </div>

      {/* Error */}
      {error && (
        <p className="text-sm text-red-500" data-testid="checkout-error">{error}</p>
      )}

      {/* Submit */}
      <Button
        type="submit"
        className="w-full bg-turquoise-600 hover:bg-turquoise-700"
        disabled={loading || !name || !cpf}
        data-testid="checkout-submit"
      >
        {loading ? (
          <Loader2 className="mr-2 size-4 animate-spin" />
        ) : null}
        {loading ? 'Processando...' : `Pagar R$ ${totalPrice.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}`}
      </Button>

      <p className="text-center text-[10px] text-sand-400">
        Pagamento seguro processado por Asaas. Seu dinheiro fica protegido até a viagem.
      </p>
    </form>
  );

  function PixDisplay({
    qrCode,
    copyPaste,
    expiration,
    invoiceUrl,
  }: {
    qrCode: string | null;
    copyPaste: string | null;
    expiration: string | null;
    invoiceUrl: string | null;
  }) {
    return (
      <div className="mt-6 space-y-4" data-testid="pix-display">
        <Card>
          <CardContent className="space-y-4 pt-4 text-center">
            <h2 className="text-lg font-bold text-sand-800">Pague com Pix</h2>
            {qrCode && (
              <div className="mx-auto w-48">
                <img
                  src={`data:image/png;base64,${qrCode}`}
                  alt="QR Code Pix"
                  className="w-full rounded-lg"
                  data-testid="pix-qr"
                />
              </div>
            )}
            {copyPaste && (
              <div className="space-y-2">
                <p className="text-xs text-sand-500">Ou copie o código:</p>
                <div className="flex items-center gap-2 rounded-lg bg-sand-50 p-3">
                  <code className="flex-1 truncate text-xs text-sand-600" data-testid="pix-code">
                    {copyPaste}
                  </code>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => handleCopyPix(copyPaste)}
                    data-testid="pix-copy"
                  >
                    {copied ? <Check className="size-4 text-green-500" /> : <Copy className="size-4 text-sand-400" />}
                  </Button>
                </div>
              </div>
            )}
            {expiration && (
              <p className="text-xs text-sand-400" data-testid="pix-expiration">
                Válido até {new Date(expiration).toLocaleString('pt-BR')}
              </p>
            )}
            {invoiceUrl && (
              <a href={invoiceUrl} target="_blank" rel="noopener noreferrer" className="text-sm text-turquoise-600 underline">
                Ver fatura completa
              </a>
            )}
          </CardContent>
        </Card>
        <Button
          className="w-full"
          variant="outline"
          onClick={() => router.push(`/packages/${packageId}/confirmation`)}
        >
          Já paguei — verificar status
        </Button>
      </div>
    );
  }
}
