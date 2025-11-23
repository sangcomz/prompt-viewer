/**
 * Script to generate conversation index from JSONL files
 * Run with: npx tsx scripts/generate-index.ts
 */

import * as fs from 'fs';
import * as path from 'path';

interface ConversationMessage {
  type: string;
  role?: 'user' | 'assistant';
  content: string | Array<{ type: string; text?: string }> | { text: string };
  timestamp?: string;
  cwd?: string;
  gitBranch?: string;
  message?: {
    content: string | Array<{ type: string; text?: string }> | { text: string };
  };
  error?: string;
  isApiErrorMessage?: boolean;
  isSidechain?: boolean;
}

interface ConversationIndex {
  id: string;
  title: string;
  date: string;
  description: string;
  messageCount: number;
  cwd: string;
  gitBranch: string;
  aiName?: string;
}

function extractTextContent(content: unknown): string {
  if (typeof content === 'string') {
    return content;
  }

  if (Array.isArray(content)) {
    const texts: string[] = [];
    for (const item of content) {
      if (typeof item === 'object' && item !== null) {
        const block = item as { type?: string; text?: string };
        if (block.type === 'text' && block.text) {
          texts.push(block.text);
        }
      } else if (typeof item === 'string') {
        texts.push(item);
      }
    }
    return texts.join('\n');
  }

  if (typeof content === 'object' && content !== null && 'text' in content) {
    return (content as { text: string }).text || '';
  }

  return String(content);
}

function parseJSONL(filePath: string): ConversationMessage[] {
  const content = fs.readFileSync(filePath, 'utf-8');
  const lines = content.split('\n').filter((line) => line.trim());
  const messages: ConversationMessage[] = [];

  for (const line of lines) {
    try {
      messages.push(JSON.parse(line));
    } catch (error) {
      console.warn(`Failed to parse line in ${filePath}:`, error);
    }
  }

  return messages;
}

function generateTitle(messages: ConversationMessage[]): string {
  for (const msg of messages) {
    if (msg.type === 'user' && msg.message) {
      const content = extractTextContent(msg.message.content);
      if (content) {
        const firstLine = content.split('\n')[0];
        return firstLine.length > 60
          ? firstLine.slice(0, 60) + '...'
          : firstLine;
      }
    }
  }
  return 'Untitled Conversation';
}

function generateDescription(messages: ConversationMessage[]): string {
  const userMessages = messages
    .filter((m) => m.type === 'user' && m.message)
    .slice(0, 3);

  if (userMessages.length === 0) return 'No description';

  const preview = userMessages
    .map((m) => {
      const content = extractTextContent(m.message!.content);
      return content.split('\n')[0];
    })
    .join(' · ');

  return preview.length > 120 ? preview.slice(0, 120) + '...' : preview;
}

function extractDate(messages: ConversationMessage[]): string {
  for (const msg of messages) {
    if (msg.timestamp) {
      return new Date(msg.timestamp).toISOString().split('T')[0];
    }
  }
  return new Date().toISOString().split('T')[0];
}

function countMessages(messages: ConversationMessage[]): number {
  return messages.filter(
    (m) =>
      (m.type === 'user' || m.type === 'assistant') &&
      !m.error &&
      !m.isApiErrorMessage
  ).length;
}

function extractAIName(filename: string): string | undefined {
  // Extract AI name from filename prefix
  // Examples:
  //   "claude_code_abc123.jsonl" -> "Claude Code"
  //   "github_copilot_test-feature.jsonl" -> "Github Copilot"
  //   "chatgpt_xyz.jsonl" -> "Chatgpt"
  //   "abc123.jsonl" -> undefined (no prefix)

  // Remove .jsonl extension first
  const nameWithoutExt = filename.replace(/\.jsonl$/, '');
  const parts = nameWithoutExt.split('_');

  // Need at least 2 parts for a prefix
  if (parts.length < 2) {
    return undefined;
  }

  // Strategy: Look for common AI assistant prefixes
  // If filename starts with known AI names, extract them
  const knownAIs = [
    { pattern: /^github_copilot/i, name: 'Github Copilot' },
    { pattern: /^claude_code/i, name: 'Claude Code' },
    { pattern: /^chatgpt/i, name: 'ChatGPT' },
    { pattern: /^gemini/i, name: 'Gemini' },
    { pattern: /^claude/i, name: 'Claude' },
    { pattern: /^copilot/i, name: 'Copilot' },
  ];

  for (const ai of knownAIs) {
    if (ai.pattern.test(nameWithoutExt)) {
      return ai.name;
    }
  }

  // Fallback: Check if last part looks like an ID
  const lastPart = parts[parts.length - 1];
  const looksLikeId = /^[a-f0-9-]+$/i.test(lastPart);

  if (looksLikeId && parts.length >= 2) {
    // Join all parts except the last one as the AI name
    const aiNameParts = parts.slice(0, -1);
    const aiName = aiNameParts
      .map((part) =>
        part.charAt(0).toUpperCase() + part.slice(1).toLowerCase()
      )
      .join(' ');
    return aiName;
  }

  return undefined;
}

function main() {
  const conversationsDir = path.join(process.cwd(), 'public', 'conversations');
  const outputPath = path.join(conversationsDir, 'index.json');

  if (!fs.existsSync(conversationsDir)) {
    console.error(`Directory not found: ${conversationsDir}`);
    process.exit(1);
  }

  const files = fs
    .readdirSync(conversationsDir)
    .filter((file) => file.endsWith('.jsonl'));

  console.log(`Found ${files.length} JSONL files`);

  const index: ConversationIndex[] = [];

  for (const file of files) {
    const filePath = path.join(conversationsDir, file);
    const conversationId = path.basename(file, '.jsonl');

    console.log(`Processing: ${file}`);

    try {
      const messages = parseJSONL(filePath);
      const messageCount = countMessages(messages);

      if (messageCount === 0) {
        console.log(`  ⚠️  No meaningful messages, skipping`);
        continue;
      }

      const firstMsg = messages[0] || {};
      const aiName = extractAIName(file);

      const indexEntry: ConversationIndex = {
        id: conversationId,
        title: generateTitle(messages),
        date: extractDate(messages),
        description: generateDescription(messages),
        messageCount,
        cwd: firstMsg.cwd || 'N/A',
        gitBranch: firstMsg.gitBranch || 'N/A',
      };

      if (aiName) {
        indexEntry.aiName = aiName;
      }

      index.push(indexEntry);

      console.log(`  ✅ Added to index${aiName ? ` (AI: ${aiName})` : ''}`);
    } catch (error) {
      console.error(`  ❌ Error processing ${file}:`, error);
    }
  }

  // Sort by date (newest first)
  index.sort((a, b) => b.date.localeCompare(a.date));

  // Write index file
  fs.writeFileSync(outputPath, JSON.stringify(index, null, 2));

  console.log(`\n✅ Generated index with ${index.length} conversations`);
  console.log(`📁 Output: ${outputPath}`);
}

main();
