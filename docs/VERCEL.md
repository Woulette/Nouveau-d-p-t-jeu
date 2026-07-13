# Vercel officiel

Un seul projet Vercel doit être utilisé :

```text
chroniques-de-solenne
```

Configuration attendue :

- construction : installation de Pillow puis `python3 scripts/build_all.py` ;
- sortie : `dist/` ;
- production : branche `main` ;
- prévisualisation : branche `develop` ;
- aucune création d’un nouveau projet pour une correction ou une preview.

Le build génère lui-même les atlas PNG, audite les fichiers puis assemble un site statique. Une publication ne peut pas être validée uniquement parce que Vercel affiche « Ready » : le site distant doit aussi être ouvert et testé.

## État vérifié le 13 juillet 2026

Dans l’équipe connectée **Bigot's projects**, le projet `chroniques-de-solenne` n’est actuellement pas visible et l’URL historique renvoie un état introuvable. Le seul projet listé est `voidsector-game`, qui ne doit jamais recevoir ce jeu.

Aucun nouveau projet n’a été créé. Avant tout déploiement, il faut restaurer, reconnecter ou rendre visible le projet historique `chroniques-de-solenne`. Les détails et la procédure de reprise se trouvent dans `docs/CURRENT_STATUS.md`.
