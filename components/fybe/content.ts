/*
 * Conteúdo do Fybe: textos, ajuda por tela e tutoriais.
 * Fica separado dos componentes visuais para que as mensagens possam ser
 * atualizadas sem mexer na interface. Tudo aqui descreve telas e botões que
 * existem de verdade no app; o Fybe não usa IA e não dá orientação nutricional.
 */

export type FybeHref = '/(tabs)' | '/(tabs)/plan' | '/(tabs)/messages' | '/(tabs)/trends' | '/(tabs)/profile' | '/(tabs)/history' | '/(tabs)/water' | '/(tabs)/bmi' | '/nutri/tracking' | '/nutri/directory';

export type TutorialStep = {
  id: string;
  title: string;
  message: string;
  /** Tela (pathname) em que a etapa acontece e o link usado para abri-la. */
  route?: { pathname: string; href: FybeHref };
  /** Elemento real destacado (registrado com <FybeTarget id="...">). Sem alvo, a etapa é só uma mensagem. */
  target?: string;
  /** Texto exibido se o elemento não puder ser encontrado na tela. */
  fallback?: string;
};

export type Tutorial = {
  id: string;
  title: string;
  description: string;
  /** Só aparece quando a condição for verdadeira (ex.: depende do estado do acompanhamento). */
  when?: (ctx: FybeContext) => boolean;
  steps: TutorialStep[];
};

export type FybeContext = { followUp: 'solo' | 'pendente' | 'ativo' };

export type FaqItem = { q: string; a: string; action?: { label: string; href: FybeHref } };

export type ScreenHelp = {
  id: string;
  pathname: string;
  title: string;
  goal: string;
  intro: string;
  faq: FaqItem[];
  tutorialId?: string;
};

const HOME = { pathname: '/', href: '/(tabs)' as const };
const PLAN = { pathname: '/plan', href: '/(tabs)/plan' as const };
const TRENDS = { pathname: '/trends', href: '/(tabs)/trends' as const };
const PROFILE = { pathname: '/profile', href: '/(tabs)/profile' as const };

