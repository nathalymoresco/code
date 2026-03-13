import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { DnaShareSheet } from '../dna-share-sheet';
import { getShareUrl, getShareText } from '@/lib/utils/share';
import { trackShare } from '@/lib/utils/analytics';

vi.mock('@/lib/utils/analytics', () => ({
  trackShare: vi.fn(),
}));

describe('DnaShareSheet', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renders share button', () => {
    render(
      <DnaShareSheet userId="user-123" dnaLabel="Explorador Zen" dnaEmoji="🌿" />,
    );
    expect(screen.getByText('Compartilhar meu DNA')).toBeInTheDocument();
  });

  it('opens share sheet on click', () => {
    render(
      <DnaShareSheet userId="user-123" dnaLabel="Explorador Zen" dnaEmoji="🌿" />,
    );
    fireEvent.click(screen.getByText('Compartilhar meu DNA'));
    expect(screen.getByText('Compartilhar DNA')).toBeInTheDocument();
    expect(screen.getByText('Explorador Zen')).toBeInTheDocument();
  });

  it('renders 4 share options', () => {
    render(
      <DnaShareSheet userId="user-123" dnaLabel="Explorador Zen" dnaEmoji="🌿" />,
    );
    fireEvent.click(screen.getByText('Compartilhar meu DNA'));

    expect(screen.getByTestId('share-instagram')).toBeInTheDocument();
    expect(screen.getByTestId('share-whatsapp')).toBeInTheDocument();
    expect(screen.getByTestId('share-twitter')).toBeInTheDocument();
    expect(screen.getByTestId('share-copy')).toBeInTheDocument();
  });

  it('tracks dna_share_clicked on open', () => {
    render(
      <DnaShareSheet userId="user-123" dnaLabel="Explorador Zen" dnaEmoji="🌿" />,
    );
    fireEvent.click(screen.getByText('Compartilhar meu DNA'));
    expect(trackShare).toHaveBeenCalledWith('dna_share_clicked');
  });

  it('shows copied toast when copy link is clicked', async () => {
    Object.assign(navigator, {
      clipboard: { writeText: vi.fn().mockResolvedValue(undefined) },
    });

    render(
      <DnaShareSheet userId="user-123" dnaLabel="Explorador Zen" dnaEmoji="🌿" />,
    );
    fireEvent.click(screen.getByText('Compartilhar meu DNA'));
    fireEvent.click(screen.getByTestId('share-copy'));

    // Wait for async clipboard operation
    await screen.findByTestId('copied-toast');
    expect(screen.getByText('Link copiado!')).toBeInTheDocument();
  });

  it('closes when backdrop is clicked', () => {
    render(
      <DnaShareSheet userId="user-123" dnaLabel="Explorador Zen" dnaEmoji="🌿" />,
    );
    fireEvent.click(screen.getByText('Compartilhar meu DNA'));
    expect(screen.getByText('Compartilhar DNA')).toBeInTheDocument();

    fireEvent.click(screen.getByTestId('share-backdrop'));
    expect(screen.queryByText('Compartilhar DNA')).not.toBeInTheDocument();
  });
});

describe('Share Utils', () => {
  it('getShareUrl generates correct URL', () => {
    const url = getShareUrl('user-123');
    expect(url).toContain('/profile/dna/user-123');
  });

  it('getShareText includes label and emoji', () => {
    const text = getShareText('Explorador Zen', '🌿');
    expect(text).toContain('🌿');
    expect(text).toContain('Explorador Zen');
  });
});

describe('Analytics Stub', () => {
  it('trackShare does not throw', () => {
    expect(() => trackShare('test_event', { channel: 'copy' })).not.toThrow();
  });
});
