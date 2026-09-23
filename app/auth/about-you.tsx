import { Choice, Field, Note, OnboardingShell, TextLink } from '@/components/onboarding-ui';
import { useAuth } from '@/context/auth';
import { useOnboarding, type OnboardingDraft } from '@/context/onboarding';
import { usePremiumTheme } from '@/context/theme';
import { DEMO_MODE } from '@/services/demo';
import { ageFromBirthDate, formatBirthDate, isValidEmail, isValidPassword, measurementError, passwordRules } from '@/utils/onboarding';
import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import { type ComponentProps, useRef, useState } from 'react';
import { Keyboard, Pressable, Text, View } from 'react-native';

type Option = { label: string; description?: string; icon: ComponentProps<typeof Ionicons>['name'] };
const goals: Option[] = [
  { label: 'Perder peso', description: 'Encontrar um caminho que faça sentido para mim', icon: 'trending-down-outline' },
  { label: 'Ganhar massa', description: 'Cuidar da alimentação junto com os treinos', icon: 'barbell-outline' },
  { label: 'Manter peso', description: 'Ter mais constância e equilíbrio', icon: 'swap-horizontal-outline' },
  { label: 'Melhorar saúde', description: 'Construir uma relação melhor com a alimentação', icon: 'heart-outline' },
];
const activities: Option[] = [
  { label: 'Sedentário', description: 'Passo boa parte do dia sentado e quase não me exercito', icon: 'desktop-outline' },
  { label: 'Leve', description: 'Faço pequenas caminhadas e me movimento um pouco', icon: 'walk-outline' },
  { label: 'Moderado', description: 'Caminho bastante ou pratico exercícios regularmente', icon: 'bicycle-outline' },
  { label: 'Intenso', description: 'Tenho uma rotina fisicamente exigente ou treinos frequentes', icon: 'barbell-outline' },
  { label: 'Muito intenso', description: 'Trabalho físico pesado e/ou treinos intensos frequentes', icon: 'fitness-outline' },
];
const sources: Option[] = [
  { label: 'Meu nutri está aqui', description: 'Quero conectar minha conta ao profissional', icon: 'person-add-outline' },
  { label: 'Indicação de um nutri', icon: 'medkit-outline' },
  { label: 'Redes sociais', icon: 'phone-portrait-outline' },
  { label: 'Amigos ou família', icon: 'people-outline' },
  { label: 'Busca ou loja de apps', icon: 'search-outline' },
  { label: 'Outro caminho', icon: 'compass-outline' },
];
const adaptive: Record<string, { title: string; options: string[] }> = {
  'Perder peso': { title: 'O que mais desafia sua rotina?', options: ['Organizar as refeições', 'Encontrar constância', 'Entender meus hábitos'] },
  'Ganhar massa': { title: 'Como está sua rotina de treinos?', options: ['Não treino', 'Estou começando', 'Já treino regularmente', 'Quero retomar meus treinos'] },
  'Manter peso': { title: 'O que você quer manter em equilíbrio?', options: ['Horários das refeições', 'Variedade no prato', 'Alimentação e movimento'] },
  'Melhorar saúde': { title: 'Por onde você gostaria de começar?', options: ['Ter mais disposição', 'Variar minha alimentação', 'Organizar minha rotina'] },
};

