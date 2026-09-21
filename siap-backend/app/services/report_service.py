import io
import base64
from datetime import datetime
from pathlib import Path

import matplotlib
matplotlib.use('Agg')
import matplotlib.pyplot as plt

from jinja2 import Environment, FileSystemLoader
from sqlalchemy.orm import Session

from app.services.monitoring_service import MonitoringService
from app.services.assistant_service import AssistantService


class ReportService:
    """Singleton service de génération de rapports PDF actuariels."""

    _instance = None

    def __new__(cls):
        if cls._instance is None:
            cls._instance = super().__new__(cls)
            cls._instance._initialized = False
        return cls._instance

    @classmethod
    def get_instance(cls) -> "ReportService":
        instance = cls()
        if not instance._initialized:
            instance.initialize()
        return instance

    def initialize(self):
        if self._initialized:
            return
        templates_dir = Path(__file__).parent.parent / "templates" / "reports"
        self.jinja_env = Environment(loader=FileSystemLoader(str(templates_dir)))
        self._initialized = True

    def _fig_to_base64(self, fig) -> str:
        buf = io.BytesIO()
        fig.savefig(buf, format='png', dpi=120, bbox_inches='tight')
        plt.close(fig)
        buf.seek(0)
        return base64.b64encode(buf.read()).decode('utf-8')

    def _chart_loss_combined_ratio(self, trends: dict) -> str:
        annual = [r for r in trends['annual'] if r['total_claims'] >= 10]
        years = [r['year'] for r in annual]
        lr = [r['loss_ratio'] * 100 for r in annual]
        cr = [r['combined_ratio'] * 100 for r in annual]

        fig, ax = plt.subplots(figsize=(8, 4))
        ax.plot(years, lr, marker='o', label='Loss Ratio', color='#2563eb')
        ax.plot(years, cr, marker='o', label='Combined Ratio', color='#dc2626')
        ax.axhline(y=100, color='gray', linestyle='--', linewidth=0.8, label='Seuil rentabilité')
        ax.set_xlabel('Année')
        ax.set_ylabel('%')
        ax.set_title('Évolution Loss Ratio / Combined Ratio')
        ax.legend(fontsize=8)
        ax.grid(alpha=0.3)
        return self._fig_to_base64(fig)

    def _chart_regions(self, regions: dict) -> str:
        top10 = regions['regions'][:10]
        codes = [r['region_code'] for r in top10]
        values = [r['loss_ratio'] * 100 for r in top10]
        colors = [
            '#dc2626' if v > 90 else '#f97316' if v > 75 else '#f59e0b' if v > 60 else '#22c55e'
            for v in values
        ]

        fig, ax = plt.subplots(figsize=(8, 4))
        ax.barh(codes, values, color=colors)
        ax.axvline(x=72, color='gray', linestyle='--', linewidth=0.8, label='Marché (72%)')
        ax.set_xlabel('Loss Ratio (%)')
        ax.set_title('Top 10 Régions par Loss Ratio')
        ax.legend(fontsize=8)
        ax.invert_yaxis()
        return self._fig_to_base64(fig)

    def _chart_fraud_by_type(self, fraud_stats: dict) -> str:
        data = fraud_stats['by_incident_type']
        types = [d['incident_type'] for d in data]
        rates = [d['fraud_rate_pct'] for d in data]

        fig, ax = plt.subplots(figsize=(8, 4))
        ax.barh(types, rates, color='#dc2626')
        ax.set_xlabel('Taux de fraude (%)')
        ax.set_title("Taux de Fraude par Type d'Incident")
        ax.invert_yaxis()
        return self._fig_to_base64(fig)

    def _chart_ibnr_development(self, reserves: dict) -> str:
        years = sorted(reserves['reserves_by_year'].keys())
        paid = [reserves['reserves_by_year'][y]['paid_to_date'] for y in years]
        ibnr = [reserves['reserves_by_year'][y]['ibnr_reserve'] for y in years]

        fig, ax = plt.subplots(figsize=(8, 4))
        ax.bar(years, paid, label='Payé à date', color='#22c55e')
        ax.bar(years, ibnr, bottom=paid, label='Réserve IBNR', color='#f97316')
        ax.set_xlabel('Année de survenance')
        ax.set_ylabel('Montant ($)')
        ax.set_title('Développement des Sinistres par Année')
        ax.legend(fontsize=8)
        plt.setp(ax.get_xticklabels(), rotation=45)
        return self._fig_to_base64(fig)

    async def _generate_ai_commentary(self, db: Session) -> dict:
        assistant_svc = AssistantService.get_instance()

        prompts = {
            'synthese_generale': (
                "Rédige une synthèse exécutive de 4-5 phrases sur la "
                "performance globale du portefeuille (loss ratio, combined "
                "ratio, comparaison marché) à destination de la direction."
            ),
            'analyse_fraude': (
                "Rédige une analyse de 3-4 phrases sur la situation fraude "
                "du portefeuille, en identifiant les types de sinistres les "
                "plus à risque."
            ),
            'analyse_reserves': (
                "Rédige une analyse de 3-4 phrases sur la suffisance des "
                "réserves IBNR par rapport aux primes, avec une recommandation."
            ),
        }

        commentary = {}
        for key, prompt in prompts.items():
            try:
                result = await assistant_svc.chat(
                    message=prompt, history=[], db=db
                )
                commentary[key] = result['response']
            except Exception as e:
                err_msg = str(e)
                if '429' in err_msg or 'Limite' in err_msg:
                    commentary[key] = (
                        "Commentaire non disponible : limite de requêtes IA atteinte. "
                        "Réessayez dans 1 minute."
                    )
                else:
                    commentary[key] = (
                        f"Commentaire non disponible (erreur génération IA: {err_msg})"
                    )

        return commentary

    async def generate_full_report(self, db: Session) -> bytes:
        monitoring_svc = MonitoringService.get_instance()

        global_kpis = monitoring_svc.get_global_kpis(db)
        fraud_stats = monitoring_svc.get_fraud_stats(db)
        regions = monitoring_svc.get_regions(db)
        reserves = monitoring_svc.get_reserves(db)
        trends = monitoring_svc.get_trends(db)

        charts = {
            'loss_combined_ratio': self._chart_loss_combined_ratio(trends),
            'regions': self._chart_regions(regions),
            'fraud_by_type': self._chart_fraud_by_type(fraud_stats),
            'ibnr_development': self._chart_ibnr_development(reserves),
        }

        commentary = await self._generate_ai_commentary(db)

        template = self.jinja_env.get_template('full_report.html')
        html_content = template.render(
            generation_date=datetime.now().strftime('%d/%m/%Y à %H:%M'),
            global_kpis=global_kpis,
            fraud_stats=fraud_stats,
            regions=regions['regions'][:10],
            reserves=reserves,
            charts=charts,
            commentary=commentary,
        )

        return self._html_to_pdf(html_content)

    def _html_to_pdf(self, html_content: str) -> bytes:
        try:
            from weasyprint import HTML
            return HTML(string=html_content).write_pdf()
        except Exception:
            from xhtml2pdf import pisa
            buf = io.BytesIO()
            status = pisa.CreatePDF(html_content, dest=buf)
            if status.err:
                raise RuntimeError("Échec de la conversion HTML → PDF (xhtml2pdf)")
            return buf.getvalue()
