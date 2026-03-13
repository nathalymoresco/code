import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { QuizCard } from '../quiz-card';
import { QuizProgress } from '../quiz-progress';

describe('QuizCard', () => {
  it('renders emoji, label, and description', () => {
    render(
      <QuizCard
        emoji="🏖️"
        label="Praia & Mar"
        description="Pé na areia"
        selected={false}
        onClick={vi.fn()}
      />,
    );
    expect(screen.getByText('🏖️')).toBeInTheDocument();
    expect(screen.getByText('Praia & Mar')).toBeInTheDocument();
    expect(screen.getByText('Pé na areia')).toBeInTheDocument();
  });

  it('calls onClick when clicked', () => {
    const onClick = vi.fn();
    render(
      <QuizCard emoji="🏖️" label="Test" description="Desc" selected={false} onClick={onClick} />,
    );
    fireEvent.click(screen.getByText('Test'));
    expect(onClick).toHaveBeenCalledTimes(1);
  });

  it('shows selected state', () => {
    const { container } = render(
      <QuizCard emoji="🏖️" label="Test" description="Desc" selected={true} onClick={vi.fn()} />,
    );
    const button = container.querySelector('button');
    expect(button?.className).toContain('border-turquoise-500');
  });

  it('shows unselected state', () => {
    const { container } = render(
      <QuizCard emoji="🏖️" label="Test" description="Desc" selected={false} onClick={vi.fn()} />,
    );
    const button = container.querySelector('button');
    expect(button?.className).toContain('border-sand-200');
  });
});

describe('QuizProgress', () => {
  it('shows phase and progress', () => {
    render(<QuizProgress current={1} total={3} phase={1} />);
    expect(screen.getByText('Fase 1 de 2')).toBeInTheDocument();
    expect(screen.getByText('2 / 3')).toBeInTheDocument();
  });

  it('renders correct number of progress dots', () => {
    const { container } = render(<QuizProgress current={0} total={5} phase={2} />);
    const dots = container.querySelectorAll('.rounded-full.flex-1');
    expect(dots).toHaveLength(5);
  });
});
