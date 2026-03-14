import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import { DestinationCard } from '../destinations/destination-card';
import { FeedSkeleton } from '../destinations/feed-skeleton';
import { FeedFilters } from '../destinations/feed-filters';
import type { CompatibilityResult } from '@travelmatch/shared';

// Mock next/link
vi.mock('next/link', () => ({
  default: ({ children, href, ...props }: { children: React.ReactNode; href: string; [key: string]: unknown }) => (
    <a href={href} {...props}>{children}</a>
  ),
}));

const mockDest: CompatibilityResult = {
  destination_id: 'd1',
  name: 'Chapada dos Veadeiros',
  slug: 'chapada-dos-veadeiros',
  description: 'Natureza exuberante no cerrado goiano',
  state: 'GO',
  city: 'Alto Paraíso de Goiás',
  region: 'centro-oeste',
  cover_url: 'https://example.com/chapada.jpg',
  photo_urls: [],
  tags: ['natureza', 'aventura', 'ecoturismo'],
  best_months: [5, 6, 7, 8, 9],
  avg_daily_cost: 280,
  min_days: 3,
  max_days: 7,
  score: 92,
  cosine_similarity: 0.95,
  match_reasons: ['Altamente compatível com seu perfil DNA', 'Rico em natureza'],
};

describe('DestinationCard', () => {
  it('renders destination name and location', () => {
    render(<DestinationCard destination={mockDest} rank={0} />);
    expect(screen.getByText('Chapada dos Veadeiros')).toBeInTheDocument();
    expect(screen.getByText(/Alto Paraíso de Goiás/)).toBeInTheDocument();
  });

  it('renders score badge', () => {
    render(<DestinationCard destination={mockDest} rank={0} />);
    expect(screen.getByText('92%')).toBeInTheDocument();
  });

  it('renders Top Match badge for rank 0', () => {
    render(<DestinationCard destination={mockDest} rank={0} />);
    expect(screen.getByText(/Top Match/)).toBeInTheDocument();
  });

  it('renders Top Match badge for rank 1 and 2', () => {
    const { rerender } = render(<DestinationCard destination={mockDest} rank={1} />);
    expect(screen.getByText(/Top Match/)).toBeInTheDocument();
    rerender(<DestinationCard destination={mockDest} rank={2} />);
    expect(screen.getByText(/Top Match/)).toBeInTheDocument();
  });

  it('does not render Top Match badge for rank >= 3', () => {
    render(<DestinationCard destination={mockDest} rank={3} />);
    expect(screen.queryByText(/Top Match/)).not.toBeInTheDocument();
  });

  it('renders tags', () => {
    render(<DestinationCard destination={mockDest} rank={0} />);
    expect(screen.getByText('natureza')).toBeInTheDocument();
    expect(screen.getByText('aventura')).toBeInTheDocument();
  });

  it('renders price per day', () => {
    render(<DestinationCard destination={mockDest} rank={0} />);
    expect(screen.getByText('R$ 280/dia')).toBeInTheDocument();
  });

  it('renders days range', () => {
    render(<DestinationCard destination={mockDest} rank={0} />);
    expect(screen.getByText('3-7 dias')).toBeInTheDocument();
  });

  it('renders match reason', () => {
    render(<DestinationCard destination={mockDest} rank={0} />);
    expect(screen.getByText('Altamente compatível com seu perfil DNA')).toBeInTheDocument();
  });

  it('links to destination detail page', () => {
    render(<DestinationCard destination={mockDest} rank={0} />);
    const link = screen.getByTestId('destination-card-chapada-dos-veadeiros');
    expect(link).toHaveAttribute('href', '/destinations/chapada-dos-veadeiros');
  });

  it('renders placeholder when no cover image', () => {
    const noCover = { ...mockDest, cover_url: null };
    render(<DestinationCard destination={noCover} rank={0} />);
    // Should still render without error
    expect(screen.getByText('Chapada dos Veadeiros')).toBeInTheDocument();
  });
});

describe('FeedSkeleton', () => {
  it('renders 6 skeleton cards', () => {
    render(<FeedSkeleton />);
    const skeleton = screen.getByTestId('feed-skeleton');
    expect(skeleton.children).toHaveLength(6);
  });
});

describe('FeedFilters', () => {
  it('renders region and price filters', () => {
    render(
      <FeedFilters
        region=""
        priceRange=""
        onRegionChange={vi.fn()}
        onPriceRangeChange={vi.fn()}
      />,
    );
    expect(screen.getByTestId('filter-region')).toBeInTheDocument();
    expect(screen.getByTestId('filter-price')).toBeInTheDocument();
  });

  it('shows all region options', () => {
    render(
      <FeedFilters
        region=""
        priceRange=""
        onRegionChange={vi.fn()}
        onPriceRangeChange={vi.fn()}
      />,
    );
    expect(screen.getByText('Todas as regiões')).toBeInTheDocument();
    expect(screen.getByText('Nordeste')).toBeInTheDocument();
    expect(screen.getByText('Sul')).toBeInTheDocument();
  });

  it('shows all price options', () => {
    render(
      <FeedFilters
        region=""
        priceRange=""
        onRegionChange={vi.fn()}
        onPriceRangeChange={vi.fn()}
      />,
    );
    expect(screen.getByText('Qualquer preço')).toBeInTheDocument();
    expect(screen.getByText('Até R$200/dia')).toBeInTheDocument();
    expect(screen.getByText('R$400+/dia')).toBeInTheDocument();
  });
});
