'use client';

// ============================================
// APP PROVIDERS
// ============================================
// Wrap the app with all necessary context providers

import { type ReactNode } from 'react';

import { AuthProvider } from '@/client/lib/auth-context';

interface ProvidersProps {
  children: ReactNode;
}

export function Providers({ children }: ProvidersProps) {
  return <AuthProvider>{children}</AuthProvider>;
}
