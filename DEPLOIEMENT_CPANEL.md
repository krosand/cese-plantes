# 🚀 Déploiement o2switch avec cPanel Node.js

## Guide Spécifique cPanel - Application Node.js

### Étape 1 : Connexion cPanel

1. Connectez-vous à votre cPanel o2switch
2. Cherchez **"Setup Node.js App"** dans la section "Software"

### Étape 2 : Créer l'Application Node.js

Dans l'interface "Setup Node.js App", cliquez sur **"Create Application"** :

#### Configuration de l'application :

| Paramètre | Valeur |
|-----------|--------|
| **Node.js version** | 18.x ou supérieur |
| **Application mode** | Production |
| **Application root** | `cese-plantes` |
| **Application URL** | `plante` |
| **Application startup file** | `server.js` |
| **Environment variables** | Voir ci-dessous |

#### Variables d'environnement à ajouter :

Cliquez sur **"Add Variable"** et ajoutez :

1. **Variable 1 :**
   - Name: `PORT`
   - Value: Le port assigné par cPanel (généralement affiché automatiquement)

2. **Variable 2 :**
   - Name: `BASE_PATH`
   - Value: `/plante`

3. **Variable 3 :**
   - Name: `NODE_ENV`
   - Value: `production`

### Étape 3 : Uploader les Fichiers

**Option A : Via Git (recommandé)**

1. Dans cPanel, allez dans **"Git Version Control"**
2. Cliquez sur **"Create"**
3. Remplissez :
   - **Clone URL** : `git@github.com:krosand/cese-plantes.git`
   - **Repository Path** : `cese-plantes`
   - **Repository Name** : `cese-plantes`
4. Cliquez sur **"Create"**

**Option B : Via File Manager**

1. Dans cPanel, ouvrez **"File Manager"**
2. Naviguez vers le dossier racine
3. Créez un dossier `cese-plantes`
4. Uploadez tous les fichiers du projet (sauf `node_modules`, `.git`)

**Option C : Via FTP/SSH**

```bash
# Sur votre machine locale
scp -r cese-plantes/ votre_user@cese.systadev.net:~/
```

### Étape 4 : Installer les Dépendances

Dans l'interface "Setup Node.js App", pour votre application :

1. Cliquez sur le bouton **"Run NPM Install"**
2. Attendez que l'installation se termine (dotenv + express)

### Étape 5 : Créer le fichier .env

**Via cPanel File Manager :**

1. Allez dans **File Manager**
2. Naviguez vers `cese-plantes/`
3. Créez un nouveau fichier `.env`
4. Éditez et ajoutez :

```bash
PORT=XXXXX
BASE_PATH=/plante
NODE_ENV=production
```

> ⚠️ Remplacez `XXXXX` par le port que cPanel vous a assigné (visible dans "Setup Node.js App")

### Étape 6 : Démarrer l'Application

Dans "Setup Node.js App" :

1. Cliquez sur le bouton **"Start"** ou **"Restart"**
2. L'application devrait afficher **"Running"** en vert

### Étape 7 : Vérifier le Fonctionnement

Accédez à : **https://cese.systadev.net/plante/**

Les pages suivantes doivent être accessibles :
- https://cese.systadev.net/plante/
- https://cese.systadev.net/plante/stats.html
- https://cese.systadev.net/plante/admin.html

---

## 🔧 Configuration Avancée

### Modifier la Configuration

Pour changer le chemin d'accès (ex: `/plante` → `/plants`) :

1. Dans "Setup Node.js App", trouvez votre application
2. Modifiez la variable d'environnement `BASE_PATH`
3. Changez **"Application URL"** pour correspondre
4. Cliquez sur **"Restart"**

### Logs et Monitoring

**Voir les logs :**
1. Dans "Setup Node.js App", cliquez sur votre application
2. Cliquez sur **"Open Logs"** ou **"View Logs"**
3. Les erreurs de démarrage y apparaîtront

**Logs système :**
```bash
# Via SSH (si activé)
cd ~/cese-plantes/logs
tail -f *.log
```

### Redémarrer l'Application

Après modifications du code :

1. **Via cPanel** : Bouton "Restart" dans "Setup Node.js App"
2. **Via SSH** :
```bash
cd ~/nodevenv/cese-plantes/18/bin
./npm restart
```

---

## 🔄 Mise à Jour du Code

### Via Git (recommandé)

1. Dans cPanel → **"Git Version Control"**
2. Trouvez votre repository `cese-plantes`
3. Cliquez sur **"Pull or Deploy"**
4. Cliquez sur **"Update from Remote"**
5. Retournez dans **"Setup Node.js App"**
6. Cliquez sur **"Restart"** pour votre application

### Via File Manager

1. Supprimez les anciens fichiers
2. Uploadez les nouveaux
3. Redémarrez l'application

---

## 🆘 Résolution de Problèmes

### L'application ne démarre pas

**Vérifier :**
1. Les logs dans "Setup Node.js App" → "Open Logs"
2. Que le fichier `.env` existe avec le bon PORT
3. Que `npm install` a bien terminé (présence de `node_modules/`)
4. Que le chemin **Application root** est correct

**Commande de diagnostic via Terminal cPanel :**
```bash
cd ~/cese-plantes
cat .env
ls -la node_modules/
node server.js
```

### Erreur "Cannot find module 'dotenv'"

```bash
# Via Terminal cPanel
cd ~/cese-plantes
npm install dotenv
```

Ou via l'interface "Setup Node.js App" → **"Run NPM Install"**

### Port déjà utilisé

cPanel assigne automatiquement un port libre. Si erreur :
1. Vérifiez le port assigné dans "Setup Node.js App"
2. Mettez à jour `.env` avec ce port
3. Redémarrez

### Page 404 Not Found

Vérifier que :
1. **Application URL** = `plante` (sans le `/`)
2. **BASE_PATH** dans `.env` = `/plante` (avec le `/`)
3. Apache/Nginx reverse proxy est actif (normalement auto par cPanel)

### Erreur après mise à jour

```bash
# Via Terminal cPanel
cd ~/cese-plantes
rm -rf node_modules package-lock.json
npm install
```

Puis redémarrer via cPanel.

---

## 📊 Structure dans cPanel

Après installation, votre structure sera :

```
~/cese-plantes/              # Votre application
  ├── server.js
  ├── package.json
  ├── .env                   # Configuration
  ├── data/
  ├── public/
  └── node_modules/          # Dépendances

~/nodevenv/                  # Environnement Node.js (géré par cPanel)
  └── cese-plantes/
      └── 18/                # Version Node.js
```

---

## ✅ Checklist de Déploiement

- [ ] Application créée dans "Setup Node.js App"
- [ ] Variables d'environnement configurées (PORT, BASE_PATH)
- [ ] Code uploadé (Git, FTP ou File Manager)
- [ ] Fichier `.env` créé avec bon PORT
- [ ] `npm install` exécuté avec succès
- [ ] Application démarrée (statut "Running")
- [ ] Test : https://cese.systadev.net/plante/ fonctionne
- [ ] Test : Les 3 pages (test, stats, admin) s'affichent

---

## 🎯 Avantages cPanel Node.js

✅ **Pas besoin de PM2** - cPanel gère le processus
✅ **Pas besoin de Nginx** - Reverse proxy automatique
✅ **Interface graphique** - Tout se fait en clics
✅ **Auto-restart** - Redémarre si crash
✅ **Logs intégrés** - Consultation facile

---

**Déploiement simplifié avec cPanel !** 🌿
