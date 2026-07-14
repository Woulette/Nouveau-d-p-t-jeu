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

- dernière production historiquement validée : `1.1.0-foundation.1` ;
- candidat source actuel : `1.2.0-alpha.1` sur `develop` ;
- le candidat 1.2 n’est pas encore publié ;
- le bot Vercel du PR GitHub confirme que le dépôt reste relié au projet historique `chroniques-de-solenne` ;
- ce même projet reste toutefois invisible via le connecteur Vercel, y compris par son identifiant exact ;
- la commande de build a été déplacée dans un script pour respecter la limite Vercel de 256 caractères ;
- aucun nouveau projet n’a été créé.

Tant que la cible officielle n’est pas visible et non ambiguë, arrêter la publication. Ne jamais rediriger ce jeu vers un autre projet. Après reconnexion, vérifier le nom, l’équipe, la branche, le commit et l’URL exacte avant toute action.

Un statut « Ready » ne suffit pas : la release n’est validée qu’après ouverture de l’URL distante, contrôle du numéro de build, absence d’erreur console et rejeu des scénarios mobiles.
