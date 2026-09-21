/* global Office, Excel, OfficeRuntime */

const SIAP_BASE_URL = "https://localhost:8000";
const TOKEN_STORAGE_KEY = "siap_jwt_token";

Office.onReady(async () => {
  await checkAndRestoreSession();
});

// ============================================================
// AUTH
// ============================================================
async function handleLogin() {
  const username = document.getElementById("username").value.trim();
  const password = document.getElementById("password").value;
  const btn = document.getElementById("btn-login");
  const errorDiv = document.getElementById("login-error");

  if (!username || !password) {
    showError("Veuillez remplir tous les champs.");
    return;
  }

  btn.textContent = "Connexion...";
  btn.disabled = true;
  errorDiv.classList.add("hidden");

  try {
    const response = await fetch(`${SIAP_BASE_URL}/api/v1/auth/login`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ username, password }),
    });

    if (!response.ok) {
      throw new Error("Identifiants incorrects");
    }

    const data = await response.json();
    await OfficeRuntime.storage.setItem(TOKEN_STORAGE_KEY, data.access_token);
    showConnectedPanel();
    await loadKPIs();
  } catch (err) {
    showError(err.message || "Erreur de connexion");
  } finally {
    btn.textContent = "Se connecter";
    btn.disabled = false;
  }
}

async function handleLogout() {
  await OfficeRuntime.storage.removeItem(TOKEN_STORAGE_KEY);
  showLoginPanel();
}

async function checkAndRestoreSession() {
  const token = await OfficeRuntime.storage.getItem(TOKEN_STORAGE_KEY);
  if (!token) { showLoginPanel(); return; }

  try {
    const response = await fetch(`${SIAP_BASE_URL}/api/v1/monitoring/global-kpis`, {
      headers: { "Authorization": `Bearer ${token}` },
    });
    if (response.ok) {
      showConnectedPanel();
      await loadKPIs();
    } else {
      await OfficeRuntime.storage.removeItem(TOKEN_STORAGE_KEY);
      showLoginPanel();
    }
  } catch {
    showLoginPanel();
  }
}

function showLoginPanel() {
  document.getElementById("login-panel").classList.remove("hidden");
  document.getElementById("connected-panel").classList.add("hidden");
  const badge = document.getElementById("status-badge");
  badge.textContent = "Déconnecté";
  badge.className = "badge badge-disconnected";
}

function showConnectedPanel() {
  document.getElementById("login-panel").classList.add("hidden");
  document.getElementById("connected-panel").classList.remove("hidden");
  const badge = document.getElementById("status-badge");
  badge.textContent = "Connecté ✓";
  badge.className = "badge badge-connected";
}

function showError(msg) {
  const div = document.getElementById("login-error");
  div.textContent = msg;
  div.classList.remove("hidden");
}

// ============================================================
// KPIs temps réel
// ============================================================
async function loadKPIs() {
  const token = await OfficeRuntime.storage.getItem(TOKEN_STORAGE_KEY);
  try {
    const [kpiRes, reserveRes] = await Promise.all([
      fetch(`${SIAP_BASE_URL}/api/v1/monitoring/global-kpis`, {
        headers: { "Authorization": `Bearer ${token}` },
      }),
      fetch(`${SIAP_BASE_URL}/api/v1/reserving/results`, {
        headers: { "Authorization": `Bearer ${token}` },
      }),
    ]);

    if (kpiRes.ok) {
      const kpiData = await kpiRes.json();
      const k = kpiData.kpis || kpiData;
      document.getElementById("kpi-loss-ratio").textContent =
        k.loss_ratio ? `${(k.loss_ratio * 100).toFixed(1)}%` : "—";
      document.getElementById("kpi-fraud-rate").textContent =
        k.fraud_rate ? `${k.fraud_rate.toFixed(1)}%` : "—";
      document.getElementById("kpi-frequency").textContent =
        k.frequency ? `${(k.frequency * 100).toFixed(2)}%` : "—";
    }

    if (reserveRes.ok) {
      const reserveData = await reserveRes.json();
      const ibnr = reserveData.chain_ladder?.total_ibnr;
      document.getElementById("kpi-ibnr").textContent =
        ibnr ? `${(ibnr / 1000).toFixed(0)}k$` : "—";
    }
  } catch (err) {
    console.error("Erreur chargement KPIs:", err);
  }
}

