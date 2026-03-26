"use client";

import { useState, useEffect } from "react";
import { Trash2 } from "lucide-react";
import { loadHistory, deleteSession, formatDate, ChatSession } from "@/lib/chatHistory";

interface HistoryPageProps {
  onLoadSession: (session: ChatSession) => void;
}

export default function HistoryPage({ onLoadSession }: HistoryPageProps) {
  const [sessions, setSessions] = useState<ChatSession[]>([]);

  useEffect(() => {
    setSessions(loadHistory());
  }, []);

  const handleDelete = (e: React.MouseEvent, id: string) => {
    e.stopPropagation();
    deleteSession(id);
    setSessions((prev) => prev.filter((s) => s.id !== id));
  };

  return (
    <div className="flex-1 overflow-y-auto px-4 sm:px-8 md:px-12 py-6 sm:py-12 flex flex-col gap-6 sm:gap-8">
      {/* Header */}
      <h1 className="text-2xl sm:text-4xl font-bold" style={{ color: "#1a1a2e" }}>
        History
      </h1>

      {/* History list */}
      <div className="max-w-3xl flex flex-col gap-3">
        {sessions.length === 0 ? (
          <p className="text-sm" style={{ color: "#9ca3af" }}>
            No chat history yet. Start a conversation to see it here.
          </p>
        ) : (
          sessions.map((session) => (
            <button
              key={session.id}
              onClick={() => onLoadSession(session)}
              className="p-4 rounded-xl text-left transition-all duration-150 border group"
              style={{
                border: "1px solid #e5e7eb",
                background: "#ffffff",
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.background = "#f9fafb";
                e.currentTarget.style.borderColor = "#d1d5db";
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.background = "#ffffff";
                e.currentTarget.style.borderColor = "#e5e7eb";
              }}
            >
              <div className="flex items-start justify-between">
                <div className="flex-1 min-w-0">
                  <p
                    className="font-semibold text-lg truncate"
                    style={{ color: "#1a1a2e" }}
                  >
                    {session.title}
                  </p>
                  <p className="text-sm mt-1" style={{ color: "#6b7280" }}>
                    {formatDate(session.timestamp)}
                  </p>
                  <p className="text-xs mt-2" style={{ color: "#9ca3af" }}>
                    {session.messages.length} messages
                  </p>
                </div>
                <div
                  className="opacity-0 group-hover:opacity-100 transition-opacity p-1.5 rounded-lg hover:bg-red-50"
                  onClick={(e) => handleDelete(e, session.id)}
                >
                  <Trash2 size={16} style={{ color: "#ef4444" }} />
                </div>
              </div>
            </button>
          ))
        )}
      </div>
    </div>
  );
}
