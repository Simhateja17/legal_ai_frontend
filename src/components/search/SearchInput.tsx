import { useState } from 'react';
import de from '../../i18n/de';

interface SearchInputProps {
  onSearch: (query: string) => void;
  loading: boolean;
}

export default function SearchInput({ onSearch, loading }: SearchInputProps) {
  const [value, setValue] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (value.trim()) onSearch(value.trim());
  };

  return (
    <form onSubmit={handleSubmit} className="flex gap-3">
      <input
        type="text"
        value={value}
        onChange={(e) => setValue(e.target.value)}
        placeholder={de.search.placeholder}
        className="flex-1 rounded-lg border border-gray-300 px-4 py-2.5 text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
      />
      <button
        type="submit"
        disabled={loading || !value.trim()}
        className="rounded-lg bg-gray-900 px-6 py-2.5 text-sm font-medium text-white hover:bg-gray-800 disabled:opacity-50 cursor-pointer"
      >
        {loading ? de.common.loading : de.search.button}
      </button>
    </form>
  );
}
