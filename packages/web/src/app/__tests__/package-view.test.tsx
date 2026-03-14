import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import { PackageTimeline } from '../packages/[id]/package-timeline';
import { PackageSummary } from '../packages/[id]/package-summary';
import type { PackageItem, Package } from '@travelmatch/shared';

vi.mock('next/link', () => ({
  default: ({ children, href, ...props }: { children: React.ReactNode; href: string; [key: string]: unknown }) => (
    <a href={href} {...props}>{children}</a>
  ),
}));

const mockItems: PackageItem[] = [
  {
    id: 'i1', package_id: 'p1', partner_id: 't1', type: 'transfer',
    title: 'Transfer: Aeroporto → Chapada', description: 'Van compartilhada',
    date: '2026-06-01', start_time: '10:00', end_time: '12:00',
    price: 160, day_number: 1, sort_order: 1, is_removable: false, maps_url: null, created_at: '',
  },
  {
    id: 'i2', package_id: 'p1', partner_id: 'h1', type: 'hospedagem',
    title: 'Check-in: Pousada Sol', description: 'Pousada aconchegante',
    date: '2026-06-01', start_time: '14:00', end_time: null,
    price: 500, day_number: 1, sort_order: 2, is_removable: false, maps_url: null, created_at: '',
  },
  {
    id: 'i3', package_id: 'p1', partner_id: 'a1', type: 'passeio',
    title: 'Trilha das Cachoeiras', description: 'Trilha guiada',
    date: '2026-06-02', start_time: '08:00', end_time: '12:00',
    price: 200, day_number: 2, sort_order: 1, is_removable: true, maps_url: null, created_at: '',
  },
  {
    id: 'i4', package_id: 'p1', partner_id: 'r1', type: 'alimentacao',
    title: 'Almoço: Restaurante Cerrado', description: null,
    date: '2026-06-02', start_time: '12:00', end_time: '13:30',
    price: 100, day_number: 2, sort_order: 2, is_removable: true, maps_url: null, created_at: '',
  },
  {
    id: 'i5', package_id: 'p1', partner_id: null, type: 'seguro',
    title: 'Seguro Viagem Básico', description: 'Cancelamento, emergência',
    date: '2026-06-01', start_time: null, end_time: null,
    price: 72, day_number: 1, sort_order: 0, is_removable: false, maps_url: null, created_at: '',
  },
];

const mockPkg: Package = {
  id: 'p1', profile_id: 'pr1', destination_id: 'd1', status: 'draft',
  total_price: 1186.80, markup_percentage: 15, start_date: '2026-06-01',
  end_date: '2026-06-04', num_travelers: 2, comfort_level: 'conforto',
  compatibility_score: 87, insurance_included: true, insurance_provider: null,
  insurance_policy_number: null, notes: null, created_at: '', updated_at: '',
};

describe('PackageTimeline', () => {
  it('renders day headers', () => {
    render(<PackageTimeline items={mockItems} startDate="2026-06-01" totalDays={3} />);
    expect(screen.getByText('Dia 1')).toBeInTheDocument();
    expect(screen.getByText('Dia 2')).toBeInTheDocument();
    expect(screen.getByText('Dia 3')).toBeInTheDocument();
  });

  it('renders item titles', () => {
    render(<PackageTimeline items={mockItems} startDate="2026-06-01" totalDays={3} />);
    expect(screen.getByText('Transfer: Aeroporto → Chapada')).toBeInTheDocument();
    expect(screen.getByText('Check-in: Pousada Sol')).toBeInTheDocument();
    expect(screen.getByText('Trilha das Cachoeiras')).toBeInTheDocument();
  });

  it('renders time slots', () => {
    render(<PackageTimeline items={mockItems} startDate="2026-06-01" totalDays={3} />);
    expect(screen.getByText('10:00 — 12:00')).toBeInTheDocument();
    expect(screen.getByText('08:00 — 12:00')).toBeInTheDocument();
  });

  it('shows free day message for days without items', () => {
    render(<PackageTimeline items={mockItems} startDate="2026-06-01" totalDays={3} />);
    expect(screen.getByText(/Dia livre/)).toBeInTheDocument();
  });

  it('renders prices for items', () => {
    render(<PackageTimeline items={mockItems} startDate="2026-06-01" totalDays={3} />);
    expect(screen.getByText(/160,00/)).toBeInTheDocument();
    expect(screen.getByText(/500,00/)).toBeInTheDocument();
  });
});

describe('PackageSummary', () => {
  it('renders category groups', () => {
    render(<PackageSummary pkg={mockPkg} items={mockItems} totalDays={3} />);
    // Each category appears twice: in the card and in the breakdown
    expect(screen.getAllByText('Transfers').length).toBeGreaterThanOrEqual(1);
    expect(screen.getAllByText('Hospedagem').length).toBeGreaterThanOrEqual(1);
    expect(screen.getAllByText('Passeios').length).toBeGreaterThanOrEqual(1);
    expect(screen.getAllByText('Alimentação').length).toBeGreaterThanOrEqual(1);
    expect(screen.getAllByText('Seguro').length).toBeGreaterThanOrEqual(1);
  });

  it('renders price breakdown', () => {
    render(<PackageSummary pkg={mockPkg} items={mockItems} totalDays={3} />);
    const breakdown = screen.getByTestId('price-breakdown');
    expect(breakdown).toBeInTheDocument();
    expect(screen.getByText('Total')).toBeInTheDocument();
  });

  it('shows markup percentage', () => {
    render(<PackageSummary pkg={mockPkg} items={mockItems} totalDays={3} />);
    expect(screen.getByText(/Taxa de serviço \(15%\)/)).toBeInTheDocument();
  });

  it('shows item count per category', () => {
    render(<PackageSummary pkg={mockPkg} items={mockItems} totalDays={3} />);
    // Each single-item category shows "1 item"
    const singleItems = screen.getAllByText('1 item');
    expect(singleItems.length).toBeGreaterThan(0);
  });
});
