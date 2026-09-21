/* global CustomFunctions, OfficeRuntime */

// ============================================================
// CONFIGURATION
// ============================================================
const SIAP_BASE_URL = "https://localhost:8000";
const TOKEN_STORAGE_KEY = "siap_jwt_token";

/**
 * Récupère le token JWT stocké par la taskpane via OfficeRuntime.storage.
 * Lève une erreur explicite si non connecté.
 */
async function getToken() {
  const token = await OfficeRuntime.storage.getItem(TOKEN_STORAGE_KEY);
  if (!token) {
    throw new CustomFunctions.Error(
      CustomFunctions.ErrorCode.invalidValue,
      "Non connecté à SIAP. Ouvrir le panneau SIAP (onglet Home → SIAP Dashboard) et se connecter."
    );
  }
  return token;
}

/**
 * Helper HTTP — appel authentifié vers l'API SIAP.
 */
async function siapFetch(path, method = "GET", body = null) {
  const token = await getToken();
  const options = {
    method,
    headers: {
      "Authorization": `Bearer ${token}`,
      "Content-Type": "application/json",
    },
  };
  if (body) options.body = JSON.stringify(body);

  const response = await fetch(`${SIAP_BASE_URL}${path}`, options);

  if (response.status === 401) {
    throw new CustomFunctions.Error(
      CustomFunctions.ErrorCode.invalidValue,
      "Token expiré. Re-connectez-vous dans le panneau SIAP."
    );
  }
  if (!response.ok) {
    const err = await response.json().catch(() => ({}));
    throw new CustomFunctions.Error(
      CustomFunctions.ErrorCode.invalidValue,
      `Erreur SIAP ${response.status}: ${err.detail || response.statusText}`
    );
  }
  return response.json();
}

// ============================================================
// SIAP.PRIME — Module 1 : Smart Pricing
// ============================================================
/**
 * @customfunction
 * @param {number} driv_age Âge du conducteur
 * @param {number} bonus_malus Coefficient BonusMalus (50-350)
 * @param {string} region Code région (ex: R24)
 * @param {string} veh_brand Marque véhicule (B1-B14)
 * @param {number} veh_power Puissance véhicule
 * @param {number} veh_age Âge du véhicule
 * @param {string} area Zone géographique (A-F)
 * @param {string} gas Carburant (Regular|Diesel)
 * @param {number} density Densité de population
 * @param {string} [type] Type: pure (défaut) ou commercial
 * @returns {number} Prime en euros
 */
async function PRIME(driv_age, bonus_malus, region, veh_brand, veh_power, veh_age, area, gas, density, type = "pure") {
  const payload = {
    driv_age: driv_age,
    bonus_malus: bonus_malus,
    region: region,
    veh_brand: veh_brand,
    veh_power: veh_power,
    veh_age: veh_age,
    area: area,
    veh_gas: gas,
    density: density,
    exposure: 1.0,
  };

  const result = await siapFetch("/api/v1/pricing/predict", "POST", payload);

  if (type === "commercial") return Math.round(result.commercial_premium * 100) / 100;
  return Math.round(result.pure_premium * 100) / 100;
}

// ============================================================
// SIAP.FRAUDE — Module 2 : Fraud Detection
// ============================================================
/**
 * @customfunction
 * @param {string} incident_type Type d'incident
 * @param {string} incident_severity Sévérité du sinistre
 * @param {number} witnesses Nombre de témoins
 * @param {string} police_report YES ou NO
 * @param {number} total_claim Montant total réclamé
 * @param {number} [insured_age] Âge de l'assuré (défaut: 35)
 * @param {number} [auto_year] Année du véhicule (défaut: 2015)
 * @returns {number} Score de fraude 0-100
 */
async function FRAUDE(incident_type, incident_severity, witnesses, police_report, total_claim, insured_age = 35, auto_year = 2015) {
  // Construction du payload minimum requis par FraudInput
  const payload = {
    incident_type,
    incident_severity,
    witnesses: Math.round(witnesses),
    police_report_available: police_report,
    total_claim_amount: total_claim,
    injury_claim: Math.round(total_claim * 0.2),
    property_claim: Math.round(total_claim * 0.1),
    vehicle_claim: Math.round(total_claim * 0.7),
    insured_age,
    insured_sex: "MALE",
    insured_education_level: "College",
    insured_occupation: "craft-repair",
    insured_hobbies: "sleeping",
    insured_relationship: "husband",
    capital_gains: 0,
    capital_loss: 0,
    policy_deductible: 500,
    umbrella_limit: 0,
    policy_annual_premium: 1200,
    months_as_customer: 24,
    number_of_vehicles_involved: incident_type.includes("Multi") ? 2 : 1,
    bodily_injuries: witnesses > 0 ? 1 : 0,
    property_damage: "NO",
    auto_make: "Toyota",
    auto_model: "Corolla",
    auto_year,
    collision_type: incident_type.includes("Vehicle Theft") ? "?" : "Front Collision",
    incident_date: new Date().toISOString().split("T")[0],
    incident_city: "Paris",
    incident_state: "IDF",
    incident_hour_of_the_day: 14,
  };

  const result = await siapFetch("/api/v1/fraud/detect", "POST", payload);
  return Math.round(result.fraud_score * 10) / 10;
}

