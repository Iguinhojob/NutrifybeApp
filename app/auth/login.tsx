import { useAuth } from '@/context/auth';
import { router } from 'expo-router';
import { useState } from 'react';
import {
  Alert, KeyboardAvoidingView, Platform, ScrollView,
  StyleSheet, Text, TextInput, TouchableOpacity, View,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';

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
      <ScrollView contentContainerStyle={s.scroll} keyboardShouldPersistTaps="handled" bounces={false}>

        {/* Ilustração / hero */}
        <View style={s.hero}>
          <View style={s.logoCircle}>
            <Text style={s.logoEmoji}>🥗</Text>
          </View>
          <Text style={s.appName}>Nutrifybe</Text>
          <Text style={s.tagline}>Seu guia de nutrição diária</Text>
        </View>

        {/* Formulário */}
        <View style={s.form}>
          <Text style={s.formTitle}>Entrar</Text>

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
              placeholder="Sua senha"
              value={password}
              onChangeText={setPassword}
              secureTextEntry={!showPass}
              placeholderTextColor="#B0B8B4"
            />
            <TouchableOpacity onPress={() => setShowPass(v => !v)}>
              <Ionicons name={showPass ? 'eye-off-outline' : 'eye-outline'} size={20} color="#B0B8B4" />
            </TouchableOpacity>
          </View>

          <TouchableOpacity style={s.btn} onPress={handleLogin} activeOpacity={0.85}>
            <Text style={s.btnText}>Entrar</Text>
          </TouchableOpacity>

          <View style={s.dividerRow}>
            <View style={s.dividerLine} />
            <Text style={s.dividerText}>ou</Text>
            <View style={s.dividerLine} />
          </View>

          <TouchableOpacity style={s.btnSecondary} onPress={() => router.push('/auth/about-you')} activeOpacity={0.85}>
            <Text style={s.btnSecondaryText}>Criar conta gratuita</Text>
          </TouchableOpacity>
        </View>

      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const s = StyleSheet.create({
  screen: { flex: 1, backgroundColor: '#F6FBF7' },
  scroll: { flexGrow: 1, justifyContent: 'center', padding: 28 },

  hero: { alignItems: 'center', marginBottom: 40, gap: 10 },
  logoCircle: {
    width: 90, height: 90, borderRadius: 28,
    backgroundColor: '#D8F3DC',
    alignItems: 'center', justifyContent: 'center',
    marginBottom: 4,
  },
  logoEmoji: { fontSize: 44 },
  appName: { fontSize: 30, fontWeight: '900', color: '#1B4332', letterSpacing: -0.5 },
  tagline: { fontSize: 15, color: '#74A88A', fontWeight: '500' },

  form: {
    backgroundColor: '#fff',
    borderRadius: 24,
    padding: 24,
    gap: 14,
    boxShadow: '0px 4px 16px rgba(0,0,0,0.06)',
    elevation: 4,
  },
  formTitle: { fontSize: 22, fontWeight: '800', color: '#1B4332', marginBottom: 4 },

  field: {
    flexDirection: 'row', alignItems: 'center', gap: 10,
    backgroundColor: '#F6FBF7',
    borderRadius: 14, paddingHorizontal: 14, paddingVertical: 14,
    borderWidth: 1, borderColor: '#D8F3DC',
  },
  input: { flex: 1, fontSize: 15, color: '#1B4332', fontWeight: '500' },

  btn: {
    backgroundColor: '#52B788',
    borderRadius: 14, paddingVertical: 16,
    alignItems: 'center', marginTop: 4,
  },
  btnText: { fontSize: 16, fontWeight: '800', color: '#fff' },

  dividerRow: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  dividerLine: { flex: 1, height: 1, backgroundColor: '#E8F5E9' },
  dividerText: { fontSize: 13, color: '#B0B8B4', fontWeight: '600' },

  btnSecondary: {
    borderRadius: 14, paddingVertical: 15,
    alignItems: 'center',
    borderWidth: 1.5, borderColor: '#52B788',
  },
  btnSecondaryText: { fontSize: 15, fontWeight: '800', color: '#52B788' },
});
