'use client';

import React, { useState } from 'react';
import { Modal, Button } from '@/components/ui';
import FileDropzone from './FileDropzone';
import UploadProgress from './UploadProgress';
import { apiService } from '@/services/api';
import { generateId } from '@/utils';
import type { FileUpload } from '@/types';

interface FileUploadModalProps {
  isOpen: boolean;
  onClose: () => void;
  onUploadComplete?: (files: FileUpload[]) => void;
  conversationId?: string;
}

const FileUploadModal: React.FC<FileUploadModalProps> = ({
  isOpen,
  onClose,
  onUploadComplete,
  conversationId,
}) => {
  const [uploadingFiles, setUploadingFiles] = useState<FileUpload[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [isUploading, setIsUploading] = useState(false);

  const handleFileSelect = async (files: File[]) => {
    setError(null);
    setIsUploading(true);

    const newUploads: FileUpload[] = files.map(file => ({
      id: generateId(),
      name: file.name,
      size: file.size,
      type: file.type,
      url: '',
      uploadedAt: new Date(),
      status: 'uploading',
    }));

    setUploadingFiles(newUploads);

    try {
      const uploadPromises = files.map(async (file, index) => {
        const uploadData = newUploads[index];
        
        try {
          const response = await apiService.uploadFile(file, conversationId);
          
          if (response.success && response.data) {
            const updatedFile: FileUpload = {
              ...uploadData,
              ...response.data,
              status: 'uploaded',
            };
            
            setUploadingFiles(prev => 
              prev.map(f => f.id === uploadData.id ? updatedFile : f)
            );
            
            return updatedFile;
          } else {
            throw new Error(response.error || 'Upload failed');
          }
        } catch (error) {
          const errorMessage = error instanceof Error ? error.message : 'Upload failed';
          
          setUploadingFiles(prev => 
            prev.map(f => f.id === uploadData.id ? {
              ...f,
              status: 'error',
              metadata: { ...f.metadata, processingError: errorMessage }
            } : f)
          );
          
          throw error;
        }
      });

      const results = await Promise.allSettled(uploadPromises);
      const successfulUploads = results
        .filter((result): result is PromiseFulfilledResult<FileUpload> => 
          result.status === 'fulfilled'
        )
        .map(result => result.value);

      const failedUploads = results.filter(result => result.status === 'rejected');

      if (failedUploads.length > 0) {
        setError(`${failedUploads.length} file(s) failed to upload`);
      }

      if (successfulUploads.length > 0) {
        onUploadComplete?.(successfulUploads);
      }

    } catch (error) {
      setError('Upload failed. Please try again.');
      console.error('Upload error:', error);
    } finally {
      setIsUploading(false);
    }
  };

  const handleError = (errorMessage: string) => {
    setError(errorMessage);
  };

  const handleClose = () => {
    if (!isUploading) {
      setUploadingFiles([]);
      setError(null);
      onClose();
    }
  };

  const handleRetryUpload = (fileId: string) => {
    // Find the original file and retry upload
    const fileToRetry = uploadingFiles.find(f => f.id === fileId);
    if (fileToRetry) {
      // Reset status to uploading
      setUploadingFiles(prev => 
        prev.map(f => f.id === fileId ? { ...f, status: 'uploading' } : f)
      );
      
      // In a real implementation, you'd need to store the original File objects
      // to retry the upload. For now, we'll just show that it's uploading again.
    }
  };

  const handleRemoveFile = (fileId: string) => {
    setUploadingFiles(prev => prev.filter(f => f.id !== fileId));
  };

  const allUploadsComplete = uploadingFiles.length > 0 && 
    uploadingFiles.every(f => f.status === 'uploaded' || f.status === 'error');

  return (
    <Modal
      isOpen={isOpen}
      onClose={handleClose}
      title="Upload Files"
      size="lg"
    >
      <div className="space-y-6">
        {/* Error message */}
        {error && (
          <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 text-red-600 dark:text-red-400 px-4 py-3 rounded-lg text-sm">
            {error}
          </div>
        )}

        {/* File dropzone */}
        {uploadingFiles.length === 0 && (
          <FileDropzone
            onFileSelect={handleFileSelect}
            onError={handleError}
            disabled={isUploading}
            multiple={true}
          />
        )}

        {/* Upload progress */}
        {uploadingFiles.length > 0 && (
          <UploadProgress
            files={uploadingFiles}
            onRetry={handleRetryUpload}
            onRemove={handleRemoveFile}
          />
        )}

        {/* Upload instructions */}
        <div className="text-sm text-gray-600 dark:text-gray-400 space-y-2">
          <h4 className="font-medium text-gray-900 dark:text-gray-100">
            Upload Guidelines:
          </h4>
          <ul className="list-disc list-inside space-y-1 text-sm">
            <li>Supported formats: PDF, DOC, DOCX, TXT, MD</li>
            <li>Maximum file size: 10MB per file</li>
            <li>Files will be processed for content extraction</li>
            <li>Processing may take a few moments for large files</li>
          </ul>
        </div>

        {/* Action buttons */}
        <div className="flex justify-between items-center pt-4 border-t border-gray-200 dark:border-gray-700">
          <div className="text-sm text-gray-500 dark:text-gray-400">
            {uploadingFiles.length > 0 && (
              <>
                {uploadingFiles.filter(f => f.status === 'uploaded').length} of {uploadingFiles.length} uploaded
              </>
            )}
          </div>
          
          <div className="flex space-x-3">
            {uploadingFiles.length > 0 && !isUploading && (
              <Button
                variant="ghost"
                onClick={() => setUploadingFiles([])}
              >
                Clear
              </Button>
            )}
            
            <Button
              variant="secondary"
              onClick={handleClose}
              disabled={isUploading}
            >
              {allUploadsComplete ? 'Done' : 'Cancel'}
            </Button>
            
            {uploadingFiles.length > 0 && allUploadsComplete && (
              <Button onClick={handleClose}>
                Continue
              </Button>
            )}
          </div>
        </div>
      </div>
    </Modal>
  );
};

export default FileUploadModal;