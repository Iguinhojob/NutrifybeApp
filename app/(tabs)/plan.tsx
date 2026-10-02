import AsyncStorage from '@react-native-async-storage/async-storage';
import { Ionicons } from '@expo/vector-icons';
import { router, useFocusEffect } from 'expo-router';
import { useCallback, useEffect, useMemo, useState } from 'react';
import { ActivityIndicator, Modal, ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';

import { useAuth } from '@/context/auth';
import { useDiary } from '@/context/diary';
import { usePremiumTheme } from '@/context/theme';
import { useAppLayout } from '@/hooks/useAppLayout';
import { localDateString } from '@/services/api';
import {
  defaultPantryFor,
  generateNutriaPlan,
  isFoodCompatible,
  pantryError,
  PANTRY_FOODS,
  PANTRY_GROUP_LABELS,
  type NutriaMeal,
  type NutriaPlan,
  type PantryGroup,
} from '@/utils/nutria';

const PLAN_STORAGE_PREFIX = 'nutrifybe:nutria-plan:v1:';
const prescribedCompletionKey = (userId: number, plan: string, day: string) => {
  let hash = 2166136261;
  for (let index = 0; index < plan.length; index += 1) hash = Math.imul(hash ^ plan.charCodeAt(index), 16777619);
  return `nutrifybe:prescribed-meals:v1:${userId}:${day}:${(hash >>> 0).toString(36)}`;
};
const SHORT_DAYS = ['Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb', 'Dom'];
const PANTRY_GROUPS: PantryGroup[] = ['protein', 'carb', 'fruit', 'vegetable', 'extra'];

function todayIndex() {
  const day = new Date().getDay();
  return day === 0 ? 6 : day - 1;
}

export default function PlanScreen() {
  const { vinculo, user, refreshUser } = useAuth();
  const userId = user?.id;
  useFocusEffect(useCallback(() => { if (userId) void refreshUser().catch(() => {}); }, [userId, refreshUser]));
  return vinculo?.status === 'ativo' ? <NutritionistPlan /> : <NutriaPlanScreen />;
}

function NutritionistPlan() {
  const { colors: C } = usePremiumTheme();
  const { topPad } = useAppLayout();
  const { user, vinculo } = useAuth();
  const nutritionist = vinculo?.nutricionista;
  const prescription = user?.prescricaoSemanal?.trim();
  const [completed, setCompleted] = useState<Record<string, boolean>>({});
  const structuredPlan = useMemo(() => {
    if (!prescription) return null;
    try {
      const parsed = JSON.parse(prescription);
      return parsed?.version === 1 && Array.isArray(parsed.meals) ? parsed as { version: number; meals: { horario?: string; nome?: string; alimentos?: string; porcao?: string; calorias?: string | number; observacao?: string }[]; notes?: string } : null;
    } catch { return null; }
  }, [prescription]);
  const completionKey = user?.id && prescription ? prescribedCompletionKey(user.id, prescription, localDateString()) : null;
  const { allMeals, addMeal, removeMeal } = useDiary();
  const [prescriptionFeedback, setPrescriptionFeedback] = useState('');
  useEffect(() => {
    let active = true;
    setCompleted({});
    if (completionKey) AsyncStorage.getItem(completionKey).then(raw => { if (active && raw) { try { setCompleted(JSON.parse(raw)); } catch { setCompleted({}); } } }).catch(() => {});
    return () => { active = false; };
  }, [completionKey]);
  const togglePrescribedMeal = async (index: number) => {
    if (!completionKey || !structuredPlan || !user) return;
    const next = { ...completed, [String(index)]: !completed[String(index)] };
    const meal = structuredPlan.meals[index];
    const referenceId = `${completionKey}:${index}`;
    try {
      if (next[String(index)]) {
        const calories = Number(meal.calorias);
        if (!Number.isFinite(calories) || calories < 0) { setPrescriptionFeedback('Esta refeição ainda não tem calorias informadas pelo nutricionista.'); return; }
        if (!allMeals.some(record => record.referenceId === referenceId)) {
          await addMeal({ name: meal.nome || `Refeição ${index + 1}`, description: [meal.alimentos, meal.porcao && `Porção: ${meal.porcao}`, meal.observacao && `Observação: ${meal.observacao}`].filter(Boolean).join(' · '), calories, source: 'manual', referenceId });
        }
      } else {
        const record = allMeals.find(item => item.referenceId === referenceId);
        if (record) await removeMeal(record.id);
      }
      await AsyncStorage.setItem(completionKey, JSON.stringify(next));
      setCompleted(next);
      setPrescriptionFeedback('');
    } catch { setPrescriptionFeedback('Não foi possível atualizar o diário agora. Tente novamente.'); }
  };

  return (
    <ScrollView style={{ flex: 1, backgroundColor: C.bg }} contentContainerStyle={[styles.scroll, { paddingTop: topPad }]} showsVerticalScrollIndicator={false}>
      <Text style={[styles.title, { color: C.text }]}>Plano alimentar</Text>
      <View style={[styles.hero, { backgroundColor: C.primary }]}>
        <View style={styles.heroIcon}><Ionicons name="person" size={25} color="#fff" /></View>
        <View style={{ flex: 1 }}>
          <Text style={styles.heroTitle}>{nutritionist?.nome || 'Nutricionista vinculado'}</Text>
          <Text style={styles.heroSubtitle}>{nutritionist?.especialidade || 'Acompanhamento nutricional'}</Text>
          {!!nutritionist?.crn && <Text style={styles.heroMeta}>CRN {nutritionist.crn}</Text>}
        </View>
        {!!prescriptionFeedback && <Text accessibilityRole="alert" style={{ color: C.danger, marginTop: 8, fontSize: 12 }}>{prescriptionFeedback}</Text>}
        <View style={styles.activeBadge}><View style={styles.activeDot} /><Text style={styles.activeText}>Ativo</Text></View>
      </View>

      <View style={[styles.card, { backgroundColor: C.surface, borderColor: C.border }]}>
        <View style={styles.rowBetween}>
          <Text style={[styles.cardTitle, { color: C.text }]}>Plano atual</Text>
          <TouchableOpacity onPress={() => router.push('/nutri/plan-history')} style={styles.inlineButton}>
            <Text style={{ color: C.primary, fontWeight: '800', fontSize: 12 }}>Histórico</Text>
            <Ionicons name="chevron-forward" size={14} color={C.primary} />
          </TouchableOpacity>
        </View>
        {structuredPlan ? (
          <>
            {structuredPlan.meals.map((meal, index) => {
              const done = !!completed[String(index)];
              return <TouchableOpacity key={`${meal.nome}-${index}`} onPress={() => void togglePrescribedMeal(index)} accessibilityRole="checkbox" accessibilityState={{ checked: done }} style={{ flexDirection: 'row', alignItems: 'flex-start', gap: 12, padding: 14, marginTop: 10, borderRadius: 14, borderWidth: 1, borderColor: done ? C.primary : C.border, backgroundColor: C.surface2 }}>
                <Ionicons name={done ? 'checkbox' : 'square-outline'} size={23} color={done ? C.primary : C.textDim} />
                <View style={{ flex: 1 }}>
                  <Text style={{ color: C.text, fontWeight: '900', fontSize: 15 }}>{meal.horario ? `${meal.horario} · ` : ''}{meal.nome || `Refeição ${index + 1}`}</Text>
                  {!!meal.alimentos && <Text style={[styles.bodyText, { color: C.textMuted, marginTop: 5 }]}>{meal.alimentos}</Text>}
                  {!!meal.porcao && <Text style={{ color: C.textMuted, fontSize: 12, marginTop: 5 }}>Porção: {meal.porcao}</Text>}
                  {meal.calorias != null && meal.calorias !== '' && <Text style={{ color: C.primary, fontSize: 12, fontWeight: '900', marginTop: 5 }}>{meal.calorias} kcal · entra na meta diária ao concluir</Text>}
                  {!!meal.observacao && <Text style={{ color: C.textMuted, fontSize: 12, marginTop: 4 }}>Opção/observação: {meal.observacao}</Text>}
                  <Text style={{ color: done ? C.primary : C.textDim, fontSize: 11, fontWeight: '800', marginTop: 8 }}>{done ? 'Concluída' : 'Toque para marcar como concluída'}</Text>
                </View>
              </TouchableOpacity>;
            })}
            {!!structuredPlan.notes && <View style={{ marginTop: 16, padding: 13, borderRadius: 12, backgroundColor: C.surface2 }}><Text style={{ color: C.text, fontWeight: '800', marginBottom: 4 }}>Orientações gerais</Text><Text style={[styles.bodyText, { color: C.textMuted }]}>{structuredPlan.notes}</Text></View>}
          </>
        ) : prescription ? prescription.split('\n').filter(Boolean).map((line, index) => (
          <View key={`${line}-${index}`} style={styles.bulletRow}><View style={[styles.bullet, { backgroundColor: C.primary }]} /><Text style={[styles.bodyText, { color: C.textMuted }]}>{line}</Text></View>
        )) : (
          <View style={styles.emptyInner}>
            <Ionicons name="document-text-outline" size={42} color={C.textDim} />
            <Text style={[styles.emptyTitle, { color: C.text }]}>Nenhum plano enviado</Text>
            <Text style={[styles.emptyText, { color: C.textMuted }]}>Quando seu nutricionista enviar uma prescrição, ela aparecerá aqui.</Text>
          </View>
        )}
      </View>

      <TouchableOpacity style={[styles.secondaryButton, { backgroundColor: C.surface, borderColor: C.border }]} onPress={() => router.push('/nutri/tracking')}>
        <Ionicons name="fitness-outline" size={18} color={C.primary} />
        <Text style={[styles.secondaryButtonText, { color: C.text }]}>Registrar medidas</Text>
      </TouchableOpacity>
      <View style={{ height: 100 }} />
    </ScrollView>
  );
}

function NutriaPlanScreen() {
  const { colors: C } = usePremiumTheme();
  const { topPad } = useAppLayout();
  const { user } = useAuth();
  const { mealsToday, addMeal } = useDiary();
  const [plan, setPlan] = useState<NutriaPlan | null>(null);
  const [loading, setLoading] = useState(true);
  const [selectedDay, setSelectedDay] = useState(todayIndex());
  const [expanded, setExpanded] = useState<number | null>(0);
  const [termsVisible, setTermsVisible] = useState(false);
  const [termsAccepted, setTermsAccepted] = useState(false);
  const [safetyAccepted, setSafetyAccepted] = useState(false);
  const [creating, setCreating] = useState(false);
  const [deleteVisible, setDeleteVisible] = useState(false);
  const [pendingMeal, setPendingMeal] = useState<NutriaMeal | null>(null);
  const [actionBusy, setActionBusy] = useState(false);
  const [feedback, setFeedback] = useState('');
  const [pantryVisible, setPantryVisible] = useState(false);
  const [pantryIds, setPantryIds] = useState<string[]>([]);
  const [pantryDraft, setPantryDraft] = useState<string[]>([]);
  const [pantryMessage, setPantryMessage] = useState('');
  const storageKey = user ? `${PLAN_STORAGE_PREFIX}${user.id}` : null;
  const hasUnstructuredHealthNeed = !!user?.healthNote?.trim()
    || (user?.restrictions ?? '').split(',').some(value => value.trim().toLowerCase() === 'outras');

  useEffect(() => {
    if (!user) return;
    setPantryIds(defaultPantryFor(user));
  }, [user]);

  useEffect(() => {
    let active = true;
    setLoading(true);
    setPlan(null);
    if (!storageKey) {
      setLoading(false);
      return () => { active = false; };
    }
    AsyncStorage.getItem(storageKey).then(async raw => {
      try {
        let saved = raw ? JSON.parse(raw) as NutriaPlan : null;
        if (saved?.version !== 6 && user) {
          const upgraded = generateNutriaPlan(user, defaultPantryFor(user));
          if (upgraded) {
            saved = upgraded;
            await AsyncStorage.setItem(storageKey, JSON.stringify(upgraded));
          }
        }
        if (!active) return;
        setPlan(saved);
        if (saved?.pantry?.length) setPantryIds(saved.pantry);
      } catch { setPlan(null); }
      setLoading(false);
    }).catch(() => { if (active) { setPlan(null); setLoading(false); } });
    return () => { active = false; };
  }, [storageKey, user]);

  const openTerms = () => {
    setTermsAccepted(false);
    setSafetyAccepted(false);
    setFeedback('');
    setTermsVisible(true);
  };

  const openPantry = () => {
    if (!user) return;
    setPantryDraft(plan?.pantry?.length ? plan.pantry : pantryIds.length ? pantryIds : defaultPantryFor(user));
    setPantryMessage('');
    setPantryVisible(true);
  };

  const togglePantryFood = (id: string) => {
    setPantryMessage('');
    setPantryDraft(current => current.includes(id) ? current.filter(item => item !== id) : [...current, id]);
  };

  const saveGeneratedPlan = async (generated: NutriaPlan) => {
    if (!storageKey) return;
    await AsyncStorage.setItem(storageKey, JSON.stringify(generated));
    setPlan(generated);
    setPantryIds(generated.pantry ?? []);
    setSelectedDay(todayIndex());
    setExpanded(0);
  };

  const savePantry = async () => {
    if (!user) return;
    const error = pantryError(pantryDraft, user);
    if (error) { setPantryMessage(error); return; }
    setPantryIds(pantryDraft);
    if (!plan) { setPantryVisible(false); return; }
    setActionBusy(true);
    try {
      const generated = generateNutriaPlan(user, pantryDraft);
      if (!generated) { setPantryMessage('Não foi possível montar o plano com essa seleção.'); return; }
      await saveGeneratedPlan(generated);
      setPantryVisible(false);
      setFeedback('Plano atualizado com os alimentos que você tem em casa.');
    } catch { setPantryMessage('Não foi possível atualizar o plano agora.'); }
    finally { setActionBusy(false); }
  };

  const createPlan = async () => {
    if (!user || !storageKey || hasUnstructuredHealthNeed || !termsAccepted || !safetyAccepted) return;
    setCreating(true);
    setFeedback('');
    try {
      const generated = generateNutriaPlan(user, pantryIds);
      if (!generated) { setFeedback('Escolha alimentos de todos os grupos antes de criar o plano.'); setTermsVisible(false); openPantry(); return; }
      await saveGeneratedPlan(generated);
      setTermsVisible(false);
      setFeedback('Plano criado e salvo neste aparelho.');
    } catch { setFeedback('Não foi possível criar o plano. Tente novamente.'); }
    finally { setCreating(false); }
  };

  const confirmDelete = async () => {
    if (!storageKey) return;
    setActionBusy(true);
    try {
      await AsyncStorage.removeItem(storageKey);
      setPlan(null);
      setDeleteVisible(false);
      setSelectedDay(todayIndex());
      setExpanded(0);
      setFeedback('Plano excluído deste aparelho.');
    } catch { setFeedback('Não foi possível excluir o plano. Tente novamente.'); setDeleteVisible(false); }
    finally { setActionBusy(false); }
  };

  const confirmConsumption = async () => {
    if (!plan || !pendingMeal) return;
    const meal = pendingMeal;
    const referenceId = `${plan.id}:${meal.id}`;
    if (mealsToday.some(record => record.referenceId === referenceId)) { setPendingMeal(null); return; }
    setActionBusy(true);
    try {
      await addMeal({
        name: meal.name,
        description: meal.foods.join(', '),
        calories: meal.targetKcal,
        carbs: meal.macros.carbs,
        protein: meal.macros.protein,
        fat: meal.macros.fat,
        source: 'nutria',
        referenceId,
      });
      setPendingMeal(null);
      setFeedback(`${meal.targetKcal} kcal adicionadas às calorias de hoje.`);
    } catch { setFeedback('Não foi possível registrar a refeição. Tente novamente.'); setPendingMeal(null); }
    finally { setActionBusy(false); }
  };

  const currentDay = plan?.days[selectedDay];
  const currentDayKcal = currentDay?.meals.reduce((sum, meal) => sum + meal.targetKcal, 0) ?? 0;
  const consumedReferences = useMemo(() => new Set(mealsToday.map(meal => meal.referenceId).filter(Boolean)), [mealsToday]);
  const compatibleFoods = user ? PANTRY_FOODS.filter(food => isFoodCompatible(food, user)) : [];

  return (
    <View style={{ flex: 1, backgroundColor: C.bg }}>
      <ScrollView contentContainerStyle={[styles.scroll, { paddingTop: topPad }]} showsVerticalScrollIndicator={false}>
        <View style={styles.rowBetween}>
          <View>
            <Text style={[styles.title, { color: C.text, marginBottom: 3 }]}>Plano alimentar</Text>
            <Text style={[styles.subtitle, { color: C.textMuted }]}>Seu planejamento semanal</Text>
          </View>
          {!!plan && (
            <TouchableOpacity accessibilityLabel="Excluir plano" onPress={() => setDeleteVisible(true)} style={[styles.iconButton, { backgroundColor: C.dangerSoft }]}>
              <Ionicons name="trash-outline" size={19} color={C.danger} />
            </TouchableOpacity>
          )}
        </View>

        {!!feedback && <View style={[styles.feedback, { backgroundColor: C.successSoft }]}><Ionicons name="checkmark-circle-outline" size={18} color={C.success} /><Text style={{ color: C.text, flex: 1, fontSize: 12 }}>{feedback}</Text></View>}

        <TouchableOpacity onPress={() => router.push('/auth/nutri-code')} style={[styles.catalogCard, { backgroundColor: C.surface, borderColor: C.border }]}>
          <View style={styles.catalogHeader}>
            <View style={[styles.catalogIcon, { backgroundColor: C.primarySoft }]}><Ionicons name="people-outline" size={22} color={C.primary} /></View>
            <View style={{ flex: 1 }}>
              <Text style={[styles.linkTitle, { color: C.text }]}>Já conhece seu nutricionista?</Text>
              <Text style={[styles.linkSubtitle, { color: C.textMuted }]}>Peça o ID da conta dele e envie uma solicitação de vínculo.</Text>
            </View>
            <Ionicons name="chevron-forward" size={20} color={C.primary} />
          </View>
        </TouchableOpacity>

        <TouchableOpacity onPress={() => router.push('/nutri/directory')} style={[styles.catalogCard, { backgroundColor: C.surface, borderColor: C.border }]}>
          <View style={styles.catalogHeader}>
            <View style={[styles.catalogIcon, { backgroundColor: C.primarySoft }]}><Ionicons name="search-outline" size={22} color={C.primary} /></View>
            <View style={{ flex: 1 }}>
              <Text style={[styles.linkTitle, { color: C.text }]}>Ver nutricionistas disponíveis</Text>
              <Text style={[styles.linkSubtitle, { color: C.textMuted }]}>Explore os perfis e solicite acompanhamento a quem combinar com você.</Text>
            </View>
            <Ionicons name="chevron-forward" size={20} color={C.primary} />
          </View>
        </TouchableOpacity>

        {loading ? (
          <View style={styles.loadingBox}><ActivityIndicator color={C.primary} /><Text style={{ color: C.textMuted }}>Carregando seu plano…</Text></View>
        ) : !plan ? (
          <View style={[styles.emptyCard, { backgroundColor: C.surface, borderColor: C.border }]}>
            <View style={[styles.aiIcon, { backgroundColor: C.primarySoft }]}><Ionicons name="sparkles" size={31} color={C.primary} /></View>
            <Text style={[styles.emptyTitle, { color: C.text }]}>Você ainda não possui um plano</Text>
            <Text style={[styles.emptyText, { color: C.textMuted }]}>A NutriIA pode montar uma sugestão semanal baseada na sua meta e nos alimentos disponíveis em casa.</Text>
            <TouchableOpacity onPress={openPantry} style={[styles.secondaryButton, { backgroundColor: C.surface2, borderColor: C.border, alignSelf: 'stretch' }]}>
              <Ionicons name="basket-outline" size={18} color={C.primary} />
              <Text style={[styles.secondaryButtonText, { color: C.text }]}>Editar alimentos que tenho em casa</Text>
            </TouchableOpacity>
            <TouchableOpacity onPress={openTerms} style={[styles.primaryButton, { backgroundColor: C.primary }]}>
              <Ionicons name="sparkles-outline" size={19} color="#fff" />
              <Text style={styles.primaryButtonText}>Criar plano com NutriIA</Text>
            </TouchableOpacity>
            <Text style={[styles.finePrint, { color: C.textDim }]}>Sugestão automática. Não substitui avaliação de nutricionista ou médico.</Text>
          </View>
        ) : (
          <>
            <View style={[styles.planHeader, { backgroundColor: C.surface, borderColor: C.border }]}>
              <View style={styles.rowBetween}>
                <View style={[styles.aiBadge, { backgroundColor: C.primarySoft }]}><Ionicons name="sparkles" size={14} color={C.primary} /><Text style={{ color: C.primary, fontWeight: '900', fontSize: 12 }}>NutriIA</Text></View>
                <Text style={{ color: C.textDim, fontSize: 11 }}>Criado em {new Date(plan.createdAt).toLocaleDateString('pt-BR')}</Text>
              </View>
              <Text style={[styles.planGoal, { color: C.text }]}>{plan.calorieTarget} kcal por dia</Text>
              <Text style={[styles.planMeta, { color: C.textMuted }]}>Objetivo: {plan.goal}{plan.preferences.length ? ` · ${plan.preferences.join(', ')}` : ''}</Text>
              <View style={styles.macroRow}>
                {[
                  ['Proteína', `${plan.macros.protein} g`, '#3B82F6'], ['Carboidrato', `${plan.macros.carbs} g`, '#F97316'], ['Gordura', `${plan.macros.fat} g`, '#EAB308'],
                ].map(([label, value, color]) => (
                  <View key={label} style={[styles.macro, { backgroundColor: C.surface2 }]}><View style={[styles.macroDot, { backgroundColor: color }]} /><Text style={[styles.macroValue, { color: C.text }]}>{value}</Text><Text style={[styles.macroLabel, { color: C.textMuted }]}>{label}</Text></View>
                ))}
              </View>
              <TouchableOpacity onPress={openPantry} style={[styles.editPantryButton, { borderColor: C.border }]}>
                <Ionicons name="basket-outline" size={17} color={C.primary} />
                <Text style={{ color: C.primary, fontWeight: '900', fontSize: 12 }}>Editar alimentos disponíveis</Text>
              </TouchableOpacity>
            </View>

            <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ gap: 8 }}>
              {SHORT_DAYS.map((day, index) => <TouchableOpacity key={day} onPress={() => { setSelectedDay(index); setExpanded(0); }} style={[styles.dayButton, { backgroundColor: selectedDay === index ? C.primary : C.surface, borderColor: C.border }]}><Text style={{ color: selectedDay === index ? '#fff' : C.textMuted, fontWeight: '800' }}>{day}</Text></TouchableOpacity>)}
            </ScrollView>

            <View style={styles.dayHeading}><Text style={[styles.cardTitle, { color: C.text }]}>{currentDay?.label}</Text>{selectedDay === todayIndex() && <View style={[styles.todayBadge, { backgroundColor: C.successSoft }]}><Text style={{ color: C.success, fontSize: 11, fontWeight: '800' }}>Hoje</Text></View>}<Text style={{ color: C.textMuted, fontSize: 11, marginLeft: 'auto' }}>{currentDayKcal} kcal no cardápio</Text></View>

            {currentDay?.meals.map((meal, index) => {
              const referenceId = `${plan.id}:${meal.id}`;
              const consumed = consumedReferences.has(referenceId);
              return (
                <View key={meal.id} style={[styles.mealCard, { backgroundColor: C.surface, borderColor: C.border }]}>
                  <TouchableOpacity onPress={() => setExpanded(expanded === index ? null : index)} style={styles.mealHeader}>
                    <View style={[styles.mealIcon, { backgroundColor: C.primarySoft }]}><Ionicons name="restaurant-outline" size={18} color={C.primary} /></View>
                    <View style={{ flex: 1 }}><Text style={[styles.mealName, { color: C.text }]}>{meal.name}</Text><Text style={[styles.mealMeta, { color: C.textMuted }]}>{meal.time} · aproximadamente {meal.targetKcal} kcal</Text></View>
                    <Ionicons name={expanded === index ? 'chevron-up' : 'chevron-down'} size={18} color={C.textMuted} />
                  </TouchableOpacity>
                  {expanded === index && (
                    <View style={[styles.mealDetails, { borderTopColor: C.border }]}>
                      <View style={styles.mealMacroRow}>
                        {[
                          ['Carbo', `${meal.macros.carbs} g`, '#F97316'],
                          ['Proteína', `${meal.macros.protein} g`, '#3B82F6'],
                          ['Gordura', `${meal.macros.fat} g`, '#EAB308'],
                        ].map(([label, value, color]) => <View key={label} style={[styles.mealMacroChip, { backgroundColor: `${color}14` }]}><View style={[styles.mealMacroDot, { backgroundColor: color }]} /><Text style={[styles.mealMacroValue, { color: C.text }]}>{value}</Text><Text style={[styles.mealMacroLabel, { color: C.textMuted }]}>{label}</Text></View>)}
                      </View>
                      {meal.foods.map(food => <View key={food} style={styles.bulletRow}><View style={[styles.bullet, { backgroundColor: C.primary }]} /><Text style={[styles.bodyText, { color: C.textMuted }]}>{food}</Text></View>)}
                      {selectedDay === todayIndex() && <TouchableOpacity disabled={consumed} onPress={() => setPendingMeal(meal)} style={[styles.consumeButton, { backgroundColor: consumed ? C.surface2 : C.primarySoft }]}><Ionicons name={consumed ? 'checkmark-circle' : 'add-circle-outline'} size={17} color={consumed ? C.success : C.primary} /><Text style={{ color: consumed ? C.success : C.primary, fontWeight: '800', fontSize: 12 }}>{consumed ? 'Registrada hoje' : 'Consumir e adicionar às calorias'}</Text></TouchableOpacity>}
                    </View>
                  )}
                </View>
              );
            })}

            <View style={[styles.warningCard, { backgroundColor: C.warningSoft, borderColor: C.warning + '50' }]}><Ionicons name="information-circle-outline" size={21} color={C.warning} /><Text style={[styles.warningText, { color: C.textMuted }]}>As quantidades e calorias são estimativas. Pese o alimento pronto quando a descrição indicar gramas.</Text></View>
            <TouchableOpacity onPress={openTerms} style={[styles.secondaryButton, { backgroundColor: C.surface, borderColor: C.border }]}><Ionicons name="refresh-outline" size={18} color={C.primary} /><Text style={[styles.secondaryButtonText, { color: C.text }]}>Recriar plano com dados atuais</Text></TouchableOpacity>
          </>
        )}
        <View style={{ height: 100 }} />
      </ScrollView>

      <Modal visible={pantryVisible} animationType="slide" presentationStyle="pageSheet" onRequestClose={() => setPantryVisible(false)}>
        <View style={[styles.sheet, { backgroundColor: C.bg }]}>
          <View style={styles.rowBetween}><View><Text style={[styles.modalTitle, { color: C.text, textAlign: 'left' }]}>O que você tem em casa?</Text><Text style={[styles.modalText, { color: C.textMuted }]}>Escolha os alimentos usados para montar as refeições.</Text></View><TouchableOpacity onPress={() => setPantryVisible(false)} style={[styles.closeButton, { backgroundColor: C.surface }]}><Ionicons name="close" size={22} color={C.text} /></TouchableOpacity></View>
          <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ gap: 18, paddingBottom: 24 }}>
            {PANTRY_GROUPS.map(group => {
              const foods = compatibleFoods.filter(food => food.group === group);
              return <View key={group} style={{ gap: 9 }}><Text style={[styles.groupTitle, { color: C.text }]}>{PANTRY_GROUP_LABELS[group]}{group === 'fruit' || group === 'vegetable' || group === 'extra' ? ' (opcional)' : ''}</Text><View style={styles.chipWrap}>{foods.map(food => { const selected = pantryDraft.includes(food.id); return <TouchableOpacity key={food.id} onPress={() => togglePantryFood(food.id)} style={[styles.foodChip, { borderColor: selected ? C.primary : C.border, backgroundColor: selected ? C.primarySoft : C.surface }]}><Ionicons name={selected ? 'checkmark-circle' : 'ellipse-outline'} size={17} color={selected ? C.primary : C.textDim} /><Text style={{ color: selected ? C.primary : C.text, fontSize: 12, fontWeight: '700' }}>{food.label}</Text></TouchableOpacity>; })}</View></View>;
            })}
            {!!pantryMessage && <Text style={{ color: C.danger, fontSize: 12, lineHeight: 18 }}>{pantryMessage}</Text>}
          </ScrollView>
          <TouchableOpacity disabled={actionBusy} onPress={() => void savePantry()} style={[styles.sheetAction, { backgroundColor: C.primary }]}>{actionBusy ? <ActivityIndicator color="#fff" /> : <Text style={styles.primaryButtonText}>{plan ? 'Salvar e atualizar plano' : 'Salvar alimentos'}</Text>}</TouchableOpacity>
        </View>
      </Modal>

      <Modal visible={termsVisible} transparent animationType="fade" onRequestClose={() => setTermsVisible(false)}>
        <View style={styles.modalOverlay}><View style={[styles.modalCard, { backgroundColor: C.surface }]}><ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ gap: 14 }}>
          <View style={[styles.aiIcon, { backgroundColor: C.primarySoft, alignSelf: 'center' }]}><Ionicons name="shield-checkmark-outline" size={30} color={C.primary} /></View>
          <Text style={[styles.modalTitle, { color: C.text }]}>Antes de usar a NutriIA</Text>
          <Text style={[styles.modalText, { color: C.textMuted }]}>Este plano é uma sugestão automática e pode conter erros ou estimativas imprecisas. Não é diagnóstico, prescrição clínica nem substitui nutricionista ou médico.</Text>
          <View style={[styles.warningCard, { backgroundColor: C.warningSoft, borderColor: C.warning + '50', marginBottom: 0 }]}><Ionicons name="warning-outline" size={22} color={C.warning} /><Text style={[styles.warningText, { color: C.text }]}>Gestação, amamentação, diabetes, transtornos alimentares e doenças renais, hepáticas, cardíacas ou gastrointestinais exigem orientação individual.</Text></View>
          {hasUnstructuredHealthNeed ? <View style={[styles.healthBlock, { backgroundColor: C.dangerSoft, borderColor: C.danger + '50' }]}><Text style={{ color: C.danger, fontWeight: '900' }}>Geração indisponível por segurança</Text><Text style={[styles.modalText, { color: C.text }]}>Você informou: &quot;{user?.healthNote?.trim() || 'Outras necessidades alimentares'}&quot;.</Text><Text style={[styles.modalText, { color: C.textMuted }]}>A NutriIA local não consegue interpretar essa informação com segurança.</Text></View> : <><CheckRow checked={termsAccepted} onPress={() => setTermsAccepted(value => !value)} label="Li e compreendi que a sugestão pode conter erros e não substitui acompanhamento profissional." C={C} /><CheckRow checked={safetyAccepted} onPress={() => setSafetyAccepted(value => !value)} label="Confirmo que não tenho uma condição que exija dieta clínica individualizada, ou que já fui autorizado por profissional de saúde." C={C} /></>}
          <View style={styles.modalActions}><TouchableOpacity onPress={() => setTermsVisible(false)} style={[styles.modalButton, { borderColor: C.border }]}><Text style={{ color: C.text, fontWeight: '800' }}>Cancelar</Text></TouchableOpacity>{hasUnstructuredHealthNeed ? <TouchableOpacity onPress={() => { setTermsVisible(false); router.push('/auth/nutri-code'); }} style={[styles.modalButton, { backgroundColor: C.primary, borderColor: C.primary }]}><Text style={{ color: '#fff', fontWeight: '800' }}>Já tenho nutricionista</Text></TouchableOpacity> : <TouchableOpacity disabled={!termsAccepted || !safetyAccepted || creating} onPress={() => void createPlan()} style={[styles.modalButton, { backgroundColor: termsAccepted && safetyAccepted ? C.primary : C.border, borderColor: 'transparent' }]}>{creating ? <ActivityIndicator color="#fff" /> : <Text style={{ color: '#fff', fontWeight: '800' }}>{plan ? 'Recriar plano' : 'Aceitar e criar'}</Text>}</TouchableOpacity>}</View>
        </ScrollView></View></View>
      </Modal>

      <ConfirmModal visible={deleteVisible} title="Excluir plano da NutriIA?" message="A sugestão atual será removida deste aparelho. Refeições já registradas como consumidas serão mantidas no histórico." confirmLabel="Excluir plano" destructive busy={actionBusy} onCancel={() => setDeleteVisible(false)} onConfirm={() => void confirmDelete()} C={C} />
      <ConfirmModal visible={!!pendingMeal} title="Registrar como consumida?" message={pendingMeal ? `${pendingMeal.name} adicionará ${pendingMeal.targetKcal} kcal ao total da tela inicial.` : ''} confirmLabel="Consumir e adicionar" busy={actionBusy} onCancel={() => setPendingMeal(null)} onConfirm={() => void confirmConsumption()} C={C} />
    </View>
  );
}

