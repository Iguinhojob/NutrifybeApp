import { useFollowUp } from '@/components/follow-up-status';
import { useToast } from '@/components/ui-kit';
import { useAuth } from '@/context/auth';
import { router, usePathname, useSegments } from 'expo-router';
import { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState, type ReactNode, type RefObject } from 'react';
import { Platform, type ScrollView, type View } from 'react-native';
import { tutorialById, TUTORIALS, type FybeContext, type Tutorial } from './content';
import { DEFAULT_PREFS, loadFybePrefs, saveFybePrefs, type FybePrefs } from './storage';

/** Telas autenticadas em que o Fybe aparece. */
export const FYBE_ROUTES = ['/', '/plan', '/messages', '/trends', '/profile', '/history', '/water', '/bmi'];

type Progress = { tutorialId: string; index: number };
/** `center`: elemento no meio da tela. `start`: elemento no topo (usado quando ele e o cartão não cabem juntos). */
export type ScrollOptions = { align?: 'center' | 'start'; topInset?: number };

type FybeState = {
  prefs: FybePrefs;
  ready: boolean;
  pathname: string;
  visible: boolean;
  panelOpen: boolean;
  introOpen: boolean;
  active: (Progress & { tutorial: Tutorial }) | null;
  paused: Progress | null;
  celebrate: string | null;
  floatingSuppressed: boolean;
  context: FybeContext;
  availableTutorials: Tutorial[];
  openPanel: () => void;
  closePanel: () => void;
  openIntro: () => void;
  answerIntro: (start: boolean) => void;
  startTutorial: (id: string, index?: number) => void;
  resume: () => void;
  next: () => void;
  back: () => void;
  skip: () => void;
  dismissCelebration: () => void;
  goTo: (href: string) => void;
  registerTarget: (id: string, ref: RefObject<View | null>) => () => void;
  getTarget: (id: string) => RefObject<View | null> | undefined;
  registerScroll: (pathname: string, ref: RefObject<ScrollView | null>) => () => void;
  scrollToTarget: (id: string, options?: ScrollOptions) => void;
  setFloatingSuppressed: (value: boolean) => void;
};

const FybeCtx = createContext<FybeState | null>(null);

export function useFybe() {
  const ctx = useContext(FybeCtx);
  if (!ctx) throw new Error('useFybe precisa estar dentro de <FybeProvider>');
  return ctx;
}

/** Versão tolerante: componentes como <FybeTarget> funcionam mesmo sem o provider (ex.: testes isolados). */
export const useFybeOptional = () => useContext(FybeCtx);

