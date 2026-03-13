import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import Link from 'next/link';

export default function UnauthorizedPage() {
  return (
    <main className="flex min-h-screen items-center justify-center bg-sand-50 px-4">
      <Card className="max-w-sm space-y-4 p-8 text-center">
        <span className="text-5xl">🔒</span>
        <h1 className="text-xl font-bold text-sand-800">Acesso não autorizado</h1>
        <p className="text-sm text-sand-500">
          Você não tem permissão para acessar o painel administrativo.
        </p>
        <div className="space-y-2">
          <Link href="/login">
            <Button variant="outline" className="w-full">
              Fazer login com outra conta
            </Button>
          </Link>
          <a href="https://travelmatch.com.br">
            <Button className="w-full bg-turquoise-600 hover:bg-turquoise-700">
              Voltar para TravelMatch
            </Button>
          </a>
        </div>
      </Card>
    </main>
  );
}
