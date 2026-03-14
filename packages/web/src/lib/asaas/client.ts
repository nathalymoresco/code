/**
 * Asaas Payment Gateway — typed client
 * Docs: https://docs.asaas.com
 */

const ASAAS_API_URL = process.env.ASAAS_API_URL ?? 'https://sandbox.asaas.com/api/v3';
const ASAAS_API_KEY = process.env.ASAAS_API_KEY ?? '';

interface AsaasCustomer {
  id: string;
  name: string;
  email: string;
  cpfCnpj: string;
}

interface AsaasCustomerInput {
  name: string;
  email: string;
  cpfCnpj: string;
}

type BillingType = 'PIX' | 'CREDIT_CARD' | 'BOLETO';

interface AsaasPaymentInput {
  customer: string;
  billingType: BillingType;
  value: number;
  dueDate: string;
  description?: string;
  installmentCount?: number;
  externalReference?: string;
}

interface AsaasPixQrCode {
  encodedImage: string;
  payload: string;
  expirationDate: string;
}

interface AsaasPaymentResponse {
  id: string;
  status: string;
  invoiceUrl: string;
  bankSlipUrl?: string;
  value: number;
  netValue: number;
  billingType: BillingType;
  dueDate: string;
  externalReference?: string;
}

async function asaasFetch<T>(path: string, options: RequestInit = {}): Promise<T> {
  if (!ASAAS_API_KEY) {
    throw new Error('ASAAS_API_KEY not configured');
  }

  const res = await fetch(`${ASAAS_API_URL}${path}`, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      access_token: ASAAS_API_KEY,
      ...options.headers,
    },
  });

  if (!res.ok) {
    const body = await res.text();
    throw new Error(`Asaas API error ${res.status}: ${body}`);
  }

  return res.json() as Promise<T>;
}

export async function createCustomer(input: AsaasCustomerInput): Promise<AsaasCustomer> {
  return asaasFetch<AsaasCustomer>('/customers', {
    method: 'POST',
    body: JSON.stringify(input),
  });
}

export async function createPayment(input: AsaasPaymentInput): Promise<AsaasPaymentResponse> {
  return asaasFetch<AsaasPaymentResponse>('/payments', {
    method: 'POST',
    body: JSON.stringify(input),
  });
}

export async function getPixQrCode(paymentId: string): Promise<AsaasPixQrCode> {
  return asaasFetch<AsaasPixQrCode>(`/payments/${paymentId}/pixQrCode`);
}

export function mapBillingType(method: string): BillingType {
  const map: Record<string, BillingType> = {
    pix: 'PIX',
    credit_card: 'CREDIT_CARD',
    boleto: 'BOLETO',
  };
  return map[method] ?? 'PIX';
}

export function mapAsaasStatus(asaasStatus: string): string {
  const map: Record<string, string> = {
    PENDING: 'pending',
    RECEIVED: 'confirmed',
    CONFIRMED: 'confirmed',
    OVERDUE: 'overdue',
    REFUNDED: 'refunded',
    REFUND_REQUESTED: 'refunded',
    CHARGEBACK_REQUESTED: 'chargeback',
    CHARGEBACK_DISPUTE: 'chargeback',
    AWAITING_CHARGEBACK_REVERSAL: 'chargeback',
    DUNNING_REQUESTED: 'overdue',
    DUNNING_RECEIVED: 'confirmed',
    AWAITING_RISK_ANALYSIS: 'pending',
  };
  return map[asaasStatus] ?? 'pending';
}
