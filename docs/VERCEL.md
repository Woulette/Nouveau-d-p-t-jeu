# Vercel officiel

Un seul projet Vercel est autorisé :

```text
chroniques-de-solenne
```

Production attendue : branche `main`. Les previews de `develop` doivent appartenir au même projet. Aucun projet supplémentaire ne doit être créé pour une correction ou un test.

## Chaîne de publication réelle

Vercel ne reconstruit pas les atlas du jeu :

1. `.github/workflows/prepare-vercel-static.yml` installe les dépendances sur GitHub Actions ;
2. le workflow reconstruit `dist/` depuis les sources ;
3. il exécute l’audit, la reproductibilité, la validation statique et la QA mobile Playwright ;
4. il copie uniquement la sortie validée dans `public/` et ajoute `public/vercel-release.json` ;
5. `vercel.json` appelle `scripts/verify_vercel_release.js`, qui vérifie la version, le statut `PASS`, la branche `main` et les fichiers essentiels avant de publier `public/`.

`public/` est généré : ne jamais le modifier à la main et ne jamais lancer une production avec une sortie ancienne.

## État au 14 juillet 2026

- production validée : `1.2.0-alpha.1` ;
- merge source : `e0f1a92370569001e04e97b9bc8d54746a561fbe` ;
- commit statique servi : `bcd32bdc5c90c1f7d420abdf04046399d1505801` ;
- domaine vérifié : `https://chroniques-de-solenne.vercel.app` ;
- le bot Vercel, la capture utilisateur et la production HTTP confirment le projet historique `chroniques-de-solenne` ;
- le connecteur Vercel reste limité en lecture sur ce projet, sans empêcher l’intégration GitHub de publier ;
- la commande de build a été déplacée dans un script pour respecter la limite Vercel de 256 caractères ;
- aucun nouveau projet n’a été créé.

Ne jamais rediriger ce jeu vers un autre projet. Avant chaque future publication, vérifier le nom, l’équipe, la branche, le commit et l’URL exacte.

Un statut « Ready » ne suffit pas : la release n’est validée qu’après ouverture de l’URL distante, contrôle du numéro de build, absence d’erreur console et rejeu des scénarios mobiles.
