import { BrandLogo } from '@/components/brand-logo';
import { usePremiumTheme } from '@/context/theme';
import { useBrandFonts } from '@/hooks/use-brand-fonts';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { type ComponentProps, type ReactNode, useEffect, useRef, useState } from 'react';
import { ActivityIndicator, KeyboardAvoidingView, Platform, Pressable, ScrollView, StyleSheet, Text, TextInput, type TextInputProps, View } from 'react-native';
import Animated, { FadeInDown, useReducedMotion } from 'react-native-reanimated';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

type IconName = ComponentProps<typeof Ionicons>['name'];

export function OnboardingShell({ title, subtitle, children, onBack, step, total, action, onAction, disabled, busy, error, footer, eyebrow = 'SEU NOVO COMEÇO' }: {
  title: string; subtitle: string; children: ReactNode; onBack: () => void; step?: number; total?: number;
  action?: string; onAction?: () => void; disabled?: boolean; busy?: boolean; error?: string; footer?: ReactNode; eyebrow?: string;
}) {
  const { colors: C, isDark } = usePremiumTheme();
  const fonts = useBrandFonts();
  const insets = useSafeAreaInsets();
  const reduce = useReducedMotion();
  const scroll = useRef<ScrollView>(null);
  useEffect(() => { scroll.current?.scrollTo({ y: 0, animated: false }); }, [step]);
  const accent = isDark ? C.primaryLight : C.primaryDark;
  return <KeyboardAvoidingView style={[styles.screen, { backgroundColor: C.bg }]} behavior={Platform.OS === 'ios' ? 'padding' : 'height'}>
    <LinearGradient colors={isDark ? ['#251D3B', C.bg] : ['#F4FEFF', '#FFFFFF']} style={StyleSheet.absoluteFill} />
    <ScrollView ref={scroll} keyboardShouldPersistTaps="handled" contentContainerStyle={[styles.scroll, { paddingTop: insets.top + 14, paddingBottom: insets.bottom + 24 }]} showsVerticalScrollIndicator={false}>
      <View style={styles.column}>
        <View style={styles.header}>
          <Pressable accessibilityRole="button" accessibilityLabel="Voltar" onPress={onBack} disabled={busy} style={[styles.back, { backgroundColor: C.primarySoft }]}><Ionicons name="arrow-back" size={20} color={accent} /></Pressable>
          <BrandLogo width={125} />
          <Text style={{ color: C.textMuted, fontSize: 12, fontFamily: fonts.medium }}>{step !== undefined && total ? `${step + 1}/${total}` : ''}</Text>
        </View>
        {step !== undefined && total && <View accessibilityRole="progressbar" accessibilityValue={{ min: 0, max: total, now: step + 1 }} style={[styles.track, { backgroundColor: C.border }]}><View style={{ width: `${((step + 1) / total) * 100}%`, height: 4, borderRadius: 2, backgroundColor: C.primary }} /></View>}
        <Animated.View key={step ?? title} entering={reduce ? undefined : FadeInDown.duration(240)} style={styles.body}>
          <Text style={[styles.eyebrow, { color: accent, fontFamily: fonts.semibold }]}>{eyebrow}</Text>
          <Text accessibilityRole="header" style={[styles.title, { color: C.text, fontFamily: fonts.bold }]}>{title}</Text>
          <Text style={[styles.subtitle, { color: C.textMuted, fontFamily: fonts.regular }]}>{subtitle}</Text>
          <View style={styles.fields}>{children}</View>
        </Animated.View>
        <View style={styles.actions}>
          {!!error && <Text accessibilityRole="alert" accessibilityLiveRegion="polite" style={[styles.error, { color: C.danger, backgroundColor: C.dangerSoft }]}>{error}</Text>}
          {action && <PrimaryButton label={action} onPress={onAction!} disabled={disabled} busy={busy} />}
          {footer}
        </View>
      </View>
    </ScrollView>
  </KeyboardAvoidingView>;
}

export function PrimaryButton({ label, onPress, disabled, busy }: { label: string; onPress: () => void; disabled?: boolean; busy?: boolean }) {
  const { isDark } = usePremiumTheme();
  const fonts = useBrandFonts();
  return <Pressable accessibilityRole="button" accessibilityLabel={label} accessibilityState={{ disabled: !!disabled || !!busy, busy: !!busy }} disabled={disabled || busy} onPress={onPress} style={({ pressed }) => ({ opacity: disabled || busy ? 0.5 : pressed ? 0.8 : 1 })}>
    <LinearGradient colors={isDark ? ['#7C3AED', '#4D1E97'] : ['#0094AC', '#007F95']} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }} style={styles.button}>
      <Text style={[styles.buttonText, { fontFamily: fonts.semibold }]}>{label}</Text>
      {busy && <ActivityIndicator color="#fff" />}
    </LinearGradient>
  </Pressable>;
}

