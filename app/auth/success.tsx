import { router } from 'expo-router';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

const G = '#22C55E', BG = '#F7F8FA', TEXT = '#111827', MUTED = '#6B7280';

export default function SuccessScreen() {
  return (
    <View style={s.screen}>
      <View style={s.iconCircle}>
        <Ionicons name="checkmark" size={44} color="#fff" />
      </View>
      <Text style={s.title}>Conta criada!</Text>
      <Text style={s.sub}>Seu plano nutricional personalizado está pronto. Vamos começar sua jornada?</Text>
      <TouchableOpacity style={s.btn} onPress={() => router.replace('/(tabs)')} activeOpacity={0.85}>
        <Text style={s.btnText}>Começar agora</Text>
        <Ionicons name="arrow-forward" size={18} color="#fff" />
      </TouchableOpacity>
    </View>
  );
}

const s = StyleSheet.create({
  screen:     { flex: 1, backgroundColor: BG, alignItems: 'center', justifyContent: 'center', padding: 36 },
  iconCircle: { width: 100, height: 100, borderRadius: 50, backgroundColor: G, alignItems: 'center', justifyContent: 'center', marginBottom: 28,
                shadowColor: G, shadowOffset: { width: 0, height: 8 }, shadowOpacity: 0.35, shadowRadius: 20, elevation: 12 },
  title:      { fontSize: 40, fontWeight: '800', color: TEXT, letterSpacing: -1, textAlign: 'center', marginBottom: 14 },
  sub:        { fontSize: 16, color: MUTED, textAlign: 'center', lineHeight: 24, marginBottom: 48 },
  btn:        { backgroundColor: G, borderRadius: 14, height: 54, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8, width: '100%' },
  btnText:    { fontSize: 16, fontWeight: '700', color: '#fff' },
});
