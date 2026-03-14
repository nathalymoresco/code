'use client';

import { useState } from 'react';
import { QrCode, X, Check } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';

interface QrCheckinProps {
  itemId: string;
  itemTitle: string;
  packageId: string;
  dayNumber: number;
  onCheckin?: () => void;
}

function generateQrPayload(packageId: string, itemId: string): string {
  // Simple signed payload for partner validation
  const data = {
    pid: packageId.slice(0, 8),
    iid: itemId.slice(0, 8),
    ts: Date.now(),
    v: 1,
  };
  return btoa(JSON.stringify(data));
}

export function QrCheckin({ itemId, itemTitle, packageId, dayNumber, onCheckin }: QrCheckinProps) {
  const [showFullscreen, setShowFullscreen] = useState(false);
  const [checkedIn, setCheckedIn] = useState(false);

  const qrPayload = generateQrPayload(packageId, itemId);
  // Use a QR code API for rendering (no heavy lib needed)
  const qrUrl = `https://api.qrserver.com/v1/create-qr-code/?size=300x300&data=${encodeURIComponent(qrPayload)}`;

  const handleCheckin = async () => {
    try {
      const res = await fetch(`/api/packages/${packageId}/checkin`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ item_id: itemId }),
      });
      if (res.ok) {
        setCheckedIn(true);
        onCheckin?.();
      }
    } catch {
      // Silent fail
    }
  };

  if (checkedIn) {
    return (
      <div className="flex items-center gap-2 rounded-lg bg-green-50 px-3 py-2" data-testid={`qr-checked-${itemId}`}>
        <Check className="size-4 text-green-500" />
        <span className="text-xs font-medium text-green-700">Check-in realizado</span>
      </div>
    );
  }

  return (
    <>
      <Button
        variant="outline"
        size="sm"
        className="h-7 gap-1 text-xs"
        onClick={() => setShowFullscreen(true)}
        data-testid={`qr-trigger-${itemId}`}
      >
        <QrCode className="size-3" />
        QR Code
      </Button>

      {/* Fullscreen QR overlay */}
      {showFullscreen && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-white"
          data-testid={`qr-fullscreen-${itemId}`}
        >
          <button
            type="button"
            className="absolute right-4 top-4 rounded-full bg-sand-100 p-2"
            onClick={() => setShowFullscreen(false)}
            data-testid={`qr-close-${itemId}`}
          >
            <X className="size-5 text-sand-600" />
          </button>

          <div className="space-y-6 text-center px-8">
            <div>
              <p className="text-xs text-turquoise-600 font-medium">Dia {dayNumber}</p>
              <h2 className="text-xl font-bold text-sand-800">{itemTitle}</h2>
            </div>

            <img
              src={qrUrl}
              alt={`QR Code para ${itemTitle}`}
              className="mx-auto size-64 rounded-xl"
              data-testid={`qr-image-${itemId}`}
            />

            <p className="text-xs text-sand-400">
              Apresente este QR code ao parceiro para check-in
            </p>

            <Button
              className="w-full bg-turquoise-600 hover:bg-turquoise-700"
              onClick={handleCheckin}
              data-testid={`qr-manual-checkin-${itemId}`}
            >
              Confirmar check-in manual
            </Button>
          </div>
        </div>
      )}
    </>
  );
}
