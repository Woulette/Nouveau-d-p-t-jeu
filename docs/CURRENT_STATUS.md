# État courant — Chroniques de Solenne

Dernière mise à jour : **13 juillet 2026**.

Ce fichier contient l’état opérationnel à relire après `docs/NEXT_CHAT_HANDOFF.md`. Pour les faits temporels (branches, validation et Vercel), ce document est prioritaire.

## Dépôt et branches

Dépôt unique : `Woulette/Nouveau-d-p-t-jeu`.

- `main` : `2c64ef242f209e0218663a5c0dd1debdd90c987d` — ancienne alpha stable, non modifiée pendant la consolidation ;
- `foundation-backup-alpha3` : sauvegarde de l’ancienne alpha ;
- `develop` : `ba407a327c64974c6c53462984166a650e56aeb9` — fondation consolidée et validée ;
- `develop-consolidation-work` : même commit validé, conservé comme branche historique du chantier ;
- `develop-before-consolidation-20260713` : `ada6c571893ab892536c2598e5fd962611a3c363` — sauvegarde intégrale de l’ancien `develop` avant sa remise au propre.

Aucun dépôt GitHub supplémentaire n’a été créé. `main` n’a pas été fusionnée ni réécrite.

## Build validé

Version : `1.1.0-foundation.1`.

Le build est entièrement reproductible à partir des sources du dépôt :

1. génération déterministe des atlas PNG et de la carte ;
2. audit des dimensions, du contenu et des SHA-256 ;
3. assemblage des fragments réels du moteur JavaScript ;
4. génération de `dist/` et de `dist/standalone.html` ;
5. validation statique ;
6. QA Chromium sur la release réellement servie par HTTP.

Les vrais assets ont été conservés. Aucun sprite, décor, effet ou icône n’a été remplacé par un emoji, un rectangle ou un placeholder.

## Validation GitHub Actions

Dernière validation complète réussie :

- workflow : `Validate Chroniques de Solenne foundation` ;
- run : `29272490520` ;
- commit testé : `ba407a327c64974c6c53462984166a650e56aeb9` ;
- résultat : **PASS** ;
- artefact : `8288039020` ;
- nom : `solenne-foundation-validation-ac468b9b375301a6e5c0a874e3c81097e8a0f0e1` ;
- empreinte : `sha256:5375b89ff65d2d8e392cbc5e33916fc25cc91eb4d3ae0f74e310420db1318649` ;
- conservation prévue jusqu’au **11 octobre 2026**.

L’artefact contient la release, les rapports JSON et cinq captures mobiles.

## QA mobile et fonctionnelle

Les quatre formats paysage sont validés sans erreur JavaScript, sans écran fatal et sans contrôle coupé :

- 667 × 375 ;
- 844 × 390 ;
- 896 × 414 ;
- 932 × 430.

Le scénario fonctionnel 896 × 414 valide également :

- sélection du bâton, de la fronde et de l’orbe ;
- sauvegarde locale puis restauration après rechargement ;
- ouverture de l’inventaire et des statistiques ;
- déplacement tactile case par case ;
- ciblage réel d’un monstre ;
- dégâts et gain de maîtrise avec les trois styles de combat ;
- gain de maîtrise Défense après une attaque reçue ;
- consommation d’une potion ;
- mort puis réapparition au village avec PV et PM restaurés.

Rapport généré : `tests/mobile-qa-report.json` dans l’artefact GitHub Actions.

## État réel de Vercel

Équipe connectée vérifiée : **Bigot's projects**.

Au moment du contrôle :

- le projet obligatoire `chroniques-de-solenne` n’apparaît pas dans cette équipe ;
- l’URL `chroniques-de-solenne.vercel.app` ne correspond à aucun déploiement accessible ;
- l’API Vercel répond `404` pour ce projet et ce déploiement ;
- seul le projet sans rapport `voidsector-game` est visible.

Conformément aux consignes, **aucun nouveau projet Vercel n’a été créé** et aucun déploiement n’a été envoyé vers `voidsector-game`.

## Blocage actuel et prochaine action exacte

Le code est prêt pour une prévisualisation Vercel depuis `develop`, mais le projet Vercel officiel doit d’abord être **restauré, reconnecté ou rendu visible dans le compte/équipe connecté**.

Dès que `chroniques-de-solenne` est de nouveau visible :

1. vérifier qu’il s’agit bien de l’unique projet historique ;
2. vérifier que `develop` produit une preview et que `main` reste la branche de production ;
3. déployer la fondation validée sans créer de second projet ;
4. ouvrir la vraie URL sur les formats mobiles ;
5. rejouer déplacement, ciblage, trois armes, inventaire, stats, sauvegarde et réapparition ;
6. enregistrer le déploiement, l’URL et le rapport distant dans GitHub ;
7. ne proposer une fusion dans `main` qu’après cette validation distante.

## Règle de reprise

Toute nouvelle conversation doit d’abord lire intégralement :

1. `docs/NEXT_CHAT_HANDOFF.md` ;
2. `docs/CURRENT_STATUS.md` ;
3. `docs/VISUAL_STANDARD.md`.

Le prochain travail de jeu part de `develop`. Il ne faut ni repartir des anciennes variantes `official/` ou `release/0.7`, ni dégrader la direction artistique, ni créer un autre dépôt ou projet Vercel.
