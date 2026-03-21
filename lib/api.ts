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
    let currentEvent = "";
    const dataLines: string[] = [];

    const dispatch = () => {
      if (!currentEvent && dataLines.length === 0) return;
      const data = dataLines.join("\n");
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
      currentEvent = "";
      dataLines.length = 0;
    };

    while (true) {
      const { done, value } = await reader.read();
      if (done) break;

      buffer += decoder.decode(value, { stream: true });
      // Normalize \r\n to \n
      buffer = buffer.replace(/\r\n/g, "\n");
      const lines = buffer.split("\n");
      // Keep last (possibly incomplete) line in buffer
      buffer = lines.pop() || "";

      for (const line of lines) {
        if (line === "") {
          // Blank line = end of event
          dispatch();
        } else if (line.startsWith("event:")) {
          currentEvent = line.slice(6).trim();
        } else if (line.startsWith("data:")) {
          dataLines.push(line.slice(5));
        }
      }
    }
    // Dispatch any remaining event
    dispatch();
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
