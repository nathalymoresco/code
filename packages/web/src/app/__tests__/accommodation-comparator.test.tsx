import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { AccommodationComparator } from '../packages/[id]/accommodation-comparator';

const mockOptions = [
  {
    id: 'h1', name: 'Pousada Sol', type: 'pousada',
    description: 'Aconchegante', cover_url: null,
    price_range: 'moderado', daily_rate: 250,
    rating: 4.5, review_count: 12,
    amenities: ['wifi', 'piscina', 'café da manhã'],
    dna_score: 88,
  },
  {
    id: 'h2', name: 'Hotel Cerrado', type: 'hotel',
    description: 'Confortável', cover_url: null,
    price_range: 'moderado', daily_rate: 350,
    rating: 4.2, review_count: 8,
    amenities: ['wifi', 'academia', 'restaurante', 'estacionamento'],
    dna_score: 72,
  },
  {
    id: 'h3', name: 'Airbnb Chalé', type: 'airbnb',
    description: 'Chalé privativo', cover_url: null,
    price_range: 'economico', daily_rate: 180,
    rating: 4.8, review_count: 25,
    amenities: ['wifi', 'cozinha'],
    dna_score: 65,
  },
];

describe('AccommodationComparator', () => {
  it('renders all accommodation cards', () => {
    render(
      <AccommodationComparator
        options={mockOptions}
        currentPartnerId="h1"
        nights={4}
        numTravelers={2}
        onSelect={vi.fn()}
      />,
    );
    expect(screen.getByText('Pousada Sol')).toBeInTheDocument();
    expect(screen.getByText('Hotel Cerrado')).toBeInTheDocument();
    expect(screen.getByText('Airbnb Chalé')).toBeInTheDocument();
  });

  it('shows Recomendado badge on highest DNA score', () => {
    render(
      <AccommodationComparator
        options={mockOptions}
        currentPartnerId="h2"
        nights={4}
        numTravelers={2}
        onSelect={vi.fn()}
      />,
    );
    // Pousada Sol has highest dna_score (88)
    expect(screen.getByText('Recomendado')).toBeInTheDocument();
  });

  it('shows Selecionado for current partner', () => {
    render(
      <AccommodationComparator
        options={mockOptions}
        currentPartnerId="h1"
        nights={4}
        numTravelers={2}
        onSelect={vi.fn()}
      />,
    );
    expect(screen.getByText('Selecionado')).toBeInTheDocument();
  });

  it('shows Selecionar buttons for non-current options', () => {
    render(
      <AccommodationComparator
        options={mockOptions}
        currentPartnerId="h1"
        nights={4}
        numTravelers={2}
        onSelect={vi.fn()}
      />,
    );
    const selectButtons = screen.getAllByText('Selecionar');
    expect(selectButtons).toHaveLength(2);
  });

  it('calls onSelect when clicking Selecionar', () => {
    const onSelect = vi.fn();
    render(
      <AccommodationComparator
        options={mockOptions}
        currentPartnerId="h1"
        nights={4}
        numTravelers={2}
        onSelect={onSelect}
      />,
    );
    const selectButtons = screen.getAllByText('Selecionar');
    fireEvent.click(selectButtons[0]!);
    expect(onSelect).toHaveBeenCalled();
  });

  it('shows DNA score percentage for each option', () => {
    render(
      <AccommodationComparator
        options={mockOptions}
        currentPartnerId="h1"
        nights={4}
        numTravelers={2}
        onSelect={vi.fn()}
      />,
    );
    expect(screen.getByText('88%')).toBeInTheDocument();
    expect(screen.getByText('72%')).toBeInTheDocument();
    expect(screen.getByText('65%')).toBeInTheDocument();
  });

  it('calculates total price correctly', () => {
    render(
      <AccommodationComparator
        options={mockOptions}
        currentPartnerId="h1"
        nights={4}
        numTravelers={2}
        onSelect={vi.fn()}
      />,
    );
    // Pousada Sol: 250 * 2 * 4 = 2000
    expect(screen.getByText(/2\.000,00/)).toBeInTheDocument();
    // Hotel Cerrado: 350 * 2 * 4 = 2800
    expect(screen.getByText(/2\.800,00/)).toBeInTheDocument();
  });

  it('shows ratings', () => {
    render(
      <AccommodationComparator
        options={mockOptions}
        currentPartnerId="h1"
        nights={4}
        numTravelers={2}
        onSelect={vi.fn()}
      />,
    );
    expect(screen.getByText('4.5')).toBeInTheDocument();
    expect(screen.getByText('(12)')).toBeInTheDocument();
    expect(screen.getByText('4.8')).toBeInTheDocument();
  });

  it('shows amenities', () => {
    render(
      <AccommodationComparator
        options={mockOptions}
        currentPartnerId="h1"
        nights={4}
        numTravelers={2}
        onSelect={vi.fn()}
      />,
    );
    expect(screen.getAllByText('wifi').length).toBeGreaterThan(0);
    expect(screen.getByText('piscina')).toBeInTheDocument();
  });

  it('shows no-comparator message when < 2 options', () => {
    render(
      <AccommodationComparator
        options={[mockOptions[0]!]}
        currentPartnerId="h1"
        nights={4}
        numTravelers={2}
        onSelect={vi.fn()}
      />,
    );
    expect(screen.getByTestId('no-comparator')).toBeInTheDocument();
    expect(screen.getByText(/Apenas uma opção/)).toBeInTheDocument();
  });

  it('shows empty message when no options', () => {
    render(
      <AccommodationComparator
        options={[]}
        currentPartnerId={null}
        nights={4}
        numTravelers={2}
        onSelect={vi.fn()}
      />,
    );
    expect(screen.getByText(/Nenhuma hospedagem/)).toBeInTheDocument();
  });

  it('renders WCAG accessibility note', () => {
    render(
      <AccommodationComparator
        options={mockOptions}
        currentPartnerId="h1"
        nights={4}
        numTravelers={2}
        onSelect={vi.fn()}
      />,
    );
    expect(screen.getByRole('note')).toBeInTheDocument();
  });
});
