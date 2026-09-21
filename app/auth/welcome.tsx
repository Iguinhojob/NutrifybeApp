import { usePremiumTheme } from '@/context/theme';
import { useAppLayout } from '@/hooks/useAppLayout';
import { router } from 'expo-router';
import { useEffect } from 'react';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import Animated, {
  Easing,
  FadeInDown,
  useAnimatedStyle,
  useSharedValue,
  withDelay,
  withRepeat,
  withSequence,
  withTiming,
} from 'react-native-reanimated';

function Mascote({ primary }: { primary: string }) {
  const bounce = useSharedValue(0);

  useEffect(() => {
    bounce.value = withDelay(
      400,
      withRepeat(
        withSequence(
          withTiming(-12, { duration: 400, easing: Easing.out(Easing.quad) }),
          withTiming(0,   { duration: 360, easing: Easing.in(Easing.quad) }),
          withTiming(-5,  { duration: 260, easing: Easing.out(Easing.quad) }),
          withTiming(0,   { duration: 220, easing: Easing.in(Easing.quad) }),
          withTiming(0,   { duration: 900 }),
        ),
        -1,
        false,
      ),
    );
  }, []);

  const style = useAnimatedStyle(() => ({
    transform: [{ translateY: bounce.value }],
  }));

  const leafDark = shadeColor(primary, -20);
  const leafLight = shadeColor(primary, 20);

  return (
    <Animated.View style={[mc.wrap, style]}>
      <View style={mc.shadow} />
      <View style={[mc.body, { backgroundColor: primary }]}>
        <View style={[mc.leaf, mc.leafL, { backgroundColor: leafDark }]} />
        <View style={[mc.leaf, mc.leafR, { backgroundColor: leafLight }]} />
        <View style={mc.face}>
          <View style={mc.eyesRow}>
            <View style={mc.eye} />
            <View style={mc.eye} />
          </View>
          <View style={mc.smile} />
        </View>
        <View style={[mc.arm, mc.armL, { backgroundColor: primary }]} />
        <View style={[mc.arm, mc.armR, { backgroundColor: primary }]} />
      </View>
      <View style={mc.legsRow}>
        <View style={[mc.leg, { backgroundColor: primary }]} />
        <View style={[mc.leg, { backgroundColor: primary }]} />
      </View>
    </Animated.View>
  );
}

function shadeColor(hex: string, pct: number) {
  const n = parseInt(hex.replace('#', ''), 16);
  const r = Math.min(255, Math.max(0, (n >> 16) + pct * 2));
  const g = Math.min(255, Math.max(0, ((n >> 8) & 0xff) + pct * 2));
  const b = Math.min(255, Math.max(0, (n & 0xff) + pct * 2));
  return `rgb(${r},${g},${b})`;
}

export default function WelcomeScreen() {
  const { colors: C } = usePremiumTheme();
  const { bottomPad } = useAppLayout();

  return (
    <View style={[s.screen, { backgroundColor: C.bg }]}>
      <View style={[s.blob, { backgroundColor: C.primarySoft }]} />

      <Animated.View entering={FadeInDown.delay(100).duration(500)} style={s.mascoteArea}>
        <Mascote primary={C.primary} />
      </Animated.View>

      <Animated.View entering={FadeInDown.delay(250).duration(500)} style={s.textArea}>
        <Text style={[s.title, { color: C.text }]}>Olá! Eu sou o Nutri 🌿</Text>
        <Text style={[s.subtitle, { color: C.textMuted }]}>
          Seu assistente de nutrição inteligente.{'\n'}
          Vamos transformar sua alimentação juntos!
        </Text>
      </Animated.View>

      <Animated.View entering={FadeInDown.delay(380).duration(500)} style={s.bullets}>
        {[
          { icon: '🎯', text: 'Plano alimentar personalizado' },
          { icon: '📊', text: 'Acompanhamento diário de macros' },
          { icon: '👩‍⚕️', text: 'Nutricionistas especializados' },
        ].map((b, i) => (
          <View key={i} style={[s.bullet, { backgroundColor: C.primarySoft }]}>
            <Text style={s.bulletIcon}>{b.icon}</Text>
            <Text style={[s.bulletText, { color: C.primary }]}>{b.text}</Text>
          </View>
        ))}
      </Animated.View>

      <Animated.View
        entering={FadeInDown.delay(500).duration(500)}
        style={[s.actions, { paddingBottom: bottomPad + 28 }]}
      >
        <TouchableOpacity
          style={[s.btnPrimary, { backgroundColor: C.primary, shadowColor: C.primary }]}
          onPress={() => router.push('/auth/about-you')}
          activeOpacity={0.88}
        >
          <Text style={s.btnPrimaryText}>Criar conta gratuita</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[s.btnSecondary, { borderColor: C.border }]}
          onPress={() => router.push('/auth/login')}
          activeOpacity={0.88}
        >
          <Text style={[s.btnSecondaryText, { color: C.primary }]}>Já tenho conta</Text>
        </TouchableOpacity>
      </Animated.View>
    </View>
  );
}

