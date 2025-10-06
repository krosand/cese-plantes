# 🌿 PROJET ADOPTE UNE PLANTE - CONTEXTE CLAUDE

## 📋 DESCRIPTION DU PROJET

Application web interactive de recommandation de plantes pour le CESE (Conseil Économique, Social et Environnemental).

Initiative RSO pour améliorer le bien-être au travail : un quiz de personnalité guide les utilisateurs vers la plante qui leur correspond parmi 12 espèces sélectionnées dans 4 familles.

## 🏗️ ARCHITECTURE TECHNIQUE

**Stack :**
- **Frontend** : HTML/CSS/JavaScript vanilla, Bootstrap 5
- **Graphiques** : Chart.js
- **Backend** : Node.js, Express.js
- **Base de données** : JSON (fichiers plats) + NDJSON pour résultats
- **Stockage images** : Système de fichiers local

**Structure :**
```
/home/krosand/Documents/SITE/PLANTES/
├── public/
│   ├── index.html          # Quiz principal
│   ├── stats.html          # Tableau de bord statistiques
│   ├── admin.html          # Interface administration
│   ├── config.js           # Configuration frontend
│   └── images/plantes/     # Images des plantes
├── data/
│   ├── questions.json      # Questions du quiz
│   ├── plants.json         # Base de données plantes
│   └── results.ndjson      # Résultats utilisateurs
├── server.js               # Serveur Express.js
└── package.json
```

## ✅ FONCTIONNALITÉS IMPLÉMENTÉES

### 1. Quiz Interactif (`index.html`)
- ✅ Formulaire nom/prénom obligatoire avant le quiz
- ✅ 8 questions à choix multiples
- ✅ Barre de progression
- ✅ Sauvegarde réponses dans localStorage
- ✅ Calcul automatique famille de plantes recommandée
- ✅ Affichage de 3 plantes recommandées avec détails (arrosage, lumière, température, difficulté)
- ✅ **Boutons d'adoption** sur chaque plante
- ✅ Enregistrement du choix de plante de l'utilisateur

### 2. Tracking Utilisateur
- ✅ Collecte nom/prénom avant le quiz
- ✅ Sauvegarde données utilisateur dans `results.ndjson`
- ✅ Association utilisateur → famille → plante choisie
- ✅ Endpoint API `/api/adopt` pour enregistrer le choix de plante

### 3. Statistiques (`stats.html`)
- ✅ KPIs : Total participants, taux de complétion, famille favorite
- ✅ Graphiques Chart.js :
  - Distribution par famille (histogramme)
  - Répartition familles (camembert)
  - Timeline des soumissions
  - Réponses question 1 (doughnut)
- ✅ Détails réponses par question
- ✅ **Tableau des adoptions** avec colonnes :
  - Date/heure
  - Prénom/Nom
  - Famille choisie
  - Plante adoptée (avec badge coloré)
- ✅ Auto-refresh toutes les 30 secondes
- ✅ **Fix erreur Canvas Chart.js** (destruction instances avant recréation)

### 4. Interface Admin (`admin.html`)
- ✅ Gestion plantes (CRUD) avec formulaires
- ✅ Upload d'images pour plantes
- ✅ Gestion questions (formulaires au lieu de JSON brut)
- ✅ Génération données simulées pour tests
- ✅ Bouton suppression de toutes les données simulées
- ✅ Export résultats (CSV/NDJSON)

## 🔌 ENDPOINTS API

**Publics :**
- `GET /api/config` - Configuration frontend
- `GET /api/questions` - Liste des questions
- `POST /api/submit` - Soumettre réponses + données utilisateur
- `POST /api/adopt` - Enregistrer choix de plante
- `GET /api/plants/:family` - Plantes d'une famille
- `GET /api/stats/summary` - Statistiques agrégées
- `GET /api/stats/adoptions` - Liste des adoptions avec utilisateurs

**Admin :**
- `GET /api/admin/questions` - Questions pour édition
- `PUT /api/admin/questions` - Modifier questions
- `GET /api/admin/plants` - Plantes pour édition
- `PUT /api/admin/plants` - Modifier plantes
- `POST /api/admin/upload-image` - Upload image
- `POST /api/admin/seed` - Générer données simulées
- `DELETE /api/admin/clear-all` - Supprimer toutes les données
- `GET /api/admin/export?format=csv|ndjson` - Exporter résultats

