'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { MainLayout } from '@/components/layout';
import { ChatInterface } from '@/components/chat';
import { useAuthStore } from '@/stores/authStore';
import { LoadingSpinner } from '@/components/ui';

export default function HomePage() {
  const router = useRouter();
  const { isAuthenticated, isLoading, getCurrentUser } = useAuthStore();

  useEffect(() => {
    // Check authentication status
    getCurrentUser();
  }, []);

  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      router.push('/login');
    }
  }, [isAuthenticated, isLoading, router]);

  if (isLoading) {
    return (
      <div className="h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900">
        <div className="flex flex-col items-center space-y-4">
          <LoadingSpinner size="lg" />
          <p className="text-gray-600 dark:text-gray-400">Loading...</p>
        </div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return null; // Will redirect to login
  }

  return (
    <MainLayout>
      <ChatInterface />
    </MainLayout>
  );
}