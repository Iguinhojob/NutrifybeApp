import AsyncStorage from '@react-native-async-storage/async-storage';
import { Ionicons } from '@expo/vector-icons';
import { router, useFocusEffect } from 'expo-router';
import { useCallback, useEffect, useMemo, useState } from 'react';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { AppButton, EmptyState, InlineNotice, StatusPill, useToast } from '@/components/ui-kit';
import { FollowUpStatusCard } from '@/components/follow-up-status';
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
  const toast = useToast();
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
      toast.show(next[index]
        ? { tone: 'success', title: 'Refeição concluída', message: `${meal.nome || `Refeição ${index + 1}`} foi adicionada ao diário de hoje.` }
        : { tone: 'info', title: 'Marcação desfeita', message: 'A refeição saiu do diário de hoje.' });
    } catch { setFeedback('Não foi possível atualizar o diário agora. Tente novamente.'); }
  };

  return <ScrollView style={{ flex: 1, backgroundColor: C.bg }} contentContainerStyle={[s.scroll, { paddingTop: topPad }]}>
    <Text accessibilityRole="header" style={[s.title, { color: C.text }]}>Plano alimentar</Text>
    <FollowUpStatusCard />
    <View style={[s.card, { backgroundColor: C.surface, borderColor: C.border }]}>
      <Text accessibilityRole="header" style={[s.cardTitle, { color: C.text }]}>Plano atual</Text>
      {plan ? <>
        <Text style={{ color: C.textMuted, fontSize: 13, lineHeight: 19 }}>Toque em uma refeição para marcá-la como concluída. Ela entra no seu diário de hoje com as calorias informadas pelo nutricionista.</Text>
        {plan.meals.map((meal, index) => {
          const checked = !!done[index];
          const hasCalories = meal.calorias != null && meal.calorias !== '';
          return <Pressable key={`${meal.nome}-${index}`} accessibilityRole="checkbox" accessibilityState={{ checked }} accessibilityLabel={`${meal.horario ? `${meal.horario}, ` : ''}${meal.nome || `Refeição ${index + 1}`}${hasCalories ? `, ${meal.calorias} quilocalorias` : ''}`} accessibilityHint={checked ? 'Toque para desmarcar e retirar do diário' : 'Toque para marcar como concluída e adicionar ao diário'} onPress={() => void toggle(index)} style={[s.meal, { backgroundColor: checked ? C.primarySoft : C.surface2, borderColor: checked ? C.primaryText : C.border }]}>
            <Ionicons name={checked ? 'checkbox' : 'square-outline'} size={24} color={checked ? C.primaryText : C.textMuted} />
            <View style={{ flex: 1, gap: 4 }}>
              <Text style={{ color: C.text, fontWeight: '900', fontSize: 15 }}>{meal.horario ? `${meal.horario} · ` : ''}{meal.nome || `Refeição ${index + 1}`}</Text>
              {!!meal.alimentos && <Text style={[s.text, { color: C.textMuted }]}>{meal.alimentos}</Text>}
              {!!meal.porcao && <Text style={[s.small, { color: C.text }]}>Porção: {meal.porcao}</Text>}
              {!!meal.observacao && <Text style={[s.small, { color: C.textMuted }]}>Substituição: {meal.observacao}</Text>}
              <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 6, marginTop: 4 }}>
                {hasCalories ? <StatusPill tone="info" icon="flame-outline" label={`${meal.calorias} kcal`} /> : <StatusPill tone="warning" icon="alert-circle-outline" label="Sem calorias informadas" />}
                <StatusPill tone={checked ? 'success' : 'neutral'} icon={checked ? 'checkmark-circle' : 'ellipse-outline'} label={checked ? 'Concluída hoje' : 'Pendente'} />
              </View>
            </View>
          </Pressable>;
        })}
        {!!plan.notes && <InlineNotice tone="info" title="Orientações do nutricionista">{plan.notes}</InlineNotice>}
      </> : prescription ? prescription.split('\n').filter(Boolean).map(line => <Text key={line} style={[s.text, { color: C.textMuted }]}>• {line}</Text>)
        : <EmptyState icon="document-text-outline" title="Nenhum plano enviado ainda">{vinculo?.status === 'ativo' ? 'Seu nutricionista ainda não enviou um plano. Quando enviar, ele aparece aqui automaticamente.' : user?.nutricionistaId ? 'O plano fica disponível depois que o nutricionista aceitar sua solicitação.' : 'Com um nutricionista vinculado, você recebe aqui um plano alimentar personalizado.'}</EmptyState>}
    </View>
    {!!feedback && <InlineNotice tone="danger" live>{feedback}</InlineNotice>}
    <AppButton variant="secondary" icon="fitness-outline" label="Registrar medidas" onPress={() => router.push('/nutri/tracking')} />
    {vinculo?.status === 'ativo' && <AppButton variant="dangerOutline" icon="link-outline" label="Encerrar acompanhamento" accessibilityHint="Abre a avaliação do nutricionista antes de encerrar" onPress={() => router.push('/nutri/review')} />}
  </ScrollView>;
}

const s = StyleSheet.create({
  scroll: { padding: 20, gap: 14, paddingBottom: 100 }, title: { fontSize: 26, fontWeight: '900' }, hero: { borderRadius: 20, padding: 17, flexDirection: 'row', alignItems: 'center', gap: 12 }, nutriPhoto: { width: 48, height: 48, borderRadius: 24, backgroundColor: '#fff' }, nutriPhotoFallback: { width: 48, height: 48, borderRadius: 24, backgroundColor: '#fff', alignItems: 'center', justifyContent: 'center' }, heroTitle: { color: '#fff', fontWeight: '900', fontSize: 16 }, heroText: { color: 'rgba(255,255,255,.8)', fontSize: 12, marginTop: 2 }, notice: { borderRadius: 18, borderWidth: 1, padding: 15, flexDirection: 'row', alignItems: 'center', gap: 10 }, card: { borderWidth: 1, borderRadius: 20, padding: 18, gap: 12 }, cardTitle: { fontSize: 16, fontWeight: '900' }, meal: { borderWidth: 1, borderRadius: 14, padding: 14, flexDirection: 'row', gap: 12 }, text: { fontSize: 14, lineHeight: 20, marginTop: 4 }, small: { fontSize: 12, marginTop: 5 }, empty: { alignItems: 'center', gap: 9, paddingVertical: 25 }, button: { borderRadius: 13, paddingVertical: 13, paddingHorizontal: 22, marginTop: 5 }, secondary: { borderWidth: 1, borderRadius: 15, padding: 14, flexDirection: 'row', justifyContent: 'center', gap: 8 },
});
