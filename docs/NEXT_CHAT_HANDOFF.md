# Chroniques de Solenne — Contexte canonique pour le prochain chat

> **But de ce document** : éviter toute perte de contexte, toute régression graphique et toute multiplication de dépôts ou de projets Vercel. Le prochain assistant doit lire ce fichier en entier avant de modifier quoi que ce soit.
>
> **Règle d’autorité** : ce document rassemble les demandes confirmées par l’utilisateur dans la conversation. Lorsqu’un ancien prototype, un rapport, une capture ou un ancien message contredit ce document, **ce document et les nouvelles consignes explicites de l’utilisateur priment**.

---

## 1. Identité du projet et infrastructure unique

### Jeu

- Nom de travail visible : **Chroniques de Solenne**.
- Première zone de travail : **Clairière de Solenne**.
- Langue de l’interface : **français**.
- Genre : **MMORPG mobile 2D en pixel art, vue du dessus**.
- Inspiration fonctionnelle et visuelle générale : **Rucoy Online**, sans copier ses sprites, cartes, interfaces, noms, monstres ou autres ressources protégées.

### GitHub officiel

- Dépôt unique : **`Woulette/Nouveau-d-p-t-jeu`**.
- Ne créer **aucun autre dépôt GitHub** pour ce jeu.
- Le dépôt est actuellement public ; ne pas changer sa visibilité sans accord de l’utilisateur.
- `main` doit contenir uniquement une version stable, testée et destinée à la production.
- Branche de sauvegarde existante : `foundation-backup-alpha3`.
- Branche de développement officielle : `develop`.
- `develop-consolidation-work` est uniquement un jalon historique de la consolidation.
- Ne jamais écraser une version stable sans branche de sauvegarde ou commit récupérable.

### Vercel officiel

- Équipe : **Bigot's projects**.
- Nom du projet Vercel unique : **`chroniques-de-solenne`**.
- Adresse de production souhaitée : `https://chroniques-de-solenne.vercel.app`.
- Ne créer **aucun projet Vercel de test supplémentaire**.
- Les previews de branches doivent être des déploiements du **même projet**, pas de nouveaux projets.
- Avant tout déploiement, lister les projets et vérifier si `chroniques-de-solenne` existe déjà.
- Si le projet n’est pas visible, ne pas inventer son état : expliquer précisément le blocage et, si une création est nécessaire, créer **exactement un seul projet** après vérification.
- Ne jamais annoncer qu’une version est jouable sur Vercel uniquement parce que Vercel affiche « Ready ». Ouvrir l’URL distante, vérifier le contenu réel et exécuter les tests mobiles avant de donner le lien à l’utilisateur.

---

## 2. Vision du jeu

L’utilisateur veut un vrai MMORPG mobile agréable à regarder et à jouer, pas une simple démo technique.

Le jeu doit donner l’impression d’un monde vivant : clairière, village, chemins, végétation dense, détails au sol, monstres visibles, personnage animé, effets de coups et interface soignée. La première tranche peut être solo pendant que le vrai serveur MMO est construit, mais elle doit déjà représenter correctement le futur jeu.

La direction artistique doit conserver l’esprit de la capture de référence fournie par l’utilisateur :

- pixel art fantasy chaleureux et coloré ;
- terrain construit sur des tuiles mais sans aspect vide ou répétitif ;
- herbe avec plusieurs variantes ;
- fleurs, hautes herbes, petites plantes et détails au sol ;
- arbres volumineux avec feuillage détaillé et ombres ;
- buissons, rochers et souches avec variations ;
- chemins de terre ;
- maisons, panneaux, clôtures, lampadaires, puits et éléments de village ;
- personnage lisible au centre de l’action ;
- anneau ou indicateur sous le personnage ;
- nom, classe ou niveau au-dessus des entités lorsque pertinent ;
- interface sombre, lisible et élégante avec bordures ou accents dorés.

La version paysage ne doit pas être une version étirée, vide ou appauvrie de la référence portrait. Elle doit conserver une forte densité visuelle et une composition propre.

---

## 3. Règles absolues concernant les graphismes

### Obligatoire

