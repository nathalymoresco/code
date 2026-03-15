'use client';

import { Suspense, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import {
  signInWithGoogle,
  signInWithApple,
  signInWithEmail,
  signUpWithEmail,
  signInWithMagicLink,
} from './actions';

export default function LoginPage() {
  return (
    <Suspense>
      <LoginForm />
    </Suspense>
  );
}

function LoginForm() {
  const [mode, setMode] = useState<'login' | 'signup' | 'magic'>('login');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  async function handleOAuth(action: () => Promise<{ error?: string } | void>) {
    setLoading(true);
    setError(null);
    const result = await action();
    setLoading(false);
    if (result && 'error' in result) {
      setError(result.error ?? 'Erro desconhecido');
    }
  }

  async function handleEmailAuth(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setSuccessMessage(null);

    const formData = new FormData();
    formData.set('email', email);
    formData.set('password', password);

    const action = mode === 'signup' ? signUpWithEmail : signInWithEmail;
    const result = await action(formData);
    setLoading(false);

    if (result && 'error' in result && result.error) {
      setError(result.error);
    } else if (result && 'needsConfirmation' in result) {
      setSuccessMessage('Conta criada! Verifique seu email para confirmar o cadastro.');
      setMode('login');
    }
  }

  async function handleMagicLink(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setLoading(true);
    setError(null);

    const formData = new FormData();
    formData.set('email', email);

    const result = await signInWithMagicLink(formData);
    setLoading(false);

    if (result?.error) {
      setError(result.error);
    } else if (result?.success) {
      setSuccessMessage('Link de acesso enviado! Verifique sua caixa de entrada.');
    }
  }

  return (
    <main className="flex min-h-screen items-center justify-center bg-sand-50 px-4">
      <Card className="w-full max-w-md space-y-6 p-8">
        <div className="text-center">
          <h1 className="text-3xl font-bold text-turquoise-600">TravelMatch BR</h1>
          <p className="mt-2 text-sand-600">Descubra seu DNA de Viagem</p>
        </div>

        {/* Success Message */}
        {successMessage && (
          <div className="rounded-lg bg-turquoise-50 p-4 text-center text-turquoise-700">
            <p className="font-medium">{successMessage}</p>
          </div>
        )}

        {/* Global Error */}
        {error && (
          <div className="rounded-lg bg-red-50 p-3 text-center text-sm text-red-600">
            {error}
          </div>
        )}

        {/* OAuth Providers */}
        <div className="space-y-3">
          <Button
            type="button"
            variant="outline"
            className="w-full gap-2"
            size="lg"
            disabled={loading}
            onClick={() => handleOAuth(signInWithGoogle)}
          >
            <GoogleIcon />
            Entrar com Google
          </Button>

          <Button
            type="button"
            variant="outline"
            className="w-full gap-2"
            size="lg"
            disabled={loading}
            onClick={() => handleOAuth(signInWithApple)}
          >
            <AppleIcon />
            Entrar com Apple
          </Button>
        </div>

        <div className="relative">
          <div className="absolute inset-0 flex items-center">
            <span className="w-full border-t border-sand-200" />
          </div>
          <div className="relative flex justify-center text-xs uppercase">
            <span className="bg-white px-2 text-sand-500">ou</span>
          </div>
        </div>

        {/* Mode Tabs */}
        <div className="flex rounded-lg bg-sand-100 p-1">
          <button
            type="button"
            onClick={() => { setMode('login'); setError(null); setSuccessMessage(null); }}
            className={`flex-1 rounded-md px-3 py-1.5 text-sm font-medium transition-colors ${
              mode === 'login' ? 'bg-white text-turquoise-700 shadow-sm' : 'text-sand-600 hover:text-sand-900'
            }`}
          >
            Entrar
          </button>
          <button
            type="button"
            onClick={() => { setMode('signup'); setError(null); setSuccessMessage(null); }}
            className={`flex-1 rounded-md px-3 py-1.5 text-sm font-medium transition-colors ${
              mode === 'signup' ? 'bg-white text-turquoise-700 shadow-sm' : 'text-sand-600 hover:text-sand-900'
            }`}
          >
            Criar conta
          </button>
          <button
            type="button"
            onClick={() => { setMode('magic'); setError(null); setSuccessMessage(null); }}
            className={`flex-1 rounded-md px-3 py-1.5 text-sm font-medium transition-colors ${
              mode === 'magic' ? 'bg-white text-turquoise-700 shadow-sm' : 'text-sand-600 hover:text-sand-900'
            }`}
          >
            Magic Link
          </button>
        </div>

        {/* Email + Password Form */}
        {(mode === 'login' || mode === 'signup') && (
          <form onSubmit={handleEmailAuth} className="space-y-3">
            <Input
              type="email"
              placeholder="seu@email.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              disabled={loading}
            />
            <Input
              type="password"
              placeholder={mode === 'signup' ? 'Crie uma senha (mín. 6 caracteres)' : 'Sua senha'}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              minLength={6}
              disabled={loading}
            />
            <Button
              type="submit"
              className="w-full bg-turquoise-600 hover:bg-turquoise-700"
              size="lg"
              disabled={loading}
            >
              {loading
                ? 'Aguarde...'
                : mode === 'signup'
                  ? 'Criar conta'
                  : 'Entrar'}
            </Button>
          </form>
        )}

        {/* Magic Link Form */}
        {mode === 'magic' && (
          <form onSubmit={handleMagicLink} className="space-y-3">
            <Input
              type="email"
              placeholder="seu@email.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              disabled={loading}
            />
            <Button
              type="submit"
              className="w-full bg-turquoise-600 hover:bg-turquoise-700"
              size="lg"
              disabled={loading}
            >
              {loading ? 'Enviando...' : 'Enviar Magic Link'}
            </Button>
          </form>
        )}
      </Card>
    </main>
  );
}

function GoogleIcon() {
  return (
    <svg className="size-5" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 0 1-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1z" fill="#4285F4"/>
      <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
      <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/>
      <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
    </svg>
  );
}

function AppleIcon() {
  return (
    <svg className="size-5" viewBox="0 0 24 24" fill="currentColor" xmlns="http://www.w3.org/2000/svg">
      <path d="M17.05 20.28c-.98.95-2.05.88-3.08.4-1.09-.5-2.08-.48-3.24 0-1.44.62-2.2.44-3.06-.4C2.79 15.25 3.51 7.59 9.05 7.31c1.35.07 2.29.74 3.08.8 1.18-.24 2.31-.93 3.57-.84 1.51.12 2.65.72 3.4 1.8-3.12 1.87-2.38 5.98.48 7.13-.57 1.5-1.31 2.99-2.54 4.09zM12.03 7.25c-.15-2.23 1.66-4.07 3.74-4.25.29 2.58-2.34 4.5-3.74 4.25z"/>
    </svg>
  );
}
