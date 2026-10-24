'use client';
import { useEffect } from 'react';

export default function Offline() {
  useEffect(() => {
    if (!('serviceWorker' in navigator) || process.env.NODE_ENV !== 'production') return;
    // Installation saves one complete revision; updates wait until existing tabs close.
    void navigator.serviceWorker.register('/sw.js').catch(() => {});
  }, []);
  return null;
}
