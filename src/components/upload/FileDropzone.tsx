'use client';

import React, { useCallback, useState } from 'react';
import { useDropzone } from 'react-dropzone';
import { Button } from '@/components/ui';
import { cn, formatFileSize, isValidFileType, isValidFileSize } from '@/utils';
import { FILE_CONFIG, ERROR_MESSAGES } from '@/constants';
import type { FileUpload } from '@/types';

interface FileDropzoneProps {
  onFileSelect: (files: File[]) => void;
  onError?: (error: string) => void;
  disabled?: boolean;
  multiple?: boolean;
  className?: string;
}

const FileDropzone: React.FC<FileDropzoneProps> = ({
  onFileSelect,
  onError,
  disabled = false,
  multiple = true,
  className,
}) => {
  const [isDragActive, setIsDragActive] = useState(false);

  const validateFiles = (files: File[]): { valid: File[]; errors: string[] } => {
    const valid: File[] = [];
    const errors: string[] = [];

    files.forEach((file) => {
      if (!isValidFileType(file, FILE_CONFIG.ALLOWED_TYPES)) {
        errors.push(`${file.name}: ${ERROR_MESSAGES.INVALID_FILE_TYPE}`);
        return;
      }

      if (!isValidFileSize(file, FILE_CONFIG.MAX_SIZE)) {
        errors.push(`${file.name}: ${ERROR_MESSAGES.FILE_TOO_LARGE}`);
        return;
      }

      valid.push(file);
    });

    return { valid, errors };
  };

  const onDrop = useCallback((acceptedFiles: File[], rejectedFiles: any[]) => {
    setIsDragActive(false);

    if (disabled) return;

    let allFiles = [...acceptedFiles];
    const errors: string[] = [];

    // Handle rejected files
    rejectedFiles.forEach((rejected) => {
      rejected.errors.forEach((error: any) => {
        if (error.code === 'file-invalid-type') {
          errors.push(`${rejected.file.name}: ${ERROR_MESSAGES.INVALID_FILE_TYPE}`);
        } else if (error.code === 'file-too-large') {
          errors.push(`${rejected.file.name}: ${ERROR_MESSAGES.FILE_TOO_LARGE}`);
        }
      });
    });

    // Validate accepted files
    const { valid, errors: validationErrors } = validateFiles(allFiles);
    errors.push(...validationErrors);

    if (errors.length > 0) {
      onError?.(errors.join('\n'));
    }

    if (valid.length > 0) {
      onFileSelect(valid);
    }
  }, [disabled, onFileSelect, onError]);

  const onDragEnter = useCallback(() => {
    if (!disabled) {
      setIsDragActive(true);
    }
  }, [disabled]);

  const onDragLeave = useCallback(() => {
    setIsDragActive(false);
  }, []);

  const { getRootProps, getInputProps, open } = useDropzone({
    onDrop,
    onDragEnter,
    onDragLeave,
    disabled,
    multiple,
    accept: {
      'application/pdf': ['.pdf'],
      'application/msword': ['.doc'],
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document': ['.docx'],
      'text/plain': ['.txt'],
      'text/markdown': ['.md'],
    },
    maxSize: FILE_CONFIG.MAX_SIZE,
    noClick: true, // We'll handle click manually
  });

  return (
    <div
      {...getRootProps()}
      className={cn(
        'upload-area relative border-2 border-dashed rounded-lg p-6 text-center transition-colors cursor-pointer',
        isDragActive && 'drag-over',
        disabled && 'opacity-50 cursor-not-allowed',
        className
      )}
    >
      <input {...getInputProps()} />
      
      <div className="space-y-4">
        {/* Upload icon */}
        <div className="mx-auto w-12 h-12 text-gray-400 dark:text-gray-600">
          <svg className="w-full h-full" fill="none" stroke="currentColor" viewBox="0 0 48 48">
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={1}
              d="M28 8H12a4 4 0 00-4 4v20m32-12v8m0 0v8a4 4 0 01-4 4H12a4 4 0 01-4-4v-4m32-4l-3.172-3.172a4 4 0 00-5.656 0L28 28M8 32l9.172-9.172a4 4 0 015.656 0L28 28m0 0l4 4m4-24h8m-4-4v8m-12 4h.02"
            />
          </svg>
        </div>

        {/* Upload text */}
        <div className="space-y-2">
          <p className="text-lg font-medium text-gray-900 dark:text-gray-100">
            {isDragActive ? 'Drop files here' : 'Drag & drop files here'}
          </p>
          <p className="text-sm text-gray-500 dark:text-gray-400">
            or{' '}
            <Button
              variant="ghost"
              size="sm"
              onClick={open}
              disabled={disabled}
              className="p-0 h-auto font-medium text-primary-600 hover:text-primary-700 underline"
            >
              browse files
            </Button>
          </p>
        </div>

        {/* File type info */}
        <div className="text-xs text-gray-400 dark:text-gray-500 space-y-1">
          <p>
            Supported: {FILE_CONFIG.ALLOWED_TYPES.join(', ').toUpperCase()}
          </p>
          <p>
            Max size: {formatFileSize(FILE_CONFIG.MAX_SIZE)}
          </p>
        </div>
      </div>

      {/* Overlay for drag state */}
      {isDragActive && (
        <div className="absolute inset-0 bg-primary-500 bg-opacity-10 rounded-lg flex items-center justify-center">
          <div className="text-center">
            <div className="w-16 h-16 mx-auto mb-4 text-primary-500">
              <svg className="w-full h-full" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
              </svg>
            </div>
            <p className="text-lg font-medium text-primary-700 dark:text-primary-300">
              Drop files to upload
            </p>
          </div>
        </div>
      )}
    </div>
  );
};

export default FileDropzone;