const s = StyleSheet.create({
  screen:          { flex: 1 },
  blob:            { position: 'absolute', top: -120, right: -100, width: 340, height: 340, borderRadius: 170 },
  mascoteArea:     { flex: 1, alignItems: 'center', justifyContent: 'flex-end', paddingBottom: 8 },
  textArea:        { alignItems: 'center', paddingHorizontal: 32, gap: 10, marginTop: 24 },
  title:           { fontSize: 28, fontWeight: '800', textAlign: 'center', letterSpacing: -0.5 },
  subtitle:        { fontSize: 15, textAlign: 'center', lineHeight: 22 },
  bullets:         { paddingHorizontal: 28, gap: 10, marginTop: 20 },
  bullet:          { flexDirection: 'row', alignItems: 'center', gap: 12, borderRadius: 14, paddingVertical: 12, paddingHorizontal: 16 },
  bulletIcon:      { fontSize: 18 },
  bulletText:      { fontSize: 14, fontWeight: '600', flex: 1 },
  actions:         { paddingHorizontal: 24, gap: 12, marginTop: 24 },
  btnPrimary:      { borderRadius: 16, height: 56, alignItems: 'center', justifyContent: 'center',
                     shadowOffset: { width: 0, height: 6 }, shadowOpacity: 0.3, shadowRadius: 14, elevation: 6 },
  btnPrimaryText:  { fontSize: 17, fontWeight: '800', color: '#fff' },
  btnSecondary:    { borderRadius: 16, height: 52, alignItems: 'center', justifyContent: 'center', borderWidth: 1.5 },
  btnSecondaryText:{ fontSize: 16, fontWeight: '600' },
});

const mc = StyleSheet.create({
  wrap:    { alignItems: 'center' },
  shadow:  { width: 70, height: 10, borderRadius: 35, backgroundColor: 'rgba(0,0,0,0.08)', position: 'absolute', bottom: -4 },
  body:    { width: 90, height: 100, borderRadius: 45, alignItems: 'center', justifyContent: 'center', position: 'relative' },
  leaf:    { position: 'absolute', width: 20, height: 32, borderRadius: 10 },
  leafL:   { top: -20, left: 16, transform: [{ rotate: '-28deg' }] },
  leafR:   { top: -20, right: 16, transform: [{ rotate: '28deg' }] },
  face:    { width: 58, height: 50, backgroundColor: '#fff', borderRadius: 29, alignItems: 'center', justifyContent: 'center', gap: 7, marginTop: 6 },
  eyesRow: { flexDirection: 'row', gap: 14 },
  eye:     { width: 9, height: 9, borderRadius: 5, backgroundColor: '#1A1A1A' },
  smile:   { width: 24, height: 11, borderBottomLeftRadius: 12, borderBottomRightRadius: 12, borderWidth: 2.5, borderColor: '#1A1A1A', borderTopWidth: 0 },
  arm:     { position: 'absolute', width: 16, height: 38, borderRadius: 8 },
  armL:    { left: -12, top: 32, transform: [{ rotate: '18deg' }] },
  armR:    { right: -12, top: 32, transform: [{ rotate: '-18deg' }] },
  legsRow: { flexDirection: 'row', gap: 12, marginTop: 2 },
  leg:     { width: 16, height: 28, borderRadius: 8 },
});
