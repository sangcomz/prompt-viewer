import Link from 'next/link';
import { ConversationIndex } from '@/app/lib/types';

interface ConversationCardProps {
  conversation: ConversationIndex;
}

export default function ConversationCard({
  conversation,
}: ConversationCardProps) {
  return (
    <Link
      href={`/view/${conversation.id}`}
      className="group block relative bg-white dark:bg-gray-800 rounded-2xl shadow-lg hover:shadow-2xl transition-all duration-300 overflow-hidden border border-gray-200/80 dark:border-gray-700/80 hover:border-transparent hover:scale-105"
    >
      {/* Gradient overlay on hover */}
      <div className="absolute inset-0 bg-gradient-to-br from-blue-500/0 via-purple-500/0 to-pink-500/0 group-hover:from-blue-500/5 group-hover:via-purple-500/5 group-hover:to-pink-500/5 transition-all duration-300"></div>

      {/* Accent bar */}
      <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-blue-500 via-purple-500 to-pink-500 transform scale-x-0 group-hover:scale-x-100 transition-transform duration-300 origin-left"></div>

      <div className="relative p-6">
        {/* Title */}
        <h3 className="text-xl font-bold text-gray-900 dark:text-gray-100 mb-3 line-clamp-2 group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">
          {conversation.title}
        </h3>

        {/* Description */}
        <p className="text-gray-600 dark:text-gray-400 text-sm mb-4 line-clamp-3 leading-relaxed">
          {conversation.description}
        </p>

        {/* Metadata */}
        <div className="flex flex-wrap gap-2 mb-4">
          {conversation.aiName && (
            <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold bg-gradient-to-r from-purple-100 to-pink-200 text-purple-800 dark:from-purple-900/40 dark:to-pink-800/40 dark:text-purple-300 shadow-sm">
              🤖 {conversation.aiName}
            </span>
          )}
          <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold bg-gradient-to-r from-blue-100 to-blue-200 text-blue-800 dark:from-blue-900/40 dark:to-blue-800/40 dark:text-blue-300 shadow-sm">
            💬 {conversation.messageCount} messages
          </span>
          {conversation.gitBranch !== 'N/A' && (
            <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold bg-gradient-to-r from-green-100 to-emerald-200 text-green-800 dark:from-green-900/40 dark:to-emerald-800/40 dark:text-green-300 shadow-sm">
              🌿 {conversation.gitBranch}
            </span>
          )}
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between text-xs text-gray-500 dark:text-gray-400 pt-4 border-t border-gray-200/50 dark:border-gray-700/50">
          <span className="flex items-center gap-1">
            📅 <span className="font-medium">{conversation.date}</span>
          </span>
          {conversation.cwd !== 'N/A' && (
            <span className="truncate ml-2 max-w-xs flex items-center gap-1" title={conversation.cwd}>
              📁 <span className="font-medium">{conversation.cwd.split('/').pop()}</span>
            </span>
          )}
        </div>

        {/* Hover arrow indicator */}
        <div className="absolute bottom-4 right-4 opacity-0 group-hover:opacity-100 transform translate-x-2 group-hover:translate-x-0 transition-all duration-300">
          <svg
            className="w-5 h-5 text-blue-500 dark:text-blue-400"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M13 7l5 5m0 0l-5 5m5-5H6"
            />
          </svg>
        </div>
      </div>
    </Link>
  );
}
