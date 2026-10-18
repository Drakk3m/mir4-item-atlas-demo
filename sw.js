// Generated asset list and content version are injected by the Vite build.
const FILES = [{"path":"assets/index-Bm5BeN7Y.css","integrity":"sha256-4JRQ74q73Fg5M9KExN//Xl5MYePY0xJ5Ou7j8dI8QQM="},{"path":"assets/index-CXiD7fR1.js","integrity":"sha256-DRn+pJcOV3YWiuE0jUqI4xnbA4XESKiRP2f3wNlgGKU="},{"path":"index.html","integrity":"sha256-dRE35R4c9SRy6eOEiEebdtkIus8ngnrbqAmT16uDSJE="},{"path":"manifest.webmanifest","integrity":"sha256-Zp13ucqShJpu+INmv6IPaw8Y0LIWmZ/M6LaBjlnv7aU="},{"path":"icons/atlas.svg","integrity":"sha256-1cwci4M1hLZxC5NQxP1zaw3vVuZesyMYZ/C+2uCNBfs="},{"path":"icons/atlas-192.png","integrity":"sha256-QF4FcN3fb5Ec8KPj2TJqN6cd8QwGi4CEOMYca+9DdFI="},{"path":"icons/atlas-512.png","integrity":"sha256-KzTokAjzpgjm70aGLQ9ku9vMLzqK39D6jndBXKgvsi0="},{"path":"icons/atlas-maskable-512.png","integrity":"sha256-KzTokAjzpgjm70aGLQ9ku9vMLzqK39D6jndBXKgvsi0="},{"path":"icons/apple-touch-icon.png","integrity":"sha256-8fGMlwV2YBlz9r0ROv5vMSKIUPFhmC/7aXT4ocq1qdg="}];
const VERSION = "de65c9a9d25a1a34022eb2df";
const ROOT = new URL('./', self.location.href);
const PREFIX = 'mir4-atlas-shell:' + ROOT.pathname + ':';
const CACHE = PREFIX + VERSION;
const URLS = FILES.map(file => new URL(file.path, ROOT).href);
const ALLOWED = new Set(URLS);
self.addEventListener('install', event => {
 event.waitUntil((async () => {
  const cache = await caches.open(CACHE);
  try {
   // Reload bypasses HTTP caches. A failed fetch aborts the installation.
   await cache.addAll(FILES.map(file => new Request(new URL(file.path, ROOT), {cache:'reload', integrity:file.integrity})));
  } catch (error) { await caches.delete(CACHE); throw error; }
 })());
});
self.addEventListener('activate', event => {
 event.waitUntil((async () => {
  // Retain old generations while old pages can still need their hashed assets.
  const pages = await self.clients.matchAll({type:'window', includeUncontrolled:true});
  if (!pages.length) for (const name of await caches.keys()) if (name.startsWith(PREFIX) && name !== CACHE) await caches.delete(name);
  // No clients.claim(): an existing page keeps its original shell until reload.
 })());
});
self.addEventListener('fetch', event => {
 const request=event.request, url=new URL(request.url);
 if(request.method!=='GET' || url.origin!==ROOT.origin)return;
 const shell=request.mode==='navigate' && (url.pathname===ROOT.pathname || url.pathname===ROOT.pathname+'index.html');
 const key=shell?new URL('index.html',ROOT).href:url.href;
 if(!ALLOWED.has(key))return; // Never cache user files, workspace records or APIs.
 event.respondWith((async()=>{
  const cached=await(await caches.open(CACHE)).match(key);
  return cached || fetch(request); // Cache-first, exact build assets only.
 })());
});
self.addEventListener('message', event => {
 if(event.data?.type!=='ACTIVATE_UPDATE' || !event.source || !event.ports[0])return;
 event.waitUntil((async()=>{
  const pages=(await self.clients.matchAll({type:'window',includeUncontrolled:true})).filter(page=>new URL(page.url).pathname.startsWith(ROOT.pathname));
  const allowed=pages.length>0 && (await Promise.all(pages.map(page=>new Promise(resolve=>{
   const channel=new MessageChannel(),timer=setTimeout(()=>resolve(false),3000);
   channel.port1.onmessage=reply=>{clearTimeout(timer);channel.port1.close();resolve(reply.data===true);};
   page.postMessage({type:'CHECK_UPDATE_READY'},[channel.port2]);
  })))).every(Boolean);
  event.ports[0].postMessage({accepted:allowed});
  if(allowed)await self.skipWaiting();
  else for(const page of pages)page.postMessage({type:'UPDATE_CANCELLED'});
 })());
});
