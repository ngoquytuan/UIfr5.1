'use client';

import React, { useState } from 'react';
import { Button, Input } from '@/components/ui';
import { useChatStore } from '@/stores/chatStore';
import { cn, formatRelativeTime, truncateText } from '@/utils';
import { FEATURES } from '@/constants';

const Sidebar: React.FC = () => {
  const {
    conversations,
    currentConversation,
    sidebarOpen,
    setSidebarOpen,
    selectConversation,
    createConversation,
    deleteConversation,
    searchQuery,
    setSearchQuery,
  } = useChatStore();

  const [isCreating, setIsCreating] = useState(false);

  const handleNewChat = async () => {
    setIsCreating(true);
    try {
      await createConversation();
    } finally {
      setIsCreating(false);
    }
  };

  const handleDeleteConversation = async (conversationId: string, e: React.MouseEvent) => {
    e.stopPropagation();
    if (window.confirm('Are you sure you want to delete this conversation?')) {
      await deleteConversation(conversationId);
    }
  };

  const filteredConversations = conversations.filter((conversation) =>
    conversation.title.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <>
      {/* Mobile overlay */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 bg-black bg-opacity-50 z-40 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Sidebar */}
      <div
        className={cn(
          'fixed left-0 top-16 bottom-0 w-80 bg-white dark:bg-gray-800 border-r border-gray-200 dark:border-gray-700 transform transition-transform duration-200 ease-in-out z-50 lg:relative lg:top-0 lg:translate-x-0',
          sidebarOpen ? 'translate-x-0' : '-translate-x-full'
        )}
      >
        <div className="h-full flex flex-col">
          {/* Header */}
          <div className="p-4 border-b border-gray-200 dark:border-gray-700">
            <Button
              onClick={handleNewChat}
              loading={isCreating}
              className="w-full justify-center"
              size="md"
            >
              <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
              </svg>
              New Chat
            </Button>

            {/* Search */}
            {FEATURES.SEARCH && (
              <div className="mt-3">
                <div className="relative">
                  <Input
                    type="text"
                    placeholder="Search conversations..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="pl-10"
                  />
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                    </svg>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Conversations list */}
          <div className="flex-1 overflow-y-auto scrollbar-thin">
            {filteredConversations.length === 0 ? (
              <div className="p-4 text-center">
                <div className="text-gray-500 dark:text-gray-400 text-sm">
                  {searchQuery ? 'No conversations found' : 'No conversations yet'}
                </div>
                {!searchQuery && (
                  <p className="text-xs text-gray-400 dark:text-gray-500 mt-1">
                    Start a new chat to begin
                  </p>
                )}
              </div>
            ) : (
              <div className="p-2">
                {filteredConversations.map((conversation) => (
                  <div
                    key={conversation.id}
                    onClick={() => selectConversation(conversation.id)}
                    className={cn(
                      'group relative flex items-center p-3 rounded-lg cursor-pointer transition-colors hover:bg-gray-100 dark:hover:bg-gray-700',
                      currentConversation?.id === conversation.id &&
                        'bg-primary-50 dark:bg-primary-900/20 border-l-2 border-primary-500'
                    )}
                  >
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between">
                        <h3 className="text-sm font-medium text-gray-900 dark:text-gray-100 truncate">
                          {truncateText(conversation.title, 30)}
                        </h3>
                        <span className="text-xs text-gray-500 dark:text-gray-400 ml-2 flex-shrink-0">
                          {formatRelativeTime(new Date(conversation.updatedAt))}
                        </span>
                      </div>
                      
                      {conversation.messages.length > 0 && (
                        <p className="text-xs text-gray-600 dark:text-gray-400 truncate mt-1">
                          {truncateText(
                            conversation.messages[conversation.messages.length - 1]?.content || '',
                            50
                          )}
                        </p>
                      )}
                      
                      <div className="flex items-center justify-between mt-1">
                        <span className="text-xs text-gray-500 dark:text-gray-400">
                          {conversation.messages.length} messages
                        </span>
                        
                        {conversation.metadata?.totalTokens && (
                          <span className="text-xs text-gray-500 dark:text-gray-400">
                            {Math.round(conversation.metadata.totalTokens / 1000)}K tokens
                          </span>
                        )}
                      </div>
                    </div>

                    {/* Delete button */}
                    <button
                      onClick={(e) => handleDeleteConversation(conversation.id, e)}
                      className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 p-1 rounded-md hover:bg-red-100 dark:hover:bg-red-900/20 text-red-500 transition-all"
                      title="Delete conversation"
                    >
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                      </svg>
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Footer */}
          <div className="p-4 border-t border-gray-200 dark:border-gray-700">
            <div className="text-xs text-gray-500 dark:text-gray-400 text-center">
              {filteredConversations.length} conversation{filteredConversations.length !== 1 ? 's' : ''}
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default Sidebar;