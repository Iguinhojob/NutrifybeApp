import { usePremiumTheme } from '@/context/theme';
import { router } from 'expo-router';
import { Text, TouchableOpacity, View } from 'react-native';

export default function RequestScreen() {
  const { colors } = usePremiumTheme();
  return (
    <View style={{ flex: 1, backgroundColor: colors.bg, alignItems: 'center', justifyContent: 'center', padding: 24, gap: 16 }}>
      <Text style={{ fontSize: 18, fontWeight: '800', color: colors.text, textAlign: 'center' }}>Vincular nutricionista</Text>
      <Text style={{ fontSize: 14, color: colors.textMuted, textAlign: 'center', lineHeight: 21 }}>
        Para vincular um nutricionista, informe o CRN dele. Você pode fazer isso nas configurações do perfil.
      </Text>
      <TouchableOpacity
        style={{ backgroundColor: colors.primary, borderRadius: 14, paddingHorizontal: 24, paddingVertical: 14 }}
        onPress={() => router.push('/auth/nutri-code')}
      >
        <Text style={{ fontSize: 15, fontWeight: '700', color: '#fff' }}>Informar CRN</Text>
      </TouchableOpacity>
    </View>
  );
}
