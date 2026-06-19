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
      {/* Topo com identidade */}
      <View style={s.top}>
        <View style={s.iconWrap}>
          <Ionicons name="leaf" size={32} color="#fff" />
        </View>
        <Text style={s.brand}>Nutrifybe</Text>
        <Text style={s.tagline}>Nutrição que transforma hábitos</Text>
      </View>

      {/* Card de login */}
      <View style={s.card}>
        <Text style={s.cardTitle}>Entrar na conta</Text>

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
            placeholder="Senha"
            value={password}
            onChangeText={setPassword}
            secureTextEntry={!showPass}
            placeholderTextColor="#aaa"
          />
          <TouchableOpacity onPress={() => setShowPass(v => !v)}>
            <Ionicons name={showPass ? 'eye-off-outline' : 'eye-outline'} size={18} color="#aaa" />
          </TouchableOpacity>
        </View>

        <TouchableOpacity style={s.btn} onPress={handleLogin} activeOpacity={0.85}>
          <Text style={s.btnText}>Entrar</Text>
          <Ionicons name="arrow-forward" size={18} color="#fff" />
        </TouchableOpacity>

        <View style={s.divider}>
          <View style={s.line} />
          <Text style={s.dividerText}>ou</Text>
          <View style={s.line} />
        </View>

        <TouchableOpacity style={s.btnOutline} onPress={() => router.push('/auth/about-you')} activeOpacity={0.85}>
          <Text style={s.btnOutlineText}>Criar conta gratuita</Text>
        </TouchableOpacity>
      </View>
    </KeyboardAvoidingView>
  );
}

const s = StyleSheet.create({
  screen: { flex: 1, backgroundColor: '#1A1035' },

  top: { flex: 1, alignItems: 'center', justifyContent: 'center', gap: 10, paddingBottom: 16 },
  iconWrap: {
    width: 68, height: 68, borderRadius: 20,
    backgroundColor: '#7C5CBF',
    alignItems: 'center', justifyContent: 'center',
    marginBottom: 4,
  },
  brand: { fontSize: 32, fontWeight: '900', color: '#fff', letterSpacing: -1 },
  tagline: { fontSize: 14, color: 'rgba(255,255,255,0.5)', fontWeight: '500' },

  card: {
    backgroundColor: '#fff',
    borderTopLeftRadius: 32, borderTopRightRadius: 32,
    padding: 28, paddingBottom: 48,
    gap: 14,
  },
  cardTitle: { fontSize: 20, fontWeight: '800', color: '#1A1035', marginBottom: 4 },

  field: {
    flexDirection: 'row', alignItems: 'center', gap: 10,
    backgroundColor: '#F4F1F9',
    borderRadius: 14, paddingHorizontal: 14, paddingVertical: 14,
  },
  input: { flex: 1, fontSize: 15, color: '#1A1035', fontWeight: '500' },

  btn: {
    backgroundColor: '#7C5CBF', borderRadius: 14,
    paddingVertical: 16, flexDirection: 'row',
    alignItems: 'center', justifyContent: 'center', gap: 8,
    marginTop: 4,
  },
  btnText: { fontSize: 16, fontWeight: '800', color: '#fff' },

  divider: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  line: { flex: 1, height: 1, backgroundColor: '#E5E0F0' },
  dividerText: { fontSize: 13, color: '#aaa', fontWeight: '600' },

  btnOutline: {
    borderRadius: 14, paddingVertical: 15,
    alignItems: 'center', justifyContent: 'center',
    borderWidth: 1.5, borderColor: '#7C5CBF',
  },
  btnOutlineText: { fontSize: 15, fontWeight: '800', color: '#7C5CBF' },
});
