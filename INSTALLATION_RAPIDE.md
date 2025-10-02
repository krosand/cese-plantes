# 🚀 Installation Rapide - cese.systadev.net/plante

## Sur le VPS o2switch

### 1. Connexion SSH
```bash
ssh votre_user@cese.systadev.net
```

### 2. Cloner le projet
```bash
cd ~/www  # ou votre dossier web
git clone git@github.com:krosand/cese-plantes.git
cd cese-plantes
```

### 3. Installer dépendances
```bash
npm install
```

### 4. Configuration
```bash
# Copier et éditer le fichier de config
cp .env.example .env
nano .env
```

**Contenu du .env :**
```bash
PORT=5000
BASE_PATH=/plante
```

### 5. Lancer avec PM2
```bash
# Installer PM2 (si pas déjà fait)
npm install -g pm2

# Démarrer l'application
pm2 start ecosystem.config.js

# Sauvegarder pour démarrage auto
pm2 save
pm2 startup
```

### 6. Configuration Nginx

**Créer le fichier de config :**
```bash
sudo nano /etc/nginx/sites-available/cese-plantes
```

**Contenu :**
```nginx
server {
    listen 80;
    server_name cese.systadev.net;

    # Sous-chemin /plante
    location /plante {
        proxy_pass http://localhost:5000/plante;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }
}
```

**Activer :**
```bash
sudo ln -s /etc/nginx/sites-available/cese-plantes /etc/nginx/sites-enabled/
sudo nginx -t
sudo systemctl reload nginx
```

### 7. SSL (Optionnel mais recommandé)
```bash
sudo certbot --nginx -d cese.systadev.net
```

## ✅ Vérification

Accéder à : **https://cese.systadev.net/plante**

### URLs disponibles :
- Test : https://cese.systadev.net/plante/
- Stats : https://cese.systadev.net/plante/stats.html
- Admin : https://cese.systadev.net/plante/admin.html

## 🔄 Mise à jour
```bash
cd ~/www/cese-plantes
git pull origin main
npm install
pm2 restart adopte-plante
```

## 📊 Monitoring
```bash
pm2 status          # Voir l'état
pm2 logs            # Voir les logs
pm2 monit           # Monitoring temps réel
```

---

**C'est tout ! L'application détecte automatiquement le chemin `/plante` grâce au BASE_PATH.** 🌿