export const TUTORIALS: Tutorial[] = [
  {
    id: 'apresentacao',
    title: 'Conheça o NutriFybe',
    description: 'Um passeio rápido pela tela inicial.',
    steps: [
      { id: 'resumo', route: HOME, target: 'home.summary', title: 'Seu dia em um só lugar', message: 'Aqui você vê quantas calorias já registrou hoje e quanto falta para a meta do dia.' },
      { id: 'registrar', route: HOME, target: 'home.register', title: 'Registrar uma refeição', message: 'Este é o atalho principal: toque aqui sempre que comer algo para anotar no seu diário.' },
      { id: 'acompanhamento', route: HOME, target: 'home.followup', title: 'Seu acompanhamento', message: 'Este cartão mostra se você está no modo solo, aguardando um nutricionista ou com acompanhamento ativo, e qual é o próximo passo.' },
      { id: 'diario', route: HOME, target: 'home.diary', title: 'Diário de hoje', message: 'Suas refeições ficam separadas por café da manhã, almoço, jantar e lanches. Dá para adicionar, editar e excluir por aqui.' },
      { id: 'atalhos', route: HOME, target: 'home.shortcuts', title: 'Atalhos úteis', message: 'Água, IMC, medidas e o histórico dos dias anteriores ficam a um toque.' },
      { id: 'fim', title: 'Prontinho!', message: 'Use a barra de baixo para ir ao Plano, ao Chat, à Evolução e ao Perfil. Sempre que precisar, é só tocar em mim no canto da tela!' },
    ],
  },
  {
    id: 'registrar-refeicao',
    title: 'Registrar uma refeição',
    description: 'Onde anotar o que você comeu e como corrigir depois.',
    steps: [
      { id: 'botao', route: HOME, target: 'home.register', title: 'Comece por aqui', message: 'Toque em "Registrar refeição" para abrir o formulário. Você também pode usar o botão "Adicionar" de cada refeição.' },
      { id: 'formulario', title: 'No formulário', message: '1. Escolha o tipo de refeição. 2. Busque o alimento pelo nome. 3. Informe quanto comeu em gramas. Confira o total de calorias antes de salvar.' },
      { id: 'refeicoes', route: HOME, target: 'home.diary', title: 'Seus registros', message: 'Depois de salvar, a refeição aparece aqui com os botões Editar e Excluir.', fallback: 'Role a tela até "Diário de hoje" para ver suas refeições.' },
      { id: 'historico', route: HOME, target: 'home.shortcuts', title: 'Dias anteriores', message: 'As refeições de outros dias ficam no Histórico, nos atalhos ou na seção Mais ferramentas do Perfil.' },
    ],
  },
  {
    id: 'plano',
    title: 'Plano e acompanhamento',
    description: 'Como ver seu plano alimentar e o status com o nutricionista.',
    steps: [
      { id: 'status', route: PLAN, target: 'plan.status', title: 'Status do acompanhamento', message: 'Aqui aparece o seu nutricionista (ou o pedido em andamento) e a próxima ação possível.' },
      { id: 'plano', route: PLAN, target: 'plan.current', title: 'Plano atual', message: 'Quando o nutricionista enviar o plano, as refeições aparecem aqui. Toque em uma para marcá-la como concluída: ela entra no diário de hoje.' },
      { id: 'medidas', route: PLAN, target: 'plan.measures', title: 'Medidas', message: 'Registre peso e medidas por aqui. Elas aparecem na aba Evolução e para o seu nutricionista, se houver acompanhamento.' },
    ],
  },
  {
    id: 'evolucao',
    title: 'Acompanhar a evolução',
    description: 'Metas, gráficos e histórico de medidas.',
    steps: [
      { id: 'resumo', route: TRENDS, target: 'trends.summary', title: 'Resumo da meta', message: 'Seu peso atual, a meta e o objetivo. Toque em "Editar" para atualizar esses dados.' },
      { id: 'grafico', route: TRENDS, target: 'trends.chart', title: 'Gráficos', message: 'Alterne entre as calorias do dia e a evolução do peso.' },
      { id: 'medidas', route: TRENDS, target: 'trends.measures', title: 'Histórico de medidas', message: 'Todas as medidas que você registrou aparecem aqui, da mais recente para a mais antiga.', fallback: 'Role a tela até "Histórico de medidas".' },
    ],
  },
  {
    id: 'perfil',
    title: 'Perfil e ferramentas',
    description: 'Seus dados, preferências e ferramentas extras.',
    steps: [
      { id: 'dados', route: PROFILE, target: 'profile.nutrition', title: 'Seu perfil nutricional', message: 'Atividade diária, seu momento e preferências alimentares. Toque em "Editar" para mudar.' },
      { id: 'status', route: PROFILE, target: 'profile.status', title: 'Acompanhamento', message: 'O mesmo cartão de status, com o atalho para encontrar ou falar com seu nutricionista.' },
      { id: 'ferramentas', route: PROFILE, target: 'profile.tools', title: 'Mais ferramentas', message: 'Histórico alimentar, Água, Medidas, IMC e Notificações ficam aqui.' },
      { id: 'menu', route: PROFILE, target: 'profile.menu', title: 'Configurações', message: 'Tema claro ou escuro, termos, privacidade e o botão para sair da conta.', fallback: 'Role até o fim da tela para ver as configurações e o botão de sair.' },
    ],
  },
];

