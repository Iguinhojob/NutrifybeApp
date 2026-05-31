import { useAuth } from '@/context/auth';
import { editorialPalette } from '@/constants/theme';
import { router } from 'expo-router';
import { useState } from 'react';
import {
  Alert, KeyboardAvoidingView, Platform, ScrollView,
  StyleSheet, Text, TextInput, TouchableOpacity, View,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';

const P = editorialPalette;
const GOALS = [
  { key: 'lose', label: 'Perder peso', icon: 'trending-down-outline' as const },
  { key: 'gain', label: 'Ganhar massa', icon: 'trending-up-outline' as const },
  { key: 'maintain', label: 'Manter peso', icon: 'remove-outline' as const },
  { key: 'health', label: 'Melhorar saúde', icon: 'heart-outline' as const },
];

function calcBMI(weight: string, height: string) {
  const w = parseFloat(weight);
  const h = parseFloat(height) / 100;
  if (!w || !h) return null;
  return (w / (h * h)).toFixed(1);
}

export default function SetupScreen() {
  const { user, updateUser } = useAuth();
  const [step, setStep] = useState<'goal' | 'metrics'>('goal');
  const [goal, setGoal] = useState(user?.goal || 'Perder peso');
  const [weight, setWeight] = useState(user?.weight || '');
  const [height, setHeight] = useState(user?.height || '');
  const [targetWeight, setTargetWeight] = useState(user?.targetWeight || '');
  const [water, setWater] = useState(user?.waterGoal || '2');

  const bmi = calcBMI(weight, height);

  const finish = () => {
    if (!weight || !height || !targetWeight || !water)
      return Alert.alert('Erro', 'Preencha todos os campos.');
    updateUser({ goal, weight, height, targetWeight, waterGoal: water, setupDone: true });
    router.replace('/auth/recommendation');
  };

  if (step === 'goal') {
    return (
      <View style={s.screen}>
        <View style={[s.bubble, { top: 50, right: -30, width: 120, height: 120, backgroundColor: P.lilac, opacity: 0.3 }]} />
        <ScrollView contentContainerStyle={s.scroll} bounces={false}>
          <Text style={s.brand}>NUTRIFYBE.</Text>
          <Text style={s.heroTitle}>{'Qual é seu\nobjetivo?'}</Text>
          <Text style={s.heroSub}>Vamos personalizar seu plano.</Text>

          <View style={s.goalList}>
            {GOALS.map(g => (
              <TouchableOpacity
                key={g.key}
                style={[s.goalCard, goal === g.label && s.goalCardActive]}
                onPress={() => setGoal(g.label)}
              >
                <Ionicons name={g.icon} size={24} color={goal === g.label ? P.mint : P.text} />
                <Text style={[s.goalLabel, goal === g.label && s.goalLabelActive]}>{g.label}</Text>
                {goal === g.label && <Ionicons name="checkmark-circle" size={20} color={P.mint} style={{ marginLeft: 'auto' }} />}
              </TouchableOpacity>
            ))}
          </View>

          <TouchableOpacity style={s.ctaOuter} onPress={() => setStep('metrics')} activeOpacity={0.85}>
            <View style={s.ctaInner}>
              <Text style={s.ctaText}>Próximo</Text>
              <Ionicons name="chevron-forward" size={16} color={P.text} />
              <Ionicons name="chevron-forward" size={16} color={P.text} style={{ marginLeft: -8 }} />
            </View>
          </TouchableOpacity>
        </ScrollView>
      </View>
    );
  }

  return (
    <KeyboardAvoidingView style={s.screen} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
      <View style={[s.bubble, { top: 40, left: -20, width: 100, height: 100, backgroundColor: P.pink, opacity: 0.25 }]} />
      <ScrollView contentContainerStyle={s.scroll} keyboardShouldPersistTaps="handled" bounces={false}>
        <Text style={s.brand}>NUTRIFYBE.</Text>
        <Text style={s.heroTitle}>{'Suas\nmedidas.'}</Text>
        <Text style={s.heroSub}>Para calcular seu plano ideal.</Text>

        <View style={s.card}>
          {[
            { label: 'Peso atual (kg)', value: weight, set: setWeight, icon: 'barbell-outline' as const },
            { label: 'Altura (cm)', value: height, set: setHeight, icon: 'resize-outline' as const },
            { label: 'Peso meta (kg)', value: targetWeight, set: setTargetWeight, icon: 'flag-outline' as const },
            { label: 'Meta de água (L/dia)', value: water, set: setWater, icon: 'water-outline' as const },
          ].map(f => (
            <View key={f.label} style={s.field}>
              <Ionicons name={f.icon} size={18} color={P.text} style={s.fieldIcon} />
              <TextInput
                style={s.input}
                placeholder={f.label}
                value={f.value}
                onChangeText={f.set}
                keyboardType="numeric"
                placeholderTextColor="#9c97a2"
              />
            </View>
          ))}

          {bmi && (
            <View style={s.bmiRow}>
              <Text style={s.bmiLabel}>IMC calculado</Text>
              <Text style={s.bmiValue}>{bmi}</Text>
            </View>
          )}
        </View>

        <TouchableOpacity style={s.ctaOuter} onPress={finish} activeOpacity={0.85}>
          <View style={s.ctaInner}>
            <Text style={s.ctaText}>Finalizar setup</Text>
            <Ionicons name="chevron-forward" size={16} color={P.text} />
            <Ionicons name="chevron-forward" size={16} color={P.text} style={{ marginLeft: -8 }} />
          </View>
        </TouchableOpacity>

        <TouchableOpacity onPress={() => setStep('goal')} style={s.backRow}>
          <Text style={s.backText}>← Voltar</Text>
        </TouchableOpacity>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const s = StyleSheet.create({
  screen: { flex: 1, backgroundColor: P.mint },
  scroll: { flexGrow: 1, padding: 24, paddingTop: 68, gap: 0 },
  bubble: { position: 'absolute', borderRadius: 999 },
  brand: { fontSize: 13, fontWeight: '800', letterSpacing: 2, color: P.text, opacity: 0.5, marginBottom: 12 },
  heroTitle: { fontSize: 48, fontWeight: '900', color: P.text, letterSpacing: -2, lineHeight: 52, marginBottom: 8 },
  heroSub: { fontSize: 14, color: P.text, opacity: 0.5, fontWeight: '600', marginBottom: 32 },
  goalList: { gap: 12, marginBottom: 32 },
  goalCard: { flexDirection: 'row', alignItems: 'center', gap: 14, backgroundColor: 'rgba(255,255,255,0.7)', borderRadius: 18, padding: 18, borderWidth: 1, borderColor: P.border },
  goalCardActive: { backgroundColor: P.text, borderColor: P.text },
  goalLabel: { fontSize: 16, fontWeight: '700', color: P.text },
  goalLabelActive: { color: P.mint },
  card: { backgroundColor: 'rgba(255,255,255,0.82)', borderRadius: 28, padding: 24, gap: 14, borderWidth: 1, borderColor: P.border, marginBottom: 24 },
  field: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#fcfbfd', borderRadius: 14, paddingHorizontal: 14, paddingVertical: 12, borderWidth: 1, borderColor: P.border, gap: 10 },
  fieldIcon: { opacity: 0.6 },
  input: { flex: 1, fontSize: 15, color: P.text, fontWeight: '500' },
  bmiRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingTop: 8, borderTopWidth: 1, borderTopColor: P.border },
  bmiLabel: { fontSize: 13, color: P.text, opacity: 0.6, fontWeight: '600' },
  bmiValue: { fontSize: 22, fontWeight: '900', color: P.text },
  ctaOuter: { backgroundColor: P.text, borderRadius: 999, padding: 4 },
  ctaInner: { backgroundColor: P.mint, borderRadius: 999, paddingVertical: 16, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 4 },
  ctaText: { fontSize: 16, fontWeight: '800', color: P.text },
  backRow: { alignItems: 'center', marginTop: 16 },
  backText: { fontSize: 14, color: P.text, opacity: 0.5, fontWeight: '600' },
});
