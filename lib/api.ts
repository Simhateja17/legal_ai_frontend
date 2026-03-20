const API_BASE = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";

// ---------- Types ----------

export interface SourceDocument {
  id: string;
  content: string;
  metadata: Record<string, unknown>;
  similarity: number;
  source_display: string;
}

export interface ChatRequest {
  query: string;
  conversation_history: { role: string; content: string }[];
  top_k?: number | null;
  similarity_threshold?: number | null;
  metadata_filter?: Record<string, unknown> | null;
  mode?: "normal" | "student" | "lawyer";
}

export interface ChatResponse {
  answer: string;
  sources: SourceDocument[];
  query: string;
}

export interface SearchRequest {
  query: string;
  top_k?: number | null;
  similarity_threshold?: number | null;
  metadata_filter?: Record<string, unknown> | null;
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

// ---------- Health ----------

export async function fetchHealth(): Promise<HealthResponse> {
  const res = await fetch(`${API_BASE}/health`);
  if (!res.ok) throw new Error(`Health check failed: ${res.status}`);
  return res.json();
}

export async function fetchReadiness(): Promise<ReadinessResponse> {
  const res = await fetch(`${API_BASE}/health/ready`);
  if (!res.ok) throw new Error(`Readiness check failed: ${res.status}`);
  return res.json();
}

// ---------- Chat (non-streaming) ----------

export async function sendChat(request: ChatRequest): Promise<ChatResponse> {
  const res = await fetch(`${API_BASE}/api/v1/chat`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(request),
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({ detail: "Unknown error" }));
    throw new Error(err.detail || `Chat request failed: ${res.status}`);
  }
  return res.json();
}

// ---------- Chat (streaming via SSE) ----------

export async function sendChatStream(
  request: ChatRequest,
  onToken: (token: string) => void,
  onSources: (sources: SourceDocument[]) => void,
  onDone: () => void,
  onError: (error: string) => void,
): Promise<void> {
  try {
    const res = await fetch(`${API_BASE}/api/v1/chat/stream`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(request),
    });

    if (!res.ok) {
      const err = await res.json().catch(() => ({ detail: "Unknown error" }));
      onError(err.detail || `Stream request failed: ${res.status}`);
      return;
    }

    const reader = res.body?.getReader();
    if (!reader) {
      onError("No response body");
      return;
    }

    const decoder = new TextDecoder();
    let buffer = "";

    while (true) {
      const { done, value } = await reader.read();
      if (done) break;

      buffer += decoder.decode(value, { stream: true });
      const lines = buffer.split("\n");
      buffer = lines.pop() || "";

      let currentEvent = "";
      for (const line of lines) {
        if (line.startsWith("event:")) {
          currentEvent = line.slice(6).trim();
        } else if (line.startsWith("data:")) {
          const data = line.slice(5);
          if (currentEvent === "token") {
            onToken(data);
          } else if (currentEvent === "sources") {
            try {
              const sources = JSON.parse(data);
              onSources(sources);
            } catch {
              // ignore parse errors
            }
          } else if (currentEvent === "done") {
            onDone();
          }
        }
      }
    }
  } catch (err) {
    onError(err instanceof Error ? err.message : "Stream connection failed");
  }
}

// ---------- Search ----------

export async function sendSearch(
  request: SearchRequest,
): Promise<SearchResponse> {
  const res = await fetch(`${API_BASE}/api/v1/search`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(request),
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({ detail: "Unknown error" }));
    throw new Error(err.detail || `Search request failed: ${res.status}`);
  }
  return res.json();
}
