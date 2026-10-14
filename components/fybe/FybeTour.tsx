import { usePremiumTheme } from '@/context/theme';
import { AppButton } from '@/components/ui-kit';
import { Ionicons } from '@expo/vector-icons';
import { useEffect, useRef, useState } from 'react';
import { AccessibilityInfo, Image, Platform, Pressable, StyleSheet, Text, useWindowDimensions, View } from 'react-native';
import Animated, { FadeIn, useReducedMotion } from 'react-native-reanimated';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { FYBE_AVATAR } from './assets';
import { useFybe } from './FybeProvider';

type Rect = { x: number; y: number; width: number; height: number };

const POLL_MS = 150;
/** Tempo máximo esperando o elemento aparecer antes de mostrar a mensagem alternativa. */
const MISSING_AFTER_MS = 1200;
const TAB_BAR_HEIGHT = 68;
const RING_PAD = 6;
const DIM = 'rgba(0,0,0,0.55)';
export const DEFAULT_FALLBACK = 'Não encontrei esse item na tela agora. Pode ser que ele apareça mais abaixo ou em outra situação. Você pode seguir para a próxima etapa.';

/**
 * Camada do tutorial: escurece a tela, contorna o elemento real e mostra o cartão da etapa.
 * A posição do elemento é medida continuamente, então o destaque acompanha rolagem e mudanças de layout.
 * A camada não bloqueia toques: o usuário pode continuar usando o app (ao trocar de tela, o tutorial é pausado).
 */
