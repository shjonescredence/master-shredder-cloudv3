// Minimal OpenAI message type for context
export type ChatMessage = {
  role: 'system' | 'user' | 'assistant';
  content: string;
};
