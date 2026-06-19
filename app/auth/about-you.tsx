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
const GOALS = ['Perder peso', 'Ganhar massa', 'Manter peso', 'Melhorar saúde'];

export default function AboutYouScreen() {
  const { register } = useAuth();
  const [form, setForm] = useState({ name: '', email: '', weight: '', height: '', password: '' });
  const [goal, setGoal] = useState(GOALS[0]);
  const [showPass, setShowPass] = useState(false);
  const set = (key: string) => (val: string) => setForm(f => ({ ...f, [key]: val }));

  const handleCreate = () => {
    if (!form.name || !form.email || !form.weight || !form.height || !form.password)
      return Alert.alert('Erro', 'Preencha todos os campos.');
    if (form.password.length < 6)
      return Alert.alert('Erro', 'Senha deve ter ao menos 6 caracteres.');
    register({ ...form, goal });
    router.replace('/auth/success');
  };

  return (
    <KeyboardAvoidingView style={s.screen} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
      <View style={[s.bubble, { top: 50, right: -40, width: 140, height: 140, backgroundColor: P.pink, opacity: 0.3 }]} />
      <View style={[s.bubble, { bottom: 200, left: -20, width: 90, height: 90, backgroundColor: P.lilac, opacity: 0.3 }]} />

      <ScrollView contentContainerStyle={s.scroll} keyboardShouldPersistTaps="handled" bounces={false}>
        <View style={s.hero}>
          <Text style={s.brand}>NUTRIFYBE.</Text>
          <Text style={s.heroTitle}>{'Crie sua\nconta.'}</Text>
          <Text style={s.heroSub}>Preencha seus dados para começar.</Text>
        </View>

        <View style={s.card}>
          {/* Dados pessoais */}
          <Text style={s.sectionLabel}>DADOS PESSOAIS</Text>

          {[
            { key: 'name', label: 'Nome completo', icon: 'person-outline' as const, keyboard: 'default' as const, cap: 'words' as const },
            { key: 'email', label: 'Email', icon: 'mail-outline' as const, keyboard: 'email-address' as const, cap: 'none' as const },
          ].map(({ key, label, icon, keyboard, cap }) => (
            <View key={key} style={s.field}>
              <Ionicons name={icon} size={18} color={P.text} style={s.fieldIcon} />
              <TextInput
                style={s.input}
                placeholder={label}
                value={form[key as keyof typeof form]}
                onChangeText={set(key)}
                keyboardType={keyboard}
                autoCapitalize={cap}
                placeholderTextColor="#9c97a2"
              />
            </View>
          ))}

          <View style={s.row}>
            {[
              { key: 'weight', label: 'Peso (kg)', icon: 'barbell-outline' as const },
              { key: 'height', label: 'Altura (cm)', icon: 'resize-outline' as const },
            ].map(({ key, label, icon }) => (
              <View key={key} style={[s.field, s.fieldHalf]}>
                <Ionicons name={icon} size={16} color={P.text} style={s.fieldIcon} />
                <TextInput
                  style={s.input}
                  placeholder={label}
                  value={form[key as keyof typeof form]}
                  onChangeText={set(key)}
                  keyboardType="numeric"
                  placeholderTextColor="#9c97a2"
                />
              </View>
            ))}
          </View>

          {/* Objetivo */}
          <Text style={s.sectionLabel}>OBJETIVO</Text>
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

          {/* Senha */}
          <Text style={s.sectionLabel}>ACESSO</Text>
          <View style={s.field}>
            <Ionicons name="lock-closed-outline" size={18} color={P.text} style={s.fieldIcon} />
            <TextInput
              style={[s.input, { flex: 1 }]}
              placeholder="Senha (mín. 6 caracteres)"
              value={form.password}
              onChangeText={set('password')}
              secureTextEntry={!showPass}
              placeholderTextColor="#9c97a2"
            />
            <TouchableOpacity onPress={() => setShowPass(v => !v)}>
              <Ionicons name={showPass ? 'eye-off-outline' : 'eye-outline'} size={18} color="#9c97a2" />
            </TouchableOpacity>
          </View>

          <TouchableOpacity style={s.ctaOuter} onPress={handleCreate} activeOpacity={0.85}>
            <View style={s.ctaInner}>
              <Text style={s.ctaText}>Criar conta</Text>
              <Ionicons name="chevron-forward" size={16} color={P.text} />
              <Ionicons name="chevron-forward" size={16} color={P.text} style={{ marginLeft: -8 }} />
            </View>
          </TouchableOpacity>

          <TouchableOpacity onPress={() => router.back()} style={s.linkRow}>
            <Text style={s.link}>Já tenho conta</Text>
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
  heroTitle: { fontSize: 44, fontWeight: '900', color: P.text, letterSpacing: -2, lineHeight: 48 },
  heroSub: { fontSize: 14, color: P.text, opacity: 0.5, marginTop: 8, fontWeight: '600' },
  card: { backgroundColor: 'rgba(255,255,255,0.82)', borderRadius: 28, padding: 24, gap: 12, borderWidth: 1, borderColor: P.border },
  sectionLabel: { fontSize: 11, fontWeight: '800', letterSpacing: 1.5, color: P.text, opacity: 0.4, marginTop: 4 },
  row: { flexDirection: 'row', gap: 10 },
  field: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#fcfbfd', borderRadius: 14, paddingHorizontal: 14, paddingVertical: 12, borderWidth: 1, borderColor: P.border, gap: 10 },
  fieldHalf: { flex: 1 },
  fieldIcon: { opacity: 0.6 },
  input: { flex: 1, fontSize: 15, color: P.text, fontWeight: '500' },
  goals: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  chip: { paddingHorizontal: 14, paddingVertical: 8, borderRadius: 999, borderWidth: 1, borderColor: P.border, backgroundColor: '#fcfbfd' },
  chipActive: { backgroundColor: P.text, borderColor: P.text },
  chipText: { fontSize: 13, color: P.text, fontWeight: '600', opacity: 0.7 },
  chipTextActive: { color: P.mint, opacity: 1 },
  ctaOuter: { backgroundColor: P.text, borderRadius: 999, padding: 4, marginTop: 4 },
  ctaInner: { backgroundColor: P.mint, borderRadius: 999, paddingVertical: 14, paddingHorizontal: 24, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 4 },
  ctaText: { fontSize: 16, fontWeight: '800', color: P.text },
  linkRow: { alignItems: 'center' },
  link: { fontSize: 14, color: P.text, opacity: 0.6, fontWeight: '600' },
});
