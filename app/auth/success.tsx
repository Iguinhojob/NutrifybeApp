import { router } from 'expo-router';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { D, GRAD } from '@/constants/darkTheme';

export default function SuccessScreen() {
  return (
    <View style={s.screen}>
      <View style={[s.glow, s.glowCyan]} />
      <View style={[s.glow, s.glowPurple]} />
      <LinearGradient colors={GRAD} start={{x:0,y:0}} end={{x:1,y:1}} style={s.iconCircle}>
        <Ionicons name="checkmark" size={48} color={D.white} />
      </LinearGradient>
      <Text style={s.title}>{'Conta\ncriada!'}</Text>
      <Text style={s.sub}>Seu plano nutricional personalizado está pronto.</Text>
      <LinearGradient colors={GRAD} start={{x:0,y:0}} end={{x:1,y:0}} style={s.btn}>
        <TouchableOpacity onPress={() => router.replace('/(tabs)')} activeOpacity={0.85} style={s.btnInner}>
          <Text style={s.btnText}>Começar agora</Text>
          <Ionicons name="arrow-forward" size={18} color={D.white} />
        </TouchableOpacity>
      </LinearGradient>
    </View>
  );
}

const s = StyleSheet.create({
  screen:     { flex: 1, backgroundColor: D.bg, alignItems: 'center', justifyContent: 'center', padding: 36 },
  glow:       { position: 'absolute', borderRadius: 999, opacity: 0.18 },
  glowCyan:   { width: 280, height: 280, backgroundColor: D.cyan,   top: -80,  left: -80 },
  glowPurple: { width: 240, height: 240, backgroundColor: D.purple, bottom: 40, right: -60 },
  iconCircle: { width: 100, height: 100, borderRadius: 50, alignItems: 'center', justifyContent: 'center', marginBottom: 28 },
  title:      { fontSize: 52, fontWeight: '900', color: D.text, letterSpacing: -2, textAlign: 'center', lineHeight: 56, marginBottom: 14 },
  sub:        { fontSize: 16, color: D.textMuted, textAlign: 'center', fontWeight: '500', marginBottom: 48, lineHeight: 24 },
  btn:        { borderRadius: 14, overflow: 'hidden', width: '100%' },
  btnInner:   { paddingVertical: 16, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8 },
  btnText:    { fontSize: 16, fontWeight: '800', color: D.white },
});
