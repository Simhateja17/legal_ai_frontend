import { createContext, useContext } from 'react';

export type Mode = 'normal' | 'student' | 'lawyer';

export interface Settings {
  topK: number;
  similarityThreshold: number;
  mode: Mode;
}

export interface SettingsContextValue {
  settings: Settings;
  update: (patch: Partial<Settings>) => void;
}

export const DEFAULTS: Settings = {
  topK: 8,
  similarityThreshold: 0.3,
  mode: 'normal',
};

export const SettingsContext = createContext<SettingsContextValue>({
  settings: DEFAULTS,
  update: () => {},
});

export function useSettings(): SettingsContextValue {
  return useContext(SettingsContext);
}
