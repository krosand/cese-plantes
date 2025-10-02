# 🌿 Adopte une Plante !

Prototype de test de personnalité pour recommander des plantes de bureau adaptées au caractère de chaque collaborateur.

## 🎯 Contexte

Application web développée pour environnement d'entreprise. Les plantes sont financées par l'entreprise, le test permet d'identifier la plante idéale selon la personnalité et les habitudes de chaque employé.

## ✨ Fonctionnalités

### 🧪 Test de Personnalité
- 8 questions basées sur le caractère et les habitudes
- Conformité RGPD : aucune donnée personnelle collectée
- Questions orientées travail et environnement de bureau
- Résultat instantané avec recommandations personnalisées

### 🌱 4 Familles de Plantes

1. **Dépolluante** 🌿 - Pour air pur et santé
   - Sansevieria, Pothos, Spathiphyllum

2. **Grimpante** 🌴 - Pour décoration verdoyante
   - Monstera, Philodendron, Epipremnum

3. **Exotique** 🌸 - Pour ambiance zen
   - Orchidée, Bonsaï Ficus, Anthurium

4. **Résistante** 🌵 - Pour simplicité et robustesse
   - Cactus, Zamioculcas, Succulentes

Toutes les plantes sont **adaptées à l'environnement de bureau** (climatisation, néons, absences).

### 📊 Dashboard Statistiques
- KPIs en temps réel (participants, taux complétion, famille favorite)
- Graphiques Chart.js (histogrammes, camemberts, timeline)
- Analyse détaillée par question
- Auto-refresh toutes les 30s

### ⚙️ Interface Administration
- Édition JSON des questions et plantes
- Génération de données simulées (1-1000 résultats)
- Export CSV/NDJSON
- Interface moderne avec sidebar navigation

## 🛠️ Stack Technique

- **Backend** : Node.js + Express.js
- **Frontend** : HTML5 + Bootstrap 5 + Vanilla JavaScript
- **Graphiques** : Chart.js (via CDN)
- **Stockage** : Fichiers JSON/NDJSON (pas de base de données)
- **Port** : 5000

## 🚀 Installation Locale

```bash
# Cloner le repository
git clone git@github.com:krosand/cese-plantes.git
cd cese-plantes

# Installer les dépendances
npm install

# Lancer le serveur
node server.js
```

Accéder à l'application : **http://localhost:5000**

## 🌐 Déploiement VPS o2switch

Domaine : **cese.systadev.net**

Voir le fichier **[DEPLOIEMENT.md](./DEPLOIEMENT.md)** pour les instructions complètes.

### Résumé Rapide

```bash
# Sur le VPS
git clone git@github.com:krosand/cese-plantes.git
cd cese-plantes
npm install

# Avec PM2
npm install -g pm2
pm2 start ecosystem.config.js
pm2 save
```

## 📁 Structure du Projet

```
cese-plantes/
├── server.js              # Serveur Node.js Express (port 5000)
├── package.json           # Dépendances npm
├── ecosystem.config.js    # Configuration PM2
├── data/
│   ├── questions.json     # 8 questions du test
│   ├── plants.json        # 12 fiches plantes (4 familles)
│   └── results.ndjson     # Résultats des soumissions
├── public/
│   ├── index.html         # Interface test
│   ├── stats.html         # Dashboard statistiques
│   └── admin.html         # Interface administration
└── logs/                  # Logs PM2 (ignorés par git)
```

## 🔌 API REST

```
GET  /api/questions         # Liste des questions
POST /api/submit            # Soumettre réponses → résultat
GET  /api/plants/:family    # Plantes d'une famille
GET  /api/stats/summary     # Statistiques agrégées

# Administration
GET  /api/admin/questions
PUT  /api/admin/questions
GET  /api/admin/plants
PUT  /api/admin/plants
POST /api/admin/seed        # Générer données simulées
GET  /api/admin/export?format=csv|ndjson
```

## 🎨 Captures d'Écran

### Interface Test
- Design responsive Bootstrap avec dégradé vert
- Barre de progression visuelle
- Cartes plantes avec fiches détaillées

### Dashboard Stats
- KPIs en cards colorées
- Graphiques interactifs Chart.js
- Timeline des soumissions

### Interface Admin
- Sidebar navigation violette
- Éditeurs JSON en live
- Actions rapides (seed, export)

## 🔒 Conformité RGPD

✅ **Conforme** - Aucune donnée personnelle collectée :
- Pas de nom, email, âge
- Questions générales sur personnalité et habitudes
- Anonymat total des réponses
- Pas de cookies ni tracking

## 📝 Licence

Projet interne - Tous droits réservés

## 🤝 Contribution

Projet en prototype - Contributions fermées pour le moment

## 📞 Support

Pour questions techniques sur le déploiement o2switch :
- Documentation complète : [DEPLOIEMENT.md](./DEPLOIEMENT.md)
- Support o2switch : support@o2switch.fr

---

**Développé pour favoriser le bien-être au bureau** 🏢🌿
