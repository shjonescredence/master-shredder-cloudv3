import React, { useState, useRef, useEffect } from 'react';
import './ChatScreen.css';

interface Message {
  id: string;
  content: string;
  type: 'user' | 'assistant';
  timestamp: Date;
  isLoading?: boolean;
}

interface ChatScreenProps {
  onSendMessage?: (message: string) => Promise<string>;
  initialMessages?: Message[];
}

export const ChatScreen: React.FC<ChatScreenProps> = ({ 
  onSendMessage,
  initialMessages = []
}) => {
  const [messages, setMessages] = useState<Message[]>(initialMessages);
  const [inputValue, setInputValue] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSendMessage = async () => {
    if (!inputValue.trim() || isLoading) return;

    const userMessage: Message = {
      id: Date.now().toString(),
      content: inputValue,
      type: 'user',
      timestamp: new Date()
    };

    setMessages(prev => [...prev, userMessage]);
    setInputValue('');
    setIsLoading(true);

    // Add loading message
    const loadingMessage: Message = {
      id: 'loading',
      content: '',
      type: 'assistant',
      timestamp: new Date(),
      isLoading: true
    };
    setMessages(prev => [...prev, loadingMessage]);

    try {
      const response = await onSendMessage?.(inputValue) || "I'm Master Shredder, ready to help with federal contract capture!";
      
      // Remove loading message and add real response
      setMessages(prev => prev.filter(msg => msg.id !== 'loading'));
      
      const assistantMessage: Message = {
        id: (Date.now() + 1).toString(),
        content: response,
        type: 'assistant',
        timestamp: new Date()
      };
      
      setMessages(prev => [...prev, assistantMessage]);
    } catch (error) {
      setMessages(prev => prev.filter(msg => msg.id !== 'loading'));
      
      const errorMessage: Message = {
        id: (Date.now() + 1).toString(),
        content: "I apologize, but I'm having trouble processing your request right now. Please try again.",
        type: 'assistant',
        timestamp: new Date()
      };
      
      setMessages(prev => [...prev, errorMessage]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  return (
    <div className="chat-screen">
      <div className="chat-header">
        <div className="header-info">
          <div className="assistant-avatar">🎯</div>
          <div className="assistant-details">
            <h3>Master Shredder</h3>
            <p>Federal Contract Capture Assistant</p>
          </div>
        </div>
        <div className="status-indicator online">
          <span className="status-dot"></span>
          Ready
        </div>
      </div>

      <div className="messages-container">
        {messages.length === 0 && (
          <div className="welcome-message">
            <div className="welcome-icon">🎯</div>
            <h3>Welcome to Master Shredder!</h3>
            <p>I'm your federal contract capture assistant. I can help you with:</p>
            <ul>
              <li>📄 RFP and PWS document analysis</li>
              <li>🎯 Opportunity assessment and shredding</li>
              <li>⚖️ Compliance requirement identification</li>
              <li>📊 Competitive analysis and strategy</li>
            </ul>
            <p>How can I assist you today?</p>
          </div>
        )}
        
        {messages.map((message) => (
          <div key={message.id} className={`message ${message.type}`}>
            {message.type === 'assistant' && (
              <div className="message-avatar">🎯</div>
            )}
            <div className="message-content">
              {message.isLoading ? (
                <div className="loading-dots">
                  <span></span>
                  <span></span>
                  <span></span>
                </div>
              ) : (
                <div className="message-text">{message.content}</div>
              )}
              <div className="message-time">
                {message.timestamp.toLocaleTimeString()}
              </div>
            </div>
          </div>
        ))}
        <div ref={messagesEndRef} />
      </div>

      <div className="chat-input-container">
        <div className="input-wrapper">
          <textarea
            ref={inputRef}
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            onKeyPress={handleKeyPress}
            placeholder="Ask about RFP analysis, opportunity assessment, compliance requirements..."
            className="chat-input"
            rows={1}
            disabled={isLoading}
          />
          <button
            onClick={handleSendMessage}
            disabled={!inputValue.trim() || isLoading}
            className="send-button"
          >
            {isLoading ? (
              <div className="loading-spinner"></div>
            ) : (
              <svg viewBox="0 0 24 24" width="20" height="20">
                <path fill="currentColor" d="M2,21L23,12L2,3V10L17,12L2,14V21Z"/>
              </svg>
            )}
          </button>
        </div>
      </div>
    </div>
  );
};