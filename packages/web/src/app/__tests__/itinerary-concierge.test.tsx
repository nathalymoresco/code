import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, act } from '@testing-library/react';
import { CountdownWidget } from '../packages/[id]/countdown-widget';
import { ConciergeWhatsApp } from '../packages/[id]/concierge-whatsapp';
import { ItineraryDownload } from '../packages/[id]/itinerary-download';

describe('CountdownWidget', () => {
  beforeEach(() => {
    vi.useFakeTimers();
  });

  it('renders countdown widget', () => {
    const future = new Date(Date.now() + 10 * 86400000).toISOString().split('T')[0]!;
    vi.setSystemTime(new Date());
    render(<CountdownWidget startDate={future} destinationName="Chapada" />);
    expect(screen.getByTestId('countdown-widget')).toBeInTheDocument();
  });

  it('shows days, hours, minutes', () => {
    const future = new Date(Date.now() + 10 * 86400000).toISOString().split('T')[0]!;
    vi.setSystemTime(new Date());
    render(<CountdownWidget startDate={future} destinationName="Chapada" />);
    expect(screen.getByTestId('countdown-values')).toBeInTheDocument();
    expect(screen.getByTestId('countdown-days')).toBeInTheDocument();
    expect(screen.getByTestId('countdown-hours')).toBeInTheDocument();
    expect(screen.getByTestId('countdown-minutes')).toBeInTheDocument();
  });

  it('shows destination name', () => {
    const future = new Date(Date.now() + 5 * 86400000).toISOString().split('T')[0]!;
    vi.setSystemTime(new Date());
    render(<CountdownWidget startDate={future} destinationName="Chapada" />);
    expect(screen.getByText(/Chapada/)).toBeInTheDocument();
  });

  it('shows "Boa viagem!" when date has passed', () => {
    const past = new Date(Date.now() - 86400000).toISOString().split('T')[0]!;
    vi.setSystemTime(new Date());
    render(<CountdownWidget startDate={past} destinationName="Chapada" />);
    expect(screen.getByText(/Boa viagem/)).toBeInTheDocument();
  });

  afterEach(() => {
    vi.useRealTimers();
  });
});

describe('ConciergeWhatsApp', () => {
  it('renders concierge card', () => {
    render(<ConciergeWhatsApp packageId="pkg-123" destinationName="Chapada" />);
    expect(screen.getByTestId('concierge-whatsapp')).toBeInTheDocument();
    expect(screen.getByText('Concierge TravelMatch')).toBeInTheDocument();
  });

  it('shows WhatsApp button', () => {
    render(<ConciergeWhatsApp packageId="pkg-123" destinationName="Chapada" />);
    expect(screen.getByTestId('whatsapp-button')).toBeInTheDocument();
    expect(screen.getByText('Falar com concierge')).toBeInTheDocument();
  });

  it('generates correct WhatsApp URL with default phone', () => {
    render(<ConciergeWhatsApp packageId="pkg-123" destinationName="Chapada" />);
    const link = screen.getByTestId('whatsapp-button').closest('a');
    expect(link?.href).toContain('wa.me/5562999999999');
  });

  it('uses custom phone when provided', () => {
    render(<ConciergeWhatsApp packageId="pkg-123" destinationName="Chapada" phone="5511988887777" />);
    const link = screen.getByTestId('whatsapp-button').closest('a');
    expect(link?.href).toContain('wa.me/5511988887777');
  });

  it('includes package and destination in message', () => {
    render(<ConciergeWhatsApp packageId="pkg-12345678" destinationName="Chapada" />);
    const link = screen.getByTestId('whatsapp-button').closest('a');
    expect(link?.href).toContain('pkg-1234');
    expect(link?.href).toContain('Chapada');
  });

  it('shows support description', () => {
    render(<ConciergeWhatsApp packageId="pkg-123" destinationName="Chapada" />);
    expect(screen.getByText(/Suporte humano/)).toBeInTheDocument();
  });
});

describe('ItineraryDownload', () => {
  it('renders download button', () => {
    render(<ItineraryDownload packageId="pkg-123" />);
    expect(screen.getByTestId('itinerary-download')).toBeInTheDocument();
    expect(screen.getByText('Baixar itinerário')).toBeInTheDocument();
  });

  it('opens itinerary URL on click', () => {
    const openSpy = vi.spyOn(window, 'open').mockImplementation(() => null);
    render(<ItineraryDownload packageId="pkg-123" />);
    fireEvent.click(screen.getByTestId('itinerary-download'));
    expect(openSpy).toHaveBeenCalledWith('/api/packages/pkg-123/itinerary', '_blank');
    openSpy.mockRestore();
  });
});
