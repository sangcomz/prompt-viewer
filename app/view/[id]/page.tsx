import { notFound } from 'next/navigation';
import Link from 'next/link';
import fs from 'fs';
import path from 'path';
import { parseConversationFile } from '@/app/lib/parser';
import MessageBubble from '@/app/components/MessageBubble';
import BackToTop from '@/app/components/BackToTop';

interface PageProps {
  params: Promise<{ id: string }>;
}

// Force static generation
export const dynamic = 'force-static';
export const dynamicParams = false;

export async function generateStaticParams() {
  const indexPath = path.join(
    process.cwd(),
    'public',
    'conversations',
    'index.json'
  );

  try {
    const indexData = fs.readFileSync(indexPath, 'utf-8');
    const conversations = JSON.parse(indexData);

    const params = conversations.map((conv: { id: string }) => ({
      id: conv.id,
    }));

    console.log('Generated static params from index.json:', params);
    return params;
  } catch (error) {
    console.error('Failed to generate static params:', error);

    // Fallback to reading directory
    try {
      const conversationsDir = path.join(
        process.cwd(),
        'public',
        'conversations'
      );
      const files = fs.readdirSync(conversationsDir);
      const jsonlFiles = files.filter(
        (file) => file.endsWith('.jsonl') && !file.startsWith('.')
      );

      const params = jsonlFiles.map((file) => ({
        id: file.replace('.jsonl', ''),
      }));

      console.log('Generated static params from directory:', params);
      return params;
    } catch (dirError) {
      console.error('Fallback also failed:', dirError);
      return [];
    }
  }
}

async function getConversation(id: string) {
  const conversationPath = path.join(
    process.cwd(),
    'public',
    'conversations',
    `${id}.jsonl`
  );

  try {
    const fileContent = fs.readFileSync(conversationPath, 'utf-8');
    return parseConversationFile(fileContent, id);
  } catch (error) {
    console.error(`Failed to load conversation ${id}:`, error);
    return null;
  }
}

export default async function ConversationViewPage({ params }: PageProps) {
  const { id } = await params;
  const conversation = await getConversation(id);

  if (!conversation || conversation.messages.length === 0) {
    notFound();
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 dark:from-gray-950 dark:via-slate-900 dark:to-gray-900">
      {/* Header */}
      <header className="bg-white/90 dark:bg-gray-900/90 backdrop-blur-xl shadow-lg border-b border-gray-200/50 dark:border-gray-700/50 sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-5">
          <div className="flex items-center justify-between">
            <Link
              href="/"
              className="group inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-gradient-to-r from-blue-500 to-purple-600 text-white font-medium hover:from-blue-600 hover:to-purple-700 transition-all duration-200 shadow-md hover:shadow-lg"
            >
              <svg
                className="w-5 h-5 transform group-hover:-translate-x-1 transition-transform"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M10 19l-7-7m0 0l7-7m-7 7h18"
                />
              </svg>
              Back
            </Link>

            <div className="flex items-center gap-2 px-4 py-2 rounded-xl bg-gray-100 dark:bg-gray-800 shadow-sm">
              <span className="text-lg">💬</span>
              <span className="text-sm font-semibold text-gray-700 dark:text-gray-300">
                {conversation.messages.length} messages
              </span>
            </div>
          </div>
        </div>
      </header>

      {/* Metadata Banner */}
      {(conversation.metadata.cwd !== 'N/A' ||
        conversation.metadata.gitBranch !== 'N/A') && (
        <div className="bg-gradient-to-r from-blue-50 via-purple-50 to-pink-50 dark:from-blue-950/20 dark:via-purple-950/20 dark:to-pink-950/20 border-b border-gray-200/50 dark:border-gray-700/50">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
            <div className="flex flex-wrap gap-4 text-sm">
              {conversation.metadata.cwd !== 'N/A' && (
                <div className="flex items-center gap-2 px-3 py-2 rounded-lg bg-white/80 dark:bg-gray-800/80 shadow-sm">
                  <span className="font-semibold text-gray-700 dark:text-gray-300">
                    📁 Working Directory:
                  </span>
                  <code className="bg-gray-100 dark:bg-gray-700 px-2 py-1 rounded font-mono text-xs">
                    {conversation.metadata.cwd}
                  </code>
                </div>
              )}
              {conversation.metadata.gitBranch !== 'N/A' && (
                <div className="flex items-center gap-2 px-3 py-2 rounded-lg bg-white/80 dark:bg-gray-800/80 shadow-sm">
                  <span className="font-semibold text-gray-700 dark:text-gray-300">
                    🌿 Git Branch:
                  </span>
                  <code className="bg-gray-100 dark:bg-gray-700 px-2 py-1 rounded font-mono text-xs">
                    {conversation.metadata.gitBranch}
                  </code>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Messages */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="space-y-2">
          {conversation.messages.map((message, index) => (
            <MessageBubble key={index} message={message} />
          ))}
        </div>
      </main>

      {/* Back to Top Button */}
      <BackToTop />
    </div>
  );
}
