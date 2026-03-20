"use client";

import { useState, useRef } from "react";
import Sidebar from "@/components/Sidebar";
import ChatArea, { Message } from "@/components/ChatArea";
import MessageInput from "@/components/MessageInput";
import SettingsPage from "@/components/SettingsPage";
import StatusPage from "@/components/StatusPage";
import HistoryPage from "@/components/HistoryPage";
import SearchPage from "@/components/SearchPage";
import { AppSettingsProvider, useAppSettings } from "@/lib/settingsContext";
import { sendChatStream } from "@/lib/api";

function HomeInner() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [loading, setLoading] = useState(false);
  const [currentPage, setCurrentPage] = useState("Chat");
  const { settings } = useAppSettings();
  const assistantMsgIdRef = useRef<string | null>(null);

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
        setMessages((prev) =>
          prev.map((m) =>
            m.id === aiMsgId ? { ...m, content: m.content + token } : m
          )
        );
      },
      // onSources: could store sources if needed
      () => {},
      // onDone
      () => {
        setLoading(false);
        assistantMsgIdRef.current = null;
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
  };

  const handleNavigate = (page: string) => {
    setCurrentPage(page);
  };

  return (
    <div
      className="flex h-screen overflow-hidden"
      style={{ background: "#ffffff" }}
    >
      {/* Sidebar */}
      <Sidebar activePage={currentPage} onNavigate={handleNavigate} onNewChat={handleNewChat} />

      {/* Main content */}
      <main className="flex flex-col flex-1 overflow-hidden">
        {currentPage === "Chat" && (
          <>
            {/* Chat messages */}
            <ChatArea messages={messages} />

            {/* Typing indicator */}
            {loading && (
              <div className="px-8 pb-2 flex items-center gap-3">
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

            {/* Input */}
            <MessageInput onSend={handleSend} loading={loading} />
          </>
        )}

        {currentPage === "Settings" && <SettingsPage />}
        {currentPage === "Status" && <StatusPage />}
        {currentPage === "History" && <HistoryPage />}
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
