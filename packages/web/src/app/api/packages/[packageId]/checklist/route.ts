import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

interface PatchBody {
  item_id: string;
  is_completed: boolean;
}

export async function PATCH(
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

    const body = (await req.json()) as PatchBody;
    const { item_id, is_completed } = body;

    if (!item_id || typeof is_completed !== 'boolean') {
      return NextResponse.json({ error: 'Dados inválidos' }, { status: 400 });
    }

    const { error } = await supabase
      .from('package_checklist_items')
      .update({
        is_completed,
        completed_at: is_completed ? new Date().toISOString() : null,
      })
      .eq('id', item_id)
      .eq('package_id', packageId);

    if (error) {
      throw error;
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Checklist update error:', error);
    return NextResponse.json({ error: 'Erro ao atualizar checklist' }, { status: 500 });
  }
}
