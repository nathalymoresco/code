import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { CheckoutForm } from '../packages/[id]/checkout/checkout-form';
import { ConfirmationView } from '../packages/[id]/confirmation/confirmation-view';

// Mock next/navigation
vi.mock('next/navigation', () => ({
  useRouter: () => ({ push: vi.fn() }),
}));

describe('CheckoutForm', () => {
  const defaultProps = {
    packageId: 'pkg-1',
    totalPrice: 2500,
    userEmail: 'test@example.com',
    existingPayment: null,
  };

  it('renders checkout form', () => {
    render(<CheckoutForm {...defaultProps} />);
    expect(screen.getByTestId('checkout-form')).toBeInTheDocument();
  });

  it('shows total price', () => {
    render(<CheckoutForm {...defaultProps} />);
    expect(screen.getByTestId('checkout-total')).toHaveTextContent('2.500,00');
  });

  it('shows all payment methods', () => {
    render(<CheckoutForm {...defaultProps} />);
    expect(screen.getByTestId('method-pix')).toBeInTheDocument();
    expect(screen.getByTestId('method-credit_card')).toBeInTheDocument();
    expect(screen.getByTestId('method-boleto')).toBeInTheDocument();
  });

  it('shows Pix as default selected method', () => {
    render(<CheckoutForm {...defaultProps} />);
    const pixButton = screen.getByTestId('method-pix');
    expect(pixButton.className).toContain('turquoise');
  });

  it('shows installment selector for credit card', () => {
    render(<CheckoutForm {...defaultProps} />);
    fireEvent.click(screen.getByTestId('method-credit_card'));
    expect(screen.getByTestId('installments-section')).toBeInTheDocument();
    expect(screen.getByTestId('installments-select')).toBeInTheDocument();
  });

  it('hides installments for pix', () => {
    render(<CheckoutForm {...defaultProps} />);
    expect(screen.queryByTestId('installments-section')).not.toBeInTheDocument();
  });

  it('shows customer input fields', () => {
    render(<CheckoutForm {...defaultProps} />);
    expect(screen.getByTestId('input-name')).toBeInTheDocument();
    expect(screen.getByTestId('input-cpf')).toBeInTheDocument();
  });

  it('disables submit when fields are empty', () => {
    render(<CheckoutForm {...defaultProps} />);
    expect(screen.getByTestId('checkout-submit')).toBeDisabled();
  });

  it('enables submit when fields are filled', () => {
    render(<CheckoutForm {...defaultProps} />);
    fireEvent.change(screen.getByTestId('input-name'), { target: { value: 'João Silva' } });
    fireEvent.change(screen.getByTestId('input-cpf'), { target: { value: '123.456.789-00' } });
    expect(screen.getByTestId('checkout-submit')).not.toBeDisabled();
  });

  it('shows pix display when existing payment has pix data', () => {
    render(
      <CheckoutForm
        {...defaultProps}
        existingPayment={{
          id: 'pay-1',
          status: 'pending',
          method: 'pix',
          pix_qr_code: 'base64data',
          pix_copy_paste: '00020126360014br.gov.bcb.pix',
          pix_expiration: '2026-04-01T12:00:00Z',
          asaas_invoice_url: null,
        }}
      />,
    );
    expect(screen.getByTestId('pix-display')).toBeInTheDocument();
    expect(screen.getByTestId('pix-qr')).toBeInTheDocument();
    expect(screen.getByTestId('pix-code')).toBeInTheDocument();
  });

  it('shows escrow security notice', () => {
    render(<CheckoutForm {...defaultProps} />);
    expect(screen.getByText(/pagamento seguro/i)).toBeInTheDocument();
  });
});

describe('ConfirmationView', () => {
  const defaultProps = {
    packageId: 'pkg-1',
    destinationName: 'Chapada dos Veadeiros',
    startDate: '2026-04-01',
    endDate: '2026-04-05',
    numTravelers: 2,
    totalPrice: 2500,
    packageStatus: 'confirmed',
    payment: {
      id: 'pay-1',
      status: 'confirmed',
      method: 'pix',
      amount: 2500,
      installments: 1,
      created_at: '2026-03-14T10:00:00Z',
    },
  };

  it('renders confirmation view', () => {
    render(<ConfirmationView {...defaultProps} />);
    expect(screen.getByTestId('confirmation-view')).toBeInTheDocument();
  });

  it('shows confirmed status', () => {
    render(<ConfirmationView {...defaultProps} />);
    expect(screen.getByTestId('status-title')).toHaveTextContent('Pagamento Confirmado');
  });

  it('shows pending status', () => {
    render(
      <ConfirmationView
        {...defaultProps}
        payment={{ ...defaultProps.payment, status: 'pending' }}
      />,
    );
    expect(screen.getByTestId('status-title')).toHaveTextContent('Aguardando Pagamento');
  });

  it('shows overdue status', () => {
    render(
      <ConfirmationView
        {...defaultProps}
        payment={{ ...defaultProps.payment, status: 'overdue' }}
      />,
    );
    expect(screen.getByTestId('status-title')).toHaveTextContent('Pagamento Vencido');
  });

  it('shows destination name', () => {
    render(<ConfirmationView {...defaultProps} />);
    expect(screen.getByText('Chapada dos Veadeiros')).toBeInTheDocument();
  });

  it('shows traveler count', () => {
    render(<ConfirmationView {...defaultProps} />);
    expect(screen.getByText('2 viajantes')).toBeInTheDocument();
  });

  it('shows payment details', () => {
    render(<ConfirmationView {...defaultProps} />);
    expect(screen.getByTestId('payment-details')).toBeInTheDocument();
    expect(screen.getByText('Pix')).toBeInTheDocument();
  });

  it('shows installments for credit card', () => {
    render(
      <ConfirmationView
        {...defaultProps}
        payment={{ ...defaultProps.payment, method: 'credit_card', installments: 6 }}
      />,
    );
    expect(screen.getByText('Cartão de Crédito')).toBeInTheDocument();
    expect(screen.getByText(/6x de R\$/)).toBeInTheDocument();
  });

  it('shows escrow notice', () => {
    render(<ConfirmationView {...defaultProps} />);
    expect(screen.getByTestId('escrow-notice')).toBeInTheDocument();
    expect(screen.getByText(/escrow/)).toBeInTheDocument();
  });

  it('shows action buttons', () => {
    render(<ConfirmationView {...defaultProps} />);
    expect(screen.getByText('Ver meu pacote')).toBeInTheDocument();
    expect(screen.getByText('Explorar mais destinos')).toBeInTheDocument();
  });
});