- Utiliser de **vrais assets pixel art** exploitables par le moteur : PNG transparents, atlas ou spritesheets documentés.
- Garder une palette cohérente, des dimensions cohérentes et des contours lisibles sur mobile.
- Les assets doivent être originaux.
- Réutiliser les assets déjà créés uniquement s’ils passent un audit de qualité.
- Refaire ou remplacer les assets insuffisants au lieu de les dégrader.
- Conserver les animations lors des corrections techniques.
- Comparer chaque nouvelle capture à la référence et à la meilleure version précédente.

### Interdit en production

- emojis utilisés comme armes, objets, boutons ou personnages ;
- simples rectangles, carrés ou formes CSS à la place des sprites ;
- personnage dessiné avec quelques blocs sans vraie animation ;
- grand écran vert ou terrain uniforme ;
- disparition des animations pour résoudre un bug ;
- remplacement d’assets détaillés par des placeholders ;
- mockups promotionnels utilisés tels quels comme sprites de jeu ;
- textes générés illisibles dans les assets ;
- copie directe de ressources de Rucoy Online.

Les images générées servant de concept ou de planche d’ambiance ne sont pas automatiquement des assets de production. Pour devenir utilisables, elles doivent être découpées, nettoyées, redessinées si nécessaire, mises à l’échelle pixel-perfect, exportées avec transparence et organisées en atlas documentés.

---

## 4. Plateforme, orientation et commandes

### Plateforme prioritaire

- Le jeu doit sortir d’abord sur **mobile**.
- Première cible technique : application web mobile/PWA déployée sur Vercel.
- Une application Android native ou emballée pourra venir plus tard, sans refaire le jeu.

### Orientation

- Téléphone **horizontal, mode paysage**.
- Prévoir les zones sûres des écrans avec encoche.
- Si le téléphone est en portrait, afficher une invitation à le tourner en mode paysage.

### Déplacement

- **Aucun joystick**.
- Aucun D-pad permanent.
- Le joueur touche une case du terrain pour se déplacer.
- Le monde est une grille logique.
- Le déplacement n’est pas libre/analogique.
- Le moteur calcule un chemin, puis avance case par case.
- Le rendu entre deux cases doit être animé de façon fluide.
- Les arbres, rochers, bâtiments, clôtures, eau et autres obstacles bloquent réellement le passage.
- Utiliser un pathfinding adapté, par exemple A*.
- La vitesse, les collisions et le chemin devront être validés par le serveur lorsque le MMO sera connecté.

---

## 5. Interface mobile attendue

Organisation générale inspirée de la référence :

- **Haut gauche** : portrait, nom du personnage, zone, classe, niveau général, PV et PM.
- **Haut droite** : paramètres ; éventuellement mini-carte ou quête lorsqu’il y a assez d’espace.
- **Bas gauche** : XP générale et XP de classe/métier.
- **Côté gauche** : rail vertical bâton, fronde et orbe.
- **Côté droit** : inventaire et statistiques.
- **Bas droite** : potion séparée.
- **Centre** : monde, personnage, monstres, noms, niveaux, barres de vie, dégâts et effets.

L’interface ne doit pas cacher la majorité de la carte. Elle doit rester lisible aux formats paysage suivants au minimum :

- 667 × 375 ;
- 844 × 390 ;
- 896 × 414 ;
- 932 × 430.

Le nom temporaire du personnage peut rester **Voyageur 801** dans le prototype, mais il ne s’agit pas d’un nom définitif imposé aux comptes futurs.

---

## 6. Personnage initial

Le joueur commence avec :

- niveau général : **1** ;
- classe/métier : **Aventurier** ;
- niveau de classe/métier : **1** ;
- vitesse : **100** ;
- maîtrise corps à corps : niveau initial à définir dans l’équilibrage, mais la progression commence dès les premières attaques ;
- maîtrise distance : idem ;
- maîtrise magie : idem ;
- maîtrise défense : idem.

L’utilisateur appelle parfois cette progression « niveau de métier ». L’interface peut afficher « Classe » pour éviter la confusion avec les futurs métiers de fabrication, mais la mécanique doit rester celle demandée : Aventurier niveau 1, puis changement de classe au niveau 20.

