import { useState, useCallback } from 'react';
import type { SourceDocument } from '../types/api';
import { postSearch } from '../lib/api';
import { useSettings } from './useSettings';

interface SearchState {
  results: SourceDocument[];
  query: string;
  count: number;
  loading: boolean;
  error: string | null;
  searched: boolean;
}

export function useSearch() {
  const { settings } = useSettings();
  const [state, setState] = useState<SearchState>({
    results: [],
    query: '',
    count: 0,
    loading: false,
    error: null,
    searched: false,
  });

  const search = useCallback(
    async (query: string) => {
      if (!query.trim()) return;
      setState((s) => ({ ...s, loading: true, error: null }));
      try {
        const data = await postSearch({
          query: query.trim(),
          top_k: settings.topK,
          similarity_threshold: settings.similarityThreshold,
        });
        setState({
          results: data.results,
          query: data.query,
          count: data.count,
          loading: false,
          error: null,
          searched: true,
        });
      } catch (err) {
        setState((s) => ({
          ...s,
          loading: false,
          error: err instanceof Error ? err.message : String(err),
          searched: true,
        }));
      }
    },
    [settings.topK, settings.similarityThreshold],
  );

  return { ...state, search };
}
