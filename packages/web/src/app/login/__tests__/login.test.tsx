import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import LoginPage from '../page';

// Mock next/navigation
vi.mock('next/navigation', () => ({
  useRouter: () => ({ push: vi.fn(), refresh: vi.fn() }),
}));

// Mock server actions
vi.mock('../actions', () => ({
  signInWithGoogle: vi.fn(),
  signInWithApple: vi.fn(),
  signInWithMagicLink: vi.fn().mockResolvedValue({ success: true }),
}));

describe('LoginPage', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renders 3 login options', () => {
    render(<LoginPage />);
    expect(screen.getByText('Entrar com Google')).toBeInTheDocument();
    expect(screen.getByText('Entrar com Apple')).toBeInTheDocument();
    expect(screen.getByText('Entrar com Magic Link')).toBeInTheDocument();
  });

  it('renders email input for magic link', () => {
    render(<LoginPage />);
    expect(screen.getByPlaceholderText('seu@email.com')).toBeInTheDocument();
  });

  it('shows success message after magic link sent', async () => {
    render(<LoginPage />);

    const emailInput = screen.getByPlaceholderText('seu@email.com');
    fireEvent.change(emailInput, { target: { value: 'test@example.com' } });

    const form = screen.getByText('Entrar com Magic Link').closest('form')!;
    fireEvent.submit(form);

    expect(
      await screen.findByText('Link de acesso enviado para seu email!'),
    ).toBeInTheDocument();
  });

  it('renders branding elements', () => {
    render(<LoginPage />);
    expect(screen.getByText('TravelMatch BR')).toBeInTheDocument();
    expect(screen.getByText('Descubra seu DNA de Viagem')).toBeInTheDocument();
  });
});
