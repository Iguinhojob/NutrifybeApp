import React, { createContext, useCallback, useContext, useRef, useState } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { DEMO_MODE, findDemoNutritionistById, findNutritionist } from '@/services/demo';
import { ageFromBirthDate, isValidEmail, isValidPassword, measurementError } from '@/utils/onboarding';
import { PacientesAPI, NutricionistasAPI, setAccessToken } from '@/services/api';
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
  updateUser: (data: Partial<User>) => Promise<void>;
  refreshUser: () => Promise<void>;
  solicitarVinculo: (nutricionistaId: number) => Promise<{ success: boolean; error?: string }>;
  encerrarVinculo: (nota: number, comentario?: string, denuncia?: string) => Promise<{ success: boolean; error?: string }>;
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

type LocalProfile = User & { password: string };
const LOCAL_PROFILES_KEY = 'nutrifybe:local-profiles:v1';

const AuthContext = createContext<AuthContextType>({} as AuthContextType);

// ── Helpers ───────────────────────────────────────────────────────────────────

function pacienteToUser(p: Paciente): User {
  return {
    id: p.id!,
    name: p.nome ?? '',
    email: p.email,
    weight: p.peso == null ? '' : String(p.peso),
    height: p.altura == null ? '' : String(p.altura),
    goal: p.objetivo ?? '',
    targetWeight: p.pesoMeta == null ? undefined : String(p.pesoMeta),
    waterGoal: p.metaAgua == null ? undefined : String(p.metaAgua),
    birthDate: p.dataNascimento,
    sexo: p.sexo,
    activityLevel: p.atividade,
    restrictions: p.restricoes,
    motivation: p.motivacao,
    healthNote: p.observacoes ?? undefined,
    origin: p.origem,
    followupPreference: p.preferenciaAcompanhamento,
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
  const demoProfiles = useRef(new Map<string, LocalProfile>());
  const loadLocalProfiles = async () => {
    const raw = await AsyncStorage.getItem(LOCAL_PROFILES_KEY);
    if (!raw) return;
    const profiles = JSON.parse(raw) as LocalProfile[];
    demoProfiles.current = new Map(profiles.map(profile => [profile.email.toLowerCase(), profile]));
  };
  const saveLocalProfiles = () => AsyncStorage.setItem(LOCAL_PROFILES_KEY, JSON.stringify([...demoProfiles.current.values()]));

  // ── Login ──────────────────────────────────────────────────────────────────
  const login = async (email: string, senha: string): Promise<boolean> => {
    setLoading(true);
    setError(null);
    try {
      if (DEMO_MODE) {
        const normalized = email.trim().toLowerCase();
        await loadLocalProfiles();
        const profile = demoProfiles.current.get(normalized);
        if (!profile || profile.password !== senha) { setError('E-mail ou senha inválidos.'); return false; }
        const { password: _password, ...u } = profile;
        setUser(u);
        setVinculo(u.nutricionistaId ? { nutricionista: findDemoNutritionistById(u.nutricionistaId), status: 'ativo' } : null);
        return true;
      }
      const resposta = await PacientesAPI.login(email, senha);
      if (!resposta?.paciente) {
        setError('Email ou senha inválidos.');
        return false;
      }

      setAccessToken(resposta.token);
      const paciente = resposta.paciente;
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
        await loadLocalProfiles();
        if (demoProfiles.current.has(email)) return { success: false, error: 'Este e-mail já foi usado nesta demonstração. Entre na conta ou use outro.' };
        const nutri = data.nutricionistaId ? await findNutritionist(data.nutriCode ?? '') : null;
        if (data.nutricionistaId && nutri?.id !== data.nutricionistaId) return { success: false, error: 'Confira novamente o código do nutricionista.' };
        const u: LocalProfile = {
          id: Date.now(), name: data.name.trim(), email, birthDate: data.birthDate, sexo: data.sexo,
          weight: data.weight.replace(',', '.'), height: data.height.replace(',', '.'),
          targetWeight: data.targetWeight.replace(',', '.'), waterGoal: data.waterGoal, goal: data.goal,
          activityLevel: data.activityLevel, restrictions: data.restrictions, origin: data.origin,
          motivation: data.motivation, healthNote: data.healthNote, followupPreference: data.followupPreference,
          nutriCode: data.nutriCode, nutricionistaId: nutri?.id ?? null, password: data.password,
        };
        demoProfiles.current.set(email, u);
        await saveLocalProfiles();
        const { password: _password, ...localUser } = u;
        setUser(localUser);
        setVinculo(nutri ? { nutricionista: nutri, status: 'ativo' } : null);
        if (nutri) addNotificacao('vinculo_aceito', 'Vínculo de demonstração', `Seu perfil está conectado a ${nutri.nome} nesta prévia.`);
        return { success: true };
      }
      // Verifica se email já existe
      const resposta = await PacientesAPI.register({
        name: data.name,
        email: data.email,
        password: data.password,
        birthDate: data.birthDate ?? '',
        sexo: data.sexo ?? '',
        weight: data.weight,
        height: data.height,
        targetWeight: data.targetWeight,
        waterGoal: data.waterGoal,
        goal: data.goal || 'Manter peso',
        activityLevel: data.activityLevel ?? '',
        restrictions: data.restrictions,
        healthNote: data.healthNote,
        motivation: data.motivation,
        origin: data.origin,
        followupPreference: data.followupPreference,
        nutricionistaId: data.nutricionistaId,
      });
      setAccessToken(resposta.token);
      const paciente = resposta.paciente;
      setUser(pacienteToUser(paciente));
      setVinculo(null);
      if (paciente.nutricionistaId) {
        try {
          const nutri = await NutricionistasAPI.getById(paciente.nutricionistaId);
          setVinculo({ nutricionista: nutri, status: paciente.status === 'accepted' ? 'ativo' : 'pendente' });
        } catch {
          // O perfil permanece carregado mesmo se os dados públicos do nutricionista falharem.
        }
      }
      return { success: true };
    } catch (e: any) {
      return { success: false, error: e.message || 'Erro ao criar conta.' };
    } finally {
      setLoading(false);
    }
  };

  // ── Solicitar vínculo pelo ID da conta ────────────────────────────────────
  // O paciente informa o ID da conta do profissional para solicitar um vínculo.
  // atualiza o paciente com nutricionistaId e status "pending"
  const solicitarVinculo = async (nutricionistaId: number): Promise<{ success: boolean; error?: string }> => {
    if (!user) return { success: false, error: 'Usuário não autenticado.' };
    if (user.nutricionistaId) return { success: false, error: 'Encerre seu vínculo atual antes de solicitar outro nutricionista.' };
    if (!Number.isSafeInteger(nutricionistaId) || nutricionistaId <= 0) {
      return { success: false, error: 'Informe um ID de nutricionista válido.' };
    }
    setLoading(true);
    try {
      if (DEMO_MODE) {
        const nutri = await findNutritionist(String(nutricionistaId));
        if (!nutri) return { success: false, error: 'Código não encontrado. Na demonstração, use 1234.' };
        const updated = { ...user, nutricionistaId: nutri.id, nutriCode: String(nutri.id) };
        setUser(updated);
        const existing = demoProfiles.current.get(user.email.toLowerCase());
        if (existing) { demoProfiles.current.set(user.email.toLowerCase(), { ...existing, ...updated }); await saveLocalProfiles(); }
        setVinculo({ nutricionista: nutri, status: 'ativo' });
        return { success: true };
      }
      const nutri = await NutricionistasAPI.getById(nutricionistaId);
      if (nutri.ativo !== 1 || nutri.status !== 'approved') {
        return { success: false, error: 'Nutricionista não encontrado ou ainda não aprovado. Confira o ID com ele.' };
      }

      // Cria solicitação pendente
      const paciente = await PacientesAPI.linkNutritionist(nutri.id);
      setUser(pacienteToUser(paciente));
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
    setAccessToken(null);
    setUser(null);
    setVinculo(null);
    setNotificacoes([]);
    setError(null);
  };

  const updateUser = async (data: Partial<User>) => {
    if (!user) return;
    let updated = { ...user, ...data };
    if (DEMO_MODE) {
      const existing = demoProfiles.current.get(updated.email.toLowerCase());
      if (existing) { demoProfiles.current.set(updated.email.toLowerCase(), { ...existing, ...updated }); void saveLocalProfiles(); }
    } else {
      const payload: Record<string, unknown> = {};
      const fields: Array<[keyof User, string]> = [
        ['name', 'name'], ['weight', 'weight'], ['height', 'height'], ['goal', 'goal'],
        ['targetWeight', 'targetWeight'], ['waterGoal', 'waterGoal'], ['birthDate', 'birthDate'],
        ['sexo', 'sexo'], ['activityLevel', 'activityLevel'], ['restrictions', 'restrictions'],
        ['motivation', 'motivation'], ['healthNote', 'healthNote'], ['origin', 'origin'],
        ['followupPreference', 'followupPreference'],
      ];
      for (const [userKey, apiKey] of fields) {
        if (Object.prototype.hasOwnProperty.call(data, userKey)) payload[apiKey] = data[userKey];
      }
      setLoading(true);
      setError(null);
      try {
        const paciente = await PacientesAPI.updateMe(payload);
        updated = pacienteToUser(paciente);
      } catch (e: any) {
        setError(e.message || 'NÃ£o foi possÃ­vel salvar seu perfil.');
        throw e;
      } finally {
        setLoading(false);
      }
    }
    setUser(updated);
  };

  const encerrarVinculo = async (nota: number, comentario?: string, denuncia?: string): Promise<{ success: boolean; error?: string }> => {
    if (!user || !vinculo || vinculo.status !== 'ativo') return { success: false, error: 'Não há vínculo ativo para encerrar.' };
    setLoading(true);
    try {
      const result = await PacientesAPI.endNutritionistLink(nota, comentario, denuncia);
      setUser(pacienteToUser(result.paciente));
      setVinculo(null);
      return { success: true };
    } catch (e: any) {
      return { success: false, error: e.message || 'Não foi possível encerrar o vínculo agora.' };
    } finally {
      setLoading(false);
    }
  };

  const refreshUser = useCallback(async () => {
    if (!user || DEMO_MODE) return;
    const paciente = await PacientesAPI.getMe();
    const freshUser = pacienteToUser(paciente);
    if (JSON.stringify(freshUser) !== JSON.stringify(user)) setUser(freshUser);
    if (!paciente.nutricionistaId) { setVinculo(null); return; }
    try {
      const nutri = await NutricionistasAPI.getById(paciente.nutricionistaId);
      setVinculo({ nutricionista: nutri, status: paciente.status === 'accepted' ? 'ativo' : 'pendente' });
    } catch {
      setVinculo(null);
    }
  }, [user]);

  const marcarNotificacaoLida = (id: string) => {
    setNotificacoes(prev => prev.map(n => n.id === id ? { ...n, lida: true } : n));
  };

  const clearError = () => setError(null);

  return (
    <AuthContext.Provider value={{
      user, isAuthenticated: !!user,
      vinculo, notificacoes,
      loading, error,
      login, register, logout, updateUser, refreshUser,
      solicitarVinculo, encerrarVinculo, marcarNotificacaoLida, clearError,
    }}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => useContext(AuthContext);
