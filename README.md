# 🚧 Projet en cours 🚧

Le but de cette application est de consolider mes connaissances en développement iOS natif (Swift et SwiftUI) et de me familiariser avec l'architecture MVVM (Model View ViewModel).


## Objectif du Projet

Le principal objectif de ce projet est de créer une application de rencontres moderne et intuitive, offrant une navigation fluide entre différentes fonctionnalités tout en respectant les principes de conception iOS. Plus précisément, les objectifs sont les suivants :

- Consolider mes connaissances en Swift et SwiftUI pour créer une interface utilisateur réactive et dynamique.
- Mettre en œuvre le modèle de conception MVVM pour une architecture de code claire, modulaire et facilement maintenable.
- Gérer efficacement les données de l'application, telles que les profils utilisateur et les interactions avec l'API.
- Intégrer des fonctionnalités de base telles que la navigation entre les écrans, l'affichage de profils utilisateurs, une messagerie instantanée via les WebSockets, modifier son profil...
- Utiliser les meilleures pratiques de développement iOS pour assurer la qualité du code et la stabilité de l'application.


## Structure du Projet

L'application Flirtopia suit une architecture MVVM (Model View ViewModel) pour une séparation claire des préoccupations et une maintenance facile du code. Voici un aperçu de la structure du projet :

- **Models** : Comprend les structures de données, notemment utilisés pour recevoir ou envoyer des données depuis ou vers l'api.
- **Views** : Représente l'interface utilisateur de l'application, créée à l'aide de SwiftUI. Chaque vue est responsable de l'affichage des données et de la gestion des interactions utilisateur. Chaque View est dans un dossier qui contient son propre ViewModel (j'ai choisis de mettre le ViewModel avec sa View au meme endroit pour pouvoir le retrouver plus facilement). Le ViewModel contient la logique de présentation et les états de vue associés. Les ViewModels effectuent des transformations si nécessaire et fournissent les données nécessaires aux vues pour l'affichage.
- **Helpers** : Contient des fonctions qui fournissent des fonctionnalités réutilisables à travers l'application comme la gestion de la Keychain (je l'utilise pour stocker le JSON Web Token)
- **Extensions** : Contient des extensions de types Swift préexistants pour ajouter des fonctionnalités supplémentaires


## Fonctionnalités

- **Affichage de Suggestions** : Les utilisateurs peuvent parcourir et afficher des profils d'autres utilisateurs avec des informations détaillées et des photos.
- **Chat** : Les utilisateurs peuvent engager une conversation avec les personnes avec lesquelles ils ont eu un "match"
- **Préférences Utilisateur** : Les utilisateurs peuvent définir leurs préférences de recherche, telles que l'âge, la distance, etc., pour affiner leurs correspondances
- **Affichage de Suggestions** : Les utilisateurs peuvent voir une liste de suggestions de profils en fonction de leurs préférences personnelles et d'autres paramètres tels que la proximité géographique.
- **Interaction avec les Profils** : Les utilisateurs ont la possibilité de "liker", "unliker", bloquer ou signaler chaque profil.
- **Modification du Profil** : Les utilisateurs peuvent modifier les informations de leur profil, telles que les photos, la description, etc...
- **Consultation des Statistiques** : Les utilisateurs peuvent voir qui a consulté leur profil, ainsi que les personnes qu'ils ont likées et qui les ont likées en retour.
  

## Captures d'écran

<img src="https://github.com/jdubilla/flirtopia/assets/86416832/18869231-dd88-43f6-bbf7-01414492e46a" width="300">
<img src="https://github.com/jdubilla/flirtopia/assets/86416832/88b1a49c-e548-489b-87ee-f7f49be3b05a" width="300">
<img src="https://github.com/jdubilla/flirtopia/assets/86416832/f8b94248-a010-4ab7-b9fc-35b9fbf9c2a7" width="300">
<img src="https://github.com/jdubilla/flirtopia/assets/86416832/d4c5630b-4a5b-4e06-b13e-aa8ddd3a12e5" width="300">
<img src="https://github.com/jdubilla/flirtopia/assets/86416832/ece488f8-1fa3-477b-896a-63fe071bd2bd" width="300">
<img src="https://github.com/jdubilla/flirtopia/assets/86416832/c852696d-c24f-45db-b5da-3ff4e22ff108" width="300">
<img src="https://github.com/jdubilla/flirtopia/assets/86416832/d6e80e02-6872-4218-980f-259e0ca6f2c6" width="300">
<img src="https://github.com/jdubilla/flirtopia/assets/86416832/b244fcb8-4e3b-45a1-b432-2ce522eaa074" width="300">
<img src="https://github.com/jdubilla/flirtopia/assets/86416832/e66c067e-eb9b-44c0-a4a5-6ce22366009e" width="300">
