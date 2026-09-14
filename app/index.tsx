import { useAuth } from '@/context/auth';
import { router } from 'expo-router';
import { useEffect, useRef } from 'react';
import { Animated, Easing, StyleSheet, Text, View } from 'react-native';

const BG      = '#1A3C2E';
const GREEN   = '#4CAF50';
const LIGHT   = '#A8D5B5';
const WHITE   = '#FFFFFF';
const DURATION = 2600;

export default function SplashScreen() {
  const { isAuthenticated } = useAuth();
  const scale   = useRef(new Animated.Value(0.7)).current;
  const opacity = useRef(new Animated.Value(0)).current;
  const fadeOut = useRef(new Animated.Value(1)).current;
  const dot1    = useRef(new Animated.Value(0.3)).current;
  const dot2    = useRef(new Animated.Value(0.3)).current;
  const dot3    = useRef(new Animated.Value(0.3)).current;

  useEffect(() => {
    // Logo pop-in
    Animated.parallel([
      Animated.spring(scale,   { toValue: 1, friction: 6, tension: 80, useNativeDriver: true }),
      Animated.timing(opacity, { toValue: 1, duration: 500, useNativeDriver: true }),
    ]).start();

    // Dots pulsing
    const pulse = (dot: Animated.Value, delay: number) =>
      Animated.loop(
        Animated.sequence([
          Animated.delay(delay),
          Animated.timing(dot, { toValue: 1,   duration: 350, easing: Easing.inOut(Easing.ease), useNativeDriver: true }),
          Animated.timing(dot, { toValue: 0.3, duration: 350, easing: Easing.inOut(Easing.ease), useNativeDriver: true }),
        ])
      );

    const d1 = pulse(dot1, 0);
    const d2 = pulse(dot2, 200);
    const d3 = pulse(dot3, 400);
    d1.start(); d2.start(); d3.start();

    const t = setTimeout(() => {
      d1.stop(); d2.stop(); d3.stop();
      Animated.timing(fadeOut, { toValue: 0, duration: 400, useNativeDriver: true }).start(() => {
        router.replace(isAuthenticated ? '/(tabs)' : '/auth/login');
      });
    }, DURATION);

    return () => clearTimeout(t);
  }, [isAuthenticated]);

  return (
    <Animated.View style={[s.screen, { opacity: fadeOut }]}>
      <Animated.View style={[s.center, { opacity, transform: [{ scale }] }]}>
        {/* Ícone */}
        <View style={s.iconWrap}>
          <View style={s.circle}>
            <View style={s.leaf} />
            <View style={[s.leaf, s.leafRight]} />
            <View style={s.stem} />
          </View>
        </View>

        <Text style={s.name}>nutrifybe</Text>
        <Text style={s.tagline}>seu guia de nutrição inteligente</Text>
      </Animated.View>

      {/* Dots loader */}
      <View style={s.dots}>
        {[dot1, dot2, dot3].map((d, i) => (
          <Animated.View key={i} style={[s.dot, { opacity: d }]} />
        ))}
      </View>
    </Animated.View>
  );
}

const s = StyleSheet.create({
  screen: {
    flex: 1, backgroundColor: BG,
    alignItems: 'center', justifyContent: 'center',
  },
  center: { alignItems: 'center', gap: 12 },

  iconWrap: { marginBottom: 8 },
  circle: {
    width: 96, height: 96, borderRadius: 48,
    backgroundColor: GREEN,
    alignItems: 'center', justifyContent: 'center',
  },
  leaf: {
    position: 'absolute',
    width: 30, height: 42,
    borderRadius: 15,
    backgroundColor: WHITE,
    opacity: 0.9,
    top: 16, left: 22,
    transform: [{ rotate: '-25deg' }],
  },
  leafRight: {
    left: 44,
    opacity: 0.6,
    transform: [{ rotate: '25deg' }],
  },
  stem: {
    position: 'absolute',
    bottom: 16, width: 4, height: 20,
    borderRadius: 2, backgroundColor: WHITE, opacity: 0.8,
  },

  name: {
    fontSize: 38, fontWeight: '900',
    color: WHITE, letterSpacing: -1,
  },
  tagline: {
    fontSize: 13, color: LIGHT,
    fontWeight: '500', letterSpacing: 0.3,
  },

  dots: {
    position: 'absolute', bottom: 56,
    flexDirection: 'row', gap: 8,
  },
  dot: {
    width: 8, height: 8, borderRadius: 4,
    backgroundColor: LIGHT,
  },
});
