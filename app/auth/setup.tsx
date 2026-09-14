import { useAuth } from '@/context/auth';
import { router, useLocalSearchParams } from 'expo-router';
import { useState } from 'react';
import { Alert, KeyboardAvoidingView, Platform, ScrollView, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { D, GRAD, GRAD_REV } from '@/constants/darkTheme';

const GOALS = [
  { label: 'Perder peso',    icon: 'flame-outline'   as const, desc: 'Déficit calórico saudável' },
  { label: 'Ganhar massa',   icon: 'barbell-outline' as const, desc: 'Superávit com foco em proteína' },
  { label: 'Manter peso',    icon: 'scale-outline'   as const, desc: 'Equilíbrio nutricional' },
  { label: 'Melhorar saúde', icon: 'leaf-outline'    as const, desc: 'Alimentação equilibrada' },
];

function calcBMI(w: string, h: string) {
  const wn = parseFloat(w), hn = parseFloat(h) / 100;
  if (!wn || !hn) return null;
  return (wn / (hn * hn)).toFixed(1);
}

export default function SetupScreen() {
  const { register } = useAuth();
  const params = useLocalSearchParams<{ name: string; email: string; password: string }>();
  const [goal, setGoal]                 = useState('Perder peso');
  const [weight, setWeight]             = useState('');
  const [height, setHeight]             = useState('');
  const [targetWeight, setTargetWeight] = useState('');
  const [water, setWater]               = useState('2');
  const bmi = calcBMI(weight, height);

  const finish = () => {
    if (!weight || !height || !targetWeight) return Alert.alert('Erro', 'Preencha peso, altura e peso meta.');
    register({ name: params.name, email: params.email, password: params.password, weight, height, targetWeight, waterGoal: water, goal });
    router.replace('/auth/success');
  };

  return (
    <KeyboardAvoidingView style={s.screen} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
      <View style={[s.glow, s.glowCyan]} />
      <View style={[s.glow, s.glowPurple]} />
      <ScrollView contentContainerStyle={s.scroll} keyboardShouldPersistTaps="handled" bounces={false}>

        <TouchableOpacity style={s.backBtn} onPress={() => router.back()}>
          <Ionicons name="arrow-back-outline" size={22} color={D.cyan} />
        </TouchableOpacity>

        <View style={s.progressRow}>
          <LinearGradient colors={GRAD} start={{x:0,y:0}} end={{x:1,y:0}} style={s.progressActive} />
          <LinearGradient colors={GRAD} start={{x:0,y:0}} end={{x:1,y:0}} style={s.progressActive} />
        </View>
        <Text style={s.progressLabel}>Passo 2 de 2 · Quase lá!</Text>

        <View style={s.titleArea}>
          <Text style={s.title}>Seu perfil{'\n'}nutricional.</Text>
          <Text style={s.subtitle}>Essas infos definem seu plano personalizado.</Text>
        </View>

        <Text style={s.sectionLabel}>Qual é seu objetivo?</Text>
        <View style={s.goalList}>
          {GOALS.map(g => (
            <TouchableOpacity key={g.label} style={[s.goalCard, goal === g.label && s.goalCardActive]}
              onPress={() => setGoal(g.label)} activeOpacity={0.8}>
              <View style={[s.goalIconWrap, goal === g.label && s.goalIconActive]}>
                <Ionicons name={g.icon} size={20} color={goal === g.label ? D.white : D.purpleLight} />
              </View>
              <View style={{ flex: 1 }}>
                <Text style={[s.goalLabel, goal === g.label && { color: D.text }]}>{g.label}</Text>
                <Text style={s.goalDesc}>{g.desc}</Text>
              </View>
              {goal === g.label && <Ionicons name="checkmark-circle" size={22} color={D.cyan} />}
            </TouchableOpacity>
          ))}
        </View>

        <Text style={[s.sectionLabel, { marginTop: 8 }]}>Suas medidas</Text>
        <View style={s.measuresGrid}>
          {[
            { icon: 'scale-outline'  as const, placeholder: 'Peso (kg)',      value: weight,       set: setWeight,       grad: GRAD     },
            { icon: 'resize-outline' as const, placeholder: 'Altura (cm)',    value: height,       set: setHeight,       grad: GRAD_REV },
            { icon: 'flag-outline'   as const, placeholder: 'Peso meta (kg)', value: targetWeight, set: setTargetWeight, grad: GRAD     },
            { icon: 'water-outline'  as const, placeholder: 'Água (L/dia)',   value: water,        set: setWater,        grad: GRAD_REV },
          ].map((f, i) => (
            <LinearGradient key={i} colors={f.grad} start={{x:0,y:0}} end={{x:1,y:0}} style={s.fieldBorder}>
              <View style={s.field}>
                <Ionicons name={f.icon} size={18} color={i % 2 === 0 ? D.cyan : D.purple} />
                <TextInput style={s.input} placeholder={f.placeholder} value={f.value} onChangeText={f.set}
                  keyboardType="numeric" placeholderTextColor={D.textDim} />
              </View>
            </LinearGradient>
          ))}
        </View>

        {bmi && (
          <LinearGradient colors={GRAD} start={{x:0,y:0}} end={{x:1,y:0}} style={s.bmiCard}>
            <Text style={s.bmiLabel}>IMC estimado</Text>
            <Text style={s.bmiValue}>{bmi}</Text>
          </LinearGradient>
        )}

        <LinearGradient colors={GRAD} start={{x:0,y:0}} end={{x:1,y:0}} style={s.btn}>
          <TouchableOpacity onPress={finish} activeOpacity={0.85} style={s.btnInner}>
            <Text style={s.btnText}>Criar minha conta</Text>
            <Ionicons name="checkmark-circle-outline" size={20} color={D.white} />
          </TouchableOpacity>
        </LinearGradient>

        <View style={{ height: 40 }} />
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const s = StyleSheet.create({
  screen: { flex: 1, backgroundColor: D.bg },
  glow: { position: 'absolute', borderRadius: 999, opacity: 0.18 },
  glowCyan:   { width: 250, height: 250, backgroundColor: D.cyan,   top: -60,  left: -80 },
  glowPurple: { width: 220, height: 220, backgroundColor: D.purple, bottom: 60, right: -60 },
  scroll: { flexGrow: 1, padding: 24, paddingTop: 56 },
  backBtn: { marginBottom: 20 },
  progressRow:    { flexDirection: 'row', gap: 6, marginBottom: 6 },
  progressActive: { flex: 1, height: 4, borderRadius: 2 },
  progressLabel:  { fontSize: 12, color: D.cyan, fontWeight: '700', marginBottom: 28 },
  titleArea: { gap: 8, marginBottom: 24 },
  title:    { fontSize: 34, fontWeight: '900', color: D.text, letterSpacing: -1, lineHeight: 40 },
  subtitle: { fontSize: 15, color: D.textMuted, fontWeight: '500' },
  sectionLabel: { fontSize: 12, fontWeight: '800', color: D.cyan, marginBottom: 12, textTransform: 'uppercase', letterSpacing: 0.8 },
  goalList: { gap: 10, marginBottom: 24 },
  goalCard: { flexDirection: 'row', alignItems: 'center', gap: 12, backgroundColor: D.surface, borderRadius: 16, padding: 14, borderWidth: 1.5, borderColor: D.border },
  goalCardActive: { borderColor: D.cyan },
  goalIconWrap: { width: 38, height: 38, borderRadius: 12, backgroundColor: D.surface2, alignItems: 'center', justifyContent: 'center' },
  goalIconActive: { backgroundColor: D.purple },
  goalLabel: { fontSize: 15, fontWeight: '700', color: D.textMuted },
  goalDesc:  { fontSize: 12, color: D.textDim, fontWeight: '500', marginTop: 2 },
  measuresGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 10, marginBottom: 16 },
  fieldBorder: { borderRadius: 15, padding: 1.5, width: '48%' },
  field: { flexDirection: 'row', alignItems: 'center', gap: 8, backgroundColor: D.surface2, borderRadius: 14, paddingHorizontal: 12, paddingVertical: 14 },
  input: { flex: 1, fontSize: 14, color: D.text, fontWeight: '500' },
  bmiCard: { borderRadius: 16, padding: 16, flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 },
  bmiLabel: { fontSize: 14, fontWeight: '700', color: D.white },
  bmiValue: { fontSize: 26, fontWeight: '900', color: D.white },
  btn: { borderRadius: 14, overflow: 'hidden' },
  btnInner: { paddingVertical: 16, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8 },
  btnText: { fontSize: 16, fontWeight: '800', color: D.white },
});
