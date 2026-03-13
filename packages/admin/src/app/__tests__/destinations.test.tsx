import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import { DestinationForm } from '../(admin)/destinations/destination-form';
import { DestinationActions } from '../(admin)/destinations/destination-actions';

// Mock next/navigation
vi.mock('next/navigation', () => ({
  useRouter: () => ({ push: vi.fn(), refresh: vi.fn() }),
}));

// Mock server actions
vi.mock('../(admin)/destinations/actions', () => ({
  createDestination: vi.fn().mockResolvedValue({ id: '123' }),
  updateDestination: vi.fn().mockResolvedValue({ id: '123' }),
  toggleDestinationActive: vi.fn().mockResolvedValue({ success: true }),
  duplicateDestination: vi.fn().mockResolvedValue({ id: '456' }),
}));

describe('DestinationForm', () => {
  it('renders create form with all sections', () => {
    render(<DestinationForm />);
    expect(screen.getByText('Informações Básicas')).toBeInTheDocument();
    expect(screen.getByText('Localização')).toBeInTheDocument();
    expect(screen.getByText('Detalhes')).toBeInTheDocument();
    expect(screen.getByText('Imagens')).toBeInTheDocument();
    expect(screen.getByText('Scores por Dimensão DNA')).toBeInTheDocument();
    expect(screen.getByText('Criar Destino')).toBeInTheDocument();
  });

  it('renders 10 dimension sliders', () => {
    render(<DestinationForm />);
    expect(screen.getByTestId('score-natureza')).toBeInTheDocument();
    expect(screen.getByTestId('score-praia')).toBeInTheDocument();
    expect(screen.getByTestId('score-urbano')).toBeInTheDocument();
    expect(screen.getByTestId('score-aventura')).toBeInTheDocument();
    expect(screen.getByTestId('score-relax')).toBeInTheDocument();
  });

  it('renders 12 month buttons', () => {
    render(<DestinationForm />);
    expect(screen.getByText('Jan')).toBeInTheDocument();
    expect(screen.getByText('Dez')).toBeInTheDocument();
  });

  it('renders region selector', () => {
    render(<DestinationForm />);
    expect(screen.getByText('Norte')).toBeInTheDocument();
    expect(screen.getByText('Nordeste')).toBeInTheDocument();
    expect(screen.getByText('Sul')).toBeInTheDocument();
  });
});

describe('DestinationActions', () => {
  it('renders edit, duplicate, and toggle buttons', () => {
    render(<DestinationActions id="123" isActive={false} />);
    expect(screen.getByTitle('Editar')).toBeInTheDocument();
    expect(screen.getByTitle('Duplicar')).toBeInTheDocument();
    expect(screen.getByTitle('Ativar')).toBeInTheDocument();
  });

  it('shows Desativar when active', () => {
    render(<DestinationActions id="123" isActive={true} />);
    expect(screen.getByTitle('Desativar')).toBeInTheDocument();
  });
});
