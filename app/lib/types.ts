/**
 * Type definitions for AI assistant conversation data
 * Compatible with Claude Code and other JSONL formats
 */

export interface Message {
  type: string;
  role?: 'user' | 'assistant';
  content: MessageContent;
}

export type MessageContent = string | ContentBlock[] | { text: string };

export interface ContentBlock {
  type: string;
  text?: string;
  [key: string]: unknown;
}

export interface ConversationMessage {
  type: 'user' | 'assistant' | 'system' | 'file-history-snapshot' | 'queue-operation' | 'summary';
  parentUuid: string | null;
  isSidechain: boolean;
  userType?: string;
  cwd?: string;
  sessionId?: string;
  version?: string;
  gitBranch?: string;
  agentId?: string;
  message?: Message;
  uuid?: string;
  timestamp: string;
  error?: string;
  isApiErrorMessage?: boolean;
  requestId?: string;
}

export interface ParsedMessage {
  role: 'user' | 'assistant' | 'context';
  content: string;
  timestamp: string;
  isAgent: boolean;
  agentId?: string;
}

export interface ConversationData {
  id: string;
  messages: ParsedMessage[];
  metadata: {
    cwd: string;
    gitBranch: string;
    firstTimestamp: string;
    lastTimestamp: string;
    messageCount: number;
  };
}

export interface ConversationIndex {
  id: string;
  title: string;
  date: string;
  description: string;
  messageCount: number;
  cwd: string;
  gitBranch: string;
  aiName?: string; // Extracted from filename prefix (e.g., "claude_code" from "claude_code_abc123.jsonl")
}
