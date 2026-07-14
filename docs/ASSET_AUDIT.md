# Audit des assets — candidat 1.2

## Pipeline retenu

La release produit de vrais fichiers PNG à partir de `scripts/generate_assets.py` :

- Aventurier animé dans quatre directions ;
- sept familles de monstres animées, dont l’Ours de Solenne et le Sylvain épineux ;
- douze icônes d’interface ;
- trente-deux frames d’effets ;
- carte, superposition de décor et données de collision ;
- portrait du joueur.

Les frames de monstres sont composées cellule par cellule pour empêcher toute contamination entre animations. Les types de monstres, leurs spawns, les dimensions, le contenu et les sommes SHA-256 sont contrôlés par `scripts/audit_assets.py`.

## Reproductibilité

`tests/reproducibility.py` génère deux fois les neuf sorties déterministes et compare leurs SHA-256. Le rapport courant est `docs/REPRODUCIBILITY.json` ; les dimensions et empreintes de la dernière génération sont dans `docs/ASSET_AUDIT.json`.

## Décision

Le pipeline est la source officielle de la release. L’étape 2 doit améliorer progressivement la variété et la finition sans remplacer les atlas par des placeholders ni réduire les animations.
