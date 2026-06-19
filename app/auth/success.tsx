import { router } from 'expo-router';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';

export default function SuccessScreen() {
  return (
    <View style={s.screen}>
      <Text style={s.emoji}>🎉</Text>
      <Text style={s.title}>{'Conta\ncriada!'}</Text>
      <Text style={s.sub}>Seu plano nutricional personalizado está pronto.</Text>

      <TouchableOpacity style={s.btn} onPress={() => router.replace('/(tabs)')} activeOpacity={0.85}>
        <Text style={s.btnText}>Começar agora</Text>
      </TouchableOpacity>
    </View>
  );
}

const s = StyleSheet.create({
  screen: { flex: 1, backgroundColor: '#F6FBF7', alignItems: 'center', justifyContent: 'center', padding: 36 },
  emoji: { fontSize: 72, marginBottom: 16 },
  title: { fontSize: 52, fontWeight: '900', color: '#1B4332', letterSpacing: -2, textAlign: 'center', lineHeight: 56, marginBottom: 14 },
  sub: { fontSize: 16, color: '#74A88A', textAlign: 'center', fontWeight: '500', marginBottom: 48, lineHeight: 24 },
  btn: {
    backgroundColor: '#52B788', borderRadius: 14,
    paddingVertical: 16, paddingHorizontal: 48,
    width: '100%', alignItems: 'center',
  },
  btnText: { fontSize: 16, fontWeight: '800', color: '#fff' },
});
