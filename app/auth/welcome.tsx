import { BrandLogo } from '@/components/brand-logo';
import { usePremiumTheme } from '@/context/theme';
import { Ionicons } from '@expo/vector-icons';
import {
  Inter_400Regular,
  Inter_500Medium,
  Inter_600SemiBold,
  Inter_700Bold,
  useFonts,
} from '@expo-google-fonts/inter';
import { LinearGradient } from 'expo-linear-gradient';
import { router } from 'expo-router';
import { Pressable, ScrollView, StyleSheet, Text, useWindowDimensions, View } from 'react-native';
import Animated, { FadeInDown, useReducedMotion } from 'react-native-reanimated';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

export default function WelcomeScreen() {
  const { colors: C, isDark, toggleTheme } = usePremiumTheme();
  const { width, height } = useWindowDimensions();
  const insets = useSafeAreaInsets();
  const reduceMotion = useReducedMotion();
  const [fontsLoaded] = useFonts({ Inter_400Regular, Inter_500Medium, Inter_600SemiBold, Inter_700Bold });
  const wide = width >= 900;
  const compact = !wide && height < 750;
  const background = isDark ? C.bg : '#F4FEFF';
  const accent = isDark ? C.primaryLight : C.primaryDark;
  const font = (weight: 'regular' | 'medium' | 'semibold' | 'bold') => {
    if (!fontsLoaded) return {};
    return { fontFamily: {
      regular: 'Inter_400Regular', medium: 'Inter_500Medium',
      semibold: 'Inter_600SemiBold', bold: 'Inter_700Bold',
    }[weight] };
  };

  return (
    <View style={[s.screen, { backgroundColor: background }]}>
      <LinearGradient
        pointerEvents="none"
        colors={isDark ? ['#251D3B', C.bg, C.bg] : ['#E5F8FB', '#F4FEFF', '#FFFFFF']}
        locations={[0, 0.55, 1]}
        style={StyleSheet.absoluteFill}
      />
      <ScrollView
        style={s.screen}
        contentContainerStyle={[
          s.scroll,
          { paddingTop: insets.top + (compact ? 12 : 22), paddingBottom: insets.bottom + 16 },
        ]}
        showsVerticalScrollIndicator={false}
        bounces={false}
      >
        <View style={[s.header, wide && s.headerWide]}>
          <BrandLogo width={compact ? 138 : 154} />
          <Pressable
            accessibilityRole="button"
            accessibilityLabel={isDark ? 'Ativar tema claro' : 'Ativar tema escuro'}
            onPress={toggleTheme}
            style={({ pressed }) => [s.themeButton, { backgroundColor: C.primarySoft, opacity: pressed ? 0.6 : 1 }]}
          >
            <Ionicons name={isDark ? 'sunny-outline' : 'moon-outline'} size={19} color={accent} />
          </Pressable>
        </View>

        <View style={[s.main, wide && s.mainWide]}>
          <View style={[s.content, wide && s.contentWide]}>
            <Animated.View
              entering={reduceMotion ? undefined : FadeInDown.delay(100).duration(600)}
              style={[s.copy, compact && s.copyCompact, wide && s.copyWide]}
            >
              <View style={s.eyebrowRow}>
                <View style={[s.eyebrowDot, { backgroundColor: accent }]} />
                <Text style={[s.eyebrow, font('semibold'), { color: accent }]}>Seu plano alimentar sempre com você.</Text>
              </View>
              <Text
                accessibilityRole="header"
                style={[s.title, compact && s.titleCompact, wide && s.titleWide, font('bold'), { color: C.text }]}
              >
                Sua alimentação.{'\n'}
                <Text style={{ color: accent }}>Sua evolução.</Text>
              </Text>
              <Text style={[s.description, font('regular'), { color: C.textMuted }, wide && s.alignLeft]}>
              Siga seu plano alimentar e acompanhe sua evolução em um só lugar.
              </Text>
            </Animated.View>

            <Animated.View
              entering={reduceMotion ? undefined : FadeInDown.delay(220).duration(600)}
              style={[s.actions, compact && s.actionsCompact, wide && s.actionsWide]}
            >
              <Pressable
                accessibilityRole="button"
                accessibilityLabel="Começar agora"
                accessibilityHint="Abre o cadastro para personalizar seu plano"
                onPress={() => router.push('/auth/about-you')}
                style={({ pressed }) => [
                  s.primaryButton,
                  { shadowColor: C.primary, opacity: pressed ? 0.88 : 1, transform: [{ scale: pressed ? 0.98 : 1 }] },
                ]}
              >
                <LinearGradient
                  colors={isDark ? ['#7C3AED', '#4D1E97'] : ['#0094AC', '#007F95']}
                  start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }}
                  style={s.buttonFill}
                >
                  <Text style={[s.primaryLabel, font('semibold')]}>Começar minha jornada</Text>
                </LinearGradient>
              </Pressable>
              <Text style={[s.freeNote, font('medium'), { color: C.textMuted }]}>O primeiro passo para uma alimentação mais organizada.</Text>
              <Pressable
                accessibilityRole="button"
                accessibilityLabel="Já tenho conta. Entrar"
                onPress={() => router.push('/auth/login')}
                style={({ pressed }) => [s.loginButton, { opacity: pressed ? 0.55 : 1 }]}
              >
                <Text style={[s.loginLabel, font('regular'), { color: C.textMuted }]}>
                  Já tem uma conta? <Text style={[font('semibold'), { color: accent }]}>Entrar</Text>
                </Text>
              </Pressable>
            </Animated.View>
          </View>
        </View>

        <View style={s.footer}>
          <View style={[s.footerLine, { backgroundColor: C.border }]} />
          <Text style={[s.footerText, font('medium'), { color: C.textMuted }]}>Sua evolução, acompanhada de perto.</Text>
          <View style={[s.footerLine, { backgroundColor: C.border }]} />
        </View>
      </ScrollView>
    </View>
  );
}

