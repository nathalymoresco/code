import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import UnauthorizedPage from '../unauthorized/page';

describe('UnauthorizedPage', () => {
  it('renders access denied message', () => {
    render(<UnauthorizedPage />);
    expect(screen.getByText('Acesso não autorizado')).toBeInTheDocument();
  });

  it('renders login and home buttons', () => {
    render(<UnauthorizedPage />);
    expect(screen.getByText('Fazer login com outra conta')).toBeInTheDocument();
    expect(screen.getByText('Voltar para TravelMatch')).toBeInTheDocument();
  });
});
