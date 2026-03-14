import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { OfflineBanner } from '../packages/[id]/live/offline-banner';
import { ConciergeChat } from '../packages/[id]/live/concierge-chat';
import { ReviewForm } from '../packages/[id]/review/review-form';
import { DiaryView } from '../packages/[id]/diary/diary-view';

global.fetch = vi.fn(() =>
  Promise.resolve({ ok: true, json: () => Promise.resolve({ response: 'Olá!' }) }),
) as unknown as typeof fetch;

// ===============================
// Story 4.3: Offline Banner
// ===============================
describe('OfflineBanner', () => {
  it('renders cache button when online', () => {
    vi.spyOn(navigator, 'onLine', 'get').mockReturnValue(true);
    render(<OfflineBanner packageId="pkg-1" />);
    expect(screen.getByTestId('cache-button')).toBeInTheDocument();
    expect(screen.getByText('Salvar para offline')).toBeInTheDocument();
  });
});

// ===============================
// Story 4.4: Concierge Chat
// ===============================
describe('ConciergeChat', () => {
  it('renders chat FAB button', () => {
    render(<ConciergeChat packageId="pkg-1" destinationName="Chapada" />);
    expect(screen.getByTestId('chat-fab')).toBeInTheDocument();
  });

  it('opens chat panel on FAB click', () => {
    render(<ConciergeChat packageId="pkg-1" destinationName="Chapada" />);
    fireEvent.click(screen.getByTestId('chat-fab'));
    expect(screen.getByTestId('chat-panel')).toBeInTheDocument();
  });

  it('shows welcome message', () => {
    render(<ConciergeChat packageId="pkg-1" destinationName="Chapada" />);
    fireEvent.click(screen.getByTestId('chat-fab'));
    expect(screen.getByText(/Sou o assistente TravelMatch/)).toBeInTheDocument();
  });

  it('has input and send button', () => {
    render(<ConciergeChat packageId="pkg-1" destinationName="Chapada" />);
    fireEvent.click(screen.getByTestId('chat-fab'));
    expect(screen.getByTestId('chat-input')).toBeInTheDocument();
    expect(screen.getByTestId('chat-send')).toBeInTheDocument();
  });

  it('shows escalate WhatsApp button', () => {
    render(<ConciergeChat packageId="pkg-1" destinationName="Chapada" />);
    fireEvent.click(screen.getByTestId('chat-fab'));
    expect(screen.getByTestId('escalate-whatsapp')).toBeInTheDocument();
  });

  it('closes chat on X click', () => {
    render(<ConciergeChat packageId="pkg-1" destinationName="Chapada" />);
    fireEvent.click(screen.getByTestId('chat-fab'));
    fireEvent.click(screen.getByTestId('chat-close'));
    expect(screen.queryByTestId('chat-panel')).not.toBeInTheDocument();
  });

  it('detects escalation keywords', async () => {
    render(<ConciergeChat packageId="pkg-1" destinationName="Chapada" />);
    fireEvent.click(screen.getByTestId('chat-fab'));
    fireEvent.change(screen.getByTestId('chat-input'), { target: { value: 'emergência!' } });
    fireEvent.click(screen.getByTestId('chat-send'));
    expect(await screen.findByText(/suporte urgente/)).toBeInTheDocument();
  });

  it('shows service hours', () => {
    render(<ConciergeChat packageId="pkg-1" destinationName="Chapada" />);
    fireEvent.click(screen.getByTestId('chat-fab'));
    expect(screen.getByText(/IA 24\/7/)).toBeInTheDocument();
  });
});

// ===============================
// Story 4.5: Review Form
// ===============================
const reviewItems = [
  { id: 'ri1', title: 'Trilha do Mirante', type: 'passeio', partnerName: 'AventuraCO' },
  { id: 'ri2', title: 'Pousada Sol', type: 'hospedagem', partnerName: 'Pousada Sol' },
  { id: 'ri3', title: 'Seguro Viagem', type: 'seguro', partnerName: null },
];

