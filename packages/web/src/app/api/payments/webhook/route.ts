import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { mapAsaasStatus } from '@/lib/asaas/client';

const ASAAS_WEBHOOK_TOKEN = process.env.ASAAS_WEBHOOK_TOKEN ?? '';

interface AsaasWebhookPayload {
  event: string;
  payment: {
    id: string;
    status: string;
    value: number;
    netValue: number;
    billingType: string;
    externalReference?: string;
  };
}

// Use service-role client for webhook (no user context)
function getServiceClient() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!url || !key) throw new Error('Missing Supabase service config');
  return createClient(url, key);
}

export async function POST(req: Request) {
  try {
    // Validate webhook token
    if (ASAAS_WEBHOOK_TOKEN) {
      const token = req.headers.get('asaas-access-token');
      if (token !== ASAAS_WEBHOOK_TOKEN) {
        return NextResponse.json({ error: 'Invalid token' }, { status: 401 });
      }
    }

    const payload = (await req.json()) as AsaasWebhookPayload;
    const { event, payment: asaasPayment } = payload;

    if (!event || !asaasPayment?.id) {
      return NextResponse.json({ error: 'Invalid payload' }, { status: 400 });
    }

    const supabase = getServiceClient();

    // Find payment by Asaas ID
    const { data: payment, error: findError } = await supabase
      .from('package_payments')
      .select('id, package_id, status, webhook_events')
      .eq('asaas_payment_id', asaasPayment.id)
      .single();

    if (findError || !payment) {
      console.error('Payment not found for Asaas ID:', asaasPayment.id);
      return NextResponse.json({ error: 'Payment not found' }, { status: 404 });
    }

    // Append webhook event to audit log
    const webhookEvent = {
      event,
      timestamp: new Date().toISOString(),
      asaas_status: asaasPayment.status,
      value: asaasPayment.value,
    };
    const events = Array.isArray(payment.webhook_events) ? payment.webhook_events : [];
    events.push(webhookEvent);

    // Map status
    const newStatus = mapAsaasStatus(asaasPayment.status);

    // Update payment
    const updateData: Record<string, unknown> = {
      status: newStatus,
      net_amount: asaasPayment.netValue,
      webhook_events: events,
      updated_at: new Date().toISOString(),
    };

    // Handle refund
    if (newStatus === 'refunded') {
      updateData.escrow_status = 'refunded';
    }

    await supabase
      .from('package_payments')
      .update(updateData)
      .eq('id', payment.id);

    // Update package status based on payment status
    const packageStatusMap: Record<string, string> = {
      confirmed: 'confirmed',
      overdue: 'awaiting_payment',
      refunded: 'cancelled',
      chargeback: 'cancelled',
    };

    const packageStatus = packageStatusMap[newStatus];
    if (packageStatus) {
      await supabase
        .from('packages')
        .update({ status: packageStatus, updated_at: new Date().toISOString() })
        .eq('id', payment.package_id);
    }

    console.log(`Webhook processed: ${event} → payment ${payment.id} → ${newStatus}`);

    return NextResponse.json({ received: true });
  } catch (error) {
    console.error('Webhook error:', error);
    return NextResponse.json({ error: 'Internal error' }, { status: 500 });
  }
}
