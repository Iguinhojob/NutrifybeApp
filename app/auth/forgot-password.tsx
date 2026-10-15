import { Field, Note, OnboardingShell, TextLink } from '@/components/onboarding-ui';
import { usePremiumTheme } from '@/context/theme';
import { ContaAPI } from '@/services/api';
import { isValidEmail, isValidPassword, passwordRules } from '@/utils/onboarding';
import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import { useState } from 'react';
import { Pressable, Text, View } from 'react-native';

type Step = 'email' | 'code' | 'reset' | 'done';

export default function ForgotPasswordScreen() {
  const { colors: C, isDark } = usePremiumTheme();
  const separatorColor = isDark ? '#8B5CF6' : '#06B6D4';
  const [step, setStep] = useState<Step>('email');
  const [email, setEmail] = useState('');
  const [code, setCode] = useState('');
  const [password, setPassword] = useState('');
  const [confirmation, setConfirmation] = useState('');
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);

  const next = async () => {
    if (busy) return;
    setError('');
    if (step === 'email') {
      if (!isValidEmail(email)) { setError('Informe um e-mail válido.'); return; }
      setBusy(true);
      try {
        await ContaAPI.solicitarRecuperacao(email.trim().toLowerCase());
        setStep('code');
      } catch (e: any) {
        setError(e?.message || 'Não foi possível solicitar a recuperação. Confira sua conexão e tente novamente.');
      } finally { setBusy(false); }
    } else if (step === 'code') {
      if (!/^\d{6}$/.test(code.trim())) { setError('Digite o código de 6 números recebido por e-mail.'); return; }
      setStep('reset');
    } else if (step === 'reset') {
      if (!isValidPassword(password)) { setError('A senha precisa ter pelo menos 6 caracteres, uma letra maiúscula e um símbolo.'); return; }
      if (password !== confirmation) { setError('As senhas não coincidem.'); return; }
      setBusy(true);
      try {
        await ContaAPI.redefinirSenhaPorCodigo(email.trim().toLowerCase(), code.trim(), password);
        setPassword(''); setConfirmation(''); setStep('done');
      } catch (e: any) {
        setError(e?.message || 'Código inválido ou expirado. Solicite um novo código.');
      } finally { setBusy(false); }
    } else router.replace('/auth/login');
  };

  const resend = async () => {
    setError(''); setBusy(true);
    try { await ContaAPI.solicitarRecuperacao(email.trim().toLowerCase()); setCode(''); setStep('code'); }
    catch (e: any) { setError(e?.message || 'Não foi possível solicitar outro código.'); }
    finally { setBusy(false); }
  };

  const goBack = () => {
    if (step === 'reset') { setStep('code'); setError(''); }
    else if (step === 'code') { setStep('email'); setError(''); }
    else router.replace('/auth/login');
  };

  const title = step === 'email' ? 'Vamos recuperar seu acesso.' : step === 'code' ? 'Confira seu e-mail.' : step === 'reset' ? 'Escolha uma nova senha.' : 'Senha redefinida.';
  const subtitle = step === 'email' ? 'Informe o e-mail cadastrado para receber um código de recuperação.' : step === 'code' ? `Enviamos um código para ${email.trim()}. Ele expira em 10 minutos.` : step === 'reset' ? 'Digite o código recebido e cadastre sua nova senha.' : 'Agora você já pode entrar com a nova senha.';

  return <OnboardingShell
    title={title}
    subtitle={subtitle}
    eyebrow="RECUPERAR SENHA"
    onBack={goBack}
    headerRight={<View style={{ flexDirection: 'row', alignItems: 'center', gap: 12 }}><View style={{ width: 2, height: 28, borderRadius: 2, backgroundColor: separatorColor }} /><Pressable accessibilityRole="button" accessibilityLabel="Fechar recuperação de senha" onPress={() => router.replace('/auth/login')} style={{ minHeight: 44, flexDirection: 'row', alignItems: 'center', gap: 4, paddingHorizontal: 3 }}><Ionicons name="close" size={18} color={isDark ? '#C4B5FD' : '#0891B2'} /><Text style={{ color: isDark ? '#C4B5FD' : '#0891B2', fontSize: 13, fontWeight: '700' }}>Fechar</Text></Pressable></View>}
    error={error}
    action={step === 'email' ? 'Enviar código' : step === 'code' ? 'Continuar' : step === 'reset' ? 'Redefinir senha' : 'Voltar ao login'}
    onAction={next}
    busy={busy}
    footer={(step === 'code' || step === 'reset') ? <TextLink label="Enviar outro código" onPress={() => void resend()} /> : undefined}
  >
    {step === 'email' && <Field label="E-mail cadastrado" placeholder="voce@exemplo.com" value={email} onChangeText={setEmail} autoCapitalize="none" autoCorrect={false} autoComplete="email" keyboardType="email-address" />}
    {step === 'code' && <>
      <Field label="Código de recuperação" placeholder="6 números" value={code} onChangeText={value => setCode(value.replace(/\D/g, '').slice(0, 6))} keyboardType="number-pad" autoComplete="one-time-code" />
      <Note>Se não encontrar a mensagem, confira a pasta de spam. Por segurança, a resposta não informa se o e-mail possui cadastro.</Note>
    </>}
    {step === 'reset' && <>
      <Field label="Código de recuperação" placeholder="6 números" value={code} onChangeText={value => setCode(value.replace(/\D/g, '').slice(0, 6))} keyboardType="number-pad" autoComplete="one-time-code" />
      <Field label="Nova senha" placeholder="Use ao menos 6 caracteres" value={password} onChangeText={setPassword} secret autoComplete="new-password" autoCapitalize="none" autoCorrect={false} />
      <View style={{ gap: 8 }}>{passwordRules(password).map(rule => <View key={rule.label} style={{ flexDirection: 'row', gap: 8 }}><Ionicons name={password && rule.ok ? 'checkmark-circle' : 'ellipse-outline'} size={16} color={C.textMuted} /><Text style={{ flex: 1, fontSize: 12, color: C.textMuted }}>{rule.label}</Text></View>)}</View>
      <Field label="Confirmar nova senha" placeholder="Repita a nova senha" value={confirmation} onChangeText={setConfirmation} secret autoComplete="new-password" autoCapitalize="none" autoCorrect={false} />
    </>}
    {step === 'done' && <Note>A senha foi atualizada na sua conta. Entre usando a nova senha.</Note>}
  </OnboardingShell>;
}
