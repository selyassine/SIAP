import os
import json
import httpx
from fastapi import HTTPException
from sqlalchemy.orm import Session

# Import des services existants
from app.services.monitoring_service import MonitoringService
from app.services.pricing_service import PricingService
from app.services.fraud_service import FraudService
from app.services.reserving_service import ReservingService


# ─── Prompt système ────────────────────────────────────────────────────────────
SYSTEM_PROMPT = """Tu es un assistant actuariel expert intégré dans SIAP
(Smart Insurance Analytics Platform), une plateforme d'analyse pour assureurs Non-Vie.

Tu as accès aux données réelles du portefeuille via les modules suivants :
- Module 1 : Smart Pricing Engine (tarification auto GLM + LightGBM)
- Module 2 : Détection de Fraude (XGBoost, AUC=0.82, Rappel=84%)
- Module 3 : IBNR Reserving (Chain Ladder, Mack, BF, Bootstrap)
- Module 4 : Computer Vision (YOLOv8, détection dégâts auto)
- Module 5 : Risk Monitoring (KPIs portefeuille freMTPL2)

Règles de réponse :
1. Réponds TOUJOURS en français
2. Cite les chiffres exacts fournis dans le contexte
3. Donne des interprétations actuarielles (pas juste les chiffres bruts)
4. Si tu n'as pas les données pour répondre, dis-le clairement
5. Sois concis mais précis (3-5 phrases maximum par réponse)
6. Utilise le vocabulaire actuariel approprié

Tu n'inventes jamais de chiffres — tu utilises uniquement les données
fournies dans le contexte de chaque message."""


# ─── Détection d'intention ─────────────────────────────────────────────────────
INTENT_KEYWORDS = {
    'monitoring': [
        'loss ratio', 'combined ratio', 'fréquence', 'sévérité',
        'portefeuille', 'kpi', 'performance', 'région', 'prime',
        'sinistre', 'marché', 'benchmark', 'rentabilité', 'résultat'
    ],
    'fraud': [
        'fraude', 'fraud', 'frauduleux', 'suspect', 'incohérence',
        'détection', 'alerte', 'taux de fraude', 'sinistre suspect'
    ],
    'reserving': [
        'réserve', 'ibnr', 'chain ladder', 'mack', 'bornhuetter',
        'bootstrap', 'ultime', 'développement', 'provisionnement'
    ],
    'pricing': [
        'prime', 'tarif', 'pricing', 'calcul', 'bonus malus',
        'conducteur', 'véhicule', 'région', 'tarification'
    ],
}


def detect_intent(message: str) -> list[str]:
    """Détecter les modules concernés par la question."""
    message_lower = message.lower()
    intents = []
    for intent, keywords in INTENT_KEYWORDS.items():
        if any(kw in message_lower for kw in keywords):
            intents.append(intent)
    # Par défaut : monitoring (question générale sur le portefeuille)
    return intents if intents else ['monitoring']


