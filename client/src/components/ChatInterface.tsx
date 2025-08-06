import React, { useState, useRef, useEffect, useCallback } from 'react';
import './ChatInterface.css';
import { FileUpload } from './FileUpload';

interface ChatMessage {
  id: string;
  role: 'user' | 'assistant' | 'system';
  content: string;
  timestamp: Date;
  tokenSource?: 'user' | 'system';
  model?: string;
  attachedFiles?: string[]; // File names that were attached to this message
  isStreaming?: boolean; // For streaming responses
}

interface UploadedFile {
  id: string;
  name: string;
  size: number;
  type: string;
  content: string;
  uploadDate: Date;
}

interface ChatInterfaceProps {
  userApiKey: string;
  isTokenValid: boolean;
  selectedModel: string;
  systemTokenAvailable: boolean;
  initialPrompt?: string;
  onPromptUsed?: () => void;
}

export const ChatInterface: React.FC<ChatInterfaceProps> = ({
  userApiKey,
  isTokenValid,
  selectedModel,
  systemTokenAvailable,
  initialPrompt,
  onPromptUsed
}) => {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [inputMessage, setInputMessage] = useState<string>('');
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string>('');
  const [uploadedFiles, setUploadedFiles] = useState<UploadedFile[]>([]);
  const [showFileUpload, setShowFileUpload] = useState<boolean>(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  // Handle initial prompt from Capture Assistant
  useEffect(() => {
    if (initialPrompt && initialPrompt.trim()) {
      setInputMessage(initialPrompt);
      onPromptUsed?.();
    }
  }, [initialPrompt, onPromptUsed]);

  const canSendMessage = () => {
    return (isTokenValid && userApiKey) || systemTokenAvailable;
  };

  const handleFilesUploaded = (newFiles: UploadedFile[]) => {
    setUploadedFiles(prev => [...prev, ...newFiles]);
  };

  const handleFileRemove = (fileId: string) => {
    setUploadedFiles(prev => prev.filter(file => file.id !== fileId));
  };

  const toggleFileUpload = () => {
    setShowFileUpload(!showFileUpload);
  };

  const sendMessage = async () => {
    if (!inputMessage.trim() || !canSendMessage()) return;

    // Prepare the message content with file attachments
    let messageContent = inputMessage.trim();
    let attachedFileNames: string[] = [];

    if (uploadedFiles.length > 0) {
      attachedFileNames = uploadedFiles.map(f => f.name);
      const fileContents = uploadedFiles.map(file => 
        `\n\n--- FILE: ${file.name} ---\n${file.content}\n--- END FILE ---`
      ).join('');
      messageContent += fileContents;
    }

    const userMessage: ChatMessage = {
      id: Date.now().toString(),
      role: 'user',
      content: inputMessage.trim(), // Display only the text input, not file contents
      timestamp: new Date(),
      attachedFiles: attachedFileNames.length > 0 ? attachedFileNames : undefined
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
          message: messageContent, // Send full content including files to API
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
        
        // Clear uploaded files after successful message
        setUploadedFiles([]);
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
        <h2>💬 Federal Contract Capture Assistant</h2>
        <div className="chat-controls">
          <button 
            onClick={toggleFileUpload}
            className={`btn btn-outline btn-sm ${showFileUpload ? 'active' : ''}`}
            title="Upload contract documents"
          >
            📁 Documents ({uploadedFiles.length})
          </button>
          {messages.length > 0 && (
            <button onClick={clearChat} className="btn btn-outline btn-sm">
              Clear Chat
            </button>
          )}
        </div>
        <div className="chat-status">
          {canSendMessage() ? (
            <span className="status-ready">
              ✅ Ready
            </span>
          ) : (
            <span className="status-waiting">
              ⚠️ Setup Required
            </span>
          )}
        </div>
      </div>

      {/* File Upload Section */}
      {showFileUpload && (
        <div className="file-upload-section">
          <FileUpload
            onFilesUploaded={handleFilesUploaded}
            uploadedFiles={uploadedFiles}
            onFileRemove={handleFileRemove}
            maxFiles={5}
            maxSizeBytes={5 * 1024 * 1024} // 5MB
            acceptedTypes={['.pdf', '.doc', '.docx', '.txt', '.md', '.rtf']}
          />
        </div>
      )}

      <div className="messages-container">
        {messages.length === 0 ? (
          <div className="welcome-message">
            <h3>🚀 Welcome to Federal Contract Capture Assistant!</h3>
            <p>Your intelligent federal contracting assistant is ready to help analyze RFPs, SOWs, and contract documents.</p>
            <div className="welcome-features">
              <div className="feature">
                <span className="feature-icon">�</span>
                <span>Document analysis & capture support</span>
              </div>
              <div className="feature">
                <span className="feature-icon">🎯</span>
                <span>RFP analysis & gap assessment</span>
              </div>
              <div className="feature">
                <span className="feature-icon">�</span>
                <span>Partner research & teaming</span>
              </div>
              <div className="feature">
                <span className="feature-icon">�</span>
                <span>Compliance matrices & win strategies</span>
              </div>
            </div>
            <p className="welcome-prompt">
              {canSendMessage() 
                ? "Upload contract documents and start analyzing!" 
                : "Complete setup to get started with AI analysis."}
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
                  {message.attachedFiles && message.attachedFiles.length > 0 && (
                    <div className="attached-files">
                      <div className="attached-files-label">📎 Attached documents:</div>
                      <div className="attached-files-list">
                        {message.attachedFiles.map((fileName, index) => (
                          <span key={index} className="attached-file">
                            📄 {fileName}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}
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
              ? "Ask me about your contract documents..." 
              : "Complete setup to start chatting"}
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
