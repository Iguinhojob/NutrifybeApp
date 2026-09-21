import { useAuth } from '@/context/auth';
import { usePremiumTheme } from '@/context/theme';
import { Ionicons } from '@expo/vector-icons';
import { ScrollView, Text, View } from 'react-native';

export default function PlanHistoryScreen() {
  const { user } = useAuth();
  const { colors } = usePremiumTheme();

  const prescricao = user?.prescricaoSemanal;

  return (
    <ScrollView style={{ flex: 1, backgroundColor: colors.bg }} contentContainerStyle={{ padding: 20, gap: 14 }}>
      <Text style={{ fontSize: 14, color: colors.textMuted, marginBottom: 4 }}>
        Prescrição semanal definida pelo seu nutricionista.
      </Text>

      {!prescricao ? (
        <View style={{ alignItems: 'center', paddingVertical: 60, gap: 12 }}>
          <Ionicons name="document-text-outline" size={52} color={colors.border} />
          <Text style={{ fontSize: 16, fontWeight: '700', color: colors.text }}>Nenhum plano ainda</Text>
          <Text style={{ fontSize: 14, color: colors.textMuted, textAlign: 'center' }}>
            Seu nutricionista ainda não enviou uma prescrição.
          </Text>
        </View>
      ) : (
        <View style={{ backgroundColor: colors.surface, borderRadius: 20, padding: 18, borderWidth: 1, borderColor: colors.border, gap: 10 }}>
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
            <View style={{ borderRadius: 999, paddingHorizontal: 10, paddingVertical: 4, backgroundColor: colors.primarySoft }}>
              <Text style={{ fontSize: 12, fontWeight: '700', color: colors.primary }}>👩⚕️ Nutricionista</Text>
            </View>
            <View style={{ borderRadius: 999, paddingHorizontal: 8, paddingVertical: 4, backgroundColor: colors.primary }}>
              <Text style={{ fontSize: 10, fontWeight: '700', color: '#fff' }}>Atual</Text>
            </View>
          </View>
          {prescricao.split('\n').map((linha, i) => (
            <View key={i} style={{ flexDirection: 'row', gap: 8, alignItems: 'flex-start' }}>
              <View style={{ width: 6, height: 6, borderRadius: 3, backgroundColor: colors.primary, marginTop: 7 }} />
              <Text style={{ fontSize: 14, color: colors.textMuted, flex: 1, lineHeight: 21 }}>{linha}</Text>
            </View>
          ))}
        </View>
      )}

      <View style={{ height: 40 }} />
    </ScrollView>
  );
}
