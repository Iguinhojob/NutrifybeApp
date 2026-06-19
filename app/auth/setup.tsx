import { useAuth } from '@/context/auth';
import { router, useLocalSearchParams } from 'expo-router';
import { useState } from 'react';
import {
  Alert, KeyboardAvoidingView, Platform, ScrollView,
  StyleSheet, Text, TextInput, TouchableOpacity, View,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';

const GOALS = [
  { label: 'Perder peso',    icon: '🔥', desc: 'Déficit calórico saudável' },
  { label: 'Ganhar massa',   icon: '💪', desc: 'Superávit com foco em proteína' },
  { label: 'Manter peso',    icon: '⚖️', desc: 'Equilíbrio nutricional' },
  { label: 'Melhorar saúde', icon: '🥗', desc: 'Alimentação equilibrada' },
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
    register({ name: params.name, email: params.email, password: params.password, weight, height, targetWeight, waterGoal: water, goal });
    router.replace('/auth/success');
  };

  return (
    <KeyboardAvoidingView style={s.screen} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
      <ScrollView contentContainerStyle={s.scroll} keyboardShouldPersistTaps="handled" bounces={false}>

        {/* Header */}
        <TouchableOpacity style={s.backBtn} onPress={() => router.back()}>
          <Ionicons name="arrow-back-outline" size={22} color="#1B4332" />
        </TouchableOpacity>

        {/* Progresso */}
        <View style={s.progressRow}>
          <View style={[s.progressBar, s.progressDone]} />
          <View style={[s.progressBar, s.progressActive]} />
        </View>
        <Text style={s.progressLabel}>Passo 2 de 2 · Quase lá!</Text>

        {/* Título */}
        <View style={s.titleArea}>
          <Text style={s.emoji}>🎯</Text>
          <Text style={s.title}>Seu perfil{'\n'}nutricional.</Text>
          <Text style={s.subtitle}>Essas infos definem seu plano personalizado.</Text>
        </View>

        {/* Objetivo */}
        <Text style={s.sectionLabel}>Qual é seu objetivo?</Text>
        <View style={s.goalList}>
          {GOALS.map(g => (
            <TouchableOpacity
              key={g.label}
              style={[s.goalCard, goal === g.label && s.goalCardActive]}
              onPress={() => setGoal(g.label)}
              activeOpacity={0.8}
            >
              <Text style={s.goalEmoji}>{g.icon}</Text>
              <View style={{ flex: 1 }}>
                <Text style={[s.goalLabel, goal === g.label && s.goalLabelActive]}>{g.label}</Text>
                <Text style={[s.goalDesc, goal === g.label && s.goalDescActive]}>{g.desc}</Text>
              </View>
              {goal === g.label && (
                <Ionicons name="checkmark-circle" size={22} color="#52B788" />
              )}
            </TouchableOpacity>
          ))}
        </View>

        {/* Medidas */}
        <Text style={[s.sectionLabel, { marginTop: 8 }]}>Suas medidas</Text>
        <View style={s.form}>
          <View style={s.row}>
            <View style={[s.field, { flex: 1 }]}>
              <Text style={s.fieldEmoji}>⚖️</Text>
              <TextInput style={s.input} placeholder="Peso (kg)" value={weight} onChangeText={setWeight} keyboardType="numeric" placeholderTextColor="#B0B8B4" />
            </View>
            <View style={[s.field, { flex: 1 }]}>
              <Text style={s.fieldEmoji}>📏</Text>
              <TextInput style={s.input} placeholder="Altura (cm)" value={height} onChangeText={setHeight} keyboardType="numeric" placeholderTextColor="#B0B8B4" />
            </View>
          </View>

          <View style={s.row}>
            <View style={[s.field, { flex: 1 }]}>
              <Text style={s.fieldEmoji}>🎯</Text>
              <TextInput style={s.input} placeholder="Peso meta (kg)" value={targetWeight} onChangeText={setTargetWeight} keyboardType="numeric" placeholderTextColor="#B0B8B4" />
            </View>
            <View style={[s.field, { flex: 1 }]}>
              <Text style={s.fieldEmoji}>💧</Text>
              <TextInput style={s.input} placeholder="Água (L/dia)" value={water} onChangeText={setWater} keyboardType="numeric" placeholderTextColor="#B0B8B4" />
            </View>
          </View>

          {bmi && (
            <View style={s.bmiCard}>
              <Text style={s.bmiText}>Seu IMC estimado</Text>
              <Text style={s.bmiValue}>{bmi}</Text>
            </View>
          )}
        </View>

        <TouchableOpacity style={s.btn} onPress={finish} activeOpacity={0.85}>
          <Text style={s.btnText}>Criar minha conta 🎉</Text>
        </TouchableOpacity>

        <View style={{ height: 32 }} />
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const s = StyleSheet.create({
  screen: { flex: 1, backgroundColor: '#F6FBF7' },
  scroll: { flexGrow: 1, padding: 24, paddingTop: 56 },

  backBtn: { marginBottom: 20 },

  progressRow: { flexDirection: 'row', gap: 6, marginBottom: 6 },
  progressBar: { flex: 1, height: 4, borderRadius: 2, backgroundColor: '#D8F3DC' },
  progressActive: { backgroundColor: '#52B788' },
  progressDone: { backgroundColor: '#52B788' },
  progressLabel: { fontSize: 12, color: '#74A88A', fontWeight: '700', marginBottom: 28 },

  titleArea: { gap: 8, marginBottom: 24 },
  emoji: { fontSize: 36 },
  title: { fontSize: 34, fontWeight: '900', color: '#1B4332', letterSpacing: -1, lineHeight: 40 },
  subtitle: { fontSize: 15, color: '#74A88A', fontWeight: '500' },

  sectionLabel: { fontSize: 14, fontWeight: '800', color: '#1B4332', marginBottom: 12 },

  goalList: { gap: 10, marginBottom: 24 },
  goalCard: {
    flexDirection: 'row', alignItems: 'center', gap: 12,
    backgroundColor: '#fff', borderRadius: 16,
    padding: 14, borderWidth: 1.5, borderColor: '#E8F5E9',
  },
  goalCardActive: { borderColor: '#52B788', backgroundColor: '#F0FDF4' },
  goalEmoji: { fontSize: 24 },
  goalLabel: { fontSize: 15, fontWeight: '700', color: '#1B4332' },
  goalLabelActive: { color: '#1B4332' },
  goalDesc: { fontSize: 12, color: '#B0B8B4', fontWeight: '500', marginTop: 2 },
  goalDescActive: { color: '#52B788' },

  form: { gap: 10, marginBottom: 20 },
  row: { flexDirection: 'row', gap: 10 },
  field: {
    flexDirection: 'row', alignItems: 'center', gap: 8,
    backgroundColor: '#fff', borderRadius: 14,
    paddingHorizontal: 12, paddingVertical: 14,
    borderWidth: 1, borderColor: '#D8F3DC',
  },
  fieldEmoji: { fontSize: 16 },
  input: { flex: 1, fontSize: 14, color: '#1B4332', fontWeight: '500' },

  bmiCard: {
    flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center',
    backgroundColor: '#D8F3DC', borderRadius: 14, padding: 16,
  },
  bmiText: { fontSize: 14, fontWeight: '700', color: '#1B4332' },
  bmiValue: { fontSize: 24, fontWeight: '900', color: '#1B4332' },

  btn: {
    backgroundColor: '#52B788', borderRadius: 14,
    paddingVertical: 16, alignItems: 'center',
  },
  btnText: { fontSize: 16, fontWeight: '800', color: '#fff' },
});
