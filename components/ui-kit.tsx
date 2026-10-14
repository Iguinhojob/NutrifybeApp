import { usePremiumTheme } from '@/context/theme';
import { Ionicons } from '@expo/vector-icons';
import { createContext, useCallback, useContext, useEffect, useRef, useState, type ComponentProps, type ReactNode } from 'react';
import { AccessibilityInfo, ActivityIndicator, Platform, Pressable, StyleSheet, Text, View, type StyleProp, type ViewStyle } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

/*
 * Componentes visuais compartilhados do app. Mantêm a identidade do Nutrifybe
 * (ciano no tema claro, roxo no escuro) com contraste adequado, áreas de toque
 * de pelo menos 44 pt e estados que não dependem apenas de cor (ícone + texto).
 */

export type IconName = ComponentProps<typeof Ionicons>['name'];
export type Tone = 'neutral' | 'primary' | 'success' | 'warning' | 'danger' | 'info';

export function useTone(tone: Tone) {
  const { colors: C } = usePremiumTheme();
  switch (tone) {
    case 'success': return { fg: C.success, bg: C.successSoft, border: C.success };
    case 'warning': return { fg: C.warning, bg: C.warningSoft, border: C.warning };
    case 'danger': return { fg: C.danger, bg: C.dangerSoft, border: C.danger };
    case 'primary':
    case 'info': return { fg: C.primaryText, bg: C.primarySoft, border: C.primaryText };
    default: return { fg: C.textMuted, bg: C.surface2, border: C.border };
  }
}

type ButtonVariant = 'primary' | 'secondary' | 'ghost' | 'danger' | 'dangerOutline';

export function AppButton({
  label, onPress, icon, variant = 'primary', busy = false, disabled = false, size = 'md', style, accessibilityHint, accessibilityLabel, full = false,
}: {
  label: string; onPress: () => void; icon?: IconName; variant?: ButtonVariant; busy?: boolean; disabled?: boolean;
  size?: 'sm' | 'md' | 'lg'; style?: StyleProp<ViewStyle>; accessibilityHint?: string; accessibilityLabel?: string; full?: boolean;
}) {
  const { colors: C } = usePremiumTheme();
  const palette = {
    primary: { bg: C.primary, fg: C.onPrimary, border: C.primary },
    secondary: { bg: C.surface, fg: C.text, border: C.border },
    ghost: { bg: 'transparent', fg: C.primaryText, border: 'transparent' },
    danger: { bg: C.danger, fg: '#FFFFFF', border: C.danger },
    dangerOutline: { bg: 'transparent', fg: C.danger, border: C.danger },
  }[variant];
  const height = size === 'sm' ? 44 : size === 'lg' ? 56 : 50;
  const inactive = disabled || busy;
  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={accessibilityLabel ?? label}
      accessibilityHint={accessibilityHint}
      accessibilityState={{ disabled: inactive, busy }}
      disabled={inactive}
      onPress={onPress}
      hitSlop={size === 'sm' ? 4 : 0}
      style={({ pressed }) => [
        styles.button,
        { minHeight: height, backgroundColor: palette.bg, borderColor: palette.border, opacity: inactive ? 0.55 : pressed ? 0.85 : 1, paddingHorizontal: size === 'sm' ? 14 : 18 },
        full && { alignSelf: 'stretch' },
        style,
      ]}
    >
      {busy ? <ActivityIndicator color={palette.fg} /> : icon ? <Ionicons name={icon} size={size === 'sm' ? 17 : 19} color={palette.fg} /> : null}
      <Text style={[styles.buttonText, { color: palette.fg, fontSize: size === 'sm' ? 14 : 15 }]} numberOfLines={2}>{label}</Text>
    </Pressable>
  );
}

export function Card({ children, style, padded = true }: { children: ReactNode; style?: StyleProp<ViewStyle>; padded?: boolean }) {
  const { colors: C } = usePremiumTheme();
  return <View style={[styles.card, { backgroundColor: C.surface, borderColor: C.border }, padded && { padding: 16 }, style]}>{children}</View>;
}

export function SectionTitle({ title, subtitle, action }: { title: string; subtitle?: string; action?: ReactNode }) {
  const { colors: C } = usePremiumTheme();
  return (
    <View style={styles.sectionTitle}>
      <View style={{ flex: 1, minWidth: 0 }}>
        <Text accessibilityRole="header" style={{ color: C.text, fontSize: 19, fontWeight: '900' }}>{title}</Text>
        {!!subtitle && <Text style={{ color: C.textMuted, fontSize: 13, marginTop: 3, lineHeight: 18 }}>{subtitle}</Text>}
      </View>
      {action}
    </View>
  );
}

