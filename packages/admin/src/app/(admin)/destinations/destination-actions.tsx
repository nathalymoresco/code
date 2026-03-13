'use client';

import { Button } from '@/components/ui/button';
import { Pencil, Copy, Power } from 'lucide-react';
import Link from 'next/link';
import { toggleDestinationActive, duplicateDestination } from './actions';
import { useRouter } from 'next/navigation';
import { useState } from 'react';

interface DestinationActionsProps {
  id: string;
  isActive: boolean;
}

export function DestinationActions({ id, isActive }: DestinationActionsProps) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  async function handleToggle() {
    setLoading(true);
    await toggleDestinationActive(id, !isActive);
    router.refresh();
    setLoading(false);
  }

  async function handleDuplicate() {
    setLoading(true);
    await duplicateDestination(id);
    router.refresh();
    setLoading(false);
  }

  return (
    <div className="flex shrink-0 gap-1">
      <Link href={`/destinations/${id}/edit`}>
        <Button variant="ghost" size="icon" title="Editar">
          <Pencil className="size-4" />
        </Button>
      </Link>
      <Button
        variant="ghost"
        size="icon"
        title="Duplicar"
        onClick={handleDuplicate}
        disabled={loading}
      >
        <Copy className="size-4" />
      </Button>
      <Button
        variant="ghost"
        size="icon"
        title={isActive ? 'Desativar' : 'Ativar'}
        onClick={handleToggle}
        disabled={loading}
      >
        <Power className={`size-4 ${isActive ? 'text-emerald-600' : 'text-sand-400'}`} />
      </Button>
    </div>
  );
}
