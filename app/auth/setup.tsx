import { useAuth } from '@/context/auth';
import { usePremiumTheme } from '@/context/theme';
import { useAppLayout } from '@/hooks/useAppLayout';
import { Ionicons } from '@expo/vector-icons';
import { router, useLocalSearchParams } from 'expo-router';
import { useRef, useState } from 'react';
import { ActivityIndicator, Alert, Animated, KeyboardAvoidingView, Platform, ScrollView, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';

const GOALS = [
  { label: 'Perder peso',        icon: '🔥', desc: 'Déficit calórico saudável' },
  { label: 'Ganhar massa',       icon: '💪', desc: 'Superávit com foco em proteína' },
  { label: 'Manter peso',        icon: '⚖️', desc: 'Equilíbrio nutricional' },
  { label: 'Melhorar saúde',     icon: '🌿', desc: 'Alimentação equilibrada' },
  { label: 'Controlar diabetes', icon: '🩺', desc: 'Controle glicêmico' },
];

const ACTIVITY_LEVELS = [
  { label: 'Sedentário',    icon: '🛋️', desc: 'Pouco ou nenhum exercício' },
  { label: 'Leve',          icon: '🚶', desc: '1–3 dias/semana' },
  { label: 'Moderado',      icon: '🚴', desc: '3–5 dias/semana' },
  { label: 'Intenso',       icon: '🏋️', desc: '6–7 dias/semana' },
  { label: 'Muito intenso', icon: '🏆', desc: 'Atleta / 2x ao dia' },
];

const RESTRICTIONS = [
  { label: 'Nenhuma',     icon: '✅' },
  { label: 'Vegetariano', icon: '🥦' },
  { label: 'Vegano',      icon: '🌱' },
  { label: 'Sem glúten',  icon: '🌾' },
  { label: 'Sem lactose', icon: '🥛' },
  { label: 'Low carb',    icon: '🥩' },
];

const ORIGINS = [
  { label: 'Instagram',                 icon: '📸' },
  { label: 'Indicação de amigo',        icon: '👥' },
  { label: 'Google / App Store',        icon: '🔍' },
  { label: 'Meu nutricionista indicou', icon: '👩⚕️' },
  { label: 'Tenho nutricionista aqui',  icon: '🔗' },
];

const TOTAL_STEPS = 6;

export default function SetupScreen() {
  const { register } = useAuth();
  const { colors: C } = usePremiumTheme();
  const { topPad } = useAppLayout();
  const params = useLocalSearchParams<{ name: string; email: string; password: string; birthDate: string; sexo: string }>();

  const [step, setStep]                 = useState(0);
  const [goal, setGoal]                 = useState('');
  const [activity, setActivity]         = useState('');
  const [restrictions, setRestrictions] = useState<string[]>([]);
  const [weight, setWeight]             = useState('');
  const [height, setHeight]             = useState('');
  const [targetWeight, setTargetWeight] = useState('');
  const [water, setWater]               = useState('2');
  const [origin, setOrigin]             = useState('');

  const slideAnim = useRef(new Animated.Value(0)).current;

  const animateNext = (cb: () => void) => {
    Animated.sequence([
      Animated.timing(slideAnim, { toValue: -30, duration: 150, useNativeDriver: true }),
      Animated.timing(slideAnim, { toValue: 0,   duration: 0,   useNativeDriver: true }),
    ]).start(cb);
  };

  const goNext = () => animateNext(() => setStep(s => s + 1));
  const goBack = () => {
    if (step === 0) { router.back(); return; }
    animateNext(() => setStep(s => s - 1));
  };

  const toggleRestriction = (label: string) => {
    if (label === 'Nenhuma') { setRestrictions(['Nenhuma']); return; }
    setRestrictions(prev => {
      const without = prev.filter(r => r !== 'Nenhuma');
      return without.includes(label) ? without.filter(r => r !== label) : [...without, label];
    });
  };

  const wn = parseFloat(weight), hn = parseFloat(height) / 100;
  const bmi = wn && hn ? (wn / (hn * hn)).toFixed(1) : null;
  const hasNutri = origin === 'Tenho nutricionista aqui';

  const [registering, setRegistering] = useState(false);

  const finish = async () => {
    if (!weight || !height || !targetWeight)
      return Alert.alert('Erro', 'Preencha peso, altura e peso meta.');
    setRegistering(true);
    const result = await register({
      name: params.name, email: params.email, password: params.password,
      weight, height, targetWeight, waterGoal: water, goal,
      birthDate: params.birthDate, sexo: params.sexo,
      activityLevel: activity,
      restrictions: restrictions.join(', '),
      origin,
    });
    setRegistering(false);
    if (!result.success) {
      Alert.alert('Erro', result.error || 'Não foi possível criar a conta.');
      return;
    }
    // Só vai para nutri-code se escolheu "Tenho nutricionista aqui"
    // "Meu nutricionista indicou" = só informativo, não vincula
    router.replace(hasNutri ? '/auth/nutri-code' : '/auth/success');
  };

  const steps = [
    {
      title: 'Qual é seu objetivo? 🎯',
      subtitle: 'Isso define seu plano nutricional.',
      canNext: !!goal,
      content: (
        <View style={s.optionList}>
          {GOALS.map(g => (
            <TouchableOpacity key={g.label}
              style={[s.optionCard, { backgroundColor: C.surface, borderColor: goal === g.label ? C.primary : C.border },
                      goal === g.label && { backgroundColor: C.primarySoft }]}
              onPress={() => setGoal(g.label)} activeOpacity={0.8}>
              <Text style={s.optionIcon}>{g.icon}</Text>
              <View style={{ flex: 1 }}>
                <Text style={[s.optionLabel, { color: goal === g.label ? C.primary : C.text }]}>{g.label}</Text>
                <Text style={[s.optionDesc, { color: C.textMuted }]}>{g.desc}</Text>
              </View>
              {goal === g.label && <Ionicons name="checkmark-circle" size={22} color={C.primary} />}
            </TouchableOpacity>
          ))}
        </View>
      ),
    },
    {
      title: 'Nível de atividade física 🏃',
      subtitle: 'Com que frequência você se exercita?',
      canNext: !!activity,
      content: (
        <View style={s.optionList}>
          {ACTIVITY_LEVELS.map(a => (
            <TouchableOpacity key={a.label}
              style={[s.optionCard, { backgroundColor: C.surface, borderColor: activity === a.label ? C.primary : C.border },
                      activity === a.label && { backgroundColor: C.primarySoft }]}
              onPress={() => setActivity(a.label)} activeOpacity={0.8}>
              <Text style={s.optionIcon}>{a.icon}</Text>
              <View style={{ flex: 1 }}>
                <Text style={[s.optionLabel, { color: activity === a.label ? C.primary : C.text }]}>{a.label}</Text>
                <Text style={[s.optionDesc, { color: C.textMuted }]}>{a.desc}</Text>
              </View>
              {activity === a.label && <Ionicons name="checkmark-circle" size={22} color={C.primary} />}
            </TouchableOpacity>
          ))}
        </View>
      ),
    },
    {
      title: 'Restrições alimentares 🥗',
      subtitle: 'Selecione todas que se aplicam.',
      canNext: restrictions.length > 0,
      content: (
        <View style={s.chipGrid}>
          {RESTRICTIONS.map(r => {
            const active = restrictions.includes(r.label);
            return (
              <TouchableOpacity key={r.label}
                style={[s.chip, { backgroundColor: C.surface, borderColor: active ? C.primary : C.border },
                        active && { backgroundColor: C.primarySoft }]}
                onPress={() => toggleRestriction(r.label)} activeOpacity={0.8}>
                <Text style={s.chipIcon}>{r.icon}</Text>
                <Text style={[s.chipLabel, { color: active ? C.primary : C.textMuted }]}>{r.label}</Text>
              </TouchableOpacity>
            );
          })}
        </View>
      ),
    },
    {
      title: 'Suas medidas 📏',
      subtitle: 'Usamos para calcular suas necessidades calóricas.',
      canNext: !!(weight && height && targetWeight),
      content: (
        <View style={{ gap: 12 }}>
          {[
            { icon: 'scale-outline'  as const, placeholder: 'Peso atual (kg)',  value: weight,       set: setWeight       },
            { icon: 'resize-outline' as const, placeholder: 'Altura (cm)',      value: height,       set: setHeight       },
            { icon: 'flag-outline'   as const, placeholder: 'Peso meta (kg)',   value: targetWeight, set: setTargetWeight },
            { icon: 'water-outline'  as const, placeholder: 'Meta de água (L)', value: water,        set: setWater        },
          ].map((f, i) => (
            <View key={i} style={[s.fieldWrap, { backgroundColor: C.surface, borderColor: C.border }]}>
              <Ionicons name={f.icon} size={18} color={C.textMuted} style={s.fieldIcon} />
              <TextInput style={[s.input, { color: C.text }]} placeholder={f.placeholder}
                placeholderTextColor={C.textDim} value={f.value} onChangeText={f.set} keyboardType="numeric" />
            </View>
          ))}
          {bmi && (
            <View style={[s.bmiCard, { backgroundColor: C.primarySoft }]}>
              <Ionicons name="body-outline" size={18} color={C.primary} />
              <Text style={[s.bmiText, { color: C.text }]}>IMC estimado: <Text style={{ color: C.primary, fontWeight: '800' }}>{bmi}</Text></Text>
            </View>
          )}
        </View>
      ),
    },
    // Step 4 — Acompanhamento profissional (apresentado como opção, não venda)
    {
      title: 'Acompanhamento profissional 👩⚕️',
      subtitle: 'Se você já tem um nutricionista, pode conectar aqui.',
      canNext: true,
      content: (
        <View style={{ gap: 14 }}>
          <View style={[s.nutriCard, { backgroundColor: C.surface, borderColor: C.border }]}>
            <View style={[s.nutriIconWrap, { backgroundColor: C.primarySoft }]}>
              <Ionicons name="person-outline" size={24} color={C.primary} />
            </View>
            <Text style={[s.nutriTitle, { color: C.text }]}>Tem um nutricionista?</Text>
            <Text style={[s.nutriDesc, { color: C.textMuted }]}>
              Conecte sua conta para sincronizar seu plano alimentar diretamente com o profissional que te acompanha.
            </Text>
            <TouchableOpacity
              style={[s.btnOutline, { borderColor: C.primary }]}
              onPress={goNext} activeOpacity={0.85}>
              <Text style={[s.btnOutlineText, { color: C.primary }]}>Sim, quero conectar</Text>
            </TouchableOpacity>
          </View>

          <TouchableOpacity onPress={goNext} style={s.skipRow}>
            <Text style={[s.skipText, { color: C.textDim }]}>Não tenho, continuar</Text>
            <Ionicons name="arrow-forward" size={14} color={C.textDim} />
          </TouchableOpacity>
        </View>
      ),
    },
    {
      title: 'Como nos conheceu? 🔍',
      subtitle: 'Nos ajuda a melhorar o app.',
      canNext: !!origin,
      content: (
        <View style={s.optionList}>
          {ORIGINS.map(o => (
            <TouchableOpacity key={o.label}
              style={[s.optionCard, { backgroundColor: C.surface, borderColor: origin === o.label ? C.primary : C.border },
                      origin === o.label && { backgroundColor: C.primarySoft }]}
              onPress={() => setOrigin(o.label)} activeOpacity={0.8}>
              <Text style={s.optionIcon}>{o.icon}</Text>
              <Text style={[s.optionLabel, { flex: 1, color: origin === o.label ? C.primary : C.text }]}>{o.label}</Text>
              {origin === o.label && <Ionicons name="checkmark-circle" size={22} color={C.primary} />}
            </TouchableOpacity>
          ))}
        </View>
      ),
    },
  ];

  const current = steps[step];
  const isLastStep = step === TOTAL_STEPS - 1;

  return (
    <KeyboardAvoidingView style={[s.screen, { backgroundColor: C.bg }]} behavior={Platform.OS === 'ios' ? 'padding' : 'height'}>
      <View style={[s.blob, { backgroundColor: C.primarySoft }]} />
      <ScrollView
        contentContainerStyle={[s.scroll, { paddingTop: topPad + 16 }]}
        keyboardShouldPersistTaps="handled"
        bounces={false}
        showsVerticalScrollIndicator={false}
      >
        <View style={s.topRow}>
          <TouchableOpacity style={[s.backBtn, { backgroundColor: C.surface, borderColor: C.border }]} onPress={goBack}>
            <Ionicons name="arrow-back" size={20} color={C.primary} />
          </TouchableOpacity>
          <Text style={[s.stepCounter, { color: C.textMuted }]}>{step + 1} / {TOTAL_STEPS}</Text>
        </View>

        <View style={s.progressRow}>
          {Array.from({ length: TOTAL_STEPS }).map((_, i) => (
            <View key={i} style={[s.progressBar, { backgroundColor: i <= step ? C.primary : C.border }]} />
          ))}
        </View>

        <Animated.View style={{ transform: [{ translateX: slideAnim }] }}>
          <Text style={[s.title, { color: C.text }]}>{current.title}</Text>
          <Text style={[s.subtitle, { color: C.textMuted }]}>{current.subtitle}</Text>
          <View style={s.contentWrap}>{current.content}</View>
        </Animated.View>

        {step !== 4 && (
          <TouchableOpacity
            style={[s.btnPrimary, { backgroundColor: C.primary, shadowColor: C.primary }, !current.canNext && s.btnDisabled]}
            onPress={isLastStep ? finish : goNext}
            activeOpacity={0.85}
            disabled={!current.canNext || registering}
          >
            <Text style={s.btnPrimaryText}>
              {isLastStep ? (hasNutri ? 'Vincular nutricionista' : 'Criar minha conta') : 'Continuar'}
            </Text>
            {registering
              ? <ActivityIndicator color="#fff" />
              : <Ionicons name={isLastStep ? 'checkmark-circle-outline' : 'arrow-forward'} size={18} color="#fff" />
            }
          </TouchableOpacity>
        )}

        <View style={{ height: 40 }} />
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const s = StyleSheet.create({
  screen:       { flex: 1 },
  blob:         { position: 'absolute', top: -120, right: -100, width: 340, height: 340, borderRadius: 170 },
  scroll:       { flexGrow: 1, paddingHorizontal: 24, gap: 14 },
  topRow:       { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 16 },
  backBtn:      { width: 42, height: 42, borderRadius: 14, alignItems: 'center', justifyContent: 'center', borderWidth: 1 },
  stepCounter:  { fontSize: 13, fontWeight: '600' },
  progressRow:  { flexDirection: 'row', gap: 5, marginBottom: 24 },
  progressBar:  { flex: 1, height: 4, borderRadius: 2 },
  title:        { fontSize: 28, fontWeight: '900', letterSpacing: -0.5, marginBottom: 6 },
  subtitle:     { fontSize: 14, marginBottom: 20 },
  contentWrap:  { gap: 10 },
  optionList:   { gap: 10 },
  optionCard:   { flexDirection: 'row', alignItems: 'center', gap: 14, borderRadius: 16, padding: 16, borderWidth: 1.5 },
  optionIcon:   { fontSize: 24, width: 32, textAlign: 'center' },
  optionLabel:  { fontSize: 15, fontWeight: '700' },
  optionDesc:   { fontSize: 12, marginTop: 2 },
  chipGrid:     { flexDirection: 'row', flexWrap: 'wrap', gap: 10 },
  chip:         { flexDirection: 'row', alignItems: 'center', gap: 8, borderRadius: 50, paddingVertical: 10, paddingHorizontal: 16, borderWidth: 1.5 },
  chipIcon:     { fontSize: 16 },
  chipLabel:    { fontSize: 14, fontWeight: '600' },
  fieldWrap:    { flexDirection: 'row', alignItems: 'center', borderRadius: 16, borderWidth: 1, paddingHorizontal: 16, height: 56 },
  fieldIcon:    { marginRight: 12 },
  input:        { flex: 1, fontSize: 15 },
  bmiCard:      { flexDirection: 'row', alignItems: 'center', gap: 10, borderRadius: 12, padding: 14 },
  bmiText:      { fontSize: 14, fontWeight: '500' },
  nutriCard:    { borderRadius: 20, padding: 20, borderWidth: 1, gap: 12, alignItems: 'flex-start' },
  nutriIconWrap:{ width: 48, height: 48, borderRadius: 14, alignItems: 'center', justifyContent: 'center' },
  nutriTitle:   { fontSize: 17, fontWeight: '800' },
  nutriDesc:    { fontSize: 14, lineHeight: 20 },
  btnOutline:   { borderRadius: 14, height: 48, alignItems: 'center', justifyContent: 'center', borderWidth: 1.5, paddingHorizontal: 20, alignSelf: 'stretch' },
  btnOutlineText:{ fontSize: 15, fontWeight: '700' },
  skipRow:      { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 6, paddingVertical: 8 },
  skipText:     { fontSize: 14, fontWeight: '500' },
  btnPrimary:   { borderRadius: 16, height: 56, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8, marginTop: 8,
                  shadowOffset: { width: 0, height: 6 }, shadowOpacity: 0.3, shadowRadius: 16, elevation: 8 },
  btnDisabled:  { opacity: 0.4 },
  btnPrimaryText:{ fontSize: 17, fontWeight: '800', color: '#fff' },
});
