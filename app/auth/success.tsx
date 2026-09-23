import { Note, OnboardingShell, TextLink } from '@/components/onboarding-ui';
import { useAuth } from '@/context/auth';
import { usePremiumTheme } from '@/context/theme';
import { DEMO_MODE } from '@/services/demo';
import { Ionicons } from '@expo/vector-icons';
import { Redirect, router } from 'expo-router';
import { Text, View } from 'react-native';

export default function SuccessScreen() {
  const { user, vinculo } = useAuth();
  const { colors: C, isDark } = usePremiumTheme();
  if (!user) return <Redirect href="/auth/welcome" />;
  const explore = !vinculo && user.followupPreference === 'explore';
  const items = [
    ['Objetivo', user.goal], ['Seu momento', user.motivation], ['Atividade diária', user.activityLevel],
    ['Preferências', user.restrictions],
  ];
  return <OnboardingShell title={`Tudo pronto, ${user.name.split(' ')[0]}.`} subtitle="Seu perfil tem a sua cara. Vamos dar o próximo passo?"
    eyebrow="BEM-VINDO À NUTRIFYBE" onBack={() => router.replace('/(tabs)')}
    action={vinculo ? 'Ver meu acompanhamento' : explore ? 'Conhecer nutricionistas' : 'Começar agora'}
    onAction={() => router.replace(vinculo ? '/(tabs)/plan' : explore ? '/(tabs)/messages' : '/(tabs)')}
    footer={<TextLink label="Ver meu perfil" onPress={() => router.replace('/(tabs)/profile')} />}
  >
    <View style={{ width: 64, height: 64, borderRadius: 22, backgroundColor: C.primarySoft, justifyContent: 'center', alignItems: 'center', marginBottom: 8 }}><Ionicons name="checkmark" size={32} color={isDark ? C.primaryLight : C.primaryDark} /></View>
    <View style={{ backgroundColor: C.surface, borderColor: C.border, borderWidth: 1, borderRadius: 20, paddingHorizontal: 18 }}>
      {items.filter(([, value]) => !!value).map(([label, value]) => <View key={label} style={{ paddingVertical: 14, gap: 4 }}><Text style={{ fontSize: 11, color: C.textMuted }}>{label}</Text><Text style={{ fontSize: 15, fontWeight: '600', color: C.text }}>{value}</Text></View>)}
    </View>
    <Note>{vinculo ? `Você está conectado a ${vinculo.nutricionista.nome}${DEMO_MODE ? ' nesta demonstração' : ''}.` : 'Seu nutricionista pode entrar nessa jornada quando você quiser. O vínculo fica disponível no perfil e no plano.'}</Note>
    {DEMO_MODE && <Text style={{ fontSize: 12, color: C.textMuted, lineHeight: 19 }}>Perfil de demonstração, disponível durante esta sessão. Nenhuma conta foi criada no servidor.</Text>}
  </OnboardingShell>;
}
