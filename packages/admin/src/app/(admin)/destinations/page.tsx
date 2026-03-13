import { Card, CardContent } from '@/components/ui/card';
import { MapPin } from 'lucide-react';

export default function DestinationsPage() {
  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-sand-800">Destinos</h1>
      <Card>
        <CardContent className="flex flex-col items-center py-12 text-center">
          <MapPin className="mb-4 size-12 text-sand-300" />
          <p className="text-lg font-medium text-sand-600">Nenhum destino cadastrado</p>
          <p className="mt-1 text-sm text-sand-400">
            CRUD de destinos será implementado na Story 2.3
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
