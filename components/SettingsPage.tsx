"use client";

import { useEffect, useState } from "react";
import styles from "./SettingsPage.module.css";
import { useAppSettings } from "@/lib/settingsContext";
import { fetchReadiness } from "@/lib/api";

export default function SettingsPage() {
  const { settings, setTopK, setSimilarity, setResponseMode } =
    useAppSettings();
  const [llmProvider, setLlmProvider] = useState("...");

  useEffect(() => {
    fetchReadiness()
      .then((r) => setLlmProvider(r.llm_provider.toUpperCase()))
      .catch(() => setLlmProvider("Unknown"));
  }, []);

  const modes: {
    key: "normal" | "student" | "lawyer";
    label: string;
    desc: string;
  }[] = [
    {
      key: "normal",
      label: "Normal",
      desc: "Balanced answers for general users.",
    },
    {
      key: "student",
      label: "Student",
      desc: "Didactic explanations, complete overview of laws, exam structure.",
    },
    {
      key: "lawyer",
      label: "Attorney",
      desc: "Technical terminology and procedural depth require a fully qualified lawyer's level.",
    },
  ];

  return (
    <div className="flex-1 overflow-y-auto px-4 sm:px-8 md:px-12 py-6 sm:py-12 flex flex-col gap-8 sm:gap-10">
      {/* Header */}
      <h1 className="text-2xl sm:text-4xl font-bold" style={{ color: "#1a1a2e" }}>
        Settings
      </h1>

      {/* Number of results */}
      <div className="max-w-2xl">
        <div className="mb-6">
          <p className="text-lg font-semibold" style={{ color: "#1a1a2e" }}>
            Number of results (top_k) : {settings.topK}
          </p>
          <p className="text-sm mt-1" style={{ color: "#6b7280" }}>
            Maximum number of returned documents.
          </p>
        </div>
        <div className="flex items-center gap-4">
          <span className="text-sm" style={{ color: "#6b7280" }}>
            1
          </span>
          <input
            type="range"
            min="1"
            max="50"
            value={settings.topK}
            onChange={(e) => setTopK(parseInt(e.target.value))}
            className={styles.slider}
            style={
              {
                "--value": `${((settings.topK - 1) / 49) * 100}%`,
              } as React.CSSProperties
            }
          />
          <span className="text-sm" style={{ color: "#6b7280" }}>
            50
          </span>
        </div>
      </div>

      {/* Similarity threshold */}
      <div className="max-w-2xl">
        <div className="mb-6">
          <p className="text-lg font-semibold" style={{ color: "#1a1a2e" }}>
            Similarity threshold : {settings.similarity.toFixed(2)}
          </p>
          <p className="text-sm mt-1" style={{ color: "#6b7280" }}>
            Minimum similarity value for the results (0 = all, 1 = exactly).
          </p>
        </div>
        <div className="flex items-center gap-4">
          <span className="text-sm" style={{ color: "#6b7280" }}>
            0.00
          </span>
          <input
            type="range"
            min="0"
            max="1"
            step="0.01"
            value={settings.similarity}
            onChange={(e) => setSimilarity(parseFloat(e.target.value))}
            className={styles.slider}
            style={
              {
                "--value": `${settings.similarity * 100}%`,
              } as React.CSSProperties
            }
          />
          <span className="text-sm" style={{ color: "#6b7280" }}>
            1.00
          </span>
        </div>
      </div>

      {/* Response mode */}
      <div className="max-w-3xl">
        <div className="mb-6">
          <p className="text-lg font-semibold" style={{ color: "#1a1a2e" }}>
            Response mode
          </p>
          <p className="text-sm mt-1" style={{ color: "#6b7280" }}>
            Adapt the style of your answers to your target audience.
          </p>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          {modes.map((m) => (
            <button
              key={m.key}
              onClick={() => setResponseMode(m.key)}
              className="p-4 rounded-xl text-left transition-all duration-150"
              style={{
                border:
                  settings.responseMode === m.key
                    ? "2px solid #95DE64"
                    : "2px solid #e5e7eb",
                background:
                  settings.responseMode === m.key ? "#f0fff4" : "#ffffff",
              }}
            >
              <p className="font-semibold" style={{ color: "#1a1a2e" }}>
                {m.label}
              </p>
              <p className="text-sm mt-1" style={{ color: "#6b7280" }}>
                {m.desc}
              </p>
            </button>
          ))}
        </div>
      </div>

      {/* LLM providers */}
      <div className="max-w-2xl">
        <p className="text-lg font-semibold mb-3" style={{ color: "#1a1a2e" }}>
          LLM providers
        </p>
        <p className="text-sm mb-6" style={{ color: "#6b7280" }}>
          This is determined by the backend and cannot be changed here.
        </p>
        <div
          className="inline-block px-4 py-2 rounded-lg font-semibold"
          style={{
            background: "#f0fff4",
            color: "#4caf50",
          }}
        >
          {llmProvider}
        </div>
      </div>
    </div>
  );
}
