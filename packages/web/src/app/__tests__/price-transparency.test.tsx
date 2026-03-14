import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { PriceTransparency } from '../packages/[id]/price-transparency';
import { Guarantees } from '../packages/[id]/guarantees';
import { CancellationPolicy } from '../packages/[id]/cancellation-policy';
import type { PackageItem } from '@travelmatch/shared';

const mockItems: PackageItem[] = [
  {
    id: 'i1', package_id: 'p1', type: 'transfer', title: 'Transfer Aeroporto',
    description: null, day_number: 1, date: '2026-04-01', start_time: '10:00', end_time: '12:00',
    price: 150, partner_id: null, is_removable: false, sort_order: 1,
    maps_url: null, created_at: '',
  },
  {
    id: 'i2', package_id: 'p1', type: 'hospedagem', title: 'Pousada Sol',
    description: null, day_number: 1, date: '2026-04-01', start_time: '14:00', end_time: null,
    price: 800, partner_id: 'h1', is_removable: false, sort_order: 2,
    maps_url: null, created_at: '',
  },
  {
    id: 'i3', package_id: 'p1', type: 'passeio', title: 'Trilha do Mirante',
    description: null, day_number: 2, date: '2026-04-02', start_time: '08:00', end_time: '11:00',
    price: 120, partner_id: 'pa1', is_removable: true, sort_order: 3,
    maps_url: null, created_at: '',
  },
  {
    id: 'i4', package_id: 'p1', type: 'passeio', title: 'Passeio de Barco',
    description: null, day_number: 3, date: '2026-04-03', start_time: '08:00', end_time: '12:00',
    price: 200, partner_id: 'pa2', is_removable: true, sort_order: 4,
    maps_url: null, created_at: '',
  },
  {
    id: 'i5', package_id: 'p1', type: 'seguro', title: 'Seguro Viagem',
    description: null, day_number: 1, date: '2026-04-01', start_time: null, end_time: null,
    price: 48, partner_id: null, is_removable: false, sort_order: 5,
    maps_url: null, created_at: '',
  },
];

describe('PriceTransparency', () => {
  const defaultProps = {
    items: mockItems,
    markupPercentage: 15,
    insuranceIncluded: true,
  };

  it('renders price transparency card', () => {
    render(<PriceTransparency {...defaultProps} />);
    expect(screen.getByTestId('price-transparency')).toBeInTheDocument();
    expect(screen.getByText('Transparência de Preço')).toBeInTheDocument();
  });

  it('shows breakdown by type', () => {
    render(<PriceTransparency {...defaultProps} />);
    expect(screen.getByTestId('price-breakdown-detail')).toBeInTheDocument();
    expect(screen.getByText('Transfers')).toBeInTheDocument();
    expect(screen.getByText('Hospedagem')).toBeInTheDocument();
    expect(screen.getByText('Passeios')).toBeInTheDocument();
    expect(screen.getByText('Seguro Viagem')).toBeInTheDocument();
  });

  it('calculates total correctly', () => {
    render(<PriceTransparency {...defaultProps} />);
    // subtotal = 150+800+120+200+48 = 1318
    // markup 15% = 197.70
    // total = 1515.70
    expect(screen.getByTestId('transparency-total')).toHaveTextContent('1.515,70');
  });

  it('shows markup with percentage', () => {
    render(<PriceTransparency {...defaultProps} />);
    expect(screen.getByText(/Taxa de serviço \(15%\)/)).toBeInTheDocument();
  });

  it('shows tooltip on click', () => {
    render(<PriceTransparency {...defaultProps} />);
    fireEvent.click(screen.getByTestId('tooltip-trigger-hospedagem'));
    expect(screen.getByTestId('tooltip-hospedagem')).toBeInTheDocument();
    expect(screen.getByText(/Acomodação selecionada/)).toBeInTheDocument();
  });

  it('shows markup tooltip', () => {
    render(<PriceTransparency {...defaultProps} />);
    fireEvent.click(screen.getByTestId('tooltip-trigger-markup'));
    expect(screen.getByTestId('tooltip-markup')).toBeInTheDocument();
  });

  it('expands type to show individual items', () => {
    render(<PriceTransparency {...defaultProps} />);
    fireEvent.click(screen.getByTestId('breakdown-row-passeio'));
    expect(screen.getByTestId('expanded-passeio')).toBeInTheDocument();
    expect(screen.getByText('Trilha do Mirante')).toBeInTheDocument();
    expect(screen.getByText('Passeio de Barco')).toBeInTheDocument();
  });

  it('shows insurance badge when included', () => {
    render(<PriceTransparency {...defaultProps} />);
    expect(screen.getByTestId('insurance-badge')).toBeInTheDocument();
    expect(screen.getByText('Seguro viagem incluso')).toBeInTheDocument();
    expect(screen.getByText(/Cancelamento · Emergência/)).toBeInTheDocument();
  });

  it('hides insurance badge when not included', () => {
    render(<PriceTransparency {...defaultProps} insuranceIncluded={false} />);
    expect(screen.queryByTestId('insurance-badge')).not.toBeInTheDocument();
  });
});

