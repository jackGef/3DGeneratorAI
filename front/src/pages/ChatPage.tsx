import React, { useState, useEffect, useRef } from 'react'
import { useAuth } from '../contexts/AuthContext'
import { useNavigate, Link } from 'react-router-dom'
import { chatsAPI } from '../services/api'

import "../styles2/chatPage.css"

// icons
import { FaPaperPlane, FaPlus, FaUser, FaEdit, FaBars, FaTrash, FaCopy, FaThumbtack, FaSearch, FaArrowDown } from 'react-icons/fa'

interface Message {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: Date;
}

interface Chat {
  id: string;
  title: string;
  messages: Message[];
  isPinned: boolean;
  createdAt: Date;
  updatedAt: Date;
  preview?: string;
  messageCount?: number;
}

const chatPage = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [chats, setChats] = useState<Chat[]>([]);
  const [currentChatId, setCurrentChatId] = useState<string | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputText, setInputText] = useState('');
  const [showProfileMenu, setShowProfileMenu] = useState<Boolean>(false)
  const [editingChatId, setEditingChatId] = useState<string | null>(null);
  const [editTitle, setEditTitle] = useState('');
  const [isNavOpen, setIsNavOpen] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [pinnedChats, setPinnedChats] = useState<Set<string>>(new Set());
  const [isLoading, setIsLoading] = useState(false);
  const [showScrollButton, setShowScrollButton] = useState(false);
  const profileRef = useRef<HTMLDivElement>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const messagesContainerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    loadChats();
  }, []);

  const loadChats = async () => {
    try {
      const userChats = await chatsAPI.list();
      setChats(userChats);
      
      // Set pinned chats
      const pinned = new Set(userChats.filter((chat: Chat) => chat.isPinned).map((chat: Chat) => chat.id));
      setPinnedChats(pinned);
    } catch (error) {
      console.error('Failed to load chats:', error);
    }
  };

  const loadChat = async (chatId: string) => {
    try {
      const chat = await chatsAPI.get(chatId);
      setCurrentChatId(chatId);
      setMessages(chat.messages || []);
    } catch (error) {
      console.error('Failed to load chat:', error);
    }
  };

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (profileRef.current && event.target && profileRef.current.contains(event.target as Node)) {
        return;
      }
      setShowProfileMenu(false);
    };

    if (showProfileMenu) {
      document.addEventListener('mousedown', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [showProfileMenu]);

  // Keyboard shortcuts
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.ctrlKey && e.key === 'b') {
        e.preventDefault();
        setIsNavOpen(!isNavOpen);
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [isNavOpen]);

  // Scroll detection
  useEffect(() => {
    const container = messagesContainerRef.current;
    if (!container) return;

    const handleScroll = () => {
      const isNearBottom = container.scrollHeight - container.scrollTop - container.clientHeight < 100;
      setShowScrollButton(!isNearBottom && messages.length > 0);
    };

    container.addEventListener('scroll', handleScroll);
    return () => container.removeEventListener('scroll', handleScroll);
  }, [messages]);

  // Auto scroll to bottom on new message
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const sendMessage = async () => {
    if (inputText.trim() === '') return;

    setIsLoading(true);
    const messageContent = inputText;
    setInputText('');

    try {
      // Create a new chat if this is the first message
      let chatId = currentChatId;
      if (!chatId) {
        const newChat = await chatsAPI.create(messageContent.substring(0, 30) + '...');
        chatId = newChat.id;
        setCurrentChatId(chatId);
        await loadChats(); // Refresh chat list
      }

      // Send the user message
      await chatsAPI.addMessage(chatId, 'user', messageContent);
      
      // Reload the chat to get updated messages (including bot response)
      setTimeout(async () => {
        await loadChat(chatId);
        setIsLoading(false);
      }, 1500); // Wait for bot response
    } catch (error) {
      console.error('Failed to send message:', error);
      setIsLoading(false);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  const createNewChat = async () => {
    try {
      const newChat = await chatsAPI.create('New Chat');
      setCurrentChatId(newChat.id);
      setMessages([]);
      await loadChats(); // Refresh chat list
    } catch (error) {
      console.error('Failed to create chat:', error);
    }
  };

  const handleEditMenu = async (chatId: string) => {
    if (editTitle.trim()) {
      try {
        await chatsAPI.update(chatId, { title: editTitle });
        await loadChats(); // Refresh chat list
      } catch (error) {
        console.error('Failed to update chat:', error);
      }
    }
    setEditingChatId(null);
    setEditTitle('');
  };

  const deleteChat = async (chatId: string) => {
    try {
      await chatsAPI.delete(chatId);
      if (currentChatId === chatId) {
        setCurrentChatId(null);
        setMessages([]);
      }
      await loadChats(); // Refresh chat list
    } catch (error) {
      console.error('Failed to delete chat:', error);
    }
  };

  const togglePinChat = async (chatId: string) => {
    try {
      const chat = chats.find(c => c.id === chatId);
      if (chat) {
        await chatsAPI.update(chatId, { isPinned: !chat.isPinned });
        await loadChats(); // Refresh chat list
      }
    } catch (error) {
      console.error('Failed to toggle pin:', error);
    }
  };

  const copyMessage = (text: string) => {
    navigator.clipboard.writeText(text);
  };

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const getFilteredChats = () => {
    let filtered = chats.filter(chat => 
      chat.title.toLowerCase().includes(searchQuery.toLowerCase())
    );
    
    // Sort: pinned first, then by date
    return filtered.sort((a, b) => {
      const aPin = a.isPinned ? 1 : 0;
      const bPin = b.isPinned ? 1 : 0;
      if (aPin !== bPin) return bPin - aPin;
      return new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime();
    });
  };

  const getRelativeTime = (date: Date | string) => {
    const now = new Date();
    const dateObj = typeof date === 'string' ? new Date(date) : date;
    
    // Check if the date is valid
    if (isNaN(dateObj.getTime())) {
      return 'Unknown';
    }
    
    const diff = now.getTime() - dateObj.getTime();
    const days = Math.floor(diff / (1000 * 60 * 60 * 24));
    
    if (days === 0) return 'Today';
    if (days === 1) return 'Yesterday';
    if (days < 7) return `${days} days ago`;
    return date.toLocaleDateString();
  };

  const handleLogout = async () => {
    await logout();
    navigate('/login');
  }

  return (
    <div className="chat-page-container">
      {isNavOpen && <div className="backdrop backdrop-mobile" onClick={() => setIsNavOpen(false)} />}
      
      <button 
        className={`nav-toggle-button ${isNavOpen ? 'hidden' : 'visible'}`} 
        onClick={() => setIsNavOpen(!isNavOpen)}
        title="Toggle sidebar (Ctrl+B)"
      >
        <FaBars />
      </button>
      
      <nav className={isNavOpen ? 'nav-open' : 'nav-closed'}>
        <div className="nav-header">
          <h2>3D Generator</h2>
          <button className="nav-close-button" onClick={() => setIsNavOpen(false)} title="Close sidebar (Ctrl+B)">
            <FaBars />
          </button>
        </div>
        
        <button className="new-chat-button" onClick={createNewChat}>
          <FaPlus /> New Chat
        </button>
        
        <div className="search-container">
          <FaSearch />
          <input 
            type="text"
            placeholder="Search chats..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="search-input"
          />
        </div>
        
        <div className="chat-history">
          {getFilteredChats().length === 0 ? (
            <div className="empty-state">
              <p>No chats found</p>
              <small>{searchQuery ? 'Try a different search' : 'Start a new conversation!'}</small>
            </div>
          ) : (
            getFilteredChats().map((chat) => (
              <div
                key={chat.id}
                className={`chat-history-item ${currentChatId === chat.id ? 'active' : ''} ${pinnedChats.has(chat.id) ? 'pinned' : ''}`}
                onClick={() => loadChat(chat.id)}
              >
                <div className="chat-item-content">
                  <div className="chat-item-header">
                    <p className="chat-title">{chat.title}</p>
                    {pinnedChats.has(chat.id) && <FaThumbtack className="pin-icon" />}
                  </div>
                  <p className="chat-preview">{chat.messages[chat.messages.length - 1]?.text?.substring(0, 40) || 'No messages yet'}...</p>
                  <small className="chat-date">{getRelativeTime(chat.createdAt)}</small>
                </div>
                <div className="chat-actions">
                  <button 
                    className='action-button' 
                    onClick={(e) => {
                      e.stopPropagation();
                      togglePinChat(chat.id);
                    }}
                    title={pinnedChats.has(chat.id) ? 'Unpin' : 'Pin'}
                  >
                    <FaThumbtack />
                  </button>
                  <button 
                    className='action-button' 
                    onClick={(e) => {
                      e.stopPropagation();
                      setEditingChatId(chat.id);
                      setEditTitle(chat.title);
                    }}
                    title="Edit"
                  >
                    <FaEdit />
                  </button>
                  <button 
                    className='action-button delete' 
                    onClick={(e) => {
                      e.stopPropagation();
                      if (confirm('Delete this chat?')) deleteChat(chat.id);
                    }}
                    title="Delete"
                  >
                    <FaTrash />
                  </button>
                </div>
                {editingChatId === chat.id && (
                  <div className='edit-menu' onClick={(e) => e.stopPropagation()}>
                    <input 
                      type="text" 
                      value={editTitle} 
                      onChange={(e) => setEditTitle(e.target.value)}
                      onClick={(e) => e.stopPropagation()}
                      placeholder="Chat title"
                    />
                    <button onClick={(e) => {
                      e.stopPropagation();
                      handleEditMenu(chat.id);
                    }}>
                      Save
                    </button>
                  </div>
                )}
              </div>
            ))
          )}
        </div>
        
        <div className="nav-separator"></div>
        <div className='profile-section' ref={profileRef}>
          <button
            className='profile-button'
            onClick={() => setShowProfileMenu(!showProfileMenu)}
          >
            <FaUser/> {user?.userName}
          </button>
          {showProfileMenu && (
            <div className='profile-menu'>
              {user?.roles?.includes('admin') && (
                <Link to="/admin" className="admin-link">
                  Admin Dashboard
                </Link>
              )}
              <button className='logout-button' onClick={handleLogout}>
                Logout
              </button>
            </div>
          )}
        </div>
      </nav>

      <main>
        <div className="messages-container" ref={messagesContainerRef}>
          {messages.length === 0 ? (
            <div className="empty-chat-state">
              <h2>Start a new conversation</h2>
              <p>Type your message below to begin</p>
            </div>
          ) : (
            <>
              {messages.map((message) => (
                <div 
                  key={message.id} 
                  className={`message ${message.role}`}
                >
                  <div className="message-content">
                    <strong>{message.role === 'user' ? user?.userName : 'Assistant'}:</strong>
                    <p>{message.content}</p>
                  </div>
                  <div className="message-footer">
                    <span className="message-time">
                      {new Date(message.timestamp).toLocaleTimeString()}
                    </span>
                    <button 
                      className="copy-button" 
                      onClick={() => copyMessage(message.content)}
                      title="Copy message"
                    >
                      <FaCopy />
                    </button>
                  </div>
                </div>
              ))}
              {isLoading && (
                <div className="message response loading">
                  <div className="message-content">
                    <strong>Bot:</strong>
                    <p className="typing-indicator">
                      <span></span><span></span><span></span>
                    </p>
                  </div>
                </div>
              )}
              <div ref={messagesEndRef} />
            </>
          )}
        </div>
        
        {showScrollButton && (
          <button className="scroll-to-bottom" onClick={scrollToBottom} title="Scroll to bottom">
            <FaArrowDown />
          </button>
        )}
        
        <div className="input-container">
          <textarea 
            className='input'
            value={inputText}
            onChange={(e) => setInputText(e.target.value)}
            onKeyDown={handleKeyPress}
            placeholder="Type a message... (Shift+Enter for new line)"
            rows={1}
          />
          <div className="input-footer">
            <small className="char-counter">{inputText.length} characters</small>
            <button 
              className='chat-button'
              onClick={sendMessage}
              disabled={!inputText.trim()}
              title="Send message"
            >
              <FaPaperPlane/>
            </button>
          </div>
        </div>
      </main>
    </div>
  )
}

export default chatPage
