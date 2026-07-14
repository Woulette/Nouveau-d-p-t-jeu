# Cahier des charges validé — Chroniques de Solenne

## Vision et commandes

MMORPG mobile 2D en pixel art original, joué en paysage sans joystick. Toucher une case calcule un chemin sur la grille. Toucher un monstre le cible, approche le joueur à la bonne portée et lance les attaques automatiques.

Pendant une poursuite, joueur et monstre recalculent leur route depuis leur case engagée actuelle. Leurs cases de départ et de destination sont réservées : deux acteurs ne peuvent pas les utiliser simultanément. Une attaque ne part que depuis une position stabilisée.

## Progressions

- niveau général 1 au départ, vitesse 100 puis +1 par niveau ;
- Aventurier rang 1 au départ ;
- XP générale et de classe à la mort des monstres ;
- maîtrises corps à corps, distance et magie à chaque attaque valide ;
- maîtrise Défense à chaque coup reçu ;
- niveau général, maîtrises, inventaire et équipement conservés lors d’une évolution.

## Styles initiaux

- Bâton : corps à corps ;
- Fronde : distance ;
- Orbe : magie consommant des PM.

Les trois styles restent utilisables après le choix de classe.

## Classes

L’Aventurier est plafonné au rang 20 ; son XP de classe reste à zéro jusqu’au choix confirmé auprès du mentor :

- **Épéiste** rang 1 : +12 PV et +12 % de dégâts au bâton ;
- **Archer** rang 1 : +12 % de dégâts à la fronde et +0,6 de portée ;
- **Mage** rang 1 : +12 PM et +12 % de dégâts à l’orbe.

Le choix est permanent et sauvegardé. Une évolution avancée sera conçue plus tard.

## Monstres et récompenses

Les monstres donnent XP générale, XP de classe et or, avec une chance de butin. L’Ours de Solenne apparaît aux niveaux 6 et 8 ; le Sylvain épineux au niveau 7. Ils possèdent davantage de PV, de dégâts et de récompenses que les cinq familles initiales.

## Mort et interface

Le personnage réapparaît sur une case libre du village enregistré, sans perte de progression dans la première version.

L’interface place les trois styles sur le bord gauche, l’inventaire et les statistiques à droite, la potion en bas à droite, et conserve le centre pour le monde.

## Direction artistique

Pixel art fantasy chaleureux, atlas PNG réels, animations visibles, terrain varié et interface sombre dorée. Aucun emoji, écran vide, rectangle de remplacement ou retrait d’animation ne peut être publié sur `main`.
