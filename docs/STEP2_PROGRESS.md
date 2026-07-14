# Étape 2 — Harmonie visuelle et jouabilité mobile

## État actuel

`1.2.0-alpha.1` est la release de production actuelle, publiée sur `main` et validée sur Vercel.

### Intégré au candidat

- monde rendu à 75 % pour augmenter la surface visible et se rapprocher de la densité de la référence ;
- HUD compact, cibles tactiles d’au moins 44 px et centre de l’écran dégagé ;
- bâton, fronde et orbe alignés sur le bord gauche ;
- poursuite dynamique, réservations et respawns sans superposition ;
- Ours de Solenne et Sylvain épineux avec animations complètes ;
- évolution permanente Épéiste, Archer ou Mage au rang Aventurier 20 ;
- bonus de classe réels et sauvegardés ;
- versionnement des URLs d’assets pour les mises à niveau PWA.

### Validation de la livraison

- workflow Playwright GitHub sur les cinq formats mobiles : PASS ;
- comparaison visuelle des captures avec la référence : PASS ;
- merge source `e0f1a92370569001e04e97b9bc8d54746a561fbe` ;
- génération automatique de `public/` : `bcd32bdc5c90c1f7d420abdf04046399d1505801` ;
- production Vercel et QA complète de l’URL distante : PASS.

### Suite artistique

- augmenter la variété des décors et des silhouettes ;
- améliorer les transitions et impacts de combat ;
- poursuivre l’équilibrage des nouvelles zones et familles ;
- conserver le pipeline déterministe comme source officielle.
