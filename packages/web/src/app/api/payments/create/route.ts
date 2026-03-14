import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { createCustomer, createPayment, getPixQrCode, mapBillingType } from '@/lib/asaas/client';
import type { PaymentMethod } from '@travelmatch/shared';

interface CreatePaymentBody {
  package_id: string;
  method: PaymentMethod;
  installments?: number;
  customer: {
    name: string;
    email: string;
    cpf: string;
  };
}

function addDays(date: string, days: number): string {
  const d = new Date(date);
  d.setDate(d.getDate() + days);
  return d.toISOString().split('T')[0]!;
}

export async function POST(req: Request) {
  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: 'Não autorizado' }, { status: 401 });
    }

    const body = (await req.json()) as CreatePaymentBody;
    const { package_id, method, installments = 1, customer } = body;

    // Validate
    if (!package_id || !method || !customer?.name || !customer?.email || !customer?.cpf) {
      return NextResponse.json({ error: 'Dados incompletos' }, { status: 400 });
    }

    if (!['pix', 'credit_card', 'boleto'].includes(method)) {
      return NextResponse.json({ error: 'Método de pagamento inválido' }, { status: 400 });
    }

    if (method === 'credit_card' && (installments < 1 || installments > 12)) {
      return NextResponse.json({ error: 'Parcelas inválidas (1-12)' }, { status: 400 });
    }

    // Fetch package & verify ownership
    const { data: pkg, error: pkgError } = await supabase
      .from('packages')
      .select('id, profile_id, total_price, status, end_date')
      .eq('id', package_id)
      .single();

    if (pkgError || !pkg) {
      return NextResponse.json({ error: 'Pacote não encontrado' }, { status: 404 });
    }

    if (pkg.profile_id !== user.id) {
      return NextResponse.json({ error: 'Acesso negado' }, { status: 403 });
    }

    if (pkg.status !== 'draft' && pkg.status !== 'ready') {
      return NextResponse.json({ error: 'Pacote não disponível para pagamento' }, { status: 400 });
    }

    // Anti-duplicity: check existing pending payment
    const { data: existing } = await supabase
      .from('package_payments')
      .select('id, status')
      .eq('package_id', package_id)
      .in('status', ['pending', 'confirmed'])
      .limit(1);

    if (existing && existing.length > 0) {
      const existingPayment = existing[0]!;
      if (existingPayment.status === 'confirmed') {
        return NextResponse.json({ error: 'Pagamento já confirmado' }, { status: 409 });
      }
      return NextResponse.json({ error: 'Pagamento pendente já existe', payment_id: existingPayment.id }, { status: 409 });
    }

    // Create Asaas customer
    const asaasCustomer = await createCustomer({
      name: customer.name,
      email: customer.email,
      cpfCnpj: customer.cpf.replace(/\D/g, ''),
    });

    // Determine due date based on method
    const now = new Date().toISOString().split('T')[0]!;
    const dueDate = method === 'boleto' ? addDays(now, 3) : now;

    // Create Asaas payment
    const asaasPayment = await createPayment({
      customer: asaasCustomer.id,
      billingType: mapBillingType(method),
      value: pkg.total_price,
      dueDate,
      description: `TravelMatch - Pacote ${package_id.slice(0, 8)}`,
      installmentCount: method === 'credit_card' && installments > 1 ? installments : undefined,
      externalReference: package_id,
    });

    // Get Pix QR code if applicable
    let pixData: { qr_code: string; copy_paste: string; expiration: string } | null = null;
    if (method === 'pix') {
      const pix = await getPixQrCode(asaasPayment.id);
      pixData = {
        qr_code: pix.encodedImage,
        copy_paste: pix.payload,
        expiration: pix.expirationDate,
      };
    }

    // Calculate escrow release date: trip end + 3 days
    const escrowReleaseDate = pkg.end_date ? addDays(pkg.end_date, 3) : null;

    // Insert payment record
    const { data: payment, error: paymentError } = await supabase
      .from('package_payments')
      .insert({
        package_id,
        asaas_payment_id: asaasPayment.id,
        asaas_customer_id: asaasCustomer.id,
        asaas_invoice_url: asaasPayment.invoiceUrl,
        method,
        installments,
        status: 'pending',
        amount: pkg.total_price,
        net_amount: asaasPayment.netValue,
        pix_qr_code: pixData?.qr_code ?? null,
        pix_copy_paste: pixData?.copy_paste ?? null,
        pix_expiration: pixData?.expiration ?? null,
        escrow_status: 'held',
        escrow_release_date: escrowReleaseDate,
        webhook_events: [],
      })
      .select()
      .single();

    if (paymentError) {
      throw paymentError;
    }

    // Update package status
    await supabase
      .from('packages')
      .update({ status: 'awaiting_payment', updated_at: new Date().toISOString() })
      .eq('id', package_id);

    return NextResponse.json({
      payment_id: payment.id,
      asaas_payment_id: asaasPayment.id,
      invoice_url: asaasPayment.invoiceUrl,
      method,
      installments,
      amount: pkg.total_price,
      pix: pixData,
      status: 'pending',
    });
  } catch (error) {
    console.error('Error creating payment:', error);
    const message = error instanceof Error ? error.message : 'Erro ao processar pagamento';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
