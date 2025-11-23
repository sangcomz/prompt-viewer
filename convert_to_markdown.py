#!/usr/bin/env python3
"""
Convert AI assistant conversation logs (JSONL) to readable markdown format.
Supports Claude Code and other similar JSONL formats.
Filters out system messages and agent-only conversations to keep meaningful dialogues.
"""

import json
import os
from pathlib import Path
from datetime import datetime
from typing import List, Dict, Any

def parse_jsonl_file(filepath: Path) -> List[Dict[str, Any]]:
    """Parse a JSONL file and return list of parsed JSON objects."""
    messages = []
    try:
        with open(filepath, 'r', encoding='utf-8') as f:
            for line in f:
                line = line.strip()
                if line:
                    try:
                        messages.append(json.loads(line))
                    except json.JSONDecodeError:
                        continue
    except Exception as e:
        print(f"Error reading {filepath}: {e}")
    return messages

def extract_text_content(content: Any) -> str:
    """Extract text from message content."""
    if isinstance(content, str):
        return content
    elif isinstance(content, list):
        texts = []
        for item in content:
            if isinstance(item, dict) and item.get('type') == 'text':
                texts.append(item.get('text', ''))
            elif isinstance(item, str):
                texts.append(item)
        return '\n'.join(texts)
    elif isinstance(content, dict):
        return content.get('text', str(content))
    return str(content)

def is_meaningful_conversation(messages: List[Dict[str, Any]]) -> bool:
    """
    Determine if a conversation is meaningful.
    Filters out summary-only, error-only, or very short conversations.
    """
    user_messages = 0
    assistant_messages = 0
    has_content = False
    is_only_summary = True

    for msg in messages:
        msg_type = msg.get('type', '')

        # Skip system messages
        if msg_type in ['file-history-snapshot', 'queue-operation']:
            continue

        # Check if it's not just a summary
        if msg_type != 'summary':
            is_only_summary = False

        # Count user and assistant messages
        if msg_type == 'user':
            user_messages += 1
            content = msg.get('message', {}).get('content', '')
            if content and len(extract_text_content(content)) > 5:
                has_content = True
        elif msg_type == 'assistant':
            # Skip error messages
            if msg.get('error') or msg.get('isApiErrorMessage'):
                continue
            assistant_messages += 1
            message_obj = msg.get('message', {})
            content = message_obj.get('content', '')
            if content and len(extract_text_content(content)) > 20:
                has_content = True

    # Accept if:
    # 1. Has at least 1 assistant message with content (agent responses are OK)
    # 2. Or has at least 1 user message with content
    # 3. But exclude summary-only conversations
    return not is_only_summary and has_content and (assistant_messages >= 1 or user_messages >= 1)

def format_timestamp(timestamp_str: str) -> str:
    """Format ISO timestamp to readable format."""
    try:
        dt = datetime.fromisoformat(timestamp_str.replace('Z', '+00:00'))
        return dt.strftime('%Y-%m-%d %H:%M:%S')
    except:
        return timestamp_str

def convert_to_markdown(messages: List[Dict[str, Any]], session_id: str) -> str:
    """Convert conversation messages to markdown format."""
    md_lines = []

    # Extract metadata from first message
    first_msg = messages[0] if messages else {}
    cwd = first_msg.get('cwd', 'N/A')
    git_branch = first_msg.get('gitBranch', 'N/A')
    timestamp = first_msg.get('timestamp', '')

    # Header
    md_lines.append(f"# Conversation: {session_id}")
    md_lines.append(f"\n**Date**: {format_timestamp(timestamp)}")
    md_lines.append(f"**Working Directory**: `{cwd}`")
    md_lines.append(f"**Git Branch**: `{git_branch}`")
    md_lines.append("\n---\n")

    # Process messages
    for msg in messages:
        msg_type = msg.get('type', '')

        # Skip system messages
        if msg_type in ['file-history-snapshot', 'queue-operation']:
            continue

        timestamp = format_timestamp(msg.get('timestamp', ''))

        if msg_type == 'user':
            message_obj = msg.get('message', {})
            content = extract_text_content(message_obj.get('content', ''))

            if content:
                md_lines.append(f"## 👤 User ({timestamp})\n")
                md_lines.append(f"{content}\n")

        elif msg_type == 'assistant':
            # Skip error messages
            if msg.get('error') or msg.get('isApiErrorMessage'):
                continue

            message_obj = msg.get('message', {})
            content = extract_text_content(message_obj.get('content', ''))

            # Check if it's an agent message
            is_agent = msg.get('isSidechain', False)
            agent_id = msg.get('agentId', '')

            if content:
                role = f"🤖 Agent ({agent_id})" if is_agent else "🤖 Assistant"
                md_lines.append(f"## {role} ({timestamp})\n")
                md_lines.append(f"{content}\n")

    return '\n'.join(md_lines)

def main():
    """Main function to process all JSONL files."""
    raw_dir = Path('raw')
    output_dir = Path('conversations')
    output_dir.mkdir(exist_ok=True)

    if not raw_dir.exists():
        print(f"Error: {raw_dir} directory not found")
        return

    jsonl_files = list(raw_dir.glob('*.jsonl'))
    print(f"Found {len(jsonl_files)} JSONL files")

    converted_count = 0
    skipped_count = 0

    for jsonl_file in jsonl_files:
        print(f"\nProcessing: {jsonl_file.name}")

        messages = parse_jsonl_file(jsonl_file)

        if not messages:
            print(f"  ⚠️  No messages found, skipping")
            skipped_count += 1
            continue

        if not is_meaningful_conversation(messages):
            print(f"  ⚠️  Not a meaningful conversation, skipping")
            skipped_count += 1
            continue

        # Extract session ID (filename without extension)
        session_id = jsonl_file.stem

        # Convert to markdown
        markdown_content = convert_to_markdown(messages, session_id)

        # Save to file
        output_file = output_dir / f"{session_id}.md"
        with open(output_file, 'w', encoding='utf-8') as f:
            f.write(markdown_content)

        print(f"  ✅ Converted to {output_file}")
        converted_count += 1

    print(f"\n{'='*60}")
    print(f"✅ Converted: {converted_count} conversations")
    print(f"⚠️  Skipped: {skipped_count} files")
    print(f"📁 Output directory: {output_dir.absolute()}")

if __name__ == '__main__':
    main()