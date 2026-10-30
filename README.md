# SIAP — Smart Insurance Analytics Platform

**Plateforme d'analyse pour l'assurance non-vie (automobile) : tarification GLM + LightGBM, détection de fraude, provisionnement IBNR, expertise de dommages par vision par ordinateur, pilotage des risques, audit d'équité, rapports automatisés et assistant IA. Elle comprend une API FastAPI, une interface Next.js et un complément Excel.**

![Python](https://img.shields.io/badge/Python-3.11-3776AB?logo=python&logoColor=white)
![FastAPI](https://img.shields.io/badge/FastAPI-009688?logo=fastapi&logoColor=white)
![LightGBM](https://img.shields.io/badge/LightGBM-02569B)
![XGBoost](https://img.shields.io/badge/XGBoost-EB5E28)
![YOLOv8](https://img.shields.io/badge/YOLOv8-vision-111F68)
![Next.js](https://img.shields.io/badge/Next.js-000000?logo=nextdotjs&logoColor=white)
![Licence MIT](https://img.shields.io/badge/licence-MIT-green)

> Projet personnel. Les données sont publiques (freMTPL2, CAS Loss Reserve Database, jeux Kaggle) ; aucun résultat ne constitue un avis actuariel.

## En bref

- **Rigueur actuarielle et ML moderne** : GLM Gamma et Poisson à côté de LightGBM pour la tarification, Chain Ladder, Mack, Bornhuetter-Ferguson et Bootstrap ODP pour les réserves.
- **Chaque modèle suit le même chemin** : notebook validé, artefacts exportés, service backend, endpoint d'API, page de l'interface.
- **Au-delà des modèles** : audit de biais du tarif par SHAP, système d'alerte précoce sur les réserves, stress-tests Monte-Carlo, suivi de la dérive des modèles.
- **Les actuaires gardent Excel** : le complément « SIAP Actuarial Bridge » expose le tarif et le score de fraude comme formules natives (`=SIAP.PRIME(…)`, `=SIAP.FRAUDE(…)`).

## Résultats clés

| Module | Méthode | Résultat |
| --- | --- | --- |
| Tarification | GLM Gamma + LightGBM sur freMTPL2 (≈ 678 000 polices) | fréquence observée 10,07 %, coût moyen 2 278,54 € |
| Détection de fraude | XGBoost + SMOTE, Isolation Forest | AUC ≈ 0,82, rappel ≈ 84 % |
| Provisionnement IBNR | Chain Ladder / Mack, Bootstrap ODP, Bornhuetter-Ferguson | réserve centrale ≈ 494 113 ; Bootstrap à moins de 0,3 % ; BF ≈ +20 % (loss ratio a priori 91,34 %) |
| Vision par ordinateur | YOLOv8n affiné sur plus de 8 800 images | détection des dommages et contrôle de cohérence avec le score de fraude |
| Pilotage des risques | KPI par région, par année, réserves, fraude | 10/10 contrôles actuariels de cohérence |

## Architecture

```
┌────────────────────┐   ┌──────────────────────────┐   ┌──────────────────────────────┐
│  siap-frontend      │   │  siap-backend             │   │  Modèles et artefacts          │
│  Next.js, React,    │◄─►│  FastAPI, SQLAlchemy, JWT │◄─►│  LightGBM, XGBoost, GLM,       │
│  Tailwind, Recharts │   │  SQLite ou PostgreSQL     │   │  YOLOv8n, Chain Ladder, SHAP   │
└────────────────────┘   └────────────┬─────────────┘   └──────────────────────────────┘
┌────────────────────┐                │
│  siap-excel-addin   │◄───────────────┤           Groq (Llama 3.3 70B) : assistant et rapports
│  formules Excel     │                │           WeasyPrint : rapports PDF
└────────────────────┘                ▼
                                 module1 … module11 : notebooks de modélisation et artefacts
```

## Modules

| Domaine | Ce qu'il fait | Notebook | Endpoint |
| --- | --- | --- | --- |
| Tarification | Prime pure, calcul unitaire ou par lot | `module1/` | `/api/v1/pricing` |
| Fraude | Score de fraude, détection par lot | `module2/` | `/api/v1/fraud` |
| Provisionnement | Triangles, IBNR, distribution Bootstrap | `module3/` | `/api/v1/reserving` |
| Vision | Détection des dommages sur photo | `module4/` | `/api/v1/vision` |
| Pilotage | Tableau de bord des KPI | `module5/` | `/api/v1/monitoring` |
| Sinistres | Création, suivi, scoring automatique | — | `/api/v1/claims` |
| Détecteur de biais | Audit SHAP du tarif (variables proxy) | `module8/` | `/api/v1/audit/bias-report` |
| Alerte précoce | Dérive des réserves | `module9/` | `/api/v1/early-warning` |
| Stress-tests | Monte-Carlo sur le portefeuille | `module10/` | `/api/v1/monte-carlo` |
| Dérive des modèles | Suivi de la dérive des données et des scores | `module11/` | `/api/v1/drift` |
| Rapports | Rapports actuariels PDF | — | `/api/v1/reports` |
| Assistant IA | Questions sur les données et les modèles | — | `/api/v1/assistant` |

La documentation interactive de l'API est disponible sur `http://localhost:8000/docs`.

## Installation

Backend (Python 3.11) :

```bash
git clone https://github.com/selyassine/SIAP.git
cd SIAP/siap-backend
python -m venv venv
source venv/bin/activate              # Windows : venv\Scripts\activate
pip install -r requirements.txt
cp .env.example .env                  # renseigner GROQ_API_KEY et SECRET_KEY
uvicorn app.main:app --reload         # les tables sont créées au démarrage (SQLite par défaut)
pytest                                # tests de l'API
```

Ou avec Docker : `docker compose up --build` depuis `siap-backend/`.

Frontend :

```bash
cd ../siap-frontend
npm install
npm run dev                           # http://localhost:3000 ; API attendue sur http://127.0.0.1:8000
```

Le complément Excel se lance depuis `siap-excel-addin/` (voir `setup-https.md` pour le certificat local).

## Structure du dépôt

```
SIAP/
├── module1/ … module11/   # notebooks (EDA, GLM, ML, IBNR, vision, biais, alerte, stress, dérive) et artefacts exportés
├── siap-backend/
│   ├── app/
│   │   ├── api/v1/        # endpoints : auth, pricing, fraud, claims, audit d'équité, drift, monte-carlo…
│   │   ├── routers/       # endpoints : reserving, monitoring, vision
│   │   ├── services/      # logique métier
│   │   ├── ml_models/     # modèles servis par l'API
│   │   ├── models/ crud/ schemas/ db/
│   │   └── main.py
│   ├── tests/             # tests par module
│   └── requirements.txt
├── siap-frontend/         # Next.js : tableau de bord, tarification, fraude, sinistres, réserves, vision…
└── siap-excel-addin/      # complément Office : =SIAP.PRIME, =SIAP.FRAUDE
```

## Démarche

- **Un module n'est terminé que lorsqu'il a été exécuté**, résultats à l'appui (métriques, captures), pas sur simple relecture du code.
- **Les bugs n'apparaissaient qu'à l'exécution** et ont été corrigés : valeurs codées en dur dans l'interface au lieu des saisies, noms de colonnes incohérents entre entraînement et déploiement, NaN sur variance nulle.
- **Données solides plutôt que fragiles** : échantillons intégrés de `chainladder` plutôt que des URL instables, date de souscription plutôt que date d'incident pour un étalement temporel correct.

## Licence

Distribué sous licence MIT : voir [`LICENSE`](LICENSE).

---

Réalisé par **Yassine Selmi** — [github.com/selyassine](https://github.com/selyassine)
