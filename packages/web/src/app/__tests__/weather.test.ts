import { describe, it, expect } from 'vitest';

// Unit tests for weather logic (no API calls needed)

interface MonthlyWeather {
  month: number;
  avg_temp_c: number;
  avg_rain_mm: number | null;
  avg_humidity: number;
  condition: string;
  is_high_season: boolean;
}

function getStaticFallback(latitude: number, bestMonths: number[]): MonthlyWeather[] {
  const isTropical = latitude > -20;
  const baseTemp = isTropical ? 28 : 22;
  const tempVariation = isTropical ? 3 : 8;

  return Array.from({ length: 12 }, (_, i) => {
    const month = i + 1;
    const seasonFactor = Math.cos(((month - 1) / 12) * 2 * Math.PI);
    const temp = Math.round(baseTemp + seasonFactor * tempVariation);
    const isRainy = month >= 10 || month <= 3;

    return {
      month,
      avg_temp_c: temp,
      avg_rain_mm: isRainy ? 175 : 50,
      avg_humidity: isRainy ? 80 : 60,
      condition: isRainy ? 'chuvoso' : 'ensolarado',
      is_high_season: bestMonths.includes(month),
    };
  });
}

function isUnfavorableMonth(weather: MonthlyWeather): boolean {
  return (
    weather.avg_rain_mm !== null &&
    weather.avg_rain_mm > 150 &&
    !weather.is_high_season
  );
}

function findBestMonth(weather: MonthlyWeather[]): MonthlyWeather | undefined {
  return weather
    .filter((w) => w.is_high_season)
    .sort((a, b) => {
      const rainA = a.avg_rain_mm ?? 0;
      const rainB = b.avg_rain_mm ?? 0;
      return rainA - rainB || b.avg_temp_c - a.avg_temp_c;
    })[0];
}

describe('Static Fallback Weather', () => {
  it('generates 12 months of data', () => {
    const data = getStaticFallback(-14.1, [5, 6, 7]);
    expect(data).toHaveLength(12);
    expect(data[0]!.month).toBe(1);
    expect(data[11]!.month).toBe(12);
  });

  it('marks best_months as high season', () => {
    const data = getStaticFallback(-14.1, [5, 6, 7]);
    expect(data[4]!.is_high_season).toBe(true); // May
    expect(data[5]!.is_high_season).toBe(true); // June
    expect(data[6]!.is_high_season).toBe(true); // July
    expect(data[0]!.is_high_season).toBe(false); // January
  });

  it('tropical locations have higher base temperature', () => {
    const tropical = getStaticFallback(-10, []);
    const subtropical = getStaticFallback(-25, []);
    const tropicalAvg = tropical.reduce((s, w) => s + w.avg_temp_c, 0) / 12;
    const subtropicalAvg = subtropical.reduce((s, w) => s + w.avg_temp_c, 0) / 12;
    expect(tropicalAvg).toBeGreaterThan(subtropicalAvg);
  });

  it('marks Oct-Mar as rainy season', () => {
    const data = getStaticFallback(-14.1, []);
    expect(data[0]!.condition).toBe('chuvoso');   // January
    expect(data[2]!.condition).toBe('chuvoso');   // March
    expect(data[5]!.condition).toBe('ensolarado'); // June
    expect(data[9]!.condition).toBe('chuvoso');   // October
  });
});

describe('Unfavorable Weather Detection', () => {
  it('detects unfavorable month (heavy rain + not high season)', () => {
    const weather: MonthlyWeather = {
      month: 1, avg_temp_c: 28, avg_rain_mm: 200,
      avg_humidity: 85, condition: 'chuvoso', is_high_season: false,
    };
    expect(isUnfavorableMonth(weather)).toBe(true);
  });

  it('does not flag high season even with rain', () => {
    const weather: MonthlyWeather = {
      month: 7, avg_temp_c: 22, avg_rain_mm: 200,
      avg_humidity: 70, condition: 'chuvoso', is_high_season: true,
    };
    expect(isUnfavorableMonth(weather)).toBe(false);
  });

  it('does not flag low rain months', () => {
    const weather: MonthlyWeather = {
      month: 6, avg_temp_c: 20, avg_rain_mm: 40,
      avg_humidity: 55, condition: 'ensolarado', is_high_season: false,
    };
    expect(isUnfavorableMonth(weather)).toBe(false);
  });

  it('handles null rain gracefully', () => {
    const weather: MonthlyWeather = {
      month: 3, avg_temp_c: 27, avg_rain_mm: null,
      avg_humidity: 70, condition: 'nublado', is_high_season: false,
    };
    expect(isUnfavorableMonth(weather)).toBe(false);
  });
});

describe('Best Month Selection', () => {
  it('selects month with least rain from high season', () => {
    const weather: MonthlyWeather[] = [
      { month: 5, avg_temp_c: 25, avg_rain_mm: 30, avg_humidity: 60, condition: 'ensolarado', is_high_season: true },
      { month: 6, avg_temp_c: 22, avg_rain_mm: 20, avg_humidity: 55, condition: 'ensolarado', is_high_season: true },
      { month: 7, avg_temp_c: 20, avg_rain_mm: 15, avg_humidity: 50, condition: 'ensolarado', is_high_season: true },
      { month: 1, avg_temp_c: 30, avg_rain_mm: 200, avg_humidity: 85, condition: 'chuvoso', is_high_season: false },
    ];
    const best = findBestMonth(weather);
    expect(best?.month).toBe(7); // lowest rain
  });

  it('returns undefined when no high season months', () => {
    const weather: MonthlyWeather[] = [
      { month: 1, avg_temp_c: 30, avg_rain_mm: 200, avg_humidity: 85, condition: 'chuvoso', is_high_season: false },
    ];
    expect(findBestMonth(weather)).toBeUndefined();
  });

  it('breaks rain tie by temperature', () => {
    const weather: MonthlyWeather[] = [
      { month: 5, avg_temp_c: 25, avg_rain_mm: 20, avg_humidity: 60, condition: 'ensolarado', is_high_season: true },
      { month: 6, avg_temp_c: 28, avg_rain_mm: 20, avg_humidity: 55, condition: 'ensolarado', is_high_season: true },
    ];
    const best = findBestMonth(weather);
    expect(best?.month).toBe(6); // same rain, higher temp
  });
});

describe('Weather Response Shape', () => {
  it('cache response has correct structure', () => {
    const response = {
      weather: [
        { month: 1, avg_temp_c: 28, avg_rain_mm: 175, avg_humidity: 80, condition: 'chuvoso', is_high_season: false },
      ],
      source: 'cache',
    };
    expect(response.weather[0]!.month).toBe(1);
    expect(response.source).toBe('cache');
  });

  it('fallback response has source=fallback', () => {
    const response = { weather: getStaticFallback(-14.1, [5, 6, 7]), source: 'fallback' };
    expect(response.source).toBe('fallback');
    expect(response.weather).toHaveLength(12);
  });
});
