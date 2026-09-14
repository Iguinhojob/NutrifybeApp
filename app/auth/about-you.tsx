import { useAppLayout } from '@/hooks/useAppLayout';
import { router } from 'expo-router';
import { useState } from 'react';
import { Alert, KeyboardAvoidingView, Platform, ScrollView, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

const G = '#22C55E', GD = '#16A34A', BG = '#F7F8FA', SURFACE = '#FFFFFF', TEXT = '#111827', MUTED = '#6B7280', DIM = '#9CA3AF', BORDER = '#E5E7EB';

export default function AboutYouScreen() {
  const { topPad } = useAppLayout();
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
    <KeyboardAvoidingView style={s.screen} behavior={Platform.OS === 'ios' ? 'padding' : 'height'}>
      <ScrollView contentContainerStyle={[s.scroll, { paddingTop: topPad }]} keyboardShouldPersistTaps="handled" bounces={false} showsVerticalScrollIndicator={false}>

        <TouchableOpacity style={s.backBtn} onPress={() => router.back()}>
          <Ionicons name="arrow-back" size={20} color={TEXT} />
        </TouchableOpacity>

        {/* Progress */}
        <View style={s.progressRow}>
          <View style={[s.progressBar, { backgroundColor: G }]} />
          <View style={[s.progressBar, { backgroundColor: BORDER }]} />
        </View>
        <Text style={s.progressLabel}>Passo 1 de 2</Text>

        <Text style={s.title}>Crie sua conta</Text>
        <Text style={s.subtitle}>Rápido e gratuito. Sem cartão de crédito.</Text>

        <View style={s.card}>
          {[
            { icon: 'person-outline' as const, placeholder: 'Nome completo', value: name,     set: setName,  kb: 'default'       as const, cap: 'words' as const },
            { icon: 'mail-outline'   as const, placeholder: 'Email',          value: email,    set: setEmail, kb: 'email-address' as const, cap: 'none'  as const },
          ].map((f, i) => (
            <View key={i} style={s.fieldWrap}>
              <Ionicons name={f.icon} size={18} color={MUTED} style={s.fieldIcon} />
              <TextInput style={s.input} placeholder={f.placeholder} value={f.value} onChangeText={f.set}
                keyboardType={f.kb} autoCapitalize={f.cap} placeholderTextColor={DIM} />
            </View>
          ))}

          <View style={s.fieldWrap}>
            <Ionicons name="lock-closed-outline" size={18} color={MUTED} style={s.fieldIcon} />
            <TextInput style={[s.input, { flex: 1 }]} placeholder="Senha (mín. 6 caracteres)" value={password}
              onChangeText={setPassword} secureTextEntry={!showPass} placeholderTextColor={DIM} />
            <TouchableOpacity onPress={() => setShowPass(v => !v)} style={{ padding: 4 }}>
              <Ionicons name={showPass ? 'eye-off-outline' : 'eye-outline'} size={18} color={DIM} />
            </TouchableOpacity>
          </View>

          <TouchableOpacity style={s.btn} onPress={next} activeOpacity={0.85}>
            <Text style={s.btnText}>Continuar</Text>
            <Ionicons name="arrow-forward" size={18} color="#fff" />
          </TouchableOpacity>
        </View>

        <TouchableOpacity onPress={() => router.back()} style={s.linkRow}>
          <Text style={s.link}>Já tenho conta</Text>
        </TouchableOpacity>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const s = StyleSheet.create({
  screen:       { flex: 1, backgroundColor: BG },
  scroll:       { flexGrow: 1, padding: 24 },
  backBtn:      { width: 40, height: 40, borderRadius: 12, backgroundColor: SURFACE, alignItems: 'center', justifyContent: 'center', marginBottom: 24,
                  shadowColor: '#000', shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.06, shadowRadius: 4, elevation: 2 },
  progressRow:  { flexDirection: 'row', gap: 6, marginBottom: 8 },
  progressBar:  { flex: 1, height: 4, borderRadius: 2 },
  progressLabel:{ fontSize: 12, color: G, fontWeight: '700', marginBottom: 24 },
  title:        { fontSize: 28, fontWeight: '800', color: TEXT, letterSpacing: -0.5, marginBottom: 6 },
  subtitle:     { fontSize: 14, color: MUTED, marginBottom: 28 },
  card:         { backgroundColor: SURFACE, borderRadius: 20, padding: 20, gap: 12,
                  shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.06, shadowRadius: 12, elevation: 3 },
  fieldWrap:    { flexDirection: 'row', alignItems: 'center', backgroundColor: BG, borderRadius: 12, borderWidth: 1, borderColor: BORDER, paddingHorizontal: 14, height: 52 },
  fieldIcon:    { marginRight: 10 },
  input:        { flex: 1, fontSize: 15, color: TEXT },
  btn:          { backgroundColor: G, borderRadius: 12, height: 52, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8, marginTop: 4 },
  btnText:      { fontSize: 16, fontWeight: '700', color: '#fff' },
  linkRow:      { alignItems: 'center', marginTop: 20 },
  link:         { fontSize: 14, color: GD, fontWeight: '600' },
});
