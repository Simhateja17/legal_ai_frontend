export interface ConversationMessage {
  role: 'user' | 'assistant';
  content: string;
}

export interface ChatRequest {
  query: string;
  conversation_history: ConversationMessage[];
  top_k?: number | null;
  similarity_threshold?: number | null;
  metadata_filter?: Record<string, unknown> | null;
}

export interface SearchRequest {
  query: string;
  top_k?: number | null;
  similarity_threshold?: number | null;
  metadata_filter?: Record<string, unknown> | null;
}

export interface SourceDocument {
  id: string;
  content: string;
  metadata: Record<string, unknown>;
  similarity: number;
  source_display: string;
}

export interface ChatResponse {
  answer: string;
  sources: SourceDocument[];
  query: string;
}

export interface SearchResponse {
  results: SourceDocument[];
  query: string;
  count: number;
}

export interface HealthResponse {
  status: string;
}

export interface ReadinessResponse {
  status: string;
  database: string;
  llm_provider: string;
}

export interface ErrorResponse {
  detail: string;
}

// SSE event types from /api/v1/chat/stream
export type SSEEvent =
  | { event: 'token'; data: string }
  | { event: 'sources'; data: SourceDocument[] }
  | { event: 'done'; data: '' };
