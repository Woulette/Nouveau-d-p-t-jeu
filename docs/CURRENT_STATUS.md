# État courant — Chroniques de Solenne

Dernière mise à jour : **13 juillet 2026**.

Ce fichier contient l’état opérationnel à relire après `docs/NEXT_CHAT_HANDOFF.md`. Pour les faits temporels concernant les branches, la validation et Vercel, ce document est prioritaire.

## Dépôt et branches

Dépôt unique : `Woulette/Nouveau-d-p-t-jeu`.

- `main` : `2c64ef242f209e0218663a5c0dd1debdd90c987d` — ancienne alpha stable, non modifiée pendant la consolidation ;
- `foundation-backup-alpha3` : sauvegarde de l’ancienne alpha ;
- `develop` : branche de travail officielle ; elle contient la fondation validée et les documents de passation obligatoires ;
- `develop-consolidation-work` : `ba407a327c64974c6c53462984166a650e56aeb9`, conservé comme point historique du chantier ;
- `develop-before-consolidation-20260713` : `ada6c571893ab892536c2598e5fd962611a3c363`, sauvegarde intégrale de l’ancien `develop` avant sa remise au propre.

Aucun dépôt GitHub supplémentaire n’a été créé. `main` n’a pas été fusionnée ni réécrite.

La PR finale de contrôle est la **PR #2**, ouverte en brouillon depuis `develop` vers `main`. Elle ne doit pas être fusionnée avant la validation Vercel distante.

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

## Validations GitHub Actions

### Fondation technique

- workflow : `Validate Chroniques de Solenne foundation` ;
- run : `29272490520` ;
- commit testé : `ba407a327c64974c6c53462984166a650e56aeb9` ;
- résultat : **PASS** ;
- artefact : `8288039020` ;
- empreinte : `sha256:5375b89ff65d2d8e392cbc5e33916fc25cc91eb4d3ae0f74e310420db1318649`.

### Branche officielle `develop`

Après la bascule de branche et l’ajout des documents de passation :

- workflow : `Validate Chroniques de Solenne foundation` ;
- run : `29273010400` ;
- commit testé : `b1ecb0a4e3151611eea4e121dddc542433085392` ;
- branche testée : `develop` ;
- résultat : **PASS** ;
- artefact : `8288220304` ;
- empreinte : `sha256:9b022a643eb25feb7b5386da553475d0bab54000c6f502f882fbe2e4306873ba` ;
- conservation prévue jusqu’au **11 octobre 2026**.

### Verrouillage de l’infrastructure

Après la confirmation formelle de l’utilisateur concernant Voidsector :

- document ajouté : `docs/INFRASTRUCTURE_PROTECTION.md` ;
- document rendu obligatoire depuis `PROJECT_CONTEXT.md` ;
- commit contrôlé : `8b01284547f870e78bf78a1a08a969cad069f32c` ;
- workflow : `Validate Chroniques de Solenne foundation` ;
- run : `29273947600` ;
- résultat : **PASS**.

Ces changements ne modifient aucun fichier du moteur, de l’interface, des assets, du build ou des tests. Les artefacts de validation contiennent la release, les rapports JSON et les captures mobiles.

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

## Protection formelle de Voidsector

`voidsector-game` appartient à un autre jeu, déjà terminé ou proche de sa bêta. Il est totalement hors périmètre de Chroniques de Solenne.

Dans le cadre de ce projet, il est formellement interdit de modifier, renommer, relier, transférer, redéployer ou réutiliser :

- le dépôt GitHub de Voidsector ;
- le projet Vercel `voidsector-game` ;
- ses domaines, variables, intégrations, branches ou réglages.

Voidsector ne doit jamais servir de cible temporaire ou de solution de contournement. Toute action Vercel ambiguë doit être annulée plutôt que risquer de viser ce projet.

La règle détaillée et permanente se trouve dans `docs/INFRASTRUCTURE_PROTECTION.md`.

## État réel de Vercel

Équipe connectée vérifiée : **Bigot's projects**.

Au moment du dernier contrôle :

- le projet obligatoire `chroniques-de-solenne` n’apparaît pas dans cette équipe ;
- l’URL `chroniques-de-solenne.vercel.app` ne correspond à aucun déploiement accessible ;
- l’API Vercel répond `404` pour ce projet et ce déploiement ;
- seul le projet sans rapport `voidsector-game` est visible.

Conformément aux consignes, **aucun nouveau projet Vercel n’a été créé** et aucun déploiement n’a été envoyé vers `voidsector-game`.

## Blocage actuel et prochaine action exacte

Le code est prêt pour une prévisualisation Vercel depuis `develop`, mais le projet Vercel officiel doit d’abord être **restauré, reconnecté ou rendu visible dans le compte ou l’équipe connecté**.

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
3. `docs/INFRASTRUCTURE_PROTECTION.md` ;
4. `docs/VISUAL_STANDARD.md`.

Le prochain travail de jeu part de `develop`. Il ne faut ni repartir des anciennes variantes `official/` ou `release/0.7`, ni dégrader la direction artistique, ni créer un autre dépôt ou projet Vercel.
