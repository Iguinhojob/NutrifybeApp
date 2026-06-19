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
      <ScrollView contentContainerStyle={s.scroll} keyboardShouldPersistTaps="handled" bounces={false}>

        {/* Header */}
        <TouchableOpacity style={s.backBtn} onPress={() => router.back()}>
          <Ionicons name="arrow-back-outline" size={22} color="#1B4332" />
        </TouchableOpacity>

        {/* Progresso */}
        <View style={s.progressRow}>
          <View style={[s.progressBar, s.progressActive]} />
          <View style={s.progressBar} />
        </View>
        <Text style={s.progressLabel}>Passo 1 de 2</Text>

        {/* Título */}
        <View style={s.titleArea}>
          <Text style={s.emoji}>👋</Text>
          <Text style={s.title}>Olá! Vamos{'\n'}começar.</Text>
          <Text style={s.subtitle}>Crie sua conta em menos de 1 minuto.</Text>
        </View>

        {/* Campos */}
        <View style={s.form}>
          <View style={s.field}>
            <Ionicons name="person-outline" size={20} color="#52B788" />
            <TextInput
              style={s.input}
              placeholder="Seu nome completo"
              value={name}
              onChangeText={setName}
              autoCapitalize="words"
              placeholderTextColor="#B0B8B4"
            />
          </View>

          <View style={s.field}>
            <Ionicons name="mail-outline" size={20} color="#52B788" />
            <TextInput
              style={s.input}
              placeholder="Seu email"
              value={email}
              onChangeText={setEmail}
              keyboardType="email-address"
              autoCapitalize="none"
              placeholderTextColor="#B0B8B4"
            />
          </View>

          <View style={s.field}>
            <Ionicons name="lock-closed-outline" size={20} color="#52B788" />
            <TextInput
              style={[s.input, { flex: 1 }]}
              placeholder="Senha (mín. 6 caracteres)"
              value={password}
              onChangeText={setPassword}
              secureTextEntry={!showPass}
              placeholderTextColor="#B0B8B4"
            />
            <TouchableOpacity onPress={() => setShowPass(v => !v)}>
              <Ionicons name={showPass ? 'eye-off-outline' : 'eye-outline'} size={20} color="#B0B8B4" />
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

      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const s = StyleSheet.create({
  screen: { flex: 1, backgroundColor: '#F6FBF7' },
  scroll: { flexGrow: 1, padding: 24, paddingTop: 56 },

  backBtn: { marginBottom: 20 },

  progressRow: { flexDirection: 'row', gap: 6, marginBottom: 6 },
  progressBar: { flex: 1, height: 4, borderRadius: 2, backgroundColor: '#D8F3DC' },
  progressActive: { backgroundColor: '#52B788' },
  progressLabel: { fontSize: 12, color: '#74A88A', fontWeight: '700', marginBottom: 28 },

  titleArea: { gap: 8, marginBottom: 28 },
  emoji: { fontSize: 36 },
  title: { fontSize: 34, fontWeight: '900', color: '#1B4332', letterSpacing: -1, lineHeight: 40 },
  subtitle: { fontSize: 15, color: '#74A88A', fontWeight: '500' },

  form: {
    backgroundColor: '#fff',
    borderRadius: 24, padding: 24, gap: 14,
    boxShadow: '0px 4px 16px rgba(0,0,0,0.06)',
    elevation: 4,
  },
  field: {
    flexDirection: 'row', alignItems: 'center', gap: 10,
    backgroundColor: '#F6FBF7', borderRadius: 14,
    paddingHorizontal: 14, paddingVertical: 14,
    borderWidth: 1, borderColor: '#D8F3DC',
  },
  input: { flex: 1, fontSize: 15, color: '#1B4332', fontWeight: '500' },

  btn: {
    backgroundColor: '#52B788', borderRadius: 14,
    paddingVertical: 16, flexDirection: 'row',
    alignItems: 'center', justifyContent: 'center', gap: 8, marginTop: 4,
  },
  btnText: { fontSize: 16, fontWeight: '800', color: '#fff' },
  linkRow: { alignItems: 'center' },
  link: { fontSize: 14, color: '#74A88A', fontWeight: '600' },
});
