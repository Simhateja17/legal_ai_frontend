"use client";

import { useState, useRef, KeyboardEvent } from "react";
import { Mic, Send } from "lucide-react";

interface MessageInputProps {
  onSend: (text: string) => void;
  loading?: boolean;
}

export default function MessageInput({ onSend, loading }: MessageInputProps) {
  const [value, setValue] = useState("");
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const handleSend = () => {
    const trimmed = value.trim();
    if (!trimmed || loading) return;
    onSend(trimmed);
    setValue("");
    if (textareaRef.current) {
      textareaRef.current.style.height = "auto";
    }
  };

  const handleKeyDown = (e: KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const handleInput = () => {
    const el = textareaRef.current;
    if (!el) return;
    el.style.height = "auto";
    el.style.height = Math.min(el.scrollHeight, 120) + "px";
  };

   return (
     <div className="px-8 pb-8 pt-2 flex justify-center">
       <div
         className="flex items-center gap-3 px-5"
         style={{
           width: "762px",
           height: "64px",
           background: "rgba(253,255,246,0.5)",
           borderRadius: "30px",
           border: "3px solid #000000",
           boxShadow: "0 2px 12px rgba(0,0,0,0.08)",
         }}
       >
         <textarea
           ref={textareaRef}
           rows={1}
           value={value}
           onChange={(e) => setValue(e.target.value)}
           onKeyDown={handleKeyDown}
           onInput={handleInput}
           placeholder="Write your message ..."
           disabled={loading}
           className="flex-1 resize-none bg-transparent text-sm outline-none placeholder-gray-400 text-gray-800 leading-relaxed disabled:opacity-50"
           style={{ maxHeight: "48px", minHeight: "48px" }}
         />

        {/* Mic */}
        <button
          className="flex-shrink-0 p-1.5 rounded-full transition-colors"
          style={{ color: "#555" }}
          onMouseEnter={(e) =>
            (e.currentTarget.style.background = "rgba(149,222,100,0.15)")
          }
          onMouseLeave={(e) =>
            (e.currentTarget.style.background = "transparent")
          }
          title="Voice input"
        >
          <Mic size={19} />
        </button>

        {/* Send */}
        <button
          onClick={handleSend}
          disabled={!value.trim() || loading}
          className="flex-shrink-0 p-1.5 rounded-full transition-all duration-150 disabled:opacity-40"
          style={{ color: "#333" }}
          onMouseEnter={(e) => {
            if (value.trim())
              e.currentTarget.style.background = "rgba(149,222,100,0.2)";
          }}
          onMouseLeave={(e) =>
            (e.currentTarget.style.background = "transparent")
          }
          title="Send message"
        >
          <Send size={19} />
        </button>
       </div>
     </div>
  );
}
