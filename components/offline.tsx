'use client';
import { useEffect } from 'react';
export default function Offline() {
  useEffect(() => {
    if (!('serviceWorker' in navigator) || process.env.NODE_ENV !== 'production') return;
    void navigator.serviceWorker
      .register('/sw.js')
      .then(async () => {
        const registration = await navigator.serviceWorker.ready;
        const urls = [
          location.href,
          ...performance.getEntriesByType('resource').map((entry) => entry.name),
        ].filter((url) => new URL(url).origin === location.origin);
        registration.active?.postMessage({ type: 'CACHE_VISIT', urls });
      })
      .catch(() => {});
  }, []);
  return null;
}
