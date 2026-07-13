# Validation finale de la fondation — 0.8.0-alpha.1

Statut : **PASS**

## Formats mobiles testés

| Format | Démarrage | Carte | Déplacement | Combat | Stats | Inventaire | Réapparition |
|---|---:|---:|---:|---:|---:|---:|---:|
| 667×375 | PASS | PASS | PASS | PASS | PASS | PASS | PASS |
| 844×390 | PASS | PASS | PASS | PASS | PASS | PASS | PASS |
| 896×414 | PASS | PASS | PASS | PASS | PASS | PASS | PASS |
| 932×430 | PASS | PASS | PASS | PASS | PASS | PASS | PASS |

## Contrôles validés

- chargement du build `0.8.0-alpha.1` depuis Vercel ;
- chargement de tous les atlas graphiques ;
- aucune erreur JavaScript ni requête d’asset échouée ;
- déplacement tactile case par case et pathfinding ;
- combat automatique avec projectile magique ;
- statistiques et inventaire ;
- mort et réapparition au village ;
- affichage des trois choix de classe ;
- aucune icône emoji ou forme de remplacement.

Production vérifiée : `https://chroniques-de-solenne.vercel.app`.
