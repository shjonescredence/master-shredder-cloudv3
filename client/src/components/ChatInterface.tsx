import React, { useState, useRef, useEffect } from 'react';
import './ChatInterface.css';

interface ChatMessage {
  id: string;
  role: 'user' | 'assistant' | 'system';
  content: string;
  timestamp: Date;
  tokenSource?: 'user' | 'system';
  model?: string;
}

interface ChatInterfaceProps {
  userApiKey: string;
  isTokenValid: boolean;
  selectedModel: string;
  systemTokenAvailable: boolean;
}

export const ChatInterface: React.FC<ChatInterfaceProps> = ({
  userApiKey,
  isTokenValid,
  selectedModel,
  systemTokenAvailable
}) => {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [inputMessage, setInputMessage] = useState<string>('');
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string>('');
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const canSendMessage = () => {
    return (isTokenValid && userApiKey) || systemTokenAvailable;
  };

  const sendMessage = async () => {
    if (!inputMessage.trim() || !canSendMessage()) return;

    const userMessage: ChatMessage = {
      id: Date.now().toString(),
      role: 'user',
      content: inputMessage.trim(),
      timestamp: new Date()
    };

    setMessages(prev => [...prev, userMessage]);
    setInputMessage('');
    setIsLoading(true);
    setError('');

    try {
      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          message: inputMessage.trim(),
          context: messages.slice(-6), // Last 6 messages for context
          model: selectedModel,
          userApiKey: userApiKey || undefined,
        }),
      });

      const result = await response.json();

      if (result.success) {
        const assistantMessage: ChatMessage = {
          id: (Date.now() + 1).toString(),
          role: 'assistant',
          content: result.reply,
          timestamp: new Date(),
          tokenSource: result.tokenSource,
          model: result.model
        };

        setMessages(prev => [...prev, assistantMessage]);
      } else {
        setError(result.error || 'Failed to get response');
      }
    } catch (error: any) {
      setError('Network error: ' + error.message);
    } finally {
      setIsLoading(false);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  const clearChat = () => {
    setMessages([]);
    setError('');
  };

  const formatTimestamp = (date: Date) => {
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  return (
    <div className="chat-interface">
      <div className="chat-header">
        <h2>💬 Master Shredder Chat</h2>
        <div className="chat-status">
          {canSendMessage() ? (
            <span className="status-ready">
              ✅ Ready • {userApiKey ? 'User Token' : 'System Token'}
            </span>
          ) : (
            <span className="status-waiting">
              ⏳ Waiting for valid token
            </span>
          )}
        </div>
        {messages.length > 0 && (
          <button onClick={clearChat} className="btn btn-outline btn-sm">
            Clear Chat
          </button>
        )}
      </div>

      <div className="messages-container">
        {messages.length === 0 ? (
          <div className="welcome-message">
            <h3>🚀 Welcome to Master Shredder Cloud v3!</h3>
            <p>Your intelligent document processing assistant is ready to help.</p>
            <div className="welcome-features">
              <div className="feature">
                <span className="feature-icon">🔐</span>
                <span>Secure token management</span>
              </div>
              <div className="feature">
                <span className="feature-icon">☁️</span>
                <span>Cloud-native architecture</span>
              </div>
              <div className="feature">
                <span className="feature-icon">🤖</span>
                <span>Multiple AI models</span>
              </div>
              <div className="feature">
                <span className="feature-icon">📄</span>
                <span>Document analysis</span>
              </div>
            </div>
            <p className="welcome-prompt">
              {canSendMessage() 
                ? "Start a conversation below!" 
                : "Please add your OpenAI API key to get started."}
            </p>
          </div>
        ) : (
          <div className="messages-list">
            {messages.map((message) => (
              <div key={message.id} className={`message message-${message.role}`}>
                <div className="message-header">
                  <span className="message-role">
                    {message.role === 'user' ? '👤 You' : '🤖 Shredder'}
                  </span>
                  <span className="message-timestamp">
                    {formatTimestamp(message.timestamp)}
                  </span>
                  {message.tokenSource && (
                    <span className={`token-source ${message.tokenSource}`}>
                      {message.tokenSource === 'user' ? '🔑 Your Token' : '🏢 System'}
                    </span>
                  )}
                </div>
                <div className="message-content">
                  {message.content}
                </div>
                {message.model && (
                  <div className="message-meta">
                    Model: {message.model}
                  </div>
                )}
              </div>
            ))}
            {isLoading && (
              <div className="message message-assistant loading">
                <div className="message-header">
                  <span className="message-role">🤖 Shredder</span>
                  <span className="message-timestamp">...</span>
                </div>
                <div className="message-content">
                  <div className="typing-indicator">
                    <span></span>
                    <span></span>
                    <span></span>
                  </div>
                </div>
              </div>
            )}
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      {error && (
        <div className="error-message">
          <span className="error-icon">⚠️</span>
          {error}
          <button onClick={() => setError('')} className="error-close">
            ✕
          </button>
        </div>
      )}

      <div className="input-container">
        <div className="input-group">
          <textarea
            value={inputMessage}
            onChange={(e) => setInputMessage(e.target.value)}
            onKeyPress={handleKeyPress}
            placeholder={canSendMessage() 
              ? "Ask me anything about your documents..." 
              : "Please add your OpenAI API key to start chatting"}
            className="message-input"
            rows={2}
            disabled={!canSendMessage() || isLoading}
          />
          <button
            onClick={sendMessage}
            disabled={!canSendMessage() || !inputMessage.trim() || isLoading}
            className="send-button"
            title="Send message (Enter)"
          >
            {isLoading ? '⏳' : '📤'}
          </button>
        </div>
      </div>
    </div>
  );
};
