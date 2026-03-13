import { Card, CardContent } from '@/components/ui/card';
import { Users } from 'lucide-react';

export default function PartnersPage() {
  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-sand-800">Parceiros</h1>
      <Card>
        <CardContent className="flex flex-col items-center py-12 text-center">
          <Users className="mb-4 size-12 text-sand-300" />
          <p className="text-lg font-medium text-sand-600">Nenhum parceiro cadastrado</p>
          <p className="mt-1 text-sm text-sand-400">
            Onboarding de parceiros será implementado na Story 2.4
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