export default function AboutYouScreen() {
  const { draft: d, update: updateDraft, reset } = useOnboarding();
  const { register } = useAuth();
  const { colors: C, isDark } = usePremiumTheme();
  const [password, setPassword] = useState('');
  const [confirmation, setConfirmation] = useState('');
  const [accepted, setAccepted] = useState(false);
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);
  const submitting = useRef(false);
  const update = (data: Partial<OnboardingDraft>) => { setError(''); updateDraft(data); };
  const step = d.step;
  const first = d.name.trim().split(' ')[0];
  const question = adaptive[d.goal] ?? adaptive['Melhorar saúde'];
  const accent = isDark ? C.primaryLight : C.primaryDark;
  const go = (next: number) => { Keyboard.dismiss(); setError(''); update({ step: next }); };
  const chooseSource = (origin: string) => {
    update({ origin, nutritionist: null, nutriCode: '', followupPreference: origin === 'Meu nutri está aqui' ? 'existing' : 'later' });
    setError('');
    if (origin === 'Meu nutri está aqui') {
      Keyboard.dismiss();
      router.push({ pathname: '/auth/nutri-code', params: { mode: 'onboarding' } });
    }
  };
  const toggleRestriction = (label: string) => {
    if (label === 'Nenhuma') { update({ restrictions: ['Nenhuma'] }); return; }
    const values = d.restrictions.filter(item => item !== 'Nenhuma');
    const compatible = label === 'Vegetariana' ? values.filter(item => item !== 'Vegana') : label === 'Vegana' ? values.filter(item => item !== 'Vegetariana') : values;
    update({ restrictions: compatible.includes(label) ? compatible.filter(item => item !== label) : [...compatible, label] });
  };
  const validate = () => {
    if (step === 0 && d.name.trim().length < 2) return 'Como podemos chamar você? Escreva pelo menos 2 caracteres.';
    if (step === 1 && ageFromBirthDate(d.birthDate) === null) return 'Confira a data de nascimento. Use DD/MM/AAAA e uma data real, no passado.';
    if (step === 1 && !d.sexo) return 'Selecione uma opção de sexo. Você pode escolher não informar.';
    if (step === 2 && !d.goal) return 'Escolha o objetivo que mais combina com você agora.';
    if (step === 3 && !d.motivation) return 'Selecione a resposta que melhor descreve seu momento.';
    if (step === 4 && !d.activityLevel) return 'Como é seu movimento no dia a dia? Selecione uma opção.';
    if (step === 5) return measurementError(d.weight, d.height, d.targetWeight, d.goal);
    if (step === 6 && !d.restrictions.length) return 'Selecione suas preferências ou a opção Nenhuma.';
    if (step === 7 && !d.origin) return 'Conte por onde chegou até nós.';
    if (step === 8 && !isValidEmail(d.email)) return 'Informe um e-mail válido, como voce@exemplo.com.';
    if (step === 8 && !isValidPassword(password)) return 'Confira os requisitos da senha abaixo do campo.';
    if (step === 8 && confirmation !== password) return 'As senhas não coincidem. Digite a mesma senha nos dois campos.';
    if (step === 8 && !accepted) return 'Leia e aceite os termos e a política de privacidade para continuar.';
    return '';
  };
  const next = async () => {
    if (submitting.current) return;
    const message = validate();
    if (message) { setError(message); return; }
    if (step < 8) { go(step + 1); return; }
    submitting.current = true;
    setBusy(true);
    setError('');
    try {
      const result = await register({
        name: d.name.trim(), email: d.email.trim().toLowerCase(), password, birthDate: d.birthDate,
        sexo: d.sexo, goal: d.goal, activityLevel: d.activityLevel, weight: d.weight, height: d.height,
        targetWeight: d.targetWeight, waterGoal: '', restrictions: d.restrictions.join(', '),
        healthNote: d.healthNote, motivation: d.motivation, origin: d.origin, followupPreference: d.followupPreference,
        nutriCode: d.nutriCode, nutricionistaId: d.nutritionist?.id,
      });
      if (!result.success) { setError(result.error ?? 'Não foi possível criar seu perfil. Tente novamente.'); return; }
      setPassword('');
      setConfirmation('');
      reset();
      router.replace('/auth/success');
    } catch {
      setError('Não foi possível concluir agora. Suas respostas continuam aqui; tente novamente.');
    } finally {
      submitting.current = false;
      setBusy(false);
    }
  };

  const titles = [
    'Vamos começar por você.',
    `Prazer, ${first || 'vamos lá'}!`,
    'O que te trouxe até aqui?',
    question.title,
    'Como é o seu dia a dia?',
    'Um ponto de partida.',
    'Seu prato, suas escolhas.',
    'Como nossos caminhos se cruzaram?',
    `Seu próximo capítulo, ${first || 'vamos lá'}.`,
  ];
  const subtitles = [
    'Uma conversa rápida para conhecer seu momento. Tudo no seu ritmo.',
    'Mais duas informações para conhecer seu perfil.',
    'Seu objetivo pode mudar. Escolha o que importa neste momento.',
    'Cada rotina é única. Vamos conhecer a sua um pouco melhor.',
    'Pense no trabalho, nos deslocamentos e nos exercícios, não só na academia.',
    'Essas informações ajudam a compor seu perfil. Não são uma avaliação de saúde.',
    'Tem alguma preferência ou cuidado alimentar? Pode marcar mais de um.',
    'E, se você já tem um nutricionista na NutriFybe, vamos conectar vocês.',
    'Seu perfil está pronto. Falta criar seu acesso para começar.',
  ];

  return <OnboardingShell title={titles[step]} subtitle={subtitles[step]} step={step} total={9}
    eyebrow={step < 2 ? 'VAMOS NOS CONHECER' : step < 7 ? 'UM PERFIL COM A SUA CARA' : 'QUASE LÁ'}
    onBack={() => { if (step > 0) go(step - 1); else router.replace('/auth/welcome'); }}
    action={step === 0 ? 'Vamos nos conhecer' : step === 8 ? 'Criar minha conta' : 'Continuar'}
    onAction={next} busy={busy} error={error}
    footer={step === 0 ? <TextLink label="Já tenho conta" onPress={() => router.push('/auth/login')} /> : <Text style={{ color: C.textMuted, textAlign: 'center', fontSize: 11, paddingTop: 6 }}>Você pode voltar e ajustar suas respostas.</Text>}
  >
    {step === 0 && <>
      <Field label="Como podemos chamar você?" placeholder="Seu nome" value={d.name} onChangeText={name => update({ name })} autoCapitalize="words" autoComplete="name" maxLength={80} returnKeyType="next" onSubmitEditing={next} />
      <Note>Primeiro, seu momento. Depois, sua rotina. No final, criamos juntos um perfil que faz sentido para você.</Note>
      {DEMO_MODE && <Text style={{ color: C.textMuted, fontSize: 12, lineHeight: 18 }}>Modo demonstração: você pode usar dados fictícios. O perfil fica apenas nesta sessão.</Text>}
    </>}
    {step === 1 && <>
      <Field label="Data de nascimento" placeholder="DD/MM/AAAA" value={d.birthDate} onChangeText={value => update({ birthDate: formatBirthDate(value) })} keyboardType="number-pad" maxLength={10} />
      <Text style={{ color: C.text, fontWeight: '600', marginTop: 4 }}>Sexo</Text>
      {['Feminino', 'Masculino', 'Intersexo', 'Prefiro não informar'].map(label => <Choice key={label} label={label} selected={d.sexo === label} onPress={() => update({ sexo: label })} icon="person-outline" />)}
    </>}
    {step === 2 && goals.map(option => <Choice key={option.label} {...option} selected={d.goal === option.label} onPress={() => update({ goal: option.label, motivation: '', targetWeight: '' })} />)}
    {step === 3 && <>
      {question.options.map(label => <Choice key={label} label={label} selected={d.motivation === label} onPress={() => update({ motivation: label })} icon={d.goal === 'Ganhar massa' ? 'barbell-outline' : 'sparkles-outline'} />)}
      {!!d.motivation && <Note>{first}, seu ponto de partida é único. Essa resposta vai fazer parte do seu perfil.</Note>}
    </>}
    {step === 4 && activities.map(option => <Choice key={option.label} {...option} selected={d.activityLevel === option.label} onPress={() => update({ activityLevel: option.label })} />)}
    {step === 5 && <>
      <Field label="Peso atual (kg)" placeholder="Ex.: 70,5" value={d.weight} onChangeText={weight => update({ weight })} keyboardType="decimal-pad" maxLength={6} />
      <Field label="Altura (cm)" placeholder="Ex.: 170" value={d.height} onChangeText={height => update({ height })} keyboardType="decimal-pad" maxLength={6} />
      {['Perder peso', 'Ganhar massa'].includes(d.goal) && <Field label="Peso desejado (opcional)" placeholder="Você pode decidir depois" value={d.targetWeight} onChangeText={targetWeight => update({ targetWeight })} keyboardType="decimal-pad" maxLength={6} />}
      <Note>Mais do que números, queremos conhecer sua rotina. Um nutricionista pode ajudar a definir suas metas.</Note>
    </>}
    {step === 6 && <>
      {['Nenhuma', 'Vegetariana', 'Vegana', 'Sem lactose', 'Sem glúten', 'Outras'].map(label => <Choice key={label} label={label} multiple icon="restaurant-outline" selected={d.restrictions.includes(label)} onPress={() => toggleRestriction(label)} />)}
      <Field label="Algo mais que devemos saber? (opcional)" placeholder="Alergias, intolerâncias ou outros cuidados" value={d.healthNote} onChangeText={healthNote => update({ healthNote })} multiline maxLength={300} />
    </>}
    {step === 7 && <>
      {sources.map(option => <Choice key={option.label} {...option} selected={d.origin === option.label} onPress={() => chooseSource(option.label)} />)}
      <Note>Com um nutricionista, você pode reunir seu plano e o acompanhamento em um só lugar. A conexão também pode ser feita depois.</Note>
      {d.origin !== 'Meu nutri está aqui' && <Choice label="Quero conhecer os nutricionistas" description="Ver os profissionais depois do cadastro" icon="people-outline" multiple selected={d.followupPreference === 'explore'} onPress={() => update({ followupPreference: d.followupPreference === 'explore' ? 'later' : 'explore' })} />}
    </>}
    {step === 8 && <>
      <Note>{d.goal} · Atividade: {d.activityLevel}.{d.nutritionist ? ` Conectar com ${d.nutritionist.nome} ao criar a conta.` : ' Você pode conectar um nutricionista depois.'}</Note>
      <Field label="E-mail" placeholder="voce@exemplo.com" value={d.email} onChangeText={email => update({ email })} autoCapitalize="none" autoCorrect={false} keyboardType="email-address" autoComplete="email" maxLength={254} />
      <Field label="Criar senha" placeholder="Use uma senha forte" value={password} onChangeText={setPassword} secret autoCapitalize="none" autoCorrect={false} autoComplete="new-password" textContentType="newPassword" />
      <Field label="Confirmar senha" placeholder="Repita a senha" value={confirmation} onChangeText={setConfirmation} secret autoCapitalize="none" autoCorrect={false} autoComplete="new-password" textContentType="newPassword" />
      <View style={{ gap: 8 }}>
        {passwordRules(password).map(rule => <View key={rule.label} style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}><Ionicons name={password && rule.ok ? 'checkmark-circle' : 'ellipse-outline'} size={16} color={password && rule.ok ? accent : C.textMuted} /><Text style={{ flex: 1, fontSize: 12, color: C.textMuted }}>{rule.label}</Text></View>)}
        <Text style={{ fontSize: 12, lineHeight: 18, color: C.textMuted }}>Espaços, números e símbolos são bem-vindos. Use uma senha exclusiva.</Text>
      </View>
      <Pressable accessibilityRole="checkbox" accessibilityLabel="Aceito os termos e a política de privacidade" accessibilityState={{ checked: accepted }} onPress={() => setAccepted(value => !value)} style={{ flexDirection: 'row', alignItems: 'center', minHeight: 48, gap: 10 }}>
        <Ionicons name={accepted ? 'checkbox' : 'square-outline'} color={accent} size={24} /><Text style={{ flex: 1, fontSize: 13, color: C.textMuted, lineHeight: 20 }}>Li e aceito os termos e a política de privacidade.</Text>
      </Pressable>
      <View style={{ flexDirection: 'row', justifyContent: 'space-evenly', gap: 12 }}><TextLink label="Ler termos" outlined onPress={() => router.push('/institutional/terms')} /><TextLink label="Privacidade" outlined onPress={() => router.push('/institutional/privacy')} /></View>
      <TextLink label="Revisar minhas respostas" onPress={() => go(0)} />
    </>}
  </OnboardingShell>;
}
