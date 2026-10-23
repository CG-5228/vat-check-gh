'use client';
import { usePathname } from 'next/navigation';
import { useEffect, useRef } from 'react';

export default function Offline() {
  const pathname = usePathname();
  const savedResources = useRef(new Set<string>());

  useEffect(() => {
    if (!('serviceWorker' in navigator) || process.env.NODE_ENV !== 'production') return;
    void navigator.serviceWorker
      .register('/sw.js')
      .then(async () => {
        const registration = await navigator.serviceWorker.ready;
        // Client navigation requests an RSC payload, not the document needed for an offline reload.
        // Cache the canonical document on every route change, including routes reached by search.
        const canonicalUrl = new URL(pathname, location.origin).href;
        const resources = performance
          .getEntriesByType('resource')
          .map((entry) => entry.name)
          .filter((url) => new URL(url).origin === location.origin)
          .filter((url) => !savedResources.current.has(url));
        const urls = [...new Set([canonicalUrl, location.href, ...resources])];
        if (!registration.active) return;
        registration.active.postMessage({ type: 'CACHE_VISIT', urls });
        for (const resource of resources) savedResources.current.add(resource);
      })
      .catch(() => {});
  }, [pathname]);

  return null;
}
