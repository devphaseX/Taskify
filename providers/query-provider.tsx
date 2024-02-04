'use client';
import { useRef } from 'react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';

export const QueryProvider = ({ children }: { children: React.ReactNode }) => {
  const client = useRef(new QueryClient()).current;
  return <QueryClientProvider client={client}>{children}</QueryClientProvider>;
};
