# ✅ Modifications pour Hébergement Générique

## 🎯 Objectif Accompli

L'application est maintenant **100% configurable** et peut être hébergée :
- À la racine : `cese.systadev.net/`
- Dans un sous-dossier : `cese.systadev.net/plante/`
- N'importe où : `domain.com/apps/plants/`

## 🔧 Modifications Techniques

### 1. Backend (server.js)

**Avant :**
```javascript
const PORT = 5000;
app.use(express.static('public'));
app.get('/api/questions', ...)
```

**Après :**
```javascript
require('dotenv').config();
const PORT = process.env.PORT || 5000;
const BASE_PATH = process.env.BASE_PATH || '';

// Routes dynamiques
app.get((BASE_PATH || '') + '/api/questions', ...)
app.get((BASE_PATH || '') + '/api/config', ...) // Nouveau endpoint
```

### 2. Frontend (config.js - NOUVEAU)

Fichier générique de configuration automatique :
```javascript
const APP_CONFIG = (() => {
  const currentPath = window.location.pathname;
  let basePath = currentPath.substring(0, currentPath.lastIndexOf('/'));

  return {
    basePath: basePath,
    apiUrl: (endpoint) => `${basePath}${endpoint}`
  };
})();

async function apiCall(endpoint, options = {}) {
  const url = APP_CONFIG.apiUrl(endpoint);
  return fetch(url, options).then(r => r.json());
}
```

### 3. HTML (index.html, stats.html, admin.html)

**Changements :**
- ✅ Liens relatifs au lieu d'absolus : `href="stats.html"` au lieu de `href="/stats.html"`
- ✅ Inclusion de `config.js` avant les scripts
- ✅ Utilisation de `apiCall()` au lieu de `fetch()`

**Avant :**
```javascript
const response = await fetch('/api/questions');
const data = await response.json();
```

**Après :**
```javascript
const data = await apiCall('/api/questions');
```

### 4. Configuration (.env)

Nouveau fichier de configuration :
```bash
PORT=5000
BASE_PATH=/plante
```

### 5. Package.json

Ajout de `dotenv` pour gérer les variables d'environnement :
```json
"dependencies": {
  "express": "^4.18.2",
  "dotenv": "^16.3.1"
}
```

## 📦 Nouveaux Fichiers

1. **public/config.js** - Configuration frontend automatique
2. **.env.example** - Template de configuration
3. **.env** - Configuration locale (gitignored)
4. **INSTALLATION_RAPIDE.md** - Guide déploiement VPS
5. **RESUME_CHANGEMENTS.md** - Ce fichier

## 🚀 Déploiement sur cese.systadev.net/plante

### Étapes Simplifiées

```bash
# 1. Sur le VPS
git clone git@github.com:krosand/cese-plantes.git
cd cese-plantes

# 2. Configuration
cp .env.example .env
nano .env  # Mettre BASE_PATH=/plante

# 3. Installation
npm install

# 4. Lancer avec PM2
pm2 start ecosystem.config.js
pm2 save

# 5. Nginx reverse proxy
# Voir INSTALLATION_RAPIDE.md pour la config complète
```

### Configuration Nginx pour /plante

```nginx
location /plante {
    proxy_pass http://localhost:5000/plante;
    proxy_http_version 1.1;
    proxy_set_header Host $host;
    proxy_set_header X-Real-IP $remote_addr;
}
```

## ✅ Tests Effectués

- [x] Backend démarre avec BASE_PATH configurable
- [x] Routes API fonctionnent avec préfixe dynamique
- [x] Frontend détecte automatiquement le chemin
- [x] Liens de navigation relatifs fonctionnent
- [x] Appels API utilisent config.js
- [x] npm install réussit (dotenv ajouté)

## 🌐 URLs Finales

Après déploiement sur cese.systadev.net avec BASE_PATH=/plante :

- **Accueil** : https://cese.systadev.net/plante/
- **Stats** : https://cese.systadev.net/plante/stats.html
- **Admin** : https://cese.systadev.net/plante/admin.html

## 🔄 Pour Changer le Chemin Plus Tard

Il suffit de modifier `.env` et redémarrer :
```bash
# Passer de /plante à /apps/plantes
nano .env  # Changer BASE_PATH=/apps/plantes
pm2 restart adopte-plante

# Mettre à jour Nginx en conséquence
```

**Aucun changement dans le code HTML/JS nécessaire !** 🎉

---

**Système 100% portable et configurable** 🌿
