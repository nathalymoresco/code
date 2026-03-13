import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { LogoutButton } from '../logout-button';

const mockPush = vi.fn();
const mockRefresh = vi.fn();
const mockSignOut = vi.fn().mockResolvedValue({});

vi.mock('next/navigation', () => ({
  useRouter: () => ({ push: mockPush, refresh: mockRefresh }),
}));

vi.mock('@/lib/supabase/client', () => ({
  createClient: () => ({
    auth: { signOut: mockSignOut },
  }),
}));

describe('LogoutButton', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renders logout button', () => {
    render(<LogoutButton />);
    expect(screen.getByText('Sair')).toBeInTheDocument();
  });

  it('signs out and redirects on click', async () => {
    render(<LogoutButton />);
    fireEvent.click(screen.getByText('Sair'));

    // Wait for async operation
    await vi.waitFor(() => {
      expect(mockSignOut).toHaveBeenCalled();
      expect(mockPush).toHaveBeenCalledWith('/login');
      expect(mockRefresh).toHaveBeenCalled();
    });
  });
});
