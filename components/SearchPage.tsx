"use client";

import { useState } from "react";
import { Search, FileText, X, ChevronDown, ChevronUp } from "lucide-react";
import { sendSearch, SourceDocument } from "@/lib/api";
import { useAppSettings } from "@/lib/settingsContext";

interface LawGroup {
  lawAbbr: string;
  lawTitle: string;
  chunks: SourceDocument[];
  bestSimilarity: number;
}

function groupByLaw(docs: SourceDocument[]): LawGroup[] {
  const map = new Map<string, LawGroup>();

  for (const doc of docs) {
    const abbr =
      String(doc.metadata?.law_abbreviation || doc.metadata?.title || "Unknown Law");
    const title = String(doc.metadata?.law_title || abbr);

    if (!map.has(abbr)) {
      map.set(abbr, { lawAbbr: abbr, lawTitle: title, chunks: [], bestSimilarity: 0 });
    }
    const group = map.get(abbr)!;
    group.chunks.push(doc);
    if (doc.similarity > group.bestSimilarity) group.bestSimilarity = doc.similarity;
  }

  return Array.from(map.values()).sort((a, b) => b.bestSimilarity - a.bestSimilarity);
}

export default function SearchPage() {
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<SourceDocument[]>([]);
  const [selectedGroup, setSelectedGroup] = useState<LawGroup | null>(null);
  const [expandedSection, setExpandedSection] = useState<string | null>(null);
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

  const lawGroups = groupByLaw(results);

  return (
    <div className="flex-1 overflow-y-auto px-4 sm:px-8 py-6 sm:py-10">
      {/* Header */}
      <div className="max-w-3xl mx-auto mb-8">
        <h1 className="text-2xl font-bold mb-2" style={{ color: "#1a1a2e" }}>
          Legal Document Search
        </h1>
        <p className="text-sm" style={{ color: "#7a8a9a" }}>
          Search across your legal knowledge base. Results are grouped by law.
        </p>
      </div>

      {/* Search bar */}
      <div className="max-w-3xl mx-auto mb-8">
        <div
          className="flex items-center gap-3 px-4 sm:px-5 w-full"
          style={{
            maxWidth: "762px",
            height: "56px",
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
              background: loading || !query.trim() ? "rgba(149,222,100,0.4)" : "#95DE64",
              color: "#1a2e0a",
              cursor: loading || !query.trim() ? "not-allowed" : "pointer",
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
            {lawGroups.length} law{lawGroups.length !== 1 ? "s" : ""} found ({results.length} section{results.length !== 1 ? "s" : ""}) for &ldquo;{searchedQuery}&rdquo;
          </p>
        )}

        {/* Loading skeleton */}
        {loading &&
          [0, 1, 2].map((i) => (
            <div
              key={i}
              className="rounded-2xl px-6 py-5 animate-pulse"
              style={{ background: "#f8f8f4", border: "1px solid rgba(211,242,182,0.3)" }}
            >
              <div className="h-4 rounded mb-3" style={{ background: "#e8e8e0", width: "40%" }} />
              <div className="h-3 rounded mb-2" style={{ background: "#e8e8e0", width: "100%" }} />
              <div className="h-3 rounded" style={{ background: "#e8e8e0", width: "75%" }} />
            </div>
          ))}

        {/* Law group cards */}
        {!loading &&
          lawGroups.map((group) => (
            <div
              key={group.lawAbbr}
              className="rounded-2xl px-6 py-5 transition-all duration-150 cursor-pointer"
              style={{ background: "#f8f8f4", border: "1px solid rgba(211,242,182,0.3)" }}
              onClick={() => { setSelectedGroup(group); setExpandedSection(null); }}
              onMouseEnter={(e) => {
                e.currentTarget.style.border = "1px solid rgba(149,222,100,0.5)";
                e.currentTarget.style.boxShadow = "0 4px 16px rgba(149,222,100,0.12)";
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.border = "1px solid rgba(211,242,182,0.3)";
                e.currentTarget.style.boxShadow = "none";
              }}
            >
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-2">
                  <FileText size={16} style={{ color: "#95DE64" }} />
                  <span className="text-sm font-bold" style={{ color: "#1a1a2e" }}>
                    {group.lawAbbr}
                  </span>
                </div>
                <span
                  className="text-xs px-3 py-1 rounded-full font-medium"
                  style={{ background: "rgba(149,222,100,0.18)", color: "#3d6b1e" }}
                >
                  {(group.bestSimilarity * 100).toFixed(1)}% match
                </span>
              </div>
              <p className="text-sm mb-3" style={{ color: "#4a5568" }}>
                {group.lawTitle}
              </p>
              <div className="flex flex-wrap gap-2">
                {group.chunks.map((chunk) => {
                  const sec = String(chunk.metadata?.section_identifier || "");
                  return sec ? (
                    <span
                      key={chunk.id}
                      className="text-xs px-2 py-0.5 rounded-md"
                      style={{ background: "rgba(149,222,100,0.12)", color: "#3d6b1e" }}
                    >
                      {sec}
                    </span>
                  ) : null;
                })}
              </div>
            </div>
          ))}

        {/* Empty state */}
        {!loading && searchedQuery && results.length === 0 && !error && (
          <div className="text-center py-12">
            <Search size={48} style={{ color: "#d4d4d4", margin: "0 auto 16px" }} />
            <p className="text-sm font-medium mb-1" style={{ color: "#7a8a9a" }}>
              No results found
            </p>
            <p className="text-xs" style={{ color: "#a0a0a0" }}>
              Try different keywords or adjust your similarity threshold in Settings.
            </p>
          </div>
        )}

        {/* Initial state */}
        {!loading && !searchedQuery && (
          <div className="text-center py-16">
            <Search size={48} style={{ color: "#d4d4d4", margin: "0 auto 16px" }} />
            <p className="text-sm font-medium mb-1" style={{ color: "#7a8a9a" }}>
              Search your legal knowledge base
            </p>
            <p className="text-xs" style={{ color: "#a0a0a0" }}>
              Enter a query above to find relevant legal documents and passages.
            </p>
          </div>
        )}
      </div>

      {/* Law detail modal */}
      {selectedGroup && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-6"
          style={{ background: "rgba(0,0,0,0.45)" }}
          onClick={() => setSelectedGroup(null)}
        >
          <div
            className="relative w-full max-w-2xl max-h-[85vh] overflow-y-auto rounded-2xl p-8"
            style={{ background: "#ffffff", boxShadow: "0 8px 40px rgba(0,0,0,0.18)" }}
            onClick={(e) => e.stopPropagation()}
          >
            {/* Close */}
            <button
              onClick={() => setSelectedGroup(null)}
              className="absolute top-5 right-5 p-1 rounded-lg"
              style={{ color: "#7a8a9a" }}
              onMouseEnter={(e) => (e.currentTarget.style.background = "#f0f0ec")}
              onMouseLeave={(e) => (e.currentTarget.style.background = "transparent")}
            >
              <X size={20} />
            </button>

            {/* Law header */}
            <div className="flex items-start gap-3 mb-6 pr-8">
              <FileText size={20} style={{ color: "#95DE64", flexShrink: 0, marginTop: 2 }} />
              <div>
                <h2 className="text-lg font-bold mb-1" style={{ color: "#1a1a2e" }}>
                  {selectedGroup.lawAbbr}
                </h2>
                <p className="text-sm" style={{ color: "#7a8a9a" }}>
                  {selectedGroup.lawTitle}
                </p>
              </div>
            </div>

            {/* Sections */}
            <div className="flex flex-col gap-3">
              {selectedGroup.chunks.map((chunk) => {
                const secId = String(chunk.metadata?.section_identifier || "");
                const secTitle = String(chunk.metadata?.section_title || "");
                const label = [secId, secTitle].filter(Boolean).join(" – ") || "Section";
                const isOpen = expandedSection === chunk.id;

                return (
                  <div
                    key={chunk.id}
                    className="rounded-xl overflow-hidden"
                    style={{ border: "1px solid rgba(211,242,182,0.5)" }}
                  >
                    {/* Section header — click to expand */}
                    <button
                      className="w-full flex items-center justify-between px-5 py-3 text-left"
                      style={{ background: isOpen ? "rgba(149,222,100,0.10)" : "#f8f8f4" }}
                      onClick={() => setExpandedSection(isOpen ? null : chunk.id)}
                    >
                      <span className="text-sm font-semibold" style={{ color: "#1a1a2e" }}>
                        {label}
                      </span>
                      <div className="flex items-center gap-3">
                        <span
                          className="text-xs px-2 py-0.5 rounded-full"
                          style={{ background: "rgba(149,222,100,0.18)", color: "#3d6b1e" }}
                        >
                          {(chunk.similarity * 100).toFixed(1)}%
                        </span>
                        {isOpen
                          ? <ChevronUp size={16} style={{ color: "#7a8a9a" }} />
                          : <ChevronDown size={16} style={{ color: "#7a8a9a" }} />}
                      </div>
                    </button>

                    {/* Section content */}
                    {isOpen && (
                      <div
                        className="px-5 py-4 text-sm leading-relaxed whitespace-pre-wrap"
                        style={{ color: "#2a2a2a", borderTop: "1px solid rgba(211,242,182,0.4)" }}
                      >
                        {chunk.content}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
