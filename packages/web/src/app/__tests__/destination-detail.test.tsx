import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import { MonthCalendar } from '../destinations/[slug]/month-calendar';
import { WhyForYou } from '../destinations/[slug]/why-for-you';
import { PartnerSection } from '../destinations/[slug]/partner-section';
import { DestinationGallery } from '../destinations/[slug]/destination-gallery';

// Mock next/link
vi.mock('next/link', () => ({
  default: ({ children, href, ...props }: { children: React.ReactNode; href: string; [key: string]: unknown }) => (
    <a href={href} {...props}>{children}</a>
  ),
}));

describe('MonthCalendar', () => {
  it('renders 12 months', () => {
    render(<MonthCalendar bestMonths={[5, 6, 7]} />);
    const calendar = screen.getByTestId('month-calendar');
    expect(calendar.children).toHaveLength(12);
  });

  it('marks best months with checkmark', () => {
    render(<MonthCalendar bestMonths={[1, 2]} />);
    // Jan and Fev should have checkmarks
    expect(screen.getByText('Jan').parentElement?.textContent).toContain('✓');
    expect(screen.getByText('Fev').parentElement?.textContent).toContain('✓');
    // Mar should not
    expect(screen.getByText('Mar').parentElement?.textContent).not.toContain('✓');
  });

  it('renders all month labels', () => {
    render(<MonthCalendar bestMonths={[]} />);
    expect(screen.getByText('Jan')).toBeInTheDocument();
    expect(screen.getByText('Jun')).toBeInTheDocument();
    expect(screen.getByText('Dez')).toBeInTheDocument();
  });
});

describe('WhyForYou', () => {
  const dimensions = [
    { dimension: 'natureza' as const, label: 'Natureza', score: 95 },
    { dimension: 'aventura' as const, label: 'Aventura', score: 88 },
    { dimension: 'relax' as const, label: 'Relax', score: 82 },
  ];

  it('renders section title with destination name', () => {
    render(<WhyForYou dimensions={dimensions} destinationName="Chapada" />);
    expect(screen.getByText('Por que Chapada é para você')).toBeInTheDocument();
  });

  it('renders all dimension items', () => {
    render(<WhyForYou dimensions={dimensions} destinationName="Chapada" />);
    expect(screen.getByText('Natureza')).toBeInTheDocument();
    expect(screen.getByText('Aventura')).toBeInTheDocument();
    expect(screen.getByText('Relax')).toBeInTheDocument();
  });

  it('shows dimension scores', () => {
    render(<WhyForYou dimensions={dimensions} destinationName="Chapada" />);
    expect(screen.getByText('95')).toBeInTheDocument();
    expect(screen.getByText('88')).toBeInTheDocument();
  });

  it('shows descriptive text for each dimension', () => {
    render(<WhyForYou dimensions={dimensions} destinationName="Chapada" />);
    expect(screen.getByText(/experiências ricas em natureza/)).toBeInTheDocument();
    expect(screen.getByText(/aventuras que vão acelerar/)).toBeInTheDocument();
  });
});

describe('PartnerSection', () => {
  const partners = [
    {
      id: 'p1',
      name: 'Pousada Sol',
      type: 'pousada',
      description: 'Pousada aconchegante',
      cover_url: null,
      price_range: 'moderado',
      daily_rate: 250,
      rating: 4.5,
      review_count: 12,
      amenities: ['wifi', 'piscina', 'café'],
    },
    {
      id: 'p2',
      name: 'Trilha Aventura',
      type: 'experiencia',
      description: 'Trilhas guiadas',
      cover_url: null,
      price_range: null,
      daily_rate: null,
      rating: 0,
      review_count: 0,
      amenities: [],
    },
  ];

  it('renders section title', () => {
    render(<PartnerSection title="Onde ficar" partners={partners} />);
    expect(screen.getByText('Onde ficar')).toBeInTheDocument();
  });

  it('renders partner cards', () => {
    render(<PartnerSection title="Onde ficar" partners={partners} />);
    expect(screen.getByText('Pousada Sol')).toBeInTheDocument();
    expect(screen.getByText('Trilha Aventura')).toBeInTheDocument();
  });

  it('shows rating when available', () => {
    render(<PartnerSection title="Onde ficar" partners={partners} />);
    expect(screen.getByText('4.5')).toBeInTheDocument();
    expect(screen.getByText('(12)')).toBeInTheDocument();
  });

  it('shows daily rate', () => {
    render(<PartnerSection title="Onde ficar" partners={partners} />);
    expect(screen.getByText('R$ 250/dia')).toBeInTheDocument();
  });

  it('shows amenities preview', () => {
    render(<PartnerSection title="Onde ficar" partners={partners} />);
    expect(screen.getByText('wifi, piscina')).toBeInTheDocument();
  });
});

describe('DestinationGallery', () => {
  it('renders photo thumbnails', () => {
    const photos = ['https://example.com/1.jpg', 'https://example.com/2.jpg'];
    render(<DestinationGallery photos={photos} name="Test" />);
    const gallery = screen.getByTestId('gallery');
    expect(gallery.children).toHaveLength(2);
  });

  it('limits to 8 photos', () => {
    const photos = Array.from({ length: 12 }, (_, i) => `https://example.com/${i}.jpg`);
    render(<DestinationGallery photos={photos} name="Test" />);
    const gallery = screen.getByTestId('gallery');
    expect(gallery.children).toHaveLength(8);
  });
});
