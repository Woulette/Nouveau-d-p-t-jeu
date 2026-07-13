# Étape 2 — Refonte artistique

## État actuel

La fondation de l’étape 1 est verrouillée sur `main`. La refonte artistique travaille uniquement sur `develop`.

### Terminé

- direction artistique écrite et verrouillée ;
- trois atlas PNG officiels contrôlés par SHA-256 ;
- galerie de contrôle visuel des atlas ;
- découpage reproductible des atlas en sprites PNG individuels ;
- catalogue JSON avec dimensions, coordonnées d’origine et sommes de contrôle ;
- planches de contact pour les personnages, le monde et l’interface ;
- tests CI d’intégrité des assets.

### En cours

- attribution de noms fonctionnels aux sprites découpés ;
- sélection des meilleures variantes pour l’Aventurier ;
- construction des séquences repos, marche, bâton, lance-pierre, magie, dégâts et mort ;
- sélection et classement des monstres ;
- composition de la nouvelle Clairière de Solenne avec les décors détaillés ;
- remplacement progressif des assets générés dans le moteur par les PNG du dépôt.

### Règle de livraison

Aucun changement artistique ne sera fusionné dans `main` tant que les animations, la lisibilité et la densité visuelle ne sont pas au moins égales à la version stable.
