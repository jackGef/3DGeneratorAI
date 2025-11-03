import React, { useState, useEffect } from "react";
import { Chat } from "@/entities/Chat";
import { Search, Plus, PanelLeftClose, PanelLeftOpen } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import ChatList from "./ChatList";
import ProfileSection from "./ProfileSection";

export default function Sidebar({ isCollapsed, setIsCollapsed, user, currentTheme, changeTheme }) {
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
    <div className={`theme-bg-secondary theme-border border-r transition-all duration-300 flex flex-col ${
      isCollapsed ? 'w-16' : 'w-80'
    } h-screen relative`}>
      
      {/* Header Section */}
      <div className="p-4 space-y-3 border-b theme-border">
        <div className="flex items-center justify-between">
          {!isCollapsed && (
            <h1 className="text-xl font-bold theme-text-primary">ChatApp</h1>
          )}
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setIsCollapsed(!isCollapsed)}
            className="theme-hover theme-text-secondary hover:theme-text-primary transition-colors"
          >
            {isCollapsed ? (
              <PanelLeftOpen className="w-5 h-5" />
            ) : (
              <PanelLeftClose className="w-5 h-5" />
            )}
          </Button>
        </div>

        {!isCollapsed && (
          <>
            <Button
              onClick={createNewChat}
              className="w-full theme-accent-bg hover:bg-opacity-90 text-white transition-all duration-200 rounded-lg py-2.5 font-medium"
            >
              <Plus className="w-4 h-4 mr-2" />
              New Chat
            </Button>

            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 theme-text-muted" />
              <Input
                placeholder="Search chats..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10 theme-bg-tertiary theme-border theme-text-primary placeholder-theme-text-muted focus:ring-2 focus:ring-accent-primary border-0"
              />
            </div>
          </>
        )}
      </div>

      {/* Chat List Section */}
      <div className="flex-1 overflow-hidden">
        <ChatList 
          chats={filteredChats}
          isCollapsed={isCollapsed}
          onChatSelect={(chat) => console.log('Selected chat:', chat)}
        />
      </div>

      {/* Profile Section */}
      <div className="border-t theme-border">
        <ProfileSection 
          user={user}
          isCollapsed={isCollapsed}
          currentTheme={currentTheme}
          changeTheme={changeTheme}
        />
      </div>
    </div>
  );
}