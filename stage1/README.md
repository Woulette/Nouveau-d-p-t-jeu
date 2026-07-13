# Chroniques de Solenne — Fondation étape 1

Cette arborescence est la base officielle et reproductible du client mobile paysage.

## Principes verrouillés

- déplacement tactile case par case, sans joystick ;
- pathfinding autour des obstacles ;
- ciblage d’un monstre, approche automatique et combat automatique ;
- bâton, fronde et orbe magique ;
- XP de maîtrise à chaque action valide ;
- XP générale et XP de classe à la mort des monstres ;
- vitesse de base 100, puis +1 par niveau général ;
- mort et réapparition au village sans perte ;
- choix permanent Épéiste, Archer ou Mage au rang Aventurier 20 ;
- vrais atlas graphiques séparés dans `assets/` ;
- aucun emoji ni forme de remplacement dans l’interface de production.

## Lancer localement

```bash
cd stage1
npm test
npx serve . -l 4173
```

Ouvrir ensuite `http://localhost:4173` avec un navigateur en mode paysage.

## Structure

```text
assets/             atlas SVG pixel art originaux
src/game.js         moteur, pathfinding, combat et progression
tests/              validation statique reproductible
index.html           interface mobile
styles.css           direction UI sombre et dorée
manifest.webmanifest PWA paysage
sw.js                cache hors ligne
```

Le multijoueur réel sera raccordé après validation de cette tranche verticale. Le client n’affiche aucun faux joueur comme s’il s’agissait d’un joueur connecté.
