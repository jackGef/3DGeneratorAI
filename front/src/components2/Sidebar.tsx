import React, { useState, useEffect } from "react";
import Chat from "../entities/Chat";
import { Search, Plus, PanelLeftClose, PanelLeftOpen } from "lucide-react";
import { Button } from "../components/ui/button";
import { Input } from "../components/ui/input";
import ChatList from "./ChatList";
import ProfileSection from "./ProfileSection";
import "../../pages-css/sidebar.css";

export default function Sidebar({ user, currentTheme, changeTheme }) {
  const [chats, setChats] = useState([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [filteredChats, setFilteredChats] = useState([]);

  useEffect(() => {
    loadChats();
  }, []);

  useEffect(() => {
    if (searchQuery.trim()) {
      setFilteredChats(chats.filter(chat => 
        chat.title.toLowerCase().includes(searchQuery.toLowerCase())
      ));
    } else {
      setFilteredChats(chats);
    }
  }, [searchQuery, chats]);

  const loadChats = async () => {
    try {
      const chatList = await Chat.list("-last_activity");
      setChats(chatList);
    } catch (error) {
      console.error("Error loading chats:", error);
    }
  };

  const createNewChat = async () => {
    try {
      const newChat = await Chat.create({
        title: "New Chat",
        preview: "Start a new conversation...",
        message_count: 0,
        last_activity: new Date().toISOString()
      });
      await loadChats();
    } catch (error) {
      console.error("Error creating chat:", error);
    }
  };

  return (
    <div className="sidebar">
      <div className="sidebar__section">
        <h1 style={{ fontSize: '1.5rem', fontWeight: 700 }}>ChatApp</h1>
        <button className="sidebar__new" onClick={createNewChat}>
          <Plus style={{ marginRight: 8 }} />
          <span>New Chat</span>
        </button>
        <div style={{ margin: '12px 0' }}>
          <Search style={{ position: 'absolute', margin: '8px 0 0 10px', width: 18, height: 18, color: '#8b94a7' }} />
          <input
            type="text"
            placeholder="Search chats..."
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
            style={{ width: '100%', padding: '8px 8px 8px 34px', borderRadius: 8, border: '1px solid var(--border-1)', background: 'rgba(255,255,255,0.04)', color: 'inherit' }}
          />
        </div>
      </div>
      <div className="chat-list">
        <ChatList
          chats={filteredChats}
          isCollapsed={false}
          onChatSelect={chat => console.log('Selected chat:', chat)}
        />
      </div>
      <div className="profile">
        <ProfileSection
          user={user}
          isCollapsed={false}
          currentTheme={currentTheme}
          changeTheme={changeTheme}
        />
      </div>
    </div>
  );
}