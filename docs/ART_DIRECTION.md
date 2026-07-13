# Direction artistique verrouillée

## Référence visuelle

Le jeu doit conserver une lecture proche d’un MMORPG mobile 2D haut de gamme : vue du dessus, pixel art chaleureux, densité végétale importante et interface sombre à accents dorés.

La référence sert uniquement à définir le niveau de finition et la lisibilité. Aucun sprite, aucune carte et aucune interface ne doivent être copiés.

## Règles obligatoires

- assets originaux stockés dans le dépôt ;
- aucune icône emoji dans la version jouable ;
- aucun personnage composé de rectangles temporaires en production ;
- aucune régression d’animation ;
- déplacement logique case par case, mais interpolation visuelle fluide ;
- personnage lisible au centre malgré une carte détaillée ;
- ombres cohérentes sous les personnages, monstres, arbres et bâtiments ;
- plusieurs variantes d’herbe, fleurs, buissons, rochers et arbres ;
- bâtiments et décors possédant volume, matière et éclairage ;
- interface paysage sombre, dorée, tactile et compatible avec les zones sûres des téléphones.

## Aventurier

Animations minimales dans quatre directions :

1. repos ;
2. marche ;
3. attaque au bâton ;
4. tir au lance-pierre ;
5. lancement magique ;
6. réception d’un coup ;
7. mort.

Les pieds doivent rester ancrés sur la grille et l’équipement doit suivre les mouvements des mains.

## Monstres

Chaque famille possède : repos, marche, attaque, dégâts et mort. Les silhouettes doivent être distinctes à petite taille.

Premières familles : Gelée verte, Rat, Sanglier, Loup et Feu follet.

## Décors

La Clairière de Solenne doit contenir :

- bordures forestières denses ;
- chemins de terre irréguliers ;
- village ou camp de départ ;
- maison, puits, panneaux, clôtures et lampadaires ;
- rochers de plusieurs tailles ;
- fleurs et hautes herbes distribuées sans répétition visible ;
- zones de combat dégagées au milieu d’un environnement riche.

## Critère de publication

Une capture de la nouvelle version doit être comparée à la capture stable précédente. Une modification qui retire des détails, des animations ou de la lisibilité ne peut pas être fusionnée dans `main`.
