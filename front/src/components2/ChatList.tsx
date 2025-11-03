import React from "react";
import { format, isToday, isYesterday } from "date-fns";
import { MessageCircle } from "lucide-react";

export default function ChatList({ chats, isCollapsed, onChatSelect }) {
  const formatChatDate = (dateString) => {
    const date = new Date(dateString);
    if (isToday(date)) return "Today";
    if (isYesterday(date)) return "Yesterday";
    return format(date, "MMM d");
  };

  if (isCollapsed) {
    return (
      <div className="chat-list">
        {chats.slice(0, 8).map((chat) => (
          <button
            key={chat.id}
            onClick={() => onChatSelect(chat)}
            className="chat-item"
            title={chat.title}
          >
            <MessageCircle style={{ margin: '0 auto' }} />
          </button>
        ))}
      </div>
    );
  }

  return (
    <div className="chat-list">
      {chats.length === 0 ? (
        <div style={{ textAlign: 'center', padding: '48px 0' }}>
          <MessageCircle style={{ width: 48, height: 48, margin: '0 auto', color: '#8b94a7' }} />
          <p style={{ color: '#8b94a7', fontSize: 14 }}>No chats yet</p>
          <p style={{ color: '#8b94a7', fontSize: 12, marginTop: 4 }}>Start a new conversation</p>
        </div>
      ) : (
        chats.map((chat) => (
          <button
            key={chat.id}
            onClick={() => onChatSelect(chat)}
            className="chat-item"
          >
            <span className="chat-item__title">{chat.title}</span>
            <span className="chat-item__meta">{formatChatDate(chat.last_activity)}</span>
          </button>
        ))
      )}
    </div>
  );
}