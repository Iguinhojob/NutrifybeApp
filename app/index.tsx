import { Colors } from '@/constants/theme';
import { useAuth } from '@/context/auth';
import { router } from 'expo-router';
import { useEffect, useRef } from 'react';
import { Animated, StyleSheet, Text, View } from 'react-native';

export default function SplashScreen() {
  const pulse = useRef(new Animated.Value(1)).current;
  const { isAuthenticated } = useAuth();

  useEffect(() => {
    Animated.loop(
      Animated.sequence([
        Animated.timing(pulse, { toValue: 1.4, duration: 600, useNativeDriver: true }),
        Animated.timing(pulse, { toValue: 1, duration: 600, useNativeDriver: true }),
      ])
    ).start();

    const timer = setTimeout(() => {
      if (isAuthenticated) {
        router.replace('/(tabs)');
      } else {
        router.replace('/auth/login');
      }
    }, 2500);
    
    return () => clearTimeout(timer);
  }, [isAuthenticated]);

  return (
    <View style={styles.container}>
      <Text style={styles.logo}>🥗</Text>
      <Text style={styles.title}>Nutrifybe</Text>
      <Text style={styles.subtitle}>Sua nutrição inteligente</Text>
      <Animated.View style={[styles.dot, { transform: [{ scale: pulse }] }]} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.primary, alignItems: 'center', justifyContent: 'center', gap: 12 },
  logo: { fontSize: 72 },
  title: { fontSize: 36, fontWeight: 'bold', color: Colors.white },
  subtitle: { fontSize: 16, color: Colors.primaryLight, marginBottom: 40 },
  dot: { width: 14, height: 14, borderRadius: 7, backgroundColor: Colors.white, marginTop: 20 },
});
