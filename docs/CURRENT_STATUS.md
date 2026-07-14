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

Le workflow GitHub `Validate Chroniques de Solenne` doit encore confirmer le même scénario avec l’environnement Playwright officiel après le push.

## Production historique et sortie `public/`

La dernière version de production historiquement validée reste `1.1.0-foundation.1`.

`public/` est une sortie générée et peut rester en 1.1 sur `develop`. Après fusion d’un candidat validé dans `main`, `.github/workflows/prepare-vercel-static.yml` reconstruit `dist/`, exécute toute la QA, remplace `public/`, puis commit uniquement la sortie validée. Ne jamais modifier `public/` à la main et ne jamais déployer directement un arbre où cette sortie est ancienne.

## État Vercel actuel

Cible unique attendue : `chroniques-de-solenne`, URL historique `https://chroniques-de-solenne.vercel.app`.

Lors de la vérification du 14 juillet 2026, le connecteur Vercel de l’équipe **Bigot's projects** ne voit pas ce projet et l’accès direct par identifiant renvoie « introuvable ». Le seul autre projet visible est hors périmètre et ne doit jamais être inspecté, modifié ou redéployé.

Conséquences :

- le candidat 1.2 n’est pas encore publié ni vérifié à distance ;
- aucun nouveau projet Vercel ne doit être créé pour contourner ce blocage ;
- la production ne doit être déclenchée qu’après restauration ou reconnexion non ambiguë du projet historique ;
- une publication n’est terminée qu’après ouverture et QA de l’URL distante exacte.

## Prochaine action sûre

1. pousser le commit candidat sur `develop` ;
2. attendre le workflow GitHub de validation et corriger tout échec ;
3. rendre le projet Vercel historique visible/reconnecté sans toucher à un autre projet ;
4. fusionner dans `main` seulement après validation ;
5. attendre la génération automatique de `public/` ;
6. vérifier le déploiement et rejouer la QA distante.
