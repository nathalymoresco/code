'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { completeOnboarding } from './actions';

type Step = 'welcome' | 'consent' | 'ready';

export default function OnboardingPage() {
  const [step, setStep] = useState<Step>('welcome');
  const [fullName, setFullName] = useState('');
  const [lgpdConsent, setLgpdConsent] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit() {
    setLoading(true);
    setError(null);

    const formData = new FormData();
    formData.set('full_name', fullName);
    formData.set('lgpd_consent', lgpdConsent.toString());

    const result = await completeOnboarding(formData);
    setLoading(false);

    if (result?.error) {
      setError(result.error);
    }
    // On success, server action redirects to /
  }

  return (
    <main className="flex min-h-screen items-center justify-center bg-sand-50 px-4">
      <Card className="w-full max-w-lg space-y-6 p-8">
        {step === 'welcome' && (
          <div className="space-y-4 text-center">
            <h1 className="text-3xl font-bold text-turquoise-600">
              Bem-vindo ao TravelMatch BR!
            </h1>
            <p className="text-sand-600">
              Vamos configurar seu perfil para descobrir seu DNA de Viagem.
            </p>
            <div className="space-y-3">
              <Input
                type="text"
                placeholder="Seu nome completo"
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
              />
            </div>
            <Button
              onClick={() => setStep('consent')}
              className="w-full bg-turquoise-600 hover:bg-turquoise-700"
              size="lg"
              disabled={fullName.trim().length < 2}
            >
              Continuar
            </Button>
          </div>
        )}

        {step === 'consent' && (
          <div className="space-y-4">
            <h2 className="text-center text-2xl font-bold text-turquoise-600">
              Privacidade e Termos
            </h2>
            <p className="text-sm text-sand-600">
              Para usar a plataforma, precisamos do seu consentimento conforme a Lei Geral de
              Proteção de Dados (LGPD).
            </p>
            <label className="flex items-start gap-3 rounded-lg border border-sand-200 p-4 cursor-pointer">
              <input
                type="checkbox"
                checked={lgpdConsent}
                onChange={(e) => setLgpdConsent(e.target.checked)}
                className="mt-1 size-4 rounded border-sand-300 text-turquoise-600 focus:ring-turquoise-500"
              />
              <span className="text-sm text-sand-700">
                Li e aceito a{' '}
                <a href="/privacy-policy" className="text-turquoise-600 underline" target="_blank">
                  Política de Privacidade
                </a>{' '}
                e{' '}
                <a href="/privacy-policy" className="text-turquoise-600 underline" target="_blank">
                  Termos de Uso
                </a>
              </span>
            </label>
            {error && <p className="text-sm text-red-600">{error}</p>}
            <div className="flex gap-3">
              <Button variant="outline" onClick={() => setStep('welcome')} className="flex-1">
                Voltar
              </Button>
              <Button
                onClick={handleSubmit}
                className="flex-1 bg-turquoise-600 hover:bg-turquoise-700"
                size="lg"
                disabled={!lgpdConsent || loading}
              >
                {loading ? 'Salvando...' : 'Aceitar e Continuar'}
              </Button>
            </div>
          </div>
        )}
      </Card>
    </main>
  );
}
