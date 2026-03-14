import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import { PartnerForm } from '../(admin)/partners/partner-form';
import { PartnerActions } from '../(admin)/partners/partner-actions';

// Mock next/navigation
vi.mock('next/navigation', () => ({
  useRouter: () => ({ push: vi.fn(), refresh: vi.fn() }),
}));

// Mock server actions
vi.mock('../(admin)/partners/actions', () => ({
  createPartner: vi.fn().mockResolvedValue({ id: '123' }),
  updatePartner: vi.fn().mockResolvedValue({ id: '123' }),
  curatePartner: vi.fn().mockResolvedValue({ success: true }),
  updatePartnerStatus: vi.fn().mockResolvedValue({ success: true }),
}));

const mockDestinations = [
  { id: 'd1', name: 'Chapada dos Veadeiros' },
  { id: 'd2', name: 'Fernando de Noronha' },
];

describe('PartnerForm', () => {
  it('renders create form with all sections', () => {
    render(<PartnerForm destinations={mockDestinations} />);
    expect(screen.getByText('Informações Básicas')).toBeInTheDocument();
    expect(screen.getByText('Contato & Localização')).toBeInTheDocument();
    expect(screen.getByText('Preço & Amenidades')).toBeInTheDocument();
    expect(screen.getByText('Imagens')).toBeInTheDocument();
    expect(screen.getByText('Criar Parceiro')).toBeInTheDocument();
  });

  it('renders destination selector with options', () => {
    render(<PartnerForm destinations={mockDestinations} />);
    const select = screen.getByTestId('select-destination');
    expect(select).toBeInTheDocument();
    expect(screen.getByText('Chapada dos Veadeiros')).toBeInTheDocument();
    expect(screen.getByText('Fernando de Noronha')).toBeInTheDocument();
  });

  it('renders type selector with all partner types', () => {
    render(<PartnerForm destinations={mockDestinations} />);
    const select = screen.getByTestId('select-type');
    expect(select).toBeInTheDocument();
    expect(screen.getByText('Hotel')).toBeInTheDocument();
    expect(screen.getByText('Pousada')).toBeInTheDocument();
    expect(screen.getByText('Guia')).toBeInTheDocument();
    expect(screen.getByText('Restaurante')).toBeInTheDocument();
    expect(screen.getByText('Experiência')).toBeInTheDocument();
  });

  it('renders edit mode with Atualizar button when partner provided', () => {
    const partner = {
      id: 'p1',
      destination_id: 'd1',
      name: 'Pousada Sol',
      type: 'pousada',
      description: 'Uma pousada',
      whatsapp: '+5562999990000',
      email: 'sol@test.com',
      address: 'Rua das Flores',
      latitude: -14.1,
      longitude: -47.5,
      price_range: 'moderado',
      daily_rate: 250,
      cover_url: '',
      photo_urls: [],
      amenities: ['wifi', 'piscina'],
      cancellation_policy: '',
      is_curated: false,
      contract_status: 'pending',
      rating: 0,
      review_count: 0,
      created_at: '',
      updated_at: '',
    };
    render(<PartnerForm partner={partner as never} destinations={mockDestinations} />);
    expect(screen.getByText('Atualizar Parceiro')).toBeInTheDocument();
  });

  it('renders price range selector', () => {
    render(<PartnerForm destinations={mockDestinations} />);
    expect(screen.getByText('Econômico')).toBeInTheDocument();
    expect(screen.getByText('Moderado')).toBeInTheDocument();
    expect(screen.getByText('Premium')).toBeInTheDocument();
  });
});

describe('PartnerActions', () => {
  it('renders edit and suspend buttons', () => {
    render(<PartnerActions id="p1" isCurated={false} status="active" />);
    expect(screen.getByTitle('Editar')).toBeInTheDocument();
    expect(screen.getByTitle('Suspender')).toBeInTheDocument();
  });

  it('shows curate button when not curated', () => {
    render(<PartnerActions id="p1" isCurated={false} status="pending" />);
    expect(screen.getByTitle('Curar parceiro')).toBeInTheDocument();
  });

  it('hides curate button when already curated', () => {
    render(<PartnerActions id="p1" isCurated={true} status="active" />);
    expect(screen.queryByTitle('Curar parceiro')).not.toBeInTheDocument();
  });

  it('shows Reativar when suspended', () => {
    render(<PartnerActions id="p1" isCurated={true} status="suspended" />);
    expect(screen.getByTitle('Reativar')).toBeInTheDocument();
  });
});
