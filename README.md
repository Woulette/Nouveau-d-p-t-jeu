# Chroniques de Solenne

MMORPG mobile 2D en pixel art original de **Woulette**, jouable en paysage et piloté au toucher sur une grille.

## État du dépôt

- dépôt officiel : `Woulette/Nouveau-d-p-t-jeu` ;
- `develop` : développement et validation ;
- `main` : production uniquement après validation complète ;
- production courante : `1.2.0-alpha.1` sur `main` ;
- branche de développement resynchronisée après publication : `develop` ;
- cible Vercel unique attendue : `chroniques-de-solenne`.

Le projet Vercel officiel doit être visible et vérifié avant une publication. Aucun autre projet ne doit être utilisé. `voidsector-game` est un autre jeu, totalement hors périmètre.

## Fonctionnalités de la version 1.2

- déplacement tactile case par case avec interpolation fluide ;
- poursuite joueur/monstre recalculée sur les positions engagées et cases réservées ;
- combat automatique au bâton, à la fronde et à l’orbe ;
- interface mobile compacte, monde rendu à 75 %, armes regroupées sur le bord gauche ;
- XP générale, XP de classe et quatre maîtrises ;
- Ours de Solenne et Sylvain épineux, plus résistants et plus généreux en XP ;
- évolution permanente au rang Aventurier 20 vers Épéiste, Archer ou Mage ;
- bonus propres aux trois classes, inventaire, équipement, butin et sauvegarde locale ;
- mort et réapparition sur une case libre du village ;
- atlas PNG et carte générés de manière déterministe ;
- squelette du futur serveur MMO autoritaire.

## Construire

```bash
python3 -m pip install -r requirements-build.txt
python3 scripts/build_all.py
```

La release reconstruite se trouve dans `dist/`. `public/` est une sortie de production générée par le workflow GitHub après validation de `main` ; elle ne doit jamais être modifiée à la main.

## Vérifier

```bash
npm run check
npm run test:repro
npm run build
npm run build:standalone
npm run test:mobile
```

La QA mobile vérifie les formats paysage 667×375, 812×375, 844×390, 896×414 et 932×430, ainsi que le mouvement, les réservations, les combats, les classes, les nouveaux monstres, la sauvegarde et les contrôles tactiles.

Les règles de reprise et de sécurité sont décrites dans `docs/NEXT_CHAT_HANDOFF.md`, `docs/CURRENT_STATUS.md` et `docs/INFRASTRUCTURE_PROTECTION.md`.
