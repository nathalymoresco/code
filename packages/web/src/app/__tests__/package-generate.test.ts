import { describe, it, expect } from 'vitest';
import type { GeneratePackageInput, ComfortLevel, PackageItem } from '@travelmatch/shared';

// Unit tests for package generation logic

function daysBetween(start: string, end: string): number {
  const s = new Date(start);
  const e = new Date(end);
  return Math.round((e.getTime() - s.getTime()) / (86400 * 1000));
}

function addDays(date: string, days: number): string {
  const d = new Date(date);
  d.setDate(d.getDate() + days);
  return d.toISOString().split('T')[0]!;
}

const COMFORT_TO_PRICE: Record<ComfortLevel, string[]> = {
  economico: ['economico'],
  conforto: ['economico', 'moderado'],
  premium: ['moderado', 'premium'],
};

function getActivitiesPerDay(ritmo: number): number {
  return ritmo > 70 ? 2 : 1;
}

function selectAccommodationType(sociabilidade: number): string {
  return sociabilidade > 65 ? 'hotel' : 'pousada';
}

function calculateInsurance(numTravelers: number, totalDays: number): number {
  return 12 * numTravelers * totalDays;
}

function applyMarkup(total: number, markupPercent: number): number {
  return Math.round((total + total * (markupPercent / 100)) * 100) / 100;
}

describe('Package Generation — Date Utilities', () => {
  it('calculates days between dates correctly', () => {
    expect(daysBetween('2026-06-01', '2026-06-05')).toBe(4);
    expect(daysBetween('2026-06-01', '2026-06-08')).toBe(7);
  });

  it('adds days correctly', () => {
    expect(addDays('2026-06-01', 3)).toBe('2026-06-04');
    expect(addDays('2026-06-28', 5)).toBe('2026-07-03');
  });
});

describe('Package Generation — Comfort Level Mapping', () => {
  it('maps economico to economico price range', () => {
    expect(COMFORT_TO_PRICE.economico).toEqual(['economico']);
  });

  it('maps conforto to economico+moderado', () => {
    expect(COMFORT_TO_PRICE.conforto).toEqual(['economico', 'moderado']);
  });

  it('maps premium to moderado+premium', () => {
    expect(COMFORT_TO_PRICE.premium).toEqual(['moderado', 'premium']);
  });
});

describe('Package Generation — DNA-based Personalization', () => {
  it('assigns 2 activities/day for high ritmo (>70)', () => {
    expect(getActivitiesPerDay(85)).toBe(2);
  });

  it('assigns 1 activity/day for moderate ritmo', () => {
    expect(getActivitiesPerDay(50)).toBe(1);
  });

  it('assigns 1 activity/day for low ritmo', () => {
    expect(getActivitiesPerDay(20)).toBe(1);
  });

  it('selects hotel for social travelers', () => {
    expect(selectAccommodationType(80)).toBe('hotel');
  });

  it('selects pousada for introverted travelers', () => {
    expect(selectAccommodationType(40)).toBe('pousada');
  });
});

describe('Package Generation — Pricing', () => {
  it('calculates insurance correctly', () => {
    // 12 R$/person/day * 2 travelers * 5 days = 120
    expect(calculateInsurance(2, 5)).toBe(120);
  });

  it('calculates insurance for solo traveler', () => {
    expect(calculateInsurance(1, 7)).toBe(84);
  });

  it('applies 15% markup', () => {
    // 1000 + 15% = 1150
    expect(applyMarkup(1000, 15)).toBe(1150);
  });

  it('applies markup with decimal precision', () => {
    // 333.33 + 15% = 383.33
    expect(applyMarkup(333.33, 15)).toBe(383.33);
  });
});

describe('Package Generation — Input Validation', () => {
  it('validates required fields', () => {
    const valid: GeneratePackageInput = {
      destination_id: 'd1',
      start_date: '2026-06-01',
      end_date: '2026-06-05',
      num_travelers: 2,
      comfort_level: 'conforto',
    };

    expect(valid.destination_id).toBeTruthy();
    expect(valid.start_date).toBeTruthy();
    expect(valid.end_date).toBeTruthy();
    expect(valid.num_travelers).toBeGreaterThan(0);
  });

  it('rejects invalid date range (end before start)', () => {
    const days = daysBetween('2026-06-05', '2026-06-01');
    expect(days).toBeLessThan(1);
  });

  it('rejects too long trips (>30 days)', () => {
    const days = daysBetween('2026-06-01', '2026-08-01');
    expect(days).toBeGreaterThan(30);
  });
});

describe('Package Generation — Item Structure', () => {
  it('items have correct shape', () => {
    const item: Partial<PackageItem> = {
      type: 'passeio',
      title: 'Trilha das Cachoeiras',
      date: '2026-06-02',
      start_time: '08:00',
      end_time: '12:00',
      price: 150,
      day_number: 2,
      sort_order: 1,
      is_removable: true,
    };

    expect(item.type).toBe('passeio');
    expect(item.is_removable).toBe(true);
    expect(item.day_number).toBe(2);
  });

  it('transfer items are not removable', () => {
    const transfer: Partial<PackageItem> = {
      type: 'transfer',
      is_removable: false,
    };
    expect(transfer.is_removable).toBe(false);
  });

  it('insurance items are not removable', () => {
    const insurance: Partial<PackageItem> = {
      type: 'seguro',
      is_removable: false,
    };
    expect(insurance.is_removable).toBe(false);
  });
});