// ============================================================
// Insérer formule dans la cellule active
// ============================================================
async function insertFormula(formula) {
  try {
    await Excel.run(async (context) => {
      const range = context.workbook.getSelectedRange();
      range.formulas = [[formula]];
      await context.sync();
    });
  } catch (err) {
    console.error("Erreur insertion formule:", err);
  }
}

// ============================================================
// Démo : insérer une feuille de démonstration complète
// ============================================================
async function insertDemoSheet() {
  try {
    await Excel.run(async (context) => {
      // Créer ou réutiliser la feuille SIAP_Demo
      let sheet;
      try {
        sheet = context.workbook.worksheets.getItem("SIAP_Demo");
        sheet.getRange("A1:Z100").clear();
      } catch {
        sheet = context.workbook.worksheets.add("SIAP_Demo");
      }
      sheet.activate();

      // ---- Titre ----
      const titleRange = sheet.getRange("A1:H1");
      titleRange.merge(true);
      titleRange.values = [["SIAP — Smart Insurance Analytics Platform | Démo Actuarielle"]];
      titleRange.format.font.bold = true;
      titleRange.format.font.size = 14;
      titleRange.format.font.color = "#FFFFFF";
      titleRange.format.fill.color = "#1e3a5f";
      titleRange.format.horizontalAlignment = "Center";

      // ---- Section Pricing ----
      sheet.getRange("A3").values = [["MODULE 1 — SMART PRICING ENGINE"]];
      sheet.getRange("A3").format.font.bold = true;
      sheet.getRange("A3").format.font.color = "#2563eb";

      const pricingHeaders = [["Conducteur", "BonusMalus", "Région", "Marque", "Prime Pure (€)", "Prime Commerciale (€)", "Écart"]];
      sheet.getRange("A4:G4").values = pricingHeaders;
      sheet.getRange("A4:G4").format.font.bold = true;
      sheet.getRange("A4:G4").format.fill.color = "#eff6ff";

      const pricingProfiles = [
        [25, 120, "R24", "B2", 6, 2, "C", "Regular", 1200],
        [35, 80,  "R91", "B3", 8, 5, "D", "Diesel",  2500],
        [50, 60,  "R73", "B1", 5, 8, "B", "Regular", 500],
        [22, 200, "R53", "B6", 10, 1, "F", "Diesel", 3000],
        [65, 55,  "R82", "B4", 4, 15, "A", "Regular", 800],
      ];

      pricingProfiles.forEach((p, i) => {
        const row = 5 + i;
        sheet.getRange(`A${row}`).values = [[`${p[0]} ans`]];
        sheet.getRange(`B${row}`).values = [[p[1]]];
        sheet.getRange(`C${row}`).values = [[p[2]]];
        sheet.getRange(`D${row}`).values = [[p[3]]];
        sheet.getRange(`E${row}`).formulas = [[`=SIAP.PRIME(${p[0]},${p[1]},"${p[2]}","${p[3]}",${p[4]},${p[5]},"${p[6]}","${p[7]}",${p[8]},"pure")`]];
        sheet.getRange(`F${row}`).formulas = [[`=SIAP.PRIME(${p[0]},${p[1]},"${p[2]}","${p[3]}",${p[4]},${p[5]},"${p[6]}","${p[7]}",${p[8]},"commercial")`]];
        sheet.getRange(`G${row}`).formulas = [[`=F${row}-E${row}`]];
      });

      // ---- Section Fraude ----
      sheet.getRange("A11").values = [["MODULE 2 — FRAUD DETECTION"]];
      sheet.getRange("A11").format.font.bold = true;
      sheet.getRange("A11").format.font.color = "#dc2626";

      const fraudHeaders = [["Type Sinistre", "Sévérité", "Témoins", "Rapport Police", "Montant (€)", "Score Fraude", "Niveau Risque"]];
      sheet.getRange("A12:G12").values = fraudHeaders;
      sheet.getRange("A12:G12").format.font.bold = true;
      sheet.getRange("A12:G12").format.fill.color = "#fef2f2";

      const fraudCases = [
        ["Multi-vehicle Collision", "Major Damage",    0, "NO",  75000],
        ["Single Vehicle Collision","Minor Damage",    2, "YES", 5000],
        ["Vehicle Theft",           "Total Loss",      0, "NO",  45000],
        ["Parked Car",              "Trivial Damage",  1, "YES", 800],
        ["Multi-vehicle Collision", "Major Damage",    0, "NO",  120000],
      ];

      fraudCases.forEach((c, i) => {
        const row = 13 + i;
        sheet.getRange(`A${row}`).values = [[c[0]]];
        sheet.getRange(`B${row}`).values = [[c[1]]];
        sheet.getRange(`C${row}`).values = [[c[2]]];
        sheet.getRange(`D${row}`).values = [[c[3]]];
        sheet.getRange(`E${row}`).values = [[c[4]]];
        sheet.getRange(`F${row}`).formulas = [[`=SIAP.FRAUDE("${c[0]}","${c[1]}",${c[2]},"${c[3]}",${c[4]})`]];
        sheet.getRange(`G${row}`).formulas = [[`=IF(F${row}>=60,"🚨 Très élevé",IF(F${row}>=40,"⚠️ Élevé",IF(F${row}>=20,"⚡ Modéré","✅ Faible")))`]];
      });

      // ---- Section KPIs Portefeuille ----
      sheet.getRange("A20").values = [["MODULE 5 — KPIs PORTEFEUILLE (Temps Réel)"]];
      sheet.getRange("A20").format.font.bold = true;
      sheet.getRange("A20").format.font.color = "#059669";

      const kpiRows = [
        ["Loss Ratio",     '=SIAP.KPI("loss_ratio")',     "=TEXT(B21,\"0.00%\")"],
        ["Combined Ratio", '=SIAP.KPI("combined_ratio")', "=TEXT(B22,\"0.00%\")"],
        ["Fréquence",      '=SIAP.KPI("frequency")',      "=TEXT(B23,\"0.000%\")"],
        ["Sévérité (€)",   '=SIAP.KPI("severity")',       "=TEXT(B24,\"#,##0 €\")"],
        ["Taux Fraude",    '=SIAP.KPI("fraud_rate")',     "=TEXT(B25,\"0.00%\")"],
      ];

      sheet.getRange("A21:A25").values = [["Loss Ratio"], ["Combined Ratio"], ["Fréquence"], ["Sévérité (€)"], ["Taux Fraude"]];
      sheet.getRange("B21").formulas = [['=SIAP.KPI("loss_ratio")']];
      sheet.getRange("B22").formulas = [['=SIAP.KPI("combined_ratio")']];
      sheet.getRange("B23").formulas = [['=SIAP.KPI("frequency")']];
      sheet.getRange("B24").formulas = [['=SIAP.KPI("severity")']];
      sheet.getRange("B25").formulas = [['=SIAP.KPI("fraud_rate")']];

      // ---- Section IBNR ----
      sheet.getRange("A27").values = [["MODULE 3 — RÉSERVES IBNR (Chain Ladder)"]];
      sheet.getRange("A27").format.font.bold = true;
      sheet.getRange("A27").format.font.color = "#7c3aed";

      sheet.getRange("A28:B32").values = [
        ["Réserve totale (CL)", ""],
        ["Std Error (Mack)", ""],
        ["CV (Mack)", ""],
        ["Bootstrap Moyenne", ""],
        ["Bootstrap 99e Pct", ""],
      ];
      sheet.getRange("B28").formulas = [['=SIAP.IBNR("total")']];
      sheet.getRange("B29").formulas = [['=SIAP.IBNR("mack_std")']];
      sheet.getRange("B30").formulas = [['=SIAP.IBNR("mack_cv")']];
      sheet.getRange("B31").formulas = [['=SIAP.IBNR("bootstrap_mean")']];
      sheet.getRange("B32").formulas = [['=SIAP.IBNR("bootstrap_p99")']];

      // Mise en forme générale
      sheet.getRange("A1:H35").format.columnWidth = 160;
      sheet.getRange("A1:A35").format.columnWidth = 220;

      await context.sync();
    });

    console.log("Feuille de démo insérée avec succès.");
  } catch (err) {
    console.error("Erreur insertion démo:", err);
  }
}
