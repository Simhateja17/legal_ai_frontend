import { useState, useCallback, useRef } from 'react';
import type { ConversationMessage, SourceDocument } from '../types/api';
import { streamChat } from '../lib/sse';
import { useSettings } from './useSettings';

export interface ChatMessage {
  role: 'user' | 'assistant';
  content: string;
  sources?: SourceDocument[];
  streaming?: boolean;
}

interface ChatState {
  messages: ChatMessage[];
  streaming: boolean;
  error: string | null;
}

/**
 * Fix malformed markdown patterns from LLM output.
 * Handles "** text **" → "**text**" and "1 ." → "1."
 */
function fixMarkdown(text: string): string {
  // Fix bold markers with inner spaces (handles multi-line): "** text **" → "**text**"
  text = text.replace(/\*\*\s+([\s\S]+?)\s+\*\*/g, '**$1**');
  // Fix broken list: digit-dot on own line, bold label on next line
  text = text.replace(/^(\d+)\.\s*\n\*\*(.+?)\*\*(\s*:?)/gm, '$1. **$2**$3');
  // Fix numbered list items with extra spaces: "1 ." → "1."
  text = text.replace(/(\d+)\s+\./g, '$1.');
  return text;
}

export function useChat() {
  const { settings } = useSettings();
  const [state, setState] = useState<ChatState>({
    messages: [],
    streaming: false,
    error: null,
  });
  const abortRef = useRef<AbortController | null>(null);

  const send = useCallback(
    (query: string) => {
      if (!query.trim() || state.streaming) return;

      const userMsg: ChatMessage = { role: 'user', content: query.trim() };
      const assistantMsg: ChatMessage = { role: 'assistant', content: '', streaming: true };

      // Build conversation_history from existing messages (exclude the new ones)
      const history: ConversationMessage[] = state.messages
        .filter((m) => !m.streaming)
        .map((m) => ({ role: m.role, content: m.content }));

      setState((s) => ({
        ...s,
        messages: [...s.messages, userMsg, assistantMsg],
        streaming: true,
        error: null,
      }));

      const controller = streamChat(
        {
          query: query.trim(),
          conversation_history: history,
          top_k: settings.topK,
          similarity_threshold: settings.similarityThreshold,
          mode: settings.mode,
        },
        {
          onToken(token) {
            setState((s) => {
              const msgs = [...s.messages];
              const last = { ...msgs[msgs.length - 1] };
              last.content += token;
              msgs[msgs.length - 1] = last;
              return { ...s, messages: msgs };
            });
          },
          onSources(sources) {
            setState((s) => {
              const msgs = [...s.messages];
              const last = { ...msgs[msgs.length - 1] };
              last.sources = sources;
              msgs[msgs.length - 1] = last;
              return { ...s, messages: msgs };
            });
          },
          onDone() {
            setState((s) => {
              const msgs = [...s.messages];
              const last = { ...msgs[msgs.length - 1] };
              last.content = fixMarkdown(last.content);
              last.streaming = false;
              msgs[msgs.length - 1] = last;
              return { ...s, messages: msgs, streaming: false };
            });
            abortRef.current = null;
          },
          onError(err) {
            setState((s) => ({
              ...s,
              streaming: false,
              error: err.message,
            }));
            abortRef.current = null;
          },
        },
      );

      abortRef.current = controller;
    },
    [state.messages, state.streaming, settings.topK, settings.similarityThreshold, settings.mode],
  );

  const stop = useCallback(() => {
    abortRef.current?.abort();
    abortRef.current = null;
  }, []);

  const clear = useCallback(() => {
    abortRef.current?.abort();
    abortRef.current = null;
    setState({ messages: [], streaming: false, error: null });
  }, []);

  return { ...state, send, stop, clear };
}
