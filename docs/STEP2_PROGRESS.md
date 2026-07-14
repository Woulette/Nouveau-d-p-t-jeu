# Étape 2 — Harmonie visuelle et jouabilité mobile

## État actuel

`1.2.0-alpha.1` est un candidat de l’étape 2 sur `develop`, pas encore une release de production.

### Intégré au candidat

- monde rendu à 75 % pour augmenter la surface visible et se rapprocher de la densité de la référence ;
- HUD compact, cibles tactiles d’au moins 44 px et centre de l’écran dégagé ;
- bâton, fronde et orbe alignés sur le bord gauche ;
- poursuite dynamique, réservations et respawns sans superposition ;
- Ours de Solenne et Sylvain épineux avec animations complètes ;
- évolution permanente Épéiste, Archer ou Mage au rang Aventurier 20 ;
- bonus de classe réels et sauvegardés ;
- versionnement des URLs d’assets pour les mises à niveau PWA.

### Validation avant livraison

- workflow Playwright GitHub sur les quatre formats mobiles ;
- comparaison visuelle des captures avec la référence ;
- revue du commit exact de `develop` ;
- restauration ou reconnexion non ambiguë de la cible Vercel officielle ;
- génération automatique de `public/` depuis `main` ;
- QA complète de l’URL distante.

### Suite artistique

- augmenter la variété des décors et des silhouettes ;
- améliorer les transitions et impacts de combat ;
- poursuivre l’équilibrage des nouvelles zones et familles ;
- conserver le pipeline déterministe comme source officielle.
