import { useState } from 'react';
import type { SourceDocument } from '../../types/api';
import de from '../../i18n/de';

const MAX_PREVIEW = 200;

export default function SourceCard({ source }: { source: SourceDocument }) {
  const [expanded, setExpanded] = useState(false);
  const needsTruncation = source.content.length > MAX_PREVIEW;
  const displayContent = expanded ? source.content : source.content.slice(0, MAX_PREVIEW);
  const similarity = (source.similarity * 100).toFixed(1);

  return (
    <div className="rounded-lg border border-gray-200 bg-gray-50 p-3 text-xs">
      <div className="flex items-center justify-between">
        <span className="font-medium text-gray-600">{source.source_display}</span>
        <span className="text-gray-400">{similarity}%</span>
      </div>
      <p className="mt-1 whitespace-pre-wrap text-gray-500">
        {displayContent}
        {needsTruncation && !expanded && '...'}
      </p>
      {needsTruncation && (
        <button
          onClick={() => setExpanded(!expanded)}
          className="mt-1 font-medium text-blue-600 hover:text-blue-800 cursor-pointer"
        >
          {expanded ? de.common.collapse : de.common.expand}
        </button>
      )}
    </div>
  );
}
