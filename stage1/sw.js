const CACHE='solenne-stage1-0.8.0-alpha.1';
const FILES=['./','./index.html','./styles.css','./src/game.js','./manifest.webmanifest','./assets/app-icon.svg','./assets/tiles.svg','./assets/hero.svg','./assets/monsters.svg','./assets/decor.svg','./assets/house.svg','./assets/items.svg'];
self.addEventListener('install',event=>event.waitUntil(caches.open(CACHE).then(cache=>cache.addAll(FILES)).then(()=>self.skipWaiting())));
self.addEventListener('activate',event=>event.waitUntil(caches.keys().then(keys=>Promise.all(keys.filter(key=>key!==CACHE).map(key=>caches.delete(key)))).then(()=>self.clients.claim())));
self.addEventListener('fetch',event=>{
  if(event.request.method!=='GET')return;
  event.respondWith(fetch(event.request).then(response=>{const copy=response.clone();caches.open(CACHE).then(cache=>cache.put(event.request,copy));return response}).catch(()=>caches.match(event.request)));
});
