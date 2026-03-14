'use client';

import { MessageCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';

interface ConciergeWhatsAppProps {
  packageId: string;
  destinationName: string;
  phone?: string;
}

const DEFAULT_PHONE = '5562999999999';

export function ConciergeWhatsApp({ packageId, destinationName, phone }: ConciergeWhatsAppProps) {
  const conciergePhone = phone ?? DEFAULT_PHONE;
  const message = encodeURIComponent(
    `Olá! Sou viajante TravelMatch.\nPacote: ${packageId.slice(0, 8)}\nDestino: ${destinationName}\n\nPreciso de ajuda!`,
  );
  const whatsappUrl = `https://wa.me/${conciergePhone}?text=${message}`;

  return (
    <Card data-testid="concierge-whatsapp">
      <CardContent className="pt-4">
        <div className="flex items-start gap-3">
          <div className="rounded-full bg-green-100 p-2">
            <MessageCircle className="size-5 text-green-600" />
          </div>
          <div className="flex-1">
            <h3 className="text-sm font-semibold text-sand-800">Concierge TravelMatch</h3>
            <p className="mt-0.5 text-xs text-sand-500">
              Suporte humano antes, durante e após sua viagem
            </p>
            <a href={whatsappUrl} target="_blank" rel="noopener noreferrer" className="mt-3 block">
              <Button
                className="w-full gap-2 bg-green-600 hover:bg-green-700"
                data-testid="whatsapp-button"
              >
                <MessageCircle className="size-4" />
                Falar com concierge
              </Button>
            </a>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
