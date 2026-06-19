import { router } from 'expo-router';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

export default function SuccessScreen() {
  return (
    <View style={s.screen}>
      <View style={s.iconWrap}>
        <Ionicons name="checkmark-circle" size={72} color="#D4F53C" />
      </View>
      <Text style={s.title}>{'Tudo\npronto!'}</Text>
      <Text style={s.sub}>Seu plano nutricional foi criado. Bora começar?</Text>

      <TouchableOpacity style={s.btn} onPress={() => router.replace('/(tabs)')} activeOpacity={0.85}>
        <Text style={s.btnText}>Ir para o app</Text>
        <Ionicons name="arrow-forward" size={18} color="#1A1035" />
      </TouchableOpacity>
    </View>
  );
}

const s = StyleSheet.create({
  screen: { flex: 1, backgroundColor: '#1A1035', alignItems: 'center', justifyContent: 'center', padding: 32 },
  iconWrap: { marginBottom: 24 },
  title: { fontSize: 56, fontWeight: '900', color: '#fff', letterSpacing: -2.5, textAlign: 'center', lineHeight: 58, marginBottom: 12 },
  sub: { fontSize: 16, color: 'rgba(255,255,255,0.5)', textAlign: 'center', fontWeight: '500', marginBottom: 48 },
  btn: {
    backgroundColor: '#D4F53C', borderRadius: 14, width: '100%',
    paddingVertical: 16, flexDirection: 'row',
    alignItems: 'center', justifyContent: 'center', gap: 8,
  },
  btnText: { fontSize: 16, fontWeight: '800', color: '#1A1035' },
});