export function Choice({ label, description, icon = 'ellipse-outline', selected, onPress, multiple = false }: { label: string; description?: string; icon?: IconName; selected: boolean; onPress: () => void; multiple?: boolean }) {
  const { colors: C, isDark } = usePremiumTheme();
  const fonts = useBrandFonts();
  const accent = isDark ? C.primaryLight : C.primaryDark;
  return <Pressable accessibilityRole={multiple ? 'checkbox' : 'radio'} accessibilityLabel={label} accessibilityState={{ checked: selected }} onPress={onPress} style={({ pressed }) => [styles.choice, { backgroundColor: selected ? C.primarySoft : C.surface, borderColor: selected ? accent : C.border, opacity: pressed ? 0.7 : 1 }]}>
    <View style={[styles.choiceIcon, { backgroundColor: C.primarySoft }]}><Ionicons name={icon} size={21} color={accent} /></View>
    <View style={{ flex: 1, gap: 4 }}><Text style={{ fontSize: 15, color: C.text, fontFamily: fonts.semibold, fontWeight: '600' }}>{label}</Text>{description && <Text style={{ fontSize: 12, lineHeight: 18, color: C.textMuted, fontFamily: fonts.regular }}>{description}</Text>}</View>
    <Ionicons name={selected ? 'checkmark-circle' : 'ellipse-outline'} size={22} color={selected ? accent : C.border} />
  </Pressable>;
}

export function Field({ label, secret, ...props }: TextInputProps & { label: string; secret?: boolean }) {
  const { colors: C } = usePremiumTheme();
  const fonts = useBrandFonts();
  const [visible, setVisible] = useState(false);
  const [focused, setFocused] = useState(false);
  return <View style={{ gap: 8 }}>
    <Text style={{ fontSize: 13, color: C.text, fontFamily: fonts.semibold }}>{label}</Text>
    <View style={[styles.field, { borderColor: focused ? C.primary : C.border, backgroundColor: C.surface }]}>
      <TextInput {...props} accessibilityLabel={label} placeholderTextColor={C.textMuted} secureTextEntry={secret && !visible} onFocus={event => { setFocused(true); props.onFocus?.(event); }} onBlur={event => { setFocused(false); props.onBlur?.(event); }} style={[{ flex: 1, minWidth: 0, color: C.text, fontSize: 16, fontFamily: fonts.regular, paddingVertical: 16, outlineWidth: 0 }, props.style]} />
      {secret && <Pressable accessibilityRole="button" accessibilityLabel={visible ? `Ocultar ${label.toLowerCase()}` : `Mostrar ${label.toLowerCase()}`} onPress={() => setVisible(v => !v)} style={styles.back}><Ionicons name={visible ? 'eye-off-outline' : 'eye-outline'} size={20} color={C.textMuted} /></Pressable>}
    </View>
  </View>;
}

export function Note({ children }: { children: ReactNode }) {
  const { colors: C, isDark } = usePremiumTheme();
  return <View style={[styles.note, { backgroundColor: C.primarySoft }]}><Ionicons name="sparkles-outline" size={18} color={isDark ? C.primaryLight : C.primaryDark} /><Text style={{ flex: 1, color: C.textMuted, fontSize: 13, lineHeight: 20 }}>{children}</Text></View>;
}

export function TextLink({ label, onPress, outlined = false }: { label: string; onPress: () => void; outlined?: boolean }) {
  const { colors: C, isDark } = usePremiumTheme();
  return <Pressable accessibilityRole="button" onPress={onPress} style={{ minHeight: 44, paddingVertical: 10, paddingHorizontal: 18, borderRadius: 22, borderWidth: outlined ? 1 : 0, borderColor: outlined ? C.border : 'transparent', justifyContent: 'center', alignItems: 'center' }}><Text style={{ color: isDark ? C.primaryLight : C.primaryDark, fontSize: 14, fontWeight: '600', textAlign: 'center' }}>{label}</Text></Pressable>;
}

const styles = StyleSheet.create({
  screen: { flex: 1 }, scroll: { flexGrow: 1, paddingHorizontal: 24, alignItems: 'center' }, column: { width: '100%', maxWidth: 480, flexGrow: 1 },
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 22 }, back: { width: 44, height: 44, borderRadius: 22, alignItems: 'center', justifyContent: 'center' },
  track: { height: 4, borderRadius: 2, marginBottom: 28 }, body: { gap: 10 }, eyebrow: { fontSize: 10, letterSpacing: 1.8, fontWeight: '600' },
  title: { fontSize: 31, lineHeight: 38, fontWeight: '700', letterSpacing: -1.2 }, subtitle: { fontSize: 14, lineHeight: 22 }, fields: { gap: 12, marginTop: 18 },
  actions: { paddingTop: 24, gap: 8, marginTop: 'auto' }, error: { padding: 14, borderRadius: 14, fontSize: 13, lineHeight: 20 },
  button: { minHeight: 56, paddingHorizontal: 22, paddingVertical: 16, borderRadius: 28, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 12 }, buttonText: { color: '#fff', fontSize: 15, fontWeight: '600', flexShrink: 1 },
  choice: { flexDirection: 'row', alignItems: 'center', gap: 12, padding: 14, borderRadius: 20, borderWidth: 1.5, minHeight: 72 }, choiceIcon: { width: 40, height: 40, borderRadius: 14, alignItems: 'center', justifyContent: 'center' },
  field: { borderWidth: 1.5, borderRadius: 16, paddingHorizontal: 16, flexDirection: 'row', alignItems: 'center' }, note: { padding: 16, borderRadius: 18, flexDirection: 'row', gap: 10, alignItems: 'flex-start' },
});
