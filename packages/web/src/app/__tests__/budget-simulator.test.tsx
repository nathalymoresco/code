import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { BudgetSimulator } from '../packages/[id]/budget-simulator';
import type { PackageItem } from '@travelmatch/shared';

const mockItems: PackageItem[] = [
  {
    id: 'i1', package_id: 'p1', type: 'transfer', title: 'Transfer Aeroporto',
    description: null, day_number: 1, time_slot: 'morning', duration_minutes: 60,
    price: 150, partner_id: null, is_removable: false, sort_order: 1,
    created_at: '', partner: null,
  },
  {
    id: 'i2', package_id: 'p1', type: 'hospedagem', title: 'Pousada Sol',
    description: null, day_number: 1, time_slot: 'afternoon', duration_minutes: null,
    price: 800, partner_id: 'h1', is_removable: false, sort_order: 2,
    created_at: '', partner: null,
  },
  {
    id: 'i3', package_id: 'p1', type: 'passeio', title: 'Trilha do Mirante',
    description: null, day_number: 2, time_slot: 'morning', duration_minutes: 180,
    price: 120, partner_id: 'pa1', is_removable: true, sort_order: 3,
    created_at: '', partner: null,
  },
  {
    id: 'i4', package_id: 'p1', type: 'passeio', title: 'Passeio de Barco',
    description: null, day_number: 3, time_slot: 'morning', duration_minutes: 240,
    price: 200, partner_id: 'pa2', is_removable: true, sort_order: 4,
    created_at: '', partner: null,
  },
  {
    id: 'i5', package_id: 'p1', type: 'alimentacao', title: 'Jantar Típico',
    description: null, day_number: 2, time_slot: 'evening', duration_minutes: 120,
    price: 90, partner_id: 'r1', is_removable: true, sort_order: 5,
    created_at: '', partner: null,
  },
  {
    id: 'i6', package_id: 'p1', type: 'seguro', title: 'Seguro Viagem',
    description: null, day_number: 1, time_slot: null, duration_minutes: null,
    price: 48, partner_id: null, is_removable: false, sort_order: 6,
    created_at: '', partner: null,
  },
];

const defaultProps = {
  items: mockItems,
  startDate: '2026-04-01',
  endDate: '2026-04-05',
  numTravelers: 2,
  comfortLevel: 'conforto' as const,
  markupPercentage: 15,
  onItemRemove: vi.fn(),
  onRestore: vi.fn(),
};

describe('BudgetSimulator', () => {
  it('renders the simulator title', () => {
    render(<BudgetSimulator {...defaultProps} />);
    expect(screen.getByText('Simulador de Orçamento')).toBeInTheDocument();
  });

  it('shows quick stats: days, travelers, comfort', () => {
    render(<BudgetSimulator {...defaultProps} />);
    expect(screen.getByText('4')).toBeInTheDocument(); // 4 days
    expect(screen.getByText('2')).toBeInTheDocument(); // 2 travelers
    expect(screen.getByText('Conforto')).toBeInTheDocument();
  });

  it('shows price breakdown by type', () => {
    render(<BudgetSimulator {...defaultProps} />);
    expect(screen.getByTestId('budget-breakdown')).toBeInTheDocument();
    expect(screen.getByText('Transfers')).toBeInTheDocument();
    expect(screen.getByText('Hospedagem')).toBeInTheDocument();
    expect(screen.getByText('Passeios')).toBeInTheDocument();
  });

  it('calculates subtotal, markup and total correctly', () => {
    render(<BudgetSimulator {...defaultProps} />);
    // subtotal = 150+800+120+200+90+48 = 1408
    // markup 15% = 211.20
    // total = 1619.20
    expect(screen.getByText(/211,20/)).toBeInTheDocument(); // markup
    expect(screen.getByText(/1\.619,20/)).toBeInTheDocument(); // total
  });

  it('shows per-person and per-day prices', () => {
    render(<BudgetSimulator {...defaultProps} />);
    // per person = 1619.20 / 2 = 809.60
    // per day = 1619.20 / 4 = 404.80
    expect(screen.getByText(/809,60/)).toBeInTheDocument();
    expect(screen.getByText(/404,80/)).toBeInTheDocument();
  });

  it('shows removable items section', () => {
    render(<BudgetSimulator {...defaultProps} />);
    expect(screen.getByText('Ajustar passeios')).toBeInTheDocument();
    expect(screen.getByText('Trilha do Mirante')).toBeInTheDocument();
    expect(screen.getByText('Passeio de Barco')).toBeInTheDocument();
    expect(screen.getByText('Jantar Típico')).toBeInTheDocument();
  });

  it('calls onItemRemove when removing an item', () => {
    const onItemRemove = vi.fn();
    render(<BudgetSimulator {...defaultProps} onItemRemove={onItemRemove} />);
    const removeButtons = screen.getAllByTitle('Remover');
    fireEvent.click(removeButtons[0]!);
    expect(onItemRemove).toHaveBeenCalledWith('i3');
  });

  it('recalculates total after removing an item', () => {
    render(<BudgetSimulator {...defaultProps} />);
    // Remove Trilha do Mirante (120)
    const removeButtons = screen.getAllByTitle('Remover');
    fireEvent.click(removeButtons[0]!);
    // new subtotal = 1408 - 120 = 1288
    // new markup = 193.20
    // new total = 1481.20
    expect(screen.getByText(/1\.481,20/)).toBeInTheDocument();
  });

  it('shows removed count after removing items', () => {
    render(<BudgetSimulator {...defaultProps} />);
    const removeButtons = screen.getAllByTitle('Remover');
    fireEvent.click(removeButtons[0]!);
    expect(screen.getByTestId('removed-count')).toBeInTheDocument();
    expect(screen.getByText(/1 item removido/)).toBeInTheDocument();
  });

  it('shows restore button after removing items', () => {
    render(<BudgetSimulator {...defaultProps} />);
    expect(screen.queryByText('Restaurar original')).not.toBeInTheDocument();
    const removeButtons = screen.getAllByTitle('Remover');
    fireEvent.click(removeButtons[0]!);
    expect(screen.getByText('Restaurar original')).toBeInTheDocument();
  });

  it('calls onRestore and resets when restoring', () => {
    const onRestore = vi.fn();
    render(<BudgetSimulator {...defaultProps} onRestore={onRestore} />);
    const removeButtons = screen.getAllByTitle('Remover');
    fireEvent.click(removeButtons[0]!);
    fireEvent.click(screen.getByText('Restaurar original'));
    expect(onRestore).toHaveBeenCalled();
    expect(screen.queryByTestId('removed-count')).not.toBeInTheDocument();
  });

  it('shows plural for multiple removed items', () => {
    render(<BudgetSimulator {...defaultProps} />);
    const removeButtons = screen.getAllByTitle('Remover');
    fireEvent.click(removeButtons[0]!);
    fireEvent.click(removeButtons[1]!);
    expect(screen.getByText(/2 items removidos/)).toBeInTheDocument();
  });

  it('shows markup percentage label', () => {
    render(<BudgetSimulator {...defaultProps} />);
    expect(screen.getByText(/Taxa de serviço \(15%\)/)).toBeInTheDocument();
  });

  it('shows viajantes plural correctly', () => {
    render(<BudgetSimulator {...defaultProps} />);
    expect(screen.getByText('viajantes')).toBeInTheDocument();
  });

  it('shows viajante singular for 1 traveler', () => {
    render(<BudgetSimulator {...defaultProps} numTravelers={1} />);
    expect(screen.getByText('viajante')).toBeInTheDocument();
  });
});
