const BASE_URL = (process.env.EXPO_PUBLIC_API_URL || 'http://localhost:8080').replace(/\/+$/, '');
let accessToken: string | null = null;

export function setAccessToken(token: string | null) { accessToken = token; }
export function localDateString(date = new Date()) {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}
export function recentLocalDates(count: number) {
  return Array.from({ length: count }, (_, offset) => {
    const date = new Date(); date.setDate(date.getDate() - (count - offset - 1));
    return localDateString(date);
  });
}
const normalizeDecimals = (values: Record<string, unknown>) => Object.fromEntries(
  Object.entries(values).map(([key, value]) => [key, typeof value === 'string' && ['weight', 'height', 'targetWeight', 'waterGoal'].includes(key) ? value.replace(',', '.') : value]),
);

async function request<T>(path: string, options: RequestInit = {}): Promise<T> {
  const headers = new Headers(options.headers);
  headers.set('Content-Type', 'application/json');
  if (accessToken) headers.set('Authorization', `Bearer ${accessToken}`);
  const response = await fetch(`${BASE_URL}${path}`, { ...options, headers });
  const raw = await response.text();
  const data = raw ? (() => { try { return JSON.parse(raw); } catch { return { message: raw }; } })() : null;
  if (!response.ok) throw new Error(data?.message || `Erro ${response.status}`);
  return data as T;
}

export type Paciente = {
  id: number;
  nome: string;
  email: string;
  idade: number;
  dataNascimento?: string;
  sexo?: string;
  peso: number;
  altura: number;
  pesoMeta?: number;
  metaAgua?: number;
  objetivo: string;
  atividade?: string;
  motivacao?: string;
  restricoes?: string;
  observacoes?: string;
  origem?: string;
  preferenciaAcompanhamento?: string;
  condicaoSaude: string;
  nutricionistaId?: number | null;
  status?: string;
  ativo?: number;
  prescricaoSemanal?: string | null;
  calendario?: string | null;
  dataCriacao?: string;
};

export type RegisterPayload = {
  name: string; email: string; password: string; birthDate: string; sexo: string;
  weight: string; height: string; targetWeight: string; waterGoal: string; goal: string;
  activityLevel: string; restrictions?: string; healthNote?: string; motivation?: string;
  origin?: string; followupPreference?: string;
};

export type AuthResponse = { token: string; paciente: Paciente };
export type MealEntry = { id: number; mealType: string; description: string; calories: number; entryDate: string; createdAt: string };
export type WaterEntry = { id: number; amountMl: number; entryDate: string; createdAt: string };

export type Nutricionista = {
  id: number; nome: string; email: string; crn: string; status: string; ativo: number;
  telefone?: string; especialidade?: string; descricao?: string | null; foto?: string | null; dataCriacao?: string;
};

export type SolicitacaoPendente = {
  id: number; nome: string; email: string; idade: number; peso: number; altura: number;
  objetivo: string; condicaoSaude: string; nutricionistaId: number; status: string; dataCriacao?: string;
};

export const PacientesAPI = {
  register: (data: RegisterPayload) => request<AuthResponse>('/api/auth/register', {
    method: 'POST', body: JSON.stringify(normalizeDecimals(data as unknown as Record<string, unknown>)),
  }),
  login: (email: string, password: string) => request<AuthResponse>('/api/auth/login', {
    method: 'POST', body: JSON.stringify({ email, password }),
  }),
  getById: (id: number) => request<Paciente>(`/api/pacientes/${id}`),
  update: (id: number, data: Record<string, unknown>) => request<Paciente>(`/api/pacientes/${id}`, {
    method: 'PUT', body: JSON.stringify(normalizeDecimals(data)),
  }),
  updateCalendario: (id: number, calendario: object) => request<Paciente>(`/api/pacientes/${id}`, {
    method: 'PUT', body: JSON.stringify({ calendario: JSON.stringify(calendario) }),
  }),
};

export const NutricionistasAPI = {
  getAll: () => request<Nutricionista[]>('/api/nutricionistas'),
  getById: (id: number) => request<Nutricionista>(`/api/nutricionistas/${id}`),
  findByCrn: async (crn: string): Promise<Nutricionista | null> => {
    const all = await request<Nutricionista[]>('/api/nutricionistas');
    return all.find(n => n.crn.toUpperCase() === crn.trim().toUpperCase()) ?? null;
  },
};

export const SolicitacoesAPI = {
  getAll: () => request<SolicitacaoPendente[]>('/api/solicitacoesPendentes'),
  create: (solicitacao: Pick<SolicitacaoPendente, 'nutricionistaId'>) => request<SolicitacaoPendente>('/api/solicitacoesPendentes', {
    method: 'POST', body: JSON.stringify({ nutritionistId: solicitacao.nutricionistaId }),
  }),
  delete: (id: number) => request<void>(`/api/solicitacoesPendentes/${id}`, { method: 'DELETE' }),
};

export const DiaryAPI = {
  meals: (date = localDateString()) => request<MealEntry[]>(`/api/diario/refeicoes?date=${encodeURIComponent(date)}`),
  addMeal: (data: Pick<MealEntry, 'mealType' | 'description' | 'calories'> & { entryDate?: string }) => request<MealEntry>('/api/diario/refeicoes', {
    method: 'POST', body: JSON.stringify({ ...data, entryDate: data.entryDate || localDateString() }),
  }),
  deleteMeal: (id: number) => request<void>(`/api/diario/refeicoes/${id}`, { method: 'DELETE' }),
  water: (date = localDateString()) => request<WaterEntry[]>(`/api/diario/agua?date=${encodeURIComponent(date)}`),
  addWater: (amountMl: number, entryDate = localDateString()) => request<WaterEntry>('/api/diario/agua', {
    method: 'POST', body: JSON.stringify({ amountMl, entryDate }),
  }),
  resetWater: (date = localDateString()) => request<void>(`/api/diario/agua?date=${encodeURIComponent(date)}`, { method: 'DELETE' }),
};