const s = StyleSheet.create({
  screen: { flex: 1 },
  scroll: { flexGrow: 1, alignItems: 'center', paddingHorizontal: 24 },
  header: { width: '100%', maxWidth: 440, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  headerWide: { maxWidth: 1080 },
  themeButton: { width: 44, height: 44, borderRadius: 22, alignItems: 'center', justifyContent: 'center' },
  main: { width: '100%', maxWidth: 440, flexGrow: 1, justifyContent: 'center', paddingBottom: 10 },
  mainWide: { maxWidth: 680, paddingVertical: 60 },
  content: { width: '100%' },
  contentWide: { maxWidth: 520, alignSelf: 'center' },
  copy: { alignItems: 'center', gap: 15 },
  copyCompact: { gap: 12 },
  copyWide: { alignItems: 'center', gap: 22 },
  eyebrowRow: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  eyebrowDot: { width: 5, height: 5, borderRadius: 3 },
  eyebrow: { fontSize: 10, letterSpacing: 1.8, fontWeight: '600' },
  title: { fontSize: 46, lineHeight: 51, letterSpacing: -2.1, textAlign: 'center', fontWeight: '700' },
  titleCompact: { fontSize: 40, lineHeight: 45 },
  titleWide: { fontSize: 64, lineHeight: 69, letterSpacing: -3, textAlign: 'center' },
  description: { maxWidth: 310, fontSize: 15, lineHeight: 24, textAlign: 'center' },
  alignLeft: { textAlign: 'center', maxWidth: 350, fontSize: 17, lineHeight: 27 },
  actions: { width: '100%', marginTop: 30, alignItems: 'center' },
  actionsCompact: { marginTop: 18 },
  actionsWide: { marginTop: 36, maxWidth: 400, alignSelf: 'center' },
  primaryButton: { width: '100%', borderRadius: 30, shadowOffset: { width: 0, height: 8 }, shadowOpacity: 0.18, shadowRadius: 18, elevation: 4 },
  buttonFill: { minHeight: 58, borderRadius: 30, paddingVertical: 17, paddingHorizontal: 24, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 14 },
  primaryLabel: { color: '#FFFFFF', fontSize: 16, fontWeight: '600', flexShrink: 1 },
  freeNote: { fontSize: 11, marginTop: 12 },
  loginButton: { minHeight: 48, alignItems: 'center', justifyContent: 'center', marginTop: 8, paddingHorizontal: 16 },
  loginLabel: { fontSize: 14, lineHeight: 22, textAlign: 'center' },
  footer: { flexDirection: 'row', alignItems: 'center', gap: 12, paddingTop: 12, paddingBottom: 4 },
  footerLine: { width: 22, height: 1 },
  footerText: { fontSize: 10, letterSpacing: 0.5 },
});
