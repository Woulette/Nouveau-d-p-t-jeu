# Architecture de la fondation

```text
index.html / styles.css / src/game.js
  Client mobile HTML5 Canvas

scripts/generate_assets.py
  Source graphique déterministe -> vrais atlas PNG et carte PNG

scripts/audit_assets.py
  Dimensions, contenu, JSON, métriques et SHA-256

scripts/build_release.py
  Assemble la sortie statique dans dist/

scripts/build_all.py
  Génération + audit + build + validation statique

server/
  Squelette du futur serveur MMO autoritaire
```

Le client local est une tranche verticale. À l’étape MMO, le serveur possédera l’état définitif des positions, dégâts, récompenses, XP et monstres. Le client demandera des actions mais ne pourra pas s’attribuer une progression.
