# Tests

Avant toute publication sur `main` :

```bash
npm run check
npm run test:repro
npm run build
npm run build:standalone
npm run test:mobile
```

- `check` valide les fragments sources ;
- `test:repro` génère deux fois les atlas et compare leurs SHA-256 ;
- `build` génère les assets, les audite, assemble `dist/` et lance la validation statique ;
- `build:standalone` produit la page autonome de QA ;
- `test:mobile` sert `dist/` et exécute Playwright sur 667×375, 812×375, 844×390, 896×414 et 932×430.

La QA mobile couvre les contrôles tactiles, le rail d’armes à gauche, les chevauchements, la poursuite simultanée, les réservations et respawns, les trois styles, l’Ours, le Sylvain, les bonus des trois classes, le rang Aventurier 20 et la sauvegarde permanente.

Rapports suivis :

- `docs/ASSET_AUDIT.json` ;
- `docs/BUILD_REPORT.json` ;
- `docs/STATIC_VALIDATION.json` ;
- `docs/REPRODUCIBILITY.json` ;
- `docs/MOBILE_QA.json` ;
- captures dans `tests/output/` lors de la CI.
