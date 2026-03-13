'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { createBrowserSupabaseClient } from '@/lib/supabase/client';

export default function AdminLoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleLogin(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setLoading(true);
    setError(null);

    const supabase = createBrowserSupabaseClient();

    const { error: authError } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (authError) {
      setError('Credenciais inválidas');
      setLoading(false);
      return;
    }

    // Check admin role
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      setError('Erro ao verificar usuário');
      setLoading(false);
      return;
    }

    const { data: profile } = await supabase
      .from('profiles')
      .select('role')
      .eq('user_id', user.id)
      .single();

    if (!profile || profile.role !== 'admin') {
      await supabase.auth.signOut();
      setError('Acesso não autorizado. Apenas administradores podem acessar este painel.');
      setLoading(false);
      return;
    }

    window.location.href = '/dashboard';
  }

  return (
    <main className="flex min-h-screen items-center justify-center bg-sand-50 px-4">
      <Card className="w-full max-w-md space-y-6 p-8">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-turquoise-600">TravelMatch Admin</h1>
          <p className="mt-2 text-sm text-sand-500">Painel administrativo</p>
        </div>

        <form onSubmit={handleLogin} className="space-y-4">
          <div className="space-y-2">
            <label htmlFor="email" className="text-sm font-medium text-sand-700">
              Email
            </label>
            <Input
              id="email"
              type="email"
              placeholder="admin@travelmatch.com.br"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              disabled={loading}
            />
          </div>

          <div className="space-y-2">
            <label htmlFor="password" className="text-sm font-medium text-sand-700">
              Senha
            </label>
            <Input
              id="password"
              type="password"
              placeholder="••••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              disabled={loading}
            />
          </div>

          {error && (
            <p className="rounded-md bg-red-50 p-3 text-sm text-red-600">{error}</p>
          )}

          <Button
            type="submit"
            className="w-full bg-turquoise-600 hover:bg-turquoise-700"
            size="lg"
            disabled={loading}
          >
            {loading ? 'Entrando...' : 'Entrar'}
          </Button>
        </form>
      </Card>
    </main>
  );
}