class AssistantService:
    """Service singleton pour l'assistant actuariel IA."""

    _instance = None

    def __new__(cls):
        if cls._instance is None:
            cls._instance = super().__new__(cls)
            cls._instance._initialized = False
        return cls._instance

    def initialize(self):
        if self._initialized:
            return
        self.groq_api_key = os.getenv("GROQ_API_KEY")
        self.enabled = bool(self.groq_api_key)
        self.groq_url = "https://api.groq.com/openai/v1/chat/completions"
        self.model = "llama-3.3-70b-versatile"
        self._initialized = True
        if not self.enabled:
            print("[AssistantService] GROQ_API_KEY absente — module assistant désactivé")

    @classmethod
    def get_instance(cls) -> "AssistantService":
        instance = cls()
        if not instance._initialized:
            instance.initialize()
        return instance

    def _build_context(self, intents: list[str], db: Session) -> dict:
        """
        Récupérer les données réelles des modules concernés.
        Réutilise les services déjà instanciés — pas de doublon de code.
        """
        context = {}

        try:
            monitoring_svc = MonitoringService.get_instance()
            global_kpis = monitoring_svc.get_global_kpis(db)
            fraud_stats = monitoring_svc.get_fraud_stats(db)
            regions = monitoring_svc.get_regions(db)
            reserves = monitoring_svc.get_reserves(db)

            context['portefeuille'] = {
                'total_polices': global_kpis['portfolio']['total_policies'],
                'total_primes': global_kpis['portfolio']['total_premium'],
                'total_sinistres': global_kpis['portfolio']['total_claims'],
                'loss_ratio': global_kpis['kpis']['loss_ratio'],
                'combined_ratio': global_kpis['kpis']['combined_ratio'],
                'frequence': global_kpis['kpis']['frequency'],
                'severite': global_kpis['kpis']['severity'],
                'prime_pure': global_kpis['kpis']['pure_premium'],
                'benchmarks': global_kpis['benchmarks'],
            }
            context['fraude'] = {
                'taux_fraude_global': fraud_stats['global_stats']['fraud_rate_pct'],
                'montant_moyen_fraude': fraud_stats['global_stats']['avg_fraud_amount'],
                'montant_moyen_legitime': fraud_stats['global_stats']['avg_legit_amount'],
                'par_type_incident': fraud_stats['by_incident_type'],
                'par_severite': fraud_stats['by_severity'],
            }
            context['top_regions_risque'] = [
                {
                    'region': r['region_code'],
                    'loss_ratio': r['loss_ratio'],
                    'risk_level': r['risk_level'],
                    'frequence': r['frequency'],
                }
                for r in regions['regions'][:5]
            ]
            context['reserves_ibnr'] = {
                'total_ibnr': reserves['summary']['total_ibnr'],
                'total_primes_cas': reserves['summary']['total_premium_cas'],
                'ratio_ibnr_primes': reserves['summary']['ibnr_to_premium_ratio'],
                'compagnie': reserves['company_name'],
            }

            if 'pricing' in intents:
                pricing_svc = PricingService()
                pricing_svc.initialize()
                context['pricing_engine'] = {
                    'champion': pricing_svc.champion,
                    'loading_factor': pricing_svc.loading_factors.get(pricing_svc.champion),
                    'feature_columns_count': len(pricing_svc.feature_columns),
                    'known_region_dummies': sorted(list(pricing_svc.known_region_dummies))[:8],
                }

            if 'fraud' in intents:
                fraud_svc = FraudService.get_instance()
                context['fraud_engine'] = {
                    'optimal_threshold': fraud_svc.optimal_threshold,
                    'feature_columns_count': len(fraud_svc.feature_columns),
                    'categorical_columns': fraud_svc.cat_columns,
                    'model_performance': fraud_svc.meta.get('performance'),
                }

            if 'reserving' in intents:
                reserving_svc = ReservingService.get_instance()
                model_info = reserving_svc.get_model_info(db)
                context['reserving_engine'] = {
                    'available_grcodes': model_info['available_grcodes'],
                    'methods': model_info['methods'],
                    'artifact_list': model_info['artifacts'],
                }

        except Exception as e:
            context['erreur_donnees'] = str(e)

        return context

    async def chat(
        self,
        message: str,
        history: list[dict],
        db: Session
    ) -> dict:
        """
        Traiter un message utilisateur et retourner la réponse de l'assistant.

        Args:
            message : question de l'utilisateur
            history : historique de la conversation
                      [{"role": "user"|"assistant", "content": "..."}]
            db      : session SQLAlchemy

        Returns:
            {
                "response": str,
                "intents_detected": list[str],
                "context_used": dict,
                "model": str
            }
        """
        if not self.enabled:
            raise HTTPException(
                status_code=503,
                detail="Assistant indisponible : définissez GROQ_API_KEY dans siap-backend/.env",
            )

        # 1. Détecter l'intention
        intents = detect_intent(message)

        # 2. Récupérer les données SIAP
        context = self._build_context(intents, db)

        # 3. Construire le prompt avec contexte
        context_str = json.dumps(context, ensure_ascii=False, indent=2)
        system_with_context = (
            f"{SYSTEM_PROMPT}\n\n"
            f"=== DONNÉES ACTUELLES DU PORTEFEUILLE SIAP ===\n"
            f"{context_str}\n"
            f"=== FIN DES DONNÉES ===\n\n"
            f"Utilise ces données pour répondre à la question suivante."
        )

        # 4. Construire les messages pour Groq
        messages = [{"role": "system", "content": system_with_context}]

        # Ajouter l'historique (max 10 derniers échanges)
        for msg in history[-10:]:
            if msg.get("role") in ("user", "assistant") and msg.get("content"):
                messages.append({
                    "role": msg["role"],
                    "content": msg["content"]
                })

        # Ajouter le message actuel
        messages.append({"role": "user", "content": message})

        # 5. Appeler Groq API
        try:
            async with httpx.AsyncClient(timeout=30.0) as client:
                response = await client.post(
                    self.groq_url,
                    headers={
                        "Authorization": f"Bearer {self.groq_api_key}",
                        "Content-Type": "application/json",
                    },
                    json={
                        "model": self.model,
                        "messages": messages,
                        "max_tokens": 512,
                        "temperature": 0.3,  # plus déterministe pour les chiffres
                        "top_p": 0.9,
                    }
                )
                response.raise_for_status()
                data = response.json()

        except httpx.TimeoutException:
            raise HTTPException(
                status_code=504,
                detail="Le LLM met trop de temps à répondre. Réessaie."
            )
        except httpx.HTTPStatusError as e:
            if e.response.status_code == 429:
                raise HTTPException(
                    status_code=429,
                    detail="Limite de requêtes Groq atteinte. Attends 1 minute."
                )
            raise HTTPException(
                status_code=502,
                detail=f"Erreur Groq API : {e.response.status_code}"
            )

        # 6. Extraire la réponse
        assistant_response = data["choices"][0]["message"]["content"]

        return {
            "response": assistant_response,
            "intents_detected": intents,
            "context_used": context,
            "model": self.model,
            "tokens_used": data.get("usage", {}).get("total_tokens", 0),
        }

    def get_capabilities(self) -> dict:
        """Retourner les capacités de l'assistant (pour le frontend)."""
        return {
            "enabled": self.enabled,
            "model": self.model if self.enabled else None,
            "provider": "Groq" if self.enabled else None,
            "capabilities": [
                "Analyse du portefeuille (Loss Ratio, Fréquence, Sévérité)",
                "Statistiques de fraude par type de sinistre",
                "Réserves IBNR et provisionnement",
                "Comparaison avec les benchmarks marché",
                "Analyse des régions à risque",
                "Interprétation actuarielle des KPIs",
            ],
            "quick_questions": [
                "Quel est le loss ratio actuel du portefeuille ?",
                "Quelle région présente le plus fort risque ?",
                "Quel est le taux de fraude global ?",
                "Comment se situent nos réserves IBNR ?",
                "Le portefeuille est-il rentable par rapport au marché ?",
                "Quels types de sinistres sont les plus frauduleux ?",
                "Quel est le combined ratio et que signifie-t-il ?",
                "Résume la situation actuarielle du portefeuille.",
            ],
        }
