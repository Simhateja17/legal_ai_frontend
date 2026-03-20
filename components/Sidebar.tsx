"use client";

import Image from "next/image";
import { useState } from "react";
import {
  Plus,
  MessageSquare,
  Search,
  BarChart3,
  Settings,
  History,
  ChevronRight,
} from "lucide-react";

const navItems = [
  { icon: MessageSquare, label: "Chat" },
  { icon: Search, label: "Search" },
  { icon: BarChart3, label: "Status" },
  { icon: History, label: "History" },
  { icon: Settings, label: "Settings" },
];

interface SidebarProps {
  activePage: string;
  onNavigate: (page: string) => void;
  onNewChat?: () => void;
}

export default function Sidebar({ activePage, onNavigate, onNewChat }: SidebarProps) {

  return (
    <aside
      className="flex flex-col h-full"
      style={{
        width: "260px",
        minWidth: "260px",
        background: "#FDFFF6",
        borderRight: "2px solid rgba(211,242,182,0.5)",
      }}
    >
      {/* Logo */}
      <div
        className="flex items-center gap-3 px-5 py-5"
        style={{ borderBottom: "2px solid rgba(211,242,182,0.4)" }}
      >
        <Image
          src="/logo.png"
          alt="Legal AI Logo"
          width={44}
          height={44}
          className="object-contain"
          priority
        />
        <span
          style={{
            fontFamily: "'Frank Ruhl Libre', serif",
            fontWeight: 700,
            fontSize: "22px",
            color: "#1a1a2e",
            letterSpacing: "-0.3px",
          }}
        >
          legal ai
        </span>
      </div>

      {/* New Chat Button */}
      <div className="px-3 py-4">
        <button
          onClick={() => {
            if (onNewChat) onNewChat();
            onNavigate("Chat");
          }}
          className="w-full flex items-center justify-center gap-2 px-4 py-3 rounded-xl font-medium transition-all duration-150"
          style={{
            background: "rgba(30, 30, 46, 0.9)",
            color: "#ffffff",
            border: "2px solid rgba(255,255,255,0.2)",
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.background = "rgba(30, 30, 46, 1)";
            e.currentTarget.style.borderColor = "rgba(255,255,255,0.3)";
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.background = "rgba(30, 30, 46, 0.9)";
            e.currentTarget.style.borderColor = "rgba(255,255,255,0.2)";
          }}
        >
          <Plus size={20} />
          <span>New chat</span>
        </button>
      </div>

      {/* Nav Items */}
      <nav className="flex-1 px-3 py-4 flex flex-col gap-1 overflow-y-auto">
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = activePage === item.label;
          return (
            <button
              key={item.label}
              onClick={() => onNavigate(item.label)}
              className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-all duration-150"
              style={{
                background: isActive ? "#000000" : "transparent",
                color: isActive ? "#ffffff" : "#000000",
              }}
              onMouseEnter={(e) => {
                if (!isActive) {
                  e.currentTarget.style.background = "rgba(0, 0, 0, 0.15)";
                }
              }}
              onMouseLeave={(e) => {
                if (!isActive) {
                  e.currentTarget.style.background = "transparent";
                }
              }}
            >
              <Icon size={18} />
              <span className="flex-1 text-left">{item.label}</span>
            </button>
          );
        })}
       </nav>

       {/* User Profile */}
       {/* Removed */}
    </aside>
  );
}
