# SIAP — Smart Insurance Analytics Platform

**Plateforme SaaS actuarielle intégrant science actuarielle, data science, vision par ordinateur et développement full-stack pour couvrir l'ensemble du cycle de vie des polices et sinistres en assurance non-vie.**

Projet de fin d'études (PFE) — Cycle Ingénieur Actuariat & Data Science, ESPRIT.
Projet académique, sans structure d'accueil corporate.

---

## Table des matières

1. [Présentation](#présentation)
2. [Architecture générale](#architecture-générale)
3. [Modules fonctionnels](#modules-fonctionnels)
4. [Modules bonus](#modules-bonus)
5. [Stack technique](#stack-technique)
6. [Jeux de données](#jeux-de-données)
7. [Métriques clés](#métriques-clés)
8. [Installation](#installation)
9. [Structure du dépôt](#structure-du-dépôt)
10. [Démarche de développement](#démarche-de-développement)
11. [Statut du projet](#statut-du-projet)

---

## Présentation

SIAP est une plateforme unifiée destinée aux compagnies d'assurance non-vie, couvrant :

- la **tarification** (pricing actuariel + machine learning),
- la **détection de fraude**,
- le **provisionnement IBNR**,
- l'**expertise sinistres assistée par vision par ordinateur**,
- le **pilotage des risques** via un tableau de bord multi-sources,
- la **génération automatisée de rapports actuariels**,
- un **assistant IA conversationnel** pour l'interrogation des données et modèles.

Le projet illustre une approche hybride : rigueur actuarielle classique (GLM, Chain Ladder, Bornhuetter-Ferguson, Lee-Carter) combinée aux techniques modernes de data science et de MLOps (LightGBM, XGBoost, YOLOv8, CamemBERT, RAG).

---

## Architecture générale

```
┌─────────────────────┐      ┌──────────────────────┐      ┌──────────────────────┐
│   Frontend (Next.js) │ <──> │  Backend (FastAPI)    │ <──> │  PostgreSQL + Alembic │
│  React / Tailwind /  │      │  SQLAlchemy / JWT      │      │                       │
│  Recharts             │      │  Endpoints REST/modules│      └──────────────────────┘
└─────────────────────┘      └──────────────────────┘
                                        │
                                        ▼
                          ┌───────────────────────────┐
                          │  Couche Modèles ML/Actuariat│
                          │  LightGBM · XGBoost · GLM   │
                          │  YOLOv8n · SHAP · chainladder│
                          │  Groq llama-3.3-70b          │
                          └───────────────────────────┘
```

**Pattern de développement suivi pour chaque module :**
notebook (validation Google Colab) → export d'artefacts (`.pkl` / `.json`) → service backend → endpoint API → intégration frontend.

---

## Modules fonctionnels

### Module 1 — Smart Pricing
- Modèles : **LightGBM** + **GLM Gamma**
- Dataset : freMTPL2 (≈ 678 000 polices d'assurance auto françaises)
- Pipeline : EDA (fréquence de sinistre 10,07 %, coût moyen 2 278,54 €), feature engineering avec winsorisation actuarielle, bandes d'âge / bonus-malus / véhicule, préparation Poisson GLM

### Module 2 — Détection de fraude
- Modèle : **XGBoost** + **SMOTE** (gestion du déséquilibre de classes)
- Performance : **AUC ≈ 0,82**, **Recall ≈ 84 %**

### Module 3 — Provisionnement IBNR
- Méthodes : **Chain Ladder**, **Mack**, **Bornhuetter-Ferguson**, **Bootstrap ODP**
- Implémentation via la librairie `chainladder`
- Résultats validés : réserve centrale CL/Mack ≈ 494 113, Bootstrap à 0,3 % près, BF ≈ 20 % plus élevée (loss ratio a priori de 91,34 %)

### Module 4 — Vision par ordinateur
- Modèle : **YOLOv8n** fine-tuné sur plus de **8 800 images**
- Fonction : détection automatique des dommages véhicules
- Bonus : vérification de cohérence avec le score de fraude

### Module 5 — Tableau de bord de pilotage des risques
- Agrégation de KPI multi-sources sur **4 onglets**
- Validé par **10/10 contrôles actuariels**

### Module 6 — Génération de rapports PDF
- Outils : **WeasyPrint** + **Groq**
- Génération automatisée de rapports actuariels formatés

### Module 7 — Gestion des sinistres
- Création dynamique de sinistres avec **scoring de fraude automatique**
- Validé sur des profils de risque contrastés

### Assistant IA
- Modèle : **Groq llama-3.3-70b**
- Validé sur plusieurs niveaux de rigueur, incluant des tests anti-hallucination

---

## Modules bonus

### Bonus A — Détecteur de biais
- Audit du modèle de tarification via **décomposition SHAP**
- Résultat : score d'équité élevé, facteurs de risque purs dominants (pas de proxy discriminatoire significatif)

*(Modules bonus additionnels envisagés — Reserve Early Warning System et Excel-to-API Bridge — selon décision finale du périmètre)*

---

## Stack technique

| Couche | Technologies |
|---|---|
| **Backend** | FastAPI, PostgreSQL, SQLAlchemy, Alembic, JWT |
| **Frontend** | Next.js, React, Tailwind CSS, Recharts |
| **ML / IA** | LightGBM, XGBoost, SMOTE, YOLOv8n, SHAP, `chainladder`, Groq llama-3.3-70b, CamemBERT |
| **Rapports** | LaTeX/Overleaf (rapport académique), WeasyPrint (rapports générés par la plateforme) |
| **Environnement de dev** | Docker, Google Colab (validation des notebooks) |

---

## Jeux de données

- **freMTPL2** (freq/sev) — ≈ 678 000 polices d'assurance auto françaises
- Données Kaggle sur les sinistres d'assurance
- **CAS Loss Reserve Database** — via les échantillons intégrés de `chainladder` (ex. `cl.load_sample('clrd')`)
- ≈ 8 800+ images annotées pour la détection de dommages véhicules

---

## Métriques clés

| Module | Métrique | Valeur |
|---|---|---|
| Détection de fraude | AUC | 0,82 |
| Détection de fraude | Recall | 84 % |
| Tarification (EDA) | Fréquence de sinistre | 10,07 % |
| Tarification (EDA) | Coût moyen | 2 278,54 € |
| IBNR (CL/Mack) | Réserve centrale | ≈ 494 113 |
| IBNR (Bootstrap) | Écart vs CL/Mack | < 0,3 % |
| IBNR (BF) | Écart vs CL/Mack | ≈ +20 % (a priori loss ratio 91,34 %) |
| Dashboard | Contrôles actuariels validés | 10/10 |
| Sentiment (CamemBERT) | Accuracy | 92 % (20 000 échantillons) |

---

## Installation

> Exemple générique — à adapter selon la configuration réelle du dépôt.

```bash
# Cloner le dépôt
git clone <url-du-repo>
cd siap

# Backend
cd backend
python -m venv venv
source venv/bin/activate
pip install -r requirements.txt
alembic upgrade head
uvicorn main:app --reload

# Frontend
cd ../frontend
npm install
npm run dev
```

Variables d'environnement à configurer : connexion PostgreSQL, clé API Groq, secret JWT.

---

## Structure du dépôt

```
siap/
├── backend/
│   ├── app/
│   │   ├── models/          # Modèles ML/actuariels exportés (.pkl, .json)
│   │   ├── api/              # Endpoints REST par module
│   │   ├── services/         # Logique métier (pricing, fraude, IBNR, CV...)
│   │   └── db/                # SQLAlchemy + Alembic
│   └── requirements.txt
├── frontend/
│   ├── app/                  # Pages Next.js
│   ├── components/           # Composants React (dashboard, formulaires...)
│   └── package.json
├── notebooks/                # Notebooks de validation (Colab)
│   ├── 01_pricing.ipynb
│   ├── 02_fraud_detection.ipynb
│   ├── 03_ibnr_reserving.ipynb
│   ├── 04_computer_vision.ipynb
│   └── 11_early_warning.ipynb
├── report/                   # Rapport LaTeX du PFE (8 chapitres)
└── README.md
```

---

## Démarche de développement

- **Validation par exécution** : chaque module n'est considéré terminé qu'après partage des résultats d'exécution réels (captures d'écran, tracebacks, métriques) — pas de validation par simple revue de code.
- **Débogage itératif** : plusieurs bugs subtils détectés uniquement à l'exécution (valeurs par défaut codées en dur côté frontend au lieu des inputs utilisateur, incohérences de nommage de colonnes entre artefacts d'entraînement et métadonnées de déploiement, NaN sur variance nulle, objets ellipsis Python résiduels).
- **Discipline sur les données** : recours à des alternatives validées quand les données live n'étaient pas disponibles (ex. `cl.load_sample('clrd')` plutôt que des URLs GitHub fragiles, `policy_bind_date` plutôt que `incident_date` pour garantir un étalement temporel correct).

---

## Statut du projet

✅ **Tous les modules cœurs sont terminés** (notebook, backend, frontend et tests validés) :
Pricing, Fraude, IBNR, Vision par ordinateur, Dashboard, Génération de rapports, Gestion des sinistres, Assistant IA, Détecteur de biais.

📝 **Phase actuelle** : rédaction du rapport écrit en LaTeX (plan en 8 chapitres — Introduction et Architecture déjà rédigés).

🔜 **Reste à faire** :
- Finaliser les chapitres restants du rapport
- Décision sur le périmètre des modules bonus additionnels (Reserve Early Warning, Excel-to-API Bridge)
- Test d'intégration bout-en-bout complet depuis un clone propre du dépôt

---

*Projet réalisé par Yassine Selmi— Cycle Ingénieur Actuariat & Data Science, ESPRIT (été 2026).*
