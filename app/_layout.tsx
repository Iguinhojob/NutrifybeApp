import { AuthProvider } from '@/context/auth';
import { ThemeProvider, usePremiumTheme } from '@/context/theme';
import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';

function AppStack() {
  const { isDark, colors } = usePremiumTheme();
  return (
    <>
      <Stack screenOptions={{ headerShown: false, animation: 'fade', animationDuration: 200 }}>
        <Stack.Screen name="index" />
        <Stack.Screen name="auth/login" />
        <Stack.Screen name="auth/register" />
        <Stack.Screen name="auth/about-you" />
        <Stack.Screen name="auth/success" />
        <Stack.Screen name="auth/setup" />
        <Stack.Screen name="auth/recommendation" />
        <Stack.Screen name="(tabs)" />
        <Stack.Screen name="institutional/about"    options={{ headerShown: true, title: 'Sobre Nós',               headerTintColor: colors.primary, headerStyle: { backgroundColor: colors.surface }, headerTitleStyle: { color: colors.text }, animation: 'slide_from_right' }} />
        <Stack.Screen name="institutional/privacy"  options={{ headerShown: true, title: 'Política de Privacidade', headerTintColor: colors.primary, headerStyle: { backgroundColor: colors.surface }, headerTitleStyle: { color: colors.text }, animation: 'slide_from_right' }} />
        <Stack.Screen name="institutional/terms"    options={{ headerShown: true, title: 'Termos e Condições',      headerTintColor: colors.primary, headerStyle: { backgroundColor: colors.surface }, headerTitleStyle: { color: colors.text }, animation: 'slide_from_right' }} />
        <Stack.Screen name="institutional/settings"  options={{ headerShown: true, title: 'Configurações',           headerTintColor: colors.primary, headerStyle: { backgroundColor: colors.surface }, headerTitleStyle: { color: colors.text }, animation: 'slide_from_right' }} />
        <Stack.Screen name="nutri/request"             options={{ headerShown: true, title: 'Solicitar Vínculo',       headerTintColor: colors.primary, headerStyle: { backgroundColor: colors.surface }, headerTitleStyle: { color: colors.text }, animation: 'slide_from_right' }} />
        <Stack.Screen name="nutri/plan-history"        options={{ headerShown: true, title: 'Histórico do Plano',      headerTintColor: colors.primary, headerStyle: { backgroundColor: colors.surface }, headerTitleStyle: { color: colors.text }, animation: 'slide_from_right' }} />
        <Stack.Screen name="nutri/review"              options={{ headerShown: true, title: 'Avaliar Nutricionista',   headerTintColor: colors.primary, headerStyle: { backgroundColor: colors.surface }, headerTitleStyle: { color: colors.text }, animation: 'slide_from_right' }} />
        <Stack.Screen name="nutri/tracking"            options={{ headerShown: true, title: 'Registro de Medidas',     headerTintColor: colors.primary, headerStyle: { backgroundColor: colors.surface }, headerTitleStyle: { color: colors.text }, animation: 'slide_from_right' }} />
        <Stack.Screen name="notifications"             options={{ headerShown: true, title: 'Notificações',            headerTintColor: colors.primary, headerStyle: { backgroundColor: colors.surface }, headerTitleStyle: { color: colors.text }, animation: 'slide_from_right' }} />
      </Stack>
      <StatusBar style={isDark ? 'light' : 'dark'} />
    </>
  );
}

export default function RootLayout() {
  return (
    <ThemeProvider>
      <AuthProvider>
        <AppStack />
      </AuthProvider>
    </ThemeProvider>
  );
}
