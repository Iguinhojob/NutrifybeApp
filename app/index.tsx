import { useAuth } from '@/context/auth';
import { router } from 'expo-router';
import { useEffect, useRef } from 'react';
import { Animated, Easing, StyleSheet, Text, View } from 'react-native';

const DURATION = 2800;

export default function SplashScreen() {
  const { isAuthenticated } = useAuth();
  const fadeIn  = useRef(new Animated.Value(0)).current;
  const slideUp = useRef(new Animated.Value(20)).current;
  const fadeOut = useRef(new Animated.Value(1)).current;
  const barWidth = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.parallel([
      Animated.timing(fadeIn,  { toValue: 1, duration: 600, useNativeDriver: true }),
      Animated.timing(slideUp, { toValue: 0, duration: 600, easing: Easing.out(Easing.cubic), useNativeDriver: true }),
    ]).start();

    Animated.timing(barWidth, {
      toValue: 1, duration: DURATION - 400,
      delay: 300, easing: Easing.inOut(Easing.ease),
      useNativeDriver: false,
    }).start();

    const t = setTimeout(() => {
      Animated.timing(fadeOut, { toValue: 0, duration: 500, useNativeDriver: true }).start(() => {
        router.replace(isAuthenticated ? '/(tabs)' : '/auth/login');
      });
    }, DURATION);

    return () => clearTimeout(t);
  }, [isAuthenticated]);

  const barW = barWidth.interpolate({ inputRange: [0, 1], outputRange: ['0%', '100%'] });

  return (
    <Animated.View style={[s.screen, { opacity: Animated.multiply(fadeIn, fadeOut) }]}>
      <Animated.View style={{ transform: [{ translateY: slideUp }], alignItems: 'center', gap: 6 }}>
        {/* Ícone da marca */}
        <View style={s.iconBox}>
          <View style={s.iconLeaf} />
          <View style={[s.iconLeaf, s.iconLeaf2]} />
        </View>

        <Text style={s.name}>nutrifybe</Text>
        <Text style={s.tagline}>nutrição que faz sentido</Text>
      </Animated.View>

      {/* Barra de loading */}
      <View style={s.barTrack}>
        <Animated.View style={[s.barFill, { width: barW }]} />
      </View>
    </Animated.View>
  );
}

const GREEN = '#1B4332';
const GREEN_MID = '#2D6A4F';
const ACCENT = '#52B788';
const BG = '#F6FBF7';

const s = StyleSheet.create({
  screen: {
    flex: 1, backgroundColor: BG,
    alignItems: 'center', justifyContent: 'center', gap: 40,
  },
  iconBox: {
    width: 72, height: 72, borderRadius: 22,
    backgroundColor: GREEN,
    alignItems: 'center', justifyContent: 'center',
    marginBottom: 8,
  },
  iconLeaf: {
    position: 'absolute',
    width: 28, height: 36,
    borderRadius: 14,
    backgroundColor: ACCENT,
    transform: [{ rotate: '-30deg' }, { translateX: -6 }],
  },
  iconLeaf2: {
    backgroundColor: '#74C69D',
    transform: [{ rotate: '30deg' }, { translateX: 6 }],
  },
  name: {
    fontSize: 36, fontWeight: '900', color: GREEN,
    letterSpacing: -1.5,
  },
  tagline: {
    fontSize: 14, color: ACCENT, fontWeight: '600', letterSpacing: 0.5,
  },
  barTrack: {
    position: 'absolute', bottom: 60,
    width: 120, height: 3, borderRadius: 2,
    backgroundColor: '#D8F3DC',
    overflow: 'hidden',
  },
  barFill: {
    height: 3, borderRadius: 2, backgroundColor: ACCENT,
  },
});