export function StatusPill({ tone = 'neutral', icon, label }: { tone?: Tone; icon?: IconName; label: string }) {
  const t = useTone(tone);
  return (
    <View style={[styles.pill, { backgroundColor: t.bg }]}>
      {icon && <Ionicons name={icon} size={14} color={t.fg} />}
      <Text style={{ color: t.fg, fontSize: 12, fontWeight: '800' }}>{label}</Text>
    </View>
  );
}

const NOTICE_ICON: Record<Tone, IconName> = {
  neutral: 'information-circle-outline', primary: 'information-circle-outline', info: 'information-circle-outline',
  success: 'checkmark-circle-outline', warning: 'alert-circle-outline', danger: 'close-circle-outline',
};

export function InlineNotice({ tone = 'info', title, children, icon, live = false }: { tone?: Tone; title?: string; children?: ReactNode; icon?: IconName; live?: boolean }) {
  const { colors: C } = usePremiumTheme();
  const t = useTone(tone);
  return (
    <View
      accessibilityRole={tone === 'danger' && live ? 'alert' : undefined}
      accessibilityLiveRegion={live ? 'polite' : undefined}
      style={[styles.notice, { backgroundColor: t.bg }]}
    >
      <Ionicons name={icon ?? NOTICE_ICON[tone]} size={19} color={t.fg} style={{ marginTop: 1 }} />
      <View style={{ flex: 1, gap: 2 }}>
        {!!title && <Text style={{ color: C.text, fontWeight: '800', fontSize: 14 }}>{title}</Text>}
        {typeof children === 'string' ? <Text style={{ color: C.textMuted, fontSize: 13, lineHeight: 19 }}>{children}</Text> : children}
      </View>
    </View>
  );
}

export function EmptyState({ icon = 'leaf-outline', title, children, action }: { icon?: IconName; title: string; children?: ReactNode; action?: ReactNode }) {
  const { colors: C } = usePremiumTheme();
  return (
    <View style={styles.state}>
      <View style={[styles.stateIcon, { backgroundColor: C.primarySoft }]}><Ionicons name={icon} size={26} color={C.primaryText} /></View>
      <Text accessibilityRole="header" style={{ color: C.text, fontWeight: '900', fontSize: 16, textAlign: 'center' }}>{title}</Text>
      {typeof children === 'string' ? <Text style={{ color: C.textMuted, textAlign: 'center', fontSize: 13, lineHeight: 19 }}>{children}</Text> : children}
      {action}
    </View>
  );
}

export function LoadingState({ label = 'Carregando…' }: { label?: string }) {
  const { colors: C } = usePremiumTheme();
  return (
    <View style={styles.state} accessibilityLiveRegion="polite" accessible accessibilityLabel={label}>
      <ActivityIndicator color={C.primaryText} />
      <Text style={{ color: C.textMuted, fontSize: 13 }}>{label}</Text>
    </View>
  );
}

export function ErrorState({ title = 'Não foi possível carregar', message, onRetry }: { title?: string; message?: string; onRetry?: () => void }) {
  const { colors: C } = usePremiumTheme();
  return (
    <View style={styles.state} accessibilityRole="alert">
      <View style={[styles.stateIcon, { backgroundColor: C.dangerSoft }]}><Ionicons name="cloud-offline-outline" size={26} color={C.danger} /></View>
      <Text style={{ color: C.text, fontWeight: '900', fontSize: 16, textAlign: 'center' }}>{title}</Text>
      {!!message && <Text style={{ color: C.textMuted, textAlign: 'center', fontSize: 13, lineHeight: 19 }}>{message}</Text>}
      {onRetry && <AppButton label="Tentar novamente" icon="refresh" onPress={onRetry} size="sm" />}
    </View>
  );
}

export function BackLink({ label = 'Voltar', onPress }: { label?: string; onPress: () => void }) {
  const { colors: C } = usePremiumTheme();
  return (
    <Pressable accessibilityRole="button" accessibilityLabel={label} onPress={onPress} hitSlop={8} style={styles.back}>
      <Ionicons name="arrow-back" size={20} color={C.primaryText} />
      <Text style={{ color: C.primaryText, fontWeight: '800', fontSize: 15 }}>{label}</Text>
    </Pressable>
  );
}