function CheckRow({ checked, onPress, label, C }: { checked: boolean; onPress: () => void; label: string; C: ReturnType<typeof usePremiumTheme>['colors'] }) {
  return <TouchableOpacity accessibilityRole="checkbox" accessibilityState={{ checked }} onPress={onPress} style={[styles.checkRow, { borderColor: checked ? C.primary : C.border, backgroundColor: checked ? C.primarySoft : C.surface2 }]}><Ionicons name={checked ? 'checkbox' : 'square-outline'} size={23} color={checked ? C.primary : C.textMuted} /><Text style={{ color: C.text, flex: 1, fontSize: 13, lineHeight: 19 }}>{label}</Text></TouchableOpacity>;
}

function ConfirmModal({ visible, title, message, confirmLabel, destructive, busy, onCancel, onConfirm, C }: { visible: boolean; title: string; message: string; confirmLabel: string; destructive?: boolean; busy: boolean; onCancel: () => void; onConfirm: () => void; C: ReturnType<typeof usePremiumTheme>['colors'] }) {
  const color = destructive ? C.danger : C.primary;
  return <Modal visible={visible} transparent animationType="fade" onRequestClose={onCancel}><View style={styles.modalOverlay}><View style={[styles.confirmCard, { backgroundColor: C.surface }]}><View style={[styles.confirmIcon, { backgroundColor: destructive ? C.dangerSoft : C.primarySoft }]}><Ionicons name={destructive ? 'trash-outline' : 'restaurant-outline'} size={25} color={color} /></View><Text style={[styles.modalTitle, { color: C.text }]}>{title}</Text><Text style={[styles.emptyText, { color: C.textMuted }]}>{message}</Text><View style={styles.modalActions}><TouchableOpacity disabled={busy} onPress={onCancel} style={[styles.modalButton, { borderColor: C.border }]}><Text style={{ color: C.text, fontWeight: '800' }}>Cancelar</Text></TouchableOpacity><TouchableOpacity disabled={busy} onPress={onConfirm} style={[styles.modalButton, { backgroundColor: color, borderColor: color }]}>{busy ? <ActivityIndicator color="#fff" /> : <Text style={{ color: '#fff', fontWeight: '800', textAlign: 'center' }}>{confirmLabel}</Text>}</TouchableOpacity></View></View></View></Modal>;
}

