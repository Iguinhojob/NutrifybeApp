import { usePremiumTheme } from '@/context/theme';
import { useAppLayout } from '@/hooks/useAppLayout';
import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import { useState } from 'react';
import { Alert, KeyboardAvoidingView, Platform, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';

export default function ForgotPasswordScreen() {
  const { colors: C } = usePremiumTheme();
  const { topPad, bottomPad } = useAppLayout();
  const [email, setEmail] = useState('');
  const [sent, setSent]   = useState(false);

  const handleSend = () => {
    if (!email || !email.includes('@')) return Alert.alert('Erro', 'Informe um email válido.');
    setSent(true);
  };

  if (sent) {
    return (
      <View style={[s.screen, { backgroundColor: C.bg, paddingTop: topPad, paddingBottom: bottomPad + 24 }]}>
        <View style={[s.blob, { backgroundColor: C.primarySoft }]} />
        <TouchableOpacity style={[s.backBtn, { backgroundColor: C.surface, borderColor: C.border }]} onPress={() => router.back()}>
          <Ionicons name="arrow-back" size={20} color={C.primary} />
        </TouchableOpacity>
        <View style={s.successContent}>
          <View style={[s.iconWrap, { backgroundColor: C.primarySoft }]}>
            <Ionicons name="mail" size={40} color={C.primary} />
          </View>
          <Text style={[s.title, { color: C.text }]}>Email enviado!</Text>
          <Text style={[s.subtitle, { color: C.textMuted, textAlign: 'center' }]}>
            Enviamos as instruções para{'\n'}
            <Text style={{ color: C.primary, fontWeight: '700' }}>{email}</Text>
          </Text>
          <Text style={[s.note, { color: C.textDim }]}>Verifique sua caixa de entrada e a pasta de spam.</Text>
          <TouchableOpacity
            style={[s.btnPrimary, { backgroundColor: C.primary, shadowColor: C.primary }]}
            onPress={() => router.replace('/auth/login')}
            activeOpacity={0.85}
          >
            <Text style={s.btnPrimaryText}>Voltar ao login</Text>
          </TouchableOpacity>
        </View>
      </View>
    );
  }

  return (
    <KeyboardAvoidingView style={[s.screen, { backgroundColor: C.bg }]} behavior={Platform.OS === 'ios' ? 'padding' : 'height'}>
      <View style={[s.blob, { backgroundColor: C.primarySoft }]} />
      <View style={[s.inner, { paddingTop: topPad, paddingBottom: bottomPad + 24 }]}>
        <TouchableOpacity style={[s.backBtn, { backgroundColor: C.surface, borderColor: C.border }]} onPress={() => router.back()}>
          <Ionicons name="arrow-back" size={20} color={C.primary} />
        </TouchableOpacity>

        <View style={s.header}>
          <View style={[s.iconWrap, { backgroundColor: C.primarySoft }]}>
            <Ionicons name="lock-open-outline" size={32} color={C.primary} />
          </View>
          <Text style={[s.title, { color: C.text }]}>Recuperar senha</Text>
          <Text style={[s.subtitle, { color: C.textMuted }]}>
            Informe seu email cadastrado e enviaremos as instruções para redefinir sua senha.
          </Text>
        </View>

        <View style={[s.fieldWrap, { backgroundColor: C.surface, borderColor: C.border }]}>
          <Ionicons name="mail-outline" size={18} color={C.textMuted} style={s.fieldIcon} />
          <TextInput
            style={[s.input, { color: C.text }]}
            placeholder="Seu email"
            placeholderTextColor={C.textDim}
            value={email}
            onChangeText={setEmail}
            keyboardType="email-address"
            autoCapitalize="none"
          />
        </View>

        <TouchableOpacity
          style={[s.btnPrimary, { backgroundColor: C.primary, shadowColor: C.primary }]}
          onPress={handleSend}
          activeOpacity={0.85}
        >
          <Text style={s.btnPrimaryText}>Enviar instruções</Text>
        </TouchableOpacity>
      </View>
    </KeyboardAvoidingView>
  );
}

const s = StyleSheet.create({
  screen:        { flex: 1 },
  blob:          { position: 'absolute', top: -120, right: -100, width: 340, height: 340, borderRadius: 170 },
  inner:         { flex: 1, paddingHorizontal: 24, gap: 16 },
  backBtn:       { width: 42, height: 42, borderRadius: 14, alignItems: 'center', justifyContent: 'center', marginBottom: 24, borderWidth: 1 },
  header:        { gap: 12, marginBottom: 8 },
  iconWrap:      { width: 64, height: 64, borderRadius: 20, alignItems: 'center', justifyContent: 'center' },
  title:         { fontSize: 30, fontWeight: '900', letterSpacing: -0.5 },
  subtitle:      { fontSize: 15, lineHeight: 22 },
  note:          { fontSize: 13, textAlign: 'center' },
  fieldWrap:     { flexDirection: 'row', alignItems: 'center', borderRadius: 16, borderWidth: 1, paddingHorizontal: 16, height: 56 },
  fieldIcon:     { marginRight: 12 },
  input:         { flex: 1, fontSize: 15 },
  btnPrimary:    { borderRadius: 16, height: 56, alignItems: 'center', justifyContent: 'center',
                   shadowOffset: { width: 0, height: 6 }, shadowOpacity: 0.3, shadowRadius: 16, elevation: 8 },
  btnPrimaryText:{ fontSize: 17, fontWeight: '800', color: '#fff' },
  successContent:{ flex: 1, alignItems: 'center', justifyContent: 'center', paddingHorizontal: 24, gap: 16 },
});
