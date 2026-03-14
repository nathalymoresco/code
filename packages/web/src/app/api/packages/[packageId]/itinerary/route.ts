import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

function escapeHtml(str: string): string {
  return str.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
}

const TYPE_ICONS: Record<string, string> = {
  transfer: '🚗',
  hospedagem: '🏨',
  passeio: '🧭',
  experiencia: '✨',
  alimentacao: '🍽️',
  seguro: '🛡️',
};

const CONCIERGE_PHONE = process.env.CONCIERGE_WHATSAPP ?? '5562999999999';

export async function GET(
  _req: Request,
  { params }: { params: Promise<{ packageId: string }> },
) {
  const { packageId } = await params;
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: 'Não autorizado' }, { status: 401 });
  }

  // Fetch package with destination
  const { data: pkg, error: pkgError } = await supabase
    .from('packages')
    .select('*, destination:destinations(name, state, cover_url)')
    .eq('id', packageId)
    .single();

  if (pkgError || !pkg) {
    return NextResponse.json({ error: 'Pacote não encontrado' }, { status: 404 });
  }

  if (pkg.profile_id !== user.id) {
    return NextResponse.json({ error: 'Acesso negado' }, { status: 403 });
  }

  // Fetch items with partners
  const { data: items } = await supabase
    .from('package_items')
    .select('*, partner:partners(name, phone, address)')
    .eq('package_id', packageId)
    .order('day_number')
    .order('sort_order');

  const allItems = items ?? [];
  const dest = Array.isArray(pkg.destination) ? pkg.destination[0] : pkg.destination;
  const destName = dest?.name ?? 'Destino';
  const destState = dest?.state ?? '';

  // Group items by day
  const days: Record<number, typeof allItems> = {};
  for (const item of allItems) {
    if (!days[item.day_number]) days[item.day_number] = [];
    days[item.day_number]!.push(item);
  }

  const totalDays = Math.max(
    ...allItems.map((i) => i.day_number),
    Math.ceil((new Date(pkg.end_date).getTime() - new Date(pkg.start_date).getTime()) / 86400000),
  );

  const formatDate = (d: string) =>
    new Date(d + 'T12:00:00').toLocaleDateString('pt-BR', { weekday: 'long', day: '2-digit', month: 'long' });

  function addDays(date: string, n: number): string {
    const d = new Date(date + 'T12:00:00');
    d.setDate(d.getDate() + n);
    return d.toISOString().split('T')[0]!;
  }

  // Build HTML
  const daysSections = Array.from({ length: totalDays }, (_, i) => {
    const dayNum = i + 1;
    const dayDate = addDays(pkg.start_date, i);
    const dayItems = days[dayNum] ?? [];

    const itemsHtml = dayItems.length > 0
      ? dayItems.map((item) => {
          const icon = TYPE_ICONS[item.type] ?? '📌';
          const partner = item.partner;
          const time = item.start_time ? `<span style="color:#888;font-size:12px;">${escapeHtml(item.start_time)}${item.end_time ? ` — ${escapeHtml(item.end_time)}` : ''}</span>` : '';
          const partnerInfo = partner
            ? `<div style="font-size:11px;color:#999;margin-top:4px;">${escapeHtml(partner.name)}${partner.phone ? ` · ${escapeHtml(partner.phone)}` : ''}${partner.address ? `<br/>${escapeHtml(partner.address)}` : ''}</div>`
            : '';
          const mapsLink = item.maps_url
            ? `<a href="${escapeHtml(item.maps_url)}" style="font-size:11px;color:#2bb5a0;">📍 Ver no Maps</a>`
            : '';
          const price = `<span style="float:right;font-weight:600;color:#3a3630;">R$ ${Number(item.price).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</span>`;

          return `
            <div style="padding:8px 0;border-bottom:1px solid #f0ece6;">
              <div>${icon} <strong>${escapeHtml(item.title)}</strong> ${price}</div>
              ${time}
              ${item.description ? `<div style="font-size:12px;color:#777;margin-top:2px;">${escapeHtml(item.description)}</div>` : ''}
              ${partnerInfo}
              ${mapsLink}
            </div>`;
        }).join('')
      : '<div style="padding:8px 0;color:#999;font-style:italic;">Dia livre — aproveite para explorar!</div>';

    return `
      <div style="margin-bottom:24px;page-break-inside:avoid;">
        <h2 style="color:#2bb5a0;font-size:16px;margin:0 0 8px;">Dia ${dayNum} — ${formatDate(dayDate)}</h2>
        ${itemsHtml}
      </div>`;
  }).join('');

  // Insurance section
  const insuranceSection = pkg.insurance_included
    ? `<div style="background:#f0faf8;border-radius:8px;padding:12px;margin-bottom:24px;">
        <h3 style="color:#2bb5a0;font-size:14px;margin:0 0 4px;">🛡️ Seguro Viagem</h3>
        <p style="font-size:12px;color:#666;margin:0;">Cancelamento · Emergência médica · Bagagem</p>
        ${pkg.insurance_provider ? `<p style="font-size:11px;color:#999;margin:4px 0 0;">Seguradora: ${escapeHtml(pkg.insurance_provider)}</p>` : ''}
      </div>`
    : '';

  const html = `<!DOCTYPE html>
<html lang="pt-BR">
<head>
  <meta charset="utf-8"/>
  <title>Itinerário — ${escapeHtml(destName)}</title>
  <style>
    @media print { body { margin: 0; } .no-print { display: none; } }
    body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif; color: #3a3630; max-width: 700px; margin: 0 auto; padding: 32px 24px; }
    a { color: #2bb5a0; text-decoration: none; }
  </style>
</head>
<body>
  <!-- Cover -->
  <div style="text-align:center;margin-bottom:32px;padding-bottom:24px;border-bottom:2px solid #2bb5a0;">
    <h1 style="color:#2bb5a0;font-size:28px;margin:0;">TravelMatch</h1>
    <h2 style="font-size:22px;margin:8px 0 4px;">${escapeHtml(destName)}${destState ? `, ${escapeHtml(destState)}` : ''}</h2>
    <p style="color:#888;">${formatDate(pkg.start_date)} — ${formatDate(pkg.end_date)}</p>
    <p style="color:#888;">${pkg.num_travelers} viajante${pkg.num_travelers > 1 ? 's' : ''} · ${totalDays} dias</p>
  </div>

  <!-- Itinerary -->
  ${daysSections}

  <!-- Insurance -->
  ${insuranceSection}

  <!-- Price -->
  <div style="background:#f8f6f2;border-radius:8px;padding:16px;margin-bottom:24px;">
    <div style="display:flex;justify-content:space-between;font-size:18px;font-weight:700;">
      <span>Total</span>
      <span>R$ ${Number(pkg.total_price).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</span>
    </div>
  </div>

  <!-- Concierge -->
  <div style="background:#f0faf8;border-radius:8px;padding:16px;text-align:center;margin-bottom:24px;">
    <h3 style="color:#2bb5a0;margin:0 0 8px;">Concierge TravelMatch</h3>
    <p style="font-size:13px;color:#666;margin:0 0 8px;">Suporte antes, durante e após sua viagem</p>
    <a href="https://wa.me/${CONCIERGE_PHONE}" style="font-size:14px;font-weight:600;">💬 WhatsApp: +${CONCIERGE_PHONE.replace(/(\d{2})(\d{2})(\d{5})(\d{4})/, '$1 ($2) $3-$4')}</a>
  </div>

  <!-- Print button -->
  <div class="no-print" style="text-align:center;margin-top:32px;">
    <button onclick="window.print()" style="background:#2bb5a0;color:white;border:none;padding:12px 32px;border-radius:8px;font-size:14px;cursor:pointer;">
      Salvar como PDF
    </button>
  </div>
</body>
</html>`;

  return new NextResponse(html, {
    headers: {
      'Content-Type': 'text/html; charset=utf-8',
    },
  });
}
