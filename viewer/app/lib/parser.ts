/**
 * Parser for AI assistant JSONL conversation files
 * Supports Claude Code and other similar formats
 */

import {
  ConversationMessage,
  ParsedMessage,
  ConversationData,
  MessageContent,
  ContentBlock,
} from './types';

/**
 * Extract text content from various message content formats
 */
export function extractTextContent(content: MessageContent): string {
  if (typeof content === 'string') {
    return content;
  }

  if (Array.isArray(content)) {
    const texts: string[] = [];
    for (const item of content) {
      if (typeof item === 'object' && item.type === 'text' && item.text) {
        texts.push(item.text);
      } else if (typeof item === 'string') {
        texts.push(item);
      }
    }
    return texts.join('\n');
  }

  if (typeof content === 'object' && 'text' in content) {
    return content.text || '';
  }

  return String(content);
}

/**
 * Parse a single JSONL file content into structured conversation data
 */
export function parseConversationFile(
  fileContent: string,
  conversationId: string
): ConversationData {
  const lines = fileContent.split('\n').filter((line) => line.trim());
  const rawMessages: ConversationMessage[] = [];

  // Parse each line as JSON
  for (const line of lines) {
    try {
      const parsed = JSON.parse(line);
      rawMessages.push(parsed);
    } catch (error) {
      console.warn('Failed to parse line:', error);
    }
  }

  // Extract metadata from first message
  const firstMsg = rawMessages[0] || {};
  const cwd = firstMsg.cwd || 'N/A';
  const gitBranch = firstMsg.gitBranch || 'N/A';

  // Filter and transform messages
  const messages: ParsedMessage[] = [];

  for (const msg of rawMessages) {
    const msgType = msg.type;

    // Skip system messages
    if (
      msgType === 'file-history-snapshot' ||
      msgType === 'queue-operation' ||
      msgType === 'summary'
    ) {
      continue;
    }

    // Skip error messages
    if (msg.error || msg.isApiErrorMessage) {
      continue;
    }

    if (msgType === 'user') {
      const messageObj = msg.message;
      const content = messageObj
        ? extractTextContent(messageObj.content)
        : '';

      if (content && content.length > 5) {
        messages.push({
          role: 'user',
          content,
          timestamp: msg.timestamp,
          isAgent: false,
        });
      }
    } else if (msgType === 'assistant') {
      const messageObj = msg.message;
      const content = messageObj
        ? extractTextContent(messageObj.content)
        : '';

      if (content && content.length > 20) {
        messages.push({
          role: 'assistant',
          content,
          timestamp: msg.timestamp,
          isAgent: msg.isSidechain || false,
          agentId: msg.agentId,
        });
      }
    }
  }

  // Get timestamps
  const timestamps = messages.map((m) => m.timestamp).filter(Boolean);
  const firstTimestamp = timestamps[0] || '';
  const lastTimestamp = timestamps[timestamps.length - 1] || '';

  return {
    id: conversationId,
    messages,
    metadata: {
      cwd,
      gitBranch,
      firstTimestamp,
      lastTimestamp,
      messageCount: messages.length,
    },
  };
}

/**
 * Format ISO timestamp to readable format
 */
export function formatTimestamp(timestamp: string): string {
  if (!timestamp) return '';

  try {
    const date = new Date(timestamp);
    return new Intl.DateTimeFormat('ko-KR', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
      hour12: false,
    }).format(date);
  } catch {
    return timestamp;
  }
}

/**
 * Generate a title from the first user message
 */
export function generateTitle(messages: ParsedMessage[]): string {
  const firstUserMessage = messages.find((m) => m.role === 'user');
  if (!firstUserMessage) return 'Untitled Conversation';

  const content = firstUserMessage.content;
  // Take first 60 characters or first line
  const firstLine = content.split('\n')[0];
  const truncated = firstLine.length > 60
    ? firstLine.slice(0, 60) + '...'
    : firstLine;

  return truncated || 'Untitled Conversation';
}

/**
 * Generate a description from conversation content
 */
export function generateDescription(messages: ParsedMessage[]): string {
  const userMessages = messages.filter((m) => m.role === 'user');
  if (userMessages.length === 0) return 'No description';

  // Combine first few user messages
  const preview = userMessages
    .slice(0, 3)
    .map((m) => m.content.split('\n')[0])
    .join(' · ');

  return preview.length > 120 ? preview.slice(0, 120) + '...' : preview;
}
