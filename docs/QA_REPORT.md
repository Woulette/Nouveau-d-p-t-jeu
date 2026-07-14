# Rapport QA — production 1.2.0-alpha.1

## État

- génération et audit des assets : PASS ;
- assemblage `dist/` et validation statique : PASS ;
- page autonome : PASS ;
- reproductibilité : à prendre uniquement dans `docs/REPRODUCIBILITY.json` généré sur le dernier arbre ;
- exécution Chromium locale : PASS sur 667×375, 812×375, 844×390, 896×414 et 932×430 ;
- workflow GitHub Playwright : à confirmer après le push du commit exact ;
- QA distante Vercel : PASS sur `https://chroniques-de-solenne.vercel.app`.

## Scénarios Chromium validés localement

- aucune erreur JavaScript ni écran fatal ;
- monde à 75 %, contrôles visibles, armes à gauche et cibles tactiles ≥44 px ;
- aucune collision majeure entre HUD, cible et menus ;
- poursuite simultanée : joueur et monstre parcourent plusieurs cases avant que le joueur frappe ;
- aucune case réservée commune, position fractionnaire au repos ou étape diagonale ;
- respawn et chargement sans superposition ;
- trois styles de combat ;
- Ours et Sylvain plus forts et plus généreux en XP ;
- profils Épéiste, Archer et Mage, dont l’avantage de portée Archer en combat réel ;
- transition Aventurier 19→20, choix permanent, conservation des données et sauvegarde après rechargement.

Les tests doivent être rejoués sur l’URL exacte avant toute annonce de production.
