# Protection permanente de l’infrastructure

Dernière confirmation utilisateur : **13 juillet 2026**.

## Périmètre de Chroniques de Solenne

Toutes les opérations concernant Chroniques de Solenne doivent rester limitées à :

- dépôt GitHub : `Woulette/Nouveau-d-p-t-jeu` ;
- branche de développement officielle : `develop` ;
- branche de production : `main`, uniquement après validation complète ;
- projet Vercel unique autorisé : `chroniques-de-solenne` ;
- domaine de production attendu : `chroniques-de-solenne.vercel.app`.

## Interdiction formelle concernant Voidsector

Le dépôt et le projet Vercel **`voidsector-game`** appartiennent à un autre jeu, déjà terminé ou proche de sa bêta. Ils n’ont aucun lien technique ou fonctionnel avec Chroniques de Solenne.

Il est formellement interdit, dans le cadre de Chroniques de Solenne, de :

- modifier le dépôt GitHub de Voidsector ;
- modifier son projet Vercel ;
- déclencher un déploiement vers `voidsector-game` ;
- renommer, relier, transférer ou réutiliser ce projet ;
- modifier ses domaines, variables, intégrations, branches ou réglages ;
- utiliser Voidsector comme cible temporaire, preview ou solution de contournement.

Une opération Vercel doit être abandonnée immédiatement si elle ne peut pas être ciblée sans ambiguïté vers le projet exact `chroniques-de-solenne`.

## Projet Vercel de Chroniques de Solenne absent ou invisible

Si `chroniques-de-solenne` n’est pas visible dans le compte ou l’équipe Vercel connecté :

1. ne jamais sélectionner le seul autre projet disponible par défaut ;
2. ne jamais toucher à `voidsector-game` ;
3. ne pas annoncer qu’un déploiement a réussi ;
4. enregistrer le blocage dans `docs/CURRENT_STATUS.md` ;
5. restaurer ou reconnecter la cible officielle avant toute publication.

## Règle de non-régression

Aucune opération d’infrastructure ne justifie de remplacer les vrais assets, animations, décors ou effets par des placeholders. Le build publié doit provenir du dépôt officiel et passer la QA mobile avant d’être présenté à l’utilisateur.
