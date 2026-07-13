(()=>{
  'use strict';
  const BASE=window.__SOLENNE_RELEASE_BASE__||'./';
  const url=p=>new URL(p,BASE).href;
  const get=async p=>{const r=await fetch(url(p),{cache:'no-store'});if(!r.ok)throw new Error(`${p}: HTTP ${r.status}`);return r.text()};
  const fail=e=>{console.error(e);const b=document.querySelector('#fatal-error'),m=document.querySelector('#fatal-message');if(m)m.textContent=String(e&&e.stack||e);if(b)b.classList.add('show')};
  (async()=>{
    try{
      const [styleManifest,assetManifest,gameManifest]=await Promise.all([
        fetch(url('style/manifest.json'),{cache:'no-store'}).then(r=>r.json()),
        fetch(url('assets/manifest.json'),{cache:'no-store'}).then(r=>r.json()),
        fetch(url('game/manifest.json'),{cache:'no-store'}).then(r=>r.json())
      ]);
      const css=(await Promise.all(styleManifest.map(p=>get(`style/${p}`)))).join('');
      const sheet=document.createElement('style');sheet.textContent=css;document.head.appendChild(sheet);
      const entries=await Promise.all(Object.entries(assetManifest).map(async([name,parts])=>[name,`data:image/png;base64,${(await Promise.all(parts.map(p=>get(`assets/${p}`)))).join('')}`]));
      window.__ATLAS_IMAGES__=Object.fromEntries(entries);
      const source=(await Promise.all(gameManifest.map(p=>get(`game/${p}`)))).join('');
      (0,eval)(source+'\n//# sourceURL=chroniques-solenne-0.7.js');
    }catch(e){fail(e)}
  })();
})();
