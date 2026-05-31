import { useAuth } from '@/context/auth';
import { editorialPalette } from '@/constants/theme';
import { router } from 'expo-router';
import { useState } from 'react';
import {
  Alert, KeyboardAvoidingView, Platform, ScrollView,
  StyleSheet, Text, TextInput, TouchableOpacity, View,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';

const P = editorialPalette;

export default function LoginScreen() {
  const { login } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPass, setShowPass] = useState(false);

  const handleLogin = () => {
    if (!email || !password) return Alert.alert('Erro', 'Preencha todos os campos.');
    const ok = login(email, password);
    if (ok) router.replace('/(tabs)');
    else Alert.alert('Erro', 'Email ou senha inválidos.');
  };

  return (
    <KeyboardAvoidingView style={s.screen} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
      {/* Bolhas decorativas */}
      <View style={[s.bubble, { top: 60, left: -30, width: 120, height: 120, backgroundColor: P.lilac, opacity: 0.35 }]} />
      <View style={[s.bubble, { top: 140, right: -20, width: 80, height: 80, backgroundColor: P.pink, opacity: 0.3 }]} />
      <View style={[s.bubble, { bottom: 120, left: 20, width: 60, height: 60, backgroundColor: P.lilac, opacity: 0.25 }]} />

      <ScrollView contentContainerStyle={s.scroll} keyboardShouldPersistTaps="handled" bounces={false}>
        {/* Hero editorial */}
        <View style={s.hero}>
          <Text style={s.brand}>NUTRIFYBE.</Text>
          <Text style={s.heroTitle}>{'Bem-vindo\nde volta.'}</Text>
          <Text style={s.heroSub}>Seu progresso continua aqui.</Text>
        </View>

        {/* Card */}
        <View style={s.card}>
          <View style={s.field}>
            <Ionicons name="mail-outline" size={18} color={P.text} style={s.fieldIcon} />
            <TextInput
              style={s.input}
              placeholder="Email"
              value={email}
              onChangeText={setEmail}
              keyboardType="email-address"
              autoCapitalize="none"
              placeholderTextColor="#9c97a2"
            />
          </View>
          <View style={s.field}>
            <Ionicons name="lock-closed-outline" size={18} color={P.text} style={s.fieldIcon} />
            <TextInput
              style={[s.input, { flex: 1 }]}
              placeholder="Senha"
              value={password}
              onChangeText={setPassword}
              secureTextEntry={!showPass}
              placeholderTextColor="#9c97a2"
            />
            <TouchableOpacity onPress={() => setShowPass(v => !v)}>
              <Ionicons name={showPass ? 'eye-off-outline' : 'eye-outline'} size={18} color="#9c97a2" />
            </TouchableOpacity>
          </View>

          {/* Pill CTA duplo */}
          <TouchableOpacity style={s.ctaOuter} onPress={handleLogin} activeOpacity={0.85}>
            <View style={s.ctaInner}>
              <Text style={s.ctaText}>Entrar</Text>
              <Ionicons name="chevron-forward" size={16} color={P.text} />
              <Ionicons name="chevron-forward" size={16} color={P.text} style={{ marginLeft: -8 }} />
            </View>
          </TouchableOpacity>

          <TouchableOpacity onPress={() => router.push('/auth/about-you')} style={s.linkRow}>
            <Text style={s.link}>Não tem conta? <Text style={s.linkBold}>Cadastre-se</Text></Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const s = StyleSheet.create({
  screen: { flex: 1, backgroundColor: editorialPalette.mint },
  scroll: { flexGrow: 1, padding: 24, paddingTop: 68 },
  bubble: { position: 'absolute', borderRadius: 999 },
  hero: { marginBottom: 32 },
  brand: { fontSize: 13, fontWeight: '800', letterSpacing: 2, color: P.text, opacity: 0.5, marginBottom: 12 },
  heroTitle: { fontSize: 48, fontWeight: '900', color: P.text, letterSpacing: -2, lineHeight: 52 },
  heroSub: { fontSize: 16, color: P.text, opacity: 0.6, marginTop: 8, fontWeight: '500' },
  card: {
    backgroundColor: 'rgba(255,255,255,0.82)',
    borderRadius: 28,
    padding: 24,
    gap: 14,
    borderWidth: 1,
    borderColor: P.border,
  },
  field: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fcfbfd',
    borderRadius: 14,
    paddingHorizontal: 14,
    paddingVertical: 12,
    borderWidth: 1,
    borderColor: P.border,
    gap: 10,
  },
  fieldIcon: { opacity: 0.6 },
  input: { flex: 1, fontSize: 15, color: P.text, fontWeight: '500' },
  ctaOuter: {
    backgroundColor: P.text,
    borderRadius: 999,
    padding: 4,
    marginTop: 4,
  },
  ctaInner: {
    backgroundColor: editorialPalette.mint,
    borderRadius: 999,
    paddingVertical: 14,
    paddingHorizontal: 24,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 4,
  },
  ctaText: { fontSize: 16, fontWeight: '800', color: P.text },
  linkRow: { alignItems: 'center' },
  link: { fontSize: 14, color: P.text, opacity: 0.6 },
  linkBold: { fontWeight: '800', opacity: 1, color: P.text },
});
