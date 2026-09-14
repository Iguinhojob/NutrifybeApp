import { router } from 'expo-router';
import { useState } from 'react';
import { Alert, KeyboardAvoidingView, Platform, ScrollView, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { D, GRAD, GRAD_REV } from '@/constants/darkTheme';

export default function AboutYouScreen() {
  const [name, setName]         = useState('');
  const [email, setEmail]       = useState('');
  const [password, setPassword] = useState('');
  const [showPass, setShowPass] = useState(false);

  const next = () => {
    if (!name || !email || !password) return Alert.alert('Erro', 'Preencha todos os campos.');
    if (password.length < 6) return Alert.alert('Erro', 'Senha deve ter ao menos 6 caracteres.');
    router.push({ pathname: '/auth/setup', params: { name, email, password } });
  };

  return (
    <KeyboardAvoidingView style={s.screen} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
      <View style={[s.glow, s.glowCyan]} />
      <View style={[s.glow, s.glowPurple]} />
      <ScrollView contentContainerStyle={s.scroll} keyboardShouldPersistTaps="handled" bounces={false}>

        <TouchableOpacity style={s.backBtn} onPress={() => router.back()}>
          <Ionicons name="arrow-back-outline" size={22} color={D.cyan} />
        </TouchableOpacity>

        <View style={s.progressRow}>
          <LinearGradient colors={GRAD} start={{x:0,y:0}} end={{x:1,y:0}} style={s.progressActive} />
          <View style={s.progressBar} />
        </View>
        <Text style={s.progressLabel}>Passo 1 de 2</Text>

        <View style={s.titleArea}>
          <Text style={s.title}>Olá!{'\n'}Vamos começar.</Text>
          <Text style={s.subtitle}>Crie sua conta em menos de 1 minuto.</Text>
        </View>

        <LinearGradient colors={GRAD} start={{x:0,y:0}} end={{x:1,y:1}} style={s.cardBorder}>
          <View style={s.form}>
            {[
              { icon: 'person-outline' as const, placeholder: 'Seu nome completo', value: name,     set: setName,  kb: 'default'       as const, cap: 'words' as const, grad: GRAD     },
              { icon: 'mail-outline'   as const, placeholder: 'Seu email',          value: email,    set: setEmail, kb: 'email-address' as const, cap: 'none'  as const, grad: GRAD_REV },
            ].map((f, i) => (
              <LinearGradient key={i} colors={f.grad} start={{x:0,y:0}} end={{x:1,y:0}} style={s.fieldBorder}>
                <View style={s.field}>
                  <Ionicons name={f.icon} size={20} color={i === 0 ? D.cyan : D.purple} />
                  <TextInput style={s.input} placeholder={f.placeholder} value={f.value} onChangeText={f.set}
                    keyboardType={f.kb} autoCapitalize={f.cap} placeholderTextColor={D.textDim} />
                </View>
              </LinearGradient>
            ))}

            <LinearGradient colors={GRAD} start={{x:0,y:0}} end={{x:1,y:0}} style={s.fieldBorder}>
              <View style={s.field}>
                <Ionicons name="lock-closed-outline" size={20} color={D.cyan} />
                <TextInput style={[s.input,{flex:1}]} placeholder="Senha (mín. 6 caracteres)" value={password}
                  onChangeText={setPassword} secureTextEntry={!showPass} placeholderTextColor={D.textDim} />
                <TouchableOpacity onPress={() => setShowPass(v => !v)}>
                  <Ionicons name={showPass ? 'eye-off-outline' : 'eye-outline'} size={20} color={D.textDim} />
                </TouchableOpacity>
              </View>
            </LinearGradient>

            <LinearGradient colors={GRAD} start={{x:0,y:0}} end={{x:1,y:0}} style={s.btn}>
              <TouchableOpacity onPress={next} activeOpacity={0.85} style={s.btnInner}>
                <Text style={s.btnText}>Continuar</Text>
                <Ionicons name="arrow-forward" size={18} color={D.white} />
              </TouchableOpacity>
            </LinearGradient>

            <TouchableOpacity onPress={() => router.back()} style={s.linkRow}>
              <Text style={s.link}>Já tenho conta</Text>
            </TouchableOpacity>
          </View>
        </LinearGradient>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const s = StyleSheet.create({
  screen: { flex: 1, backgroundColor: D.bg },
  glow: { position: 'absolute', borderRadius: 999, opacity: 0.18 },
  glowCyan:   { width: 250, height: 250, backgroundColor: D.cyan,   top: -60,  left: -80 },
  glowPurple: { width: 220, height: 220, backgroundColor: D.purple, bottom: 80, right: -60 },
  scroll: { flexGrow: 1, padding: 24, paddingTop: 56 },
  backBtn: { marginBottom: 20 },
  progressRow:    { flexDirection: 'row', gap: 6, marginBottom: 6 },
  progressBar:    { flex: 1, height: 4, borderRadius: 2, backgroundColor: D.border },
  progressActive: { flex: 1, height: 4, borderRadius: 2 },
  progressLabel:  { fontSize: 12, color: D.cyan, fontWeight: '700', marginBottom: 28 },
  titleArea: { gap: 8, marginBottom: 28 },
  title:    { fontSize: 34, fontWeight: '900', color: D.text, letterSpacing: -1, lineHeight: 40 },
  subtitle: { fontSize: 15, color: D.textMuted, fontWeight: '500' },
  cardBorder: { borderRadius: 26, padding: 1.5 },
  form: { backgroundColor: D.surface, borderRadius: 25, padding: 24, gap: 14 },
  fieldBorder: { borderRadius: 15, padding: 1.5 },
  field: { flexDirection: 'row', alignItems: 'center', gap: 10, backgroundColor: D.surface2, borderRadius: 14, paddingHorizontal: 14, paddingVertical: 14 },
  input: { flex: 1, fontSize: 15, color: D.text, fontWeight: '500' },
  btn: { borderRadius: 14, overflow: 'hidden', marginTop: 4 },
  btnInner: { paddingVertical: 16, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8 },
  btnText: { fontSize: 16, fontWeight: '800', color: D.white },
  linkRow: { alignItems: 'center' },
  link: { fontSize: 14, color: D.purpleLight, fontWeight: '600' },
});
