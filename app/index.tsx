import { useAuth } from '@/context/auth';
import { useAppLayout } from '@/hooks/useAppLayout';
import { router } from 'expo-router';
import { useEffect, useRef } from 'react';
import { Animated, Easing, StyleSheet, Text, View } from 'react-native';

const BG    = '#F0FDF4';
const GREEN = '#22C55E';
const DARK  = '#15803D';
const WHITE = '#FFFFFF';

export default function SplashScreen() {
  const { isAuthenticated } = useAuth();
  const { bottomPad } = useAppLayout();
  const scale   = useRef(new Animated.Value(0.8)).current;
  const opacity = useRef(new Animated.Value(0)).current;
  const fadeOut = useRef(new Animated.Value(1)).current;
  const dot1    = useRef(new Animated.Value(0.3)).current;
  const dot2    = useRef(new Animated.Value(0.3)).current;
  const dot3    = useRef(new Animated.Value(0.3)).current;

  useEffect(() => {
    Animated.parallel([
      Animated.spring(scale,   { toValue: 1, friction: 7, tension: 80, useNativeDriver: true }),
      Animated.timing(opacity, { toValue: 1, duration: 400, useNativeDriver: true }),
    ]).start();

    const pulse = (dot: Animated.Value, delay: number) =>
      Animated.loop(Animated.sequence([
        Animated.delay(delay),
        Animated.timing(dot, { toValue: 1,   duration: 400, easing: Easing.inOut(Easing.ease), useNativeDriver: true }),
        Animated.timing(dot, { toValue: 0.3, duration: 400, easing: Easing.inOut(Easing.ease), useNativeDriver: true }),
      ]));

    const d1 = pulse(dot1, 0); const d2 = pulse(dot2, 180); const d3 = pulse(dot3, 360);
    d1.start(); d2.start(); d3.start();

    const t = setTimeout(() => {
      d1.stop(); d2.stop(); d3.stop();
      Animated.timing(fadeOut, { toValue: 0, duration: 350, useNativeDriver: true }).start(() => {
        router.replace(isAuthenticated ? '/(tabs)' : '/auth/login');
      });
    }, 2400);

    return () => clearTimeout(t);
  }, [isAuthenticated]);

  return (
    <Animated.View style={[s.screen, { opacity: fadeOut }]}>
      <Animated.View style={[s.center, { opacity, transform: [{ scale }] }]}>
        <View style={s.logoWrap}>
          <View style={s.logoCircle}>
            <Text style={s.logoLeaf}>🥗</Text>
          </View>
        </View>
        <Text style={s.name}>nutrifybe</Text>
        <Text style={s.tagline}>seu guia de nutrição inteligente</Text>
      </Animated.View>
      <View style={[s.dots, { bottom: bottomPad + 32 }]}>
        {[dot1, dot2, dot3].map((d, i) => (
          <Animated.View key={i} style={[s.dot, { opacity: d }]} />
        ))}
      </View>
    </Animated.View>
  );
}

const s = StyleSheet.create({
  screen:     { flex: 1, backgroundColor: BG, alignItems: 'center', justifyContent: 'center' },
  center:     { alignItems: 'center', gap: 10 },
  logoWrap:   { marginBottom: 12 },
  logoCircle: { width: 100, height: 100, borderRadius: 28, backgroundColor: GREEN, alignItems: 'center', justifyContent: 'center',
                shadowColor: GREEN, shadowOffset: { width: 0, height: 8 }, shadowOpacity: 0.35, shadowRadius: 20, elevation: 12 },
  logoLeaf:   { fontSize: 48 },
  name:       { fontSize: 36, fontWeight: '800', color: DARK, letterSpacing: -1 },
  tagline:    { fontSize: 13, color: '#6B7280', fontWeight: '500' },
  dots:       { position: 'absolute', flexDirection: 'row', gap: 8 },
  dot:        { width: 8, height: 8, borderRadius: 4, backgroundColor: GREEN },
});
