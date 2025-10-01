"use client";

import { useEffect } from 'react';
import { setupGlobalErrorHandling } from '@/components/error-boundary';

export function ErrorHandler() {
  useEffect(() => {
    setupGlobalErrorHandling();
  }, []);

  return null;
}