export function FybeTour() {
  const fybe = useFybe();
  const { colors: C } = usePremiumTheme();
  const insets = useSafeAreaInsets();
  const { width, height } = useWindowDimensions();
  const reduceMotion = useReducedMotion();
  const [rect, setRect] = useState<Rect | null>(null);
  const [missing, setMissing] = useState(false);
  const [cardHeight, setCardHeight] = useState(230);
  const textRef = useRef<View>(null);
  const focusedTutorial = useRef<string | null>(null);
  const latest = useRef(fybe);
  latest.current = fybe;
  const geometry = useRef({ top: 0, viewportBottom: 0, cardHeight: 230 });

  const active = fybe.active;
  const step = active ? active.tutorial.steps[active.index] : undefined;
  const stepKey = active ? `${active.tutorial.id}:${active.index}` : '';

  // Procura e mede o elemento da etapa atual.
  useEffect(() => {
    setRect(null);
    setMissing(false);
    if (!step) { focusedTutorial.current = null; return; }
    if (Platform.OS !== 'web') AccessibilityInfo.announceForAccessibility(`${step.title}. ${step.message}`);
    // No navegador, ao abrir um tutorial o foco do teclado vai para o texto da etapa (sem rolar a página).
    // Nas etapas seguintes o foco fica no botão usado e o texto novo é anunciado pela região "aria-live".
    // A espera deixa o painel terminar de fechar, já que ele devolve o foco ao botão que o abriu.
    const firstStep = focusedTutorial.current !== active!.tutorial.id;
    focusedTutorial.current = active!.tutorial.id;
    const focusTimer = Platform.OS === 'web' && firstStep ? setTimeout(() => (textRef.current as any)?.focus?.({ preventScroll: true }), 350) : undefined;
    if (!step.target) return () => clearTimeout(focusTimer);
    const targetId = step.target;
    const startedAt = Date.now();
    let scrolled = false;
    let alive = true;

    const tick = () => {
      const elapsed = Date.now() - startedAt;
      const f = latest.current;
      const onRoute = !step.route || f.pathname === step.route.pathname;
      const node = onRoute ? (f.getTarget(targetId)?.current as any) : null;
      if (!node?.measureInWindow) {
        if (elapsed >= MISSING_AFTER_MS) { setMissing(true); setRect(null); }
        return;
      }
      node.measureInWindow((x: number, y: number, w: number, h: number) => {
        if (!alive) return;
        if (!w || !h) {
          if (elapsed >= MISSING_AFTER_MS) { setMissing(true); setRect(null); }
          return;
        }
        if (!scrolled) {
          // Se o elemento centralizado não deixar espaço para o cartão, ele vai para o topo da tela.
          scrolled = true;
          const g = geometry.current;
          const available = g.viewportBottom - g.top;
          const align = h / 2 + 24 + g.cardHeight > available / 2 ? 'start' : 'center';
          f.scrollToTarget(targetId, { align, topInset: g.top });
        }
        setMissing(false);
        setRect(prev => (prev && prev.x === x && prev.y === y && prev.width === w && prev.height === h ? prev : { x, y, width: w, height: h }));
      });
    };
    const first = setTimeout(tick, 150);
    const timer = setInterval(tick, POLL_MS);
    // No navegador, também remede a cada rolagem para o destaque não ficar para trás.
    const web = Platform.OS === 'web' && typeof document !== 'undefined';
    const onScroll = () => tick();
    if (web) document.addEventListener('scroll', onScroll, true);
    return () => {
      alive = false; clearTimeout(focusTimer); clearTimeout(first); clearInterval(timer);
      if (web) document.removeEventListener('scroll', onScroll, true);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [stepKey]);

  if (!active || !step || !fybe.visible) return null;

  const total = active.tutorial.steps.length;
  const isLast = active.index === total - 1;
  const bottomReserve = TAB_BAR_HEIGHT + insets.bottom;
  const viewportBottom = height - bottomReserve;
  geometry.current = { top: insets.top, viewportBottom, cardHeight };

  // Recorta o destaque à parte visível da tela.
  let hole: Rect | null = null;
  if (rect) {
    const top = Math.max(rect.y - RING_PAD, insets.top);
    const bottom = Math.min(rect.y + rect.height + RING_PAD, viewportBottom);
    const left = Math.max(rect.x - RING_PAD, 4);
    const right = Math.min(rect.x + rect.width + RING_PAD, width - 4);
    if (bottom - top > 12 && right - left > 12) hole = { x: left, y: top, width: right - left, height: bottom - top };
  }
  const offscreen = !!rect && !hole;

  // Cartão abaixo do elemento quando couber; senão acima; senão fixo acima da barra de abas.
  const cardWidth = Math.min(width - 32, 400);
  const cardLeft = (width - cardWidth) / 2;
  let cardTop: number;
  if (hole && viewportBottom - (hole.y + hole.height) >= cardHeight + 16) cardTop = hole.y + hole.height + 12;
  else if (hole && hole.y - insets.top >= cardHeight + 16) cardTop = hole.y - 12 - cardHeight;
  else cardTop = viewportBottom - 12 - cardHeight;
  cardTop = Math.max(insets.top + 8, cardTop);

  const showFallback = !!step.target && (missing || offscreen);
  const fallbackText = step.fallback ?? DEFAULT_FALLBACK;

  return (
    <View pointerEvents="box-none" style={[StyleSheet.absoluteFill, { zIndex: 50 }]} testID="fybe-tour">
      {/* Fundo escurecido: quatro faixas em volta do destaque (não capturam toques). */}
      {hole ? (
        <>
          <View pointerEvents="none" style={[styles.dim, { top: 0, left: 0, right: 0, height: hole.y }]} />
          <View pointerEvents="none" style={[styles.dim, { top: hole.y + hole.height, left: 0, right: 0, bottom: 0 }]} />
          <View pointerEvents="none" style={[styles.dim, { top: hole.y, left: 0, width: hole.x, height: hole.height }]} />
          <View pointerEvents="none" style={[styles.dim, { top: hole.y, left: hole.x + hole.width, right: 0, height: hole.height }]} />
          <View
            pointerEvents="none"
            testID="fybe-highlight"
            style={[styles.ring, { top: hole.y, left: hole.x, width: hole.width, height: hole.height, borderColor: C.brand ?? C.primary }]}
          />
        </>
      ) : (
        <View pointerEvents="none" style={[StyleSheet.absoluteFill, styles.dim]} />
      )}

      <Animated.View
        key={stepKey}
        entering={reduceMotion ? undefined : FadeIn.duration(180)}
        onLayout={e => setCardHeight(e.nativeEvent.layout.height)}
        testID="fybe-tour-card"
        role="dialog"
        aria-label={`Tutorial ${active.tutorial.title}`}
        style={[styles.card, { left: cardLeft, width: cardWidth, backgroundColor: C.surface, borderColor: C.border }, { top: cardTop }]}
      >
        <View style={styles.cardHead}>
          <Image source={FYBE_AVATAR} style={styles.avatar} accessible={false} />
          <View style={{ flex: 1 }}>
            <Text style={[styles.tutorialName, { color: C.textMuted }]} numberOfLines={1}>{active.tutorial.title}</Text>
            <Text style={[styles.counter, { color: C.primaryText }]} testID="fybe-step-counter">Etapa {active.index + 1} de {total}</Text>
          </View>
          <Pressable onPress={fybe.skip} accessibilityRole="button" accessibilityLabel="Fechar tutorial" hitSlop={8} style={styles.close} testID="fybe-tour-close">
            <Ionicons name="close" size={22} color={C.textMuted} />
          </Pressable>
        </View>
        <View
          style={[styles.progressTrack, { backgroundColor: C.surface2 }]}
          accessibilityRole="progressbar"
          accessibilityValue={{ min: 0, max: total, now: active.index + 1 }}
        >
          <View style={[styles.progressFill, { width: `${((active.index + 1) / total) * 100}%`, backgroundColor: C.primary }]} />
        </View>

        <View ref={textRef} tabIndex={-1} accessibilityLiveRegion="polite" style={styles.text} testID="fybe-step-text">
          <Text style={[styles.title, { color: C.text }]} accessibilityRole="header">{step.title}</Text>
          <Text style={[styles.message, { color: C.textMuted }]}>{step.message}</Text>
        </View>

        {showFallback && (
          <View style={[styles.fallback, { backgroundColor: C.warningSoft }]} testID="fybe-fallback">
            <Ionicons name="search-outline" size={18} color={C.text} />
            <Text style={[styles.fallbackText, { color: C.text }]}>{fallbackText}</Text>
          </View>
        )}

        <View style={styles.actions}>
          <Pressable onPress={fybe.skip} accessibilityRole="button" accessibilityLabel="Pular tutorial" style={styles.skip} testID="fybe-skip">
            <Text style={[styles.skipText, { color: C.textMuted }]}>Pular</Text>
          </Pressable>
          <View style={{ flex: 1 }} />
          {active.index > 0 && <AppButton label="Voltar" variant="secondary" size="sm" onPress={fybe.back} accessibilityLabel="Etapa anterior" />}
          <AppButton label={isLast ? 'Concluir' : 'Próximo'} icon={isLast ? 'checkmark' : 'arrow-forward'} size="sm" onPress={fybe.next} accessibilityLabel={isLast ? 'Concluir tutorial' : 'Próxima etapa'} />
        </View>
      </Animated.View>
    </View>
  );
}

/** Mensagem curta ao concluir um tutorial. */
export function FybeCelebration() {
  const fybe = useFybe();
  const { colors: C } = usePremiumTheme();
  const insets = useSafeAreaInsets();
  const reduceMotion = useReducedMotion();
  const { celebrate, dismissCelebration } = fybe;

  useEffect(() => {
    if (!celebrate) return;
    if (Platform.OS !== 'web') AccessibilityInfo.announceForAccessibility(`Tutorial concluído: ${celebrate}`);
    const timer = setTimeout(dismissCelebration, 6000);
    return () => clearTimeout(timer);
  }, [celebrate, dismissCelebration]);

  if (!celebrate || !fybe.visible) return null;
  return (
    <View pointerEvents="box-none" style={[StyleSheet.absoluteFill, { zIndex: 45 }]}>
      <Animated.View
        entering={reduceMotion ? undefined : FadeIn.duration(200)}
        accessibilityLiveRegion="polite"
        testID="fybe-celebration"
        style={[styles.celebrate, { bottom: TAB_BAR_HEIGHT + insets.bottom + 12, backgroundColor: C.surface, borderColor: C.border }]}
      >
        <Image source={FYBE_AVATAR} style={styles.avatar} accessible={false} />
        <View style={{ flex: 1 }}>
          <Text style={[styles.title, { color: C.text, fontSize: 16 }]}>Tutorial concluído! 🎉</Text>
          <Text style={[styles.message, { color: C.textMuted }]}>{celebrate}. Quando quiser rever, é só tocar no Fybe.</Text>
        </View>
        <Pressable onPress={dismissCelebration} accessibilityRole="button" accessibilityLabel="Fechar mensagem" hitSlop={8} style={styles.close}>
          <Ionicons name="close" size={20} color={C.textMuted} />
        </Pressable>
      </Animated.View>
    </View>
  );
}

const styles = StyleSheet.create({
  dim: { position: 'absolute', backgroundColor: DIM },
  ring: { position: 'absolute', borderWidth: 3, borderRadius: 18 },
  card: {
    position: 'absolute', borderRadius: 22, borderWidth: 1, padding: 16, gap: 10,
    shadowColor: '#000', shadowOpacity: 0.25, shadowRadius: 18, shadowOffset: { width: 0, height: 6 }, elevation: 12,
  },
  cardHead: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  avatar: { width: 40, height: 40 },
  tutorialName: { fontSize: 12, fontWeight: '700' },
  counter: { fontSize: 13, fontWeight: '900' },
  close: { width: 44, height: 44, alignItems: 'center', justifyContent: 'center', marginRight: -8 },
  progressTrack: { height: 6, borderRadius: 3, overflow: 'hidden' },
  progressFill: { height: '100%', borderRadius: 3 },
  text: { gap: 4, borderRadius: 8, outlineStyle: 'none' } as any,
  title: { fontSize: 18, fontWeight: '900' },
  message: { fontSize: 15, lineHeight: 21 },
  fallback: { flexDirection: 'row', gap: 8, borderRadius: 12, padding: 10, alignItems: 'flex-start' },
  fallbackText: { flex: 1, fontSize: 13, lineHeight: 18, fontWeight: '600' },
  actions: { flexDirection: 'row', alignItems: 'center', gap: 8, flexWrap: 'wrap', marginTop: 2 },
  skip: { minHeight: 44, justifyContent: 'center', paddingHorizontal: 6 },
  skipText: { fontSize: 14, fontWeight: '700', textDecorationLine: 'underline' },
  celebrate: {
    position: 'absolute', left: 16, right: 16, alignSelf: 'center', maxWidth: 440, marginHorizontal: 'auto',
    flexDirection: 'row', alignItems: 'center', gap: 12, borderRadius: 18, borderWidth: 1, padding: 14,
    shadowColor: '#000', shadowOpacity: 0.18, shadowRadius: 14, shadowOffset: { width: 0, height: 4 }, elevation: 8,
  },
});
