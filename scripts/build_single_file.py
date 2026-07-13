#!/usr/bin/env python3
from __future__ import annotations
import base64
import json
import re
from pathlib import Path

ROOT=Path(__file__).resolve().parents[1]

def data_uri(path:Path)->str:
    mime='image/png' if path.suffix.lower()=='.png' else 'application/octet-stream'
    return f'data:{mime};base64,'+base64.b64encode(path.read_bytes()).decode('ascii')

html=(ROOT/'index.html').read_text(encoding='utf-8')
css=(ROOT/'styles.css').read_text(encoding='utf-8')
js=''.join(path.read_text(encoding='utf-8') for path in sorted((ROOT/'src/game-parts').glob('*.jsfrag')))
map_data=json.loads((ROOT/'assets/map-data.json').read_text(encoding='utf-8'))
embedded={
    'mapBase':data_uri(ROOT/'assets/map-base.png'),
    'mapOverlay':data_uri(ROOT/'assets/map-overlay.png'),
    'hero':data_uri(ROOT/'assets/hero.png'),
    'monsters':data_uri(ROOT/'assets/monsters.png'),
    'ui':data_uri(ROOT/'assets/ui.png'),
    'effects':data_uri(ROOT/'assets/effects.png'),
    'portrait':data_uri(ROOT/'assets/portrait.png'),
    'map':map_data,
}
html=re.sub(r'\s*<link rel="manifest"[^>]*>\s*','\n',html,count=1)
html=re.sub(r'\s*<link rel="stylesheet"[^>]*>\s*',f'\n  <style>\n{css}\n  </style>\n',html,count=1)
html=re.sub(r'src="\.\/assets\/portrait\.png"',f'src="{embedded["portrait"]}"',html,count=1)
script='<script>window.__SOLENNE_EMBEDDED__='+json.dumps(embedded,separators=(',',':'))+';</script>\n  <script>\n'+js+'\n  </script>'
html=re.sub(r'\s*<script src="\.\/src\/game\.js[^>]*><\/script>\s*',f'\n  {script}\n',html,count=1)
if '__SOLENNE_EMBEDDED__' not in html or 'window.__SOLENNE__' not in html:
    raise RuntimeError('Le bundle autonome n’a pas été correctement assemblé.')
out=ROOT/'dist/standalone.html'
out.parent.mkdir(parents=True,exist_ok=True)
out.write_text(html,encoding='utf-8')
print(out, out.stat().st_size)
