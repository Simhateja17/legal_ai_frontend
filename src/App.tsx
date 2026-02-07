import { useState, useCallback, useRef } from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { SettingsContext, DEFAULTS } from './hooks/useSettings';
import type { Settings } from './hooks/useSettings';
import { useHealth } from './hooks/useHealth';
import { getItem, setItem } from './lib/storage';
import Layout from './components/Layout';
import ChatPage from './components/chat/ChatPage';
import SearchPage from './components/search/SearchPage';
import HealthPage from './components/health/HealthPage';
import SettingsPage from './components/settings/SettingsPage';

function AppInner() {
  const { data } = useHealth();
  const healthy = data ? data.status === 'ok' : null;
  const clearChatRef = useRef<(() => void) | null>(null);

  const handleNewChat = useCallback(() => {
    clearChatRef.current?.();
  }, []);

  return (
    <Routes>
      <Route element={<Layout healthy={healthy} onNewChat={handleNewChat} />}>
        <Route index element={<ChatPage clearRef={clearChatRef} />} />
        <Route path="suche" element={<SearchPage />} />
        <Route path="status" element={<HealthPage />} />
        <Route path="einstellungen" element={<SettingsPage />} />
      </Route>
    </Routes>
  );
}

export default function App() {
  const [settings, setSettings] = useState<Settings>(() => ({
    topK: getItem('topK', DEFAULTS.topK),
    similarityThreshold: getItem('similarityThreshold', DEFAULTS.similarityThreshold),
  }));

  const update = useCallback((patch: Partial<Settings>) => {
    setSettings((prev) => {
      const next = { ...prev, ...patch };
      if (patch.topK !== undefined) setItem('topK', next.topK);
      if (patch.similarityThreshold !== undefined) setItem('similarityThreshold', next.similarityThreshold);
      return next;
    });
  }, []);

  return (
    <SettingsContext.Provider value={{ settings, update }}>
      <BrowserRouter>
        <AppInner />
      </BrowserRouter>
    </SettingsContext.Provider>
  );
}
