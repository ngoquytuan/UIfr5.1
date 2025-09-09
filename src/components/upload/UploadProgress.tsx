'use client';

import React from 'react';
import { Button, LoadingSpinner } from '@/components/ui';
import { cn, formatFileSize } from '@/utils';
import type { FileUpload } from '@/types';

interface UploadProgressProps {
  files: FileUpload[];
  onRetry?: (fileId: string) => void;
  onRemove?: (fileId: string) => void;
  className?: string;
}

const UploadProgress: React.FC<UploadProgressProps> = ({
  files,
  onRetry,
  onRemove,
  className,
}) => {
  const getStatusIcon = (file: FileUpload) => {
    switch (file.status) {
      case 'uploading':
        return <LoadingSpinner size="sm" />;
      case 'processing':
        return <LoadingSpinner size="sm" className="text-blue-500" />;
      case 'uploaded':
      case 'processed':
        return (
          <svg className="w-5 h-5 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
          </svg>
        );
      case 'error':
        return (
          <svg className="w-5 h-5 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
        );
      default:
        return null;
    }
  };

  const getStatusText = (file: FileUpload) => {
    switch (file.status) {
      case 'uploading':
        return 'Uploading...';
      case 'processing':
        return 'Processing...';
      case 'uploaded':
        return 'Uploaded';
      case 'processed':
        return 'Ready';
      case 'error':
        return file.metadata?.processingError || 'Upload failed';
      default:
        return 'Unknown';
    }
  };

  const getStatusColor = (file: FileUpload) => {
    switch (file.status) {
      case 'uploading':
      case 'processing':
        return 'text-blue-600 dark:text-blue-400';
      case 'uploaded':
      case 'processed':
        return 'text-green-600 dark:text-green-400';
      case 'error':
        return 'text-red-600 dark:text-red-400';
      default:
        return 'text-gray-600 dark:text-gray-400';
    }
  };

  const getProgressBarColor = (file: FileUpload) => {
    switch (file.status) {
      case 'uploading':
      case 'processing':
        return 'bg-blue-500';
      case 'uploaded':
      case 'processed':
        return 'bg-green-500';
      case 'error':
        return 'bg-red-500';
      default:
        return 'bg-gray-300';
    }
  };

  const getProgressWidth = (file: FileUpload) => {
    switch (file.status) {
      case 'uploading':
        return '60%'; // Simulated progress
      case 'processing':
        return '80%';
      case 'uploaded':
      case 'processed':
        return '100%';
      case 'error':
        return '100%';
      default:
        return '0%';
    }
  };

  return (
    <div className={cn('space-y-3', className)}>
      <h3 className="text-sm font-medium text-gray-900 dark:text-gray-100">
        Upload Progress
      </h3>
      
      <div className="space-y-3">
        {files.map((file) => (
          <div
            key={file.id}
            className="bg-gray-50 dark:bg-gray-800 rounded-lg p-4 border border-gray-200 dark:border-gray-700"
          >
            <div className="flex items-start justify-between">
              {/* File info */}
              <div className="flex items-start space-x-3 flex-1 min-w-0">
                {/* Status icon */}
                <div className="flex-shrink-0 mt-0.5">
                  {getStatusIcon(file)}
                </div>

                {/* File details */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between">
                    <p className="text-sm font-medium text-gray-900 dark:text-gray-100 truncate">
                      {file.name}
                    </p>
                    <span className="text-xs text-gray-500 dark:text-gray-400 ml-2">
                      {formatFileSize(file.size)}
                    </span>
                  </div>
                  
                  {/* Status text */}
                  <p className={cn('text-xs mt-1', getStatusColor(file))}>
                    {getStatusText(file)}
                  </p>

                  {/* Progress bar */}
                  <div className="mt-2">
                    <div className="w-full bg-gray-200 dark:bg-gray-600 rounded-full h-2">
                      <div
                        className={cn(
                          'h-2 rounded-full transition-all duration-300',
                          getProgressBarColor(file)
                        )}
                        style={{ width: getProgressWidth(file) }}
                      />
                    </div>
                  </div>

                  {/* File metadata */}
                  {file.metadata && (
                    <div className="mt-2 space-y-1">
                      {file.metadata.pages && (
                        <p className="text-xs text-gray-500 dark:text-gray-400">
                          {file.metadata.pages} pages
                        </p>
                      )}
                      {file.metadata.extractedText && (
                        <p className="text-xs text-gray-500 dark:text-gray-400">
                          {file.metadata.extractedText.length} characters extracted
                        </p>
                      )}
                    </div>
                  )}
                </div>
              </div>

              {/* Actions */}
              <div className="flex items-center space-x-2 ml-3">
                {file.status === 'error' && onRetry && (
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => onRetry(file.id)}
                    className="p-1 h-6 w-6"
                    title="Retry upload"
                  >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                    </svg>
                  </Button>
                )}

                {onRemove && (file.status === 'error' || file.status === 'uploaded') && (
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => onRemove(file.id)}
                    className="p-1 h-6 w-6 text-red-500 hover:text-red-600"
                    title="Remove file"
                  >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </Button>
                )}
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Summary */}
      <div className="text-xs text-gray-500 dark:text-gray-400 pt-2 border-t border-gray-200 dark:border-gray-600">
        <div className="flex justify-between">
          <span>
            {files.filter(f => f.status === 'uploaded' || f.status === 'processed').length} / {files.length} completed
          </span>
          <span>
            Total: {formatFileSize(files.reduce((acc, file) => acc + file.size, 0))}
          </span>
        </div>
      </div>
    </div>
  );
};

export default UploadProgress;