import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { ChecklistView } from '../packages/[id]/checklist/checklist-view';

// Mock fetch
global.fetch = vi.fn(() => Promise.resolve({ ok: true, json: () => Promise.resolve({}) })) as unknown as typeof fetch;

const mockItems = [
  {
    id: 'c1', package_id: 'p1', title: 'Documento de identidade (RG/CPF)',
    description: 'Leve documento original com foto', type: 'obrigatorio',
    source: 'system', is_completed: false, completed_at: null, sort_order: 1,
  },
  {
    id: 'c2', package_id: 'p1', title: 'Seguro viagem',
    description: 'Incluso no seu pacote ✅', type: 'automatico',
    source: 'system', is_completed: true, completed_at: '2026-03-14T10:00:00Z', sort_order: 2,
  },
  {
    id: 'c3', package_id: 'p1', title: 'Confirmar reservas',
    description: 'Verifique datas de hospedagem e passeios', type: 'obrigatorio',
    source: 'system', is_completed: false, completed_at: null, sort_order: 3,
  },
  {
    id: 'c4', package_id: 'p1', title: 'Malas adequadas ao clima',
    description: 'Confira a previsão do tempo no destino', type: 'recomendado',
    source: 'system', is_completed: false, completed_at: null, sort_order: 4,
  },
  {
    id: 'c5', package_id: 'p1', title: 'Vacina Febre Amarela',
    description: 'Obrigatória para este destino', type: 'obrigatorio',
    source: 'destination', is_completed: false, completed_at: null, sort_order: 10,
  },
];

const defaultProps = {
  packageId: 'p1',
  destinationName: 'Chapada dos Veadeiros',
  items: mockItems,
  daysUntilTrip: 10,
};

describe('ChecklistView', () => {
  it('renders checklist view', () => {
    render(<ChecklistView {...defaultProps} />);
    expect(screen.getByTestId('checklist-view')).toBeInTheDocument();
    expect(screen.getByText('Checklist Pré-Viagem')).toBeInTheDocument();
  });

  it('shows destination name', () => {
    render(<ChecklistView {...defaultProps} />);
    expect(screen.getByText('Chapada dos Veadeiros')).toBeInTheDocument();
  });

  it('shows progress bar', () => {
    render(<ChecklistView {...defaultProps} />);
    expect(screen.getByTestId('progress-bar')).toBeInTheDocument();
    // 1 of 5 completed = 20%
    expect(screen.getByTestId('progress-percent')).toHaveTextContent('20%');
  });

  it('shows obrigatorio section', () => {
    render(<ChecklistView {...defaultProps} />);
    expect(screen.getByTestId('section-obrigatório')).toBeInTheDocument();
    expect(screen.getByText('Documento de identidade (RG/CPF)')).toBeInTheDocument();
    expect(screen.getByText('Confirmar reservas')).toBeInTheDocument();
    expect(screen.getByText('Vacina Febre Amarela')).toBeInTheDocument();
  });

  it('shows automatico section', () => {
    render(<ChecklistView {...defaultProps} />);
    expect(screen.getByTestId('section-automático')).toBeInTheDocument();
    expect(screen.getByText('Seguro viagem')).toBeInTheDocument();
  });

  it('shows recomendado section', () => {
    render(<ChecklistView {...defaultProps} />);
    expect(screen.getByTestId('section-recomendado')).toBeInTheDocument();
    expect(screen.getByText('Malas adequadas ao clima')).toBeInTheDocument();
  });

  it('shows completed items with check icon', () => {
    render(<ChecklistView {...defaultProps} />);
    expect(screen.getByTestId('check-done-c2')).toBeInTheDocument();
  });

  it('shows pending items with circle icon', () => {
    render(<ChecklistView {...defaultProps} />);
    expect(screen.getByTestId('check-pending-c1')).toBeInTheDocument();
  });

  it('shows descriptions', () => {
    render(<ChecklistView {...defaultProps} />);
    expect(screen.getByText('Leve documento original com foto')).toBeInTheDocument();
    expect(screen.getByText(/Incluso no seu pacote/)).toBeInTheDocument();
  });

  it('shows urgency alert when trip is <= 3 days away and items incomplete', () => {
    render(<ChecklistView {...defaultProps} daysUntilTrip={2} />);
    expect(screen.getByTestId('urgency-alert')).toBeInTheDocument();
    expect(screen.getByText(/obrigatórios pendentes/)).toBeInTheDocument();
    expect(screen.getByText(/2 dias/)).toBeInTheDocument();
  });

  it('does NOT show urgency alert when trip is > 3 days away', () => {
    render(<ChecklistView {...defaultProps} daysUntilTrip={10} />);
    expect(screen.queryByTestId('urgency-alert')).not.toBeInTheDocument();
  });

  it('calls fetch on item toggle', () => {
    const fetchSpy = vi.spyOn(global, 'fetch');
    render(<ChecklistView {...defaultProps} />);
    fireEvent.click(screen.getByTestId('checklist-item-c1'));
    expect(fetchSpy).toHaveBeenCalledWith(
      '/api/packages/p1/checklist',
      expect.objectContaining({ method: 'PATCH' }),
    );
  });

  it('shows back to package link', () => {
    render(<ChecklistView {...defaultProps} />);
    expect(screen.getByText('Voltar ao pacote')).toBeInTheDocument();
  });

  it('shows 100% when all items completed', () => {
    const allCompleted = mockItems.map((i) => ({ ...i, is_completed: true }));
    render(<ChecklistView {...defaultProps} items={allCompleted} />);
    expect(screen.getByTestId('progress-percent')).toHaveTextContent('100%');
  });
});
