import React, { createContext, useContext, useState } from 'react';
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

  // ── Login ──────────────────────────────────────────────────────────────────
  const login = async (email: string, senha: string): Promise<boolean> => {
    setLoading(true);
    setError(null);
    try {
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
    setLoading(true);
    setError(null);
    try {
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
    setUser(prev => prev ? { ...prev, ...data } : prev);
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
