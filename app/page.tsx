import { ConversationIndex } from '@/app/lib/types';
import ConversationCard from '@/app/components/ConversationCard';
import fs from 'fs';
import path from 'path';

async function getConversations(): Promise<ConversationIndex[]> {
  const indexPath = path.join(
    process.cwd(),
    'public',
    'conversations',
    'index.json'
  );

  try {
    const data = fs.readFileSync(indexPath, 'utf-8');
    return JSON.parse(data);
  } catch (error) {
    console.error('Failed to load conversations:', error);
    return [];
  }
}

export default async function Home() {
  const conversations = await getConversations();

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 dark:from-gray-950 dark:via-slate-900 dark:to-gray-900">
      {/* Hero Header */}
      <header className="relative overflow-hidden bg-white/80 dark:bg-gray-900/80 backdrop-blur-xl shadow-lg border-b border-gray-200/50 dark:border-gray-700/50">
        <div className="absolute inset-0 bg-gradient-to-r from-blue-500/5 via-purple-500/5 to-pink-500/5"></div>
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <div className="text-center">
            <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-gradient-to-br from-blue-500 to-purple-600 shadow-lg mb-4">
              <span className="text-3xl">💬</span>
            </div>
            <h1 className="text-5xl font-extrabold bg-gradient-to-r from-gray-900 via-blue-800 to-purple-900 dark:from-gray-100 dark:via-blue-200 dark:to-purple-200 bg-clip-text text-transparent mb-3">
              AI Prompt Conversations
            </h1>
            <p className="text-lg text-gray-600 dark:text-gray-300 max-w-2xl mx-auto">
              Browse and explore AI assistant conversation logs with style
            </p>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {conversations.length === 0 ? (
          <div className="text-center py-20">
            <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-gradient-to-br from-gray-100 to-gray-200 dark:from-gray-800 dark:to-gray-700 mb-6">
              <span className="text-4xl">📭</span>
            </div>
            <h2 className="text-2xl font-bold text-gray-900 dark:text-gray-100 mb-4">
              No conversations yet
            </h2>
            <p className="text-gray-600 dark:text-gray-400 text-lg mb-6 max-w-md mx-auto">
              Add JSONL files to get started
            </p>
            <div className="bg-white dark:bg-gray-800 rounded-xl p-6 max-w-2xl mx-auto shadow-lg border border-gray-200 dark:border-gray-700">
              <div className="space-y-3 text-left">
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  1. Add JSONL files to{' '}
                  <code className="bg-blue-100 dark:bg-blue-900/30 text-blue-800 dark:text-blue-300 px-2 py-1 rounded font-mono text-xs">
                    public/conversations/
                  </code>
                </p>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  2. Run{' '}
                  <code className="bg-purple-100 dark:bg-purple-900/30 text-purple-800 dark:text-purple-300 px-2 py-1 rounded font-mono text-xs">
                    npm run generate-index
                  </code>
                </p>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  3. Refresh the page
                </p>
              </div>
            </div>
          </div>
        ) : (
          <>
            <div className="mb-8 flex items-center justify-between">
              <div>
                <h2 className="text-2xl font-bold text-gray-900 dark:text-gray-100">
                  Conversations
                </h2>
                <p className="text-gray-600 dark:text-gray-400 mt-1">
                  {conversations.length} conversation
                  {conversations.length !== 1 ? 's' : ''} available
                </p>
              </div>
            </div>

            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
              {conversations.map((conversation, index) => (
                <div
                  key={conversation.id}
                  className="animate-fade-in"
                  style={{ animationDelay: `${index * 50}ms` }}
                >
                  <ConversationCard conversation={conversation} />
                </div>
              ))}
            </div>
          </>
        )}
      </main>

      {/* Footer */}
      <footer className="mt-20 border-t border-gray-200/50 dark:border-gray-700/50 bg-white/50 dark:bg-gray-900/50 backdrop-blur-lg">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 text-center">
          <p className="text-sm text-gray-600 dark:text-gray-400">
            Built with{' '}
            <span className="text-red-500 animate-pulse">❤️</span> using{' '}
            <span className="font-semibold text-gray-900 dark:text-gray-100">
              Next.js 15
            </span>
          </p>
          <div className="mt-4 flex items-center justify-center gap-6">
            <a
              href="https://github.com"
              className="text-gray-500 hover:text-gray-900 dark:text-gray-400 dark:hover:text-gray-100 transition-colors"
              target="_blank"
              rel="noopener noreferrer"
            >
              <span className="text-xl">🔗</span>
              <span className="ml-2 text-sm">GitHub</span>
            </a>
          </div>
        </div>
      </footer>
    </div>
  );
}