### Équipement et styles disponibles pour l’Aventurier

- Arme de base confirmée : **bâton**.
- L’Aventurier doit aussi pouvoir utiliser avant son choix de classe :
  - un **lance-pierre** pour entraîner la distance ;
  - des **boules magiques** ou un **orbe** pour entraîner la magie.
- Ces styles peuvent être donnés au départ ou débloqués par un tutoriel très court, mais ils doivent tous être accessibles avant le niveau de classe 20.

---

## 7. Animations minimales obligatoires

### Aventurier

- repos/respiration ;
- marche vers le haut ;
- marche vers le bas ;
- marche vers la gauche ;
- marche vers la droite ;
- attaque au bâton ;
- tir au lance-pierre ;
- lancement d’une boule magique ;
- réception d’un coup ;
- mort ;
- réapparition ou retour à l’état normal.

Les animations de combat doivent respecter la direction du personnage autant que possible. Les armes et projectiles doivent être visibles.

### Monstres

Pour chaque famille utilisée dans la tranche verticale :

- repos ;
- déplacement ;
- attaque ;
- dégâts reçus ;
- mort.

Premières familles déjà envisagées ou utilisées :

- Gelée ;
- Rat ;
- Sanglier ;
- Loup ;
- Feu follet ;
- Ours de Solenne ;
- Sylvain épineux.

---

## 8. Combat

### Sélection et attaque automatique

1. Le joueur touche un monstre.
2. Le monstre devient la cible.
3. Le personnage cherche un chemin valide.
4. Il se déplace automatiquement jusqu’à la portée nécessaire.
5. Il s’arrête à la bonne distance.
6. Il attaque automatiquement.
7. Il suit la cible si elle change de case.
8. Le combat s’arrête lorsque la cible meurt, devient inaccessible, est remplacée ou lorsque le joueur annule.

Pendant la poursuite, chaque acteur recalcule depuis sa case engagée et la case engagée de sa cible. Les cases de départ et de destination sont réservées, et une attaque ne peut commencer que lorsque l’attaquant est stabilisé sur une case.

### Styles

#### Bâton

- style corps à corps ;
- portée courte, généralement une case adjacente ;
- chaque attaque valide donne de l’XP de corps à corps.

#### Lance-pierre

- style distance ;
- portée de plusieurs cases ;
- ligne de vue ;
- projectile visible ;
- chaque projectile valide donne de l’XP de distance.

#### Magie

- boule magique/orbe ;
- portée de plusieurs cases ;
- ligne de vue ;
- projectile et effet d’impact visibles ;
- consomme des PM ;
- chaque attaque magique valide donne de l’XP de magie.

Le client demande une action ; le serveur devra décider si l’action est valide. Le client ne doit jamais être autorisé à déclarer directement ses dégâts, sa position ou son XP dans la future version MMO.

---

## 9. Progression générale, classe et maîtrises

Le jeu possède trois couches de progression distinctes.

### Niveau général

- Commence au niveau 1.
- Augmente grâce à l’XP obtenue principalement à la mort des monstres.
- Sert à augmenter les capacités générales, l’accès aux zones et la vitesse.

### Niveau de classe/métier

- Commence avec Aventurier niveau 1.
- Les monstres donnent de l’XP de classe à leur mort.
- Au niveau Aventurier 20, le joueur peut choisir une classe auprès d’un mentor.
- Après le choix, la nouvelle classe recommence au niveau 1.

### Maîtrises entraînables

- corps à corps ;
- distance ;
- magie ;
- défense.

Règles confirmées :

- coup de bâton valide → un peu d’XP corps à corps ;
- projectile du lance-pierre valide → un peu d’XP distance ;
- sort valide → un peu d’XP magie ;
- attaque ennemie reçue → un peu d’XP défense ;
- cette XP est donnée à chaque action, sans attendre la mort du monstre ;
- cette XP est personnelle et n’est jamais partagée avec le groupe ;
- les maîtrises entraînées ne disparaissent pas lors d’un changement ou d’une évolution de classe.

### Vitesse

