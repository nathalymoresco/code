'use client';

import { Button } from '@/components/ui/button';
import { Pencil, CheckCircle, XCircle } from 'lucide-react';
import Link from 'next/link';
import { curatePartner, updatePartnerStatus } from './actions';
import { useRouter } from 'next/navigation';
import { useState } from 'react';

interface PartnerActionsProps {
  id: string;
  isCurated: boolean;
  status: string;
}

export function PartnerActions({ id, isCurated, status }: PartnerActionsProps) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  async function handleCurate() {
    setLoading(true);
    await curatePartner(id);
    router.refresh();
    setLoading(false);
  }

  async function handleSuspend() {
    setLoading(true);
    await updatePartnerStatus(id, status === 'suspended' ? 'active' : 'suspended');
    router.refresh();
    setLoading(false);
  }

  return (
    <div className="flex shrink-0 gap-1">
      <Link href={`/partners/${id}/edit`}>
        <Button variant="ghost" size="icon" title="Editar">
          <Pencil className="size-4" />
        </Button>
      </Link>
      {!isCurated && (
        <Button
          variant="ghost"
          size="icon"
          title="Curar parceiro"
          onClick={handleCurate}
          disabled={loading}
        >
          <CheckCircle className="size-4 text-turquoise-600" />
        </Button>
      )}
      <Button
        variant="ghost"
        size="icon"
        title={status === 'suspended' ? 'Reativar' : 'Suspender'}
        onClick={handleSuspend}
        disabled={loading}
      >
        <XCircle className={`size-4 ${status === 'suspended' ? 'text-amber-500' : 'text-sand-400'}`} />
      </Button>
    </div>
  );
}
