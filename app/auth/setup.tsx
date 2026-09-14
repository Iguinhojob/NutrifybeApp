import { useAuth } from '@/context/auth';
import { useAppLayout } from '@/hooks/useAppLayout';
import { router, useLocalSearchParams } from 'expo-router';
import { useState } from 'react';
import { Alert, KeyboardAvoidingView, Platform, ScrollView, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

const G = '#22C55E', GD = '#16A34A', GL = '#F0FDF4', BG = '#F7F8FA', SURFACE = '#FFFFFF', TEXT = '#111827', MUTED = '#6B7280', DIM = '#9CA3AF', BORDER = '#E5E7EB';

const GOALS = [
  { label: 'Perder peso',    icon: 'flame-outline'   as const, desc: 'Déficit calórico saudável' },
  { label: 'Ganhar massa',   icon: 'barbell-outline' as const, desc: 'Superávit com foco em proteína' },
  { label: 'Manter peso',    icon: 'scale-outline'   as const, desc: 'Equilíbrio nutricional' },
  { label: 'Melhorar saúde', icon: 'leaf-outline'    as const, desc: 'Alimentação equilibrada' },
];

export default function SetupScreen() {
  const { register } = useAuth();
  const { topPad, isTablet } = useAppLayout();
  const params = useLocalSearchParams<{ name: string; email: string; password: string }>();
  const [goal, setGoal]                 = useState('Perder peso');
  const [weight, setWeight]             = useState('');
  const [height, setHeight]             = useState('');
  const [targetWeight, setTargetWeight] = useState('');
  const [water, setWater]               = useState('2');
  const fieldW = isTablet ? '23%' : '48%';

  const wn = parseFloat(weight), hn = parseFloat(height) / 100;
  const bmi = wn && hn ? (wn / (hn * hn)).toFixed(1) : null;

  const finish = () => {
    if (!weight || !height || !targetWeight) return Alert.alert('Erro', 'Preencha peso, altura e peso meta.');
    register({ name: params.name, email: params.email, password: params.password, weight, height, targetWeight, waterGoal: water, goal });
    router.replace('/auth/success');
  };

  return (
    <KeyboardAvoidingView style={s.screen} behavior={Platform.OS === 'ios' ? 'padding' : 'height'}>
      <ScrollView contentContainerStyle={[s.scroll, { paddingTop: topPad }]} keyboardShouldPersistTaps="handled" bounces={false} showsVerticalScrollIndicator={false}>

        <TouchableOpacity style={s.backBtn} onPress={() => router.back()}>
          <Ionicons name="arrow-back" size={20} color={TEXT} />
        </TouchableOpacity>

        <View style={s.progressRow}>
          <View style={[s.progressBar, { backgroundColor: G }]} />
          <View style={[s.progressBar, { backgroundColor: G }]} />
        </View>
        <Text style={s.progressLabel}>Passo 2 de 2 · Quase lá!</Text>

        <Text style={s.title}>Seu perfil nutricional</Text>
        <Text style={s.subtitle}>Essas informações definem seu plano personalizado.</Text>

        {/* Objetivos */}
        <Text style={s.sectionLabel}>Qual é seu objetivo?</Text>
        <View style={s.goalList}>
          {GOALS.map(g => (
            <TouchableOpacity key={g.label} style={[s.goalCard, goal === g.label && s.goalCardActive]} onPress={() => setGoal(g.label)} activeOpacity={0.8}>
              <View style={[s.goalIcon, goal === g.label && { backgroundColor: G }]}>
                <Ionicons name={g.icon} size={20} color={goal === g.label ? '#fff' : MUTED} />
              </View>
              <View style={{ flex: 1 }}>
                <Text style={[s.goalLabel, goal === g.label && { color: GD }]}>{g.label}</Text>
                <Text style={s.goalDesc}>{g.desc}</Text>
              </View>
              {goal === g.label && <Ionicons name="checkmark-circle" size={22} color={G} />}
            </TouchableOpacity>
          ))}
        </View>

        {/* Medidas */}
        <Text style={s.sectionLabel}>Suas medidas</Text>
        <View style={s.measuresGrid}>
          {[
            { icon: 'scale-outline'  as const, placeholder: 'Peso (kg)',      value: weight,       set: setWeight       },
            { icon: 'resize-outline' as const, placeholder: 'Altura (cm)',    value: height,       set: setHeight       },
            { icon: 'flag-outline'   as const, placeholder: 'Peso meta (kg)', value: targetWeight, set: setTargetWeight },
            { icon: 'water-outline'  as const, placeholder: 'Água (L/dia)',   value: water,        set: setWater        },
          ].map((f, i) => (
            <View key={i} style={[s.fieldWrap, { width: fieldW }]}>
              <Ionicons name={f.icon} size={16} color={MUTED} style={{ marginRight: 8 }} />
              <TextInput style={s.input} placeholder={f.placeholder} value={f.value} onChangeText={f.set}
                keyboardType="numeric" placeholderTextColor={DIM} />
            </View>
          ))}
        </View>

        {bmi && (
          <View style={s.bmiCard}>
            <Ionicons name="body-outline" size={20} color={G} />
            <Text style={s.bmiText}>IMC estimado: <Text style={{ color: GD, fontWeight: '800' }}>{bmi}</Text></Text>
          </View>
        )}

        <TouchableOpacity style={s.btn} onPress={finish} activeOpacity={0.85}>
          <Text style={s.btnText}>Criar minha conta</Text>
          <Ionicons name="checkmark-circle-outline" size={20} color="#fff" />
        </TouchableOpacity>

        <View style={{ height: 40 }} />
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const s = StyleSheet.create({
  screen:       { flex: 1, backgroundColor: BG },
  scroll:       { flexGrow: 1, padding: 24 },
  backBtn:      { width: 40, height: 40, borderRadius: 12, backgroundColor: SURFACE, alignItems: 'center', justifyContent: 'center', marginBottom: 24,
                  shadowColor: '#000', shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.06, shadowRadius: 4, elevation: 2 },
  progressRow:  { flexDirection: 'row', gap: 6, marginBottom: 8 },
  progressBar:  { flex: 1, height: 4, borderRadius: 2 },
  progressLabel:{ fontSize: 12, color: G, fontWeight: '700', marginBottom: 24 },
  title:        { fontSize: 28, fontWeight: '800', color: TEXT, letterSpacing: -0.5, marginBottom: 6 },
  subtitle:     { fontSize: 14, color: MUTED, marginBottom: 24 },
  sectionLabel: { fontSize: 11, fontWeight: '700', color: MUTED, textTransform: 'uppercase', letterSpacing: 0.8, marginBottom: 12 },
  goalList:     { gap: 10, marginBottom: 28 },
  goalCard:     { flexDirection: 'row', alignItems: 'center', gap: 12, backgroundColor: SURFACE, borderRadius: 14, padding: 14, borderWidth: 1.5, borderColor: BORDER,
                  shadowColor: '#000', shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.04, shadowRadius: 4, elevation: 1 },
  goalCardActive:{ borderColor: G, backgroundColor: GL },
  goalIcon:     { width: 40, height: 40, borderRadius: 12, backgroundColor: BG, alignItems: 'center', justifyContent: 'center' },
  goalLabel:    { fontSize: 15, fontWeight: '700', color: TEXT },
  goalDesc:     { fontSize: 12, color: MUTED, marginTop: 2 },
  measuresGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 10, marginBottom: 16 },
  fieldWrap:    { flexDirection: 'row', alignItems: 'center', backgroundColor: SURFACE, borderRadius: 12, borderWidth: 1, borderColor: BORDER, paddingHorizontal: 12, height: 52 },
  input:        { flex: 1, fontSize: 14, color: TEXT },
  bmiCard:      { flexDirection: 'row', alignItems: 'center', gap: 10, backgroundColor: GL, borderRadius: 12, padding: 14, marginBottom: 20, borderWidth: 1, borderColor: G + '40' },
  bmiText:      { fontSize: 14, color: TEXT, fontWeight: '500' },
  btn:          { backgroundColor: G, borderRadius: 14, height: 54, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8 },
  btnText:      { fontSize: 16, fontWeight: '700', color: '#fff' },
});
