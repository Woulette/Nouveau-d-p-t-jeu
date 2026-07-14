# Validation distante Vercel — 1.2.0-alpha.1

Validation effectuée le **14 juillet 2026** sur l’unique production officielle :

`https://chroniques-de-solenne.vercel.app`

## Chaîne publiée

- merge de production : `e0f1a92370569001e04e97b9bc8d54746a561fbe` ;
- sortie statique validée : `bcd32bdc5c90c1f7d420abdf04046399d1505801` ;
- marqueur distant : version `1.2.0-alpha.1`, branche `main`, validation `PASS` ;
- statut Vercel du commit statique : `success` ;
- réponse publique : HTTP 200, serveur Vercel, HTML 1.2.

## QA Chromium distante

- formats 667×375, 812×375, 844×390, 896×414 et 932×430 : PASS ;
- aucune erreur console, JavaScript, réseau ou réponse HTTP en échec ;
- monde à 75 %, commandes tactiles d’au moins 44 px et armes alignées à gauche ;
- déplacement tactile sur grille : PASS ;
- poursuite simultanée joueur/monstre, attaque et réservations sans chevauchement : PASS ;
- Ours de Solenne et Sylvain épineux présents avec récompenses supérieures : PASS ;
- évolution permanente vers Archer et persistance après rechargement : PASS ;
- service worker actif avec uniquement le cache `solenne-alpha-1.2.0-a1` : PASS.

Le connecteur Vercel reste limité en lecture pour ce projet (404/403), mais la cible a été confirmée visuellement par l’utilisateur, par l’intégration GitHub/Vercel et par l’URL canonique testée. Aucun autre projet n’a été utilisé.
