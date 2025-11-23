'use client';

import { ParsedMessage } from '@/app/lib/types';
import { formatTimestamp } from '@/app/lib/parser';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import rehypeHighlight from 'rehype-highlight';
import 'highlight.js/styles/github-dark.css';
import { useState } from 'react';

interface MessageBubbleProps {
  message: ParsedMessage;
}

export default function MessageBubble({ message }: MessageBubbleProps) {
  const [isExpanded, setIsExpanded] = useState(false);
  const isUser = message.role === 'user';
  const isAgent = message.isAgent;
  const isContext = message.role === 'context';

  const bgColor = isContext
    ? 'bg-gradient-to-br from-amber-50 to-orange-50 dark:from-amber-950/20 dark:to-orange-950/20'
    : isUser
    ? 'bg-gradient-to-br from-blue-50 to-indigo-50 dark:from-blue-950/30 dark:to-indigo-950/30'
    : isAgent
    ? 'bg-gradient-to-br from-purple-50 to-pink-50 dark:from-purple-950/30 dark:to-pink-950/30'
    : 'bg-gradient-to-br from-gray-50 to-slate-50 dark:from-gray-900/50 dark:to-slate-900/50';

  const borderColor = isContext
    ? 'border-l-orange-500'
    : isUser
    ? 'border-l-blue-500'
    : isAgent
    ? 'border-l-purple-500'
    : 'border-l-gray-400';

  const icon = isContext ? '📋' : isUser ? '👤' : isAgent ? '🤖' : '✨';
  const roleName = isContext
    ? 'Context Summary'
    : isUser
    ? 'User'
    : isAgent
    ? `Agent ${message.agentId || ''}`
    : 'Assistant';

  return (
    <div
      className={`flex ${isUser ? 'justify-end' : 'justify-start'} mb-8 animate-fade-in`}
    >
      <div
        className={`max-w-5xl w-full ${bgColor} border-l-4 ${borderColor} rounded-2xl p-6 shadow-lg hover:shadow-xl transition-all duration-200 ${
          isContext ? 'cursor-pointer' : ''
        }`}
        onClick={isContext ? () => setIsExpanded(!isExpanded) : undefined}
      >
        {/* Header */}
        <div className="flex items-center justify-between mb-4 pb-3 border-b border-gray-200/50 dark:border-gray-700/50">
          <div className="flex items-center gap-3">
            <div className="flex items-center justify-center w-10 h-10 rounded-xl bg-white/80 dark:bg-gray-800/80 shadow-sm">
              <span className="text-2xl">{icon}</span>
            </div>
            <div>
              <span className="font-bold text-gray-900 dark:text-gray-100 block">
                {roleName}
              </span>
              <time className="text-xs text-gray-500 dark:text-gray-400">
                {formatTimestamp(message.timestamp)}
              </time>
            </div>
          </div>
          {isContext && (
            <button
              className="text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200 transition-transform duration-200"
              style={{
                transform: isExpanded ? 'rotate(180deg)' : 'rotate(0deg)',
              }}
            >
              <svg
                className="w-6 h-6"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M19 9l-7 7-7-7"
                />
              </svg>
            </button>
          )}
        </div>

        {/* Content */}
        {(!isContext || isExpanded) && (
          <div className="prose prose-base dark:prose-invert max-w-none prose-headings:font-bold prose-p:leading-relaxed prose-pre:shadow-lg prose-code:text-sm">
            <ReactMarkdown
              remarkPlugins={[remarkGfm]}
              rehypePlugins={[rehypeHighlight]}
              components={{
                // Customize code blocks
                pre: ({ children }) => (
                  <pre className="bg-gradient-to-br from-gray-900 to-gray-800 rounded-xl p-5 overflow-x-auto my-4 shadow-xl border border-gray-700">
                    {children}
                  </pre>
                ),
                code: ({ className, children, ...props }) => {
                  const inline = !className;
                  return inline ? (
                    <code
                      className="bg-white/60 dark:bg-gray-800/60 px-2 py-0.5 rounded-md text-sm font-mono shadow-sm"
                      {...props}
                    >
                      {children}
                    </code>
                  ) : (
                    <code className={className} {...props}>
                      {children}
                    </code>
                  );
                },
                // Style links
                a: ({ children, href }) => (
                  <a
                    href={href}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300 underline decoration-2 underline-offset-2 transition-colors"
                  >
                    {children}
                  </a>
                ),
                // Style blockquotes
                blockquote: ({ children }) => (
                  <blockquote className="border-l-4 border-blue-500 pl-4 italic bg-blue-50/50 dark:bg-blue-950/20 py-2 rounded-r-lg">
                    {children}
                  </blockquote>
                ),
              }}
            >
              {message.content}
            </ReactMarkdown>
          </div>
        )}

        {/* Collapsed preview */}
        {isContext && !isExpanded && (
          <div className="text-sm text-gray-600 dark:text-gray-400 italic">
            Click to expand context summary...
          </div>
        )}
      </div>
    </div>
  );
}
