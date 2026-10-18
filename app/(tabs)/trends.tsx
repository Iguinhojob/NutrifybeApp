import { useAuth } from '@/context/auth';
import { useDiary } from '@/context/diary';
import { EvolucaoCaloriasDiaria } from '@/components/EvolucaoCaloriasDiaria';
import GraficoPeso from '@/components/GraficoPeso';
import { useAppLayout } from '@/hooks/useAppLayout';
import { usePremiumTheme } from '@/context/theme';
import { measurementError, suggestedWaterGoal } from '@/utils/onboarding';
import { Ionicons } from '@expo/vector-icons';
import { router, useLocalSearchParams } from 'expo-router';
import React, { useCallback, useEffect, useState } from 'react';
import { FybeTarget, FybeTourSpacer, useFybeScroll } from '@/components/fybe';
import { Alert, Modal, ScrollView, Text, TextInput, TouchableOpacity, View } from 'react-native';

const GOALS = ['Perder peso', 'Manter peso', 'Ganhar massa', 'Melhorar saúde'];

export default function TrendsScreen() {
  const fybeScroll = useFybeScroll('/trends');
  const { user, updateUser } = useAuth(); const { measurements, ready, addMeasurement } = useDiary();
  const { colors: C, isDark } = usePremiumTheme(); const { topPad } = useAppLayout(); const params = useLocalSearchParams<{ edit?: string }>();
  const [editing, setEditing] = useState(false); const [form, setForm] = useState({ weight: '', height: '', targetWeight: '', waterGoal: '', goal: '' });
  const [chartMode, setChartMode] = useState<'calories' | 'weight'>('calories');
  const openEditor = useCallback(() => { setForm({ weight: user?.weight || '', height: user?.height || '', targetWeight: user?.targetWeight || '', waterGoal: user?.waterGoal || String(suggestedWaterGoal(user?.weight || '', user?.activityLevel)), goal: user?.goal || '' }); setEditing(true); }, [user]);
  useEffect(() => { if (params.edit === '1' && user) openEditor(); }, [params.edit, user, openEditor]);
  const closeEditor = () => { setEditing(false); if (params.edit === '1') router.setParams({ edit: '0' }); };
  const save = async () => {
    const error = measurementError(form.weight, form.height, form.targetWeight, form.goal); const water = Number(form.waterGoal.replace(',', '.'));
    if (error) return Alert.alert('Confira os dados', error);
    if (!Number.isFinite(water) || water < 0.5 || water > 10) return Alert.alert('Confira os dados', 'Informe uma meta de água entre 0,5 e 10 litros.');
    const normalized = { ...form, weight: form.weight.replace(',', '.'), height: form.height.replace(',', '.'), targetWeight: form.targetWeight.replace(',', '.'), waterGoal: form.waterGoal.replace(',', '.') };
    try {
      await updateUser(normalized);
      if (normalized.weight !== user?.weight) await addMeasurement({ weight: normalized.weight });
      closeEditor();
      Alert.alert('Dados atualizados', 'Os dados e a meta de hidratação foram atualizados.');
    } catch {
      Alert.alert('Erro ao salvar', 'Não foi possível atualizar seus dados no servidor. Tente novamente.');
    }
  };
  const weightRecords = measurements.filter(item => item.weight); const first = weightRecords[0]; const current = weightRecords.at(-1);
  const change = current && first && current !== first ? Number(current.weight!.replace(',', '.')) - Number(first.weight!.replace(',', '.')) : 0;
  const waterGoal = user?.waterGoal || String(suggestedWaterGoal(user?.weight || '', user?.activityLevel));
  const weightPoints = weightRecords.map(record => ({ value: Number(record.weight!.replace(',', '.')), date: new Date(record.createdAt) }));
  const card = { backgroundColor: C.surface, borderRadius: 20, padding: 18, marginBottom: 14, shadowColor: '#000', shadowOpacity: .05, shadowRadius: 8, elevation: 2 } as const;
  const field = (key: keyof typeof form, label: string, suffix: string) => <View style={{ marginBottom: 12 }}><Text style={{ color: C.textMuted, fontSize: 12, fontWeight: '700', marginBottom: 6 }}>{label}</Text><View style={{ flexDirection: 'row', alignItems: 'center', borderWidth: 1, borderColor: C.border, borderRadius: 12, backgroundColor: C.surface }}><TextInput value={form[key]} onChangeText={value => setForm(prev => ({ ...prev, [key]: value }))} keyboardType="decimal-pad" style={{ flex: 1, padding: 13, color: C.text, fontSize: 15 }} placeholder={label} placeholderTextColor={C.textDim} /><Text style={{ color: C.textMuted, marginRight: 13 }}>{suffix}</Text></View></View>;

  return <View style={{ flex: 1, backgroundColor: C.bg }}><ScrollView ref={fybeScroll} contentContainerStyle={{ padding: 20, paddingTop: topPad, paddingBottom: 100 }} showsVerticalScrollIndicator={false}>
    <Text style={{ fontSize: 26, fontWeight: '900', color: C.text }}>Evolução</Text><Text style={{ fontSize: 14, color: C.textMuted, marginTop: 4, marginBottom: 20 }}>Suas metas e seu progresso em um só lugar.</Text>
    <FybeTarget id="trends.summary" style={{ marginBottom: 14 }}><View style={[card, { marginBottom: 0 }]}><View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 14 }}><Text style={{ color: C.text, fontSize: 16, fontWeight: '800' }}>Resumo da meta</Text><TouchableOpacity onPress={openEditor}><Text style={{ color: C.primary, fontWeight: '800' }}>Editar</Text></TouchableOpacity></View>
      <View style={{ flexDirection: 'row', gap: 9 }}>{[['Peso atual', user?.weight ? `${user.weight} kg` : '—'], ['Peso meta', user?.targetWeight ? `${user.targetWeight} kg` : '—']].map(([label, value]) => <View key={label} style={{ flex: 1, backgroundColor: C.surface2, borderRadius: 13, padding: 11 }}><Text style={{ color: C.textMuted, fontSize: 9, fontWeight: '800' }}>{label.toUpperCase()}</Text><Text style={{ color: C.text, fontWeight: '900', fontSize: 15, marginTop: 4 }}>{value}</Text></View>)}</View>
      <View style={{ marginTop: 12, gap: 9 }}>{[['Objetivo', user?.goal || '—'], ['Altura', `${user?.height || '—'} cm`], ['Meta de água', `${waterGoal} L por dia`]].map(([label, value]) => <View key={label} style={{ flexDirection: 'row', justifyContent: 'space-between', gap: 12 }}><Text style={{ color: C.textMuted, fontSize: 13 }}>{label}</Text><Text style={{ color: C.text, fontWeight: '700', fontSize: 13, flex: 1, textAlign: 'right' }}>{value}</Text></View>)}</View>
    </View></FybeTarget>
    <FybeTarget id="trends.chart" style={{ marginBottom: 14 }}>
      <View style={card}><Text style={{ color: C.text, fontSize: 16, fontWeight: '800' }}>Gráfico de evolução</Text><Text style={{ color: C.textMuted, fontSize: 12, marginTop: 3 }}>Acompanhe as calorias acumuladas no dia ou consulte seu peso.</Text><View style={{ flexDirection: 'row', backgroundColor: C.surface2, borderRadius: 12, padding: 4, marginTop: 14 }}>{([{ key: 'calories', label: 'Calorias do dia' }, { key: 'weight', label: 'Peso' }] as const).map(item => <TouchableOpacity key={item.key} onPress={() => setChartMode(item.key)} style={{ flex: 1, paddingVertical: 9, borderRadius: 9, alignItems: 'center', backgroundColor: chartMode === item.key ? C.primary : 'transparent' }}><Text style={{ color: chartMode === item.key ? '#fff' : C.textMuted, fontWeight: '800', fontSize: 13 }}>{item.label}</Text></TouchableOpacity>)}</View></View>
      {!ready ? <View style={[card, { alignItems: 'center', paddingVertical: 30 }]}><Text style={{ color: C.textMuted }}>Carregando gráfico…</Text></View> : chartMode === 'calories' ? <EvolucaoCaloriasDiaria /> : <View style={{ gap: 10 }}><GraficoPeso pontos={weightPoints} meta={Number((user?.targetWeight || '').replace(',', '.'))} escuro={isDark} />{weightRecords.length > 1 && <Text style={{ color: C.textMuted, textAlign: 'center', fontWeight: '800', marginTop: 4 }}>{change > 0 ? '+' : ''}{change.toFixed(1)} kg desde o primeiro registro</Text>}</View>}
    </FybeTarget>
    <FybeTarget id="trends.measures"><View style={[card, { marginBottom: 0 }]}>
      <Text style={{ color: C.text, fontSize: 16, fontWeight: '800', marginBottom: 10 }}>Histórico de medidas</Text>
      {!ready ? <Text style={{ color: C.textMuted }}>Carregando registros…</Text> : measurements.length === 0 ? <View style={{ alignItems: 'center', paddingVertical: 22, gap: 7 }}><Ionicons name="stats-chart-outline" size={32} color={C.textDim} /><Text style={{ color: C.textMuted }}>Nenhuma medida registrada ainda.</Text></View> : measurements.slice().reverse().map((record, index) => <View key={record.id} style={{ paddingVertical: 12, ...(index < measurements.length - 1 ? { borderBottomWidth: 1, borderBottomColor: C.border } : {}) }}><Text style={{ color: C.textMuted, fontSize: 12 }}>{new Date(record.createdAt).toLocaleDateString('pt-BR')}</Text><Text style={{ color: C.text, fontWeight: '700', marginTop: 3 }}>{[record.weight && `Peso: ${record.weight} kg`, record.waist && `Cintura: ${record.waist} cm`, record.hip && `Quadril: ${record.hip} cm`, record.arm && `Braço: ${record.arm} cm`, record.bodyFat && `Gordura: ${record.bodyFat}%`].filter(Boolean).join(' · ')}</Text></View>)}
    </View></FybeTarget>
    <FybeTourSpacer pathname="/trends" />
  </ScrollView><Modal visible={editing} animationType="slide" presentationStyle="pageSheet"><ScrollView style={{ backgroundColor: C.bg }} contentContainerStyle={{ padding: 24, paddingBottom: 50 }} keyboardShouldPersistTaps="handled"><Text style={{ color: C.text, fontSize: 22, fontWeight: '900', marginBottom: 18 }}>Editar dados da meta</Text>{field('weight', 'Peso atual', 'kg')}{field('height', 'Altura', 'cm')}{field('targetWeight', 'Peso desejado', 'kg')}{field('waterGoal', 'Meta diária de água', 'L')}<Text style={{ color: C.textMuted, fontSize: 12, fontWeight: '700', marginBottom: 7 }}>OBJETIVO</Text><View style={{ gap: 8 }}>{GOALS.map(goal => <TouchableOpacity key={goal} onPress={() => setForm(prev => ({ ...prev, goal }))} style={{ borderWidth: 1, borderColor: form.goal === goal ? C.primary : C.border, backgroundColor: form.goal === goal ? C.primarySoft : C.surface, borderRadius: 12, padding: 13 }}><Text style={{ color: form.goal === goal ? C.primary : C.text, fontWeight: '700' }}>{goal}</Text></TouchableOpacity>)}</View><TouchableOpacity onPress={save} style={{ backgroundColor: C.primary, borderRadius: 14, padding: 16, alignItems: 'center', marginTop: 20 }}><Text style={{ color: '#fff', fontWeight: '800', fontSize: 16 }}>Salvar e recalcular</Text></TouchableOpacity><TouchableOpacity onPress={closeEditor} style={{ padding: 15, alignItems: 'center' }}><Text style={{ color: C.textMuted, fontWeight: '700' }}>Cancelar</Text></TouchableOpacity></ScrollView></Modal></View>;
}
