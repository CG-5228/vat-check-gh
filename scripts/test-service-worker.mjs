import console from 'node:console';
import { URL } from 'node:url';
const { Request, Response } = globalThis;
import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import vm from 'node:vm';
import test from 'node:test';
const source = await readFile(new URL('../out/sw.js', import.meta.url), 'utf8');
function harness() {
  const listeners = {},
    stores = new Map(),
    calls = { skipped: 0, claimed: 0, network: 0 };
  const make = () => {
    const entries = new Map();
    return {
      entries,
      match: async (request) =>
        entries.get(typeof request === 'string' ? request : request.url)?.clone(),
      put: async (request, response) =>
        entries.set(typeof request === 'string' ? request : request.url, response),
      add: async (url) => entries.set(url, new Response('network')),
      addAll: async (urls) => {
        for (const url of urls)
          entries.set(new URL(url, 'https://vat.test').href, new Response('installed'));
      },
    };
  };
  const caches = {
    keys: async () => [...stores.keys()],
    delete: async (name) => stores.delete(name),
    open: async (name) => {
      if (!stores.has(name)) stores.set(name, make());
      return stores.get(name);
    },
    match: async (request) => {
      for (const cache of stores.values()) {
        const value = await cache.match(request);
        if (value) return value;
      }
    },
  };
  const self = {
    location: new URL('https://vat.test/sw.js'),
    registration: { scope: 'https://vat.test/' },
    addEventListener: (type, listener) => (listeners[type] = listener),
    skipWaiting: () => calls.skipped++,
    clients: {
      claim: async () => {
        calls.claimed++;
      },
    },
  };
  vm.runInNewContext(source, {
    self,
    caches,
    URL,
    Response,
    Request,
    Set,
    console,
    fetch: async () => {
      calls.network++;
      throw new Error('offline');
    },
  });
  async function dispatch(type, input = {}) {
    const waits = [];
    let response;
    listeners[type]?.({
      ...input,
      waitUntil: (p) => waits.push(p),
      respondWith: (p) => (response = p),
    });
    const result = response ? await response : undefined;
    await Promise.all(waits);
    return result;
  }
  return { stores, calls, caches, dispatch };
}
test('activation preserves caches owned by other applications', async () => {
  const h = harness();
  await h.caches.open('another-app-release');
  await h.caches.open('vat-check-gh-old');
  await h.dispatch('activate');
  assert.ok(h.stores.has('another-app-release'));
  assert.ok(!h.stores.has('vat-check-gh-old'));
});
test('installation waits for existing tabs to close before activating an update', async () => {
  const h = harness();
  await h.dispatch('install');
  assert.equal(h.calls.skipped, 0);
});
test('offline responses never come from another applications cache', async () => {
  const h = harness();
  const cache = await h.caches.open('another-app');
  await cache.put('https://vat.test/unknown/', new Response('unrelated'));
  const response = await h.dispatch('fetch', { request: new Request('https://vat.test/unknown/') });
  assert.equal(response.status, 503);
});
test('a complete installed release serves its pages without mixing network revisions', async () => {
  const h = harness();
  await h.dispatch('install');
  const before = h.calls.network;
  const response = await h.dispatch('fetch', { request: new Request('https://vat.test/') });
  assert.equal(response.status, 200);
  assert.equal(h.calls.network, before);
});
test('malformed cache messages do not break the worker', async () => {
  const h = harness();
  await h.dispatch('message', { data: { type: 'CACHE_VISIT', urls: 1 } });
  await h.dispatch('message', {
    data: { type: 'CACHE_VISIT', urls: ['not a url', 'https://other.test/'] },
  });
});
