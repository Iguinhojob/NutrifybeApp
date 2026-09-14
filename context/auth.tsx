import React, { createContext, useContext, useState } from 'react';

export type User = {
  name: string;
  email: string;
  weight: string;
  height: string;
  goal: string;
  targetWeight?: string;
  waterGoal?: string;
  setupDone?: boolean;
};

export type Nutricionista = {
  id: string;
  name: string;
  specialty: string;
  crn: string;
  rating: number;
  patients: number;
  online: boolean;
  avatar: string;
  bio: string;
};

export type VinculoStatus = 'pendente' | 'ativo' | 'encerrado';

export type Vinculo = {
  nutricionista: Nutricionista;
  status: VinculoStatus;
  dataInicio: string;
  dataUltimaRevisao: string;
};

export type PlanoVersao = {
  id: string;
  conteudo: string;
  origem: 'usuario' | 'nutricionista';
  data: string;
};

export type Observacao = {
  id: string;
  texto: string;
  data: string;
};

export type Notificacao = {
  id: string;
  tipo: 'plano_atualizado' | 'observacao' | 'vinculo_aceito' | 'vinculo_recusado' | 'acompanhamento_encerrado';
  titulo: string;
  descricao: string;
  data: string;
  lida: boolean;
};

export type Avaliacao = {
  nutriId: string;
  nota: number;
  comentario: string;
  data: string;
};

type AuthContextType = {
  user: User | null;
  isAuthenticated: boolean;
  vinculo: Vinculo | null;
  planos: PlanoVersao[];
  observacoes: Observacao[];
  notificacoes: Notificacao[];
  avaliacoes: Avaliacao[];
  login: (email: string, password: string) => boolean;
  register: (data: User & { password: string }) => void;
  logout: () => void;
  updateUser: (data: Partial<User>) => void;
  solicitarVinculo: (nutri: Nutricionista) => void;
  encerrarVinculo: () => void;
  adicionarPlano: (conteudo: string, origem: 'usuario' | 'nutricionista') => void;
  marcarNotificacaoLida: (id: string) => void;
  avaliarNutricionista: (nutriId: string, nota: number, comentario: string) => void;
};

const AuthContext = createContext<AuthContextType>({} as AuthContextType);

const MOCK_PLANOS: PlanoVersao[] = [
  { id: '1', conteudo: 'Café da manhã: Aveia com frutas\nAlmoço: Arroz, feijão, frango grelhado\nLanche: Iogurte grego\nJantar: Salmão com legumes', origem: 'nutricionista', data: '10/07/2025 09:00' },
  { id: '2', conteudo: 'Café da manhã: Ovos mexidos\nAlmoço: Macarrão integral com atum\nLanche: Banana com pasta de amendoim\nJantar: Sopa de legumes', origem: 'usuario', data: '05/07/2025 14:30' },
];

const MOCK_OBSERVACOES: Observacao[] = [
  { id: '1', texto: 'Parabéns pela consistência! Continue mantendo a hidratação em dia. Recomendo aumentar a ingestão de proteínas no café da manhã para melhorar a saciedade.', data: '10/07/2025' },
  { id: '2', texto: 'Notei que você está abaixo da meta calórica nos últimos dias. Tente adicionar um lanche da tarde mais calórico.', data: '07/07/2025' },
];

