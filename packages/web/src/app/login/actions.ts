'use server';

import { createClient } from '@/lib/supabase/server';
import { redirect } from 'next/navigation';

export async function signInWithGoogle() {
  const supabase = await createClient();
  const { data, error } = await supabase.auth.signInWithOAuth({
    provider: 'google',
    options: { redirectTo: `${process.env.NEXT_PUBLIC_SITE_URL}/auth/callback` },
  });
  if (error) {
    return { error: `Google login indisponível: ${error.message}` };
  }
  if (data.url) {
    redirect(data.url);
  }
  return { error: 'Erro inesperado ao conectar com Google' };
}

export async function signInWithApple() {
  const supabase = await createClient();
  const { data, error } = await supabase.auth.signInWithOAuth({
    provider: 'apple',
    options: { redirectTo: `${process.env.NEXT_PUBLIC_SITE_URL}/auth/callback` },
  });
  if (error) {
    return { error: `Apple login indisponível: ${error.message}` };
  }
  if (data.url) {
    redirect(data.url);
  }
  return { error: 'Erro inesperado ao conectar com Apple' };
}

export async function signInWithEmail(formData: FormData) {
  const email = formData.get('email') as string;
  const password = formData.get('password') as string;

  if (!email || !password) {
    return { error: 'Email e senha são obrigatórios' };
  }

  const supabase = await createClient();
  const { error } = await supabase.auth.signInWithPassword({ email, password });

  if (error) {
    if (error.message === 'Invalid login credentials') {
      return { error: 'Email ou senha incorretos' };
    }
    if (error.message.includes('Email not confirmed')) {
      return { error: 'Email ainda não confirmado. Verifique sua caixa de entrada.' };
    }
    return { error: error.message };
  }

  redirect('/onboarding');
}

export async function signUpWithEmail(formData: FormData) {
  const email = formData.get('email') as string;
  const password = formData.get('password') as string;

  if (!email || !password) {
    return { error: 'Email e senha são obrigatórios' };
  }

  if (password.length < 6) {
    return { error: 'A senha deve ter pelo menos 6 caracteres' };
  }

  const supabase = await createClient();
  const { data, error } = await supabase.auth.signUp({
    email,
    password,
    options: { emailRedirectTo: `${process.env.NEXT_PUBLIC_SITE_URL}/auth/callback` },
  });

  if (error) {
    if (error.message.includes('already registered')) {
      return { error: 'Este email já está cadastrado. Faça login.' };
    }
    if (error.message.includes('rate limit')) {
      return { error: 'Muitas tentativas. Aguarde alguns minutos.' };
    }
    return { error: error.message };
  }

  // If email confirmation is required, user won't have a session yet
  if (data.user && !data.session) {
    return { needsConfirmation: true };
  }

  // Auto-confirmed: redirect to onboarding
  redirect('/onboarding');
}

export async function signInWithMagicLink(formData: FormData) {
  const email = formData.get('email') as string;
  if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    return { error: 'Email inválido' };
  }

  const supabase = await createClient();
  const { error } = await supabase.auth.signInWithOtp({
    email,
    options: { emailRedirectTo: `${process.env.NEXT_PUBLIC_SITE_URL}/auth/callback` },
  });

  if (error) {
    if (error.message.includes('rate limit')) {
      return { error: 'Muitas tentativas. Aguarde alguns minutos.' };
    }
    return { error: error.message };
  }

  return { success: true };
}
