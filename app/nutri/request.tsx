import { AppButton, InlineNotice } from '@/components/ui-kit';
import { useFollowUp } from '@/components/follow-up-status';
import { usePremiumTheme } from '@/context/theme';
import { Redirect, router } from 'expo-router';
import { ScrollView, Text } from 'react-native';

export default function RequestScreen() {
  const { colors } = usePremiumTheme();
  const { state } = useFollowUp();
  if (state !== 'solo') return <Redirect href="/(tabs)/plan" />;
  return (
    <ScrollView style={{ flex: 1, backgroundColor: colors.bg }} contentContainerStyle={{ padding: 24, gap: 16, width: '100%', maxWidth: 560, alignSelf: 'center' }}>
      <Text accessibilityRole="header" style={{ fontSize: 22, fontWeight: '900', color: colors.text }}>Acompanhamento com nutricionista</Text>
      <Text style={{ fontSize: 15, color: colors.textMuted, lineHeight: 22 }}>
        Escolha um profissional disponível ou informe o ID de alguém que você já conhece. Você envia uma solicitação e o nutricionista decide se aceita.
      </Text>
      <AppButton size="lg" icon="search-outline" label="Ver nutricionistas disponíveis" onPress={() => router.push('/nutri/directory')} />
      <AppButton size="lg" variant="secondary" icon="key-outline" label="Tenho o ID do nutricionista" onPress={() => router.push('/auth/nutri-code')} />
      <InlineNotice tone="info" title="Resposta em até 24 horas">
        Após o envio, você pode continuar usando o app de modo autônomo. O pedido fica reservado a um profissional por vez e pode ser cancelado enquanto aguarda. Depois do aceite, ele passa a ver seu diário, água e medidas, além de enviar planos e conversar com você.
      </InlineNotice>
    </ScrollView>
  );
}
