import { Field, Note, OnboardingShell, TextLink } from '@/components/onboarding-ui';
import { usePremiumTheme } from '@/context/theme';
import { DEMO_MODE } from '@/services/demo';
import { isValidEmail, isValidPassword, passwordRules } from '@/utils/onboarding';
import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import { useState } from 'react';
import { Text, View } from 'react-native';

export default function ForgotPasswordScreen() {
  const { colors: C } = usePremiumTheme();
  const [step, setStep] = useState<'email' | 'preview' | 'reset' | 'done'>('email');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmation, setConfirmation] = useState('');
  const [error, setError] = useState('');
  const next = () => {
    setError('');
    if (!DEMO_MODE) { setError('A recuperação está indisponível no momento. Tente novamente mais tarde.'); return; }
    if (step === 'email') {
      if (!isValidEmail(email)) { setError('Informe um e-mail válido.'); return; }
      setStep('preview');
    } else if (step === 'preview') setStep('reset');
    else if (step === 'reset') {
      if (!isValidPassword(password)) { setError('Sua nova senha precisa atender aos requisitos.'); return; }
      if (password !== confirmation) { setError('As senhas não coincidem.'); return; }
      setPassword(''); setConfirmation(''); setStep('done');
    } else router.replace('/auth/login');
  };
  return <OnboardingShell
    title={step === 'email' ? 'Vamos recuperar seu acesso.' : step === 'preview' ? 'Confira como funciona.' : step === 'reset' ? 'Um novo começo para sua senha.' : 'Prévia concluída.'}
    subtitle={step === 'email' ? 'Comece pelo e-mail da sua conta.' : step === 'preview' ? 'Em uma conta real, você receberia um link para criar uma nova senha.' : step === 'reset' ? 'Escolha uma senha longa, exclusiva e fácil de lembrar.' : 'Você percorreu a recuperação de senha. Nenhuma credencial real foi alterada.'}
    eyebrow="RECUPERAR SENHA" onBack={() => router.replace('/auth/login')} error={error}
    action={step === 'email' ? 'Continuar recuperação' : step === 'preview' ? 'Simular abertura do link' : step === 'reset' ? 'Testar nova senha' : 'Voltar ao login'} onAction={next}
    footer={step !== 'done' ? <TextLink label="Lembrei minha senha" onPress={() => router.replace('/auth/login')} /> : undefined}
  >
    {step === 'email' && <Field label="E-mail cadastrado" placeholder="voce@exemplo.com" value={email} onChangeText={setEmail} autoCapitalize="none" autoCorrect={false} autoComplete="email" keyboardType="email-address" />}
    {step === 'preview' && <Note>E-mail informado: {email.trim()}. Na versão conectada, a mensagem não confirmará se existe uma conta com esse endereço.</Note>}
    {step === 'reset' && <>
      <Field label="Nova senha" placeholder="Use uma frase com pelo menos 6 caracteres" value={password} onChangeText={setPassword} secret autoComplete="new-password" autoCapitalize="none" autoCorrect={false} />
      <View style={{ gap: 8 }}>{passwordRules(password).map(rule => <View key={rule.label} style={{ flexDirection: 'row', gap: 8 }}><Ionicons name={password && rule.ok ? 'checkmark-circle' : 'ellipse-outline'} size={16} color={C.textMuted} /><Text style={{ flex: 1, fontSize: 12, color: C.textMuted }}>{rule.label}</Text></View>)}</View>
      <Field label="Confirmar nova senha" placeholder="Repita a nova senha" value={confirmation} onChangeText={setConfirmation} secret autoComplete="new-password" autoCapitalize="none" autoCorrect={false} />
    </>}
    {DEMO_MODE && <Note>Demonstração: nenhum e-mail será enviado e nenhuma senha será armazenada ou alterada.</Note>}
  </OnboardingShell>;
}
