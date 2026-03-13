import { describe, it, expect } from 'vitest';

describe('Middleware Route Protection Logic', () => {
  const publicRoutes = ['/', '/login', '/auth/callback', '/api/health'];

  function isPublicRoute(pathname: string): boolean {
    if (publicRoutes.includes(pathname)) return true;
    if (pathname.startsWith('/profile/dna/')) return true;
    return false;
  }

  it('identifies public routes correctly', () => {
    expect(isPublicRoute('/')).toBe(true);
    expect(isPublicRoute('/login')).toBe(true);
    expect(isPublicRoute('/auth/callback')).toBe(true);
    expect(isPublicRoute('/api/health')).toBe(true);
    expect(isPublicRoute('/profile/dna/abc-123')).toBe(true);
  });

  it('identifies protected routes correctly', () => {
    expect(isPublicRoute('/onboarding')).toBe(false);
    expect(isPublicRoute('/quiz')).toBe(false);
    expect(isPublicRoute('/dashboard')).toBe(false);
    expect(isPublicRoute('/profile')).toBe(false);
    expect(isPublicRoute('/api/protected')).toBe(false);
  });
});
