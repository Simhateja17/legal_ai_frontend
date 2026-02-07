import { createContext, useContext } from 'react';

export interface Settings {
  topK: number;
  similarityThreshold: number;
}

export interface SettingsContextValue {
  settings: Settings;
  update: (patch: Partial<Settings>) => void;
}

export const DEFAULTS: Settings = {
  topK: 8,
  similarityThreshold: 0.3,
};

export const SettingsContext = createContext<SettingsContextValue>({
  settings: DEFAULTS,
  update: () => {},
});

export function useSettings(): SettingsContextValue {
  return useContext(SettingsContext);
}
