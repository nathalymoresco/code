import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';

export default function SettingsPage() {
  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-sand-800">Configurações</h1>
      <Card>
        <CardHeader>
          <CardTitle className="text-sand-600">Configurações do sistema</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-sand-400">
            Configurações avançadas serão implementadas em stories futuras.
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
