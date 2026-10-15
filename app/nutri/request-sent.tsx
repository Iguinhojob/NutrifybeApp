import { AppButton, InlineNotice } from '@/components/ui-kit';
import { useFollowUp } from '@/components/follow-up-status';
import { useAuth } from '@/context/auth';
import { usePremiumTheme } from '@/context/theme';
import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import { Alert, ScrollView, Text, View } from 'react-native';

export default function RequestSentScreen() {
  const { colors: C } = usePremiumTheme();
  const { state, nutricionista } = useFollowUp();
  const { cancelarSolicitacaoVinculo } = useAuth();
  const cancel = () => Alert.alert('Cancelar solicitação?', 'Tem certeza de que deseja cancelar o pedido? Você poderá continuar usando o app de modo autônomo e escolher outro profissional.', [
    { text: 'Manter solicitação', style: 'cancel' },
    { text: 'Cancelar pedido', style: 'destructive', onPress: async () => {
      const result = await cancelarSolicitacaoVinculo();
      if (result.success) router.replace('/(tabs)/plan');
      else Alert.alert('Não foi possível cancelar', result.error);
    } },
  ]);
  return <ScrollView contentContainerStyle={{ flexGrow: 1, justifyContent: 'center', padding: 24, gap: 18, backgroundColor: C.bg }}>
    <View style={{ width: 64, height: 64, borderRadius: 22, alignItems: 'center', justifyContent: 'center', backgroundColor: C.primarySoft }}><Ionicons name="time-outline" size={31} color={C.primaryText} /></View>
    <Text accessibilityRole="header" style={{ color: C.text, fontSize: 27, fontWeight: '900' }}>Solicitação enviada</Text>
    <Text style={{ color: C.textMuted, fontSize: 15, lineHeight: 23 }}>{nutricionista ? `${nutricionista.nome} poderá aceitar sua solicitação em até 24 horas.` : 'O nutricionista poderá aceitar sua solicitação em até 24 horas.'}</Text>
    <InlineNotice tone="info" title="Enquanto isso, use o app de modo autônomo">Você pode registrar refeições, água e medidas normalmente. O pedido fica reservado a este profissional até ser aceito, recusado ou cancelado.</InlineNotice>
    {state === 'pendente' && <AppButton variant="secondary" label="Cancelar solicitação" icon="close-circle-outline" onPress={cancel} />}
    <AppButton label="Continuar no app" icon="arrow-forward" onPress={() => router.replace('/(tabs)')} />
  </ScrollView>;
}
