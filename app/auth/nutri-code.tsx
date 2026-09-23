import { Field, Note, OnboardingShell, TextLink } from '@/components/onboarding-ui';
import { useAuth } from '@/context/auth';
import { useOnboarding } from '@/context/onboarding';
import { usePremiumTheme } from '@/context/theme';
import { DEMO_MODE, DEMO_NUTRI_CODE, findNutritionist } from '@/services/demo';
import type { Nutricionista } from '@/services/api';
import { Redirect, router, useLocalSearchParams } from 'expo-router';
import { useRef, useState } from 'react';
import { Text } from 'react-native';

export default function NutriCodeScreen() {
  const { mode } = useLocalSearchParams<{ mode?: string }>();
  const onboarding = mode === 'onboarding';
  const { draft, update } = useOnboarding();
  const { user, solicitarVinculo } = useAuth();
  const { colors: C } = usePremiumTheme();
  const [code, setCode] = useState(draft.nutriCode);
  const [selected, setSelected] = useState<Nutricionista | null>(null);
  const [deferred, setDeferred] = useState(false);
  const [linked, setLinked] = useState(false);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');
  const pending = useRef(false);

  if (onboarding && !draft.name) return <Redirect href="/auth/about-you" />;
  if (!onboarding && !user) return <Redirect href="/auth/login" />;

  const resume = () => {
    if (router.canGoBack()) router.back();
    else router.replace(onboarding ? '/auth/about-you' : '/(tabs)/plan');
  };
  const continueWithout = () => {
    if (onboarding) update({ nutritionist: null, nutriCode: '', followupPreference: 'later', step: 8 });
    resume();
  };
  const submit = async () => {
    if (pending.current) return;
    if (linked) { router.replace('/(tabs)/plan'); return; }
    if (deferred) { continueWithout(); return; }
    if (!/^\d{1,12}$/.test(code.trim())) { setError('Digite o ID numérico que seu nutricionista compartilhou.'); return; }
    if (selected && onboarding) {
      update({ nutritionist: { id: selected.id, nome: selected.nome, crn: selected.crn }, nutriCode: code.trim(), followupPreference: 'existing', step: 8 });
      resume();
      return;
    }
    pending.current = true;
    setBusy(true);
    setError('');
    try {
      if (selected) {
        const result = await solicitarVinculo(code.trim());
        if (!result.success) setError(result.error ?? 'Não foi possível conectar agora.');
        else setLinked(true);
      } else {
        const nutri = await findNutritionist(code.trim());
        if (!nutri) setError(DEMO_MODE ? 'Código não encontrado. Para testar esta prévia, use 1234.' : 'Não encontramos um profissional ativo com esse ID. Confira o código.');
        else setSelected(nutri);
      }
    } catch { setError('Não foi possível conferir o código. Tente novamente ou adicione depois.'); }
    finally { pending.current = false; setBusy(false); }
  };
  return <OnboardingShell
    title={linked ? 'Vocês já estão conectados.' : deferred ? 'Pode ser depois.' : selected ? 'Encontramos seu nutri.' : 'Seu nutri, mais perto.'}
    subtitle={linked ? 'O acompanhamento de demonstração está disponível no seu plano.' : deferred ? 'Siga com seu cadastro. Você pode informar o código depois, na área de acompanhamento.' : selected ? 'Confira o profissional antes de continuar.' : 'Peça ao seu nutricionista o ID da conta dele na NutriFybe.'}
    eyebrow="ACOMPANHAMENTO COM NUTRICIONISTA"
    onBack={resume} busy={busy} error={error} onAction={submit}
    action={linked ? 'Ir para meu plano' : deferred ? (onboarding ? 'Continuar meu cadastro' : 'Voltar ao plano') : selected ? (onboarding ? 'Confirmar e continuar' : 'Conectar nutricionista') : 'Encontrar meu nutricionista'}
    footer={!linked && !deferred ? <TextLink label="Não tenho o código agora" onPress={() => { setDeferred(true); setError(''); }} /> : undefined}
  >
    {!deferred && !linked && <Field label="ID do nutricionista" placeholder="Ex.: 1234" value={code} onChangeText={value => { setCode(value.replace(/\D/g, '')); setSelected(null); setError(''); }} keyboardType="number-pad" maxLength={12} />}
    {selected && !deferred && <Note>{selected.nome}{'\n'}{selected.especialidade || 'Nutricionista'} · CRN {selected.crn}{DEMO_MODE ? '\nPerfil de demonstração' : ''}</Note>}
    {selected && onboarding && !deferred && <Text style={{ color: C.textMuted, fontSize: 13, lineHeight: 20 }}>A conexão será feita ao concluir a criação da sua conta.</Text>}
    {deferred && <Note>Você continua tendo acesso ao app. Quando estiver com o código, abra seu plano e toque em Vincular nutricionista.</Note>}
    {DEMO_MODE && !deferred && !linked && <Note>Para testar, use o código {DEMO_NUTRI_CODE}. A conexão acontece somente nesta demonstração.</Note>}
  </OnboardingShell>;
}
