import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import OnboardingPage from '../page';

vi.mock('next/navigation', () => ({
  useRouter: () => ({ push: vi.fn(), refresh: vi.fn() }),
}));

vi.mock('../actions', () => ({
  completeOnboarding: vi.fn().mockResolvedValue(undefined),
}));

describe('OnboardingPage', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renders welcome step with name input', () => {
    render(<OnboardingPage />);
    expect(screen.getByText('Bem-vindo ao TravelMatch BR!')).toBeInTheDocument();
    expect(screen.getByPlaceholderText('Seu nome completo')).toBeInTheDocument();
  });

  it('continue button is disabled without name', () => {
    render(<OnboardingPage />);
    const continueBtn = screen.getByText('Continuar');
    expect(continueBtn).toBeDisabled();
  });

  it('navigates to consent step after entering name', () => {
    render(<OnboardingPage />);

    const nameInput = screen.getByPlaceholderText('Seu nome completo');
    fireEvent.change(nameInput, { target: { value: 'João Silva' } });

    const continueBtn = screen.getByText('Continuar');
    fireEvent.click(continueBtn);

    expect(screen.getByText('Privacidade e Termos')).toBeInTheDocument();
  });

  it('submit is disabled without LGPD consent', () => {
    render(<OnboardingPage />);

    // Go to consent step
    const nameInput = screen.getByPlaceholderText('Seu nome completo');
    fireEvent.change(nameInput, { target: { value: 'João Silva' } });
    fireEvent.click(screen.getByText('Continuar'));

    const submitBtn = screen.getByText('Aceitar e Continuar');
    expect(submitBtn).toBeDisabled();
  });

  it('submit is enabled after LGPD consent', () => {
    render(<OnboardingPage />);

    // Go to consent step
    const nameInput = screen.getByPlaceholderText('Seu nome completo');
    fireEvent.change(nameInput, { target: { value: 'João Silva' } });
    fireEvent.click(screen.getByText('Continuar'));

    // Check consent
    const checkbox = screen.getByRole('checkbox');
    fireEvent.click(checkbox);

    const submitBtn = screen.getByText('Aceitar e Continuar');
    expect(submitBtn).not.toBeDisabled();
  });
});