/** Mensagens que traduzem falhas técnicas em orientação para o paciente. */
export function friendlyError(error: unknown, fallback: string) {
  const message = error instanceof Error ? error.message : '';
  if (!message) return fallback;
  if (/failed to fetch|network request failed|load failed|networkerror/i.test(message)) {
    return 'Sem conexão com o servidor. Confira sua internet e tente novamente.';
  }
  return message;
}

/* ============================== Avisos (toast) ============================== */

type Toast = { id: number; tone: 'success' | 'error' | 'info'; title: string; message?: string };
const ToastContext = createContext<{ show: (toast: Omit<Toast, 'id'>) => void }>({ show: () => {} });
export const useToast = () => useContext(ToastContext);

export function ToastProvider({ children }: { children: ReactNode }) {
  const [toast, setToast] = useState<Toast | null>(null);
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const insets = useSafeAreaInsets();
  const { colors: C } = usePremiumTheme();

  const show = useCallback((next: Omit<Toast, 'id'>) => {
    if (timer.current) clearTimeout(timer.current);
    setToast({ ...next, id: Date.now() });
    if (Platform.OS !== 'web') AccessibilityInfo.announceForAccessibility([next.title, next.message].filter(Boolean).join('. '));
    timer.current = setTimeout(() => setToast(null), next.tone === 'error' ? 7000 : 4000);
  }, []);
  useEffect(() => () => { if (timer.current) clearTimeout(timer.current); }, []);

  const tone = toast?.tone === 'error' ? { fg: C.danger, icon: 'alert-circle' as const } : toast?.tone === 'info' ? { fg: C.primaryText, icon: 'information-circle' as const } : { fg: C.success, icon: 'checkmark-circle' as const };

  return (
    <ToastContext.Provider value={{ show }}>
      {children}
      {toast && (
        <View pointerEvents="box-none" style={[styles.toastWrap, { bottom: insets.bottom + 82 }]}>
          <View
            accessibilityLiveRegion="polite"
            accessibilityRole={toast.tone === 'error' ? 'alert' : 'text'}
            style={[styles.toast, { backgroundColor: C.surface, borderColor: C.border, borderLeftColor: tone.fg }]}
          >
            <Ionicons name={tone.icon} size={22} color={tone.fg} />
            <View style={{ flex: 1 }}>
              <Text style={{ color: C.text, fontWeight: '900', fontSize: 14 }}>{toast.title}</Text>
              {!!toast.message && <Text style={{ color: C.textMuted, fontSize: 13, lineHeight: 18, marginTop: 2 }}>{toast.message}</Text>}
            </View>
            <Pressable accessibilityRole="button" accessibilityLabel="Fechar aviso" onPress={() => setToast(null)} hitSlop={10} style={{ padding: 4 }}>
              <Ionicons name="close" size={18} color={C.textMuted} />
            </Pressable>
          </View>
        </View>
      )}
    </ToastContext.Provider>
  );
}

const styles = StyleSheet.create({
  button: { borderRadius: 14, borderWidth: 1, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8, paddingVertical: 10 },
  buttonText: { fontWeight: '800', textAlign: 'center', flexShrink: 1 },
  card: { borderRadius: 20, borderWidth: 1 },
  sectionTitle: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  pill: { flexDirection: 'row', alignItems: 'center', gap: 5, borderRadius: 999, paddingHorizontal: 10, paddingVertical: 5, alignSelf: 'flex-start' },
  notice: { flexDirection: 'row', gap: 10, borderRadius: 14, padding: 13, alignItems: 'flex-start' },
  state: { alignItems: 'center', justifyContent: 'center', gap: 10, paddingVertical: 28, paddingHorizontal: 16 },
  stateIcon: { width: 56, height: 56, borderRadius: 18, alignItems: 'center', justifyContent: 'center' },
  back: { flexDirection: 'row', alignItems: 'center', gap: 6, alignSelf: 'flex-start', minHeight: 44, paddingRight: 14 },
  toastWrap: { position: 'absolute', left: 16, right: 16, alignItems: 'center' },
  toast: { width: '100%', maxWidth: 480, flexDirection: 'row', alignItems: 'flex-start', gap: 10, borderWidth: 1, borderLeftWidth: 4, borderRadius: 16, padding: 14, shadowColor: '#000', shadowOpacity: 0.15, shadowRadius: 14, shadowOffset: { width: 0, height: 6 }, elevation: 6 },
});
