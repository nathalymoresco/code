import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { DNARadarChart } from '../dna-radar-chart';
import { DNAProfileCard } from '../dna-profile-card';
import type { DNADimension } from '@travelmatch/shared';

const mockDimensions: Record<DNADimension, number> = {
  ritmo: 50,
  natureza: 80,
  urbano: 30,
  praia: 70,
  cultura: 60,
  gastronomia: 45,
  sociabilidade: 55,
  fitness: 40,
  aventura: 65,
  relax: 75,
};

describe('DNARadarChart', () => {
  it('renders SVG with aria-label', () => {
    const { container } = render(<DNARadarChart dimensions={mockDimensions} />);
    const svg = container.querySelector('svg');
    expect(svg).toBeInTheDocument();
    expect(svg?.getAttribute('aria-label')).toContain('radar');
  });

  it('renders 10 dimension labels', () => {
    render(<DNARadarChart dimensions={mockDimensions} />);
    expect(screen.getByText('Natureza')).toBeInTheDocument();
    expect(screen.getByText('Praia')).toBeInTheDocument();
    expect(screen.getByText('Cultura')).toBeInTheDocument();
    expect(screen.getByText('Aventura')).toBeInTheDocument();
    expect(screen.getByText('Relax')).toBeInTheDocument();
    expect(screen.getByText('Ritmo')).toBeInTheDocument();
    expect(screen.getByText('Urbano')).toBeInTheDocument();
    expect(screen.getByText('Gastronomia')).toBeInTheDocument();
    expect(screen.getByText('Sociabilidade')).toBeInTheDocument();
    expect(screen.getByText('Fitness')).toBeInTheDocument();
  });

  it('renders data polygon', () => {
    const { container } = render(<DNARadarChart dimensions={mockDimensions} />);
    const polygon = container.querySelector('polygon');
    expect(polygon).toBeInTheDocument();
    expect(polygon?.getAttribute('points')).toBeTruthy();
  });

  it('renders grid circles', () => {
    const { container } = render(<DNARadarChart dimensions={mockDimensions} />);
    const circles = container.querySelectorAll('circle');
    // 5 grid circles + 10 data points = 15
    expect(circles.length).toBe(15);
  });
});

describe('DNAProfileCard', () => {
  it('renders label and emoji', () => {
    render(
      <DNAProfileCard
        label="Explorador Zen"
        labelEmoji="🌿"
        dimensions={mockDimensions}
        completenessPercentage={95}
      />,
    );
    expect(screen.getByText('Explorador Zen')).toBeInTheDocument();
    expect(screen.getByText('🌿')).toBeInTheDocument();
  });

  it('shows correct completeness percentage', () => {
    render(
      <DNAProfileCard
        label="Explorador Zen"
        labelEmoji="🌿"
        dimensions={mockDimensions}
        completenessPercentage={40}
      />,
    );
    expect(screen.getByText('40%')).toBeInTheDocument();
  });

  it('shows CTA when partial (< 95%)', () => {
    render(
      <DNAProfileCard
        label="Explorador Zen"
        labelEmoji="🌿"
        dimensions={mockDimensions}
        completenessPercentage={40}
      />,
    );
    expect(screen.getByText('Completar meu DNA')).toBeInTheDocument();
  });

  it('hides CTA when complete (>= 95%)', () => {
    render(
      <DNAProfileCard
        label="Explorador Zen"
        labelEmoji="🌿"
        dimensions={mockDimensions}
        completenessPercentage={95}
      />,
    );
    expect(screen.queryByText('Completar meu DNA')).not.toBeInTheDocument();
  });

  it('renders personalized descriptions', () => {
    render(
      <DNAProfileCard
        label="Explorador Zen"
        labelEmoji="🌿"
        dimensions={mockDimensions}
        completenessPercentage={95}
      />,
    );
    // Should show personalized descriptions based on top dimensions
    expect(screen.getByText('O que isso significa')).toBeInTheDocument();
    // Descriptions section should have content (getDNADescription returns strings)
    const descriptions = screen.getAllByText(/natureza/i);
    expect(descriptions.length).toBeGreaterThanOrEqual(1);
  });

  it('renders top 3 dimension bars', () => {
    render(
      <DNAProfileCard
        label="Explorador Zen"
        labelEmoji="🌿"
        dimensions={mockDimensions}
        completenessPercentage={95}
      />,
    );
    // Top 3: natureza(80), relax(75), praia(70)
    expect(screen.getByText('Natureza')).toBeInTheDocument();
    expect(screen.getByText('80%')).toBeInTheDocument();
  });
});
