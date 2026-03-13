import { trackShare } from './analytics';

export function getShareUrl(userId: string): string {
  const baseUrl = typeof window !== 'undefined' ? window.location.origin : 'https://travelmatch.com.br';
  return `${baseUrl}/profile/dna/${userId}`;
}

export function getShareText(label: string, emoji: string): string {
  return `${emoji} Meu DNA de Viagem é "${label}"! Descubra o seu:`;
}

export type ShareChannel = 'instagram' | 'whatsapp' | 'twitter' | 'copy';

export async function shareToChannel(
  channel: ShareChannel,
  userId: string,
  label: string,
  emoji: string,
): Promise<void> {
  const url = getShareUrl(userId);
  const text = getShareText(label, emoji);

  trackShare('dna_shared', { channel });

  switch (channel) {
    case 'whatsapp':
      window.open(`https://wa.me/?text=${encodeURIComponent(`${text} ${url}`)}`, '_blank');
      break;
    case 'twitter':
      window.open(
        `https://twitter.com/intent/tweet?url=${encodeURIComponent(url)}&text=${encodeURIComponent(text)}`,
        '_blank',
      );
      break;
    case 'instagram':
      // Instagram doesn't have a web share URL — fallback to copy
      await navigator.clipboard.writeText(`${text} ${url}`);
      break;
    case 'copy':
      await navigator.clipboard.writeText(url);
      break;
  }
}