describe('Guarantees', () => {
  it('renders all 4 guarantees', () => {
    render(<Guarantees />);
    expect(screen.getByTestId('guarantees')).toBeInTheDocument();
    expect(screen.getByText('Garantias TravelMatch')).toBeInTheDocument();
    expect(screen.getByText('Pagamento Protegido')).toBeInTheDocument();
    expect(screen.getByText('Seguro Incluso')).toBeInTheDocument();
    expect(screen.getByText('Reembolso Garantido')).toBeInTheDocument();
    expect(screen.getByText('Concierge 24h')).toBeInTheDocument();
  });

  it('shows escrow description', () => {
    render(<Guarantees />);
    expect(screen.getByText(/escrow/)).toBeInTheDocument();
  });

  it('shows cancellation description', () => {
    render(<Guarantees />);
    expect(screen.getByText(/Cancelamento gratuito/)).toBeInTheDocument();
  });
});

describe('CancellationPolicy', () => {
  it('renders policy card', () => {
    render(<CancellationPolicy termsAccepted={false} onTermsChange={vi.fn()} />);
    expect(screen.getByTestId('cancellation-policy')).toBeInTheDocument();
    expect(screen.getByText('Política de Cancelamento')).toBeInTheDocument();
  });

  it('expands to show tiers on click', () => {
    render(<CancellationPolicy termsAccepted={false} onTermsChange={vi.fn()} />);
    expect(screen.queryByTestId('policy-tiers')).not.toBeInTheDocument();
    fireEvent.click(screen.getByTestId('policy-toggle'));
    expect(screen.getByTestId('policy-tiers')).toBeInTheDocument();
    expect(screen.getByText('Até 7 dias antes')).toBeInTheDocument();
    expect(screen.getByText('100%')).toBeInTheDocument();
    expect(screen.getByText('3 a 7 dias antes')).toBeInTheDocument();
    expect(screen.getByText('50%')).toBeInTheDocument();
    expect(screen.getByText('Menos de 3 dias')).toBeInTheDocument();
    expect(screen.getByText('0%')).toBeInTheDocument();
  });

  it('shows terms checkbox unchecked by default', () => {
    render(<CancellationPolicy termsAccepted={false} onTermsChange={vi.fn()} />);
    expect(screen.getByTestId('terms-checkbox')).not.toBeChecked();
  });

  it('calls onTermsChange when checkbox clicked', () => {
    const onChange = vi.fn();
    render(<CancellationPolicy termsAccepted={false} onTermsChange={onChange} />);
    fireEvent.click(screen.getByTestId('terms-checkbox'));
    expect(onChange).toHaveBeenCalledWith(true);
  });

  it('shows checkbox checked when termsAccepted is true', () => {
    render(<CancellationPolicy termsAccepted={true} onTermsChange={vi.fn()} />);
    expect(screen.getByTestId('terms-checkbox')).toBeChecked();
  });

  it('shows terms and policy links', () => {
    render(<CancellationPolicy termsAccepted={false} onTermsChange={vi.fn()} />);
    expect(screen.getByText('termos de uso')).toBeInTheDocument();
    expect(screen.getByText('política de cancelamento')).toBeInTheDocument();
  });
});
