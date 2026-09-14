import { useAuth } from '@/context/auth';
import { router } from 'expo-router';
import { useState } from 'react';
import { Alert, KeyboardAvoidingView, Platform, ScrollView, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { D, GRAD, GRAD_REV } from '@/constants/darkTheme';

export default function LoginScreen() {
  const { login } = useAuth();
  const [email, setEmail]       = useState('');
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
      <View style={[s.glow, s.glowCyan]} />
      <View style={[s.glow, s.glowPurple]} />

      <ScrollView contentContainerStyle={s.scroll} keyboardShouldPersistTaps="handled" bounces={false}>
        <View style={s.hero}>
          <Text style={s.appName}>
            <Text style={s.nameCyan}>Nutri</Text>
            <Text style={s.namePurple}>fybe</Text>
          </Text>
          <Text style={s.tagline}>seu guia de nutrição inteligente</Text>
        </View>

        <LinearGradient colors={GRAD} start={{x:0,y:0}} end={{x:1,y:1}} style={s.cardBorder}>
          <View style={s.form}>
            <Text style={s.formTitle}>Entrar</Text>

            <LinearGradient colors={GRAD} start={{x:0,y:0}} end={{x:1,y:0}} style={s.fieldBorder}>
              <View style={s.field}>
                <Ionicons name="mail-outline" size={20} color={D.cyan} />
                <TextInput style={s.input} placeholder="Seu email" value={email} onChangeText={setEmail}
                  keyboardType="email-address" autoCapitalize="none" placeholderTextColor={D.textDim} />
              </View>
            </LinearGradient>

            <LinearGradient colors={GRAD_REV} start={{x:0,y:0}} end={{x:1,y:0}} style={s.fieldBorder}>
              <View style={s.field}>
                <Ionicons name="lock-closed-outline" size={20} color={D.purple} />
                <TextInput style={[s.input,{flex:1}]} placeholder="Sua senha" value={password}
                  onChangeText={setPassword} secureTextEntry={!showPass} placeholderTextColor={D.textDim} />
                <TouchableOpacity onPress={() => setShowPass(v => !v)}>
                  <Ionicons name={showPass ? 'eye-off-outline' : 'eye-outline'} size={20} color={D.textDim} />
                </TouchableOpacity>
              </View>
            </LinearGradient>

            <LinearGradient colors={GRAD} start={{x:0,y:0}} end={{x:1,y:0}} style={s.btn}>
              <TouchableOpacity onPress={handleLogin} activeOpacity={0.85} style={s.btnInner}>
                <Text style={s.btnText}>Entrar</Text>
              </TouchableOpacity>
            </LinearGradient>

            <View style={s.dividerRow}>
              <LinearGradient colors={['transparent', D.cyan+'55']} start={{x:0,y:0}} end={{x:1,y:0}} style={s.dividerLine} />
              <Text style={s.dividerText}>ou</Text>
              <LinearGradient colors={[D.purple+'55','transparent']} start={{x:0,y:0}} end={{x:1,y:0}} style={s.dividerLine} />
            </View>

            <LinearGradient colors={GRAD} start={{x:0,y:0}} end={{x:1,y:0}} style={s.btnSecondaryBorder}>
              <TouchableOpacity style={s.btnSecondary} onPress={() => router.push('/auth/about-you')} activeOpacity={0.85}>
                <Text style={s.btnSecondaryText}>Criar conta gratuita</Text>
              </TouchableOpacity>
            </LinearGradient>
          </View>
        </LinearGradient>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const s = StyleSheet.create({
  screen: { flex: 1, backgroundColor: D.bg },
  glow: { position: 'absolute', borderRadius: 999, opacity: 0.18 },
  glowCyan:   { width: 280, height: 280, backgroundColor: D.cyan,   top: -60,  left: -80 },
  glowPurple: { width: 260, height: 260, backgroundColor: D.purple, bottom: 40, right: -80 },
  scroll: { flexGrow: 1, justifyContent: 'center', padding: 28 },
  hero: { alignItems: 'center', marginBottom: 36, gap: 8 },
  appName:    { fontSize: 42, fontWeight: '900', letterSpacing: -1 },
  nameCyan:   { color: D.cyan },
  namePurple: { color: D.purple },
  tagline:    { fontSize: 13, color: D.textMuted, fontWeight: '500' },
  cardBorder: { borderRadius: 26, padding: 1.5 },
  form: { backgroundColor: D.surface, borderRadius: 25, padding: 24, gap: 14 },
  formTitle: { fontSize: 22, fontWeight: '800', color: D.text, marginBottom: 4 },
  fieldBorder: { borderRadius: 15, padding: 1.5 },
  field: { flexDirection: 'row', alignItems: 'center', gap: 10, backgroundColor: D.surface2, borderRadius: 14, paddingHorizontal: 14, paddingVertical: 14 },
  input: { flex: 1, fontSize: 15, color: D.text, fontWeight: '500' },
  btn: { borderRadius: 14, overflow: 'hidden', marginTop: 4 },
  btnInner: { paddingVertical: 16, alignItems: 'center' },
  btnText: { fontSize: 16, fontWeight: '800', color: D.white },
  dividerRow: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  dividerLine: { flex: 1, height: 1 },
  dividerText: { fontSize: 13, color: D.textDim, fontWeight: '600' },
  btnSecondaryBorder: { borderRadius: 14, padding: 1.5 },
  btnSecondary: { backgroundColor: D.surface, borderRadius: 13, paddingVertical: 14, alignItems: 'center' },
  btnSecondaryText: { fontSize: 15, fontWeight: '800', color: D.purpleLight },
});
