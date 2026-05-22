# 📚 eLibrary - Système de Gestion de Bibliothèque

Projet de fin de module développé par Mohamed Segnidi et abdelali sanad dans le cadre de nos études à l'ENSA El Jadida.
Il s'agit d'une application web complète et sécurisée permettant de gérer les emprunts, les utilisateurs et le catalogue d'une bibliothèque.

## 🛠️ Technologies Utilisées
- **Front-end :** ReactJS (intégré avec Vite)
- **Back-end :** Laravel 10/11 (API RESTful)
- **Sécurité :** Laravel Sanctum (Authentification par Token et protection des routes par rôles)
- **Base de données :** MySQL

## ✨ Fonctionnalités Principales
- **Authentification sécurisée :** Connexion par jetons (Tokens).
- **Gestion des Rôles :** - *Super Admin (Rôle 0) :* Gestion totale (CRUD utilisateurs, CRUD livres, catégories, etc.).
  - *Étudiant (Rôle 1) / Enseignant (Rôle 2) :* Consultation du catalogue et emprunts avec quotas différents.
- **Tableau de bord :** Statistiques en temps réel (livres en stock, emprunts, retards).

---

## 🚀 Guide d'Installation (Étape par Étape)

### 1. Préparation de la base de données
1. Allumez votre serveur local (XAMPP, WAMP, etc.) et ouvrez phpMyAdmin.
2. Créez une nouvelle base de données vide (par exemple : `gestion_biblio`).
3. Importez le fichier `.sql` fourni à la racine de ce projet dans cette nouvelle base de données pour avoir la structure et les données de test.

### 2. Configuration du projet (Environnement)
Ouvrez le dossier du projet dans votre éditeur de code, puis :
1. Renommez le fichier `.env.example` en `.env`.
2. Ouvrez ce fichier `.env` et mettez à jour les informations de connexion à la base de données :
   ```env
   DB_CONNECTION=mysql
   DB_HOST=127.0.0.1
   DB_PORT=3306
   DB_DATABASE=gestion_biblio  # Mettez le nom de la base créée à l'étape 1
   DB_USERNAME=root
   DB_PASSWORD=
  ```
   
3. Installation et Lancement (Les 2 Terminaux)

Pour que l'application fonctionne, il faut faire tourner le serveur PHP (Laravel) et le serveur Node (React/Vite) en même temps.

Ouvrez un Premier Terminal à la racine du projet :
# 1. Installer les dépendances PHP
composer install

# 2. Générer la clé de sécurité Laravel
php artisan key:generate

# 3. Lancer le serveur backend Laravel
php artisan serve


Ouvrez un Deuxième Terminal, toujours à la racine du projet :
# 1. Installer les dépendances JavaScript (React)
npm install

# 2. Lancer le serveur frontend Vite
npm run dev


4. Accès à l'application

    L'application est maintenant accessible via le lien fourni par Vite dans le deuxième terminal (généralement http://localhost:5173).

    Compte Administrateur de test :

        Pseudo : admin

        Mot de passe : 123456