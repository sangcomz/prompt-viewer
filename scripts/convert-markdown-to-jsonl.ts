/**
 * Convert markdown conversation files to JSONL format
 * Parses markdown with User/Assistant sections into JSONL
 * Run with: npx tsx scripts/convert-markdown-to-jsonl.ts <input.md> <output.jsonl>
 */

import * as fs from 'fs';
import * as path from 'path';

interface MessageEntry {
  type: 'user' | 'assistant';
  message: {
    role: 'user' | 'assistant';
    content: string;
  };
  timestamp: string;
}

function parseMarkdownConversation(content: string): MessageEntry[] {
  const messages: MessageEntry[] = [];
  const timestamp = new Date().toISOString();

  // Split by different User/Assistant marker patterns
  // Pattern 1: **User**: or **Assistant**:
  // Pattern 2: ### User 요청: or ### Assistant 답변: or ### Assistant 답변 및 구현:
  // Pattern 3: Assistant 답변 및 구현: or User 요청 및 질문: (without ###)
  const sections = content.split(
    /\n(?=(?:\*\*(?:User|Assistant)\*\*:|###\s*(?:User|Assistant)\s*[요청답변구현및\s]*:|(?:User|Assistant)\s+[요청답변구현및]+:))/
  );

  for (const section of sections) {
    const trimmed = section.trim();
    if (!trimmed) continue;

    // Check if it's a user or assistant message
    // Pattern 1: **User**: or **Assistant**:
    const userMatch1 = trimmed.match(/^\*\*User\*\*:\s*([\s\S]*)/);
    const assistantMatch1 = trimmed.match(/^\*\*Assistant\*\*:\s*([\s\S]*)/);

    // Pattern 2: ### User 요청: or ### Assistant 답변: or ### Assistant 답변 및 구현:
    const userMatch2 = trimmed.match(/^###\s*User\s*[요청답변구현및\s]*:\s*([\s\S]*)/);
    const assistantMatch2 = trimmed.match(
      /^###\s*Assistant\s*[요청답변구현및\s]*:\s*([\s\S]*)/
    );

    // Pattern 3: Assistant 답변 및 구현: or User 요청 및 질문:
    const userMatch3 = trimmed.match(/^User\s+[요청답변구현및\s]+:\s*([\s\S]*)/);
    const assistantMatch3 = trimmed.match(
      /^Assistant\s+[요청답변구현및\s]+:\s*([\s\S]*)/
    );

    const userContent = userMatch1?.[1] || userMatch2?.[1] || userMatch3?.[1];
    const assistantContent =
      assistantMatch1?.[1] || assistantMatch2?.[1] || assistantMatch3?.[1];

    if (userContent) {
      messages.push({
        type: 'user',
        message: {
          role: 'user',
          content: userContent.trim(),
        },
        timestamp,
      });
    } else if (assistantContent) {
      messages.push({
        type: 'assistant',
        message: {
          role: 'assistant',
          content: assistantContent.trim(),
        },
        timestamp,
      });
    }
  }

  return messages;
}

function convertMarkdownToJSONL(
  inputPath: string,
  outputPath: string
): void {
  console.log(`Converting: ${inputPath} -> ${outputPath}`);

  // Read markdown file
  const markdownContent = fs.readFileSync(inputPath, 'utf-8');

  // Parse into messages
  const messages = parseMarkdownConversation(markdownContent);

  if (messages.length === 0) {
    console.warn('⚠️  No messages found in markdown file');
    return;
  }

  // Write JSONL
  const jsonlLines = messages.map((msg) => JSON.stringify(msg)).join('\n');
  fs.writeFileSync(outputPath, jsonlLines + '\n');

  console.log(`✅ Converted ${messages.length} messages`);
}

function main() {
  const args = process.argv.slice(2);

  if (args.length === 0) {
    // Process all markdown files in raw directory
    const rawDir = path.join(process.cwd(), 'raw');
    const outputDir = path.join(process.cwd(), 'public', 'conversations');

    if (!fs.existsSync(rawDir)) {
      console.error('❌ Raw directory not found');
      process.exit(1);
    }

    const files = fs
      .readdirSync(rawDir)
      .filter((file) => file.endsWith('.md'));

    console.log(`Found ${files.length} markdown files\n`);

    for (const file of files) {
      const inputPath = path.join(rawDir, file);
      const baseName = path.basename(file, '.md');
      const outputPath = path.join(outputDir, `${baseName}.jsonl`);

      try {
        convertMarkdownToJSONL(inputPath, outputPath);
      } catch (error) {
        console.error(`❌ Error processing ${file}:`, error);
      }
    }

    console.log('\n✅ Batch conversion complete');
  } else if (args.length === 2) {
    // Process single file
    const [inputPath, outputPath] = args;

    if (!fs.existsSync(inputPath)) {
      console.error(`❌ Input file not found: ${inputPath}`);
      process.exit(1);
    }

    convertMarkdownToJSONL(inputPath, outputPath);
  } else {
    console.log('Usage:');
    console.log('  npx tsx scripts/convert-markdown-to-jsonl.ts');
    console.log('  (converts all .md files in ../raw)');
    console.log('');
    console.log('  npx tsx scripts/convert-markdown-to-jsonl.ts <input.md> <output.jsonl>');
    console.log('  (converts single file)');
    process.exit(1);
  }
}

main();
