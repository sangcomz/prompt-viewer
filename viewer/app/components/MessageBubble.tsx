'use client';

import { ParsedMessage } from '@/app/lib/types';
import { formatTimestamp } from '@/app/lib/parser';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import rehypeHighlight from 'rehype-highlight';
import 'highlight.js/styles/github-dark.css';

interface MessageBubbleProps {
  message: ParsedMessage;
}

export default function MessageBubble({ message }: MessageBubbleProps) {
  const isUser = message.role === 'user';
  const isAgent = message.isAgent;

  const bgColor = isUser
    ? 'bg-gradient-to-br from-blue-50 to-indigo-50 dark:from-blue-950/30 dark:to-indigo-950/30'
    : isAgent
    ? 'bg-gradient-to-br from-purple-50 to-pink-50 dark:from-purple-950/30 dark:to-pink-950/30'
    : 'bg-gradient-to-br from-gray-50 to-slate-50 dark:from-gray-900/50 dark:to-slate-900/50';

  const borderColor = isUser
    ? 'border-l-blue-500'
    : isAgent
    ? 'border-l-purple-500'
    : 'border-l-gray-400';

  const icon = isUser ? '👤' : isAgent ? '🤖' : '✨';
  const roleName = isUser
    ? 'User'
    : isAgent
    ? `Agent ${message.agentId || ''}`
    : 'Assistant';

  return (
    <div
      className={`flex ${isUser ? 'justify-end' : 'justify-start'} mb-8 animate-fade-in`}
    >
      <div
        className={`max-w-5xl w-full ${bgColor} border-l-4 ${borderColor} rounded-2xl p-6 shadow-lg hover:shadow-xl transition-all duration-200`}
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
        </div>

        {/* Content */}
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
      </div>
    </div>
  );
}
