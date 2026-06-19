import { editorialPalette } from '@/constants/theme';
import { router } from 'expo-router';
import { useState } from 'react';
import {
  Alert, KeyboardAvoidingView, Platform, ScrollView,
  StyleSheet, Text, TextInput, TouchableOpacity, View,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';

export default function AboutYouScreen() {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPass, setShowPass] = useState(false);

  const next = () => {
    if (!name || !email || !password)
      return Alert.alert('Erro', 'Preencha todos os campos.');
    if (password.length < 6)
      return Alert.alert('Erro', 'Senha deve ter ao menos 6 caracteres.');
    router.push({ pathname: '/auth/setup', params: { name, email, password } });
  };

  return (
    <KeyboardAvoidingView style={s.screen} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
      <View style={s.top}>
        <TouchableOpacity style={s.back} onPress={() => router.back()}>
          <Ionicons name="arrow-back" size={22} color="#fff" />
        </TouchableOpacity>
        <View style={s.steps}>
          <View style={[s.step, s.stepActive]} />
          <View style={s.step} />
        </View>
        <Text style={s.stepLabel}>Passo 1 de 2</Text>
        <Text style={s.heroTitle}>{'Crie sua\nconta.'}</Text>
        <Text style={s.heroSub}>Seus dados de acesso.</Text>
      </View>

      <View style={s.card}>
        <View style={s.field}>
          <Ionicons name="person-outline" size={18} color="#7C5CBF" />
          <TextInput
            style={s.input}
            placeholder="Nome completo"
            value={name}
            onChangeText={setName}
            autoCapitalize="words"
            placeholderTextColor="#aaa"
          />
        </View>

        <View style={s.field}>
          <Ionicons name="mail-outline" size={18} color="#7C5CBF" />
          <TextInput
            style={s.input}
            placeholder="Email"
            value={email}
            onChangeText={setEmail}
            keyboardType="email-address"
            autoCapitalize="none"
            placeholderTextColor="#aaa"
          />
        </View>

        <View style={s.field}>
          <Ionicons name="lock-closed-outline" size={18} color="#7C5CBF" />
          <TextInput
            style={[s.input, { flex: 1 }]}
            placeholder="Senha (mín. 6 caracteres)"
            value={password}
            onChangeText={setPassword}
            secureTextEntry={!showPass}
            placeholderTextColor="#aaa"
          />
          <TouchableOpacity onPress={() => setShowPass(v => !v)}>
            <Ionicons name={showPass ? 'eye-off-outline' : 'eye-outline'} size={18} color="#aaa" />
          </TouchableOpacity>
        </View>

        <TouchableOpacity style={s.btn} onPress={next} activeOpacity={0.85}>
          <Text style={s.btnText}>Continuar</Text>
          <Ionicons name="arrow-forward" size={18} color="#fff" />
        </TouchableOpacity>

        <TouchableOpacity onPress={() => router.back()} style={s.linkRow}>
          <Text style={s.link}>Já tenho conta</Text>
        </TouchableOpacity>
      </View>
    </KeyboardAvoidingView>
  );
}

const s = StyleSheet.create({
  screen: { flex: 1, backgroundColor: '#1A1035' },
  top: { flex: 1, padding: 28, paddingTop: 56, justifyContent: 'flex-end', gap: 8 },
  back: { position: 'absolute', top: 56, left: 24 },
  steps: { flexDirection: 'row', gap: 6, marginBottom: 4 },
  step: { width: 24, height: 4, borderRadius: 2, backgroundColor: 'rgba(255,255,255,0.2)' },
  stepActive: { backgroundColor: '#D4F53C', width: 40 },
  stepLabel: { fontSize: 12, color: 'rgba(255,255,255,0.4)', fontWeight: '700', letterSpacing: 1 },
  heroTitle: { fontSize: 40, fontWeight: '900', color: '#fff', letterSpacing: -1.5, lineHeight: 44 },
  heroSub: { fontSize: 14, color: 'rgba(255,255,255,0.5)', fontWeight: '500' },
  card: {
    backgroundColor: '#fff',
    borderTopLeftRadius: 32, borderTopRightRadius: 32,
    padding: 28, paddingBottom: 48, gap: 14,
  },
  field: {
    flexDirection: 'row', alignItems: 'center', gap: 10,
    backgroundColor: '#F4F1F9',
    borderRadius: 14, paddingHorizontal: 14, paddingVertical: 14,
  },
  input: { flex: 1, fontSize: 15, color: '#1A1035', fontWeight: '500' },
  btn: {
    backgroundColor: '#7C5CBF', borderRadius: 14,
    paddingVertical: 16, flexDirection: 'row',
    alignItems: 'center', justifyContent: 'center', gap: 8, marginTop: 4,
  },
  btnText: { fontSize: 16, fontWeight: '800', color: '#fff' },
  linkRow: { alignItems: 'center' },
  link: { fontSize: 14, color: '#aaa', fontWeight: '600' },
});
