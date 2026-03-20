"use client";

import Image from "next/image";
import { useEffect, useRef } from "react";
import { Pencil } from "lucide-react";

export interface Message {
  id: string;
  role: "user" | "assistant";
  content: string;
}

interface ChatAreaProps {
  messages: Message[];
}

export default function ChatArea({ messages }: ChatAreaProps) {
  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  return (
    <div className="flex-1 overflow-y-auto px-8 py-8 flex flex-col gap-6">
      {messages.map((msg) =>
        msg.role === "user" ? (
          /* ── User bubble ─────────────────────────────────────────── */
          <div key={msg.id} className="flex justify-end items-start gap-3">
            <div
              className="flex items-center gap-3 px-6 py-4 max-w-[68%]"
              style={{
                background: "#95DE64",
                borderRadius: "30px",
                border: "1px solid #D3F2B6",
                boxShadow: "0 2px 8px rgba(149,222,100,0.25)",
              }}
            >
              <p
                className="text-sm font-medium leading-relaxed"
                style={{ color: "#1a2e0a" }}
              >
                {msg.content}
              </p>
              <Pencil size={15} className="flex-shrink-0 text-green-800/60" />
            </div>
            {/* Avatar */}
            <div className="w-9 h-9 rounded-full overflow-hidden flex-shrink-0">
              <Image
                src="/logo.png"
                alt="User"
                width={36}
                height={36}
                className="object-cover w-full h-full"
              />
            </div>
          </div>
        ) : (
          /* ── AI bubble ───────────────────────────────────────────── */
          <div key={msg.id} className="flex justify-start items-start gap-3">
            {/* AI avatar */}
            <div className="w-9 h-9 rounded-full overflow-hidden flex-shrink-0 mt-1">
              <Image
                src="/logo.png"
                alt="Legal AI"
                width={36}
                height={36}
                className="object-cover w-full h-full"
              />
            </div>
            <div
              className="px-6 py-5 max-w-[68%]"
              style={{
                background: "#333332",
                borderRadius: "30px",
                border: "1px solid rgba(211,242,182,0.10)",
                boxShadow: "0 4px 24px rgba(0,0,0,0.18)",
              }}
            >
              <p
                className="text-sm leading-relaxed"
                style={{ color: "#d4d4c8" }}
              >
                {msg.content}
              </p>
            </div>
          </div>
        )
      )}
      <div ref={bottomRef} />
    </div>
  );
}
