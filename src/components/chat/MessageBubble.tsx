'use client';

import React, { useState } from 'react';
import { Button, Dropdown } from '@/components/ui';
import { cn, formatDate, copyToClipboard } from '@/utils';
import type { Message } from '@/types';

interface MessageBubbleProps {
  message: Message;
  isOwn?: boolean;
  showTimestamp?: boolean;
  onDelete?: (messageId: string) => void;
  onCopy?: (content: string) => void;
}

const MessageBubble: React.FC<MessageBubbleProps> = ({
  message,
  isOwn = false,
  showTimestamp = false,
  onDelete,
  onCopy,
}) => {
  const [copied, setCopied] = useState(false);

  const handleCopy = async () => {
    const success = await copyToClipboard(message.content);
    if (success) {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
      onCopy?.(message.content);
    }
  };

  const menuItems = [
    {
      id: 'copy',
      label: copied ? 'Copied!' : 'Copy',
      icon: (
        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
        </svg>
      ),
      onClick: handleCopy,
      disabled: copied,
    },
  ];

  if (isOwn && onDelete) {
    menuItems.push({
      id: 'delete',
      label: 'Delete',
      icon: (
        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
        </svg>
      ),
      onClick: () => onDelete(message.id),
    });
  }

  const getBubbleClasses = () => {
    switch (message.type) {
      case 'user':
        return 'message-user';
      case 'assistant':
        return 'message-bot';
      case 'system':
        return 'message-system';
      default:
        return 'message-bot';
    }
  };

  const getMessageAlignment = () => {
    return message.type === 'user' ? 'justify-end' : 
           message.type === 'system' ? 'justify-center' : 'justify-start';
  };

  return (
    <div className={cn('flex w-full', getMessageAlignment())}>
      <div className="group relative max-w-[85%] md:max-w-[75%]">
        {/* Message bubble */}
        <div className={cn(getBubbleClasses(), 'relative')}>
          {/* Message content */}
          <div className="whitespace-pre-wrap break-words">
            {message.content}
          </div>

          {/* File attachments */}
          {message.metadata?.files && message.metadata.files.length > 0 && (
            <div className="mt-2 space-y-2">
              {message.metadata.files.map((file) => (
                <div
                  key={file.id}
                  className="flex items-center space-x-2 p-2 bg-black bg-opacity-10 rounded-md"
                >
                  <svg className="w-4 h-4 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                  </svg>
                  <span className="text-sm truncate">{file.name}</span>
                  <span className="text-xs opacity-75">({file.size})</span>
                </div>
              ))}
            </div>
          )}

          {/* Message metadata */}
          {message.metadata?.tokens && (
            <div className="mt-1 text-xs opacity-75">
              {message.metadata.tokens} tokens
            </div>
          )}

          {/* Menu button */}
          {message.type !== 'system' && (
            <div className="absolute -top-1 -right-1 opacity-0 group-hover:opacity-100 transition-opacity">
              <Dropdown
                trigger={
                  <Button
                    variant="ghost"
                    size="sm"
                    className="w-6 h-6 p-0 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-600 shadow-sm"
                  >
                    <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 12h.01M12 12h.01M19 12h.01M6 12a1 1 0 11-2 0 1 1 0 012 0zm7 0a1 1 0 11-2 0 1 1 0 012 0zm7 0a1 1 0 11-2 0 1 1 0 012 0z" />
                    </svg>
                  </Button>
                }
                items={menuItems}
                align="left"
              />
            </div>
          )}
        </div>

        {/* Timestamp */}
        {showTimestamp && (
          <div className={cn(
            'mt-1 text-xs text-gray-500 dark:text-gray-400',
            message.type === 'user' ? 'text-right' : 
            message.type === 'system' ? 'text-center' : 'text-left'
          )}>
            {formatDate(message.timestamp, {
              hour: '2-digit',
              minute: '2-digit',
              day: 'numeric',
              month: 'short',
            })}
          </div>
        )}
      </div>
    </div>
  );
};

export default MessageBubble;