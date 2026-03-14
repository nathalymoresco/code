import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { LiveItinerary } from '../packages/[id]/live/live-itinerary';

const mockItems = [
  {
    id: 'li1', type: 'transfer', title: 'Transfer Aeroporto → Hotel',
    description: 'Motorista particular', day_number: 1,
    start_time: '10:00', end_time: '12:00', price: 150,
    maps_url: 'https://maps.google.com/test', partner: { name: 'TransferGO', phone: '62999001122', address: null },
  },
  {
    id: 'li2', type: 'hospedagem', title: 'Check-in Pousada Sol',
    description: null, day_number: 1,
    start_time: '14:00', end_time: '15:00', price: 0,
    maps_url: null, partner: { name: 'Pousada Sol', phone: null, address: 'Rua do Sol, 123' },
  },
  {
    id: 'li3', type: 'passeio', title: 'Trilha do Mirante',
    description: 'Trilha moderada com guia', day_number: 2,
    start_time: '08:00', end_time: '12:00', price: 120,
    maps_url: 'https://maps.google.com/trilha', partner: { name: 'AventuraCO', phone: null, address: null },
  },
  {
    id: 'li4', type: 'alimentacao', title: 'Almoço Regional',
    description: null, day_number: 2,
    start_time: '12:30', end_time: '14:00', price: 45,
    maps_url: null, partner: null,
  },
  {
    id: 'li5', type: 'passeio', title: 'Cachoeira Santa Bárbara',
    description: 'Saída guiada', day_number: 3,
    start_time: '07:00', end_time: '16:00', price: 180,
    maps_url: null, partner: null,
  },
];

const defaultProps = {
  packageId: 'pkg-1',
  destinationName: 'Chapada dos Veadeiros',
  startDate: '2026-04-01',
  endDate: '2026-04-04',
  items: mockItems,
};

describe('LiveItinerary', () => {
  it('renders live itinerary', () => {
    render(<LiveItinerary {...defaultProps} />);
    expect(screen.getByTestId('live-itinerary')).toBeInTheDocument();
    expect(screen.getByText('Itinerário Ativo')).toBeInTheDocument();
    expect(screen.getByText('Chapada dos Veadeiros')).toBeInTheDocument();
  });

  it('shows day navigation', () => {
    render(<LiveItinerary {...defaultProps} />);
    expect(screen.getByTestId('day-navigation')).toBeInTheDocument();
    expect(screen.getByTestId('day-label')).toBeInTheDocument();
    expect(screen.getByTestId('prev-day')).toBeInTheDocument();
    expect(screen.getByTestId('next-day')).toBeInTheDocument();
  });

  it('shows day dots for navigation', () => {
    render(<LiveItinerary {...defaultProps} />);
    expect(screen.getByTestId('day-dots')).toBeInTheDocument();
  });

  it('navigates to next day', () => {
    render(<LiveItinerary {...defaultProps} />);
    // Start at day 1 (default since trip is in the future)
    expect(screen.getByTestId('day-label')).toHaveTextContent('Dia 1');
    fireEvent.click(screen.getByTestId('next-day'));
    expect(screen.getByTestId('day-label')).toHaveTextContent('Dia 2');
  });

  it('shows items for current day', () => {
    render(<LiveItinerary {...defaultProps} />);
    expect(screen.getByText('Transfer Aeroporto → Hotel')).toBeInTheDocument();
    expect(screen.getByText('Check-in Pousada Sol')).toBeInTheDocument();
  });

  it('shows day 2 items after navigation', () => {
    render(<LiveItinerary {...defaultProps} />);
    fireEvent.click(screen.getByTestId('next-day'));
    expect(screen.getByText('Trilha do Mirante')).toBeInTheDocument();
    expect(screen.getByText('Almoço Regional')).toBeInTheDocument();
  });

  it('shows time range', () => {
    render(<LiveItinerary {...defaultProps} />);
    expect(screen.getByText('10:00 — 12:00')).toBeInTheDocument();
  });

  it('shows partner info', () => {
    render(<LiveItinerary {...defaultProps} />);
    expect(screen.getByText(/TransferGO/)).toBeInTheDocument();
    expect(screen.getByText(/62999001122/)).toBeInTheDocument();
  });

  it('shows Maps button when maps_url exists', () => {
    render(<LiveItinerary {...defaultProps} />);
    expect(screen.getByTestId('maps-li1')).toBeInTheDocument();
  });

  it('shows status action buttons for pending items', () => {
    render(<LiveItinerary {...defaultProps} />);
    expect(screen.getByTestId('mark-done-li1')).toBeInTheDocument();
    expect(screen.getByTestId('mark-skip-li1')).toBeInTheDocument();
    expect(screen.getByTestId('mark-issue-li1')).toBeInTheDocument();
  });

  it('marks item as done', () => {
    render(<LiveItinerary {...defaultProps} />);
    fireEvent.click(screen.getByTestId('mark-done-li1'));
    expect(screen.getByTestId('status-li1')).toHaveTextContent('Feito');
  });

  it('marks item as skipped', () => {
    render(<LiveItinerary {...defaultProps} />);
    fireEvent.click(screen.getByTestId('mark-skip-li2'));
    expect(screen.getByTestId('status-li2')).toHaveTextContent('Pulou');
  });

  it('marks item as issue', () => {
    render(<LiveItinerary {...defaultProps} />);
    fireEvent.click(screen.getByTestId('mark-issue-li1'));
    expect(screen.getByTestId('status-li1')).toHaveTextContent('Problema');
  });

  it('shows empty day message for days with no items', () => {
    render(<LiveItinerary {...defaultProps} items={[]} />);
    expect(screen.getByTestId('empty-day')).toBeInTheDocument();
  });

  it('disables prev button on day 1', () => {
    render(<LiveItinerary {...defaultProps} />);
    expect(screen.getByTestId('prev-day')).toBeDisabled();
  });
});
