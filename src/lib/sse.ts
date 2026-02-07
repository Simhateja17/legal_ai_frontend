import type { ChatRequest, SourceDocument } from '../types/api';

export interface SSECallbacks {
  onToken: (token: string) => void;
  onSources: (sources: SourceDocument[]) => void;
  onDone: () => void;
  onError: (error: Error) => void;
}

/**
 * POST-based SSE consumer for /api/v1/chat/stream.
 * Returns an AbortController so the caller can cancel the stream.
 */
export function streamChat(body: ChatRequest, callbacks: SSECallbacks): AbortController {
  const controller = new AbortController();

  (async () => {
    try {
      const res = await fetch('/api/v1/chat/stream', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
        signal: controller.signal,
      });

      if (!res.ok) {
        const errBody = await res.json().catch(() => ({ detail: res.statusText }));
        throw new Error(errBody.detail || `HTTP ${res.status}`);
      }

      const reader = res.body!.getReader();
      const decoder = new TextDecoder();
      let buffer = '';

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        buffer += decoder.decode(value, { stream: true });
        const lines = buffer.split('\n');
        // Keep the last (possibly incomplete) line in buffer
        buffer = lines.pop()!;

        let currentEvent = '';
        for (const line of lines) {
          if (line.startsWith('event: ')) {
            currentEvent = line.slice(7).trim();
          } else if (line.startsWith('data: ')) {
            const data = line.slice(6);
            if (currentEvent === 'token') {
              callbacks.onToken(data);
            } else if (currentEvent === 'sources') {
              try {
                const sources = JSON.parse(data) as SourceDocument[];
                callbacks.onSources(sources);
              } catch {
                // ignore malformed JSON
              }
            } else if (currentEvent === 'done') {
              callbacks.onDone();
            }
            currentEvent = '';
          }
          // empty lines reset event state per SSE spec
          if (line === '') {
            currentEvent = '';
          }
        }
      }

      // Process any remaining buffer
      if (buffer.trim()) {
        const lines = buffer.split('\n');
        let currentEvent = '';
        for (const line of lines) {
          if (line.startsWith('event: ')) {
            currentEvent = line.slice(7).trim();
          } else if (line.startsWith('data: ')) {
            const data = line.slice(6);
            if (currentEvent === 'token') {
              callbacks.onToken(data);
            } else if (currentEvent === 'sources') {
              try {
                const sources = JSON.parse(data) as SourceDocument[];
                callbacks.onSources(sources);
              } catch {
                // ignore
              }
            } else if (currentEvent === 'done') {
              callbacks.onDone();
            }
          }
        }
      }

      callbacks.onDone();
    } catch (err: unknown) {
      if (err instanceof DOMException && err.name === 'AbortError') {
        callbacks.onDone();
        return;
      }
      callbacks.onError(err instanceof Error ? err : new Error(String(err)));
    }
  })();

  return controller;
}
