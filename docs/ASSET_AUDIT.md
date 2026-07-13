# Audit des assets — étape 1

## Sources visuelles examinées

Les quatre panneaux de travail fournis pendant la conception ont été inspectés : personnages, décors, équipements et icônes. Ils restent des références de direction artistique et non des sprites directement découpables : leurs poses, fonds et éclairages ne forment pas des spritesheets régulières prêtes pour le moteur.

Sommes des références locales auditées :

- personnages : `e692e09fa4584dc2408b8cf3894700a31dacb08fbf35e547a9edda79be6bd234` ;
- décors : `bf90f8ce1a1e230130f95c4fde3d699fcfa883f5d332ca29c29efa9b23e3c572` ;
- équipements : `9c505220b6e4d15bccc215f9147c36476be5ef12f2c14e2209b0c279bcedebb8` ;
- icônes : `cd4330cbe12bafa7e0b46ca937ef9dc0342b29475d51c5cadb15fbd5b03a87fa`.

## Assets d’exécution retenus

La fondation produit de vrais fichiers PNG :

- Aventurier : repos, marche, bâton, fronde, magie, dégâts et mort, dans quatre directions ;
- cinq familles de monstres : repos, marche, attaque, dégâts et mort ;
- icônes d’armes, menus, potion, monnaie, classes et équipement ;
- effets d’impact, projectile, magie, niveau et soin ;
- carte pré-rendue avec terrain, chemins, eau, arbres, buissons, rochers, fleurs, maison, barrières, lampadaires, puits et mentors ;
- portrait du joueur.

Les PNG sont générés au build afin que le dépôt reste entièrement reproductible depuis du code source texte. `docs/ASSET_AUDIT.json` enregistre leurs dimensions et sommes SHA-256.

## Décision

La fondation est valide techniquement. La phase 2 doit maintenant augmenter le niveau de détail, la variété et la fluidité sans modifier les règles de gameplay ni revenir à des formes grossières.
