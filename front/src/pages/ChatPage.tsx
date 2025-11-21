import React, { useState, useEffect, useRef } from 'react'
import { useAuth } from '../contexts/AuthContext'
import { useNavigate } from 'react-router-dom'
import { v4 as uuidv4 } from 'uuid'

import "../styles2/chatPage.css"

// icons
import { FaPaperPlane, FaPlus, FaUser, FaEdit, FaBars, FaTrash, FaCopy, FaThumbtack, FaSearch, FaArrowDown } from 'react-icons/fa'

interface Message {
  id: string;
  text: string;
  sender: 'user' | 'response';
  timestamp: Date;
}

interface Chat {
  id: string;
  messages: Message[];
  title: string;
  createdAt: Date;
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
    const handleClickOutside = (event: MouseEvent) => {
      if (profileRef.current && !profileRef.current.contains(event.target as Node)) {
        setShowProfileMenu(false);
      }
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

  const sendMessage = () => {
    if (inputText.trim() === '') return;

    // Create a chat ID if this is the first message
    let chatId = currentChatId;
    if (!chatId) {
      chatId = uuidv4();
      setCurrentChatId(chatId);
    }

    const newMessage: Message = {
      id: uuidv4(),
      text: inputText,
      sender: 'user',
      timestamp: new Date(),
    };

    const updatedMessages = [...messages, newMessage];
    setMessages(updatedMessages);
    setInputText('');

    // Update the current chat in the chats list
    const existingChat = chats.find(c => c.id === chatId);
    if (existingChat) {
      setChats(chats.map(chat => 
        chat.id === chatId 
          ? { ...chat, messages: updatedMessages }
          : chat
      ));
    }

    // Simulate bot response with loading
    setIsLoading(true);
    setTimeout(() => {
      const botMessage: Message = {
        id: uuidv4(),
        text: 'This is a simulated response. Connect to your backend for real responses.',
        sender: 'response',
        timestamp: new Date(),
      };
      const withBot = [...updatedMessages, botMessage];
      setMessages(withBot);
      setIsLoading(false);
      
      if (existingChat) {
        setChats(chats.map(chat => 
          chat.id === chatId 
            ? { ...chat, messages: withBot }
            : chat
        ));
      }
    }, 1000);
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  const createNewChat = () => {
    // Save current chat if it has messages
    if (messages.length > 0 && currentChatId) {
      const existingChat = chats.find(c => c.id === currentChatId);
      if (!existingChat) {
        const newChat: Chat = {
          id: currentChatId,
          messages: messages,
          title: messages[0]?.text.substring(0, 30) + '...' || 'New Chat',
          createdAt: new Date(),
        };
        setChats([...chats, newChat]);
      }
    }

    // Create new chat
    const newChatId = uuidv4();
    setCurrentChatId(newChatId);
    setMessages([]);
  };

  const loadChat = (chatId: string) => {
    const chat = chats.find(c => c.id === chatId);
    if (chat) {
      setCurrentChatId(chatId);
      setMessages(chat.messages);
    }
  };

  const handleEditMenu = (chatId: string) => {
    if (editTitle.trim()) {
      setChats(chats.map(chat => 
        chat.id === chatId 
          ? { ...chat, title: editTitle }
          : chat
      ));
    }
    setEditingChatId(null);
    setEditTitle('');
  }

  const deleteChat = (chatId: string) => {
    setChats(chats.filter(chat => chat.id !== chatId));
    if (currentChatId === chatId) {
      setCurrentChatId(null);
      setMessages([]);
    }
  };

  const togglePinChat = (chatId: string) => {
    const newPinned = new Set(pinnedChats);
    if (newPinned.has(chatId)) {
      newPinned.delete(chatId);
    } else {
      newPinned.add(chatId);
    }
    setPinnedChats(newPinned);
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
      const aPin = pinnedChats.has(a.id) ? 1 : 0;
      const bPin = pinnedChats.has(b.id) ? 1 : 0;
      if (aPin !== bPin) return bPin - aPin;
      return b.createdAt.getTime() - a.createdAt.getTime();
    });
  };

  const getRelativeTime = (date: Date) => {
    const now = new Date();
    const diff = now.getTime() - date.getTime();
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
                  <p className="chat-preview">{chat.messages[chat.messages.length - 1]?.text.substring(0, 40)}...</p>
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
            {showProfileMenu && (
              <div className='profile-menu'>
                <button className='logout-button' onClick={handleLogout}>
                  Logout
                </button>
              </div>
            )}
          </button>
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
                  className={`message ${message.sender}`}
                >
                  <div className="message-content">
                    <strong>{message.sender === 'user' ? user?.userName : 'Bot'}:</strong>
                    <p>{message.text}</p>
                  </div>
                  <div className="message-footer">
                    <span className="message-time">
                      {message.timestamp.toLocaleTimeString()}
                    </span>
                    <button 
                      className="copy-button" 
                      onClick={() => copyMessage(message.text)}
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
