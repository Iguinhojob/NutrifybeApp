import { BrandLogo } from '@/components/brand-logo';
import { useAuth } from '@/context/auth';
import { usePremiumTheme } from '@/context/theme';
import { useBrandFonts } from '@/hooks/use-brand-fonts';
import { LinearGradient } from 'expo-linear-gradient';
import { router } from 'expo-router';
import { useEffect } from 'react';
import { ActivityIndicator, StyleSheet, Text, View } from 'react-native';
import Animated, { FadeIn, FadeInDown, useReducedMotion } from 'react-native-reanimated';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

export default function LaunchScreen() {
  const { isAuthenticated } = useAuth();
  const { colors: C, isDark } = usePremiumTheme();
  const fonts = useBrandFonts();
  const insets = useSafeAreaInsets();
  const reduce = useReducedMotion();

  useEffect(() => {
    const timer = setTimeout(() => router.replace(isAuthenticated ? '/(tabs)' : '/auth/welcome'), reduce ? 250 : 1100);
    return () => clearTimeout(timer);
  }, [isAuthenticated, reduce]);

  return <View style={[s.screen, { backgroundColor: C.bg }]}>
    <LinearGradient colors={isDark ? ['#251D3B', '#13111A', '#13111A'] : ['#E5F8FB', '#F4FEFF', '#FFFFFF']} style={StyleSheet.absoluteFill} />
    <Animated.View entering={reduce ? undefined : FadeIn.duration(500)} style={s.brand}>
      <View style={[s.halo, { backgroundColor: C.primarySoft }]}>
        <BrandLogo markOnly width={84} />
      </View>
      <BrandLogo width={220} />
      <Animated.Text entering={reduce ? undefined : FadeInDown.delay(150).duration(400)} style={[s.tagline, { color: C.textMuted, fontFamily: fonts.regular }]}>Um novo olhar para cuidar de você.</Animated.Text>
    </Animated.View>
    <View style={[s.footer, { bottom: insets.bottom + 42 }]}>
      <ActivityIndicator color={isDark ? C.primaryLight : C.primaryDark} size="small" accessibilityLabel="Abrindo NutriFybe" />
      <Text accessibilityLiveRegion="polite" style={{ fontSize: 12, color: C.textMuted, fontFamily: fonts.medium }}>Seu bem-estar começa aqui</Text>
    </View>
  </View>;
}
const s = StyleSheet.create({
  screen: { flex: 1, alignItems: 'center', justifyContent: 'center' },
  brand: { alignItems: 'center', gap: 24, paddingHorizontal: 24 },
  halo: { width: 140, height: 140, borderRadius: 70, alignItems: 'center', justifyContent: 'center', marginBottom: 8 },
  tagline: { fontSize: 14, textAlign: 'center', lineHeight: 22 },
  footer: { position: 'absolute', alignItems: 'center', gap: 14 },
});
