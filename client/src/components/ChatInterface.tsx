import React, { useState, useRef, useEffect } from 'react';
import { Panel } from './ui/Panel';
import { Button } from './ui/Button';
import { Typography } from './ui/Typography';
import { Status } from './ui/Status';

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
  initialPrompt?: string;
  onPromptUsed?: () => void;
}

export const ChatInterface: React.FC<ChatInterfaceProps> = ({
  userApiKey,
  isTokenValid,
  selectedModel,
  systemTokenAvailable,
  initialPrompt,
  onPromptUsed,
}) => {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [inputMessage, setInputMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () =>
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });

  useEffect(scrollToBottom, [messages]);

  useEffect(() => {
    if (initialPrompt?.trim()) {
      setInputMessage(initialPrompt);
      onPromptUsed?.();
    }
  }, [initialPrompt, onPromptUsed]);

  const canSendMessage = () =>
    (isTokenValid && userApiKey) || systemTokenAvailable;

  const sendMessage = async () => {
    if (!inputMessage.trim() || !canSendMessage()) return;

    const content = inputMessage.trim();

    setMessages((m) => [
      ...m,
      {
        id: Date.now().toString(),
        role: 'user',
        content,
        timestamp: new Date(),
      },
    ]);
    setInputMessage('');
    setIsLoading(true);
    setError('');

    try {
      const res = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          message: content,
          context: messages.slice(-6),
          model: selectedModel,
          userApiKey: userApiKey || undefined,
        }),
      });
      const json = await res.json();
      if (json.success) {
        setMessages((m) => [
          ...m,
          {
            id: (Date.now() + 1).toString(),
            role: 'assistant',
            content: json.reply,
            timestamp: new Date(),
            tokenSource: json.tokenSource,
            model: json.model,
          },
        ]);
      } else {
        setError(json.error || 'Failed to get response');
      }
    } catch (e: any) {
      setError('Network error: ' + e.message);
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

  const formatTimestamp = (d: Date) =>
    d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

  return (
    <div className="flex flex-col h-full space-y-4">
      {/* Header */}
      <div className="panel-header flex items-center justify-between">
        <Typography variant="h2">
          💬 Federal Contract Capture Assistant
        </Typography>
        <div className="flex space-x-2">
          {messages.length > 0 && (
            <Button variant="secondary" size="sm" onClick={clearChat}>
              Clear Chat
            </Button>
          )}
        </div>
        <Status
          status={canSendMessage() ? 'ready' : 'info'}
          message={canSendMessage() ? 'Ready' : 'Setup Required'}
        />
      </div>

      {/* Messages Panel */}
      <Panel variant="primary" className="flex-1 overflow-hidden">
        <div className="flex flex-col h-full overflow-y-auto p-4 scrollbar-custom space-y-3">
          {messages.map((msg) => (
            <div
              key={msg.id}
              className={`flex ${
                msg.role === 'user' ? 'justify-end' : 'justify-start'
              }`}
            >
              <div
                className={`max-w-[80%] p-4 rounded-lg ${
                  msg.role === 'user'
                    ? 'bg-ms-blue-start/20 border border-blue-500/30'
                    : 'bg-gray-800/50 border border-gray-700'
                }`}
              >
                <Typography variant="body">{msg.content}</Typography>
                <div className="flex justify-between mt-2 text-xs text-gray-400">
                  <span>{formatTimestamp(msg.timestamp)}</span>
                  {msg.tokenSource && (
                    <span>
                      {msg.tokenSource === 'user' ? '🔑' : '🏢'}
                    </span>
                  )}
                </div>
              </div>
            </div>
          ))}

          {isLoading && (
            <div className="flex justify-start">
              <div className="max-w-[80%] p-4 rounded-lg bg-gray-800/50 border border-gray-700">
                <div className="typing-indicator flex space-x-1">
                  <span className="animate-bounce">•</span>
                  <span className="animate-bounce">•</span>
                  <span className="animate-bounce">•</span>
                </div>
              </div>
            </div>
          )}

          <div ref={messagesEndRef} />
        </div>
      </Panel>

      {/* Error Banner */}
      {error && (
        <div className="flex items-center bg-red-500/10 text-red-500 p-2 rounded-lg space-x-2">
          <span>⚠️</span>
          <Typography variant="body-sm" className="flex-1">
            {error}
          </Typography>
          <Button variant="ghost" size="sm" onClick={() => setError('')}>
            ✕
          </Button>
        </div>
      )}

      {/* Input Area */}
      <div className="flex items-center space-x-2">
        <textarea
          value={inputMessage}
          onChange={(e) => setInputMessage(e.target.value)}
          onKeyPress={handleKeyPress}
          placeholder={
            canSendMessage()
              ? 'Ask me about your contract documents...'
              : 'Complete setup to start chatting'
          }
          className="input-base flex-1 resize-none"
          rows={2}
          disabled={!canSendMessage() || isLoading}
        />
        <Button
          variant="primary"
          size="md"
          onClick={sendMessage}
          disabled={!canSendMessage() || !inputMessage.trim() || isLoading}
        >
          {isLoading ? '⏳' : '📤'}
        </Button>
      </div>
    </div>
  );
};
