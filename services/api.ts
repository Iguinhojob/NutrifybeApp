const BASE_URL = 'https://backend-tcc-web.onrender.com';

async function request<T>(path: string, options?: RequestInit): Promise<T> {
  const res = await fetch(`${BASE_URL}${path}`, {
    headers: { 'Content-Type': 'application/json', ...options?.headers },
    ...options,
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data?.message || `Erro ${res.status}`);
  return data as T;
}

// ── Tipos espelhando o backend ────────────────────────────────────────────────

export type Paciente = {
  id?: number;
  nome: string;
  email: string;
  senha?: string;
  idade: number;
  peso: number;
  altura: number;
  objetivo: string;
  condicaoSaude: string;
  nutricionistaId?: number | null;
  status?: string;
  ativo?: number;
  prescricaoSemanal?: string | null;
  calendario?: string | null;
  dataCriacao?: string;
};

export type Nutricionista = {
  id: number;
  nome: string;
  email: string;
  crn: string;
  status: string;
  ativo: number;
  telefone?: string;
  especialidade?: string;
  descricao?: string | null;
  foto?: string | null;
  dataCriacao?: string;
};

export type SolicitacaoPendente = {
  id?: number;
  nome: string;
  email: string;
  idade: number;
  peso: number;
  altura: number;
  objetivo: string;
  condicaoSaude: string;
  nutricionistaId?: number | null;
};

// ── Pacientes ─────────────────────────────────────────────────────────────────

export const PacientesAPI = {
  getAll: () => request<Paciente[]>('/api/pacientes'),

  getById: (id: number) => request<Paciente>(`/api/pacientes/${id}`),

  create: (paciente: Omit<Paciente, 'id' | 'dataCriacao'>) =>
    request<{ success: boolean }>('/api/pacientes', {
      method: 'POST',
      body: JSON.stringify(paciente),
    }),

  update: (id: number, data: Partial<Paciente>) =>
    request<{ success: boolean }>(`/api/pacientes/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    }),

  // Login: busca paciente por email e valida senha (sem hash no paciente)
  login: async (email: string, senha: string): Promise<Paciente | null> => {
    const todos = await request<Paciente[]>('/api/pacientes');
    const paciente = todos.find(
      p => p.email.toLowerCase() === email.toLowerCase() && p.senha === senha && p.ativo === 1
    );
    return paciente || null;
  },

  // Busca por email
  findByEmail: async (email: string): Promise<Paciente | null> => {
    const todos = await request<Paciente[]>('/api/pacientes');
    return todos.find(p => p.email.toLowerCase() === email.toLowerCase()) || null;
  },

  updateCalendario: (id: number, calendario: object) =>
    request<{ success: boolean }>(`/api/pacientes/${id}`, {
      method: 'PUT',
      body: JSON.stringify({ calendario: JSON.stringify(calendario) }),
    }),
};

// ── Nutricionistas ────────────────────────────────────────────────────────────

export const NutricionistasAPI = {
  getAll: () => request<Nutricionista[]>('/api/nutricionistas'),

  getById: (id: number) => request<Nutricionista>(`/api/nutricionistas/${id}`),

  // Login com email + crn + senha
  login: (email: string, crn: string, senha: string) =>
    request<{ success: boolean; nutricionista: Nutricionista }>('/api/nutricionistas/login', {
      method: 'POST',
      body: JSON.stringify({ email, crn, senha }),
    }),

  // Busca por CRN (para vincular paciente)
  findByCrn: async (crn: string): Promise<Nutricionista | null> => {
    const todos = await request<Nutricionista[]>('/api/nutricionistas');
    return todos.find(n => n.crn === crn && n.status === 'approved' && n.ativo === 1) || null;
  },
};

// ── Solicitações Pendentes ────────────────────────────────────────────────────

export const SolicitacoesAPI = {
  getAll: () => request<SolicitacaoPendente[]>('/api/solicitacoesPendentes'),

  create: (solicitacao: Omit<SolicitacaoPendente, 'id'>) =>
    request<{ success: boolean }>('/api/solicitacoesPendentes', {
      method: 'POST',
      body: JSON.stringify(solicitacao),
    }),

  delete: (id: number) =>
    request<{ success: boolean }>(`/api/solicitacoesPendentes/${id}`, {
      method: 'DELETE',
    }),
};
