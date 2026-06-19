import { useAuth } from '@/context/auth';
import { router, useLocalSearchParams } from 'expo-router';
import { useState } from 'react';
import {
  Alert, KeyboardAvoidingView, Platform, ScrollView,
  StyleSheet, Text, TextInput, TouchableOpacity, View,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';

const GOALS = [
  { label: 'Perder peso',    icon: 'trending-down-outline' as const },
  { label: 'Ganhar massa',   icon: 'trending-up-outline'   as const },
  { label: 'Manter peso',    icon: 'remove-outline'        as const },
  { label: 'Melhorar saúde', icon: 'heart-outline'         as const },
];

function calcBMI(w: string, h: string) {
  const wn = parseFloat(w), hn = parseFloat(h) / 100;
  if (!wn || !hn) return null;
  return (wn / (hn * hn)).toFixed(1);
}

export default function SetupScreen() {
  const { register } = useAuth();
  const params = useLocalSearchParams<{ name: string; email: string; password: string }>();

  const [goal, setGoal] = useState('Perder peso');
  const [weight, setWeight] = useState('');
  const [height, setHeight] = useState('');
  const [targetWeight, setTargetWeight] = useState('');
  const [water, setWater] = useState('2');

  const bmi = calcBMI(weight, height);

  const finish = () => {
    if (!weight || !height || !targetWeight)
      return Alert.alert('Erro', 'Preencha peso, altura e peso meta.');
    register({
      name: params.name,
      email: params.email,
      password: params.password,
      weight,
      height,
      targetWeight,
      waterGoal: water,
      goal,
    });
    router.replace('/auth/success');
  };

  return (
    <KeyboardAvoidingView style={s.screen} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
      <View style={s.top}>
        <TouchableOpacity style={s.back} onPress={() => router.back()}>
          <Ionicons name="arrow-back" size={22} color="#fff" />
        </TouchableOpacity>
        <View style={s.steps}>
          <View style={s.step} />
          <View style={[s.step, s.stepActive]} />
        </View>
        <Text style={s.stepLabel}>Passo 2 de 2</Text>
        <Text style={s.heroTitle}>{'Seu perfil\nnutricional.'}</Text>
        <Text style={s.heroSub}>Vamos personalizar seu plano.</Text>
      </View>

      <ScrollView style={s.card} contentContainerStyle={{ gap: 14, paddingBottom: 48 }} keyboardShouldPersistTaps="handled" bounces={false}>

        {/* Objetivo */}
        <Text style={s.sectionLabel}>OBJETIVO</Text>
        <View style={s.goalGrid}>
          {GOALS.map(g => (
            <TouchableOpacity
              key={g.label}
              style={[s.goalChip, goal === g.label && s.goalChipActive]}
              onPress={() => setGoal(g.label)}
            >
              <Ionicons name={g.icon} size={18} color={goal === g.label ? '#fff' : '#7C5CBF'} />
              <Text style={[s.goalChipText, goal === g.label && s.goalChipTextActive]}>{g.label}</Text>
            </TouchableOpacity>
          ))}
        </View>

        {/* Medidas */}
        <Text style={s.sectionLabel}>MEDIDAS</Text>
        <View style={s.row}>
          <View style={[s.field, { flex: 1 }]}>
            <Ionicons name="barbell-outline" size={16} color="#7C5CBF" />
            <TextInput style={s.input} placeholder="Peso (kg)" value={weight} onChangeText={setWeight} keyboardType="numeric" placeholderTextColor="#aaa" />
          </View>
          <View style={[s.field, { flex: 1 }]}>
            <Ionicons name="resize-outline" size={16} color="#7C5CBF" />
            <TextInput style={s.input} placeholder="Altura (cm)" value={height} onChangeText={setHeight} keyboardType="numeric" placeholderTextColor="#aaa" />
          </View>
        </View>

        <View style={s.row}>
          <View style={[s.field, { flex: 1 }]}>
            <Ionicons name="flag-outline" size={16} color="#7C5CBF" />
            <TextInput style={s.input} placeholder="Peso meta (kg)" value={targetWeight} onChangeText={setTargetWeight} keyboardType="numeric" placeholderTextColor="#aaa" />
          </View>
          <View style={[s.field, { flex: 1 }]}>
            <Ionicons name="water-outline" size={16} color="#7C5CBF" />
            <TextInput style={s.input} placeholder="Água (L/dia)" value={water} onChangeText={setWater} keyboardType="numeric" placeholderTextColor="#aaa" />
          </View>
        </View>

        {/* IMC calculado */}
        {bmi && (
          <View style={s.bmiCard}>
            <Text style={s.bmiLabel}>IMC calculado</Text>
            <Text style={s.bmiValue}>{bmi}</Text>
          </View>
        )}

        <TouchableOpacity style={s.btn} onPress={finish} activeOpacity={0.85}>
          <Text style={s.btnText}>Criar conta</Text>
          <Ionicons name="checkmark" size={18} color="#1A1035" />
        </TouchableOpacity>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const s = StyleSheet.create({
  screen: { flex: 1, backgroundColor: '#1A1035' },
  top: { paddingHorizontal: 28, paddingTop: 56, paddingBottom: 24, gap: 8 },
  back: { marginBottom: 12 },
  steps: { flexDirection: 'row', gap: 6, marginBottom: 4 },
  step: { width: 24, height: 4, borderRadius: 2, backgroundColor: 'rgba(255,255,255,0.2)' },
  stepActive: { backgroundColor: '#D4F53C', width: 40 },
  stepLabel: { fontSize: 12, color: 'rgba(255,255,255,0.4)', fontWeight: '700', letterSpacing: 1 },
  heroTitle: { fontSize: 36, fontWeight: '900', color: '#fff', letterSpacing: -1.5, lineHeight: 40 },
  heroSub: { fontSize: 14, color: 'rgba(255,255,255,0.5)', fontWeight: '500' },

  card: {
    backgroundColor: '#fff',
    borderTopLeftRadius: 32, borderTopRightRadius: 32,
    paddingHorizontal: 28, paddingTop: 28,
  },
  sectionLabel: { fontSize: 11, fontWeight: '800', letterSpacing: 1.5, color: '#1A1035', opacity: 0.35 },

  goalGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 10 },
  goalChip: {
    flexDirection: 'row', alignItems: 'center', gap: 7,
    paddingHorizontal: 14, paddingVertical: 10,
    borderRadius: 12, borderWidth: 1.5, borderColor: '#E5E0F0',
    backgroundColor: '#F4F1F9',
  },
  goalChipActive: { backgroundColor: '#7C5CBF', borderColor: '#7C5CBF' },
  goalChipText: { fontSize: 13, fontWeight: '700', color: '#7C5CBF' },
  goalChipTextActive: { color: '#fff' },

  row: { flexDirection: 'row', gap: 10 },
  field: {
    flexDirection: 'row', alignItems: 'center', gap: 8,
    backgroundColor: '#F4F1F9', borderRadius: 14,
    paddingHorizontal: 12, paddingVertical: 14,
  },
  input: { flex: 1, fontSize: 14, color: '#1A1035', fontWeight: '500' },

  bmiCard: {
    flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center',
    backgroundColor: '#EDE8F8', borderRadius: 14, padding: 16,
  },
  bmiLabel: { fontSize: 13, fontWeight: '700', color: '#7C5CBF' },
  bmiValue: { fontSize: 24, fontWeight: '900', color: '#1A1035' },

  btn: {
    backgroundColor: '#D4F53C', borderRadius: 14,
    paddingVertical: 16, flexDirection: 'row',
    alignItems: 'center', justifyContent: 'center', gap: 8,
  },
  btnText: { fontSize: 16, fontWeight: '800', color: '#1A1035' },
});
