"use client";

import { useState, useEffect, useCallback } from "react";
import { fetchReadiness } from "@/lib/api";

export default function StatusPage() {
  const [lastCheck, setLastCheck] = useState("--:--:--");
  const [status, setStatus] = useState("...");
  const [database, setDatabase] = useState("...");
  const [llmProvider, setLlmProvider] = useState("...");

  const formatTime = () => {
    const now = new Date();
    return `${String(now.getHours()).padStart(2, "0")}:${String(
      now.getMinutes()
    ).padStart(2, "0")}:${String(now.getSeconds()).padStart(2, "0")}`;
  };

  const refresh = useCallback(async () => {
    try {
      const r = await fetchReadiness();
      setStatus(r.status === "ok" ? "OK" : "Degraded");
      setDatabase(r.database === "connected" ? "Connected" : "Disconnected");
      setLlmProvider(r.llm_provider.toUpperCase());
    } catch {
      setStatus("Unreachable");
      setDatabase("Unknown");
      setLlmProvider("Unknown");
    }
    setLastCheck(formatTime());
  }, []);

  useEffect(() => {
    refresh();
    const interval = setInterval(refresh, 30000);
    return () => clearInterval(interval);
  }, [refresh]);

  const isHealthy = (val: string) =>
    ["OK", "Connected"].includes(val) || val === val.toUpperCase();

  return (
    <div className="flex-1 overflow-y-auto px-4 sm:px-8 md:px-12 py-6 sm:py-12 flex flex-col gap-8 sm:gap-10">
      {/* Header with Update Button */}
      <div className="flex items-center justify-between">
        <h1 className="text-2xl sm:text-4xl font-bold" style={{ color: "#1a1a2e" }}>
          System status
        </h1>
        <button
          onClick={refresh}
          className="px-6 py-2.5 rounded-lg font-semibold transition-all duration-150"
          style={{
            background: "#1a1a2e",
            color: "#ffffff",
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.background = "#2d2d3d";
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.background = "#1a1a2e";
          }}
        >
          Update
        </button>
      </div>

      {/* Status Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 sm:gap-6 max-w-4xl">
        {/* Overall Status */}
        <div
          className="p-6 rounded-xl border"
          style={{
            border: "1px solid #e5e7eb",
            background: "#ffffff",
            boxShadow: "0 1px 3px rgba(0,0,0,0.05)",
          }}
        >
          <p className="text-sm font-medium mb-4" style={{ color: "#6b7280" }}>
            Overall status
          </p>
          <div className="flex items-center gap-3">
            <div
              className="w-3 h-3 rounded-full"
              style={{
                background: status === "OK" ? "#10b981" : "#ef4444",
              }}
            />
            <p className="text-2xl font-bold" style={{ color: "#1a1a2e" }}>
              {status}
            </p>
          </div>
        </div>

        {/* Database Status */}
        <div
          className="p-6 rounded-xl border"
          style={{
            border: "1px solid #e5e7eb",
            background: "#ffffff",
            boxShadow: "0 1px 3px rgba(0,0,0,0.05)",
          }}
        >
          <p className="text-sm font-medium mb-4" style={{ color: "#6b7280" }}>
            database
          </p>
          <div className="flex items-center gap-3">
            <div
              className="w-3 h-3 rounded-full"
              style={{
                background:
                  database === "Connected" ? "#10b981" : "#ef4444",
              }}
            />
            <p className="text-lg font-bold" style={{ color: "#1a1a2e" }}>
              {database}
            </p>
          </div>
        </div>

        {/* LLM Providers Status */}
        <div
          className="p-6 rounded-xl border"
          style={{
            border: "1px solid #e5e7eb",
            background: "#ffffff",
            boxShadow: "0 1px 3px rgba(0,0,0,0.05)",
          }}
        >
          <p className="text-sm font-medium mb-4" style={{ color: "#6b7280" }}>
            LLM providers
          </p>
          <div className="flex items-center gap-3">
            <div
              className="w-3 h-3 rounded-full"
              style={{
                background:
                  llmProvider !== "Unknown" ? "#10b981" : "#ef4444",
              }}
            />
            <p className="text-lg font-bold" style={{ color: "#1a1a2e" }}>
              {llmProvider}
            </p>
          </div>
        </div>
      </div>

      {/* Status Info */}
      <div className="max-w-4xl">
        <p className="text-sm" style={{ color: "#9ca3af" }}>
          Last check : {lastCheck}
        </p>
        <p className="text-sm" style={{ color: "#9ca3af" }}>
          Automatic update every 30 seconds
        </p>
      </div>
    </div>
  );
}
