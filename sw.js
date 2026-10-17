/* Offline-first service worker for the Sultan Bill app */
const CACHE='sultan-bill-v2';
const FILES=['./','./index.html','./manifest.json','./sultan-icon-180.png','./sultan-icon-192.png','./sultan-icon-512.png','./favicon-32.png'];
self.addEventListener('install',e=>{
  e.waitUntil((async()=>{
    const c=await caches.open(CACHE);
    await c.addAll(['./','./index.html','./manifest.json']);
    await Promise.all(FILES.slice(3).map(async p=>{try{await c.add(p);}catch(_){}}));
    await self.skipWaiting();
  })());
});
self.addEventListener('activate',e=>{
  e.waitUntil((async()=>{
    const keys=await caches.keys();
    await Promise.all(keys.filter(k=>k!==CACHE).map(k=>caches.delete(k)));
    await self.clients.claim();
  })());
});
self.addEventListener('fetch',e=>{
  const r=e.request;
  if(r.method!=='GET')return;
  const u=new URL(r.url);
  if(u.origin!==location.origin)return;
  e.respondWith((async()=>{
    try{
      const res=await fetch(r);
      if(res&&res.ok){const c=await caches.open(CACHE);c.put(r,res.clone());}
      return res;
    }catch(_){
      const hit=await caches.match(r,{ignoreSearch:true});
      if(hit)return hit;
      if(r.mode==='navigate'){const idx=await caches.match('./index.html');if(idx)return idx;}
      return Response.error();
    }
  })());
});
