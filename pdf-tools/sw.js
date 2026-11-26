/* Scope: /pdf-tools/ only. Store app resources, never documents. */
importScripts('/pdf-tools/offline-assets.js');
const CACHE = 'scanapp-pdf-workspace-v1';
self.addEventListener('install', event => event.waitUntil((async()=>{
  const cache=await caches.open(CACHE);
  try { await cache.addAll(self.PDF_OFFLINE_ASSETS); await self.skipWaiting(); }
  catch(error) { await caches.delete(CACHE); throw error; }
})()));
self.addEventListener('activate', event => event.waitUntil((async()=>{
  for(const key of await caches.keys()) if(key.startsWith('scanapp-pdf-workspace-') && key!==CACHE) await caches.delete(key);
  await self.clients.claim();
})()));
self.addEventListener('fetch', event => {
  const url=new URL(event.request.url);
  if(event.request.method!=='GET' || url.origin!==self.location.origin || !self.PDF_OFFLINE_ASSETS.includes(url.pathname))return;
  event.respondWith((async()=>{
    const cache=await caches.open(CACHE), hit=await cache.match(url.pathname);
    return hit || fetch(event.request);
  })());
});
self.addEventListener('message',event=>{
  if(event.data && event.data.type==='offline-status' && event.ports[0]) event.waitUntil((async()=>{
    const cache=await caches.open(CACHE);
    const entries=await Promise.all(self.PDF_OFFLINE_ASSETS.map(url=>cache.match(url)));
    event.ports[0].postMessage({ready:entries.every(Boolean)});
  })());
});
