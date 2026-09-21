import { VisionWithFraudOutput, DeclaredSeverity } from './vision-types';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://127.0.0.1:8000';

function getToken(): string {
  if (typeof window !== 'undefined') {
    return localStorage.getItem('token') || '';
  }
  return '';
}

export async function analyzeVehicleDamage(
  imageFile: File,
  declaredSeverity: DeclaredSeverity,
  declaredAmount: number
): Promise<VisionWithFraudOutput> {
  const formData = new FormData();
  formData.append('file', imageFile);

  const url = `${API_URL}/api/v1/vision/analyze-with-fraud?declared_severity=${encodeURIComponent(declaredSeverity)}&declared_amount=${declaredAmount}`;

  const response = await fetch(url, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${getToken()}`,
      // No Content-Type — browser sets multipart/form-data boundary automatically
    },
    body: formData,
  });

  if (!response.ok) {
    const error = await response.json().catch(() => ({ detail: 'Erreur réseau' }));
    throw new Error(error.detail || `Erreur ${response.status}`);
  }

  return response.json();
}

export async function getVisionModelInfo(): Promise<any> {
  const response = await fetch(`${API_URL}/api/v1/vision/model-info`, {
    headers: { Authorization: `Bearer ${getToken()}` },
  });
  if (!response.ok) throw new Error('Impossible de charger les infos du modèle');
  return response.json();
}