## 📊 DONNÉES

**4 Familles de plantes :**
1. 🌿 **Dépolluantes** : Sansevieria, Pothos, Spathiphyllum
2. 🌴 **Grimpantes** : Monstera, Philodendron, Epipremnum
3. 🌸 **Exotiques** : Orchidée, Bonsaï, Anthurium
4. 🌵 **Résistantes** : Cactus, Zamioculcas, Succulentes

**Modèle données utilisateur (results.ndjson) :**
```json
{
  "timestamp": "2025-10-04T19:20:54.501Z",
  "user": {
    "firstName": "Prénom",
    "lastName": "Nom"
  },
  "answers": [2,0,2,2,3,2,2,2],
  "family": "Exotique",
  "scores": {
    "Dépolluante": 8,
    "Grimpante": 11,
    "Exotique": 17,
    "Résistante": 9
  },
  "completed": true,
  "plantName": "Orchidée Phalaenopsis",
  "adoptionTimestamp": "2025-10-04T19:20:58.545Z"
}
```

## 🚀 DÉMARRAGE

```bash
cd /home/krosand/Documents/SITE/PLANTES

# Installer dépendances (si nécessaire)
npm install

# Démarrer serveur
node server.js

# Serveur démarre sur http://localhost:5001
```

**URLs :**
- Quiz : http://localhost:5001
- Stats : http://localhost:5001/stats.html
- Admin : http://localhost:5001/admin.html

## 📝 GIT / BRANCHES

**Repository :** `git@github.com:krosand/cese-plantes.git`

**Branches récentes :**
- `main` - Branche principale (à jour)
- `feature/user-tracking` - Tracking utilisateur et sélection plantes (✅ mergée)
- `fix/chart-reuse-error` - Fix erreur Canvas Chart.js (✅ mergée)

**Derniers commits :**
```
556ab9a - Corriger erreur de réutilisation des canvas Chart.js
72af719 - Ajouter système de tracking utilisateur et sélection de plantes
e403056 - Ajouter bouton pour supprimer toutes les données simulées dans admin
1ad96e0 - Ajouter interface conviviale pour gérer les questions
dcbfe40 - Ajouter interface conviviale admin avec upload d'images pour plantes
```

## 🎯 ÉTAT ACTUEL

✅ **Projet fonctionnel et déployé**

**Fonctionnalités complètes :**
- Quiz avec tracking utilisateur (nom/prénom)
- Recommandations personnalisées
- Sélection de plante parmi les 3 proposées
- Statistiques complètes avec liste des adoptions
- Interface admin complète

**Dernières modifications (session 2025-10-06) :**
1. ✅ Ajout formulaire nom/prénom avant quiz
2. ✅ Sauvegarde données utilisateur dans résultats
3. ✅ Boutons d'adoption sur plantes recommandées
4. ✅ Endpoint `/api/adopt` pour enregistrer choix
5. ✅ Endpoint `/api/stats/adoptions` pour liste adoptions
6. ✅ Tableau adoptions dans page stats avec colonne "Plante adoptée"
7. ✅ Fix erreur Canvas Chart.js lors refresh auto

## 🔄 POUR REPRENDRE LE PROJET

1. Vérifier état Git : `git status`
2. Vérifier serveur : `node server.js`
3. Tester parcours complet :
   - Saisir nom/prénom
   - Répondre au quiz
   - Cliquer "J'adopte cette plante !"
   - Vérifier dans Stats → Tableau adoptions

## 📌 NOTES IMPORTANTES

- **RGPD** : Message de conformité affiché (données confidentielles, stats internes uniquement)
- **Persistence** : Données stockées dans `data/results.ndjson`
- **Images** : Upload dans `public/images/plantes/`
- **Auto-refresh stats** : Toutes les 30 secondes
- **Serveur distant** : Configuration via variable `BASE_PATH` dans `.env`

## 🐛 PROBLÈMES RÉSOLUS

- ❌ Erreur "Canvas is already in use" → ✅ Destruction instances Chart.js avant recréation
- ❌ Données utilisateur manquantes → ✅ Formulaire obligatoire + validation backend
- ❌ Pas de traçabilité choix plantes → ✅ Endpoint `/api/adopt` + colonne tableau

---

**PROJET "ADOPTE UNE PLANTE" v1.0 - CESE** 🌿
