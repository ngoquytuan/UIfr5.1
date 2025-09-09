import type { Metadata } from 'next';
import './globals.css';
import { APP_CONFIG } from '@/constants';

export const metadata: Metadata = {
  title: APP_CONFIG.NAME,
  description: 'A modern chat interface for RAG-powered AI conversations',
  keywords: ['RAG', 'AI', 'Chat', 'Assistant', 'Document Query'],
  authors: [{ name: 'RAG Team' }],
  viewport: 'width=device-width, initial-scale=1',
  themeColor: [
    { media: '(prefers-color-scheme: light)', color: '#3b82f6' },
    { media: '(prefers-color-scheme: dark)', color: '#1e40af' }
  ],
  icons: {
    icon: '/favicon.ico',
    apple: '/apple-touch-icon.png',
  },
  manifest: '/manifest.json',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
      </head>
      <body className="font-sans antialiased">
        <div id="root">{children}</div>
        <div id="modal-root" />
      </body>
    </html>
  );
}