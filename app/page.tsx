"use client";

import { useState, useRef, useCallback } from "react";
import Image from "next/image";
import Sidebar from "@/components/Sidebar";
import ChatArea, { Message } from "@/components/ChatArea";
import MessageInput from "@/components/MessageInput";
import SettingsPage from "@/components/SettingsPage";
import StatusPage from "@/components/StatusPage";
import HistoryPage from "@/components/HistoryPage";
import SearchPage from "@/components/SearchPage";
import { AppSettingsProvider, useAppSettings } from "@/lib/settingsContext";
import { sendChatStream } from "@/lib/api";
import { saveSession, ChatSession } from "@/lib/chatHistory";

function HomeInner() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [loading, setLoading] = useState(false);
  const [currentPage, setCurrentPage] = useState("Chat");
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const { settings } = useAppSettings();
  const assistantMsgIdRef = useRef<string | null>(null);
  const sessionIdRef = useRef<string>(Date.now().toString());

  const persistChat = useCallback((msgs: Message[]) => {
    // Only save if there are actual messages
    const nonEmpty = msgs.filter((m) => m.content.trim() && !m.content.startsWith("Error:"));
    if (nonEmpty.length === 0) return;

    // Use the first user message as title
    const firstUserMsg = nonEmpty.find((m) => m.role === "user");
    const title = firstUserMsg
      ? firstUserMsg.content.slice(0, 80) + (firstUserMsg.content.length > 80 ? "..." : "")
      : "Chat";

    const session: ChatSession = {
      id: sessionIdRef.current,
      title,
      timestamp: Date.now(),
      messages: nonEmpty,
    };
    saveSession(session);
  }, []);

  const handleSend = async (text: string) => {
    const userMsg: Message = {
      id: Date.now().toString(),
      role: "user",
      content: text,
    };
    setMessages((prev) => [...prev, userMsg]);
    setLoading(true);

    // Build conversation history from existing messages
    const history = messages.map((m) => ({
      role: m.role,
      content: m.content,
    }));

    // Create placeholder assistant message for streaming
    const aiMsgId = (Date.now() + 1).toString();
    assistantMsgIdRef.current = aiMsgId;
    const aiMsg: Message = {
      id: aiMsgId,
      role: "assistant",
      content: "",
    };
    setMessages((prev) => [...prev, aiMsg]);

    // Map frontend mode labels to backend values
    const modeMap: Record<string, "normal" | "student" | "lawyer"> = {
      normal: "normal",
      student: "student",
      lawyer: "lawyer",
    };

    let finalMessages: Message[] = [];

    await sendChatStream(
      {
        query: text,
        conversation_history: history,
        top_k: settings.topK,
        similarity_threshold: settings.similarity,
        mode: modeMap[settings.responseMode] || "normal",
      },
      // onToken: append token to the streaming assistant message
      (token: string) => {
        setMessages((prev) => {
          const updated = prev.map((m) =>
            m.id === aiMsgId ? { ...m, content: m.content + token } : m
          );
          finalMessages = updated;
          return updated;
        });
      },
      // onSources
      () => {},
      // onDone — save to history
      () => {
        setLoading(false);
        assistantMsgIdRef.current = null;
        persistChat(finalMessages);
      },
      // onError
      (error: string) => {
        setMessages((prev) =>
          prev.map((m) =>
            m.id === aiMsgId
              ? { ...m, content: `Error: ${error}` }
              : m
          )
        );
        setLoading(false);
        assistantMsgIdRef.current = null;
      }
    );
  };

  const handleNewChat = () => {
    setMessages([]);
    setLoading(false);
    assistantMsgIdRef.current = null;
    sessionIdRef.current = Date.now().toString();
  };

  const handleNavigate = (page: string) => {
    setCurrentPage(page);
    setSidebarOpen(false);
  };

  const handleLoadSession = (session: ChatSession) => {
    setMessages(session.messages);
    sessionIdRef.current = session.id;
    setCurrentPage("Chat");
  };

  return (
    <div
      className="flex h-screen overflow-hidden relative"
      style={{ background: "#ffffff" }}
    >
      {/* Mobile overlay */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 bg-black/30 z-30 md:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Sidebar — hidden on mobile unless open */}
      <div className={`
        fixed inset-y-0 left-0 z-40 transform transition-transform duration-200 ease-in-out
        md:relative md:translate-x-0
        ${sidebarOpen ? "translate-x-0" : "-translate-x-full"}
      `}>
        <Sidebar activePage={currentPage} onNavigate={handleNavigate} onNewChat={handleNewChat} />
      </div>

      {/* Main content */}
      <main className="flex flex-col flex-1 overflow-hidden min-w-0">
        {/* Mobile header bar */}
        <div className="flex items-center gap-3 px-4 py-3 md:hidden border-b border-gray-100">
          <button
            onClick={() => setSidebarOpen(true)}
            className="p-2 rounded-lg hover:bg-gray-100"
          >
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M3 12h18M3 6h18M3 18h18" />
            </svg>
          </button>
          <div className="flex items-center gap-2">
            <Image
              src="/logo.png"
              alt="Legal AI Logo"
              width={28}
              height={28}
              className="object-contain"
            />
            <span
              style={{
                fontFamily: "'Frank Ruhl Libre', serif",
                fontWeight: 700,
                fontSize: "16px",
                color: "#1a1a2e",
                letterSpacing: "-0.3px",
                lineHeight: "28px",
              }}
            >
              legal ai
            </span>
          </div>
          <span className="ml-auto text-xs font-medium px-2 py-1 rounded-md" style={{ color: "#7a8a9a", background: "#f3f4f6" }}>
            {currentPage}
          </span>
        </div>

        {currentPage === "Chat" && (
          <>
            <ChatArea messages={messages} />

            {loading && (
              <div className="px-4 sm:px-8 pb-2 flex items-center gap-3">
                <div className="flex gap-1.5">
                  {[0, 1, 2].map((i) => (
                    <span
                      key={i}
                      className="w-2 h-2 rounded-full animate-bounce"
                      style={{
                        background: "#95DE64",
                        animationDelay: `${i * 0.15}s`,
                      }}
                    />
                  ))}
                </div>
                <span className="text-xs text-gray-400">
                  Legal AI is thinking...
                </span>
              </div>
            )}

            <MessageInput onSend={handleSend} loading={loading} />
          </>
        )}

        {currentPage === "Settings" && <SettingsPage />}
        {currentPage === "Status" && <StatusPage />}
        {currentPage === "History" && <HistoryPage onLoadSession={handleLoadSession} />}
        {currentPage === "Search" && <SearchPage />}
      </main>
    </div>
  );
}

export default function Home() {
  return (
    <AppSettingsProvider>
      <HomeInner />
    </AppSettingsProvider>
  );
}
