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
 * Fix OCR-broken German words using a dictionary of known broken patterns.
 * Only targets specific word patterns that OCR commonly splits.
 */
const OCR_FIXES: [RegExp, string][] = [
  // Legal compound words
  [/\bstraf\s*recht\s*lich\s*e?n?\b/gi, (m: string) => m.replace(/\s+/g, '')],
  [/\bHaft\s+ung\b/gi, 'Haftung'],
  [/\bV\s+ors\s*atz\b/gi, 'Vorsatz'],
  [/\bF\s*ah\s*rl\s*äss\s*ig\s*keit\b/gi, 'Fahrlässigkeit'],
  [/\bTat\s+best?\s*ands?\b/gi, (m: string) => m.replace(/\s+/g, '')],
  [/\bRe\s*chts\s*wid\s*rig\s*keit\b/gi, 'Rechtswidrigkeit'],
  [/\bSch\s+uld\b/gi, 'Schuld'],
  [/\bStr\s*af\s*bar\s*keit\b/gi, 'Strafbarkeit'],
  [/\bStr\s+af\s*maß\b/gi, 'Strafmaß'],
  [/\bRechts\s*anw\s*alt\b/gi, 'Rechtsanwalt'],
  [/\bRechts\s*ber?\s*atung\b/gi, 'Rechtsberatung'],
  [/\bVerein\s+barung\b/gi, 'Vereinbarung'],
  [/\bVertr\s+äge?\b/gi, (m: string) => m.replace(/\s+/g, '')],
  [/\bgesetz\s*buch\b/gi, 'gesetzbuch'],
  [/\bRecht\s*fert\s*igungs?\s*grund\b/gi, 'Rechtfertigungsgrund'],
  [/\bNot\s+wehr\b/gi, 'Notwehr'],
  [/\bNot\s+stand\b/gi, 'Notstand'],
  [/\bBe\s+geh\s*ung\b/gi, 'Begehung'],
  [/\bver\s*wirk\s*lich\s*ung\b/gi, 'Verwirklichung'],
  [/\bS\s*org\s*falt\b/gi, 'Sorgfalt'],
  [/\bUm\s+ständ\s*e?\b/gi, (m: string) => m.replace(/\s+/g, '')],
  [/\bSch\s*uld\s*un\s*fähig\s*keit\b/gi, 'Schuldunfähigkeit'],
  [/\bEins\s+icht\b/gi, 'Einsicht'],
  [/\bpers\s+önlich\w*/gi, (m: string) => m.replace(/\s+/g, '')],
  [/\bAllgeme\s+ine?\b/gi, (m: string) => m.replace(/\s+/g, '')],
  [/\bStra\s*f\s*tat\s*en?\b/gi, (m: string) => m.replace(/\s+/g, '')],
  [/\bOr\s*dn\s*ungs\s*wid\s*rig\s*keit\s*en?\b/gi, (m: string) => m.replace(/\s+/g, '')],
  [/\bschuld\s+haft\b/gi, 'schuldhaft'],
  [/\bgehand\s+elt\b/gi, 'gehandelt'],
  [/\bdefini\s+ert\b/gi, 'definiert'],
  [/\bdetaill\s+iert\w*/gi, (m: string) => m.replace(/\s+/g, '')],
  [/\bspezif\s+isch\w*/gi, (m: string) => m.replace(/\s+/g, '')],
  [/\bTä\s+ters?\b/gi, (m: string) => m.replace(/\s+/g, '')],
  [/\bwirk\s+lich\b/gi, 'wirklich'],
  [/\bSch\s+were?\b/gi, (m: string) => m.replace(/\s+/g, '')],
  [/\bgest\s+ellt\w*/gi, (m: string) => m.replace(/\s+/g, '')],
  [/\bverm\s*inder\s+te?\b/gi, (m: string) => m.replace(/\s+/g, '')],
  [/\bwid\s+rig\b/gi, 'widrig'],
  [/\bAs\s+pekt\s*e?n?\b/gi, (m: string) => m.replace(/\s+/g, '')],
  [/\bverbind\s+lich\w*/gi, (m: string) => m.replace(/\s+/g, '')],
  [/\bAus\s+künfte\b/gi, 'Auskünfte'],
  [/\bbereit\s+stellen\b/gi, 'bereitstellen'],
  [/\bbereit\s+gestellt\w*/gi, (m: string) => m.replace(/\s+/g, '')],
  [/\bent\s+sprechend\w*/gi, (m: string) => m.replace(/\s+/g, '')],
  [/\bent\s+halten\b/gi, 'enthalten'],
  [/\bW\s+ollen\b/g, 'Wollen'],
  // Common words with OCR breaks
  [/\bHin\s+weis/gi, 'Hinweis'],
  [/\bBest\s+es/gi, 'Bestes'],
  [/\brecht\s+lichen/gi, 'rechtlichen'],
  [/\bRahmen\s+bedingungen/gi, 'Rahmenbedingungen'],
  // Legal abbreviations
  [/\bB\s+GB\b/g, 'BGB'],
  [/\bSt\s+GB\b/g, 'StGB'],
  [/\bH\s+GB\b/g, 'HGB'],
  [/\bZ\s+PO\b/g, 'ZPO'],
  [/\bSt\s+PO\b/g, 'StPO'],
  [/\bAbs\s+\./g, 'Abs.'],
  [/\bNr\s+\./g, 'Nr.'],
  [/\bArt\s+\./g, 'Art.'],
  [/\bz\s+\.B\s+\./g, 'z.B.'],
];

function fixOCR(text: string): string {
  for (const [pattern, replacement] of OCR_FIXES) {
    if (typeof replacement === 'function') {
      text = text.replace(pattern, replacement as (substring: string) => string);
    } else {
      text = text.replace(pattern, replacement);
    }
  }
  return text;
}

/**
 * Fix malformed markdown patterns from LLM output.
 * Handles "** text **" → "**text**", "1 ." → "1.", and OCR word breaks.
 */
function fixMarkdown(text: string): string {
  // Fix OCR-broken words using dictionary approach
  text = fixOCR(text);

  // Fix bold markers with inner spaces
  text = text.replace(/\*\*\s+(.+?)\s+\*\*/g, '**$1**');

  // Fix numbered list items with extra spaces
  text = text.replace(/(\d+)\s+\./g, '$1.');

  // Fix spaces before punctuation (but not after markdown chars)
  text = text.replace(/(\w)\s+([.,;:!?)])/g, '$1$2');

  // Remove any ⚖️ emoji
  text = text.replace(/⚖️\s*/g, '');

  // Fix "Hin weis" -> "Hinweis" in case OCR fix missed it
  text = text.replace(/Hin\s+weis/gi, 'Hinweis');

  // Ensure disclaimer starts on a new line — match "Hinweis:" anywhere
  text = text.replace(/\s*Hinweis:\s*Dieser/gi, '\n\nHinweis: Dieser');

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
    [state.messages, state.streaming, settings.topK, settings.similarityThreshold],
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
