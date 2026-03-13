import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import AdminLoginPage from '../login/page';

// Mock supabase client
vi.mock('@/lib/supabase/client', () => ({
  createBrowserSupabaseClient: () => ({
    auth: {
      signInWithPassword: vi.fn().mockResolvedValue({ error: null }),
      getUser: vi.fn().mockResolvedValue({ data: { user: { id: '123' } } }),
    },
    from: () => ({
      select: () => ({
        eq: () => ({
          single: () => Promise.resolve({ data: { role: 'admin' } }),
        }),
      }),
    }),
  }),
}));

describe('AdminLoginPage', () => {
  it('renders login form with email and password', () => {
    render(<AdminLoginPage />);
    expect(screen.getByLabelText('Email')).toBeInTheDocument();
    expect(screen.getByLabelText('Senha')).toBeInTheDocument();
    expect(screen.getByText('Entrar')).toBeInTheDocument();
  });

  it('renders TravelMatch Admin heading', () => {
    render(<AdminLoginPage />);
    expect(screen.getByText('TravelMatch Admin')).toBeInTheDocument();
    expect(screen.getByText('Painel administrativo')).toBeInTheDocument();
  });
});
