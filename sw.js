const CACHE='solenne-foundation-1.1.0-f1';
const FILES=['./','./index.html','./styles.css','./src/game.js','./manifest.webmanifest','./assets/map-base.png','./assets/map-overlay.png','./assets/map-data.json','./assets/hero.png','./assets/monsters.png','./assets/ui.png','./assets/effects.png','./assets/portrait.png'];
self.addEventListener('install',event=>event.waitUntil(caches.open(CACHE).then(c=>c.addAll(FILES)).then(()=>self.skipWaiting())));
self.addEventListener('activate',event=>event.waitUntil(caches.keys().then(keys=>Promise.all(keys.filter(k=>k!==CACHE).map(k=>caches.delete(k)))).then(()=>self.clients.claim())));
self.addEventListener('fetch',event=>{if(event.request.method!=='GET')return;event.respondWith(fetch(event.request).then(response=>{const copy=response.clone();caches.open(CACHE).then(c=>c.put(event.request,copy));return response}).catch(()=>caches.match(event.request).then(r=>r||caches.match('./index.html'))));});
