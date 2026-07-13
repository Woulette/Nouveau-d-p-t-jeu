# Audit des assets — fondation

Tous les éléments visuels servis par le client sont des fichiers séparés et versionnés dans le dépôt.

| Fichier | Rôle | Format |
|---|---|---|
| `assets/tiles.svg` | 16 tuiles de terrain : herbes, chemin, eau, pierre, fleurs et hautes herbes | atlas 256×64 |
| `assets/hero.svg` | Aventurier, quatre directions, repos, marche et dégâts | atlas 128×192 |
| `assets/monsters.svg` | Gelée, rat, sanglier, loup et feu follet avec six états | atlas 240×200 |
| `assets/decor.svg` | arbres, buissons, rochers, panneau, lampadaire, clôture, tonneau, fleurs, souche et puits | atlas 384×128 |
| `assets/house.svg` | maison du village de Solenne | sprite 160×128 |
| `assets/items.svg` | bâton, fronde, orbe, potion, sac, monnaie et icônes UI | atlas 240×96 |
| `assets/app-icon.svg` | icône PWA originale | sprite 512×512 |

Les SVG utilisent des coordonnées entières et `shape-rendering="crispEdges"` pour conserver une apparence pixel art. Ils sont chargés comme images par le moteur : aucun emoji, aucune police d’icônes et aucun dessin de secours ne remplace les assets dans la version officielle.
