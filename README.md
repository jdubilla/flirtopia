# Flirtopia

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
