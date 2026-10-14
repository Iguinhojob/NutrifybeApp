import { usePremiumTheme } from '@/context/theme';
import { AppButton } from '@/components/ui-kit';
import { Ionicons } from '@expo/vector-icons';
import { useEffect, useState } from 'react';
import { Image, Modal, Pressable, ScrollView, StyleSheet, Text, useWindowDimensions, View } from 'react-native';
import { useReducedMotion } from 'react-native-reanimated';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { FYBE_AVATAR } from './assets';
import { HONESTY_NOTE, NO_SCREEN_HELP, PANEL_GREETING, screenForPath, tutorialById, type FaqItem } from './content';
import { useFybe } from './FybeProvider';

const DESKTOP_BREAKPOINT = 768;

/** Painel de ajuda: folha inferior no celular e janela flutuante (popover) em telas largas. */
export function FybePanel() {
  const fybe = useFybe();
  const { colors: C } = usePremiumTheme();
  const insets = useSafeAreaInsets();
  const { width, height } = useWindowDimensions();
  const reduceMotion = useReducedMotion();
  const desktop = width >= DESKTOP_BREAKPOINT;
  const screen = screenForPath(fybe.pathname);
  const pausedTutorial = fybe.paused ? tutorialById(fybe.paused.tutorialId) : undefined;
  const screenTutorial = screen?.tutorialId ? tutorialById(screen.tutorialId) : undefined;
  const [openFaq, setOpenFaq] = useState<number | null>(null);

  useEffect(() => { if (!fybe.panelOpen) setOpenFaq(null); }, [fybe.panelOpen]);

  const containerStyle = desktop
    ? [styles.popover, { right: 24 + insets.right, bottom: 68 + insets.bottom + 84, maxHeight: Math.min(640, height - 160) }]
    : [styles.sheet, { maxHeight: height * 0.86, paddingBottom: insets.bottom + 12 }];

  return (
    <Modal
      visible={fybe.visible && fybe.panelOpen}
      transparent
      animationType={reduceMotion ? 'none' : 'fade'}
      onRequestClose={fybe.closePanel}
      statusBarTranslucent
    >
      <View style={styles.root}>
        <Pressable style={[StyleSheet.absoluteFill, { backgroundColor: desktop ? 'rgba(0,0,0,0.18)' : 'rgba(0,0,0,0.45)' }]} onPress={fybe.closePanel} accessibilityRole="button" accessibilityLabel="Fechar ajuda do Fybe" />
        <View
          testID="fybe-panel"
          accessibilityViewIsModal
          aria-modal
          role="dialog"
          aria-label="Ajuda do Fybe"
          style={[containerStyle, { backgroundColor: C.surface, borderColor: C.border }]}
        >
          {!desktop && <View style={[styles.grabber, { backgroundColor: C.border }]} />}
          <View style={styles.header}>
            <Image source={FYBE_AVATAR} style={styles.avatar} accessibilityIgnoresInvertColors accessible={false} />
            <View style={{ flex: 1 }}>
              <Text style={[styles.name, { color: C.text }]} accessibilityRole="header">Fybe</Text>
              <Text style={[styles.greeting, { color: C.textMuted }]}>{PANEL_GREETING}</Text>
            </View>
            <Pressable onPress={fybe.closePanel} accessibilityRole="button" accessibilityLabel="Fechar ajuda" hitSlop={8} style={styles.close} testID="fybe-panel-close">
              <Ionicons name="close" size={22} color={C.textMuted} />
            </Pressable>
          </View>

          <ScrollView contentContainerStyle={styles.body} showsVerticalScrollIndicator={false}>
            {pausedTutorial && fybe.paused && (
              <View style={[styles.block, { backgroundColor: C.warningSoft, borderColor: C.border }]}>
                <Text style={[styles.blockTitle, { color: C.text }]}>Tutorial pausado</Text>
                <Text style={[styles.text, { color: C.textMuted }]}>
                  {pausedTutorial.title}: etapa {fybe.paused.index + 1} de {pausedTutorial.steps.length}.
                </Text>
                <View style={styles.row}>
                  <AppButton label="Continuar" icon="play" size="sm" onPress={fybe.resume} />
                  <AppButton label="Recomeçar" variant="secondary" size="sm" onPress={() => fybe.startTutorial(pausedTutorial.id)} />
                </View>
              </View>
            )}

            <Section title="Nesta tela" color={C.textMuted}>
              {screen ? (
                <View style={[styles.block, { backgroundColor: C.surface2, borderColor: C.border }]}>
                  <Text style={[styles.blockTitle, { color: C.text }]}>{screen.title}</Text>
                  <Text style={[styles.text, { color: C.textMuted }]}>{screen.intro}</Text>
                  {screenTutorial && (
                    <AppButton
                      label={fybe.prefs.completed[screenTutorial.id] ? 'Rever o tour desta tela' : 'Fazer o tour desta tela'}
                      icon="navigate"
                      size="sm"
                      onPress={() => fybe.startTutorial(screenTutorial.id)}
                      style={{ alignSelf: 'flex-start', marginTop: 4 }}
                    />
                  )}
                </View>
              ) : (
                <View style={[styles.block, { backgroundColor: C.surface2, borderColor: C.border }]}>
                  <Text style={[styles.text, { color: C.textMuted }]}>{NO_SCREEN_HELP}</Text>
                </View>
              )}
            </Section>

            {!!screen?.faq.length && (
              <Section title="Perguntas frequentes" color={C.textMuted}>
                {screen.faq.map((item, i) => (
                  <Faq key={item.q} item={item} open={openFaq === i} onToggle={() => setOpenFaq(openFaq === i ? null : i)} onAction={fybe.goTo} />
                ))}
              </Section>
            )}

            <Section title="Tutoriais" color={C.textMuted}>
              {fybe.availableTutorials.map(t => {
                const done = !!fybe.prefs.completed[t.id];
                return (
                  <Pressable
                    key={t.id}
                    testID={`fybe-tutorial-${t.id}`}
                    accessibilityRole="button"
                    accessibilityLabel={`${t.title}. ${t.description}. ${t.steps.length} etapas${done ? '. Concluído' : ''}`}
                    onPress={() => fybe.startTutorial(t.id)}
                    style={({ pressed }) => [styles.item, { borderColor: C.border, backgroundColor: pressed ? C.surface2 : C.surface }]}
                  >
                    <Ionicons name={done ? 'checkmark-circle' : 'play-circle-outline'} size={24} color={done ? C.success : C.primaryText} />
                    <View style={{ flex: 1 }}>
                      <Text style={[styles.itemTitle, { color: C.text }]}>{t.title}</Text>
                      <Text style={[styles.small, { color: C.textMuted }]}>{t.description} · {t.steps.length} etapas{done ? ' · concluído' : ''}</Text>
                    </View>
                    <Ionicons name="chevron-forward" size={18} color={C.textDim} />
                  </Pressable>
                );
              })}
              <Pressable
                accessibilityRole="button"
                onPress={fybe.openIntro}
                style={({ pressed }) => [styles.item, { borderColor: C.border, backgroundColor: pressed ? C.surface2 : C.surface }]}
              >
                <Ionicons name="sparkles-outline" size={22} color={C.primaryText} />
                <Text style={[styles.itemTitle, { color: C.text, flex: 1 }]}>Ver a apresentação do Fybe</Text>
                <Ionicons name="chevron-forward" size={18} color={C.textDim} />
              </Pressable>
            </Section>

            <Text style={[styles.note, { color: C.textMuted }]}>{HONESTY_NOTE}</Text>
          </ScrollView>
        </View>
      </View>
    </Modal>
  );
}