describe('ReviewForm', () => {
  const defaultProps = {
    packageId: 'pkg-1',
    destinationName: 'Chapada dos Veadeiros',
    items: reviewItems,
  };

  it('renders review form', () => {
    render(<ReviewForm {...defaultProps} />);
    expect(screen.getByTestId('review-form')).toBeInTheDocument();
    expect(screen.getByText('Avaliar Viagem')).toBeInTheDocument();
  });

  it('shows overall star rating', () => {
    render(<ReviewForm {...defaultProps} />);
    expect(screen.getByTestId('overall-stars')).toBeInTheDocument();
  });

  it('shows reviewable items (excludes seguro)', () => {
    render(<ReviewForm {...defaultProps} />);
    expect(screen.getByTestId('review-item-ri1')).toBeInTheDocument();
    expect(screen.getByTestId('review-item-ri2')).toBeInTheDocument();
    expect(screen.queryByTestId('review-item-ri3')).not.toBeInTheDocument();
  });

  it('shows NPS scale', () => {
    render(<ReviewForm {...defaultProps} />);
    expect(screen.getByTestId('nps-scale')).toBeInTheDocument();
    expect(screen.getByTestId('nps-0')).toBeInTheDocument();
    expect(screen.getByTestId('nps-10')).toBeInTheDocument();
  });

  it('disables submit without overall rating', () => {
    render(<ReviewForm {...defaultProps} />);
    expect(screen.getByTestId('submit-review')).toBeDisabled();
  });

  it('enables submit after rating', () => {
    render(<ReviewForm {...defaultProps} />);
    fireEvent.click(screen.getByTestId('overall-star-4'));
    expect(screen.getByTestId('submit-review')).not.toBeDisabled();
  });

  it('shows partner name under item', () => {
    render(<ReviewForm {...defaultProps} />);
    expect(screen.getByText('AventuraCO')).toBeInTheDocument();
  });

  it('has general comment field', () => {
    render(<ReviewForm {...defaultProps} />);
    expect(screen.getByTestId('general-comment')).toBeInTheDocument();
  });
});

// ===============================
// Story 4.6: Diary View
// ===============================
const diaryItems = [
  { id: 'd1', title: 'Transfer Aeroporto', type: 'transfer', day_number: 1, description: null },
  { id: 'd2', title: 'Trilha do Mirante', type: 'passeio', day_number: 2, description: 'Trilha moderada' },
  { id: 'd3', title: 'Cachoeira', type: 'passeio', day_number: 3, description: null },
];

describe('DiaryView', () => {
  const defaultProps = {
    packageId: 'pkg-1',
    destinationName: 'Chapada dos Veadeiros',
    destinationState: 'GO',
    coverUrl: null,
    startDate: '2026-04-01',
    endDate: '2026-04-04',
    numTravelers: 2,
    items: diaryItems,
  };

  it('renders diary view', () => {
    render(<DiaryView {...defaultProps} />);
    expect(screen.getByTestId('diary-view')).toBeInTheDocument();
  });

  it('shows destination cover', () => {
    render(<DiaryView {...defaultProps} />);
    expect(screen.getByTestId('diary-cover')).toBeInTheDocument();
    expect(screen.getByText('Chapada dos Veadeiros')).toBeInTheDocument();
  });

  it('shows timeline with days', () => {
    render(<DiaryView {...defaultProps} />);
    expect(screen.getByTestId('diary-timeline')).toBeInTheDocument();
    expect(screen.getByTestId('diary-day-1')).toBeInTheDocument();
    expect(screen.getByTestId('diary-day-2')).toBeInTheDocument();
    expect(screen.getByTestId('diary-day-3')).toBeInTheDocument();
  });

  it('shows items in their days', () => {
    render(<DiaryView {...defaultProps} />);
    expect(screen.getByText('Transfer Aeroporto')).toBeInTheDocument();
    expect(screen.getByText('Trilha do Mirante')).toBeInTheDocument();
  });

  it('shows photo upload button', () => {
    render(<DiaryView {...defaultProps} />);
    expect(screen.getByTestId('upload-photo-1')).toBeInTheDocument();
  });

  it('shows share button', () => {
    render(<DiaryView {...defaultProps} />);
    expect(screen.getByTestId('share-diary')).toBeInTheDocument();
    expect(screen.getByText('Compartilhar diário')).toBeInTheDocument();
  });

  it('shows viral CTA', () => {
    render(<DiaryView {...defaultProps} />);
    expect(screen.getByTestId('diary-cta')).toBeInTheDocument();
  });

  it('shows traveler count', () => {
    render(<DiaryView {...defaultProps} />);
    expect(screen.getByText(/2 viajantes/)).toBeInTheDocument();
  });
});
