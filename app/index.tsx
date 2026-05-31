import { useAuth } from '@/context/auth';
import { useFonts } from 'expo-font';
import { router } from 'expo-router';
import { useEffect, useRef, useState } from 'react';
import { Animated, Easing, Image, StyleSheet, Text, View } from 'react-native';

const MASCOTE = require('@/assets/images/mascote.png');
const DURATION = 3500;

export default function SplashScreen() {
  const { isAuthenticated } = useAuth();
  const [fontsLoaded] = useFonts({
    Rowdies_400Regular: require('../node_modules/@expo-google-fonts/rowdies/400Regular/Rowdies_400Regular.ttf'),
  });

  const fadeIn    = useRef(new Animated.Value(0)).current;
  const fadeOut   = useRef(new Animated.Value(1)).current;
  const float     = useRef(new Animated.Value(0)).current;
  const breathe   = useRef(new Animated.Value(1)).current;
  const glow      = useRef(new Animated.Value(0.3)).current;
  const pulse1    = useRef(new Animated.Value(1)).current;
  const pulse2    = useRef(new Animated.Value(1)).current;
  const pulse3    = useRef(new Animated.Value(1)).current;

  const [eyeOpen, setEyeOpen] = useState(true);

  useEffect(() => {
    // Fade in
    Animated.timing(fadeIn, { toValue: 1, duration: 700, useNativeDriver: true }).start();

    // Flutuação
    Animated.loop(
      Animated.sequence([
        Animated.timing(float, { toValue: -14, duration: 1400, easing: Easing.inOut(Easing.sin), useNativeDriver: true }),
        Animated.timing(float, { toValue: 0,   duration: 1400, easing: Easing.inOut(Easing.sin), useNativeDriver: true }),
      ])
    ).start();

    // Respiração
    Animated.loop(
      Animated.sequence([
        Animated.timing(breathe, { toValue: 1.06, duration: 1800, easing: Easing.inOut(Easing.ease), useNativeDriver: true }),
        Animated.timing(breathe, { toValue: 1,    duration: 1800, easing: Easing.inOut(Easing.ease), useNativeDriver: true }),
      ])
    ).start();

    // Brilho ao redor
    Animated.loop(
      Animated.sequence([
        Animated.timing(glow, { toValue: 0.8, duration: 1200, useNativeDriver: true }),
        Animated.timing(glow, { toValue: 0.3, duration: 1200, useNativeDriver: true }),
      ])
    ).start();

    // Círculos pulsantes em cascata (staggered)
    const pulseAnim = (val: Animated.Value, delay: number) =>
      Animated.loop(
        Animated.sequence([
          Animated.delay(delay),
          Animated.timing(val, { toValue: 2.2, duration: 1400, easing: Easing.out(Easing.ease), useNativeDriver: true }),
          Animated.timing(val, { toValue: 1,   duration: 0,    useNativeDriver: true }),
        ])
      );

    pulseAnim(pulse1, 0).start();
    pulseAnim(pulse2, 500).start();
    pulseAnim(pulse3, 1000).start();

    // Piscar de olhos
    const blink = () => {
      setEyeOpen(false);
      setTimeout(() => setEyeOpen(true), 150);
    };
    const blinkInterval = setInterval(blink, 2800);

    // Fade out e redirect
    const redirectTimer = setTimeout(() => {
      Animated.timing(fadeOut, { toValue: 0, duration: 600, useNativeDriver: true }).start(() => {
        router.replace(isAuthenticated ? '/(tabs)' : '/auth/login');
      });
    }, DURATION);

    return () => {
      clearTimeout(redirectTimer);
      clearInterval(blinkInterval);
    };
  }, [isAuthenticated]);

  const pulseOpacity = (val: Animated.Value) => val.interpolate({ inputRange: [1, 2.2], outputRange: [0.5, 0] });

  return (
    <Animated.View style={[styles.container, { opacity: Animated.multiply(fadeIn, fadeOut) }]}>

      {/* Brilho ao redor do mascote */}
      <Animated.View style={[styles.glowRing, { opacity: glow, transform: [{ scale: breathe }] }]} />

      {/* Mascote */}
      <Animated.View style={{ transform: [{ translateY: float }, { scale: breathe }], alignItems: 'center' }}>
        <Image
          source={MASCOTE}
          style={[styles.mascote, !eyeOpen && styles.mascoteBlinking]}
          resizeMode="contain"
        />
      </Animated.View>



      {/* Título com cores diferentes por parte */}
      <View style={styles.titleRow}>
        <Text style={[styles.title, { color: '#00C2CB' }]}>Nutri</Text>
        <Text style={[styles.title, { color: '#937BD6' }]}>fybe</Text>
      </View>

      {/* Círculos pulsantes de loading */}
      <View style={styles.pulseContainer}>
        {[pulse1, pulse2, pulse3].map((p, i) => (
          <Animated.View key={i} style={[styles.pulseCircle, {
            transform: [{ scale: p }],
            opacity: pulseOpacity(p),
          }]} />
        ))}
        <View style={styles.pulseDot} />
      </View>

    </Animated.View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#E8FBFF',
    gap: 8,
  },
  pulseContainer: {
    marginTop: 20,
    width: 50,
    height: 50,
    alignItems: 'center',
    justifyContent: 'center',
  },
  pulseCircle: {
    position: 'absolute',
    width: 50,
    height: 50,
    borderRadius: 25,
    borderWidth: 2,
    borderColor: '#00C2CB',
    backgroundColor: 'transparent',
  },
  pulseDot: {
    width: 12,
    height: 12,
    borderRadius: 6,
    backgroundColor: '#00C2CB',
  },
  glowRing: {
    position: 'absolute',
    width: 210, height: 210,
    borderRadius: 105,
    backgroundColor: '#B2F0F5',
    shadowColor: '#00C2CB',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.5,
    shadowRadius: 28,
    elevation: 8,
  },
  mascote: {
    width: 190, height: 190,
  },
  mascoteBlinking: {
    transform: [{ scaleY: 0.95 }],
  },
  shadow: {
    width: 90, height: 14,
    borderRadius: 50,
    backgroundColor: '#00C2CB',
    marginTop: -6,
    marginBottom: 10,
  },
  titleRow: {
    flexDirection: 'row',
    marginTop: 8,
  },
  title: {
    fontSize: 38,
    fontFamily: 'Rowdies_400Regular',
    letterSpacing: 1,
  },
});
