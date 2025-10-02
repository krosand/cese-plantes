# 📋 Procédure de Déploiement - cese.systadev.net/plante

## ✅ Application Node.js via cPanel o2switch

---

## 🎯 Objectif

Déployer l'application "Adopte une Plante !" sur :
**https://cese.systadev.net/plante**

---

## 📦 Prérequis

- Accès cPanel o2switch
- Accès Git au repository : `git@github.com:krosand/cese-plantes.git`

---

## 🚀 Procédure de Déploiement

### ÉTAPE 1 : Uploader le Code

#### Option A : Via Git (Recommandé)

1. Connexion cPanel → Rechercher **"Git Version Control"**
2. Cliquer sur **"Create"**
3. Remplir le formulaire :
   ```
   Clone URL: git@github.com:krosand/cese-plantes.git
   Repository Path: plante
   Repository Name: plante
   ```
4. Cliquer **"Create"**
5. Attendre la fin du clonage

#### Option B : Via File Manager

1. cPanel → **"File Manager"**
2. Créer un dossier `plante`
3. Uploader tous les fichiers du projet dans ce dossier
   - ⚠️ Ne pas uploader `node_modules/` ni `.git/`

---

### ÉTAPE 2 : Créer l'Application Node.js

1. cPanel → Rechercher **"Setup Node.js App"**
2. Cliquer sur **"Create Application"**
3. Remplir le formulaire :

| Paramètre | Valeur |
|-----------|--------|
| **Node.js version** | 18.20.8 (ou la plus récente disponible) |
| **Application mode** | Production |
| **Application root** | `plante` |
| **Application URL** | `plante` |
| **Application startup file** | `server.js` |

4. Cliquer sur **"Create"**

---

### ÉTAPE 3 : Configurer les Variables d'Environnement

Dans l'interface "Setup Node.js App", votre application apparaît maintenant.

**Repérer le PORT assigné** (affiché sur la ligne de votre app, ex: `45234`)

1. Cliquer sur **"Edit"** ou l'icône crayon
2. Scroller jusqu'à **"Environment variables"**
3. Ajouter les variables suivantes :

**Variable 1 :**
```
Name: PORT
Value: 45234  ← Utiliser le port affiché par cPanel
```

**Variable 2 :**
```
Name: BASE_PATH
Value: /plante
```

**Variable 3 :**
```
Name: NODE_ENV
Value: production
```

4. Cliquer **"Save"**

---

### ÉTAPE 4 : Créer le fichier .env

1. cPanel → **"File Manager"**
2. Naviguer vers le dossier `plante/`
3. Cliquer **"+ File"** → Nom : `.env`
4. Clic droit sur `.env` → **"Edit"**
5. Ajouter le contenu suivant :

```bash
PORT=45234
BASE_PATH=/plante
NODE_ENV=production
```

⚠️ **Remplacer `45234` par le port réel assigné par cPanel**

6. Cliquer **"Save Changes"**

---

### ÉTAPE 5 : Installer les Dépendances

1. Retourner dans **"Setup Node.js App"**
2. Trouver votre application `plante`
3. Cliquer sur **"Run NPM Install"**
4. Attendre la fin de l'installation (express + dotenv)
   - ✅ Un message de succès apparaîtra

---

### ÉTAPE 6 : Démarrer l'Application

1. Dans "Setup Node.js App"
2. Cliquer sur le bouton **"Start App"** ou **"Restart"**
3. Le statut doit passer à **"Running"** (vert)

---

### ÉTAPE 7 : Vérification

Ouvrir un navigateur et tester les URLs suivantes :

✅ **Page d'accueil (Test)** :
```
https://cese.systadev.net/plante/
```

✅ **Page Statistiques** :
```
https://cese.systadev.net/plante/stats.html
```

✅ **Page Administration** :
```
https://cese.systadev.net/plante/admin.html
```

---

## 🔄 Mise à Jour de l'Application

### Lorsque du nouveau code est poussé sur GitHub :

1. cPanel → **"Git Version Control"**
2. Trouver le repository `plante`
3. Cliquer sur **"Manage"**
4. Cliquer sur **"Pull or Deploy"** → **"Update from Remote"**
5. Retourner dans **"Setup Node.js App"**
6. Cliquer sur **"Restart"** pour votre application

---

## 🆘 Dépannage

### L'application ne démarre pas

**Vérifier les logs :**
1. "Setup Node.js App" → Cliquer sur votre app
2. **"Open Logs"** ou **"View Logs"**

**Vérifications :**
- [ ] Le fichier `.env` existe avec le bon PORT
- [ ] Le dossier `node_modules/` existe (npm install effectué)
- [ ] Les variables d'environnement sont bien configurées
- [ ] Le fichier `server.js` est bien à la racine de `plante/`

### Erreur "Cannot find module"

```
Solution : Relancer npm install
```
1. "Setup Node.js App" → **"Run NPM Install"**
2. Attendre la fin
3. **"Restart"**

### Page 404 Not Found

**Vérifier :**
- Application URL = `plante` (sans `/`)
- BASE_PATH dans .env = `/plante` (avec `/`)
- Application est bien "Running" (statut vert)

### Port déjà utilisé (EADDRINUSE)

1. Noter le nouveau port assigné par cPanel
2. Modifier `.env` avec le nouveau port
3. Modifier la variable d'environnement PORT dans cPanel
4. Restart l'application

---

## 📊 Architecture Finale

```
Serveur o2switch
├─ ~/plante/                          ← Dossier physique
│  ├── server.js
│  ├── package.json
│  ├── .env                           ← Configuration
│  ├── data/
│  │   ├── questions.json
│  │   ├── plants.json
│  │   └── results.ndjson
│  └── public/
│      ├── index.html
│      ├── stats.html
│      ├── admin.html
│      └── config.js
│
└─ URL publique:
   https://cese.systadev.net/plante/  ← Accès web
```

---

## 📝 Checklist de Déploiement

Avant de valider le déploiement, vérifier :

- [ ] Code uploadé via Git ou File Manager
- [ ] Application Node.js créée avec les bons paramètres
- [ ] Variables d'environnement configurées (PORT, BASE_PATH, NODE_ENV)
- [ ] Fichier `.env` créé avec le bon PORT
- [ ] `npm install` exécuté avec succès
- [ ] Application démarrée (statut "Running" vert)
- [ ] Test URL principale : `/plante/` → Affiche le formulaire de test
- [ ] Test URL stats : `/plante/stats.html` → Affiche le dashboard
- [ ] Test URL admin : `/plante/admin.html` → Affiche l'interface admin
- [ ] Les boutons de navigation fonctionnent entre les pages
- [ ] Le test de questionnaire fonctionne et affiche un résultat

---

## 🔐 Informations de Configuration

**Repository Git :**
```
git@github.com:krosand/cese-plantes.git
```

**URL de Production :**
```
https://cese.systadev.net/plante/
```

**Variables d'Environnement Requises :**
```bash
PORT=<port_assigné_par_cpanel>
BASE_PATH=/plante
NODE_ENV=production
```

**Version Node.js :**
```
18.x ou supérieur
```

**Dépendances npm :**
```json
{
  "express": "^4.18.2",
  "dotenv": "^16.3.1"
}
```

---

## 📞 Support

**Documentation complète :**
- `README.md` - Documentation générale
- `DEPLOIEMENT_CPANEL.md` - Guide détaillé cPanel
- `INSTALLATION_RAPIDE.md` - Guide VPS/PM2

**Support o2switch :**
- Email : support@o2switch.fr
- Documentation : https://faq.o2switch.fr

---

**✅ Procédure testée et validée - Application fonctionnelle** 🌿
