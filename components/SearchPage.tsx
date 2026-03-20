"use client";

import { useState } from "react";
import { Search, FileText, ExternalLink } from "lucide-react";
import { sendSearch, SourceDocument } from "@/lib/api";
import { useAppSettings } from "@/lib/settingsContext";

export default function SearchPage() {
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<SourceDocument[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [searchedQuery, setSearchedQuery] = useState<string | null>(null);
  const { settings } = useAppSettings();

  const handleSearch = async () => {
    const trimmed = query.trim();
    if (!trimmed) return;

    setLoading(true);
    setError(null);
    setResults([]);
    setSearchedQuery(trimmed);

    try {
      const res = await sendSearch({
        query: trimmed,
        top_k: settings.topK,
        similarity_threshold: settings.similarity,
      });
      setResults(res.results);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Search failed");
    } finally {
      setLoading(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !loading) {
      handleSearch();
    }
  };

  return (
    <div className="flex-1 overflow-y-auto px-8 py-10">
      {/* Header */}
      <div className="max-w-3xl mx-auto mb-8">
        <h1
          className="text-2xl font-bold mb-2"
          style={{ color: "#1a1a2e" }}
        >
          Legal Document Search
        </h1>
        <p className="text-sm" style={{ color: "#7a8a9a" }}>
          Search across your legal knowledge base. Results are ranked by
          semantic similarity.
        </p>
      </div>

      {/* Search bar */}
      <div className="max-w-3xl mx-auto mb-8">
        <div
          className="flex items-center gap-3 px-5"
          style={{
            width: "762px",
            maxWidth: "100%",
            height: "64px",
            border: "2px solid #D3F2B6",
            borderRadius: "18px",
            background: "#ffffff",
            boxShadow: "0 2px 12px rgba(149,222,100,0.10)",
          }}
        >
          <Search size={20} style={{ color: "#95DE64", flexShrink: 0 }} />
          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Search legal documents..."
            className="flex-1 bg-transparent outline-none text-sm"
            style={{ color: "#1a1a2e" }}
          />
          <button
            onClick={handleSearch}
            disabled={loading || !query.trim()}
            className="px-5 py-2 rounded-xl text-sm font-medium transition-all duration-150"
            style={{
              background:
                loading || !query.trim()
                  ? "rgba(149,222,100,0.4)"
                  : "#95DE64",
              color: "#1a2e0a",
              cursor:
                loading || !query.trim() ? "not-allowed" : "pointer",
            }}
          >
            {loading ? "Searching..." : "Search"}
          </button>
        </div>
      </div>

      {/* Error */}
      {error && (
        <div
          className="max-w-3xl mx-auto mb-6 px-5 py-4 rounded-xl text-sm"
          style={{
            background: "rgba(239,68,68,0.08)",
            color: "#dc2626",
            border: "1px solid rgba(239,68,68,0.2)",
          }}
        >
          {error}
        </div>
      )}

      {/* Results */}
      <div className="max-w-3xl mx-auto flex flex-col gap-4">
        {/* Result count */}
        {searchedQuery && !loading && (
          <p className="text-xs mb-2" style={{ color: "#7a8a9a" }}>
            {results.length} result{results.length !== 1 ? "s" : ""} for
            &ldquo;{searchedQuery}&rdquo;
          </p>
        )}

        {/* Loading skeleton */}
        {loading &&
          [0, 1, 2].map((i) => (
            <div
              key={i}
              className="rounded-2xl px-6 py-5 animate-pulse"
              style={{
                background: "#f8f8f4",
                border: "1px solid rgba(211,242,182,0.3)",
              }}
            >
              <div
                className="h-4 rounded mb-3"
                style={{ background: "#e8e8e0", width: "40%" }}
              />
              <div
                className="h-3 rounded mb-2"
                style={{ background: "#e8e8e0", width: "100%" }}
              />
              <div
                className="h-3 rounded"
                style={{ background: "#e8e8e0", width: "75%" }}
              />
            </div>
          ))}

        {/* Result cards */}
        {!loading &&
          results.map((doc, idx) => (
            <div
              key={doc.id || idx}
              className="rounded-2xl px-6 py-5 transition-all duration-150"
              style={{
                background: "#f8f8f4",
                border: "1px solid rgba(211,242,182,0.3)",
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.border =
                  "1px solid rgba(149,222,100,0.5)";
                e.currentTarget.style.boxShadow =
                  "0 4px 16px rgba(149,222,100,0.12)";
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.border =
                  "1px solid rgba(211,242,182,0.3)";
                e.currentTarget.style.boxShadow = "none";
              }}
            >
              {/* Header row */}
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-2">
                  <FileText
                    size={16}
                    style={{ color: "#95DE64" }}
                  />
                  <span
                    className="text-sm font-semibold"
                    style={{ color: "#1a1a2e" }}
                  >
                    {doc.source_display || `Document ${idx + 1}`}
                  </span>
                </div>
                <span
                  className="text-xs px-3 py-1 rounded-full font-medium"
                  style={{
                    background: "rgba(149,222,100,0.18)",
                    color: "#3d6b1e",
                  }}
                >
                  {(doc.similarity * 100).toFixed(1)}% match
                </span>
              </div>

              {/* Content preview */}
              <p
                className="text-sm leading-relaxed mb-3"
                style={{ color: "#4a4a4a" }}
              >
                {doc.content.length > 400
                  ? doc.content.slice(0, 400) + "..."
                  : doc.content}
              </p>

              {/* Metadata tags */}
              {doc.metadata && Object.keys(doc.metadata).length > 0 && (
                <div className="flex flex-wrap gap-2">
                  {Object.entries(doc.metadata)
                    .filter(
                      ([key]) =>
                        !["id", "embedding"].includes(key.toLowerCase())
                    )
                    .slice(0, 5)
                    .map(([key, value]) => (
                      <span
                        key={key}
                        className="text-xs px-2 py-0.5 rounded-md"
                        style={{
                          background: "rgba(149,222,100,0.10)",
                          color: "#5a6a5a",
                        }}
                      >
                        {key}: {String(value)}
                      </span>
                    ))}
                </div>
              )}
            </div>
          ))}

        {/* Empty state */}
        {!loading &&
          searchedQuery &&
          results.length === 0 &&
          !error && (
            <div className="text-center py-12">
              <Search
                size={48}
                style={{ color: "#d4d4d4", margin: "0 auto 16px" }}
              />
              <p
                className="text-sm font-medium mb-1"
                style={{ color: "#7a8a9a" }}
              >
                No results found
              </p>
              <p className="text-xs" style={{ color: "#a0a0a0" }}>
                Try different keywords or adjust your similarity threshold
                in Settings.
              </p>
            </div>
          )}

        {/* Initial state */}
        {!loading && !searchedQuery && (
          <div className="text-center py-16">
            <Search
              size={48}
              style={{ color: "#d4d4d4", margin: "0 auto 16px" }}
            />
            <p
              className="text-sm font-medium mb-1"
              style={{ color: "#7a8a9a" }}
            >
              Search your legal knowledge base
            </p>
            <p className="text-xs" style={{ color: "#a0a0a0" }}>
              Enter a query above to find relevant legal documents and
              passages.
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
