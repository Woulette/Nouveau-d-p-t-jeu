# État courant — Chroniques de Solenne

Dernière mise à jour : **13 juillet 2026**.

Ce fichier contient l’état opérationnel à relire après `docs/NEXT_CHAT_HANDOFF.md`. Pour les faits temporels concernant les branches, la validation et Vercel, ce document est prioritaire.

## Dépôt, branches et mise en production

Dépôt unique : `Woulette/Nouveau-d-p-t-jeu`.

- `main` : branche de production ;
- `develop` : branche de développement officielle ;
- `foundation-backup-alpha3` : sauvegarde de l’ancienne alpha ;
- `develop-consolidation-work` : point historique de la consolidation ;
- `develop-before-consolidation-20260713` : sauvegarde intégrale de l’ancien `develop` avant sa remise au propre.

La PR **#2**, `develop` vers `main`, a été validée puis fusionnée le 13 juillet 2026.

- commit de fusion : `94fb2a9850aacd9073ea5f8786e90a5069bca074` ;
- titre : `release: publier la fondation jouable de Chroniques de Solenne` ;
- aucun dépôt GitHub supplémentaire n’a été créé.

## Version jouable publiée

Version : `1.1.0-foundation.1`.

Le build reste entièrement reproductible à partir des sources du dépôt :

1. génération déterministe des atlas PNG et de la carte ;
2. audit des dimensions, du contenu et des SHA-256 ;
3. assemblage des fragments réels du moteur JavaScript ;
4. génération de `dist/` et de `dist/standalone.html` ;
5. validation statique ;
6. QA Chromium sur la release réellement servie par HTTP.

Les vrais assets ont été conservés. Aucun sprite, décor, effet ou icône n’a été remplacé par un emoji, un rectangle ou un placeholder.

## QA mobile et fonctionnelle validée

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

Le workflow `Validate Chroniques de Solenne foundation` et ses artefacts conservent les rapports JSON et les captures mobiles.

## Publication Vercel reproductible

Projet Vercel unique : `chroniques-de-solenne`.

Adresse de production :

```text
https://chroniques-de-solenne.vercel.app
```

Le projet a été reconnecté par l’utilisateur au dépôt officiel. La première tentative de production depuis le build Python Vercel a échoué. Pour supprimer cette dépendance au système de build distant sans modifier le jeu, une publication statique contrôlée a été mise en place :

1. le workflow `.github/workflows/prepare-vercel-static.yml` reconstruit le jeu depuis les sources ;
2. il exécute les validations de source, d’assets, de reproductibilité et la QA mobile ;
3. il copie seulement la sortie validée de `dist/` vers `public/` ;
4. il commit cette sortie avec le compte `github-actions[bot]` ;
5. `vercel.json` vérifie les fichiers essentiels et publie `public/` sans régénérer les assets sur Vercel.

Commits de publication importants :

- `56b625c6ff588cf001252b40d5917f64928efe23` — ajout du workflow de préparation ;
- `00214d7034e38b1274a5db1a3d087162dcfba687` — première release statique validée ;
- `843d01317fbf60aa2ae1beef4953d7e8b0f62efe` — configuration Vercel vers `public/` ;
- `c2a9a3c733cc971999d88bbfb69a0d07a8b3f5dc` — sortie statique régénérée depuis la configuration finale.

Le statut Vercel du commit `c2a9a3c733cc971999d88bbfb69a0d07a8b3f5dc` est **SUCCESS**.

Le répertoire `public/` est une sortie générée. Les modifications de jeu doivent toujours être réalisées dans les sources, puis reconstruites et validées par le workflow ; il ne faut jamais modifier manuellement les PNG ou le moteur généré dans `public/`.

## Protection formelle de Voidsector

`voidsector-game` appartient à un autre jeu, déjà terminé ou proche de sa bêta. Il est totalement hors périmètre de Chroniques de Solenne.

Dans le cadre de ce projet, il est formellement interdit de modifier, renommer, relier, transférer, redéployer ou réutiliser :

- le dépôt GitHub de Voidsector ;
- le projet Vercel `voidsector-game` ;
- ses domaines, variables, intégrations, branches ou réglages.

Voidsector n’a été touché à aucun moment pendant cette publication. La règle détaillée et permanente se trouve dans `docs/INFRASTRUCTURE_PROTECTION.md`.

## Prochaine étape

1. ouvrir la production sur téléphone en mode paysage ;
2. vérifier déplacement, ciblage, bâton, fronde, orbe, inventaire, statistiques, potion, sauvegarde et réapparition ;
3. enregistrer tout défaut concret dans GitHub avant la prochaine modification ;
4. reprendre ensuite la phase 2 sur `develop` : élévation artistique et animations, sans régression fonctionnelle ou graphique.

## Règle de reprise

Toute nouvelle conversation doit d’abord lire intégralement :

1. `docs/NEXT_CHAT_HANDOFF.md` ;
2. `docs/CURRENT_STATUS.md` ;
3. `docs/INFRASTRUCTURE_PROTECTION.md` ;
4. `docs/VISUAL_STANDARD.md`.

Le prochain travail de jeu part de `develop`. Il ne faut ni repartir des anciennes variantes `official/` ou `release/0.7`, ni dégrader la direction artistique, ni créer un autre dépôt ou projet Vercel.
