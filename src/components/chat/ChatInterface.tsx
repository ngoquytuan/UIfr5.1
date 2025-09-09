'use client';

import React from 'react';
import MessageList from './MessageList';
import MessageInput from './MessageInput';
import { useChatStore } from '@/stores/chatStore';
import { useAuthStore } from '@/stores/authStore';
import { cn } from '@/utils';

interface ChatInterfaceProps {
  className?: string;
}

const ChatInterface: React.FC<ChatInterfaceProps> = ({ className }) => {
  const { user } = useAuthStore();
  const {
    currentConversation,
    messages,
    messagesLoading,
    isTyping,
    typingUsers,
    sendMessage,
    deleteMessage,
  } = useChatStore();

  const handleSendMessage = async (content: string, files?: string[]) => {
    if (!currentConversation) return;
    await sendMessage(content, files);
  };

  const handleDeleteMessage = async (messageId: string) => {
    if (window.confirm('Are you sure you want to delete this message?')) {
      await deleteMessage(messageId);
    }
  };

  if (!currentConversation) {
    return (
      <div className={cn('flex-1 flex items-center justify-center bg-gray-50 dark:bg-gray-900', className)}>
        <div className="text-center">
          <div className="w-20 h-20 bg-gray-200 dark:bg-gray-700 rounded-full flex items-center justify-center mx-auto mb-6">
            <svg className="w-10 h-10 text-gray-400 dark:text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
            </svg>
          </div>
          <h2 className="text-xl font-semibold text-gray-900 dark:text-gray-100 mb-2">
            Welcome to RAG Chatbot
          </h2>
          <p className="text-gray-500 dark:text-gray-400 max-w-md">
            Select a conversation from the sidebar or start a new chat to begin interacting with the AI assistant.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className={cn('flex-1 flex flex-col h-full bg-white dark:bg-gray-900', className)}>
      {/* Chat header */}
      <div className="border-b border-gray-200 dark:border-gray-700 p-4">
        <div className="flex items-center justify-between">
          <div className="flex-1 min-w-0">
            <h2 className="text-lg font-semibold text-gray-900 dark:text-gray-100 truncate">
              {currentConversation.title}
            </h2>
            <div className="flex items-center space-x-4 mt-1">
              <span className="text-sm text-gray-500 dark:text-gray-400">
                {messages.length} messages
              </span>
              {currentConversation.metadata?.totalTokens && (
                <span className="text-sm text-gray-500 dark:text-gray-400">
                  {Math.round(currentConversation.metadata.totalTokens / 1000)}K tokens
                </span>
              )}
            </div>
          </div>

          {/* Chat actions */}
          <div className="flex items-center space-x-2">
            {/* Export button */}
            <button
              onClick={() => {
                // Handle export
                console.log('Export conversation');
              }}
              className="p-2 text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
              title="Export conversation"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
            </button>

            {/* Settings button */}
            <button
              onClick={() => {
                // Handle settings
                console.log('Open settings');
              }}
              className="p-2 text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
              title="Chat settings"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
              </svg>
            </button>
          </div>
        </div>
      </div>

      {/* Messages area */}
      <MessageList
        messages={messages}
        loading={messagesLoading}
        isTyping={isTyping}
        typingUsers={typingUsers}
        currentUserId={user?.id}
        onDeleteMessage={handleDeleteMessage}
        className="flex-1"
      />

      {/* Message input */}
      <MessageInput
        onSendMessage={handleSendMessage}
        currentConversationId={currentConversation.id}
        disabled={messagesLoading}
      />
    </div>
  );
};

export default ChatInterface;