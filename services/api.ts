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
const parseItems = (value: unknown) => {
  if (Array.isArray(value)) return value;
  if (typeof value !== 'string' || !value) return [];
  try { const parsed = JSON.parse(value); return Array.isArray(parsed) ? parsed : []; } catch { return []; }
};
const normalizeMeal = (value: any): MealEntry => ({
  id: value.id,
  mealType: value.mealType ?? value.nome ?? 'Refeição',
  description: value.description ?? value.descricao ?? '',
  calories: Number(value.calories ?? value.calorias ?? 0),
  entryDate: value.entryDate ?? value.criadoEm ?? '',
  createdAt: value.createdAt ?? value.criadoEm ?? '',
  carbs: value.carbs == null && value.carboidratos == null ? undefined : Number(value.carbs ?? value.carboidratos),
  protein: value.protein == null && value.proteinas == null ? undefined : Number(value.protein ?? value.proteinas),
  fat: value.fat == null && value.gorduras == null ? undefined : Number(value.fat ?? value.gorduras),
  items: parseItems(value.items ?? value.itens),
  source: value.source ?? value.origem,
  referenceId: value.referenceId ?? value.referenciaId,
});
const normalizeWater = (value: any): WaterEntry => ({
  id: value.id,
  amountMl: Number(value.amountMl ?? value.quantidadeMl ?? 0),
  entryDate: value.entryDate ?? value.criadoEm ?? '',
  createdAt: value.createdAt ?? value.criadoEm ?? '',
});

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
  senha?: string;
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
  origin?: string; followupPreference?: string; nutricionistaId?: number;
};

export type AuthResponse = { token: string; paciente: Paciente };
export type MealEntry = { id: number; mealType: string; description: string; calories: number; entryDate: string; createdAt: string; carbs?: number; protein?: number; fat?: number; items?: unknown[]; source?: string; referenceId?: string };
export type WaterEntry = { id: number; amountMl: number; entryDate: string; createdAt: string };
export type MeasurementEntry = { id: number; weight?: string; waist?: string; hip?: string; arm?: string; bodyFat?: string; createdAt: string };
const normalizeMeasurement = (value: any): MeasurementEntry => ({ id: value.id, weight: value.weight ?? value.peso, waist: value.waist ?? value.cintura, hip: value.hip ?? value.quadril, arm: value.arm ?? value.braco, bodyFat: value.bodyFat ?? value.gorduraCorporal, createdAt: value.createdAt ?? value.criadoEm ?? '' });

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
  getMe: () => request<Paciente>('/api/auth/me'),
  getAll: () => request<Paciente[]>('/api/pacientes'),
  getById: (id: number) => request<Paciente>(`/api/pacientes/${id}`),
  findByEmail: async (email: string) => {
    const pacientes = await request<Paciente[]>('/api/pacientes');
    return pacientes.find(p => p.email.toLowerCase() === email.trim().toLowerCase()) ?? null;
  },
  create: (data: Partial<Paciente>) => request<{ success: boolean; paciente?: Paciente }>('/api/pacientes', {
    method: 'POST', body: JSON.stringify(data),
  }),
  update: (id: number, data: Record<string, unknown>) => request<Paciente>(`/api/pacientes/${id}`, {
    method: 'PUT', body: JSON.stringify(normalizeDecimals(data)),
  }),
  updateMe: (data: Record<string, unknown>) => request<Paciente>('/api/auth/me', {
    method: 'PUT', body: JSON.stringify(normalizeDecimals(data)),
  }),
  linkNutritionist: (nutricionistaId: number) => request<Paciente>('/api/auth/me/vinculo', {
    method: 'POST', body: JSON.stringify({ nutricionistaId }),
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
  create: (solicitacao: Partial<SolicitacaoPendente>) => request<SolicitacaoPendente>('/api/solicitacoesPendentes', {
    method: 'POST', body: JSON.stringify({ ...solicitacao, nutricionistaId: solicitacao.nutricionistaId }),
  }),
  delete: (id: number) => request<void>(`/api/solicitacoesPendentes/${id}`, { method: 'DELETE' }),
};

export const DiaryAPI = {
  meals: async (date?: string) => (await request<any[]>(`/api/diario/refeicoes${date ? `?date=${encodeURIComponent(date)}` : ''}`)).map(normalizeMeal),
  addMeal: async (data: Partial<MealEntry> & Pick<MealEntry, 'mealType' | 'description' | 'calories'>) => normalizeMeal(await request<any>('/api/diario/refeicoes', {
    method: 'POST', body: JSON.stringify({ nome: data.mealType, descricao: data.description, calorias: data.calories, carboidratos: data.carbs, proteinas: data.protein, gorduras: data.fat, itens: JSON.stringify(data.items ?? []), origem: data.source, referenciaId: data.referenceId, criadoEm: data.createdAt || data.entryDate || new Date().toISOString() }),
  })),
  updateMeal: async (id: number, data: Partial<MealEntry> & Pick<MealEntry, 'mealType' | 'description' | 'calories'>) => normalizeMeal(await request<any>(`/api/diario/refeicoes/${id}`, {
    method: 'PUT', body: JSON.stringify({ nome: data.mealType, descricao: data.description, calorias: data.calories, carboidratos: data.carbs, proteinas: data.protein, gorduras: data.fat, itens: JSON.stringify(data.items ?? []) }),
  })),
  deleteMeal: (id: number) => request<void>(`/api/diario/refeicoes/${id}`, { method: 'DELETE' }),
  water: async (date?: string) => (await request<any[]>(`/api/diario/agua${date ? `?date=${encodeURIComponent(date)}` : ''}`)).map(normalizeWater),
  addWater: async (amountMl: number, createdAt = new Date().toISOString(), referenceId?: string) => normalizeWater(await request<any>('/api/diario/agua', {
    method: 'POST', body: JSON.stringify({ amountMl, criadoEm: createdAt, referenciaId: referenceId }),
  })),
  deleteWater: (id: number) => request<void>(`/api/diario/agua/${id}`, { method: 'DELETE' }),
  measurements: async () => (await request<any[]>('/api/diario/medidas')).map(normalizeMeasurement),
  addMeasurement: async (data: Omit<MeasurementEntry, 'id' | 'createdAt'> & { createdAt?: string; referenceId?: string }) => normalizeMeasurement(await request<any>('/api/diario/medidas', {
    method: 'POST', body: JSON.stringify({ peso: data.weight, cintura: data.waist, quadril: data.hip, braco: data.arm, gorduraCorporal: data.bodyFat, criadoEm: data.createdAt || new Date().toISOString(), referenciaId: data.referenceId }),
  })),
  deleteMeasurement: (id: number) => request<void>(`/api/diario/medidas/${id}`, { method: 'DELETE' }),
};
