import { usePremiumTheme } from '@/context/theme';
import { useAuth } from '@/context/auth';
import { Ionicons } from '@expo/vector-icons';
import { Redirect, router } from 'expo-router';
import { Text, TouchableOpacity, View } from 'react-native';

export default function RequestScreen() {
  const { colors } = usePremiumTheme();
  const { user } = useAuth();
  if (user?.nutricionistaId) return <Redirect href="/(tabs)/plan" />;
  return (
    <View style={{ flex: 1, backgroundColor: colors.bg, alignItems: 'center', justifyContent: 'center', padding: 24, gap: 16 }}>
      <Text style={{ fontSize: 18, fontWeight: '800', color: colors.text, textAlign: 'center' }}>Vincular nutricionista</Text>
      <Text style={{ fontSize: 14, color: colors.textMuted, textAlign: 'center', lineHeight: 21 }}>
        Conecte-se com alguém que você já conhece ou explore os profissionais disponíveis.
      </Text>
      <TouchableOpacity
        style={{ width: '100%', backgroundColor: colors.primary, borderRadius: 14, paddingHorizontal: 20, paddingVertical: 16, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 9 }}
        onPress={() => router.push('/auth/nutri-code')}
      >
        <Ionicons name="key-outline" size={19} color="#fff" />
        <Text style={{ fontSize: 15, fontWeight: '700', color: '#fff' }}>Tenho o ID do nutricionista</Text>
      </TouchableOpacity>
      <TouchableOpacity
        style={{ width: '100%', backgroundColor: colors.surface, borderColor: colors.border, borderWidth: 1, borderRadius: 14, paddingHorizontal: 20, paddingVertical: 16, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 9 }}
        onPress={() => router.push('/nutri/directory')}
      >
        <Ionicons name="search-outline" size={19} color={colors.primary} />
        <Text style={{ fontSize: 15, fontWeight: '700', color: colors.primary }}>Ver nutricionistas disponíveis</Text>
      </TouchableOpacity>
    </View>
  );
}
