import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import type { ChatMessage } from '../../hooks/useChat';
import SourceCard from './SourceCard';
import de from '../../i18n/de';

export default function MessageBubble({ message }: { message: ChatMessage }) {
  const isUser = message.role === 'user';

  return (
    <div className={`flex ${isUser ? 'justify-end' : 'justify-start'}`}>
      <div
        className={`max-w-[80%] rounded-2xl px-4 py-3 ${
          isUser
            ? 'bg-gray-900 text-white'
            : 'bg-white border border-gray-200 text-gray-800'
        }`}
      >
        {isUser ? (
          <p className="whitespace-pre-wrap text-sm">{message.content}</p>
        ) : (
          <div className="prose prose-sm max-w-none prose-p:my-1 prose-headings:mb-2 prose-headings:mt-3 prose-ul:my-1 prose-li:my-0">
            {message.content ? (
              <ReactMarkdown remarkPlugins={[remarkGfm]}>{message.content}</ReactMarkdown>
            ) : (
              <p className="text-gray-400 italic">{de.chat.thinking}</p>
            )}
            {message.streaming && message.content && (
              <span className="inline-block h-4 w-1.5 animate-pulse bg-gray-400 align-text-bottom" />
            )}
          </div>
        )}

        {!isUser && message.sources && message.sources.length > 0 && !message.streaming && (
          <div className="mt-3 border-t border-gray-100 pt-3">
            <p className="mb-2 text-xs font-semibold text-gray-500">{de.chat.sources}</p>
            <div className="space-y-2">
              {message.sources.map((s) => (
                <SourceCard key={s.id} source={s} />
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