export const SCREENS: ScreenHelp[] = [
  {
    id: 'inicio', pathname: '/', title: 'Início', tutorialId: 'apresentacao',
    goal: 'Ver o consumo do dia e registrar refeições.',
    intro: 'Esta é a sua tela principal: o resumo de hoje, o diário e os atalhos.',
    faq: [
      { q: 'Como registro o que comi?', a: 'Toque em "Registrar refeição" ou em "Adicionar" na refeição desejada. Busque o alimento, informe as gramas e salve.' },
      { q: 'De onde vem a meta de calorias?', a: 'Se você tem um plano alimentar com calorias, a meta é a do plano. Sem plano, é uma estimativa feita pelo app a partir do seu perfil.' },
      { q: 'Por que não consigo editar um registro?', a: 'Registros sem alimentos da tabela TACO não podem ser recalculados. Exclua e registre de novo pela busca de alimentos.' },
      { q: 'Onde vejo os dias anteriores?', a: 'No Histórico alimentar.', action: { label: 'Abrir histórico', href: '/(tabs)/history' } },
    ],
  },
  {
    id: 'plano', pathname: '/plan', title: 'Plano', tutorialId: 'plano',
    goal: 'Ver o plano alimentar e o status do acompanhamento.',
    intro: 'Aqui ficam o plano enviado pelo seu nutricionista e o status do acompanhamento.',
    faq: [
      { q: 'Por que não tenho um plano?', a: 'O plano é enviado pelo nutricionista. Ele aparece aqui depois que um profissional aceitar acompanhar você e enviar o plano.' },
      { q: 'O que acontece ao marcar uma refeição do plano?', a: 'Ela entra no diário de hoje com as calorias informadas pelo nutricionista. Ao desmarcar, sai do diário.' },
      { q: 'Como encontro um nutricionista?', a: 'Pela busca de nutricionistas, filtrando por nome, especialidade ou CRN.', action: { label: 'Buscar nutricionistas', href: '/nutri/directory' } },
    ],
  },
  {
    id: 'chat', pathname: '/messages', title: 'Chat',
    goal: 'Conversar com o seu nutricionista.',
    intro: 'O chat é uma conversa privada com o seu nutricionista. Ele fica liberado quando o acompanhamento está ativo.',
    faq: [
      { q: 'Por que o chat está bloqueado?', a: 'O chat só funciona com acompanhamento ativo. Se o pedido ainda está aguardando resposta, ele é liberado assim que o nutricionista aceitar.' },
      { q: 'Posso enviar arquivos?', a: 'Sim: fotos (JPG, PNG, WEBP), PDF ou TXT de até 8 MB, pelo botão de anexo ao lado do campo de mensagem.' },
      { q: 'Quem vê as mensagens?', a: 'Somente você e o seu nutricionista.' },
    ],
  },
  {
    id: 'evolucao', pathname: '/trends', title: 'Evolução', tutorialId: 'evolucao',
    goal: 'Acompanhar metas, peso e medidas.',
    intro: 'Nesta tela você acompanha a sua meta, o gráfico de calorias e peso e o histórico de medidas.',
    faq: [
      { q: 'Como atualizo meu peso?', a: 'Registre uma nova medida. O peso informado também atualiza o seu perfil.', action: { label: 'Registrar medidas', href: '/nutri/tracking' } },
      { q: 'Como mudo minha meta?', a: 'Toque em "Editar" no cartão Resumo da meta.' },
    ],
  },
  {
    id: 'perfil', pathname: '/profile', title: 'Perfil', tutorialId: 'perfil',
    goal: 'Ver seus dados, preferências e ferramentas.',
    intro: 'Aqui estão os seus dados, as ferramentas extras e as configurações do app.',
    faq: [
      { q: 'Como troco para o tema escuro?', a: 'No menu do Perfil, toque em "Modo escuro" (ou "Modo claro").' },
      { q: 'Onde ficam Água, IMC e Medidas?', a: 'Na seção Mais ferramentas, nesta tela, e nos atalhos do Início.' },
      { q: 'Como saio da conta?', a: 'No fim desta tela, em "Sair da Conta".' },
    ],
  },
  {
    id: 'historico', pathname: '/history', title: 'Histórico alimentar',
    goal: 'Consultar refeições de dias anteriores.',
    intro: 'Aqui aparecem as refeições dos dias anteriores, do mais recente para o mais antigo. As de hoje ficam no Início.',
    faq: [{ q: 'Por que a refeição de hoje não está aqui?', a: 'O dia atual fica no Início e passa para o histórico depois da meia-noite.', action: { label: 'Ir para o Início', href: '/(tabs)' } }],
  },
  {
    id: 'agua', pathname: '/water', title: 'Água',
    goal: 'Registrar quanto você bebeu.',
    intro: 'Registre a água que você bebe ao longo do dia e compare com a sua meta diária.',
    faq: [{ q: 'Como mudo a meta de água?', a: 'Na aba Evolução, em Editar no Resumo da meta.', action: { label: 'Abrir Evolução', href: '/(tabs)/trends' } }],
  },
  {
    id: 'imc', pathname: '/bmi', title: 'IMC',
    goal: 'Calcular o índice de massa corporal.',
    intro: 'Calcule o seu IMC a partir do peso e da altura. É uma referência geral e não substitui a avaliação de um profissional.',
    faq: [],
  },
];

export const PRESENTATION = {
  title: 'Oi! Eu sou o Fybe! 🌱',
  message: 'Vou te ajudar a conhecer o NutriFybe e a descobrir onde fica cada coisa. Quer fazer um tour rapidinho?',
  accept: 'Vamos lá!',
  decline: 'Explorar sozinho',
};

export const PANEL_GREETING = 'Oi! Eu sou o Fybe 🌱 Posso te mostrar como usar o NutriFybe.';
export const NO_SCREEN_HELP = 'Ainda não tenho uma orientação específica para esta tela, mas posso te mostrar os tutoriais disponíveis!';
export const HONESTY_NOTE = 'Eu mostro orientações prontas sobre o app. Não sou uma inteligência artificial e não dou orientação nutricional.';

export const tutorialById = (id?: string) => TUTORIALS.find(t => t.id === id);
export const screenForPath = (pathname: string) => SCREENS.find(s => s.pathname === pathname);
