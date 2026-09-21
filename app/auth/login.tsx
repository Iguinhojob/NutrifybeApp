import { useAuth } from '@/context/auth';
import { usePremiumTheme } from '@/context/theme';
import { useAppLayout } from '@/hooks/useAppLayout';
import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import { useState } from 'react';
import { ActivityIndicator, KeyboardAvoidingView, Platform, ScrollView, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';

export default function LoginScreen() {
  const { login, loading, error, clearError } = useAuth();
  const { colors: C } = usePremiumTheme();
  const { topPad, bottomPad } = useAppLayout();
  const [email, setEmail]       = useState('');
  const [password, setPassword] = useState('');
  const [showPass, setShowPass] = useState(false);

  const handleLogin = async () => {
    if (!email || !password) return;
    clearError();
    const ok = await login(email, password);
    if (ok) router.replace('/(tabs)');
  };

  return (
    <KeyboardAvoidingView style={[s.screen, { backgroundColor: C.bg }]} behavior={Platform.OS === 'ios' ? 'padding' : 'height'}>
      <View style={[s.blob, { backgroundColor: C.primarySoft }]} />

      <ScrollView
        contentContainerStyle={[s.scroll, { paddingTop: topPad + 24, paddingBottom: bottomPad + 24 }]}
        keyboardShouldPersistTaps="handled"
        bounces={false}
        showsVerticalScrollIndicator={false}
      >
        <TouchableOpacity style={[s.backBtn, { backgroundColor: C.surface, borderColor: C.border }]} onPress={() => router.back()}>
          <Ionicons name="arrow-back" size={20} color={C.primary} />
        </TouchableOpacity>

        <View style={s.header}>
          <Text style={[s.greeting, { color: C.primary }]}>Bem-vindo de volta 👋</Text>
          <Text style={[s.title, { color: C.text }]}>Entrar na conta</Text>
          <Text style={[s.subtitle, { color: C.textMuted }]}>Continue sua jornada nutricional</Text>
        </View>

        {error && (
          <View style={[s.errorBox, { backgroundColor: C.dangerSoft, borderColor: C.danger }]}>
            <Ionicons name="alert-circle-outline" size={16} color={C.danger} />
            <Text style={[s.errorText, { color: C.danger }]}>{error}</Text>
          </View>
        )}

        <View style={s.form}>
          <View style={[s.fieldWrap, { backgroundColor: C.surface, borderColor: C.border }]}>
            <Ionicons name="mail-outline" size={18} color={C.textMuted} style={s.fieldIcon} />
            <TextInput
              style={[s.input, { color: C.text }]}
              placeholder="Email"
              placeholderTextColor={C.textDim}
              value={email}
              onChangeText={setEmail}
              keyboardType="email-address"
              autoCapitalize="none"
            />
          </View>

          <View style={[s.fieldWrap, { backgroundColor: C.surface, borderColor: C.border }]}>
            <Ionicons name="lock-closed-outline" size={18} color={C.textMuted} style={s.fieldIcon} />
            <TextInput
              style={[s.input, { flex: 1, color: C.text }]}
              placeholder="Senha"
              placeholderTextColor={C.textDim}
              value={password}
              onChangeText={setPassword}
              secureTextEntry={!showPass}
            />
            <TouchableOpacity onPress={() => setShowPass(v => !v)} style={s.eyeBtn}>
              <Ionicons name={showPass ? 'eye-off-outline' : 'eye-outline'} size={18} color={C.textDim} />
            </TouchableOpacity>
          </View>

          <TouchableOpacity onPress={() => router.push('/auth/forgot-password')} style={s.forgotRow}>
            <Text style={[s.forgotText, { color: C.primary }]}>Esqueci minha senha</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[s.btnPrimary, { backgroundColor: C.primary, shadowColor: C.primary }, (!email || !password || loading) && s.btnDisabled]}
            onPress={handleLogin}
            activeOpacity={0.85}
            disabled={!email || !password || loading}
          >
            {loading
              ? <ActivityIndicator color="#fff" />
              : <Text style={s.btnPrimaryText}>Entrar</Text>
            }
          </TouchableOpacity>
        </View>

        <View style={s.divider}>
          <View style={[s.dividerLine, { backgroundColor: C.border }]} />
          <Text style={[s.dividerText, { color: C.textDim }]}>ou</Text>
          <View style={[s.dividerLine, { backgroundColor: C.border }]} />
        </View>

        <TouchableOpacity
          style={[s.btnOutline, { borderColor: C.border }]}
          onPress={() => router.push('/auth/about-you')}
          activeOpacity={0.85}
        >
          <Text style={[s.btnOutlineText, { color: C.primary }]}>Criar conta gratuita</Text>
        </TouchableOpacity>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const s = StyleSheet.create({
  screen:         { flex: 1 },
  blob:           { position: 'absolute', top: -120, right: -100, width: 340, height: 340, borderRadius: 170 },
  scroll:         { flexGrow: 1, paddingHorizontal: 24 },
  backBtn:        { width: 42, height: 42, borderRadius: 14, alignItems: 'center', justifyContent: 'center', marginBottom: 32, borderWidth: 1 },
  header:         { marginBottom: 24, gap: 6 },
  greeting:       { fontSize: 14, fontWeight: '600', letterSpacing: 0.3 },
  title:          { fontSize: 34, fontWeight: '900', letterSpacing: -0.5 },
  subtitle:       { fontSize: 15 },
  errorBox:       { flexDirection: 'row', alignItems: 'center', gap: 8, borderRadius: 12, padding: 12, borderWidth: 1, marginBottom: 12 },
  errorText:      { fontSize: 13, fontWeight: '500', flex: 1 },
  form:           { gap: 14 },
  fieldWrap:      { flexDirection: 'row', alignItems: 'center', borderRadius: 16, borderWidth: 1, paddingHorizontal: 16, height: 56 },
  fieldIcon:      { marginRight: 12 },
  input:          { flex: 1, fontSize: 15 },
  eyeBtn:         { padding: 4 },
  forgotRow:      { alignSelf: 'flex-end', marginTop: -4 },
  forgotText:     { fontSize: 13, fontWeight: '600' },
  btnPrimary:     { borderRadius: 16, height: 56, alignItems: 'center', justifyContent: 'center', marginTop: 4,
                    shadowOffset: { width: 0, height: 6 }, shadowOpacity: 0.3, shadowRadius: 16, elevation: 8 },
  btnDisabled:    { opacity: 0.5 },
  btnPrimaryText: { fontSize: 17, fontWeight: '800', color: '#fff' },
  divider:        { flexDirection: 'row', alignItems: 'center', gap: 12, marginVertical: 24 },
  dividerLine:    { flex: 1, height: 1 },
  dividerText:    { fontSize: 13 },
  btnOutline:     { borderRadius: 16, height: 54, alignItems: 'center', justifyContent: 'center', borderWidth: 1.5 },
  btnOutlineText: { fontSize: 16, fontWeight: '700' },
});
