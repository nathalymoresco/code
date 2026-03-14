import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

interface ReviewBody {
  overall_rating: number;
  nps: number | null;
  general_comment: string;
  item_reviews: { item_id: string; rating: number; comment: string }[];
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

    const { data: pkg } = await supabase
      .from('packages')
      .select('id, profile_id')
      .eq('id', packageId)
      .single();

    if (!pkg || pkg.profile_id !== user.id) {
      return NextResponse.json({ error: 'Acesso negado' }, { status: 403 });
    }

    const body = (await req.json()) as ReviewBody;
    const { overall_rating, nps, general_comment, item_reviews } = body;

    if (!overall_rating || overall_rating < 1 || overall_rating > 5) {
      return NextResponse.json({ error: 'Rating inválido' }, { status: 400 });
    }

    // Store overall review in package metadata
    await supabase
      .from('packages')
      .update({
        notes: JSON.stringify({
          review: { overall_rating, nps, general_comment, reviewed_at: new Date().toISOString() },
        }),
        updated_at: new Date().toISOString(),
      })
      .eq('id', packageId);

    // Update partner ratings for items with reviews
    for (const itemReview of item_reviews) {
      if (itemReview.rating > 0) {
        // Get item's partner
        const { data: item } = await supabase
          .from('package_items')
          .select('partner_id')
          .eq('id', itemReview.item_id)
          .single();

        if (item?.partner_id) {
          // Get current partner rating
          const { data: partner } = await supabase
            .from('partners')
            .select('rating, review_count')
            .eq('id', item.partner_id)
            .single();

          if (partner) {
            const currentTotal = (partner.rating ?? 0) * (partner.review_count ?? 0);
            const newCount = (partner.review_count ?? 0) + 1;
            const newRating = Math.round(((currentTotal + itemReview.rating) / newCount) * 10) / 10;

            await supabase
              .from('partners')
              .update({ rating: newRating, review_count: newCount })
              .eq('id', item.partner_id);
          }
        }
      }
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Review error:', error);
    return NextResponse.json({ error: 'Erro ao salvar avaliação' }, { status: 500 });
  }
}
