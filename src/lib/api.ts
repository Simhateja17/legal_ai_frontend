import type {
  ChatRequest,
  ChatResponse,
  SearchRequest,
  SearchResponse,
  HealthResponse,
  ReadinessResponse,
} from '../types/api';

async function request<T>(url: string, options?: RequestInit): Promise<T> {
  const res = await fetch(url, {
    headers: { 'Content-Type': 'application/json' },
    ...options,
  });
  if (!res.ok) {
    const body = await res.json().catch(() => ({ detail: res.statusText }));
    throw new Error(body.detail || `HTTP ${res.status}`);
  }
  return res.json() as Promise<T>;
}

export function getHealth(): Promise<HealthResponse> {
  return request('/health');
}

export function getReadiness(): Promise<ReadinessResponse> {
  return request('/health/ready');
}

export function postSearch(body: SearchRequest): Promise<SearchResponse> {
  return request('/api/v1/search', {
    method: 'POST',
    body: JSON.stringify(body),
  });
}

export function postChat(body: ChatRequest): Promise<ChatResponse> {
  return request('/api/v1/chat', {
    method: 'POST',
    body: JSON.stringify(body),
  });
}
