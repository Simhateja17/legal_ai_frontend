"use client";

import { createContext, useContext, useState, ReactNode } from "react";

interface AppSettings {
  topK: number;
  similarity: number;
  responseMode: "normal" | "student" | "lawyer";
}

interface AppSettingsContextType {
  settings: AppSettings;
  setTopK: (v: number) => void;
  setSimilarity: (v: number) => void;
  setResponseMode: (v: "normal" | "student" | "lawyer") => void;
}

const AppSettingsContext = createContext<AppSettingsContextType | null>(null);

export function AppSettingsProvider({ children }: { children: ReactNode }) {
  const [settings, setSettings] = useState<AppSettings>({
    topK: 8,
    similarity: 0.3,
    responseMode: "lawyer",
  });

  const setTopK = (v: number) =>
    setSettings((prev) => ({ ...prev, topK: v }));

  const setSimilarity = (v: number) =>
    setSettings((prev) => ({ ...prev, similarity: v }));

  const setResponseMode = (v: "normal" | "student" | "lawyer") =>
    setSettings((prev) => ({ ...prev, responseMode: v }));

  return (
    <AppSettingsContext.Provider
      value={{ settings, setTopK, setSimilarity, setResponseMode }}
    >
      {children}
    </AppSettingsContext.Provider>
  );
}

export function useAppSettings() {
  const ctx = useContext(AppSettingsContext);
  if (!ctx) throw new Error("useAppSettings must be inside AppSettingsProvider");
  return ctx;
}
