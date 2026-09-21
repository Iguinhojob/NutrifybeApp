import { useAuth } from '@/context/auth';
import { useAppLayout } from '@/hooks/useAppLayout';
import { router } from 'expo-router';
import { useEffect } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import Animated, {
  Easing,
  FadeIn,
  useAnimatedStyle,
  useSharedValue,
  withDelay,
  withRepeat,
  withSequence,
  withTiming,
  runOnJS,
} from 'react-native-reanimated';

const PRIMARY = '#4CAF50';
const BG = '#FFFFFF';

function MascoteSVG() {
  return (
    <View style={m.mascote}>
      {/* Corpo */}
      <View style={m.body}>
        {/* Folha topo */}
        <View style={m.leafLeft} />
        <View style={m.leafRight} />
        {/* Rosto */}
        <View style={m.face}>
          <View style={m.eyesRow}>
            <View style={m.eye} />
            <View style={m.eye} />
          </View>
          <View style={m.smile} />
        </View>
        {/* Braços */}
        <View style={[m.arm, m.armLeft]} />
        <View style={[m.arm, m.armRight]} />
        {/* Pernas */}
        <View style={m.legsRow}>
          <View style={m.leg} />
          <View style={m.leg} />
        </View>
      </View>
    </View>
  );
}

export default function SplashScreen() {
  const { isAuthenticated } = useAuth();
  const { bottomPad } = useAppLayout();

  const translateY = useSharedValue(0);
  const scale = useSharedValue(0.5);
  const opacity = useSharedValue(0);
  const barWidth = useSharedValue(0);
  const screenOpacity = useSharedValue(1);

  function navigate() {
    router.replace(isAuthenticated ? '/(tabs)' : '/auth/welcome');
  }

  useEffect(() => {
    // Entrada do mascote
    scale.value = withTiming(1, { duration: 500, easing: Easing.out(Easing.back(1.5)) });
    opacity.value = withTiming(1, { duration: 400 });

    // Bounce contínuo
    translateY.value = withDelay(
      500,
      withRepeat(
        withSequence(
          withTiming(-14, { duration: 420, easing: Easing.out(Easing.quad) }),
          withTiming(0, { duration: 380, easing: Easing.in(Easing.quad) }),
          withTiming(-6, { duration: 280, easing: Easing.out(Easing.quad) }),
          withTiming(0, { duration: 240, easing: Easing.in(Easing.quad) }),
        ),
        -1,
        false,
      ),
    );

    // Barra de progresso
    barWidth.value = withDelay(300, withTiming(1, { duration: 2200, easing: Easing.out(Easing.cubic) }));

    // Fade out e navega
    const t = setTimeout(() => {
      screenOpacity.value = withTiming(0, { duration: 350 }, () => runOnJS(navigate)());
    }, 2900);

    return () => clearTimeout(t);
  }, [isAuthenticated]);

  const mascoteStyle = useAnimatedStyle(() => ({
    opacity: opacity.value,
    transform: [{ scale: scale.value }, { translateY: translateY.value }],
  }));

  const screenStyle = useAnimatedStyle(() => ({ opacity: screenOpacity.value }));

  const barStyle = useAnimatedStyle(() => ({
    width: `${barWidth.value * 100}%` as any,
  }));

  return (
    <Animated.View style={[s.screen, screenStyle]}>
      <View style={s.center}>
        <Animated.View style={mascoteStyle}>
          <MascoteSVG />
        </Animated.View>

        <Animated.Text entering={FadeIn.delay(500).duration(400)} style={s.name}>
          nutrifybe
        </Animated.Text>
        <Animated.Text entering={FadeIn.delay(750).duration(400)} style={s.tagline}>
          Nutrição inteligente para sua vida
        </Animated.Text>
      </View>

      <View style={[s.barContainer, { bottom: bottomPad + 52 }]}>
        <View style={s.barTrack}>
          <Animated.View style={[s.barFill, barStyle]} />
        </View>
        <Animated.Text entering={FadeIn.delay(400)} style={s.barLabel}>
          Preparando seu plano...
        </Animated.Text>
      </View>
    </Animated.View>
  );
}

const s = StyleSheet.create({
  screen:       { flex: 1, backgroundColor: BG, alignItems: 'center', justifyContent: 'center' },
  center:       { alignItems: 'center', gap: 16 },
  name:         { fontSize: 36, fontWeight: '900', color: '#1A1A1A', letterSpacing: -1 },
  tagline:      { fontSize: 14, color: '#888', fontWeight: '500' },
  barContainer: { position: 'absolute', width: '65%', alignItems: 'center', gap: 10 },
  barTrack:     { width: '100%', height: 4, backgroundColor: '#E8F5E9', borderRadius: 2, overflow: 'hidden' },
  barFill:      { height: '100%', backgroundColor: PRIMARY, borderRadius: 2 },
  barLabel:     { fontSize: 12, color: '#AAA', fontWeight: '500' },
});

// Mascote vetorial
const SIZE = 130;
const m = StyleSheet.create({
  mascote:   { width: SIZE, height: SIZE + 20, alignItems: 'center' },
  body:      { width: 80, height: 90, backgroundColor: PRIMARY, borderRadius: 40, alignItems: 'center', justifyContent: 'center', position: 'relative' },
  leafLeft:  { position: 'absolute', top: -18, left: 14, width: 18, height: 28, backgroundColor: '#388E3C', borderRadius: 9, transform: [{ rotate: '-30deg' }] },
  leafRight: { position: 'absolute', top: -18, right: 14, width: 18, height: 28, backgroundColor: '#66BB6A', borderRadius: 9, transform: [{ rotate: '30deg' }] },
  face:      { width: 52, height: 44, backgroundColor: '#fff', borderRadius: 26, alignItems: 'center', justifyContent: 'center', gap: 6, marginTop: 4 },
  eyesRow:   { flexDirection: 'row', gap: 12 },
  eye:       { width: 8, height: 8, borderRadius: 4, backgroundColor: '#1A1A1A' },
  smile:     { width: 22, height: 10, borderBottomLeftRadius: 11, borderBottomRightRadius: 11, borderWidth: 2.5, borderColor: '#1A1A1A', borderTopWidth: 0 },
  arm:       { position: 'absolute', width: 14, height: 36, backgroundColor: PRIMARY, borderRadius: 7 },
  armLeft:   { left: -10, top: 28, transform: [{ rotate: '20deg' }] },
  armRight:  { right: -10, top: 28, transform: [{ rotate: '-20deg' }] },
  legsRow:   { position: 'absolute', bottom: -18, flexDirection: 'row', gap: 10 },
  leg:       { width: 14, height: 26, backgroundColor: PRIMARY, borderRadius: 7 },
});
