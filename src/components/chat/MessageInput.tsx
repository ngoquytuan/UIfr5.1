'use client';

import React, { useState, useRef, useEffect } from 'react';
import { Button, Textarea } from '@/components/ui';
import { cn, debounce } from '@/utils';
import { CHAT_CONFIG, FEATURES } from '@/constants';
import wsService from '@/services/websocket';
import type { FileUpload } from '@/types';

interface MessageInputProps {
  onSendMessage: (content: string, files?: string[]) => void;
  disabled?: boolean;
  placeholder?: string;
  currentConversationId?: string;
  className?: string;
}

const MessageInput: React.FC<MessageInputProps> = ({
  onSendMessage,
  disabled = false,
  placeholder = 'Type your message...',
  currentConversationId,
  className,
}) => {
  const [message, setMessage] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [attachedFiles, setAttachedFiles] = useState<FileUpload[]>([]);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Auto-resize textarea
  useEffect(() => {
    const textarea = textareaRef.current;
    if (textarea) {
      textarea.style.height = 'auto';
      textarea.style.height = Math.min(textarea.scrollHeight, 200) + 'px';
    }
  }, [message]);

  // Debounced typing indicator
  const debouncedStopTyping = debounce(() => {
    if (currentConversationId && isTyping) {
      wsService.stopTyping(currentConversationId);
      setIsTyping(false);
    }
  }, CHAT_CONFIG.TYPING_INDICATOR_TIMEOUT);

  const handleInputChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const value = e.target.value;
    
    // Limit message length
    if (value.length <= CHAT_CONFIG.MAX_MESSAGE_LENGTH) {
      setMessage(value);
      
      // Handle typing indicator
      if (currentConversationId && value.trim() && !isTyping) {
        wsService.startTyping(currentConversationId);
        setIsTyping(true);
      }
      
      if (value.trim()) {
        debouncedStopTyping();
      } else if (isTyping) {
        wsService.stopTyping(currentConversationId!);
        setIsTyping(false);
      }
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  const handleSendMessage = () => {
    const trimmedMessage = message.trim();
    if (!trimmedMessage && attachedFiles.length === 0) return;
    if (disabled) return;

    // Stop typing indicator
    if (currentConversationId && isTyping) {
      wsService.stopTyping(currentConversationId);
      setIsTyping(false);
    }

    // Send message
    onSendMessage(
      trimmedMessage, 
      attachedFiles.map(f => f.id)
    );

    // Clear input
    setMessage('');
    setAttachedFiles([]);
    
    // Focus textarea
    textareaRef.current?.focus();
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files) return;

    // Handle file upload logic here
    // For now, we'll just add them to the attached files list
    Array.from(files).forEach((file) => {
      const fileUpload: FileUpload = {
        id: Math.random().toString(36).substring(2),
        name: file.name,
        size: file.size,
        type: file.type,
        url: '', // Will be set after upload
        uploadedAt: new Date(),
        status: 'uploading',
      };
      
      setAttachedFiles(prev => [...prev, fileUpload]);
    });

    // Clear file input
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const removeAttachedFile = (fileId: string) => {
    setAttachedFiles(prev => prev.filter(f => f.id !== fileId));
  };

  const canSend = message.trim() || attachedFiles.length > 0;
  const remainingChars = CHAT_CONFIG.MAX_MESSAGE_LENGTH - message.length;

  return (
    <div className={cn('border-t border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800', className)}>
      {/* Attached files */}
      {attachedFiles.length > 0 && (
        <div className="p-3 border-b border-gray-200 dark:border-gray-700">
          <div className="flex flex-wrap gap-2">
            {attachedFiles.map((file) => (
              <div
                key={file.id}
                className="flex items-center space-x-2 bg-gray-100 dark:bg-gray-700 rounded-lg px-3 py-2 text-sm"
              >
                <svg className="w-4 h-4 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
                <span className="truncate max-w-32">{file.name}</span>
                <button
                  onClick={() => removeAttachedFile(file.id)}
                  className="text-red-500 hover:text-red-700"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Input area */}
      <div className="p-4">
        <div className="flex items-end space-x-3">
          {/* File upload */}
          {FEATURES.FILE_UPLOAD && (
            <div>
              <input
                ref={fileInputRef}
                type="file"
                multiple
                accept=".pdf,.doc,.docx,.txt,.md"
                onChange={handleFileSelect}
                className="hidden"
              />
              <Button
                variant="ghost"
                size="sm"
                onClick={() => fileInputRef.current?.click()}
                disabled={disabled}
                className="p-2"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.172 7l-6.586 6.586a2 2 0 102.828 2.828l6.414-6.586a4 4 0 00-5.656-5.656l-6.415 6.585a6 6 0 108.486 8.486L20.5 13" />
                </svg>
              </Button>
            </div>
          )}

          {/* Text input */}
          <div className="flex-1">
            <Textarea
              ref={textareaRef}
              value={message}
              onChange={handleInputChange}
              onKeyDown={handleKeyDown}
              placeholder={placeholder}
              disabled={disabled}
              className="resize-none min-h-[44px] max-h-[200px] py-3"
              rows={1}
            />
            
            {/* Character count */}
            {remainingChars < 100 && (
              <div className={cn(
                'text-xs mt-1',
                remainingChars < 0 ? 'text-red-500' : 'text-gray-500 dark:text-gray-400'
              )}>
                {remainingChars} characters remaining
              </div>
            )}
          </div>

          {/* Send button */}
          <Button
            onClick={handleSendMessage}
            disabled={disabled || !canSend}
            className="px-4 py-3"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
            </svg>
          </Button>
        </div>
      </div>
    </div>
  );
};

export default MessageInput;