function Section({ title, color, children }: { title: string; color: string; children: React.ReactNode }) {
  return (
    <View style={{ gap: 8 }}>
      <Text style={[styles.section, { color }]} accessibilityRole="header">{title.toUpperCase()}</Text>
      {children}
    </View>
  );
}

function Faq({ item, open, onToggle, onAction }: { item: FaqItem; open: boolean; onToggle: () => void; onAction: (href: string) => void }) {
  const { colors: C } = usePremiumTheme();
  return (
    <View style={[styles.faq, { borderColor: C.border }]}>
      <Pressable accessibilityRole="button" accessibilityState={{ expanded: open }} onPress={onToggle} style={styles.faqHead}>
        <Text style={[styles.itemTitle, { color: C.text, flex: 1 }]}>{item.q}</Text>
        <Ionicons name={open ? 'chevron-up' : 'chevron-down'} size={18} color={C.textMuted} />
      </Pressable>
      {open && (
        <View style={{ paddingHorizontal: 14, paddingBottom: 12, gap: 8 }}>
          <Text style={[styles.text, { color: C.textMuted }]}>{item.a}</Text>
          {item.action && (
            <AppButton label={item.action.label} variant="secondary" size="sm" icon="arrow-forward" onPress={() => onAction(item.action!.href)} style={{ alignSelf: 'flex-start' }} />
          )}
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, justifyContent: 'flex-end' },
  sheet: { width: '100%', borderTopLeftRadius: 24, borderTopRightRadius: 24, borderWidth: 1, borderBottomWidth: 0, paddingTop: 8 },
  popover: {
    position: 'absolute', width: 400, borderRadius: 22, borderWidth: 1, paddingTop: 8,
    shadowColor: '#000', shadowOpacity: 0.2, shadowRadius: 24, shadowOffset: { width: 0, height: 8 }, elevation: 10,
  },
  grabber: { alignSelf: 'center', width: 44, height: 5, borderRadius: 3, marginBottom: 6 },
  header: { flexDirection: 'row', alignItems: 'center', gap: 12, paddingHorizontal: 18, paddingVertical: 8 },
  avatar: { width: 52, height: 52 },
  name: { fontSize: 18, fontWeight: '900' },
  greeting: { fontSize: 14, lineHeight: 19, marginTop: 2 },
  close: { width: 44, height: 44, alignItems: 'center', justifyContent: 'center' },
  body: { paddingHorizontal: 18, paddingBottom: 12, paddingTop: 6, gap: 18 },
  section: { fontSize: 12, fontWeight: '800', letterSpacing: 0.6 },
  block: { borderRadius: 16, borderWidth: 1, padding: 14, gap: 6 },
  blockTitle: { fontSize: 16, fontWeight: '800' },
  text: { fontSize: 14, lineHeight: 20 },
  small: { fontSize: 13, lineHeight: 18, marginTop: 2 },
  row: { flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginTop: 4 },
  item: { flexDirection: 'row', alignItems: 'center', gap: 12, borderRadius: 14, borderWidth: 1, paddingHorizontal: 14, paddingVertical: 12, minHeight: 56 },
  itemTitle: { fontSize: 15, fontWeight: '700' },
  faq: { borderRadius: 14, borderWidth: 1 },
  faqHead: { flexDirection: 'row', alignItems: 'center', gap: 10, paddingHorizontal: 14, paddingVertical: 12, minHeight: 48 },
  note: { fontSize: 12, lineHeight: 17, textAlign: 'center', paddingHorizontal: 8 },
});
