# Setup HTTPS local pour SIAP Excel Add-in

## Pourquoi
Office.js Custom Functions exigent HTTPS même en local.
mkcert génère des certificats auto-signés reconnus par Windows/Chrome.

## Installation

### Étape 1 — Installer mkcert
```
# Windows (avec Chocolatey)
choco install mkcert

# Ou télécharger directement : https://github.com/FiloSottile/mkcert/releases
# Placer mkcert.exe dans C:\Windows\System32\
```

### Étape 2 — Installer l'autorité de certification locale
```
mkcert -install
```
(nécessite droits administrateur — installe le CA dans le store Windows)

### Étape 3 — Générer le certificat pour localhost
```
cd siap-excel-addin
mkcert localhost 127.0.0.1
```
→ Génère `localhost+1.pem` et `localhost+1-key.pem` dans le dossier courant.

### Étape 4 — Configurer le backend FastAPI pour HTTPS
Dans `siap-backend/`, lancer avec :
```
uvicorn app.main:app --host 0.0.0.0 --port 8000 \
  --ssl-keyfile ../siap-excel-addin/localhost+1-key.pem \
  --ssl-certfile ../siap-excel-addin/localhost+1.pem
```

### Étape 5 — Lancer l'add-in
```
cd siap-excel-addin
npm install
npm start
```
→ L'add-in est servi sur https://localhost:3001
→ Excel charge le manifest depuis https://localhost:3001/manifest.xml

### Vérification
Ouvrir https://localhost:8000/docs dans Chrome → doit afficher Swagger sans avertissement HTTPS.
Ouvrir https://localhost:3001 → doit afficher la taskpane sans avertissement.
