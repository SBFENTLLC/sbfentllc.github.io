const CACHE='sbfent-stamped-out-v29';
const CORE=['flex-power.mjs','boot-v29.mjs','arena-beat.mjs','launch-scene.mjs','combat-strings.mjs','boot-v29.mjs','touch-lock.mjs','victories.mjs','story-scenes.mjs','assets/flex-bills.jpeg','./','index.html','game.css','game.js','release-ui.mjs','save-backup.mjs','assets/share-card.svg','assets/share-card.png','engine.mjs','roster.mjs','fx.mjs','music.mjs','music-ui.mjs','polish.mjs','combat-audio.mjs','expansion-data.mjs','duo-data.mjs','sound-data.mjs','nova-stamp-data.mjs','violet-red-data.mjs','story.mjs','voices.mjs','arenas.mjs','outfits.mjs','pressure-static-outfit-data.mjs','assets/pressure-static-tracksuits.webp','iron-king-outfit-data.mjs','assets/iron-king-tracksuits.webp','violet-red-outfit-data.mjs','assets/violet-red-tracksuits.webp','nova-stamp-outfit-data.mjs','assets/nova-stamp-tracksuits.webp','dj-quiet-outfit-data.mjs','assets/dj-quiet-tracksuits.webp','goldie-onyx-outfit-data.mjs','assets/goldie-onyx-tracksuits.webp','foxy-clara-outfit-data.mjs','assets/foxy-clara-tracksuits.webp','outfit-data.mjs','outfit-grapple-data.mjs','assets/flex-bootlegger-tracksuits.webp','assets/tracksuit-grapples.webp','assets/studio.webp','assets/vault.webp','assets/workshop.webp','king-data.mjs','assets/false-king.webp','assets/penthouse.webp','iron-data.mjs','assets/iron-haul.webp','assets/motoryard.webp','static-data.mjs','assets/lady-static.webp','assets/underground.webp','boss-data.mjs','assets/big-pressure.webp','assets/blockparty.webp','selection.mjs','choreography.mjs','sprites.mjs','sprite-masks.mjs','sprite-hulls.mjs','grapple-data.mjs','assets/sbfent-stamped-out-180-v1.png','assets/sbfent-stamped-out-192-v1.png','assets/sbfent-stamped-out-512-v1.png','manifest.webmanifest','assets/fighters.webp','assets/foxy-clara.webp','assets/goldie-onyx.webp','assets/dj-quiet.webp','assets/nova-stamp.webp','assets/violet-red.webp','assets/rooftop.webp','assets/grapples.webp','assets/app-192.png','assets/app-512.png','assets/apple-touch-icon.png'];
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

self.addEventListener('message',event=>{if(event.data?.type==='VERSION')event.ports?.[0]?.postMessage({version:29});});
