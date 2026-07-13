# Étape 2 — Direction artistique

Cette branche améliore la qualité graphique sans modifier la fondation stable publiée dans `main/stage1`.

## Objectif

Atteindre une présentation mobile paysage proche de la référence fournie : forêt fantasy chaleureuse, grande densité de détails, personnages lisibles, animations conservées et interface sombre aux contours dorés.

## Règles de non-régression

- aucun emoji ou placeholder ;
- aucun écran uniforme ou décor simplifié ;
- aucune suppression d’animation ;
- déplacement, combat et progression doivent rester fonctionnels ;
- les changements restent sur cette branche jusqu’à validation visuelle et fonctionnelle ;
- Vercel production reste l’unique projet `chroniques-de-solenne` et continue de servir `main/stage1` pendant le travail.

## Lots artistiques

1. Aventurier : silhouette, visage, volume, quatre directions et lisibilité des attaques.
2. Monstres : Gelée, Rat, Sanglier, Loup et Feu follet avec repos, marche, attaque, dégâts et mort.
3. Monde : variantes d’herbe, fleurs, hautes herbes, arbres, buissons, rochers, chemin, eau et ombres.
4. Village : maison, puits, lampadaires, panneaux, tonneaux et clôtures.
5. Interface : portrait, armes, sac, statistiques, potions, monnaie et panneaux tactiles.
6. Effets : impacts, projectiles, magie, dégâts, gain d’XP et butin.

La première passe produit un atlas visuel complet avant toute promotion vers `develop` ou `main`.
