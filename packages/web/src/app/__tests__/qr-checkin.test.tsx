import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { QrCheckin } from '../packages/[id]/live/qr-checkin';

global.fetch = vi.fn(() => Promise.resolve({ ok: true, json: () => Promise.resolve({ success: true }) })) as unknown as typeof fetch;

const defaultProps = {
  itemId: 'item-abc123',
  itemTitle: 'Trilha do Mirante',
  packageId: 'pkg-xyz789',
  dayNumber: 2,
  onCheckin: vi.fn(),
};

describe('QrCheckin', () => {
  it('renders QR trigger button', () => {
    render(<QrCheckin {...defaultProps} />);
    expect(screen.getByTestId('qr-trigger-item-abc123')).toBeInTheDocument();
    expect(screen.getByText('QR Code')).toBeInTheDocument();
  });

  it('opens fullscreen QR on click', () => {
    render(<QrCheckin {...defaultProps} />);
    fireEvent.click(screen.getByTestId('qr-trigger-item-abc123'));
    expect(screen.getByTestId('qr-fullscreen-item-abc123')).toBeInTheDocument();
  });

  it('shows item title in fullscreen', () => {
    render(<QrCheckin {...defaultProps} />);
    fireEvent.click(screen.getByTestId('qr-trigger-item-abc123'));
    expect(screen.getByText('Trilha do Mirante')).toBeInTheDocument();
  });

  it('shows day number in fullscreen', () => {
    render(<QrCheckin {...defaultProps} />);
    fireEvent.click(screen.getByTestId('qr-trigger-item-abc123'));
    expect(screen.getByText('Dia 2')).toBeInTheDocument();
  });

  it('shows QR code image', () => {
    render(<QrCheckin {...defaultProps} />);
    fireEvent.click(screen.getByTestId('qr-trigger-item-abc123'));
    expect(screen.getByTestId('qr-image-item-abc123')).toBeInTheDocument();
  });

  it('closes fullscreen on X click', () => {
    render(<QrCheckin {...defaultProps} />);
    fireEvent.click(screen.getByTestId('qr-trigger-item-abc123'));
    expect(screen.getByTestId('qr-fullscreen-item-abc123')).toBeInTheDocument();
    fireEvent.click(screen.getByTestId('qr-close-item-abc123'));
    expect(screen.queryByTestId('qr-fullscreen-item-abc123')).not.toBeInTheDocument();
  });

  it('shows manual checkin button', () => {
    render(<QrCheckin {...defaultProps} />);
    fireEvent.click(screen.getByTestId('qr-trigger-item-abc123'));
    expect(screen.getByTestId('qr-manual-checkin-item-abc123')).toBeInTheDocument();
    expect(screen.getByText('Confirmar check-in manual')).toBeInTheDocument();
  });

  it('calls fetch on manual checkin', () => {
    const fetchSpy = vi.spyOn(global, 'fetch');
    render(<QrCheckin {...defaultProps} />);
    fireEvent.click(screen.getByTestId('qr-trigger-item-abc123'));
    fireEvent.click(screen.getByTestId('qr-manual-checkin-item-abc123'));
    expect(fetchSpy).toHaveBeenCalledWith(
      '/api/packages/pkg-xyz789/checkin',
      expect.objectContaining({ method: 'POST' }),
    );
  });

  it('shows partner instruction text', () => {
    render(<QrCheckin {...defaultProps} />);
    fireEvent.click(screen.getByTestId('qr-trigger-item-abc123'));
    expect(screen.getByText(/Apresente este QR code/)).toBeInTheDocument();
  });
});
