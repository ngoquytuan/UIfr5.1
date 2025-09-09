'use client';

import React, { useEffect, useRef } from 'react';
import { LoadingSpinner } from '@/components/ui';
import MessageBubble from './MessageBubble';
import TypingIndicator from './TypingIndicator';
import { cn } from '@/utils';
import type { Message } from '@/types';

interface MessageListProps {
  messages: Message[];
  loading?: boolean;
  isTyping?: boolean;
  typingUsers?: string[];
  currentUserId?: string;
  onDeleteMessage?: (messageId: string) => void;
  className?: string;
}

const MessageList: React.FC<MessageListProps> = ({
  messages,
  loading = false,
  isTyping = false,
  typingUsers = [],
  currentUserId,
  onDeleteMessage,
  className,
}) => {
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  // Auto-scroll to bottom when new messages arrive
  useEffect(() => {
    const scrollToBottom = () => {
      messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    };

    // Small delay to ensure DOM has updated
    const timeoutId = setTimeout(scrollToBottom, 100);
    return () => clearTimeout(timeoutId);
  }, [messages, isTyping]);

  // Handle scroll to maintain position when loading older messages
  const [isNearBottom, setIsNearBottom] = React.useState(true);

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    const handleScroll = () => {
      const { scrollTop, scrollHeight, clientHeight } = container;
      const distanceFromBottom = scrollHeight - scrollTop - clientHeight;
      setIsNearBottom(distanceFromBottom < 100);
    };

    container.addEventListener('scroll', handleScroll, { passive: true });
    return () => container.removeEventListener('scroll', handleScroll);
  }, []);

  if (loading && messages.length === 0) {
    return (
      <div className={cn('flex-1 flex items-center justify-center', className)}>
        <div className="flex flex-col items-center space-y-3">
          <LoadingSpinner size="lg" />
          <p className="text-sm text-gray-500 dark:text-gray-400">
            Loading messages...
          </p>
        </div>
      </div>
    );
  }

  if (messages.length === 0) {
    return (
      <div className={cn('flex-1 flex items-center justify-center p-8', className)}>
        <div className="text-center">
          <div className="w-16 h-16 bg-gray-100 dark:bg-gray-700 rounded-full flex items-center justify-center mx-auto mb-4">
            <svg className="w-8 h-8 text-gray-400 dark:text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
            </svg>
          </div>
          <h3 className="text-lg font-medium text-gray-900 dark:text-gray-100 mb-1">
            Start a conversation
          </h3>
          <p className="text-sm text-gray-500 dark:text-gray-400 max-w-sm">
            Send a message to begin chatting with the AI assistant.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div
      ref={containerRef}
      className={cn(
        'flex-1 overflow-y-auto scrollbar-thin p-4 space-y-4',
        className
      )}
    >
      {/* Loading indicator for older messages */}
      {loading && (
        <div className="flex justify-center py-4">
          <LoadingSpinner size="sm" />
        </div>
      )}

      {/* Messages */}
      {messages.map((message, index) => {
        const isOwn = message.type === 'user' || message.userId === currentUserId;
        const showTimestamp = index === 0 || 
          (new Date(message.timestamp).getTime() - new Date(messages[index - 1]?.timestamp).getTime()) > 300000; // 5 minutes

        return (
          <MessageBubble
            key={message.id}
            message={message}
            isOwn={isOwn}
            showTimestamp={showTimestamp}
            onDelete={onDeleteMessage}
          />
        );
      })}

      {/* Typing indicator */}
      {(isTyping || typingUsers.length > 0) && (
        <TypingIndicator usernames={typingUsers} />
      )}

      {/* Scroll anchor */}
      <div ref={messagesEndRef} />

      {/* Scroll to bottom button */}
      {!isNearBottom && (
        <button
          onClick={() => messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })}
          className="fixed bottom-24 right-8 w-10 h-10 bg-primary-500 hover:bg-primary-600 text-white rounded-full shadow-lg flex items-center justify-center transition-colors z-10"
          title="Scroll to bottom"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 14l-7 7m0 0l-7-7m7 7V3" />
          </svg>
        </button>
      )}
    </div>
  );
};

export default MessageList;