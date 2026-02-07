import { useState, useEffect, useCallback } from 'react';
import type { ReadinessResponse } from '../types/api';
import { getReadiness } from '../lib/api';

interface HealthState {
  data: ReadinessResponse | null;
  loading: boolean;
  error: string | null;
  lastChecked: Date | null;
}

export function useHealth(pollInterval = 30_000) {
  const [state, setState] = useState<HealthState>({
    data: null,
    loading: true,
    error: null,
    lastChecked: null,
  });

  const refresh = useCallback(async () => {
    setState((s) => ({ ...s, loading: true, error: null }));
    try {
      const data = await getReadiness();
      setState({ data, loading: false, error: null, lastChecked: new Date() });
    } catch (err) {
      setState((s) => ({
        ...s,
        loading: false,
        error: err instanceof Error ? err.message : String(err),
      }));
    }
  }, []);

  useEffect(() => {
    refresh();
    const id = setInterval(refresh, pollInterval);
    return () => clearInterval(id);
  }, [refresh, pollInterval]);

  return { ...state, refresh };
}
