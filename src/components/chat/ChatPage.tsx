import { useEffect, type MutableRefObject } from 'react';
import { useChat } from '../../hooks/useChat';
import MessageList from './MessageList';
import ChatInput from './ChatInput';
import de from '../../i18n/de';

interface ChatPageProps {
  clearRef: MutableRefObject<(() => void) | null>;
}

export default function ChatPage({ clearRef }: ChatPageProps) {
  const { messages, streaming, error, send, stop, clear } = useChat();

  // Expose clear to parent for "Neuer Chat" button
  useEffect(() => {
    clearRef.current = clear;
    return () => {
      clearRef.current = null;
    };
  }, [clear, clearRef]);

  return (
    <div className="flex h-full flex-col">
      <MessageList messages={messages} />

      {error && (
        <div className="mx-auto max-w-3xl px-4 pb-2">
          <div className="rounded-lg bg-red-50 p-3 text-sm text-red-700">{de.chat.error}</div>
        </div>
      )}

      <ChatInput onSend={send} onStop={stop} streaming={streaming} />
    </div>
  );
}