export function FybeProvider({ children }: { children: ReactNode }) {
  const { isAuthenticated, restoring } = useAuth();
  const { state: followUp } = useFollowUp();
  const toast = useToast();
  const pathname = usePathname();
  const segments = useSegments();
  const [prefs, setPrefs] = useState<FybePrefs>(DEFAULT_PREFS);
  const [ready, setReady] = useState(false);
  const [panelOpen, setPanelOpen] = useState(false);
  const [introOpen, setIntroOpen] = useState(false);
  const [progress, setProgress] = useState<Progress | null>(null);
  const [paused, setPaused] = useState<Progress | null>(null);
  const [celebrate, setCelebrate] = useState<string | null>(null);
  const [floatingSuppressed, setFloatingSuppressed] = useState(false);
  const targets = useRef(new Map<string, RefObject<View | null>>());
  const scrolls = useRef(new Map<string, RefObject<ScrollView | null>>());
  const expectedPath = useRef<string | null>(null);

  useEffect(() => { loadFybePrefs().then(value => { setPrefs(value); setReady(true); }); }, []);

  const updatePrefs = useCallback((change: (old: FybePrefs) => FybePrefs) => {
    setPrefs(old => { const next = change(old); void saveFybePrefs(next); return next; });
  }, []);

  const context: FybeContext = useMemo(() => ({ followUp }), [followUp]);
  const availableTutorials = useMemo(() => TUTORIALS.filter(t => !t.when || t.when(context)), [context]);
  // A tela de abertura (app/index) também tem o caminho "/": o Fybe só aparece dentro das abas.
  const visible = isAuthenticated && !restoring && segments[0] === '(tabs)' && FYBE_ROUTES.includes(pathname);
  const active = progress ? (() => { const tutorial = tutorialById(progress.tutorialId); return tutorial ? { ...progress, tutorial } : null; })() : null;

  // Apresentação inicial: uma única vez por aparelho, na tela Início, depois do login.
  useEffect(() => {
    if (!ready || prefs.introSeen || !visible || pathname !== '/' || progress || panelOpen) return;
    const timer = setTimeout(() => setIntroOpen(true), 900);
    return () => clearTimeout(timer);
  }, [ready, prefs.introSeen, visible, pathname, progress, panelOpen]);

  // Ao sair da conta, encerra qualquer tutorial e fecha os painéis.
  useEffect(() => {
    if (isAuthenticated) return;
    setProgress(null); setPaused(null); setPanelOpen(false); setIntroOpen(false);
  }, [isAuthenticated]);

  const navigateForStep = useCallback((tutorial: Tutorial, index: number) => {
    const step = tutorial.steps[index];
    if (step?.route && pathname !== step.route.pathname) {
      expectedPath.current = step.route.pathname;
      router.navigate(step.route.href as any);
    }
  }, [pathname]);

  const startTutorial = useCallback((id: string, index = 0) => {
    const tutorial = tutorialById(id);
    if (!tutorial) return;
    const safeIndex = Math.min(Math.max(index, 0), tutorial.steps.length - 1);
    setPanelOpen(false); setIntroOpen(false); setPaused(null); setCelebrate(null);
    setProgress({ tutorialId: id, index: safeIndex });
    navigateForStep(tutorial, safeIndex);
  }, [navigateForStep]);

  const finish = useCallback((tutorial: Tutorial, completed: boolean) => {
    setProgress(null);
    expectedPath.current = null;
    if (completed) {
      updatePrefs(old => ({ ...old, completed: { ...old.completed, [tutorial.id]: true } }));
      setCelebrate(tutorial.title);
    }
  }, [updatePrefs]);

  const next = useCallback(() => {
    if (!active) return;
    const { tutorial, index } = active;
    if (index >= tutorial.steps.length - 1) { finish(tutorial, true); return; }
    setProgress({ tutorialId: tutorial.id, index: index + 1 });
    navigateForStep(tutorial, index + 1);
  }, [active, finish, navigateForStep]);

  const back = useCallback(() => {
    if (!active || active.index === 0) return;
    setProgress({ tutorialId: active.tutorial.id, index: active.index - 1 });
    navigateForStep(active.tutorial, active.index - 1);
  }, [active, navigateForStep]);

  const skip = useCallback(() => { if (active) finish(active.tutorial, false); }, [active, finish]);

  // Se o usuário mudar de tela por conta própria, o tutorial é pausado (e pode ser retomado pelo Fybe).
  useEffect(() => {
    if (!active) return;
    const step = active.tutorial.steps[active.index];
    if (!step?.route) return;
    if (pathname === step.route.pathname) { expectedPath.current = null; return; }
    if (expectedPath.current && expectedPath.current !== pathname) return; // navegação do próprio tutorial em andamento
    if (expectedPath.current === null) {
      setPaused({ tutorialId: active.tutorial.id, index: active.index });
      setProgress(null);
      toast.show({ tone: 'info', title: 'Tutorial pausado', message: 'Você mudou de tela. Toque no Fybe para continuar de onde parou.' });
    }
  }, [pathname, active, toast]);

  const resume = useCallback(() => { if (paused) startTutorial(paused.tutorialId, paused.index); }, [paused, startTutorial]);

  const answerIntro = useCallback((start: boolean) => {
    setIntroOpen(false);
    updatePrefs(old => ({ ...old, introSeen: true }));
    if (start) startTutorial('apresentacao');
  }, [startTutorial, updatePrefs]);

  const registerTarget = useCallback((id: string, ref: RefObject<View | null>) => {
    targets.current.set(id, ref);
    return () => { if (targets.current.get(id) === ref) targets.current.delete(id); };
  }, []);
  const getTarget = useCallback((id: string) => targets.current.get(id), []);

  const registerScroll = useCallback((path: string, ref: RefObject<ScrollView | null>) => {
    scrolls.current.set(path, ref);
    return () => { if (scrolls.current.get(path) === ref) scrolls.current.delete(path); };
  }, []);

  // Traz o elemento destacado para a área visível. Na web usa scrollIntoView; no celular, mede a posição dentro do ScrollView da tela.
  const scrollToTarget = useCallback((id: string, options: ScrollOptions = {}) => {
    const node = targets.current.get(id)?.current as any;
    if (!node) return;
    const { align = 'center', topInset = 0 } = options;
    try {
      if (Platform.OS === 'web' && typeof node.scrollIntoView === 'function') {
        if (node.style) node.style.scrollMarginTop = `${topInset + 16}px`;
        node.scrollIntoView({ block: align, behavior: 'smooth' });
        return;
      }
      const scroll = scrolls.current.get(pathname)?.current as any;
      const inner = scroll?.getInnerViewRef?.() ?? scroll?.getInnerViewNode?.();
      if (scroll && inner && node.measureLayout) {
        const offset = align === 'start' ? topInset + 16 : 140;
        node.measureLayout(inner, (_x: number, y: number) => scroll.scrollTo({ y: Math.max(0, y - offset), animated: true }), () => {});
      }
    } catch {
      // Sem rolagem automática: a etapa mostra uma dica para rolar a tela.
    }
  }, [pathname]);

  const value: FybeState = {
    prefs, ready, pathname, visible, panelOpen, introOpen, active, paused, celebrate, floatingSuppressed, context, availableTutorials,
    openPanel: () => setPanelOpen(true),
    closePanel: () => setPanelOpen(false),
    openIntro: () => { setPanelOpen(false); setIntroOpen(true); },
    answerIntro, startTutorial, resume, next, back, skip,
    dismissCelebration: () => setCelebrate(null),
    goTo: (href: string) => { setPanelOpen(false); router.navigate(href as any); },
    registerTarget, getTarget, registerScroll, scrollToTarget, setFloatingSuppressed,
  };

  return <FybeCtx.Provider value={value}>{children}</FybeCtx.Provider>;
}
