import axios from 'axios';
import { PricingInput, PricingOutput, BatchPricingOutput, User, AuthTokens } from './types';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://127.0.0.1:8000';

const api = axios.create({
  baseURL: `${API_URL}/api/v1`,
  headers: {
    'Content-Type': 'application/json',
  },
});

api.interceptors.request.use((config) => {
  if (typeof window !== 'undefined') {
    const token = localStorage.getItem('token');
    if (token && config.headers) {
      config.headers.Authorization = `Bearer ${token}`;
    }
  }
  return config;
});

api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      if (typeof window !== 'undefined') {
        localStorage.removeItem('token');
        if (!window.location.pathname.includes('/login')) {
          window.location.href = '/login';
        }
      }
    }
    return Promise.reject(error);
  }
);

export const login = async (username: string, password: string):Promise<AuthTokens> => {
  const formData = new FormData();
  formData.append('username', username);
  formData.append('password', password);
  const { data } = await api.post<AuthTokens>('/auth/login', formData, {
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' }
  });
  if (data.access_token && typeof window !== 'undefined') {
    localStorage.setItem('token', data.access_token);
  }
  return data;
};

export const register = async (userData: any):Promise<User> => {
  const { data } = await api.post<User>('/auth/register', userData);
  return data;
};

export const getMe = async ():Promise<User> => {
  const { data } = await api.get<User>('/auth/me');
  return data;
};

export const predict = async (input: PricingInput):Promise<PricingOutput> => {
  const { data } = await api.post<PricingOutput>('/pricing/predict', input);
  return data;
};

export const predictBatch = async (policies: PricingInput[]):Promise<BatchPricingOutput> => {
  const { data } = await api.post<BatchPricingOutput>('/pricing/batch', { policies });
  return data;
};

export const logout = () => {
  if (typeof window !== 'undefined') {
    localStorage.removeItem('token');
    window.location.href = '/login';
  }
};

// ─── Module 3: IBNR Reserving ─────────────────────────────────

export const getModelInfo = async (): Promise<import('./types').ModelInfoOutput> => {
  const { data } = await api.get<import('./types').ModelInfoOutput>('/reserving/model-info');
  return data;
};

export const getReservingSummary = async (grcode: number): Promise<import('./types').ReservingSummaryOutput> => {
  const { data } = await api.get<import('./types').ReservingSummaryOutput>(`/reserving/summary?grcode=${grcode}`);
  return data;
};

export const getReservingTriangle = async (grcode: number): Promise<import('./types').TriangleOutput> => {
  const { data } = await api.get<import('./types').TriangleOutput>(`/reserving/triangle?grcode=${grcode}`);
  return data;
};

export const getReservingBootstrap = async (grcode: number): Promise<import('./types').BootstrapOutput> => {
  const { data } = await api.get<import('./types').BootstrapOutput>(`/reserving/bootstrap?grcode=${grcode}`);
  return data;
};

export const getReservingBacktest = async (grcode: number): Promise<import('./types').BacktestOutput> => {
  const { data } = await api.get<import('./types').BacktestOutput>(`/reserving/backtest?grcode=${grcode}`);
  return data;
};

// ─── Module 2: Fraud Detection ─────────────────────────────────

export const detectFraud = async (input: import('./types').FraudInput): Promise<import('./types').FraudOutput> => {
  const { data } = await api.post<import('./types').FraudOutput>('/fraud/detect', input);
  return data;
};

export const detectFraudBatch = async (claims: import('./types').FraudInput[]): Promise<import('./types').BatchFraudOutput> => {
  const { data } = await api.post<import('./types').BatchFraudOutput>('/fraud/batch', { claims });
  return data;
};

export const getFraudModelInfo = async (): Promise<import('./types').FraudModelInfo> => {
  const { data } = await api.get<import('./types').FraudModelInfo>('/fraud/model-info');
  return data;
};

// --- Module 5: Monitoring ---------------------------------

export const getDashboardSummary = async (): Promise<any> => {
  const { data } = await api.get('/monitoring/dashboard');
  return data;
};

// ─── Module 6: Reports ────────────────────────────────────────

export const generateReport = async (): Promise<void> => {
  try {
    const response = await api.post('/reports/generate', {}, {
      responseType: 'blob',
    });

    const blob = new Blob([response.data], { type: 'application/pdf' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `SIAP_Rapport_${new Date().toISOString().slice(0, 10)}.pdf`;
    document.body.appendChild(a);
    a.click();
    a.remove();
    window.URL.revokeObjectURL(url);
  } catch (err: unknown) {
    if (axios.isAxiosError(err) && err.response?.data instanceof Blob) {
      const text = await err.response.data.text();
      try {
        const json = JSON.parse(text);
        throw new Error(json.detail || 'Erreur de génération du rapport');
      } catch {
        throw new Error('Erreur de génération du rapport');
      }
    }
    throw err;
  }
};

// ─── Module 7: Claims Management ──────────────────────────────

export interface ClaimOutput {
  id: number
  claim_number: string
  incident_type: string
  incident_severity: string
  total_claim_amount: number
  auto_make: string
  auto_model: string
  auto_year: number
  fraud_score: number | null
  fraud_risk_level: string | null
  fraud_alert: boolean
  status: string
  created_at: string
}

export const createClaim = async (input: import('./types').FraudInput): Promise<ClaimOutput> => {
  const { data } = await api.post<ClaimOutput>('/claims/create', input);
  return data;
};

export const getRecentClaims = async (page = 1, pageSize = 20) => {
  const { data } = await api.get<{ claims: ClaimOutput[]; total: number; page: number; page_size: number }>(
    `/claims/recent?page=${page}&page_size=${pageSize}`
  );
  return data;
};

export const getClaimsStats = async () => {
  const { data } = await api.get<{
    total_claims: number
    total_amount: number
    avg_fraud_score: number
    alerts_count: number
    by_risk_level: Record<string, number>
    by_status: Record<string, number>
  }>('/claims/stats');
  return data;
};

export const getClaimDetail = async (id: number) => {
  const { data } = await api.get<ClaimOutput & {
    age: number
    policy_state: string
    incident_state: string
    incident_city: string
    incident_location: string
    witnesses: number
    police_report_available: string
    injury_claim: number
    property_claim: number
    vehicle_claim: number
    collision_type: string
    authorities_contacted: string
    incident_hour_of_the_day: number
    number_of_vehicles_involved: number
    property_damage: string
    bodily_injuries: number
    months_as_customer: number
    policy_csl: string
    policy_deductable: number
    policy_annual_premium: number
    insured_sex: string
    insured_education_level: string
    insured_occupation: string
  }>(`/claims/${id}`);
  return data;
};

export const updateClaimStatus = async (id: number, status: 'pending' | 'reviewed' | 'closed') => {
  const { data } = await api.patch<ClaimOutput>(`/claims/${id}/status?status=${status}`);
  return data;
};

export const updateClaim = async (id: number, input: import('./types').FraudInput): Promise<ClaimOutput> => {
  const { data } = await api.put<ClaimOutput>(`/claims/${id}`, input);
  return data;
};

export const deleteClaim = async (id: number): Promise<void> => {
  await api.delete(`/claims/${id}`);
};