- Vitesse de base au niveau général 1 : **100**.
- Chaque niveau général gagné ajoute **+1** de vitesse.
- Formule canonique : `vitesse = 100 + (niveau général - 1)`.
- La vitesse réduit le temps de déplacement entre les cases ; elle ne transforme pas le déplacement en déplacement libre.
- Ne pas ajouter une progression séparée d’XP de vitesse sans nouvelle demande explicite de l’utilisateur.

### Défense contre l’entraînement abusif

Le futur serveur devra limiter l’AFK farming sans casser le jeu normal :

- pas d’XP sur action invalide ou dégâts nuls ;
- réduction éventuelle contre un monstre beaucoup trop faible ;
- participation active nécessaire ;
- limites raisonnables par cible ou fenêtre de temps ;
- aucune XP artificielle via un allié hors d’un système PvP validé.

Ces protections doivent être équilibrées plus tard, pas utilisées comme excuse pour supprimer la progression par action.

---

## 10. Monstres, récompenses et groupes

À la mort, un monstre peut donner :

- XP générale ;
- XP de classe/métier ;
- or ;
- consommables ;
- matériaux ;
- parfois une pièce d’équipement ;
- rarement un équipement de meilleure qualité.

### En groupe

- L’XP des maîtrises reste entièrement personnelle.
- Seule l’XP accordée à la mort du monstre est partagée.
- Les membres doivent être proches et avoir réellement participé.
- Un joueur inactif ne doit pas être récompensé.

### Décisions encore ouvertes

Ne pas inventer de validation utilisateur pour les points suivants :

- partage égal de l’XP de mort ou pondération selon la contribution ;
- butin personnel ou objet posé au sol ;
- partage exact de l’or ;
- seuil de distance et de participation ;
- bonus de groupe.

Recommandation par défaut déjà proposée : butin personnel et partage de l’XP de mort entre membres proches et actifs, mais demander confirmation avant de verrouiller l’économie définitive.

---

## 11. Classes, mentors et évolutions

Au niveau de classe/métier Aventurier 20 :

- l’Aventurier est plafonné au rang 20 et ne stocke plus d’XP de classe avant son choix ;
- le joueur rencontre des mentors ;
- le choix est permanent ;
- choix de base : **Épéiste**, **Archer**, **Mage** ;
- la nouvelle classe recommence au niveau de classe 1 ;
- le niveau général est conservé ;
- les maîtrises sont conservées ;
- l’inventaire et les équipements sont conservés.

Bonus actuels du premier choix :

- Épéiste : +12 PV et +12 % de dégâts au bâton ;
- Archer : +12 % de dégâts à la fronde et +0,6 de portée ;
- Mage : +12 PM et +12 % de dégâts à l’orbe.

### Évolutions ultérieures

- Les classes pourront évoluer à un niveau de classe plus élevé.
- Exemple explicitement demandé : **Mage → Nécromancien**.
- Le niveau exact de cette seconde évolution n’est pas définitivement confirmé.
- Les autres branches d’Épéiste, Archer et Mage ne sont pas encore définitivement choisies.
- Ne pas verrouiller une branche complète de classes sans validation de l’utilisateur.

---

## 12. Mort et réapparition

Lorsque le personnage meurt :

- arrêter les déplacements et le combat ;
- jouer une vraie animation de mort ;
- faire réapparaître le joueur dans son village enregistré ;
- s’il n’a pas de village enregistré, utiliser le village disponible ou découvert le plus proche selon la future logique du monde ;
- ne retirer aucun niveau ni aucune maîtrise dans la première version ;
- ne faire tomber aucun objet au sol dans la première version ;
- restaurer les PV et PM selon les règles de la zone ou du village.

Un point de retour pourra plus tard être enregistré auprès d’un aubergiste, d’un cristal ou d’un autre élément de village.

---

## 13. Inventaire, équipement et sauvegarde

La première tranche jouable doit comporter :

- inventaire tactile ;
- objets empilables ;
- potions ;
- matériaux ;
- or ;
- équipements obtenus sur les monstres ;
- affichage des statistiques ;
- possibilité d’équiper au minimum quelques objets ;
- sauvegarde locale fiable pendant la phase solo.

Plus tard, la sauvegarde devra être serveur et liée au compte.

