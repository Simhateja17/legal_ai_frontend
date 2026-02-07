import { useState } from 'react';
import type { SourceDocument } from '../../types/api';
import de from '../../i18n/de';

const MAX_PREVIEW = 300;

export default function ResultCard({ doc }: { doc: SourceDocument }) {
  const [expanded, setExpanded] = useState(false);
  const needsTruncation = doc.content.length > MAX_PREVIEW;
  const displayContent = expanded ? doc.content : doc.content.slice(0, MAX_PREVIEW);
  const similarity = (doc.similarity * 100).toFixed(1);

  return (
    <div className="rounded-xl border border-gray-200 bg-white p-5 shadow-sm">
      <div className="mb-2 flex items-center justify-between">
        <span className="text-xs font-medium text-gray-500">
          {de.search.source}: {doc.source_display}
        </span>
        <span className="rounded-full bg-green-50 px-2 py-0.5 text-xs font-medium text-green-700">
          {similarity}% {de.search.similarity}
        </span>
      </div>
      <p className="whitespace-pre-wrap text-sm text-gray-700">
        {displayContent}
        {needsTruncation && !expanded && '...'}
      </p>
      {needsTruncation && (
        <button
          onClick={() => setExpanded(!expanded)}
          className="mt-2 text-xs font-medium text-blue-600 hover:text-blue-800 cursor-pointer"
        >
          {expanded ? de.common.collapse : de.common.expand}
        </button>
      )}
    </div>
  );
}
