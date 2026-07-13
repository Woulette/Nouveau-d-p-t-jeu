# Cahier des charges — Chroniques de Solenne

## Vision

MMORPG mobile 2D en pixel art, en vue du dessus, avec une ambiance fantasy chaleureuse et une lisibilité adaptée au téléphone en mode paysage. L’univers, les cartes, les personnages, les monstres et l’interface sont originaux.

## Personnage de départ

- Niveau général 1.
- Classe Aventurier, rang de classe 1.
- Vitesse de base 100.
- Bâton pour le corps à corps.
- Fronde pour la distance.
- Orbe pour les boules magiques.

Chaque niveau général ajoute 1 point de vitesse : `vitesse = 99 + niveau général`.

## Déplacement

Le monde est une grille. Le joueur touche une case, le jeu recherche un chemin autour des obstacles et le personnage avance logiquement case par case. L’animation visuelle reste fluide. Il n’y a pas de joystick et le déplacement n’est pas analogique.

## Combat

Toucher un monstre le sélectionne. Le personnage avance automatiquement jusqu’à la portée de l’arme, s’arrête, attaque, puis suit sa cible si nécessaire.

- Bâton : portée courte, XP de corps à corps à chaque coup valide.
- Fronde : projectile visible, XP de distance à chaque coup valide.
- Orbe : projectile magique, consommation de PM, XP de magie à chaque coup valide.
- Attaque reçue : XP de défense.

L’XP des maîtrises est personnelle et n’est jamais partagée. L’XP générale et l’XP de classe sont accordées à la mort du monstre et seront partageables en groupe entre les membres proches ayant participé.

## Progression de classe

Au rang Aventurier 20, le joueur choisit définitivement auprès d’un mentor : Épéiste, Archer ou Mage. La nouvelle classe recommence au rang 1. Le niveau général, les maîtrises, l’inventaire et les équipements restent conservés. Plus tard, les classes pourront évoluer de nouveau, par exemple Mage vers Nécromancien.

## Monstres et récompenses

Les monstres peuvent donner : XP générale, XP de classe, or, consommables, matériaux et parfois équipement. La première zone contient gelée, rat, sanglier, loup et feu follet.

## Mort

Le personnage réapparaît au village, récupère ses PV et PM et ne perd ni niveau, ni maîtrise, ni objet dans la première version.

## Direction artistique verrouillée

- Carte forestière riche en herbe, chemins, fleurs, buissons, rochers, arbres, clôtures, lampadaires, puits et maison.
- Personnage et monstres animés.
- Interface sombre avec détails dorés.
- Aucun emoji utilisé comme asset de jeu.
- Aucun écran vert vide, rectangle simpliste ou placeholder dans la branche de production.
- Une correction technique ne doit jamais supprimer les animations ou réduire la qualité visuelle.

## Architecture cible MMO

Le prototype actuel est local et sauvegardé dans le navigateur. La suite utilisera un serveur autoritaire pour le déplacement, le combat, les récompenses et la synchronisation des joueurs. Le client ne pourra jamais s’attribuer directement de l’XP, de l’or ou des dégâts.