Les méthodes de connexion définitives ne sont pas encore choisies : invité, e-mail, Google, Discord ou combinaison. Ne pas verrouiller ce choix sans demander.

---

## 14. Première tranche verticale acceptable

La première alpha digne d’être montrée doit contenir au minimum :

- une Clairière de Solenne détaillée ;
- un village ou camp de départ ;
- un Aventurier entièrement animé ;
- le bâton, le lance-pierre et la magie ;
- plusieurs monstres animés ;
- déplacement tactile case par case ;
- pathfinding et collisions ;
- ciblage et combat automatique ;
- projectiles et impacts visibles ;
- XP générale et XP de classe ;
- quatre maîtrises ;
- vitesse ;
- or et butin ;
- inventaire et équipement ;
- statistiques ;
- mort et réapparition ;
- mentor ou préparation du choix de classe ;
- sauvegarde locale ;
- interface paysage proche de la référence ;
- aucune fausse présence multijoueur.

La quantité de contenu peut être petite, mais la qualité de présentation et la boucle de jeu doivent être cohérentes.

---

## 15. MMO véritable et architecture future

Le jeu final est un MMO. La tranche locale n’est qu’une fondation.

### Principes

- serveur autoritaire ;
- synchronisation de vrais joueurs ;
- positions, collisions, dégâts, récompenses et XP validés côté serveur ;
- reconnexion ;
- groupes ;
- partage de l’XP de mort ;
- chat ;
- persistance des comptes et personnages ;
- protection contre la triche.

### Architecture envisagée

- client web 2D en TypeScript/JavaScript, éventuellement Phaser ;
- serveur Node.js/TypeScript persistant, éventuellement Colyseus ou une couche WebSocket autoritaire ;
- PostgreSQL/Supabase ou solution équivalente pour comptes et sauvegardes ;
- Vercel pour le client, la PWA et les API web adaptées ;
- serveur MMO persistant séparé si les limites d’exécution Vercel ne conviennent pas aux connexions longues.

Ne jamais présenter des PNJ ou voyageurs simulés comme de vrais joueurs connectés.

### Fonctionnalités à reporter après la boucle principale

- PvP ;
- guildes ;
- commerce entre joueurs ;
- hôtel des ventes ;
- artisanat avancé ;
- grandes régions ;
- donjons complexes ;
- événements globaux.

Le PvP n’a pas été explicitement confirmé pour la première version ; par défaut, ne pas le prioriser.

---

## 16. Méthode de travail obligatoire

### Avant de coder dans un nouveau chat

1. Lire ce document en entier.
2. Inspecter le dépôt `Woulette/Nouveau-d-p-t-jeu`.
3. Vérifier les branches et le dernier commit réellement présent.
4. Lire les rapports courants de build, d’assets et de QA de la branche `develop`.
5. Vérifier l’état réel du projet Vercel avant toute création ou publication.
6. Faire un court état des lieux honnête, puis reprendre exactement au bon jalon.

### Branches

- `main` : stable et production uniquement.
- `develop` : développement officiel.
- `develop-consolidation-work` : jalon historique uniquement.
- `foundation-backup-alpha3` : sauvegarde de l’ancienne base.

### Avant toute production

- code commité sur GitHub ;
- build reproductible uniquement depuis le dépôt ;
- aucun chemin temporaire `/mnt/data`, `file://` ou dépendance locale ;
- tous les PNG et JSON chargent ;
- aucune erreur JavaScript ;
- test 667×375 ;
- test 844×390 ;
- test 896×414 ;
- test 932×430 ;
- animations testées ;
- déplacement et collisions testés ;
- combat des trois styles testé ;
- inventaire et statistiques testés ;
- progression et sauvegarde testées ;
- capture comparée à la référence et à la meilleure version précédente ;
- déploiement sur le même projet Vercel ;
- ouverture et test de l’URL distante exacte.

### Communication avec l’utilisateur

