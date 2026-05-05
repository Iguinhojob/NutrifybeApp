import { AuthProvider } from '@/context/auth';
import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';

export default function RootLayout() {
  return (
    <AuthProvider>
      <Stack screenOptions={{ headerShown: false, animation: 'fade', animationDuration: 200 }}>
        <Stack.Screen name="index" />
        <Stack.Screen name="auth/login" />
        <Stack.Screen name="auth/register" />
        <Stack.Screen name="auth/about-you" />
        <Stack.Screen name="auth/success" />
        <Stack.Screen name="(tabs)" />
        <Stack.Screen name="institutional/about" options={{ headerShown: true, title: 'Sobre Nós', headerTintColor: '#4CAF50', animation: 'slide_from_right' }} />
        <Stack.Screen name="institutional/privacy" options={{ headerShown: true, title: 'Política de Privacidade', headerTintColor: '#4CAF50', animation: 'slide_from_right' }} />
        <Stack.Screen name="institutional/terms" options={{ headerShown: true, title: 'Termos e Condições', headerTintColor: '#4CAF50', animation: 'slide_from_right' }} />
        <Stack.Screen name="institutional/settings" options={{ headerShown: true, title: 'Configurações', headerTintColor: '#4CAF50', animation: 'slide_from_right' }} />
      </Stack>
      <StatusBar style="auto" />
    </AuthProvider>
  );
}
