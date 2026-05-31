import { editorialPalette } from '@/constants/theme';
import { router } from 'expo-router';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

const P = editorialPalette;

export default function SuccessScreen() {
  return (
    <View style={s.screen}>
      <View style={[s.bubble, { top: 60, right: -30, width: 130, height: 130, backgroundColor: P.lilac, opacity: 0.3 }]} />
      <View style={[s.bubble, { bottom: 100, left: -20, width: 90, height: 90, backgroundColor: P.pink, opacity: 0.25 }]} />

      <View style={s.iconWrap}>
        <Ionicons name="checkmark-circle" size={80} color={P.text} />
      </View>
      <Text style={s.title}>{'Conta\ncriada!'}</Text>
      <Text style={s.sub}>Agora vamos personalizar sua experiência.</Text>

      <TouchableOpacity style={s.ctaOuter} onPress={() => router.replace('/auth/setup')} activeOpacity={0.85}>
        <View style={s.ctaInner}>
          <Text style={s.ctaText}>Configurar perfil</Text>
          <Ionicons name="chevron-forward" size={16} color={P.text} />
          <Ionicons name="chevron-forward" size={16} color={P.text} style={{ marginLeft: -8 }} />
        </View>
      </TouchableOpacity>
    </View>
  );
}

const s = StyleSheet.create({
  screen: { flex: 1, backgroundColor: P.mint, alignItems: 'center', justifyContent: 'center', padding: 32 },
  bubble: { position: 'absolute', borderRadius: 999 },
  iconWrap: { marginBottom: 24 },
  title: { fontSize: 56, fontWeight: '900', color: P.text, letterSpacing: -2.4, textAlign: 'center', lineHeight: 58, marginBottom: 12 },
  sub: { fontSize: 16, color: P.text, opacity: 0.6, textAlign: 'center', fontWeight: '500', marginBottom: 48 },
  ctaOuter: { backgroundColor: P.text, borderRadius: 999, padding: 4, width: '100%' },
  ctaInner: { backgroundColor: P.mint, borderRadius: 999, paddingVertical: 16, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 4 },
  ctaText: { fontSize: 16, fontWeight: '800', color: P.text },
});
