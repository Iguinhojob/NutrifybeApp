import { formatFoodName, formatFoodText } from '../utils/foodNames';

const BASE_URL = (process.env.EXPO_PUBLIC_API_URL || 'http://localhost:8080').replace(/\/+$/, '');
// Keep the login token when Expo reloads this module during development.
const apiSession = globalThis as typeof globalThis & { __nutrifybeAccessToken?: string | null };

export function setAccessToken(token: string | null) { apiSession.__nutrifybeAccessToken = token; }
export function getAccessToken() { return apiSession.__nutrifybeAccessToken ?? null; }
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
const rounded = (value: unknown, digits = 1) => {
  const number = Number(value);
  if (!Number.isFinite(number)) return 0;
  const factor = 10 ** digits;
  return Math.round((number + Number.EPSILON) * factor) / factor;
};
const parseItems = (value: unknown) => {
  if (Array.isArray(value)) return value;
  if (typeof value !== 'string' || !value) return [];
  try { const parsed = JSON.parse(value); return Array.isArray(parsed) ? parsed : []; } catch { return []; }
};
const normalizeMealDate = (value: unknown) => {
  if (typeof value !== 'string') return '';
  // The API stores date-only diary entries at 00:00 UTC. Keep their calendar
  // date as entered instead of shifting them to the previous day in UTC-03.
  const utcMidnight = value.match(/^(\d{4}-\d{2}-\d{2})T00:00:00(?:\.0+)?Z$/);
  return utcMidnight ? utcMidnight[1] : value;
};
const mealEntryDate = (data: Partial<MealEntry>) => data.entryDate || (data.createdAt && /^\d{4}-\d{2}-\d{2}$/.test(data.createdAt)
  ? data.createdAt : localDateString(data.createdAt ? new Date(data.createdAt) : new Date()));
