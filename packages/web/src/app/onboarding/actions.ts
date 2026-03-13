'use server';

import { createClient } from '@/lib/supabase/server';
import { redirect } from 'next/navigation';

export async function completeOnboarding(formData: FormData) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    throw new Error('Not authenticated');
  }

  const fullName = formData.get('full_name') as string;
  const lgpdConsent = formData.get('lgpd_consent') === 'true';

  if (!lgpdConsent) {
    return { error: 'Consentimento LGPD é obrigatório' };
  }

  if (!fullName || fullName.trim().length < 2) {
    return { error: 'Nome completo é obrigatório' };
  }

  const { error } = await supabase
    .from('profiles')
    .update({
      full_name: fullName.trim(),
      lgpd_consent: true,
      lgpd_consent_at: new Date().toISOString(),
    })
    .eq('user_id', user.id);

  if (error) {
    return { error: 'Erro ao salvar dados. Tente novamente.' };
  }

  redirect('/');
}
