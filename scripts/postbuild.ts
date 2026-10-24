import { readFile, writeFile, readdir, copyFile } from 'node:fs/promises';
import { createHash } from 'node:crypto';
import path from 'node:path';
import { ogFonts } from '../lib/og';
import { sourceDateLabel } from '../lib/source';
async function walk(dir: string): Promise<string[]> {
  const entries = await readdir(dir, { withFileTypes: true });
  return (
    await Promise.all(
      entries.map((e) =>
        e.isDirectory() ? walk(path.join(dir, e.name)) : Promise.resolve([path.join(dir, e.name)]),
      ),
    )
  ).flat();
}
const files = await walk('out');
const policies = [];
const vercelHeaders = [];
for (const file of files.filter((f) => f.endsWith('.html'))) {
  const html = await readFile(file, 'utf8');
  const hashes = [...html.matchAll(/<script\b(?![^>]*\bsrc=)[^>]*>([\s\S]*?)<\/script>/g)].map(
    (m) =>
      `'sha256-${createHash('sha256')
        .update(m[1] ?? '')
        .digest('base64')}'`,
  );
  const csp = `default-src 'self'; script-src 'self' ${[...new Set(hashes)].join(' ')}; style-src 'self' 'unsafe-inline'; img-src 'self' data: blob:; font-src 'self'; connect-src 'self'; worker-src 'self'; object-src 'none'; frame-src 'none'; base-uri 'self'; form-action 'self'; frame-ancestors 'none'`;
  const relative = file.replace(/^out/, '').replace(/index\.html$/, '');
  // Cloudflare Pages allows 100 header rules and 2,000 characters per line.
  // https://developers.cloudflare.com/pages/platform/limits/#headers
  // Both 404 aliases and overflow routes use
  // an equivalent meta policy; 99 content routes plus the common rule fit that limit.
  if (relative.startsWith('/404') || policies.length >= 99 || csp.length > 1900) {
    await writeFile(
      file,
      html.replace('<head>', `<head><meta http-equiv="Content-Security-Policy" content="${csp}">`),
    );
  } else {
    policies.push(`${relative}\n  Content-Security-Policy: ${csp}`);
  }
  vercelHeaders.push({
    source: relative,
    headers: [{ key: 'Content-Security-Policy', value: csp }],
  });
}
const common = [
  { key: 'X-Content-Type-Options', value: 'nosniff' },
  { key: 'Referrer-Policy', value: 'strict-origin-when-cross-origin' },
  { key: 'Permissions-Policy', value: 'camera=(), microphone=(), geolocation=()' },
  { key: 'X-Frame-Options', value: 'DENY' },
];
await writeFile(
  'out/_headers',
  `/*\n${common.map((h) => `  ${h.key}: ${h.value}`).join('\n')}\n\n${policies.join('\n\n')}\n`,
);
await writeFile(
  'vercel.json',
  JSON.stringify(
    {
      buildCommand: 'pnpm build',
      outputDirectory: 'out',
      framework: null,
      headers: [{ source: '/(.*)', headers: common }, ...vercelHeaders],
    },
    null,
    2,
  ) + '\n',
);
await copyFile('out/_headers', 'public/_headers');
const og = files.find((f) => /^out\/opengraph-image(?:\.png)?$/.test(f));
if (og && og !== 'out/opengraph-image.png') await copyFile(og, 'out/opengraph-image.png');

console.log(
  `Static export ready: ${files.filter((f) => f.endsWith('.html')).length} HTML pages, per-page script hashes, same-origin offline cache.`,
);
const { ImageResponse } = await import('next/og');
const fonts = await ogFonts();
const { createElement } = await import('react');
const { merchants, merchantName } = await import('../lib/merchants');
for (const item of [
  ...merchants.map((merchant) => ({
    slug: merchant.slug,
    name: merchantName(merchant),
    listed: true,
  })),
  { slug: 'canva', name: 'Canva', listed: false },
]) {
  const element = createElement(
    'div',
    {
      style: {
        display: 'flex',
        flexDirection: 'column',
        width: '100%',
        height: '100%',
        fontFamily: 'Instrument Sans',
        background: '#F7F5F0',
        padding: '64px',
        color: '#1A1A1A',
        fontWeight: 400,
      },
    },
    createElement('div', { style: { display: 'flex', fontSize: 29 } }, 'VAT Check GH'),
    createElement(
      'div',
      {
        style: {
          display: 'flex',
          fontSize: item.name.length > 40 ? 40 : 56,
          lineHeight: 1.1,
          marginTop: 64,
        },
      },
      item.name,
    ),
    createElement(
      'div',
      { style: { display: 'flex', fontSize: 27, marginTop: 32 } },
      item.listed ? 'On the GRA registered merchant list' : 'Not on this GRA list',
    ),
    createElement(
      'div',
      { style: { display: 'flex', fontSize: 25, marginTop: 32 } },
      'Registration does not confirm whether tax is included.',
    ),
    createElement(
      'div',
      { style: { display: 'flex', fontSize: 21, marginTop: 48 } },
      `Data as of ${sourceDateLabel} · GRA FAQ Q13–15`,
    ),
    createElement(
      'div',
      { style: { display: 'flex', fontSize: 18, marginTop: 24 } },
      'Not affiliated with GRA. Not tax or legal advice.',
    ),
  );
  const response = new ImageResponse(element, { width: 1200, height: 630, fonts });
  await writeFile(`out/check/${item.slug}/og.png`, Buffer.from(await response.arrayBuffer()));
}
console.log(`Generated ${merchants.length + 1} merchant Open Graph images.`);

// Keep a complete static app revision together. New workers wait for old tabs to
// close; a cache-first release cannot combine old scripts with newly published HTML.
const offlineFiles = (await walk('out'))
  .filter((file) => /\.(?:html|txt|js|css|woff2?|svg)$/.test(file) && !file.endsWith('/sw.js'))
  .sort();
const releaseHash = createHash('sha256').update('vat-worker-policy-v2');
for (const file of offlineFiles) releaseHash.update(file).update(await readFile(file));
const release = releaseHash.digest('hex').slice(0, 20);
const offlineUrls = offlineFiles.map((file) => '/' + file.slice(4).replace(/index\.html$/, ''));
await writeFile(
  'out/sw.js',
  `
const PREFIX = 'vat-check-gh-';
const CACHE = PREFIX + '${release}';
const FILES = ${JSON.stringify(offlineUrls)};
const PATHS = new Set(FILES);
self.addEventListener('install', event => {
  event.waitUntil(caches.open(CACHE).then(cache => cache.addAll(FILES)).catch(async error => {
    await caches.delete(CACHE);
    throw error;
  }));
});
self.addEventListener('activate', event => {
  event.waitUntil(caches.keys().then(keys => Promise.all(
    keys.filter(key => key.startsWith(PREFIX) && key !== CACHE).map(key => caches.delete(key))
  )).then(() => self.clients.claim()));
});
self.addEventListener('fetch', event => {
  const request = event.request;
  const url = new URL(request.url);
  if (request.method !== 'GET' || url.origin !== self.location.origin) return;
  event.respondWith((async () => {
    if (PATHS.has(url.pathname)) {
      const cache = await caches.open(CACHE);
      const saved = await cache.match(new URL(url.pathname, self.location.origin).href);
      if (saved) return saved;
    }
    try { return await fetch(request); }
    catch { return new Response('This resource is not available offline. Reconnect to load it.', {
      status: 503, headers: { 'Content-Type': 'text/plain; charset=utf-8' }
    }); }
  })());
});
`,
);
console.log(`Offline release ${release}: ${offlineUrls.length} static resources, staged updates.`);
