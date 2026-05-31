import { useAuth } from '@/context/auth';
import { editorialPalette } from '@/constants/theme';
import { router, useLocalSearchParams } from 'expo-router';
import { useState } from 'react';
import {
  Alert, KeyboardAvoidingView, Platform, ScrollView,
  StyleSheet, Text, TextInput, TouchableOpacity, View,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';

const P = editorialPalette;
const GOALS = ['Perder peso', 'Ganhar massa', 'Manter peso', 'Melhorar saúde'];

export default function RegisterScreen() {
  const params = useLocalSearchParams<{ name: string; email: string; weight: string; height: string }>();
  const { register } = useAuth();
  const [password, setPassword] = useState('');
  const [confirm, setConfirm] = useState('');
  const [goal, setGoal] = useState(GOALS[0]);
  const [showPass, setShowPass] = useState(false);

  const handleRegister = () => {
    if (!password || password.length < 6) return Alert.alert('Erro', 'Senha deve ter ao menos 6 caracteres.');
    if (password !== confirm) return Alert.alert('Erro', 'Senhas não coincidem.');
    register({ name: params.name, email: params.email, weight: params.weight, height: params.height, goal, password });
    router.replace('/auth/success');
  };

  return (
    <KeyboardAvoidingView style={s.screen} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
      <View style={[s.bubble, { top: 40, left: -30, width: 110, height: 110, backgroundColor: P.lilac, opacity: 0.3 }]} />
      <View style={[s.bubble, { bottom: 160, right: -20, width: 80, height: 80, backgroundColor: P.pink, opacity: 0.25 }]} />

      <ScrollView contentContainerStyle={s.scroll} keyboardShouldPersistTaps="handled" bounces={false}>
        <View style={s.hero}>
          <Text style={s.brand}>NUTRIFYBE.</Text>
          <Text style={s.heroTitle}>{`Olá,\n${params.name?.split(' ')[0]}!`}</Text>
          <Text style={s.heroSub}>Passo 2 de 2 · Quase lá!</Text>
        </View>

        <View style={s.card}>
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

          <View style={s.field}>
            <Ionicons name="shield-checkmark-outline" size={18} color={P.text} style={s.fieldIcon} />
            <TextInput
              style={s.input}
              placeholder="Confirmar senha"
              value={confirm}
              onChangeText={setConfirm}
              secureTextEntry
              placeholderTextColor="#9c97a2"
            />
          </View>

          <Text style={s.label}>Qual é seu objetivo?</Text>
          <View style={s.goals}>
            {GOALS.map(g => (
              <TouchableOpacity
                key={g}
                style={[s.chip, goal === g && s.chipActive]}
                onPress={() => setGoal(g)}
              >
                <Text style={[s.chipText, goal === g && s.chipTextActive]}>{g}</Text>
              </TouchableOpacity>
            ))}
          </View>

          <TouchableOpacity style={s.ctaOuter} onPress={handleRegister} activeOpacity={0.85}>
            <View style={s.ctaInner}>
              <Text style={s.ctaText}>Criar conta</Text>
              <Ionicons name="chevron-forward" size={16} color={P.text} />
              <Ionicons name="chevron-forward" size={16} color={P.text} style={{ marginLeft: -8 }} />
            </View>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const s = StyleSheet.create({
  screen: { flex: 1, backgroundColor: P.mint },
  scroll: { flexGrow: 1, padding: 24, paddingTop: 68 },
  bubble: { position: 'absolute', borderRadius: 999 },
  hero: { marginBottom: 32 },
  brand: { fontSize: 13, fontWeight: '800', letterSpacing: 2, color: P.text, opacity: 0.5, marginBottom: 12 },
  heroTitle: { fontSize: 48, fontWeight: '900', color: P.text, letterSpacing: -2, lineHeight: 52 },
  heroSub: { fontSize: 14, color: P.text, opacity: 0.5, marginTop: 8, fontWeight: '600' },
  card: { backgroundColor: 'rgba(255,255,255,0.82)', borderRadius: 28, padding: 24, gap: 14, borderWidth: 1, borderColor: P.border },
  field: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#fcfbfd', borderRadius: 14, paddingHorizontal: 14, paddingVertical: 12, borderWidth: 1, borderColor: P.border, gap: 10 },
  fieldIcon: { opacity: 0.6 },
  input: { flex: 1, fontSize: 15, color: P.text, fontWeight: '500' },
  label: { fontSize: 13, fontWeight: '700', color: P.text, opacity: 0.7 },
  goals: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  chip: { paddingHorizontal: 14, paddingVertical: 8, borderRadius: 999, borderWidth: 1, borderColor: P.border, backgroundColor: '#fcfbfd' },
  chipActive: { backgroundColor: P.text, borderColor: P.text },
  chipText: { fontSize: 13, color: P.text, fontWeight: '600', opacity: 0.7 },
  chipTextActive: { color: P.mint, opacity: 1 },
  ctaOuter: { backgroundColor: P.text, borderRadius: 999, padding: 4, marginTop: 4 },
  ctaInner: { backgroundColor: P.mint, borderRadius: 999, paddingVertical: 14, paddingHorizontal: 24, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 4 },
  ctaText: { fontSize: 16, fontWeight: '800', color: P.text },
});
