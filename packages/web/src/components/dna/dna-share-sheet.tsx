'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { shareToChannel, type ShareChannel } from '@/lib/utils/share';
import { trackShare } from '@/lib/utils/analytics';

interface DnaShareSheetProps {
  userId: string;
  dnaLabel: string;
  dnaEmoji: string;
}

const CHANNELS: { id: ShareChannel; icon: string; label: string }[] = [
  { id: 'instagram', icon: '📸', label: 'Instagram' },
  { id: 'whatsapp', icon: '💬', label: 'WhatsApp' },
  { id: 'twitter', icon: '🐦', label: 'Twitter/X' },
  { id: 'copy', icon: '🔗', label: 'Copiar Link' },
];

export function DnaShareSheet({ userId, dnaLabel, dnaEmoji }: DnaShareSheetProps) {
  const [open, setOpen] = useState(false);
  const [copied, setCopied] = useState(false);

  const handleOpen = () => {
    setOpen(true);
    trackShare('dna_share_clicked');
  };

  const handleShare = async (channel: ShareChannel) => {
    await shareToChannel(channel, userId, dnaLabel, dnaEmoji);
    if (channel === 'copy' || channel === 'instagram') {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  return (
    <>
      <Button
        onClick={handleOpen}
        variant="outline"
        className="w-full border-turquoise-300 text-turquoise-600 hover:bg-turquoise-50"
      >
        Compartilhar meu DNA
      </Button>

      {open && (
        <div
          className="fixed inset-0 z-50 flex items-end justify-center bg-black/40 backdrop-blur-sm"
          onClick={() => setOpen(false)}
          data-testid="share-backdrop"
        >
          <Card
            className="w-full max-w-lg animate-slide-up space-y-4 rounded-t-2xl p-6"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="mx-auto h-1 w-10 rounded-full bg-sand-300" />

            <h3 className="text-center text-lg font-semibold text-sand-800">
              Compartilhar DNA
            </h3>

            {/* Preview */}
            <div className="flex items-center justify-center gap-3 rounded-xl bg-sand-50 p-4">
              <span className="text-4xl">{dnaEmoji}</span>
              <div>
                <p className="font-semibold text-turquoise-600">{dnaLabel}</p>
                <p className="text-xs text-sand-500">Meu DNA de Viagem</p>
              </div>
            </div>

            {/* Share buttons */}
            <div className="grid grid-cols-4 gap-3">
              {CHANNELS.map((ch) => (
                <button
                  key={ch.id}
                  onClick={() => handleShare(ch.id)}
                  className="flex flex-col items-center gap-1 rounded-xl p-3 transition-colors hover:bg-sand-100"
                  data-testid={`share-${ch.id}`}
                >
                  <span className="text-2xl">{ch.icon}</span>
                  <span className="text-xs text-sand-600">{ch.label}</span>
                </button>
              ))}
            </div>

            {copied && (
              <p className="text-center text-sm text-turquoise-600" data-testid="copied-toast">
                Link copiado!
              </p>
            )}
          </Card>
        </div>
      )}
    </>
  );
}
