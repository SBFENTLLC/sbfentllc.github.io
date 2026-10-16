const CACHE='sbfent-stamped-out-v7';
const CORE=['./','index.html','game.css','game.js','engine.mjs','roster.mjs','fx.mjs','music.mjs','music-ui.mjs','polish.mjs','combat-audio.mjs','expansion-data.mjs','duo-data.mjs','selection.mjs','choreography.mjs','sprites.mjs','sprite-masks.mjs','sprite-hulls.mjs','grapple-data.mjs','manifest.webmanifest','assets/fighters.webp','assets/foxy-clara.webp','assets/goldie-onyx.webp','assets/rooftop.webp','assets/grapples.webp','assets/app-192.png','assets/app-512.png','assets/apple-touch-icon.png'];
self.addEventListener('install',event=>event.waitUntil((async()=>{const cache=await caches.open(CACHE);await cache.addAll(CORE);await self.skipWaiting();})()));
self.addEventListener('activate',event=>event.waitUntil((async()=>{for(const key of await caches.keys())if(key.startsWith('sbfent-stamped-out-')&&key!==CACHE)await caches.delete(key);await self.clients.claim();})()));
self.addEventListener('fetch',event=>{
 const request=event.request,url=new URL(request.url);
 // Music streams remain on demand; don't cache partial 206 audio responses.
 if(request.method!=='GET'||url.origin!==self.location.origin||url.pathname.includes('/audio/')||request.headers.has('range'))return;
 if(request.mode==='navigate'){
  event.respondWith(fetch(request).catch(async()=>{const cached=await caches.match(new URL('index.html',self.registration.scope).href);return cached||Response.error();}));return;
 }
 const allowed=CORE.some(p=>new URL(p,self.registration.scope).pathname===url.pathname);
 if(!allowed)return;
 event.respondWith((async()=>{const cached=await caches.match(request,{ignoreSearch:true});if(cached)return cached;return fetch(request);})());
});
