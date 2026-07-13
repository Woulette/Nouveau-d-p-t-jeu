# Chroniques de Solenne

Fondation officielle du MMORPG mobile 2D en pixel art de **Woulette**.

## État du dépôt

- `main` : uniquement une version stable validée pour la production.
- `develop` : consolidation, refonte graphique et tests avant publication.
- projet Vercel unique attendu : `chroniques-de-solenne`.

Version de fondation : `1.1.0-foundation.1`.

## Ce que contient cette fondation

- moteur mobile paysage sur grille ;
- toucher une case pour calculer un chemin et se déplacer case par case ;
- toucher un monstre pour l’approcher puis l’attaquer automatiquement ;
- bâton, fronde et orbe magique ;
- XP générale, XP de classe et quatre maîtrises par action ;
- vitesse de base 100 puis +1 par niveau général ;
- inventaire, équipement, butin et sauvegarde locale ;
- mort et réapparition au village ;
- choix permanent Épéiste, Archer ou Mage au rang Aventurier 20 ;
- véritable pipeline d’assets PNG reproductible ;
- squelette du futur serveur MMO autoritaire.

## Assets

Les PNG ne sont pas dessinés dans l’interface avec des emojis. Ils sont générés à la résolution pixel native par `scripts/generate_assets.py`, puis audités et copiés dans `dist/` pendant le build. La génération est déterministe : deux builds identiques produisent les mêmes sommes SHA-256.

Cette fondation graphique est la base technique de la phase 2. Chaque nouvelle version devra conserver ou améliorer sa qualité. Aucun placeholder ne peut être fusionné sur `main`.

## Construire

```bash
python3 -m pip install -r requirements-build.txt
python3 scripts/build_all.py
```

Le site prêt à publier se trouve dans `dist/`.

## Vérifier

```bash
python3 tests/reproducibility.py
python3 scripts/build_single_file.py
python3 tests/mobile_qa.py
```

La QA mobile utilise Chromium/Playwright et vérifie les formats paysage 667×375, 844×390, 896×414 et 932×430.
