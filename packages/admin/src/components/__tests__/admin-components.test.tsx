import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { AdminSidebar } from '../admin-sidebar';

// Mock next/navigation
vi.mock('next/navigation', () => ({
  usePathname: () => '/dashboard',
}));

// Mock supabase client
vi.mock('@/lib/supabase/client', () => ({
  createBrowserSupabaseClient: () => ({
    auth: { signOut: vi.fn().mockResolvedValue({}) },
  }),
}));

describe('AdminSidebar', () => {
  it('renders 4 navigation links', () => {
    render(<AdminSidebar />);
    expect(screen.getByTestId('nav-dashboard')).toBeInTheDocument();
    expect(screen.getByTestId('nav-destinos')).toBeInTheDocument();
    expect(screen.getByTestId('nav-parceiros')).toBeInTheDocument();
    expect(screen.getByTestId('nav-configurações')).toBeInTheDocument();
  });

  it('highlights active link', () => {
    render(<AdminSidebar />);
    const dashboardLink = screen.getByTestId('nav-dashboard');
    expect(dashboardLink.className).toContain('turquoise');
  });

  it('renders logout button', () => {
    render(<AdminSidebar />);
    expect(screen.getByTestId('logout-button')).toBeInTheDocument();
  });

  it('renders TravelMatch Admin branding', () => {
    render(<AdminSidebar />);
    expect(screen.getByText('TravelMatch')).toBeInTheDocument();
    expect(screen.getByText('ADMIN')).toBeInTheDocument();
  });

  it('toggles mobile menu', () => {
    render(<AdminSidebar />);
    const toggle = screen.getByTestId('mobile-menu-toggle');
    fireEvent.click(toggle);
    // After click, sidebar should be visible (translate-x-0)
    const aside = document.querySelector('aside');
    expect(aside?.className).toContain('translate-x-0');
  });
});