const normalizeMeal = (value: any): MealEntry => ({
  id: value.id,
  mealType: value.mealType ?? value.nome ?? 'Refeição',
  description: formatFoodText(value.description ?? value.descricao ?? ''),
  calories: rounded(value.calories ?? value.calorias ?? 0, 0),
  entryDate: normalizeMealDate(value.entryDate ?? value.criadoEm),
  createdAt: normalizeMealDate(value.createdAt ?? value.criadoEm),
  carbs: value.carbs == null && value.carboidratos == null ? undefined : rounded(value.carbs ?? value.carboidratos),
  protein: value.protein == null && value.proteinas == null ? undefined : rounded(value.protein ?? value.proteinas),
  fat: value.fat == null && value.gorduras == null ? undefined : rounded(value.fat ?? value.gorduras),
  fiber: value.fiber == null && value.fibras == null ? undefined : rounded(value.fiber ?? value.fibras),
  items: parseItems(value.items ?? value.itens).map((item: any) => ({ ...item, name: formatFoodName(item.name ?? item.nome ?? '') })),
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
  if (!(typeof FormData !== 'undefined' && options.body instanceof FormData)) headers.set('Content-Type', 'application/json');
  const accessToken = getAccessToken();
  if (accessToken) headers.set('Authorization', `Bearer ${accessToken}`);
  const response = await fetch(`${BASE_URL}${path}`, { ...options, headers });
  const raw = await response.text();
  const data = raw ? (() => { try { return JSON.parse(raw); } catch { return { message: raw }; } })() : null;
  if (!response.ok) {
    if (response.status === 401 && (accessToken || path.startsWith('/api/diario'))) {
      throw new Error('Sua sessão expirou. Entre novamente na sua conta.');
    }
    throw new Error(data?.message || `Não foi possível concluir a solicitação (erro ${response.status}).`);
  }
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
export type MealEntry = { id: number; mealType: string; description: string; calories: number; entryDate: string; createdAt: string; carbs?: number; protein?: number; fat?: number; fiber?: number; items?: unknown[]; source?: string; referenceId?: string };
export type CalorieTarget = { calorias: number; origem: 'plano' | 'pessoal' | 'padrao'; editavel: boolean; refeicoes: { indice: number; nome: string; horario: string }[] };
export type FoodSearchResult = { foodId: string; alimentoId: number; description: string; dataType: string; brandName: string; caloriesPer100g: number; carbsPer100g?: number; proteinPer100g?: number; fatPer100g?: number; fiberPer100g?: number; source: string };
export type WaterEntry = { id: number; amountMl: number; entryDate: string; createdAt: string };
export type MeasurementEntry = { id: number; weight?: string; waist?: string; hip?: string; arm?: string; bodyFat?: string; createdAt: string };
const normalizeMeasurement = (value: any): MeasurementEntry => ({ id: value.id, weight: value.weight ?? value.peso, waist: value.waist ?? value.cintura, hip: value.hip ?? value.quadril, arm: value.arm ?? value.braco, bodyFat: value.bodyFat ?? value.gorduraCorporal, createdAt: value.createdAt ?? value.criadoEm ?? '' });

export type Nutricionista = {
  id: number; nome: string; email: string; crn: string; status: string; ativo: number;
  telefone?: string; especialidade?: string; descricao?: string | null; foto?: string | null; dataCriacao?: string;
};
export type NutritionistReview = { nota: number; comentario?: string | null; criadoEm: string };
export type NutritionistReviewsResponse = { media: number | null; total: number; avaliacoes: NutritionistReview[] };

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
  endNutritionistLink: (nota: number, comentario?: string, denuncia?: string) =>
    request<{ success: boolean; paciente: Paciente }>('/api/auth/me/vinculo/encerrar', {
      method: 'POST', body: JSON.stringify({ nota, comentario, denuncia }),
    }),
  updateCalendario: (id: number, calendario: object) => request<Paciente>(`/api/pacientes/${id}`, {
    method: 'PUT', body: JSON.stringify({ calendario: JSON.stringify(calendario) }),
  }),
};

export const NutricionistasAPI = {
  getAll: () => request<Nutricionista[]>('/api/nutricionistas'),
  getById: (id: number) => request<Nutricionista>(`/api/nutricionistas/${id}`),
  getReviews: (id: number) => request<NutritionistReviewsResponse>(`/api/nutricionistas/${id}/avaliacoes`),
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
  calorieTarget: () => request<CalorieTarget>('/api/diario/meta'),
  saveCalorieTarget: (calorias: number) => request<CalorieTarget>('/api/diario/meta', { method: 'PUT', body: JSON.stringify({ calorias }) }),
  searchFoods: async (query: string) => (await request<FoodSearchResult[]>(`/api/alimentos?busca=${encodeURIComponent(query)}`)).map(food => ({ ...food, description: formatFoodName(food.description) })),
  meals: async (date?: string) => (await request<any[]>(`/api/diario/refeicoes${date ? `?date=${encodeURIComponent(date)}` : ''}`)).map(normalizeMeal),
  addMeal: async (data: Partial<MealEntry> & Pick<MealEntry, 'mealType' | 'description' | 'calories'>) => normalizeMeal(await request<any>('/api/diario/refeicoes', {
    method: 'POST', body: JSON.stringify({ mealType: data.mealType, description: data.description, calories: data.calories, entryDate: mealEntryDate(data), criadoEm: data.createdAt || new Date().toISOString(), origem: data.source, referenciaId: data.referenceId, carbs: data.carbs, protein: data.protein, fat: data.fat, fiber: data.fiber, items: JSON.stringify(data.items ?? []) }),
  })),
  updateMeal: async (id: number, data: Partial<MealEntry> & Pick<MealEntry, 'mealType' | 'description' | 'calories'>) => normalizeMeal(await request<any>(`/api/diario/refeicoes/${id}`, {
    method: 'PUT', body: JSON.stringify({ mealType: data.mealType, description: data.description, calories: data.calories, entryDate: data.entryDate || localDateString(), carbs: data.carbs, protein: data.protein, fat: data.fat, fiber: data.fiber, items: JSON.stringify(data.items ?? []) }),
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

export type ChatMessage = {
  id: number; pacienteId: number; remetenteTipo: 'paciente' | 'nutricionista'; remetenteId: number;
  remetenteNome: string; texto?: string | null; criadoEm: string; lidoEm?: string | null;
  arquivoNome?: string | null; arquivoTipo?: string | null; arquivoTamanho?: number | null;
};

export const ChatAPI = {
  messages: (pacienteId?: number) => request<ChatMessage[]>(`/api/chat/mensagens${pacienteId ? `?pacienteId=${pacienteId}` : ''}`),
  send: (form: FormData, pacienteId?: number) => request<ChatMessage>(`/api/chat/mensagens${pacienteId ? `?pacienteId=${pacienteId}` : ''}`, { method: 'POST', body: form }),
  attachmentUrl: (messageId: number, pacienteId?: number) => `${BASE_URL}/api/chat/mensagens/${messageId}/arquivo${pacienteId ? `?pacienteId=${pacienteId}` : ''}`,
  fetchAttachment: async (messageId: number, pacienteId?: number) => {
    const headers = new Headers();
    const accessToken = getAccessToken();
    if (accessToken) headers.set('Authorization', `Bearer ${accessToken}`);
    const response = await fetch(`${BASE_URL}/api/chat/mensagens/${messageId}/arquivo${pacienteId ? `?pacienteId=${pacienteId}` : ''}`, { headers });
    if (!response.ok) throw new Error(`Não foi possível abrir o anexo (${response.status}).`);
    return response;
  },
};
