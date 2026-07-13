# Vercel officiel

Un seul projet Vercel doit être utilisé :

```text
chroniques-de-solenne
```

Configuration :

- construction : installation de Pillow puis `python3 scripts/build_all.py` ;
- sortie : `dist/` ;
- production : branche `main` ;
- prévisualisation : branche `develop` ;
- aucune création d’un nouveau projet pour une correction ou une preview.

Le build génère lui-même les atlas PNG, audite les fichiers puis assemble un site statique. Une publication ne peut être validée uniquement parce que Vercel affiche « Ready » : le site distant doit aussi être ouvert et testé.
