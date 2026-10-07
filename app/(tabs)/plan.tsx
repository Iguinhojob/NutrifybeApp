import AsyncStorage from '@react-native-async-storage/async-storage';
import { Ionicons } from '@expo/vector-icons';
import { router, useFocusEffect } from 'expo-router';
import { useCallback, useEffect, useMemo, useState } from 'react';
import { Image, ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { useAuth } from '@/context/auth';
import { useDiary } from '@/context/diary';
import { usePremiumTheme } from '@/context/theme';
import { useAppLayout } from '@/hooks/useAppLayout';
import { localDateString } from '@/services/api';

type Meal = { horario?: string; nome?: string; alimentos?: string; porcao?: string; calorias?: string | number; observacao?: string };
type Plan = { version: number; meals: Meal[]; notes?: string };
const keyFor = (userId: number, plan: string) => `nutrifybe:prescribed-meals:v1:${userId}:${localDateString()}:${plan.length}`;

export default function PlanScreen() {
  const { user, refreshUser, vinculo } = useAuth();
  const { colors: C } = usePremiumTheme();
  const { topPad } = useAppLayout();
  const { allMeals, addMeal, removeMeal } = useDiary();
  const [done, setDone] = useState<Record<string, boolean>>({});
  const [feedback, setFeedback] = useState('');
  const prescription = user?.prescricaoSemanal?.trim();
  const storageKey = user && prescription ? keyFor(user.id, prescription) : null;
  const plan = useMemo<Plan | null>(() => {
    if (!prescription) return null;
    try { const parsed = JSON.parse(prescription); return parsed?.version === 1 && Array.isArray(parsed.meals) ? parsed : null; } catch { return null; }
  }, [prescription]);

  useFocusEffect(useCallback(() => { if (user?.id) void refreshUser().catch(() => {}); }, [user?.id, refreshUser]));
  useEffect(() => {
    let active = true;
    setDone({});
    if (storageKey) AsyncStorage.getItem(storageKey).then(value => {
      if (active && value) try { setDone(JSON.parse(value)); } catch { setDone({}); }
    }).catch(() => {});
    return () => { active = false; };
  }, [storageKey]);

  const toggle = async (index: number) => {
    if (!plan || !storageKey) return;
    const meal = plan.meals[index];
    const next: Record<string, boolean> = { ...done, [index]: !done[index] };
    const referenceId = `${storageKey}:${index}`;
    try {
      if (next[index]) {
        const calories = Number(meal.calorias);
        if (!Number.isFinite(calories) || calories < 0) { setFeedback('Esta refeição ainda não tem calorias informadas pelo nutricionista.'); return; }
        if (!allMeals.some(item => item.referenceId === referenceId)) await addMeal({ name: meal.nome || `Refeição ${index + 1}`, description: [meal.alimentos, meal.porcao && `Porção: ${meal.porcao}`, meal.observacao].filter(Boolean).join(' · '), calories, source: 'manual', referenceId });
      } else {
        const record = allMeals.find(item => item.referenceId === referenceId);
        if (record) await removeMeal(record.id);
      }
      await AsyncStorage.setItem(storageKey, JSON.stringify(next));
      setDone(next);
      setFeedback('');
    } catch { setFeedback('Não foi possível atualizar o diário agora. Tente novamente.'); }
  };

  return <ScrollView style={{ flex: 1, backgroundColor: C.bg }} contentContainerStyle={[s.scroll, { paddingTop: topPad }]}>
    <Text style={[s.title, { color: C.text }]}>Plano alimentar</Text>
    {vinculo?.nutricionista ? <TouchableOpacity accessibilityRole="button" accessibilityLabel={`Abrir perfil de ${vinculo.nutricionista.nome}`} onPress={() => router.push({ pathname: '/nutri/professional', params: { id: String(vinculo.nutricionista.id) } })} style={[s.hero, { backgroundColor: C.primary }]}>{vinculo.nutricionista.foto ? <Image source={{ uri: vinculo.nutricionista.foto }} style={s.nutriPhoto} /> : <View style={s.nutriPhotoFallback}><Ionicons name="person" size={23} color={C.primary} /></View>}<View style={{ flex: 1 }}><Text style={s.heroTitle}>{vinculo.nutricionista.nome}</Text><Text style={s.heroText}>{vinculo.nutricionista.especialidade || 'Acompanhamento nutricional'} · {vinculo.status === 'ativo' ? 'Vínculo ativo' : 'Aguardando confirmação'}</Text></View><Ionicons name="chevron-forward" size={19} color="#fff" /></TouchableOpacity> : user?.nutricionistaId ? <View style={[s.notice, { backgroundColor: C.primarySoft, borderColor: C.border }]}><Ionicons name="time-outline" size={22} color={C.primary} /><Text style={{ color: C.textMuted, flex: 1 }}>Seu vínculo está aguardando confirmação do nutricionista.</Text></View> : <View style={[s.notice, { backgroundColor: C.primarySoft, borderColor: C.border }]}><Ionicons name="nutrition-outline" size={22} color={C.primary} /><Text style={{ color: C.textMuted, flex: 1 }}>Vincule um nutricionista para receber seu plano alimentar.</Text></View>}
    <View style={[s.card, { backgroundColor: C.surface, borderColor: C.border }]}>
      <Text style={[s.cardTitle, { color: C.text }]}>Plano atual</Text>
      {plan ? <>{plan.meals.map((meal, index) => <TouchableOpacity key={`${meal.nome}-${index}`} onPress={() => void toggle(index)} style={[s.meal, { backgroundColor: C.surface2, borderColor: done[index] ? C.primary : C.border }]}><Ionicons name={done[index] ? 'checkbox' : 'square-outline'} size={23} color={done[index] ? C.primary : C.textDim} /><View style={{ flex: 1 }}><Text style={{ color: C.text, fontWeight: '900' }}>{meal.horario ? `${meal.horario} · ` : ''}{meal.nome || `Refeição ${index + 1}`}</Text>{!!meal.alimentos && <Text style={[s.text, { color: C.textMuted }]}>{meal.alimentos}</Text>}{!!meal.porcao && <Text style={[s.small, { color: C.textMuted }]}>Porção: {meal.porcao}</Text>}{meal.calorias != null && <Text style={[s.small, { color: C.primary }]}>{meal.calorias} kcal · entra na meta diária ao concluir</Text>}<Text style={[s.small, { color: done[index] ? C.primary : C.textDim }]}>{done[index] ? 'Concluída' : 'Toque para marcar como concluída'}</Text></View></TouchableOpacity>)}</> : prescription ? prescription.split('\n').filter(Boolean).map(line => <Text key={line} style={[s.text, { color: C.textMuted }]}>• {line}</Text>) : <View style={s.empty}><Ionicons name="document-text-outline" size={42} color={C.textDim} /><Text style={{ color: C.text, fontWeight: '900', fontSize: 17 }}>Nenhum plano enviado</Text><Text style={[s.text, { color: C.textMuted, textAlign: 'center' }]}>{user?.nutricionistaId ? 'Seu nutricionista ainda não enviou um plano alimentar.' : 'Solicite o acompanhamento de um nutricionista para receber um plano.'}</Text>{!user?.nutricionistaId && <TouchableOpacity onPress={() => router.push('/nutri/request')} style={[s.button, { backgroundColor: C.primary }]}><Text style={{ color: '#fff', fontWeight: '900' }}>Vincular nutricionista</Text></TouchableOpacity>}</View>}
    </View>
    {!!feedback && <Text accessibilityRole="alert" style={{ color: C.danger }}>{feedback}</Text>}
    {vinculo?.status === 'ativo' && <TouchableOpacity onPress={() => router.push('/nutri/review')} style={[s.secondary, { backgroundColor: C.surface, borderColor: C.border }]}><Ionicons name="link-outline" size={18} color={C.danger} /><Text style={{ color: C.danger, fontWeight: '800' }}>Encerrar vínculo</Text></TouchableOpacity>}
    <TouchableOpacity onPress={() => router.push('/nutri/tracking')} style={[s.secondary, { backgroundColor: C.surface, borderColor: C.border }]}><Ionicons name="fitness-outline" size={18} color={C.primary} /><Text style={{ color: C.text, fontWeight: '800' }}>Registrar medidas</Text></TouchableOpacity>
  </ScrollView>;
}

const s = StyleSheet.create({
  scroll: { padding: 20, gap: 14, paddingBottom: 100 }, title: { fontSize: 26, fontWeight: '900' }, hero: { borderRadius: 20, padding: 17, flexDirection: 'row', alignItems: 'center', gap: 12 }, nutriPhoto: { width: 48, height: 48, borderRadius: 24, backgroundColor: '#fff' }, nutriPhotoFallback: { width: 48, height: 48, borderRadius: 24, backgroundColor: '#fff', alignItems: 'center', justifyContent: 'center' }, heroTitle: { color: '#fff', fontWeight: '900', fontSize: 16 }, heroText: { color: 'rgba(255,255,255,.8)', fontSize: 12, marginTop: 2 }, notice: { borderRadius: 18, borderWidth: 1, padding: 15, flexDirection: 'row', alignItems: 'center', gap: 10 }, card: { borderWidth: 1, borderRadius: 20, padding: 18, gap: 12 }, cardTitle: { fontSize: 16, fontWeight: '900' }, meal: { borderWidth: 1, borderRadius: 14, padding: 14, flexDirection: 'row', gap: 12 }, text: { fontSize: 14, lineHeight: 20, marginTop: 4 }, small: { fontSize: 12, marginTop: 5 }, empty: { alignItems: 'center', gap: 9, paddingVertical: 25 }, button: { borderRadius: 13, paddingVertical: 13, paddingHorizontal: 22, marginTop: 5 }, secondary: { borderWidth: 1, borderRadius: 15, padding: 14, flexDirection: 'row', justifyContent: 'center', gap: 8 },
});
