import { usePremiumTheme } from '@/context/theme';
import { useAppLayout } from '@/hooks/useAppLayout';
import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import { useState } from 'react';
import { Alert, KeyboardAvoidingView, Platform, ScrollView, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';

const SEXOS = [
  { label: 'Masculino', icon: '♂️' },
  { label: 'Feminino',  icon: '♀️' },
  { label: 'Outro',     icon: '⚧️' },
];

function getPasswordRules(p: string) {
  return [
    { label: 'Mínimo 8 caracteres',       ok: p.length >= 8 },
    { label: 'Letra maiúscula',            ok: /[A-Z]/.test(p) },
    { label: 'Número',                     ok: /[0-9]/.test(p) },
    { label: 'Caractere especial (!@#$…)', ok: /[^A-Za-z0-9]/.test(p) },
  ];
}

function formatBirthDate(raw: string) {
  const digits = raw.replace(/\D/g, '').slice(0, 8);
  if (digits.length <= 2) return digits;
  if (digits.length <= 4) return `${digits.slice(0, 2)}/${digits.slice(2)}`;
  return `${digits.slice(0, 2)}/${digits.slice(2, 4)}/${digits.slice(4)}`;
}

export default function AboutYouScreen() {
  const { colors: C } = usePremiumTheme();
  const { topPad } = useAppLayout();
  const [name, setName]           = useState('');
  const [email, setEmail]         = useState('');
  const [birthDate, setBirthDate] = useState('');
  const [sexo, setSexo]           = useState('');
  const [password, setPassword]   = useState('');
  const [showPass, setShowPass]   = useState(false);
  const [passBlurred, setPassBlurred] = useState(false);

  const rules = getPasswordRules(password);
  const allRulesOk = rules.every(r => r.ok);

  const next = () => {
    if (!name || !email || !birthDate || !sexo || !password)
      return Alert.alert('Erro', 'Preencha todos os campos.');
    if (!allRulesOk)
      return Alert.alert('Senha fraca', 'Sua senha não atende todos os requisitos de segurança.');
    if (birthDate.length < 10)
      return Alert.alert('Erro', 'Informe uma data de nascimento válida (DD/MM/AAAA).');
    router.push({ pathname: '/auth/setup', params: { name, email, password, birthDate, sexo } });
  };

  return (
    <KeyboardAvoidingView style={[s.screen, { backgroundColor: C.bg }]} behavior={Platform.OS === 'ios' ? 'padding' : 'height'}>
      <View style={[s.blob, { backgroundColor: C.primarySoft }]} />
      <ScrollView
        contentContainerStyle={[s.scroll, { paddingTop: topPad + 16 }]}
        keyboardShouldPersistTaps="handled"
        bounces={false}
        showsVerticalScrollIndicator={false}
      >
        <TouchableOpacity style={[s.backBtn, { backgroundColor: C.surface, borderColor: C.border }]} onPress={() => router.back()}>
          <Ionicons name="arrow-back" size={20} color={C.primary} />
        </TouchableOpacity>

        <View style={s.progressRow}>
          <View style={[s.progressBar, { backgroundColor: C.primary }]} />
          <View style={[s.progressBar, { backgroundColor: C.border }]} />
          <View style={[s.progressBar, { backgroundColor: C.border }]} />
        </View>
        <Text style={[s.progressLabel, { color: C.primary }]}>Passo 1 de 3 · Dados pessoais</Text>

        <Text style={[s.title, { color: C.text }]}>Vamos nos conhecer! 👋</Text>
        <Text style={[s.subtitle, { color: C.textMuted }]}>Rápido e gratuito. Sem cartão de crédito.</Text>

        {[
          { icon: 'person-outline' as const,   placeholder: 'Nome completo',                value: name,      onChange: setName,      type: 'default' as const,       cap: 'words' as const },
          { icon: 'mail-outline' as const,     placeholder: 'Email',                        value: email,     onChange: setEmail,     type: 'email-address' as const, cap: 'none' as const  },
          { icon: 'calendar-outline' as const, placeholder: 'Data de nascimento (DD/MM/AAAA)', value: birthDate, onChange: (v: string) => setBirthDate(formatBirthDate(v)), type: 'numeric' as const, cap: 'none' as const },
        ].map((f, i) => (
          <View key={i} style={[s.fieldWrap, { backgroundColor: C.surface, borderColor: C.border }]}>
            <Ionicons name={f.icon} size={18} color={C.textMuted} style={s.fieldIcon} />
            <TextInput
              style={[s.input, { color: C.text }]}
              placeholder={f.placeholder}
              placeholderTextColor={C.textDim}
              value={f.value}
              onChangeText={f.onChange}
              keyboardType={f.type}
              autoCapitalize={f.cap}
            />
          </View>
        ))}

        <Text style={[s.sectionLabel, { color: C.textMuted }]}>Sexo biológico</Text>
        <View style={s.sexoRow}>
          {SEXOS.map(s2 => (
            <TouchableOpacity
              key={s2.label}
              style={[s.sexoCard, { backgroundColor: C.surface, borderColor: sexo === s2.label ? C.primary : C.border },
                      sexo === s2.label && { backgroundColor: C.primarySoft }]}
              onPress={() => setSexo(s2.label)}
              activeOpacity={0.8}
            >
              <Text style={s.sexoIcon}>{s2.icon}</Text>
              <Text style={[s.sexoLabel, { color: sexo === s2.label ? C.primary : C.textMuted }]}>{s2.label}</Text>
            </TouchableOpacity>
          ))}
        </View>

        <View style={[s.fieldWrap, { backgroundColor: C.surface, borderColor: C.border }]}>
          <Ionicons name="lock-closed-outline" size={18} color={C.textMuted} style={s.fieldIcon} />
          <TextInput
            style={[s.input, { flex: 1, color: C.text }]}
            placeholder="Criar senha"
            placeholderTextColor={C.textDim}
            value={password}
            onChangeText={setPassword}
            secureTextEntry={!showPass}
            onBlur={() => setPassBlurred(true)}
          />
          <TouchableOpacity onPress={() => setShowPass(v => !v)} style={{ padding: 4 }}>
            <Ionicons name={showPass ? 'eye-off-outline' : 'eye-outline'} size={18} color={C.textDim} />
          </TouchableOpacity>
        </View>

        {(passBlurred || password.length > 0) && (
          <View style={[s.rulesBox, { backgroundColor: C.surface, borderColor: C.border }]}>
            {rules.map((r, i) => (
              <View key={i} style={s.ruleRow}>
                <Ionicons name={r.ok ? 'checkmark-circle' : 'ellipse-outline'} size={14} color={r.ok ? C.primary : C.textDim} />
                <Text style={[s.ruleText, { color: r.ok ? C.primary : C.textDim }]}>{r.label}</Text>
              </View>
            ))}
          </View>
        )}

        <TouchableOpacity
          style={[s.btnPrimary, { backgroundColor: C.primary, shadowColor: C.primary }]}
          onPress={next}
          activeOpacity={0.85}
        >
          <Text style={s.btnPrimaryText}>Continuar</Text>
          <Ionicons name="arrow-forward" size={18} color="#fff" />
        </TouchableOpacity>

        <TouchableOpacity onPress={() => router.push('/auth/login')} style={s.linkRow}>
          <Text style={[s.linkText, { color: C.primary }]}>Já tenho conta</Text>
        </TouchableOpacity>

        <View style={{ height: 32 }} />
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const s = StyleSheet.create({
  screen:         { flex: 1 },
  blob:           { position: 'absolute', top: -120, right: -100, width: 340, height: 340, borderRadius: 170 },
  scroll:         { flexGrow: 1, paddingHorizontal: 24, gap: 14 },
  backBtn:        { width: 42, height: 42, borderRadius: 14, alignItems: 'center', justifyContent: 'center', marginBottom: 16, borderWidth: 1 },
  progressRow:    { flexDirection: 'row', gap: 6, marginBottom: 6 },
  progressBar:    { flex: 1, height: 4, borderRadius: 2 },
  progressLabel:  { fontSize: 12, fontWeight: '700', marginBottom: 16 },
  title:          { fontSize: 30, fontWeight: '900', letterSpacing: -0.5 },
  subtitle:       { fontSize: 14, marginBottom: 4 },
  fieldWrap:      { flexDirection: 'row', alignItems: 'center', borderRadius: 16, borderWidth: 1, paddingHorizontal: 16, height: 56 },
  fieldIcon:      { marginRight: 12 },
  input:          { flex: 1, fontSize: 15 },
  sectionLabel:   { fontSize: 12, fontWeight: '700', textTransform: 'uppercase', letterSpacing: 0.8, marginTop: 4 },
  sexoRow:        { flexDirection: 'row', gap: 10 },
  sexoCard:       { flex: 1, alignItems: 'center', justifyContent: 'center', borderRadius: 16, paddingVertical: 14, borderWidth: 1.5, gap: 6 },
  sexoIcon:       { fontSize: 22 },
  sexoLabel:      { fontSize: 13, fontWeight: '600' },
  rulesBox:       { borderRadius: 14, padding: 14, gap: 8, borderWidth: 1 },
  ruleRow:        { flexDirection: 'row', alignItems: 'center', gap: 8 },
  ruleText:       { fontSize: 13 },
  btnPrimary:     { borderRadius: 16, height: 56, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8, marginTop: 8,
                    shadowOffset: { width: 0, height: 6 }, shadowOpacity: 0.3, shadowRadius: 16, elevation: 8 },
  btnPrimaryText: { fontSize: 17, fontWeight: '800', color: '#fff' },
  linkRow:        { alignItems: 'center', marginTop: 4 },
  linkText:       { fontSize: 14, fontWeight: '600' },
});
