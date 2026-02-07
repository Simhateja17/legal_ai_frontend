import { useSearch } from '../../hooks/useSearch';
import SearchInput from './SearchInput';
import ResultCard from './ResultCard';
import de from '../../i18n/de';

export default function SearchPage() {
  const { results, count, loading, error, searched, search } = useSearch();

  return (
    <div className="mx-auto max-w-3xl p-8">
      <h2 className="mb-6 text-2xl font-bold">{de.nav.search}</h2>

      <SearchInput onSearch={search} loading={loading} />

      {error && (
        <div className="mt-4 rounded-lg bg-red-50 p-4 text-sm text-red-700">{de.search.error}</div>
      )}

      {!searched && !loading && (
        <p className="mt-12 text-center text-sm text-gray-400">{de.search.empty}</p>
      )}

      {searched && !loading && results.length === 0 && !error && (
        <p className="mt-12 text-center text-sm text-gray-400">{de.search.noResults}</p>
      )}

      {results.length > 0 && (
        <div className="mt-6">
          <p className="mb-3 text-sm text-gray-500">
            {count} {de.search.results}
          </p>
          <div className="space-y-4">
            {results.map((doc) => (
              <ResultCard key={doc.id} doc={doc} />
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
