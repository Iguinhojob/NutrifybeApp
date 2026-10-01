import { Note, OnboardingShell, TextLink } from '@/components/onboarding-ui';
import { useAuth } from '@/context/auth';
import { useOnboarding } from '@/context/onboarding';
import { usePremiumTheme } from '@/context/theme';
import { DEMO_MODE } from '@/services/demo';
import { Ionicons } from '@expo/vector-icons';
import { Redirect, router } from 'expo-router';
import { Text, View } from 'react-native';

export default function SuccessScreen() {
  const { user, vinculo } = useAuth();
  const { startEditing } = useOnboarding();
  const { colors: C, isDark } = usePremiumTheme();
  if (!user) return <Redirect href="/auth/welcome" />;
  const items = [
    ['Objetivo', user.goal], ['Seu momento', user.motivation], ['Atividade diária', user.activityLevel],
    ['Preferências', user.restrictions],
  ];
  const linkMessage = vinculo?.status === 'pendente'
    ? `Sua solicitação para ${vinculo.nutricionista.nome} foi enviada. Aguarde a confirmação do profissional.`
    : vinculo
      ? `Você está conectado a ${vinculo.nutricionista.nome}${DEMO_MODE ? ' nesta demonstração' : ''}.`
      : 'Seu nutricionista pode entrar nessa jornada quando você quiser. O vínculo fica disponível no perfil e no plano.';
  return <OnboardingShell title={`Tudo pronto, ${user.name.split(' ')[0]}.`} subtitle="Seu perfil tem a sua cara. Vamos dar o próximo passo?"
    eyebrow="BEM-VINDO À NUTRIFYBE" onBack={() => router.replace('/(tabs)')}
    action={vinculo ? 'Ver meu acompanhamento' : 'Começar agora'}
    onAction={() => router.replace(vinculo ? '/(tabs)/plan' : '/(tabs)')}
    footer={<TextLink label="Alterar respostas" onPress={() => { startEditing(user); router.replace('/auth/about-you'); }} />}
  >
    <View style={{ width: 64, height: 64, borderRadius: 22, backgroundColor: C.primarySoft, justifyContent: 'center', alignItems: 'center', marginBottom: 8 }}><Ionicons name="checkmark" size={32} color={isDark ? C.primaryLight : C.primaryDark} /></View>
    <View style={{ backgroundColor: C.surface, borderColor: C.border, borderWidth: 1, borderRadius: 20, paddingHorizontal: 18 }}>
      {items.filter(([, value]) => !!value).map(([label, value]) => <View key={label} style={{ paddingVertical: 14, gap: 4 }}><Text style={{ fontSize: 11, color: C.textMuted }}>{label}</Text><Text style={{ fontSize: 15, fontWeight: '600', color: C.text }}>{value}</Text></View>)}
    </View>
    <Note>{linkMessage}</Note>
    {DEMO_MODE && <Text style={{ fontSize: 12, color: C.textMuted, lineHeight: 19 }}>Perfil local salvo neste aparelho. Nenhuma conta foi criada no servidor.</Text>}
  </OnboardingShell>;
}
