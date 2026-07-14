# État courant — Chroniques de Solenne

Dernière mise à jour : **14 juillet 2026**.

Ce document est la source prioritaire pour l’état temporel du dépôt, des validations et de Vercel. Les règles permanentes restent dans `NEXT_CHAT_HANDOFF.md` et `INFRASTRUCTURE_PROTECTION.md`.

## Dépôt et branches

Dépôt unique : `Woulette/Nouveau-d-p-t-jeu`.

- `develop` : branche de développement officielle ;
- `main` : branche de production ;
- `foundation-backup-alpha3` et `develop-before-consolidation-20260713` : sauvegardes historiques ;
- `develop-consolidation-work` : branche historique, ce n’est plus la branche de travail courante.

## Candidat source actuel

Version : `1.2.0-alpha.1`.

Le candidat de `develop` apporte :

- poursuite dynamique fondée sur les positions visuelles et engagées, avec recalcul de route ;
- réservation des cases de départ et d’arrivée pour empêcher joueur et monstres de se superposer ;
- respawn différé ou déplacé quand une case est occupée ;
- rendu du monde à 75 % et HUD compact ;
- bâton, fronde et orbe dans un rail vertical à gauche ;
- Ours de Solenne et Sylvain épineux, plus forts et donnant davantage d’XP ;
- passage normal Aventurier 19→20, plafond au rang 20, confirmation et choix permanent Épéiste/Archer/Mage ;
- bonus de classe réels sans perte du niveau général, des maîtrises, de l’inventaire ou de l’équipement ;
- URLs d’assets révisionnées pour éviter le mélange des caches 1.1 et 1.2.

## Validation locale du candidat

La génération d’assets, l’audit, l’assemblage, la validation statique, la reproductibilité et la page autonome sont validés localement.

Le jeu a aussi été exécuté dans Chromium sur les formats paysage suivants :

- 667 × 375 ;
- 812 × 375 ;
- 844 × 390 ;
- 896 × 414 ;
- 932 × 430.

Les contrôles navigateur ont validé sans erreur console :

- une poursuite simultanée où joueur et monstre changent plusieurs fois de case avant que le joueur frappe ;
- l’absence de case réservée commune, de pas diagonal et de position fractionnaire au repos ;
- les respawns et chargements sur une case libre ;
- les trois styles, les profils des trois classes et la portée propre à l’Archer ;
- la force et les récompenses supérieures de l’Ours et du Sylvain ;
- le choix de classe permanent, sa sauvegarde et le verrouillage d’un second choix ;
- des cibles tactiles d’au moins 44 px, un rail d’armes à gauche et aucun chevauchement majeur du HUD.

Le workflow GitHub `Validate Chroniques de Solenne` a confirmé le même scénario dans l’environnement Playwright officiel sur le PR `develop` → `main`. Sources, assets, build, page autonome, QA mobile et rapports sont tous passés.

## Production historique et sortie `public/`

La dernière version de production historiquement validée reste `1.1.0-foundation.1`.

`public/` est une sortie générée et peut rester en 1.1 sur `develop`. Après fusion d’un candidat validé dans `main`, `.github/workflows/prepare-vercel-static.yml` reconstruit `dist/`, exécute toute la QA, remplace `public/`, puis commit uniquement la sortie validée. Ne jamais modifier `public/` à la main et ne jamais déployer directement un arbre où cette sortie est ancienne.

## État Vercel actuel

Cible unique attendue : `chroniques-de-solenne`, URL historique `https://chroniques-de-solenne.vercel.app`.

Lors de la vérification du 14 juillet 2026, le bot Vercel du PR GitHub confirme que l’intégration du dépôt cible bien le projet historique `chroniques-de-solenne`. Le connecteur Vercel de l’équipe **Bigot's projects** ne voit cependant toujours pas ce projet et l’accès direct par son identifiant exact renvoie « introuvable ». Le seul autre projet visible est hors périmètre et ne doit jamais être inspecté, modifié ou redéployé.

Le premier preview a aussi révélé que l’ancien `buildCommand` dépassait la limite Vercel de 256 caractères. La vérification a été déplacée dans `scripts/verify_vercel_release.js` : elle refuse toute sortie dont la version, la validation, la branche ou les fichiers essentiels ne correspondent pas à la release attendue.

Conséquences :

- le candidat 1.2 n’est pas encore publié ni vérifié à distance ;
- aucun nouveau projet Vercel ne doit être créé pour contourner ce blocage ;
- la production ne doit être déclenchée qu’après restauration ou reconnexion non ambiguë du projet historique ;
- une publication n’est terminée qu’après ouverture et QA de l’URL distante exacte.

## Prochaine action sûre

1. rendre le projet Vercel historique visible/reconnecté sans toucher à un autre projet ;
2. vérifier son nom, son équipe, son identifiant, la branche et le domaine ;
3. fusionner le PR validé dans `main` seulement après cette vérification ;
4. attendre la génération automatique de `public/` ;
5. vérifier le déploiement et rejouer la QA distante.
