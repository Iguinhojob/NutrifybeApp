import React, { createContext, useContext, useRef, useState } from 'react';
import { DEMO_MODE, DEMO_NUTRITIONIST, findNutritionist } from '@/services/demo';
import { ageFromBirthDate, isValidEmail, isValidPassword, measurementError } from '@/utils/onboarding';
import { PacientesAPI, NutricionistasAPI, SolicitacoesAPI } from '@/services/api';
import type { Paciente, Nutricionista } from '@/services/api';

// ── Tipos do contexto ─────────────────────────────────────────────────────────

export type User = {
  id: number;
  name: string;
  email: string;
  weight: string;
  height: string;
  goal: string;
  targetWeight?: string;
  waterGoal?: string;
  birthDate?: string;
  sexo?: string;
  activityLevel?: string;
  restrictions?: string;
  origin?: string;
  nutriCode?: string;
  motivation?: string;
  healthNote?: string;
  followupPreference?: string;
  nutricionistaId?: number | null;
  prescricaoSemanal?: string | null;
  calendario?: string | null;
};

export type VinculoStatus = 'pendente' | 'ativo' | 'sem_vinculo';

export type Vinculo = {
  nutricionista: Nutricionista;
  status: VinculoStatus;
};

export type Notificacao = {
  id: string;
  tipo: 'plano_atualizado' | 'observacao' | 'vinculo_aceito' | 'vinculo_recusado' | 'geral';
  titulo: string;
  descricao: string;
  data: string;
  lida: boolean;
};

type AuthContextType = {
  user: User | null;
  isAuthenticated: boolean;
  vinculo: Vinculo | null;
  notificacoes: Notificacao[];
  loading: boolean;
  error: string | null;
  login: (email: string, senha: string) => Promise<boolean>;
  register: (data: RegisterData) => Promise<{ success: boolean; error?: string }>;
  logout: () => void;
  updateUser: (data: Partial<User>) => void;
  solicitarVinculo: (crn: string) => Promise<{ success: boolean; error?: string }>;
  marcarNotificacaoLida: (id: string) => void;
  clearError: () => void;
};

export type RegisterData = {
  name: string;
  email: string;
  password: string;
  birthDate?: string;
  sexo?: string;
  weight: string;
  height: string;
  targetWeight: string;
  waterGoal: string;
  goal: string;
  activityLevel?: string;
  restrictions?: string;
  origin?: string;
  motivation?: string;
  healthNote?: string;
  followupPreference?: string;
  nutriCode?: string;
  nutricionistaId?: number;
};

const AuthContext = createContext<AuthContextType>({} as AuthContextType);

// ── Helpers ───────────────────────────────────────────────────────────────────

function pacienteToUser(p: Paciente): User {
  return {
    id: p.id!,
    name: p.nome,
    email: p.email,
    weight: String(p.peso),
    height: String(p.altura),
    goal: p.objetivo,
    nutricionistaId: p.nutricionistaId,
    prescricaoSemanal: p.prescricaoSemanal,
    calendario: p.calendario,
  };
}

