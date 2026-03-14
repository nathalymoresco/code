'use client';

import { useState, useEffect } from 'react';
import { WifiOff, Wifi, Download } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface OfflineBannerProps {
  packageId: string;
}

export function OfflineBanner({ packageId }: OfflineBannerProps) {
  const [isOnline, setIsOnline] = useState(true);
  const [cached, setCached] = useState(false);
  const [caching, setCaching] = useState(false);

  useEffect(() => {
    setIsOnline(navigator.onLine);
    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => setIsOnline(false);
    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);
    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  const handleCacheForOffline = async () => {
    setCaching(true);
    try {
      if ('caches' in window) {
        const cache = await caches.open(`travelmatch-pkg-${packageId}`);
        const urlsToCache = [
          `/packages/${packageId}/live`,
          `/api/packages/${packageId}/itinerary`,
        ];
        await cache.addAll(urlsToCache);
        setCached(true);
      }
    } catch {
      // Cache API might not be available
    } finally {
      setCaching(false);
    }
  };

  if (!isOnline) {
    return (
      <div className="flex items-center gap-2 rounded-lg bg-amber-50 px-4 py-2" data-testid="offline-banner">
        <WifiOff className="size-4 text-amber-500" />
        <p className="text-xs font-medium text-amber-700">
          Modo offline — dados salvos disponíveis
        </p>
      </div>
    );
  }

  if (cached) {
    return (
      <div className="flex items-center gap-2 rounded-lg bg-green-50 px-4 py-2" data-testid="cached-banner">
        <Wifi className="size-4 text-green-500" />
        <p className="text-xs font-medium text-green-700">
          Itinerário salvo para uso offline
        </p>
      </div>
    );
  }

  return (
    <Button
      variant="outline"
      size="sm"
      className="w-full gap-2 text-xs"
      onClick={handleCacheForOffline}
      disabled={caching}
      data-testid="cache-button"
    >
      <Download className="size-3" />
      {caching ? 'Salvando...' : 'Salvar para offline'}
    </Button>
  );
}