- Ne pas redemander les décisions déjà confirmées dans ce document.
- Ne pas annoncer une étape terminée sans preuves concrètes.
- Ne pas transformer une longue tâche en promesse vague de travail futur.
- Si la tâche est trop longue, la découper en plusieurs livraisons réelles avec commits et rapports.
- Dire précisément ce qui est terminé, ce qui ne l’est pas et pourquoi.
- Ne pas masquer un échec de déploiement derrière un statut « Ready ».
- Ne pas créer plusieurs dépôts ou plusieurs projets Vercel pour contourner un problème.
- Ne jamais sacrifier la qualité visuelle pour corriger un bug technique.

---

## 17. État technique connu au moment de cette passation

Date de passation : **2026-07-14**.

### GitHub

- Dépôt : `Woulette/Nouveau-d-p-t-jeu`.
- Branche de développement vérifiée : `develop`.
- Version candidate déclarée dans `package.json` : `1.2.0-alpha.1`.
- La branche contient un pipeline d’assets, de build, d’audit, de reproductibilité et de QA mobile.
- Rapport de fondation présent : `docs/FOUNDATION_REPORT.json`.
- Audit des assets présent : `docs/ASSET_AUDIT.json`.
- QA mobile présente : `docs/MOBILE_QA.json`.
- Le candidat corrige la poursuite et les réservations, réduit l’échelle du monde, place les armes à gauche, ajoute l’Ours et le Sylvain et finalise les trois choix de classe au rang 20.
- Les assets actuels sont générés de façon déterministe en PNG au build et leurs URLs sont révisionnées pour éviter un mélange de cache entre releases.

### Vercel

- Cible unique obligatoire : `chroniques-de-solenne`.
- Lors de la dernière vérification par connecteur, le projet officiel n’était pas visible dans la liste, tandis qu’un autre projet sans rapport avec le jeu était visible.
- Conséquence : la liaison ou la création officielle Vercel doit être re-vérifiée. Ne pas considérer la production comme acquise et ne pas créer une série de projets de test.

### Jalon courant

Le candidat local `1.2.0-alpha.1` est validé par build et Chromium. Il doit encore passer le workflow GitHub sur son commit exact. La publication reste bloquée tant que l’unique projet Vercel officiel n’est pas de nouveau visible, puis elle devra être vérifiée sur l’URL distante.

---

## 18. Priorité immédiate pour le prochain chat

Le prochain assistant doit effectuer, dans cet ordre :

1. Lire `docs/NEXT_CHAT_HANDOFF.md` sur `develop`.
2. Vérifier le dernier commit et tous les fichiers de cette branche.
3. Exécuter ou revalider les scripts de build, audit, reproductibilité et QA mobile.
4. Vérifier que les PNG générés correspondent aux manifestes et ne sont pas des placeholders.
5. Comparer la capture 896×414 à la référence visuelle de l’utilisateur.
6. Pousser le candidat sur `develop` sans toucher à `main` tant que la validation et la cible Vercel ne sont pas complètes.
7. Vérifier ou restaurer la visibilité du seul projet Vercel `chroniques-de-solenne`.
8. Fusionner dans `main`, attendre la sortie `public/` validée, puis tester l’URL distante.
9. Donner à l’utilisateur une preuve : commit, branche, capture mobile, rapports et déploiement exact.
10. Continuer ensuite l’étape 2 sur `develop`, sans simplifier les vrais assets ou animations.

---

## 19. Message de démarrage recommandé dans le prochain chat

L’utilisateur peut écrire :

> Reprends Chroniques de Solenne. Lis d’abord intégralement `docs/NEXT_CHAT_HANDOFF.md` dans le dépôt GitHub `Woulette/Nouveau-d-p-t-jeu`, branche `develop`. Vérifie l’état réel de GitHub et Vercel avant toute modification. Ne crée aucun nouveau dépôt ni projet Vercel. Reprends au jalon immédiat indiqué dans le document, conserve les vrais assets et ne fais aucune régression graphique.

---

## 20. Résumé non négociable en une phrase

**Construire un MMORPG mobile paysage en pixel art original, visuellement riche comme la référence, avec déplacement tactile case par case sans joystick, combat automatique au bâton/lance-pierre/magie, progression générale/classe/maîtrises, mentors et évolutions permanentes, puis vrai serveur MMO autoritaire — le tout dans un seul dépôt GitHub et un seul projet Vercel, avec tests réels et aucune régression graphique.**