// ============================================================
// SIAP.IBNR — Module 3 : IBNR Reserving
// ============================================================
/**
 * @customfunction
 * @param {string} metric Métrique IBNR (total|mack_std|mack_cv|bootstrap_mean|bootstrap_p99|lower_95|upper_95)
 * @returns {number} Valeur numérique
 */
async function IBNR(metric) {
  const result = await siapFetch("/api/v1/reserving/results");

  const mapping = {
    "total":           result.chain_ladder?.total_ibnr,
    "mack_std":        result.mack?.std_error,
    "mack_cv":         result.mack?.cv_pct,
    "bootstrap_mean":  result.bootstrap?.mean_reserve,
    "bootstrap_p99":   result.bootstrap?.percentile_99,
    "lower_95":        result.mack?.lower_95,
    "upper_95":        result.mack?.upper_95,
  };

  const value = mapping[metric.toLowerCase()];
  if (value === undefined) {
    throw new CustomFunctions.Error(
      CustomFunctions.ErrorCode.invalidValue,
      `Métrique inconnue: "${metric}". Valeurs valides: total, mack_std, mack_cv, bootstrap_mean, bootstrap_p99, lower_95, upper_95`
    );
  }
  return Math.round(value * 100) / 100;
}

// ============================================================
// SIAP.KPI — Module 5 : Risk Monitoring
// ============================================================
/**
 * @customfunction
 * @param {string} metric KPI du portefeuille
 * @returns {number} Valeur numérique
 */
async function KPI(metric) {
  const result = await siapFetch("/api/v1/monitoring/global-kpis");
  const kpis = result.kpis || result;

  const mapping = {
    "loss_ratio":        kpis.loss_ratio,
    "combined_ratio":    kpis.combined_ratio,
    "frequency":         kpis.frequency,
    "severity":          kpis.severity,
    "total_policies":    kpis.total_policies,
    "total_claims_paid": kpis.total_claims_paid,
    "fraud_rate":        kpis.fraud_rate,
  };

  const value = mapping[metric.toLowerCase()];
  if (value === undefined) {
    throw new CustomFunctions.Error(
      CustomFunctions.ErrorCode.invalidValue,
      `KPI inconnu: "${metric}". Valeurs valides: loss_ratio, combined_ratio, frequency, severity, total_policies, total_claims_paid, fraud_rate`
    );
  }
  return Math.round(value * 10000) / 10000;
}

// ============================================================
// SIAP.VISION — Module 4 : Computer Vision
// ============================================================
/**
 * @customfunction
 * @param {string} image_url URL HTTPS de l'image
 * @param {string} [return_field] Champ retourné (severity|confidence|cost_estimate|incoherence_score)
 * @returns {string} Résultat de l'analyse
 */
async function VISION(image_url, return_field = "severity") {
  // Télécharger l'image depuis l'URL et la convertir en base64
  let imageBase64;
  try {
    const imgResponse = await fetch(image_url);
    if (!imgResponse.ok) throw new Error("Image inaccessible");
    const blob = await imgResponse.blob();
    imageBase64 = await new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onloadend = () => resolve(reader.result.split(",")[1]);
      reader.onerror = reject;
      reader.readAsDataURL(blob);
    });
  } catch (e) {
    throw new CustomFunctions.Error(
      CustomFunctions.ErrorCode.invalidValue,
      `Impossible de charger l'image depuis "${image_url}". Vérifiez que l'URL est accessible en HTTPS.`
    );
  }

  // Construire le FormData pour /api/v1/vision/analyze
  const token = await getToken();
  const formData = new FormData();
  const byteCharacters = atob(imageBase64);
  const byteArrays = [];
  for (let i = 0; i < byteCharacters.length; i += 512) {
    const slice = byteCharacters.slice(i, i + 512);
    const byteNumbers = Array.from(slice, c => c.charCodeAt(0));
    byteArrays.push(new Uint8Array(byteNumbers));
  }
  const blob2 = new Blob(byteArrays, { type: "image/jpeg" });
  formData.append("file", blob2, "vehicle.jpg");

  const response = await fetch(`${SIAP_BASE_URL}/api/v1/vision/analyze`, {
    method: "POST",
    headers: { "Authorization": `Bearer ${token}` },
    body: formData,
  });

  if (!response.ok) {
    throw new CustomFunctions.Error(
      CustomFunctions.ErrorCode.invalidValue,
      `Erreur analyse vision: ${response.status}`
    );
  }

  const result = await response.json();

  const fieldMapping = {
    "severity":          result.global_severity || "Unknown",
    "confidence":        result.confidence_avg ? Math.round(result.confidence_avg * 100) : 0,
    "cost_estimate":     result.cost_estimate?.central || 0,
    "incoherence_score": result.fraud_coherence?.incoherence_score || 0,
  };

  const value = fieldMapping[return_field.toLowerCase()];
  if (value === undefined) {
    throw new CustomFunctions.Error(
      CustomFunctions.ErrorCode.invalidValue,
      `Champ inconnu: "${return_field}". Valeurs: severity, confidence, cost_estimate, incoherence_score`
    );
  }
  return String(value);
}

// ============================================================
// Enregistrement des Custom Functions
// ============================================================
CustomFunctions.associate("PRIME",  PRIME);
CustomFunctions.associate("FRAUDE", FRAUDE);
CustomFunctions.associate("IBNR",   IBNR);
CustomFunctions.associate("KPI",    KPI);
CustomFunctions.associate("VISION", VISION);
