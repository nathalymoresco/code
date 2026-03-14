import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

interface CheckinBody {
  item_id: string;
}

export async function POST(
  req: Request,
  { params }: { params: Promise<{ packageId: string }> },
) {
  try {
    const { packageId } = await params;
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: 'Não autorizado' }, { status: 401 });
    }

    // Verify package ownership
    const { data: pkg } = await supabase
      .from('packages')
      .select('id, profile_id')
      .eq('id', packageId)
      .single();

    if (!pkg || pkg.profile_id !== user.id) {
      return NextResponse.json({ error: 'Acesso negado' }, { status: 403 });
    }

    const body = (await req.json()) as CheckinBody;
    const { item_id } = body;

    if (!item_id) {
      return NextResponse.json({ error: 'item_id obrigatório' }, { status: 400 });
    }

    // Verify item belongs to package
    const { data: item } = await supabase
      .from('package_items')
      .select('id, package_id')
      .eq('id', item_id)
      .eq('package_id', packageId)
      .single();

    if (!item) {
      return NextResponse.json({ error: 'Item não encontrado' }, { status: 404 });
    }

    // For now, we just return success. In production, this would:
    // 1. Update a checkin_status column on package_items
    // 2. Log the checkin event
    // 3. Notify the partner via webhook

    return NextResponse.json({
      success: true,
      item_id,
      checked_in_at: new Date().toISOString(),
    });
  } catch (error) {
    console.error('Checkin error:', error);
    return NextResponse.json({ error: 'Erro no check-in' }, { status: 500 });
  }
}

// Partner validation endpoint (no auth required — partners scan QR)
export async function GET(
  req: Request,
  { params }: { params: Promise<{ packageId: string }> },
) {
  try {
    const { packageId } = await params;
    const url = new URL(req.url);
    const qrData = url.searchParams.get('qr');

    if (!qrData) {
      return NextResponse.json({ error: 'QR data obrigatório' }, { status: 400 });
    }

    // Decode QR payload
    let payload: { pid: string; iid: string; ts: number; v: number };
    try {
      payload = JSON.parse(atob(qrData));
    } catch {
      return NextResponse.json({ error: 'QR inválido' }, { status: 400 });
    }

    // Verify package exists and matches
    if (!packageId.startsWith(payload.pid)) {
      return NextResponse.json({ valid: false, error: 'Pacote não corresponde' }, { status: 400 });
    }

    // Check if QR is not expired (24h)
    const age = Date.now() - payload.ts;
    if (age > 24 * 60 * 60 * 1000) {
      return NextResponse.json({ valid: false, error: 'QR expirado' }, { status: 400 });
    }

    return NextResponse.json({
      valid: true,
      package_id: packageId,
      item_prefix: payload.iid,
      generated_at: new Date(payload.ts).toISOString(),
    });
  } catch (error) {
    console.error('QR validation error:', error);
    return NextResponse.json({ error: 'Erro na validação' }, { status: 500 });
  }
}