const MOCK_NOTIFICACOES: Notificacao[] = [
  { id: '1', tipo: 'plano_atualizado',  titulo: 'Plano atualizado',       descricao: 'Dra. Ana Beatriz atualizou seu plano alimentar.',         data: '10/07/2025 09:00', lida: false },
  { id: '2', tipo: 'observacao',        titulo: 'Nova observação',        descricao: 'Dra. Ana Beatriz deixou um comentário para você.',         data: '10/07/2025 09:05', lida: false },
  { id: '3', tipo: 'vinculo_aceito',    titulo: 'Vínculo aceito!',        descricao: 'Dra. Ana Beatriz aceitou seu pedido de acompanhamento.',   data: '01/07/2025 10:00', lida: true  },
];

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser]                   = useState<User | null>(null);
  const [vinculo, setVinculo]             = useState<Vinculo | null>(null);
  const [planos, setPlanos]               = useState<PlanoVersao[]>([]);
  const [observacoes, setObservacoes]     = useState<Observacao[]>([]);
  const [notificacoes, setNotificacoes]   = useState<Notificacao[]>([]);
  const [avaliacoes, setAvaliacoes]       = useState<Avaliacao[]>([]);

  const login = (email: string, password: string) => {
    if (email && password.length >= 6) {
      setUser({ name: 'Usuário', email, weight: '70', height: '170', goal: 'Perder peso', targetWeight: '65', waterGoal: '2', setupDone: true });
      // Mock: simula vínculo ativo ao logar
      setVinculo({
        nutricionista: { id: '1', name: 'Dra. Ana Beatriz', specialty: 'Nutrição Esportiva', crn: 'CRN-3 12345', rating: 4.9, patients: 128, online: true, avatar: '👩‍⚕️', bio: 'Especialista em nutrição esportiva e emagrecimento. 8 anos de experiência.' },
        status: 'ativo',
        dataInicio: '01/07/2025',
        dataUltimaRevisao: '10/07/2025',
      });
      setPlanos(MOCK_PLANOS);
      setObservacoes(MOCK_OBSERVACOES);
      setNotificacoes(MOCK_NOTIFICACOES);
      return true;
    }
    return false;
  };

  const register = (data: User & { password: string }) => {
    const { password, ...userData } = data;
    setUser({ ...userData, setupDone: false });
    setVinculo(null);
    setPlanos([]);
    setObservacoes([]);
    setNotificacoes([]);
  };

  const logout = () => {
    setUser(null);
    setVinculo(null);
    setPlanos([]);
    setObservacoes([]);
    setNotificacoes([]);
  };

  const updateUser = (data: Partial<User>) => {
    if (user) setUser({ ...user, ...data });
  };

  const solicitarVinculo = (nutri: Nutricionista) => {
    setVinculo({ nutricionista: nutri, status: 'pendente', dataInicio: '', dataUltimaRevisao: '' });
    setNotificacoes(prev => [{
      id: Date.now().toString(),
      tipo: 'vinculo_aceito',
      titulo: 'Solicitação enviada',
      descricao: `Sua solicitação foi enviada para ${nutri.name}.`,
      data: new Date().toLocaleDateString('pt-BR'),
      lida: false,
    }, ...prev]);
  };

  const encerrarVinculo = () => {
    if (vinculo) {
      setVinculo({ ...vinculo, status: 'encerrado' });
      setNotificacoes(prev => [{
        id: Date.now().toString(),
        tipo: 'acompanhamento_encerrado',
        titulo: 'Acompanhamento encerrado',
        descricao: `Seu acompanhamento com ${vinculo.nutricionista.name} foi encerrado.`,
        data: new Date().toLocaleDateString('pt-BR'),
        lida: false,
      }, ...prev]);
    }
  };

  const adicionarPlano = (conteudo: string, origem: 'usuario' | 'nutricionista') => {
    const novo: PlanoVersao = { id: Date.now().toString(), conteudo, origem, data: new Date().toLocaleString('pt-BR') };
    setPlanos(prev => [novo, ...prev]);
  };

  const marcarNotificacaoLida = (id: string) => {
    setNotificacoes(prev => prev.map(n => n.id === id ? { ...n, lida: true } : n));
  };

  const avaliarNutricionista = (nutriId: string, nota: number, comentario: string) => {
    setAvaliacoes(prev => [...prev, { nutriId, nota, comentario, data: new Date().toLocaleDateString('pt-BR') }]);
  };

  return (
    <AuthContext.Provider value={{
      user, isAuthenticated: !!user,
      vinculo, planos, observacoes, notificacoes, avaliacoes,
      login, register, logout, updateUser,
      solicitarVinculo, encerrarVinculo, adicionarPlano,
      marcarNotificacaoLida, avaliarNutricionista,
    }}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => useContext(AuthContext);
