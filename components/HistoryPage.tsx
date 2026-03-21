"use client";

export default function HistoryPage() {
  const historySessions = [
    {
      id: 1,
      title: "Commercial lease review",
      date: "Today, 3:45 PM",
      messages: 12,
    },
    {
      id: 2,
      title: "Employment contract analysis",
      date: "Yesterday, 2:15 PM",
      messages: 8,
    },
    {
      id: 3,
      title: "Intellectual property questions",
      date: "Dec 10, 2024",
      messages: 15,
    },
    {
      id: 4,
      title: "Tax compliance inquiry",
      date: "Dec 8, 2024",
      messages: 5,
    },
    {
      id: 5,
      title: "Contract termination discussion",
      date: "Dec 5, 2024",
      messages: 9,
    },
  ];

  return (
    <div className="flex-1 overflow-y-auto px-4 sm:px-8 md:px-12 py-6 sm:py-12 flex flex-col gap-6 sm:gap-8">
      {/* Header */}
      <h1 className="text-2xl sm:text-4xl font-bold" style={{ color: "#1a1a2e" }}>
        History
      </h1>

      {/* History list */}
      <div className="max-w-3xl flex flex-col gap-3">
        {historySessions.map((session) => (
          <button
            key={session.id}
            className="p-4 rounded-xl text-left transition-all duration-150 border"
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
                  {session.date}
                </p>
                <p className="text-xs mt-2" style={{ color: "#9ca3af" }}>
                  {session.messages} messages
                </p>
              </div>
            </div>
          </button>
        ))}
      </div>
    </div>
  );
}
