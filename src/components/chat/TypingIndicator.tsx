'use client';

import React from 'react';
import { cn } from '@/utils';

interface TypingIndicatorProps {
  className?: string;
  usernames?: string[];
}

const TypingIndicator: React.FC<TypingIndicatorProps> = ({
  className,
  usernames = [],
}) => {
  if (usernames.length === 0) return null;

  const getTypingText = () => {
    if (usernames.length === 1) {
      return `${usernames[0]} is typing...`;
    } else if (usernames.length === 2) {
      return `${usernames[0]} and ${usernames[1]} are typing...`;
    } else {
      return `${usernames.slice(0, -1).join(', ')} and ${usernames[usernames.length - 1]} are typing...`;
    }
  };

  return (
    <div className={cn('flex justify-start w-full', className)}>
      <div className="message-bot flex items-center space-x-2">
        {/* Typing animation dots */}
        <div className="typing-indicator">
          <div className="typing-dot" style={{ '--delay': '0ms' } as React.CSSProperties} />
          <div className="typing-dot animation-delay-200" style={{ '--delay': '200ms' } as React.CSSProperties} />
          <div className="typing-dot animation-delay-400" style={{ '--delay': '400ms' } as React.CSSProperties} />
        </div>
        
        {/* Typing text */}
        <span className="text-sm text-gray-600 dark:text-gray-400 ml-2">
          {usernames.length > 0 ? getTypingText() : 'AI is typing...'}
        </span>
      </div>
    </div>
  );
};

export default TypingIndicator;