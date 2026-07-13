# Validation finale de la fondation — 0.8.0-alpha.1

Statut : **PASS**

## Source vérifiée

- dépôt : `Woulette/Nouveau-d-p-t-jeu` ;
- branche de fondation : `stage1-break-loop-5` ;
- intégration : `develop/stage1/` ;
- production : `https://chroniques-de-solenne.vercel.app` ;
- build attendu : `0.8.0-alpha.1`.

## Formats mobiles testés

| Format | Démarrage | Carte détaillée | Déplacement | Combat | Stats | Inventaire | Mort / réapparition |
|---|---:|---:|---:|---:|---:|---:|---:|
| 667×375 | PASS | PASS | PASS | PASS | PASS | PASS | PASS |
| 844×390 | PASS | PASS | PASS | PASS | PASS | PASS | PASS |
| 896×414 | PASS | PASS | PASS | PASS | PASS | PASS | PASS |
| 932×430 | PASS | PASS | PASS | PASS | PASS | PASS | PASS |

## Contrôles techniques

- tous les assets déclarés se chargent ;
- les atlas SVG sont valides ;
- aucune erreur JavaScript ou requête d’asset échouée ;
- le canvas possède une variété visuelle suffisante et ne présente pas un grand aplat vert ;
- le déplacement tactile déclenche un chemin case par case ;
- le personnage contourne les obstacles ;
- l’orbe produit un projectile et diminue les PV de la cible ;
- les panneaux Statistiques et Inventaire s’ouvrent correctement ;
- la mort provoque une réapparition au village avec restauration des PV ;
- le choix Épéiste, Archer ou Mage est présenté au rang Aventurier 20 ;
- aucune icône emoji ou forme de remplacement n’est utilisée dans l’interface officielle.

Cette validation clôt la fondation technique. La phase suivante peut améliorer la direction artistique sans retirer une fonctionnalité ou une animation déjà testée.
