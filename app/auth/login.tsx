import { useAuth } from '@/context/auth';
import { router } from 'expo-router';
import { useState } from 'react';
import { Alert, KeyboardAvoidingView, Platform, ScrollView, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

const G = '#22C55E', GD = '#16A34A', BG = '#F7F8FA', SURFACE = '#FFFFFF', TEXT = '#111827', MUTED = '#6B7280', DIM = '#9CA3AF', BORDER = '#E5E7EB';

export default function LoginScreen() {
  const { login } = useAuth();
  const [email, setEmail]       = useState('');
  const [password, setPassword] = useState('');
  const [showPass, setShowPass] = useState(false);

  const handleLogin = () => {
    if (!email || !password) return Alert.alert('Erro', 'Preencha todos os campos.');
    if (login(email, password)) router.replace('/(tabs)');
    else Alert.alert('Erro', 'Email ou senha inválidos.');
  };

  return (
    <KeyboardAvoidingView style={s.screen} behavior={Platform.OS === 'ios' ? 'padding' : 'height'}>
      <ScrollView contentContainerStyle={s.scroll} keyboardShouldPersistTaps="handled" bounces={false} showsVerticalScrollIndicator={false}>

        {/* Hero */}
        <View style={s.hero}>
          <View style={s.logoCircle}>
            <Text style={s.logoEmoji}>🥗</Text>
          </View>
          <Text style={s.appName}>nutrifybe</Text>
          <Text style={s.tagline}>Nutrição inteligente para sua vida</Text>
        </View>

        {/* Form */}
        <View style={s.card}>
          <Text style={s.cardTitle}>Entrar na conta</Text>

          <View style={s.fieldWrap}>
            <Ionicons name="mail-outline" size={18} color={MUTED} style={s.fieldIcon} />
            <TextInput style={s.input} placeholder="Email" value={email} onChangeText={setEmail}
              keyboardType="email-address" autoCapitalize="none" placeholderTextColor={DIM} />
          </View>

          <View style={s.fieldWrap}>
            <Ionicons name="lock-closed-outline" size={18} color={MUTED} style={s.fieldIcon} />
            <TextInput style={[s.input, { flex: 1 }]} placeholder="Senha" value={password}
              onChangeText={setPassword} secureTextEntry={!showPass} placeholderTextColor={DIM} />
            <TouchableOpacity onPress={() => setShowPass(v => !v)} style={s.eyeBtn}>
              <Ionicons name={showPass ? 'eye-off-outline' : 'eye-outline'} size={18} color={DIM} />
            </TouchableOpacity>
          </View>

          <TouchableOpacity style={s.btn} onPress={handleLogin} activeOpacity={0.85}>
            <Text style={s.btnText}>Entrar</Text>
          </TouchableOpacity>

          <View style={s.divider}>
            <View style={s.dividerLine} />
            <Text style={s.dividerText}>ou</Text>
            <View style={s.dividerLine} />
          </View>

          <TouchableOpacity style={s.btnOutline} onPress={() => router.push('/auth/about-you')} activeOpacity={0.85}>
            <Text style={s.btnOutlineText}>Criar conta gratuita</Text>
          </TouchableOpacity>
        </View>

        <Text style={s.hint}>Teste: teste@nutrifybe.com / 123456</Text>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const s = StyleSheet.create({
  screen:         { flex: 1, backgroundColor: BG },
  scroll:         { flexGrow: 1, justifyContent: 'center', padding: 24 },
  hero:           { alignItems: 'center', marginBottom: 32, gap: 8 },
  logoCircle:     { width: 80, height: 80, borderRadius: 22, backgroundColor: G, alignItems: 'center', justifyContent: 'center', marginBottom: 4,
                    shadowColor: G, shadowOffset: { width: 0, height: 6 }, shadowOpacity: 0.3, shadowRadius: 16, elevation: 8 },
  logoEmoji:      { fontSize: 38 },
  appName:        { fontSize: 30, fontWeight: '800', color: TEXT, letterSpacing: -0.5 },
  tagline:        { fontSize: 14, color: MUTED, fontWeight: '400' },
  card:           { backgroundColor: SURFACE, borderRadius: 20, padding: 24, gap: 14,
                    shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.06, shadowRadius: 12, elevation: 3 },
  cardTitle:      { fontSize: 20, fontWeight: '700', color: TEXT, marginBottom: 4 },
  fieldWrap:      { flexDirection: 'row', alignItems: 'center', backgroundColor: BG, borderRadius: 12, borderWidth: 1, borderColor: BORDER, paddingHorizontal: 14, height: 52 },
  fieldIcon:      { marginRight: 10 },
  input:          { flex: 1, fontSize: 15, color: TEXT },
  eyeBtn:         { padding: 4 },
  btn:            { backgroundColor: G, borderRadius: 12, height: 52, alignItems: 'center', justifyContent: 'center', marginTop: 4 },
  btnText:        { fontSize: 16, fontWeight: '700', color: '#fff' },
  divider:        { flexDirection: 'row', alignItems: 'center', gap: 10 },
  dividerLine:    { flex: 1, height: 1, backgroundColor: BORDER },
  dividerText:    { fontSize: 13, color: DIM },
  btnOutline:     { borderRadius: 12, height: 52, alignItems: 'center', justifyContent: 'center', borderWidth: 1.5, borderColor: G },
  btnOutlineText: { fontSize: 15, fontWeight: '700', color: GD },
  hint:           { textAlign: 'center', fontSize: 12, color: DIM, marginTop: 20 },
});
