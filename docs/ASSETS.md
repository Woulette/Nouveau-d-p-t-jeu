# Assets originaux

Les assets de la release sont générés pendant le build sous forme d’atlas PNG pixel art, puis rendus par le moteur à leur résolution native :

- Aventurier : repos, marche dans quatre directions, bâton, fronde, magie, dégâts et mort ;
- sept familles de monstres : Gelée, Rat, Sanglier, Loup, Feu follet, Ours de Solenne et Sylvain épineux ;
- pour chaque famille : repos, marche, attaque, dégâts et mort ;
- icônes de combat, menus, potion, monnaie, classes et équipement ;
- portrait, effets de combat et carte pré-rendue détaillée.

L’atlas des monstres mesure 1104×336 px et contient 161 images d’animation. Chaque image est d’abord dessinée dans une cellule temporaire de 48×48 px afin qu’aucun trait ne déborde dans la frame voisine.

Le monde est affiché à 75 % dans le jeu pour montrer davantage de terrain ; cela ne redimensionne ni ne dégrade les PNG sources.

Les assets sont originaux et ne reprennent aucun sprite du jeu de référence. La génération est déterministe et auditée dans `docs/ASSET_AUDIT.json`.
