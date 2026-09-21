import { useAuth } from '@/context/auth';
import { usePremiumTheme } from '@/context/theme';
import { useAppLayout } from '@/hooks/useAppLayout';
import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import { useState } from 'react';
import { ActivityIndicator, KeyboardAvoidingView, Platform, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';

export default function NutriCodeScreen() {
  const { solicitarVinculo, loading } = useAuth();
  const { colors: C } = usePremiumTheme();
  const { topPad, bottomPad } = useAppLayout();
  const [crn, setCrn]       = useState('');
  const [linked, setLinked] = useState(false);
  const [nutriName, setNutriName] = useState('');
  const [error, setError]   = useState('');

  const handleLink = async () => {
    if (crn.trim().length < 4) return;
    setError('');
    const result = await solicitarVinculo(crn.trim());
    if (result.success) {
      setLinked(true);
    } else {
      setError(result.error || 'CRN não encontrado.');
    }
  };

  if (linked) {
    return (
      <View style={[s.screen, { backgroundColor: C.bg, paddingTop: topPad, paddingBottom: bottomPad + 24 }]}>
        <View style={[s.blob, { backgroundColor: C.primarySoft }]} />
        <View style={s.successContent}>
          <View style={[s.iconWrap, { backgroundColor: C.primarySoft }]}>
            <Ionicons name="checkmark-circle" size={48} color={C.primary} />
          </View>
          <Text style={[s.title, { color: C.text }]}>Solicitação enviada! 🎉</Text>
          <Text style={[s.subtitle, { color: C.textMuted, textAlign: 'center' }]}>
            Sua solicitação foi enviada para o nutricionista com CRN{' '}
            <Text style={{ color: C.primary, fontWeight: '800' }}>{crn.toUpperCase()}</Text>.{'\n'}
            Aguarde a confirmação.
          </Text>
          <View style={[s.noticeBox, { backgroundColor: C.primarySoft, borderColor: C.border }]}>
            <Ionicons name="information-circle-outline" size={18} color={C.primary} />
            <Text style={[s.noticeText, { color: C.textMuted }]}>
              Você receberá uma notificação quando o nutricionista aceitar seu pedido.
            </Text>
          </View>
          <TouchableOpacity
            style={[s.btnPrimary, { backgroundColor: C.primary, shadowColor: C.primary }]}
            onPress={() => router.replace('/auth/success')}
            activeOpacity={0.85}
          >
            <Text style={s.btnPrimaryText}>Continuar</Text>
            <Ionicons name="arrow-forward" size={18} color="#fff" />
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
            <Ionicons name="person-add-outline" size={32} color={C.primary} />
          </View>
          <Text style={[s.title, { color: C.text }]}>CRN do nutricionista</Text>
          <Text style={[s.subtitle, { color: C.textMuted }]}>
            Informe o CRN do seu nutricionista para enviar uma solicitação de acompanhamento.
          </Text>
        </View>

        <View style={[s.codeWrap, { backgroundColor: C.surface, borderColor: error ? C.danger : C.primary }]}>
          <TextInput
            style={[s.codeInput, { color: C.primary }]}
            placeholder="Ex: 12345"
            placeholderTextColor={C.textDim}
            value={crn}
            onChangeText={v => { setCrn(v); setError(''); }}
            keyboardType="default"
            maxLength={20}
          />
        </View>

        {error ? (
          <View style={[s.errorBox, { backgroundColor: C.dangerSoft, borderColor: C.danger }]}>
            <Ionicons name="alert-circle-outline" size={16} color={C.danger} />
            <Text style={[s.errorText, { color: C.danger }]}>{error}</Text>
          </View>
        ) : (
          <View style={[s.noticeBox, { backgroundColor: C.primarySoft, borderColor: C.border }]}>
            <Ionicons name="information-circle-outline" size={18} color={C.primary} />
            <Text style={[s.noticeText, { color: C.textMuted }]}>
              O CRN é o número de registro do nutricionista. Peça diretamente a ele.
            </Text>
          </View>
        )}

        <TouchableOpacity
          style={[s.btnPrimary, { backgroundColor: C.primary, shadowColor: C.primary },
                  (crn.trim().length < 4 || loading) && s.btnDisabled]}
          onPress={handleLink}
          activeOpacity={0.85}
          disabled={crn.trim().length < 4 || loading}
        >
          {loading
            ? <ActivityIndicator color="#fff" />
            : <>
                <Text style={s.btnPrimaryText}>Enviar solicitação</Text>
                <Ionicons name="send-outline" size={18} color="#fff" />
              </>
          }
        </TouchableOpacity>

        <View style={[s.noCodeBox, { backgroundColor: C.surface, borderColor: C.border }]}>
          <Text style={[s.noCodeTitle, { color: C.text }]}>Não tem o CRN agora?</Text>
          <Text style={[s.noCodeText, { color: C.textMuted }]}>
            Sem problema! Você pode vincular seu nutricionista depois nas configurações do perfil.
          </Text>
          <TouchableOpacity onPress={() => router.replace('/auth/success')} style={s.skipBtn}>
            <Text style={[s.skipText, { color: C.textMuted }]}>Continuar sem vincular</Text>
            <Ionicons name="arrow-forward" size={14} color={C.textMuted} />
          </TouchableOpacity>
        </View>
      </View>
    </KeyboardAvoidingView>
  );
}

const s = StyleSheet.create({
  screen:        { flex: 1 },
  blob:          { position: 'absolute', top: -120, right: -100, width: 340, height: 340, borderRadius: 170 },
  inner:         { flex: 1, paddingHorizontal: 24, gap: 16 },
  backBtn:       { width: 42, height: 42, borderRadius: 14, alignItems: 'center', justifyContent: 'center', marginBottom: 16, borderWidth: 1 },
  header:        { gap: 12, marginBottom: 4 },
  iconWrap:      { width: 64, height: 64, borderRadius: 20, alignItems: 'center', justifyContent: 'center' },
  title:         { fontSize: 28, fontWeight: '900', letterSpacing: -0.5 },
  subtitle:      { fontSize: 14, lineHeight: 21 },
  codeWrap:      { borderRadius: 16, borderWidth: 2, paddingHorizontal: 20, height: 64, justifyContent: 'center' },
  codeInput:     { fontSize: 22, fontWeight: '800', letterSpacing: 4, textAlign: 'center' },
  noticeBox:     { flexDirection: 'row', gap: 10, borderRadius: 14, padding: 14, borderWidth: 1, alignItems: 'flex-start' },
  noticeText:    { flex: 1, fontSize: 13, lineHeight: 19 },
  errorBox:      { flexDirection: 'row', alignItems: 'center', gap: 8, borderRadius: 12, padding: 12, borderWidth: 1 },
  errorText:     { fontSize: 13, fontWeight: '500', flex: 1 },
  btnPrimary:    { borderRadius: 16, height: 56, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8,
                   shadowOffset: { width: 0, height: 6 }, shadowOpacity: 0.3, shadowRadius: 16, elevation: 8 },
  btnDisabled:   { opacity: 0.35 },
  btnPrimaryText:{ fontSize: 17, fontWeight: '800', color: '#fff' },
  noCodeBox:     { borderRadius: 16, padding: 18, borderWidth: 1, gap: 8 },
  noCodeTitle:   { fontSize: 15, fontWeight: '700' },
  noCodeText:    { fontSize: 13, lineHeight: 19 },
  skipBtn:       { flexDirection: 'row', alignItems: 'center', gap: 6, marginTop: 4 },
  skipText:      { fontSize: 14, fontWeight: '600' },
  successContent:{ flex: 1, alignItems: 'center', justifyContent: 'center', paddingHorizontal: 24, gap: 16 },
});
