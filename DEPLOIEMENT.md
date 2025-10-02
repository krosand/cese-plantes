# 🚀 Guide de Déploiement VPS o2switch

## Prérequis VPS

Le VPS doit avoir :
- Node.js 16+ installé
- Git installé
- Port 5000 ouvert (ou autre port de votre choix)
- Accès SSH

## 📋 Étapes de Déploiement

### 1. Connexion SSH au VPS

```bash
ssh votre_utilisateur@cese.systadev.net
```

### 2. Installer Node.js (si nécessaire)

```bash
# Vérifier si Node.js est installé
node --version

# Si absent, installer Node.js 18 LTS
curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
sudo apt-get install -y nodejs
```

### 3. Cloner le Repository

```bash
# Aller dans le dossier web
cd ~/www  # ou le dossier approprié chez o2switch

# Cloner le projet
git clone git@github.com:krosand/cese-plantes.git
cd cese-plantes

# Installer les dépendances
npm install
```

### 4. Configuration (Variables d'Environnement)

L'application est **configurable pour n'importe quel chemin d'hébergement** :

```bash
# Copier le fichier d'exemple
cp .env.example .env

# Éditer la configuration
nano .env
```

**Fichier .env :**
```bash
# Port du serveur
PORT=5000

# Chemin de base (adapté automatiquement)
# Pour cese.systadev.net/plante :
BASE_PATH=/plante

# Pour hébergement à la racine :
# BASE_PATH=
```

**Le frontend détecte automatiquement le chemin** - Aucune modification HTML nécessaire !

### 5. Tester le Serveur

```bash
# Test manuel
node server.js

# Le serveur devrait afficher :
# ✅ Serveur "Adopte une Plante" démarré sur http://localhost:5000
```

### 6. Configuration PM2 (Process Manager)

Pour garder l'application en vie 24/7 :

```bash
# Installer PM2 globalement
npm install -g pm2

# Lancer l'application
pm2 start server.js --name "adopte-plante"

# Configurer PM2 pour démarrage auto
pm2 startup
pm2 save

# Commandes utiles PM2
pm2 status              # Voir statut
pm2 logs adopte-plante  # Voir logs
pm2 restart adopte-plante  # Redémarrer
pm2 stop adopte-plante     # Arrêter
```

### 7. Configuration Nginx (Reverse Proxy)

**Fichier de configuration Nginx :**

```bash
sudo nano /etc/nginx/sites-available/cese.systadev.net
```

**Contenu :**

```nginx
server {
    listen 80;
    server_name cese.systadev.net;

    location / {
        proxy_pass http://localhost:5000;
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

**Activer le site :**

```bash
sudo ln -s /etc/nginx/sites-available/cese.systadev.net /etc/nginx/sites-enabled/
sudo nginx -t
sudo systemctl reload nginx
```

### 8. Configuration SSL avec Let's Encrypt (HTTPS)

```bash
# Installer certbot
sudo apt-get install certbot python3-certbot-nginx

# Obtenir certificat SSL
sudo certbot --nginx -d cese.systadev.net

# Renouvellement auto configuré automatiquement
```

## 🔧 Configuration Spécifique o2switch

Si o2switch utilise cPanel :

### Via Terminal cPanel

1. Accéder à "Terminal" dans cPanel
2. Naviguer vers le dossier public_html ou www
3. Cloner et installer comme ci-dessus

### Via Node.js App Manager (si disponible)

1. cPanel → Software → Setup Node.js App
2. Node.js Version : 18.x
3. Application Mode : Production
4. Application Root : `/home/votre_user/cese-plantes`
5. Application URL : `cese.systadev.net`
6. Application Startup File : `server.js`

## 🔄 Mise à Jour du Code

```bash
cd ~/www/cese-plantes
git pull origin main
npm install  # Si nouvelles dépendances
pm2 restart adopte-plante
```

## 🧪 Vérification Post-Déploiement

```bash
# Vérifier que le serveur écoute
netstat -tulpn | grep :5000

# Tester en local
curl http://localhost:5000

# Tester depuis l'extérieur
curl http://cese.systadev.net
```

## 📊 URLs après Déploiement

- **Accueil (Test)** : https://cese.systadev.net/
- **Statistiques** : https://cese.systadev.net/stats.html
- **Administration** : https://cese.systadev.net/admin.html

## 🔐 Sécurité (Recommandations)

```bash
# Créer un utilisateur non-root pour l'application
sudo adduser plantapp
sudo usermod -aG www-data plantapp

# Protéger l'interface admin avec htpasswd
sudo apt-get install apache2-utils
sudo htpasswd -c /etc/nginx/.htpasswd admin

# Ajouter dans la config Nginx pour /admin.html
location /admin.html {
    auth_basic "Zone Protégée";
    auth_basic_user_file /etc/nginx/.htpasswd;
    proxy_pass http://localhost:5000;
}
```

## 📝 Logs et Monitoring

```bash
# Logs PM2
pm2 logs adopte-plante --lines 100

# Logs Nginx
sudo tail -f /var/log/nginx/access.log
sudo tail -f /var/log/nginx/error.log

# Monitoring en temps réel
pm2 monit
```

## 🆘 Troubleshooting

**Port déjà utilisé :**
```bash
sudo lsof -i :5000
sudo kill -9 <PID>
```

**Permissions fichiers :**
```bash
cd ~/www/cese-plantes
sudo chown -R $USER:www-data .
sudo chmod -R 755 .
```

**Firewall :**
```bash
sudo ufw allow 5000
sudo ufw allow 'Nginx Full'
sudo ufw status
```

## 📞 Contact Support o2switch

Si problèmes spécifiques à l'hébergement :
- Support o2switch : support@o2switch.fr
- Documentation : https://faq.o2switch.fr

---

**Déploiement préparé pour : cese.systadev.net** 🌿
