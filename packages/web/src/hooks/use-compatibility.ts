'use client';

import { useState, useEffect, useCallback } from 'react';
import type { CompatibilityResponse } from '@travelmatch/shared';

interface UseCompatibilityOptions {
  enabled?: boolean;
}

export function useCompatibility(options: UseCompatibilityOptions = {}) {
  const { enabled = true } = options;
  const [data, setData] = useState<CompatibilityResponse | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetch_ = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch('/api/compatibility');
      if (!res.ok) {
        const body = await res.json().catch(() => ({}));
        throw new Error(body.error || `HTTP ${res.status}`);
      }
      const json: CompatibilityResponse = await res.json();
      setData(json);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erro ao carregar compatibilidade');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (enabled) {
      fetch_();
    }
  }, [enabled, fetch_]);

  return { data, loading, error, refetch: fetch_ };
}
