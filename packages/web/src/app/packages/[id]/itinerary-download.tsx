'use client';

import { Download, FileText } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface ItineraryDownloadProps {
  packageId: string;
}

export function ItineraryDownload({ packageId }: ItineraryDownloadProps) {
  const handleDownload = () => {
    window.open(`/api/packages/${packageId}/itinerary`, '_blank');
  };

  return (
    <Button
      variant="outline"
      className="w-full gap-2"
      onClick={handleDownload}
      data-testid="itinerary-download"
    >
      <FileText className="size-4" />
      <Download className="size-3" />
      Baixar itinerário
    </Button>
  );
}
