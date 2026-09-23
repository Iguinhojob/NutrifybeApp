import { Field, Note, OnboardingShell, TextLink } from '@/components/onboarding-ui';
import { useAuth } from '@/context/auth';
import { DEMO_MODE } from '@/services/demo';
import { isValidEmail } from '@/utils/onboarding';
import { router } from 'expo-router';
import { useState } from 'react';

export default function LoginScreen() {
  const { login, loading, clearError, error: authError } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const enter = async (preview = false) => {
    if (loading) return;
    setError('');
    clearError();
    if (!preview && (!isValidEmail(email) || !password)) { setError('Informe um e-mail válido e sua senha.'); return; }
    const ok = await login(preview ? 'visitante@example.test' : email.trim().toLowerCase(), preview ? 'demo' : password);
    if (ok) { setPassword(''); router.replace('/(tabs)'); }
  };
  return <OnboardingShell title="Bom ter você de volta." subtitle="Seu próximo passo começa por aqui." eyebrow="SEU ESPAÇO DE BEM-ESTAR"
    onBack={() => router.replace('/auth/welcome')} action="Entrar na minha conta" onAction={() => enter()} busy={loading} error={error || authError || ''}
    footer={<><TextLink label="Criar conta gratuita" onPress={() => router.push('/auth/about-you')} />{DEMO_MODE && <TextLink label="Explorar demonstração sem cadastro" onPress={() => enter(true)} />}</>}
  >
    <Field label="E-mail" placeholder="voce@exemplo.com" value={email} onChangeText={setEmail} autoCapitalize="none" autoCorrect={false} autoComplete="email" keyboardType="email-address" />
    <Field label="Senha" placeholder="Sua senha" value={password} onChangeText={setPassword} secret autoCapitalize="none" autoCorrect={false} autoComplete="current-password" onSubmitEditing={() => enter()} />
    <TextLink label="Recuperar senha" onPress={() => router.push('/auth/forgot-password')} />
    {DEMO_MODE && <Note>Modo demonstração: acesso livre, sem autenticação real. Evite usar sua senha pessoal.</Note>}
  </OnboardingShell>;
}
