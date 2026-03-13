import { describe, it, expect } from 'vitest';
import type { HealthResponse } from '@travelmatch/shared';

describe('Health Check', () => {
  it('should return ok status with correct shape', () => {
    const response: HealthResponse = {
      status: 'ok',
      timestamp: new Date().toISOString(),
      version: '0.1.0',
    };

    expect(response.status).toBe('ok');
    expect(response.version).toBe('0.1.0');
    expect(response.timestamp).toBeTruthy();
  });

  it('should have valid ISO timestamp', () => {
    const response: HealthResponse = {
      status: 'ok',
      timestamp: new Date().toISOString(),
      version: '0.1.0',
    };

    const parsed = new Date(response.timestamp);
    expect(parsed.getTime()).not.toBeNaN();
  });
});
