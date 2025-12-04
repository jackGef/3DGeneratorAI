import React, { useState } from 'react'
import { useAuth } from '../contexts/AuthContext'
import { useNavigate } from 'react-router-dom'
import { v4 as uuidv4 } from 'uuid'
import "../styles2/chatPage.css"

// icons
import { FaPaperPlane } from 'react-icons/fa'

interface Message {
  id: string;
  text: string;
  sender: 'user' | 'response';
  timestamp: Date;
}

const chatPage = () => {
  const { user } = useAuth();
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputText, setInputText] = useState('');

  const sendMessage = () => {
    if (inputText.trim() === '') return;

    const newMessage: Message = {
      id: uuidv4(),
      text: inputText,
      sender: 'user',
      timestamp: new Date(),
    };

    setMessages([...messages, newMessage]);
    setInputText('');

    
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      sendMessage();
    }
  };

  return (
    <div className="chat-page-container">
      <nav>
        <h2>3D Generator</h2>
      </nav>
      <main>
        <h1>Chat Page</h1>
        <div className="messages-container">
          {messages.map((message) => (
            <div 
              key={message.id} 
              className={`message ${message.sender}`}
            >
              <div className="message-content">
                <strong>{message.sender === 'user' ? user?.userName : 'Bot'}:</strong>
                <p>{message.text}</p>
              </div>
              <span className="message-time">
                {message.timestamp.toLocaleTimeString()}
              </span>
            </div>
          ))}
        </div>
        <div className="input-container">
          <input 
            className='input'
            type="text"
            value={inputText}
            onChange={(e) => setInputText(e.target.value)}
            onKeyPress={handleKeyPress}
            placeholder="Type a message..."
          />
          <button 
            className='chat-button'
            onClick={sendMessage}
          >
            <FaPaperPlane/>
          </button>
        </div>
      </main>
    </div>
  )
}

export default chatPage