// ── Provider ──────────────────────────────────────────────────────────────────

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser]               = useState<User | null>(null);
  const [vinculo, setVinculo]         = useState<Vinculo | null>(null);
  const [notificacoes, setNotificacoes] = useState<Notificacao[]>([]);
  const [loading, setLoading]         = useState(false);
  const [error, setError]             = useState<string | null>(null);
  // Demo profiles live only in memory and never include passwords.
  const demoProfiles = useRef(new Map<string, User>());

  // ── Login ──────────────────────────────────────────────────────────────────
  const login = async (email: string, senha: string): Promise<boolean> => {
    setLoading(true);
    setError(null);
    try {
      if (DEMO_MODE) {
        const normalized = email.trim().toLowerCase();
        const u = demoProfiles.current.get(normalized) ?? {
          id: 1, name: 'Visitante', email: normalized, weight: '70', height: '170', goal: 'Melhorar saúde',
          activityLevel: 'Leve', waterGoal: '2', nutricionistaId: null,
        };
        setUser(u);
        setVinculo(u.nutricionistaId ? { nutricionista: DEMO_NUTRITIONIST, status: 'ativo' } : null);
        return true;
      }
      const paciente = await PacientesAPI.login(email, senha);
      if (!paciente) {
        setError('Email ou senha inválidos.');
        return false;
      }

      const u = pacienteToUser(paciente);
      setUser(u);

      // Carrega vínculo com nutricionista se existir
      if (paciente.nutricionistaId) {
        try {
          const nutri = await NutricionistasAPI.getById(paciente.nutricionistaId);
          const status: VinculoStatus = paciente.status === 'accepted' ? 'ativo' : 'pendente';
          setVinculo({ nutricionista: nutri, status });

          if (paciente.status === 'accepted') {
            addNotificacao('vinculo_aceito', 'Nutricionista vinculado', `Você está sendo acompanhado por ${nutri.nome}.`);
          }
        } catch {
          // Nutricionista não encontrado, ignora
        }
      }

      return true;
    } catch (e: any) {
      setError(e.message || 'Erro ao fazer login.');
      return false;
    } finally {
      setLoading(false);
    }
  };

  // ── Registro ───────────────────────────────────────────────────────────────
  const register = async (data: RegisterData): Promise<{ success: boolean; error?: string }> => {
    if (data.name.trim().length < 2 || !isValidEmail(data.email)) return { success: false, error: 'Confira seu nome e e-mail.' };
    if (!isValidPassword(data.password)) return { success: false, error: 'Sua senha ainda não atende aos requisitos.' };
    if (!data.birthDate || ageFromBirthDate(data.birthDate) === null || !data.sexo || !data.goal || !data.activityLevel) return { success: false, error: 'Complete os dados do seu perfil antes de continuar.' };
    const invalidMeasures = measurementError(data.weight, data.height, data.targetWeight, data.goal);
    if (invalidMeasures) return { success: false, error: invalidMeasures };
    setLoading(true);
    setError(null);
    try {
      if (DEMO_MODE) {
        const email = data.email.trim().toLowerCase();
        if (demoProfiles.current.has(email)) return { success: false, error: 'Este e-mail já foi usado nesta demonstração. Entre na conta ou use outro.' };
        const nutri = data.nutricionistaId ? await findNutritionist(data.nutriCode ?? '') : null;
        if (data.nutricionistaId && nutri?.id !== data.nutricionistaId) return { success: false, error: 'Confira novamente o código do nutricionista.' };
        const u: User = {
          id: Date.now(), name: data.name.trim(), email, birthDate: data.birthDate, sexo: data.sexo,
          weight: data.weight.replace(',', '.'), height: data.height.replace(',', '.'),
          targetWeight: data.targetWeight.replace(',', '.'), waterGoal: data.waterGoal, goal: data.goal,
          activityLevel: data.activityLevel, restrictions: data.restrictions, origin: data.origin,
          motivation: data.motivation, healthNote: data.healthNote, followupPreference: data.followupPreference,
          nutriCode: data.nutriCode, nutricionistaId: nutri?.id ?? null,
        };
        demoProfiles.current.set(email, u);
        setUser(u);
        setVinculo(nutri ? { nutricionista: nutri, status: 'ativo' } : null);
        if (nutri) addNotificacao('vinculo_aceito', 'Vínculo de demonstração', `Seu perfil está conectado a ${nutri.nome} nesta prévia.`);
        return { success: true };
      }
      // Verifica se email já existe
      const existing = await PacientesAPI.findByEmail(data.email);
      if (existing) {
        return { success: false, error: 'Este email já está cadastrado.' };
      }

      const novoPaciente: Omit<Paciente, 'id' | 'dataCriacao'> = {
        nome: data.name,
        email: data.email,
        senha: data.password,
        idade: calcularIdade(data.birthDate),
        peso: parseFloat(data.weight) || 0,
        altura: parseFloat(data.height) || 0,
        objetivo: data.goal || 'Manter peso',
        condicaoSaude: data.restrictions || 'Nenhuma',
        nutricionistaId: null,
        status: 'pending',
        ativo: 1,
      };

      await PacientesAPI.create(novoPaciente);

      // Busca o paciente recém-criado para pegar o ID
      const criado = await PacientesAPI.findByEmail(data.email);
      if (!criado) return { success: false, error: 'Erro ao criar conta.' };

      setUser({
        id: criado.id!,
        name: data.name,
        email: data.email,
        weight: data.weight,
        height: data.height,
        goal: data.goal,
        targetWeight: data.targetWeight,
        waterGoal: data.waterGoal,
        birthDate: data.birthDate,
        sexo: data.sexo,
        activityLevel: data.activityLevel,
        restrictions: data.restrictions,
        origin: data.origin,
        nutricionistaId: null,
      });

      return { success: true };
    } catch (e: any) {
      return { success: false, error: e.message || 'Erro ao criar conta.' };
    } finally {
      setLoading(false);
    }
  };

  // ── Solicitar vínculo por CRN ──────────────────────────────────────────────
  // Lógica: paciente informa o CRN do nutricionista →
  // sistema busca o nutri pelo CRN → cria solicitação pendente →
  // atualiza o paciente com nutricionistaId e status "pending"
  const solicitarVinculo = async (crn: string): Promise<{ success: boolean; error?: string }> => {
    if (!user) return { success: false, error: 'Usuário não autenticado.' };
    setLoading(true);
    try {
      if (DEMO_MODE) {
        const nutri = await findNutritionist(crn);
        if (!nutri) return { success: false, error: 'Código não encontrado. Na demonstração, use 1234.' };
        const updated = { ...user, nutricionistaId: nutri.id, nutriCode: crn };
        setUser(updated);
        demoProfiles.current.set(user.email.toLowerCase(), updated);
        setVinculo({ nutricionista: nutri, status: 'ativo' });
        return { success: true };
      }
      const nutri = await NutricionistasAPI.findByCrn(crn.trim().toUpperCase());
      if (!nutri) {
        return { success: false, error: 'Nutricionista não encontrado. Verifique o CRN.' };
      }

      // Cria solicitação pendente
      await SolicitacoesAPI.create({
        nome: user.name,
        email: user.email,
        idade: calcularIdade(user.birthDate),
        peso: parseFloat(user.weight) || 0,
        altura: parseFloat(user.height) || 0,
        objetivo: user.goal,
        condicaoSaude: user.restrictions || 'Nenhuma',
        nutricionistaId: nutri.id,
      });

      // Atualiza o paciente no backend com o nutricionistaId
      await PacientesAPI.update(user.id, {
        nutricionistaId: nutri.id,
        status: 'pending',
      });

      setUser(prev => prev ? { ...prev, nutricionistaId: nutri.id } : prev);
      setVinculo({ nutricionista: nutri, status: 'pendente' });

      addNotificacao('geral', 'Solicitação enviada', `Sua solicitação foi enviada para ${nutri.nome}. Aguarde a confirmação.`);

      return { success: true };
    } catch (e: any) {
      return { success: false, error: e.message || 'Erro ao solicitar vínculo.' };
    } finally {
      setLoading(false);
    }
  };

  // ── Helpers internos ───────────────────────────────────────────────────────
  const addNotificacao = (tipo: Notificacao['tipo'], titulo: string, descricao: string) => {
    setNotificacoes(prev => [{
      id: Date.now().toString(),
      tipo,
      titulo,
      descricao,
      data: new Date().toLocaleDateString('pt-BR'),
      lida: false,
    }, ...prev]);
  };

  const logout = () => {
    setUser(null);
    setVinculo(null);
    setNotificacoes([]);
    setError(null);
  };

  const updateUser = (data: Partial<User>) => {
    if (!user) return;
    const updated = { ...user, ...data };
    if (DEMO_MODE) demoProfiles.current.set(updated.email.toLowerCase(), updated);
    setUser(updated);
  };

  const marcarNotificacaoLida = (id: string) => {
    setNotificacoes(prev => prev.map(n => n.id === id ? { ...n, lida: true } : n));
  };

  const clearError = () => setError(null);

  return (
    <AuthContext.Provider value={{
      user, isAuthenticated: !!user,
      vinculo, notificacoes,
      loading, error,
      login, register, logout, updateUser,
      solicitarVinculo, marcarNotificacaoLida, clearError,
    }}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => useContext(AuthContext);

// ── Util ──────────────────────────────────────────────────────────────────────
function calcularIdade(birthDate?: string): number {
  if (!birthDate) return 0;
  // Suporta DD/MM/AAAA
  const parts = birthDate.split('/');
  if (parts.length === 3) {
    const birth = new Date(+parts[2], +parts[1] - 1, +parts[0]);
    const diff = Date.now() - birth.getTime();
    return Math.floor(diff / (1000 * 60 * 60 * 24 * 365.25));
  }
  return 0;
}