const styles = StyleSheet.create({
  scroll: { padding: 20, gap: 14 }, title: { fontSize: 26, fontWeight: '900', letterSpacing: -0.6, marginBottom: 2 }, subtitle: { fontSize: 13 },
  rowBetween: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', gap: 12 }, card: { borderRadius: 20, padding: 18, borderWidth: 1, gap: 12 }, cardTitle: { fontSize: 16, fontWeight: '900' },
  hero: { borderRadius: 20, padding: 17, flexDirection: 'row', alignItems: 'center', gap: 12 }, heroIcon: { width: 49, height: 49, borderRadius: 15, backgroundColor: 'rgba(255,255,255,.18)', alignItems: 'center', justifyContent: 'center' }, heroTitle: { color: '#fff', fontWeight: '900', fontSize: 16 }, heroSubtitle: { color: 'rgba(255,255,255,.78)', fontSize: 12, marginTop: 2 }, heroMeta: { color: 'rgba(255,255,255,.65)', fontSize: 10, marginTop: 2 }, activeBadge: { flexDirection: 'row', gap: 5, alignItems: 'center', backgroundColor: 'rgba(255,255,255,.17)', paddingHorizontal: 9, paddingVertical: 5, borderRadius: 99 }, activeDot: { width: 6, height: 6, borderRadius: 3, backgroundColor: '#4ade80' }, activeText: { color: '#fff', fontSize: 10, fontWeight: '800' },
  inlineButton: { flexDirection: 'row', alignItems: 'center' }, bulletRow: { flexDirection: 'row', gap: 8, alignItems: 'flex-start' }, bullet: { width: 6, height: 6, borderRadius: 3, marginTop: 7 }, bodyText: { flex: 1, fontSize: 14, lineHeight: 20 }, emptyInner: { alignItems: 'center', paddingVertical: 28, gap: 8 }, emptyCard: { borderRadius: 22, padding: 24, borderWidth: 1, alignItems: 'center', gap: 12 }, emptyTitle: { fontSize: 18, fontWeight: '900', textAlign: 'center' }, emptyText: { fontSize: 14, lineHeight: 21, textAlign: 'center' },
  aiIcon: { width: 62, height: 62, borderRadius: 20, alignItems: 'center', justifyContent: 'center' }, primaryButton: { minHeight: 52, borderRadius: 15, flexDirection: 'row', gap: 8, alignItems: 'center', justifyContent: 'center', paddingHorizontal: 20, alignSelf: 'stretch', marginTop: 4 }, primaryButtonText: { color: '#fff', fontWeight: '900', fontSize: 15 }, finePrint: { fontSize: 10, lineHeight: 15, textAlign: 'center' },
  feedback: { borderRadius: 13, padding: 12, flexDirection: 'row', gap: 8, alignItems: 'center' }, catalogCard: { borderRadius: 20, padding: 16, borderWidth: 1, gap: 12 }, catalogHeader: { flexDirection: 'row', alignItems: 'center', gap: 11 }, catalogIcon: { width: 44, height: 44, borderRadius: 14, alignItems: 'center', justifyContent: 'center' }, linkTitle: { fontWeight: '900', fontSize: 14 }, linkSubtitle: { fontSize: 11, lineHeight: 16, marginTop: 2 }, catalogButton: { borderRadius: 12, padding: 12, flexDirection: 'row', justifyContent: 'center', alignItems: 'center', gap: 7 }, catalogNotice: { fontSize: 10, textAlign: 'center' }, nutritionistCard: { borderRadius: 15, borderWidth: 1, padding: 13, flexDirection: 'row', alignItems: 'flex-start', gap: 11 }, nutritionistAvatar: { width: 42, height: 42, borderRadius: 14, alignItems: 'center', justifyContent: 'center' }, nutritionistInitial: { color: '#fff', fontSize: 18, fontWeight: '900' }, chooseNutriButton: { alignSelf: 'flex-start', borderWidth: 1, borderRadius: 10, paddingHorizontal: 12, paddingVertical: 7, marginTop: 9 },
  loadingBox: { minHeight: 230, alignItems: 'center', justifyContent: 'center', gap: 10 }, iconButton: { width: 42, height: 42, borderRadius: 13, alignItems: 'center', justifyContent: 'center' }, planHeader: { borderRadius: 20, padding: 18, borderWidth: 1 }, aiBadge: { flexDirection: 'row', alignItems: 'center', gap: 5, paddingHorizontal: 9, paddingVertical: 5, borderRadius: 99 }, planGoal: { fontSize: 28, fontWeight: '900', letterSpacing: -0.8, marginTop: 14 }, planMeta: { fontSize: 12, marginTop: 2 }, macroRow: { flexDirection: 'row', gap: 8, marginTop: 15 }, macro: { flex: 1, borderRadius: 13, padding: 10, alignItems: 'center' }, macroDot: { width: 7, height: 7, borderRadius: 4, marginBottom: 5 }, macroValue: { fontSize: 15, fontWeight: '900' }, macroLabel: { fontSize: 9, marginTop: 2 }, editPantryButton: { borderWidth: 1, borderRadius: 12, padding: 11, marginTop: 13, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 7 },
  dayButton: { minWidth: 48, borderRadius: 99, borderWidth: 1, paddingHorizontal: 14, paddingVertical: 10, alignItems: 'center' }, dayHeading: { flexDirection: 'row', gap: 8, alignItems: 'center', marginTop: 3 }, todayBadge: { borderRadius: 99, paddingHorizontal: 8, paddingVertical: 3 }, mealCard: { borderRadius: 18, borderWidth: 1, overflow: 'hidden' }, mealHeader: { flexDirection: 'row', alignItems: 'center', gap: 11, padding: 15 }, mealIcon: { width: 38, height: 38, borderRadius: 12, alignItems: 'center', justifyContent: 'center' }, mealName: { fontSize: 14, fontWeight: '900' }, mealMeta: { fontSize: 11, marginTop: 3 }, mealDetails: { borderTopWidth: 1, padding: 15, gap: 8 }, mealMacroRow: { flexDirection: 'row', gap: 7, marginBottom: 5 }, mealMacroChip: { flex: 1, minWidth: 0, borderRadius: 12, paddingHorizontal: 7, paddingVertical: 9, alignItems: 'center' }, mealMacroDot: { width: 6, height: 6, borderRadius: 3, marginBottom: 4 }, mealMacroValue: { fontSize: 12, fontWeight: '900' }, mealMacroLabel: { fontSize: 8, marginTop: 1 }, consumeButton: { flexDirection: 'row', gap: 7, alignItems: 'center', justifyContent: 'center', borderRadius: 12, padding: 11, marginTop: 5 },
  warningCard: { borderRadius: 15, borderWidth: 1, padding: 13, flexDirection: 'row', alignItems: 'flex-start', gap: 9, marginBottom: 2 }, warningText: { flex: 1, fontSize: 12, lineHeight: 18 }, secondaryButton: { borderRadius: 15, borderWidth: 1, padding: 14, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8 }, secondaryButtonText: { fontSize: 14, fontWeight: '800' },
  sheet: { flex: 1, padding: 22, paddingTop: 30, gap: 18 }, closeButton: { width: 40, height: 40, borderRadius: 13, alignItems: 'center', justifyContent: 'center' }, groupTitle: { fontSize: 14, fontWeight: '900' }, chipWrap: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 }, foodChip: { borderWidth: 1, borderRadius: 99, paddingHorizontal: 11, paddingVertical: 9, flexDirection: 'row', alignItems: 'center', gap: 6 }, sheetAction: { minHeight: 52, borderRadius: 15, alignItems: 'center', justifyContent: 'center' },
  modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,.55)', alignItems: 'center', justifyContent: 'center', padding: 20 }, modalCard: { width: '100%', maxWidth: 560, maxHeight: '90%', borderRadius: 24, padding: 21 }, confirmCard: { width: '100%', maxWidth: 430, borderRadius: 24, padding: 23, alignItems: 'center', gap: 13 }, confirmIcon: { width: 54, height: 54, borderRadius: 17, alignItems: 'center', justifyContent: 'center' }, modalTitle: { fontSize: 21, fontWeight: '900', textAlign: 'center' }, modalText: { fontSize: 13, lineHeight: 20 }, checkRow: { flexDirection: 'row', gap: 10, alignItems: 'flex-start', borderWidth: 1, borderRadius: 14, padding: 13 }, healthBlock: { borderWidth: 1, borderRadius: 15, padding: 14, gap: 8 }, modalActions: { flexDirection: 'row', gap: 9, marginTop: 3, alignSelf: 'stretch' }, modalButton: { flex: 1, minHeight: 49, borderRadius: 14, borderWidth: 1, alignItems: 'center', justifyContent: 'center', paddingHorizontal: 8 },
});
