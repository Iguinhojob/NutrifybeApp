import { useAuth } from '@/context/auth';
import { useDiary, type MealFoodItem, type MealRecord } from '@/context/diary';
import { useAppLayout } from '@/hooks/useAppLayout';
import { usePremiumTheme } from '@/context/theme';
import { calculateGoalProjection } from '@/utils/onboarding';
import { AppButton, Card, InlineNotice, SectionTitle, StatusPill, friendlyError, useToast } from '@/components/ui-kit';
import { FollowUpStatusCard } from '@/components/follow-up-status';
import { FybeTarget, useFybeScroll } from '@/components/fybe';
import { useDailyGoal } from '@/hooks/use-daily-goal';
import { DiaryAPI, type FoodSearchResult } from '@/services/api';
import { formatFoodName, formatFoodText } from '@/utils/foodNames';
import { Ionicons } from '@expo/vector-icons';
import { router, useFocusEffect } from 'expo-router';
import { useCallback, useEffect, useMemo, useState } from 'react';
import { ActivityIndicator, Modal, Pressable, ScrollView, StyleSheet, Text, TextInput, View } from 'react-native';

type MealType = 'breakfast' | 'lunch' | 'dinner' | 'snack';
const MEAL_SECTIONS: { key: MealType; label: string; icon: keyof typeof Ionicons.glyphMap; accent: string }[] = [
  { key: 'breakfast', label: 'Café da manhã', icon: 'sunny-outline', accent: '#F59E0B' },
  { key: 'lunch', label: 'Almoço', icon: 'restaurant-outline', accent: '#22C55E' },
  { key: 'dinner', label: 'Jantar', icon: 'moon-outline', accent: '#6366F1' },
  { key: 'snack', label: 'Lanches', icon: 'nutrition-outline', accent: '#EC4899' },
];

function mealType(record: MealRecord): MealType {
  const name = record.name.toLocaleLowerCase('pt-BR');
  if (name.includes('café') || name.includes('cafe')) return 'breakfast';
  if (name.includes('almoço') || name.includes('almoco')) return 'lunch';
  if (name.includes('jantar')) return 'dinner';
  return 'snack';
}

function defaultMealType(): MealType {
  const hour = new Date().getHours();
  if (hour < 10) return 'breakfast';
  if (hour < 14) return 'lunch';
  if (hour < 18) return 'snack';
  return 'dinner';
}

const roundMacro = (value: number) => Math.round(value * 10) / 10;
type FoodSelection = FoodSearchResult & { gramsText: string };

/** Só registros com itens da tabela TACO podem ser recalculados na edição (regra já existente). */
function isEditable(meal: MealRecord) {
  const items = (meal.items ?? []) as MealFoodItem[];
  return items.length > 0 && items.every(item => item && Number(item.alimentoId) > 0 && Number(item.gramas ?? item.grams) > 0 && Number(item.calories) >= 0);
}
type FoodDetail = FoodSelection & { grams: number; calories: number; carbs?: number; protein?: number; fat?: number; fiber?: number };

export default function HomeScreen() {
  const fybeScroll = useFybeScroll('/');
  const { user, refreshUser } = useAuth();
  const { mealsToday, caloriesToday, addMeal, updateMeal, removeMeal, ready } = useDiary();
  const toast = useToast();
  const { goal, fromPlan } = useDailyGoal();
  useFocusEffect(useCallback(() => { if (user?.id) void refreshUser().catch(() => {}); }, [user?.id, refreshUser]));
  const { colors: C } = usePremiumTheme();
  const { topPad, isSmall } = useAppLayout();
  const [visible, setVisible] = useState(false);
  const [pendingDeleteMeal, setPendingDeleteMeal] = useState<MealRecord | null>(null);
  const [editingMeal, setEditingMeal] = useState<MealRecord | null>(null);
  const [deleteError, setDeleteError] = useState('');
  const [deleting, setDeleting] = useState(false);
  const [type, setType] = useState<MealType>(defaultMealType());
  const [foodSearch, setFoodSearch] = useState('');
  const [selectedFoods, setSelectedFoods] = useState<FoodSelection[]>([]);
  const [foodResults, setFoodResults] = useState<FoodSearchResult[]>([]);
  const [searchingFoods, setSearchingFoods] = useState(false);
  const [foodSearchError, setFoodSearchError] = useState('');
  const [description, setDescription] = useState('');
  const [formError, setFormError] = useState('');
  const [saving, setSaving] = useState(false);
  const safeCalories = Number.isFinite(caloriesToday) ? caloriesToday : 0;
  const pct = goal ? Math.min(safeCalories / goal, 1) : 0;
  const projection = user ? calculateGoalProjection(user) : null;
  const grouped = useMemo(() => Object.fromEntries(MEAL_SECTIONS.map(section => [section.key, mealsToday.filter(meal => mealType(meal) === section.key)])) as Record<MealType, MealRecord[]>, [mealsToday]);
  const dailyMacros = useMemo(() => mealsToday.reduce((total, meal) => ({
    carbs: total.carbs + (meal.carbs ?? 0), protein: total.protein + (meal.protein ?? 0), fat: total.fat + (meal.fat ?? 0),
  }), { carbs: 0, protein: 0, fat: 0 }), [mealsToday]);
  const selectedDetails = useMemo<FoodDetail[]>(() => selectedFoods.map(selection => {
    const grams = Number(selection.gramsText.replace(',', '.'));
    const factor = Number.isFinite(grams) && grams > 0 ? grams / 100 : 0;
    return {
      ...selection,
      grams: Number.isFinite(grams) && grams > 0 ? grams : 0,
      calories: Math.round(selection.caloriesPer100g * factor),
      carbs: selection.carbsPer100g == null ? undefined : roundMacro(selection.carbsPer100g * factor),
      protein: selection.proteinPer100g == null ? undefined : roundMacro(selection.proteinPer100g * factor),
      fat: selection.fatPer100g == null ? undefined : roundMacro(selection.fatPer100g * factor),
      fiber: selection.fiberPer100g == null ? undefined : roundMacro(selection.fiberPer100g * factor),
    };
  }), [selectedFoods]);
  const macroValues = useMemo(() => selectedDetails.reduce((total, item) => ({
    carbs: total.carbs + (item.carbs ?? 0),
    protein: total.protein + (item.protein ?? 0),
    fat: total.fat + (item.fat ?? 0),
    fiber: total.fiber + (item.fiber ?? 0),
  }), { carbs: 0, protein: 0, fat: 0, fiber: 0 }), [selectedDetails]);
  const calculatedCalories = Math.round(selectedDetails.reduce((total, item) => total + item.calories, 0));

  useEffect(() => {
    const query = foodSearch.trim();
    let active = true;
    if (query.length < 2) {
      setFoodResults([]);
      setFoodSearchError('');
      setSearchingFoods(false);
      return () => { active = false; };
    }
    setSearchingFoods(true);
    setFoodSearchError('');
    const timer = setTimeout(() => {
      DiaryAPI.searchFoods(query).then(results => {
        if (active) setFoodResults(results);
      }).catch((error: unknown) => {
        if (active) { setFoodResults([]); setFoodSearchError(error instanceof Error ? error.message : 'Não foi possível consultar a base nutricional.'); }
      }).finally(() => { if (active) setSearchingFoods(false); });
    }, 450);
    return () => { active = false; clearTimeout(timer); };
  }, [foodSearch]);

  const openMealForm = (meal: MealType = defaultMealType()) => {
    setEditingMeal(null);
    setType(meal);
    setFoodSearch('');
    setSelectedFoods([]);
    setFoodResults([]);
    setFoodSearchError('');
    setDescription('');
    setFormError('');
    setVisible(true);
  };

  const closeMealForm = () => {
    if (saving) return;
    setVisible(false);
    setEditingMeal(null);
  };

  const openEditMeal = (meal: MealRecord) => {
    const items = (meal.items ?? []) as MealFoodItem[];
    if (!isEditable(meal)) {
      toast.show({ tone: 'info', title: 'Este registro não pode ser editado', message: 'Ele não tem alimentos da tabela TACO vinculados. Exclua-o e registre novamente pela busca de alimentos.' });
      return;
    }
    setEditingMeal(meal);
    setType(mealType(meal));
    setFoodSearch('');
    const portions = items.map(item => `${item.name} - ${item.gramas ?? item.grams} g - ${item.calories} kcal`).join(' | ');
    const savedDescription = meal.description ?? '';
    setDescription(savedDescription.startsWith(portions) ? savedDescription.slice(portions.length).replace(/^\s*\|\s*/, '').trim() : '');
    setSelectedFoods(items.map(item => ({
      foodId: String(item.alimentoId),
      description: formatFoodName(item.name),
      dataType: item.dataType ?? 'TACO',
      brandName: '',
      alimentoId: Number(item.alimentoId),
      source: item.dataSource ?? 'TACO 4ª edição, NEPA/UNICAMP',
      gramsText: String(item.gramas ?? item.grams),
      caloriesPer100g: item.caloriesPer100g ?? Number(item.calories) * 100 / Number(item.gramas ?? item.grams),
      carbsPer100g: item.carbsPer100g ?? (item.carbs == null ? undefined : Number(item.carbs) * 100 / Number(item.gramas ?? item.grams)),
      proteinPer100g: item.proteinPer100g ?? (item.protein == null ? undefined : Number(item.protein) * 100 / Number(item.gramas ?? item.grams)),
      fatPer100g: item.fatPer100g ?? (item.fat == null ? undefined : Number(item.fat) * 100 / Number(item.gramas ?? item.grams)),
      fiberPer100g: item.fiberPer100g ?? (item.fiber == null ? undefined : Number(item.fiber) * 100 / Number(item.gramas ?? item.grams)),
    })));
    setFormError('');
    setDeleteError('');
    setVisible(true);
  };

  const addFood = (food: FoodSearchResult) => {
    setSelectedFoods(current => current.some(item => item.foodId === food.foodId) ? current : [...current, { ...food, gramsText: '100' }]);
    setFormError('');
  };

  const changeFoodGrams = (foodId: string, gramsText: string) => setSelectedFoods(current => current.map(item => item.foodId === foodId ? { ...item, gramsText: gramsText.replace(/[^\d.,]/g, '') } : item));

  const removeFood = (foodId: string) => setSelectedFoods(current => current.filter(item => item.foodId !== foodId));

  const confirmDeleteMeal = (meal: MealRecord) => {
    setDeleteError('');
    setPendingDeleteMeal(meal);
  };

  const deleteMeal = async () => {
    if (!pendingDeleteMeal || deleting) return;
    setDeleting(true);
    setDeleteError('');
    try {
      await removeMeal(pendingDeleteMeal.id);
      toast.show({ tone: 'success', title: 'Refeição excluída', message: `${pendingDeleteMeal.name} saiu do diário de hoje.` });
      setPendingDeleteMeal(null);
    } catch {
      setDeleteError('Não foi possível excluir. Confira a conexão e tente novamente.');
    } finally { setDeleting(false); }
  };

  const save = async () => {
    if (!selectedDetails.length) { setFormError('Adicione pelo menos um alimento à refeição.'); return; }
    if (selectedDetails.some(item => item.grams <= 0)) { setFormError('Informe a quantidade em gramas de todos os alimentos.'); return; }
    if (calculatedCalories <= 0) { setFormError('O total da refeição ficou em 0 kcal. Confira as quantidades informadas.'); return; }
    setSaving(true);
    try {
      const section = MEAL_SECTIONS.find(item => item.key === type)!;
      const portions = selectedDetails.map(item => `${item.description} - ${item.grams} g - ${item.calories} kcal`).join(' | ');
      const data = {
        name: section.label,
        description: (description.trim() ? `${portions} | ${description.trim()}` : portions).slice(0, 500),
        calories: calculatedCalories,
        carbs: roundMacro(macroValues.carbs),
        protein: roundMacro(macroValues.protein),
        fat: roundMacro(macroValues.fat),
        fiber: roundMacro(macroValues.fiber),
        items: selectedDetails.map(item => ({
          foodId: item.foodId, alimentoId: item.alimentoId, gramas: item.grams, name: item.description, quantity: item.grams, portionLabel: 'g', grams: item.grams,
          calories: Math.round(item.calories), carbs: roundMacro(item.carbs ?? 0), protein: roundMacro(item.protein ?? 0), fat: roundMacro(item.fat ?? 0), fiber: roundMacro(item.fiber ?? 0),
          caloriesPer100g: item.caloriesPer100g, carbsPer100g: item.carbsPer100g, proteinPer100g: item.proteinPer100g,
          fatPer100g: item.fatPer100g, fiberPer100g: item.fiberPer100g, dataSource: item.source, dataType: item.dataType, brandName: item.brandName,
        })),
        source: editingMeal?.source ?? 'manual' as const,
        referenceId: editingMeal?.referenceId,
      };
      if (editingMeal) await updateMeal(editingMeal.id, data);
      else await addMeal(data);
      toast.show({ tone: 'success', title: editingMeal ? 'Correções salvas' : 'Refeição registrada', message: `${section.label}: ${calculatedCalories} kcal ${editingMeal ? 'atualizadas' : 'adicionadas'} no diário de hoje.` });
      setVisible(false);
      setEditingMeal(null);
    } catch (error: unknown) {
      setFormError(`${friendlyError(error, 'Não foi possível salvar a refeição.')} Seus dados continuam aqui; toque em salvar para tentar de novo.`);
    } finally { setSaving(false); }
  };

  const remaining = goal - safeCalories;
  const firstName = user?.name?.split(' ')[0] || 'você';
  const typeLabel = MEAL_SECTIONS.find(section => section.key === type)?.label ?? 'Refeição';
  const invalidGrams = selectedDetails.some(item => item.grams <= 0);

  return <View style={{ flex: 1, backgroundColor: C.bg }}>
    <ScrollView ref={fybeScroll} contentContainerStyle={[styles.scroll, { paddingTop: topPad }]} showsVerticalScrollIndicator={false}>
      <View style={styles.header}>
        <View style={{ flex: 1, minWidth: 0 }}>
          <Text accessibilityRole="header" style={[styles.greeting, { color: C.text }]}>Olá, {firstName}</Text>
          <Text style={[styles.muted, { color: C.textMuted }]}>{new Date().toLocaleDateString('pt-BR', { weekday: 'long', day: 'numeric', month: 'long' })}</Text>
        </View>
        <Pressable accessibilityRole="button" accessibilityLabel="Abrir meu perfil" onPress={() => router.push('/(tabs)/profile')} style={[styles.avatar, { backgroundColor: C.primary }]}>
          <Text style={styles.avatarText}>{user?.name?.[0]?.toUpperCase() || 'U'}</Text>
        </Pressable>
      </View>

      {/* Resumo do dia + ação principal */}
      <FybeTarget id="home.summary">
      <View style={[styles.calorieCard, { backgroundColor: C.primary }]}>
        <Text style={styles.calorieEyebrow}>CONSUMO DE HOJE</Text>
        <View style={styles.calorieNumbers} accessible accessibilityLabel={`${safeCalories} de ${goal || 'sem meta'} quilocalorias consumidas hoje`}>
          <Text numberOfLines={1} adjustsFontSizeToFit minimumFontScale={0.65} style={styles.calorieBig}>{safeCalories}</Text>
          <Text numberOfLines={1} style={styles.calorieUnit}>de {goal || '—'} kcal</Text>
        </View>
        <View style={styles.progress} accessibilityRole="progressbar" accessibilityValue={{ min: 0, max: 100, now: Math.round(pct * 100) }}>
          <View style={[styles.progressFill, { width: `${pct * 100}%` as any }]} />
        </View>
        <Text style={styles.remaining}>
          {!goal ? 'Complete seu perfil para calcular a meta do dia.' : remaining >= 0 ? `${remaining} kcal restantes` : `${Math.abs(remaining)} kcal acima da meta`}
          {goal ? ` · ${fromPlan ? 'meta do seu plano alimentar' : 'meta estimada pelo app'}` : ''}
        </Text>
        <FybeTarget id="home.register">
          <Pressable accessibilityRole="button" accessibilityLabel="Registrar refeição" onPress={() => openMealForm()} style={({ pressed }) => [styles.ctaButton, { opacity: pressed ? 0.88 : 1 }]}>
            <Ionicons name="add-circle" size={22} color={C.primary} />
            <Text style={[styles.ctaText, { color: C.primary }]}>Registrar refeição</Text>
          </Pressable>
        </FybeTarget>
      </View>
      </FybeTarget>

      <View style={styles.dailyMacroRow}>{[
        [isSmall ? 'Carb.' : 'Carboidratos', dailyMacros.carbs, '#EA580C'], ['Proteínas', dailyMacros.protein, '#2563EB'], ['Gorduras', dailyMacros.fat, '#A16207'],
      ].map(([label, value, color]) => <View key={String(label)} accessible accessibilityLabel={`${label}: ${roundMacro(Number(value))} gramas hoje`} style={[styles.dailyMacroCard, { backgroundColor: C.surface, borderColor: C.border }]}><View style={[styles.dailyMacroDot, { backgroundColor: String(color) }]} /><Text numberOfLines={1} adjustsFontSizeToFit minimumFontScale={0.75} style={[styles.dailyMacroValue, { color: C.text }]}>{roundMacro(Number(value))} g</Text><Text numberOfLines={1} adjustsFontSizeToFit minimumFontScale={0.8} style={[styles.dailyMacroLabel, { color: C.textMuted }]}>{label}</Text></View>)}</View>

      <FybeTarget id="home.followup"><FollowUpStatusCard compact /></FybeTarget>

      <FybeTarget id="home.diary" style={styles.diaryGroup}>
      <SectionTitle
        title="Diário de hoje"
        subtitle="Toque em uma refeição para adicionar, corrigir ou excluir."
        action={<AppButton size="sm" variant="ghost" icon="time-outline" label="Histórico" onPress={() => router.push('/(tabs)/history')} accessibilityLabel="Ver histórico de dias anteriores" />}
      />

      {!ready ? <View style={styles.loading}><ActivityIndicator color={C.primaryText} /><Text style={{ color: C.textMuted }}>Carregando refeições…</Text></View> : MEAL_SECTIONS.map(section => {
        const entries = grouped[section.key];
        const total = entries.reduce((sum, meal) => sum + meal.calories, 0);
        return <View key={section.key} style={[styles.mealCard, { backgroundColor: C.surface, borderColor: C.border }]}>
          <View style={styles.mealCardHeader}>
            <View style={[styles.mealIcon, { backgroundColor: `${section.accent}22` }]}><Ionicons name={section.icon} size={20} color={section.accent} /></View>
            <View style={{ flex: 1, minWidth: 0 }}>
              <Text style={[styles.mealTitle, { color: C.text }]}>{section.label}</Text>
              <Text style={[styles.mealSummary, { color: C.textMuted }]}>{entries.length ? `${entries.length} ${entries.length === 1 ? 'registro' : 'registros'} · ${total} kcal` : 'Nenhum registro ainda'}</Text>
            </View>
            <Pressable accessibilityRole="button" accessibilityLabel={`Adicionar em ${section.label}`} onPress={() => openMealForm(section.key)} hitSlop={6} style={[styles.addPill, { backgroundColor: C.primarySoft }]}>
              <Ionicons name="add" size={18} color={C.primaryText} />{!isSmall && <Text style={{ color: C.primaryText, fontWeight: '800', fontSize: 13 }}>Adicionar</Text>}
            </Pressable>
          </View>
          {entries.length > 0 && <View style={[styles.entryList, { borderTopColor: C.border }]}>{entries.map((meal, index) => {
            const hasMacros = meal.carbs !== undefined || meal.protein !== undefined || meal.fat !== undefined || meal.fiber !== undefined;
            const editable = isEditable(meal);
            const time = new Date(meal.createdAt);
            return <View key={meal.id} style={[styles.entry, index < entries.length - 1 && { borderBottomWidth: 1, borderBottomColor: C.border }]}>
              <View style={{ flexDirection: 'row', gap: 9, alignItems: 'flex-start' }}>
                <View style={styles.entryContent}>
                  <Text numberOfLines={1} style={[styles.entryName, { color: C.text }]}>{meal.name.replace(`${section.label} — `, '')}{Number.isNaN(time.getTime()) ? '' : ` · ${time.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })}`}</Text>
                  {!!meal.description && <Text numberOfLines={3} style={[styles.entryDescription, { color: C.textMuted }]}>{formatFoodText(meal.description)}</Text>}
                  {hasMacros && <Text style={[styles.entryMacros, { color: C.textMuted }]}>Carb. {meal.carbs ?? 0} g · Prot. {meal.protein ?? 0} g · Gord. {meal.fat ?? 0} g · Fibras {meal.fiber ?? 0} g</Text>}
                </View>
                <Text numberOfLines={1} style={[styles.entryKcal, { color: C.primaryText }]}>{meal.calories} kcal</Text>
              </View>
              <View style={styles.entryActions}>
                <Pressable accessibilityRole="button" accessibilityLabel={editable ? `Editar ${meal.name}` : `Edição indisponível para ${meal.name}`} accessibilityHint={editable ? undefined : 'Registro sem alimentos da tabela TACO; é possível apenas excluir'} onPress={() => openEditMeal(meal)} style={[styles.entryAction, { borderColor: C.border, opacity: editable ? 1 : 0.6 }]}>
                  <Ionicons name={editable ? 'create-outline' : 'lock-closed-outline'} size={16} color={editable ? C.primaryText : C.textMuted} />
                  <Text style={{ color: editable ? C.primaryText : C.textMuted, fontWeight: '800', fontSize: 13 }}>{editable ? 'Editar' : 'Não editável'}</Text>
                </Pressable>
                <Pressable accessibilityRole="button" accessibilityLabel={`Excluir ${meal.name}`} onPress={() => confirmDeleteMeal(meal)} style={[styles.entryAction, { borderColor: C.border }]}>
                  <Ionicons name="trash-outline" size={16} color={C.danger} />
                  <Text style={{ color: C.danger, fontWeight: '800', fontSize: 13 }}>Excluir</Text>
                </Pressable>
              </View>
              {!editable && <Text style={[styles.entryNote, { color: C.textMuted }]}>Este registro não tem alimentos da tabela TACO vinculados, por isso não pode ser recalculado. Para corrigir, exclua e registre novamente.</Text>}
            </View>;
          })}</View>}
        </View>;
      })}
      </FybeTarget>

      <FybeTarget id="home.shortcuts">
      <View style={styles.shortcuts}>{[
        { icon: 'water-outline' as const, label: 'Água', route: '/(tabs)/water' },
        { icon: 'body-outline' as const, label: 'IMC', route: '/(tabs)/bmi' },
        { icon: 'fitness-outline' as const, label: 'Medidas', route: '/nutri/tracking' },
        { icon: 'time-outline' as const, label: 'Histórico', route: '/(tabs)/history' },
      ].map(item => <Pressable accessibilityRole="button" accessibilityLabel={item.label} key={item.label} onPress={() => router.push(item.route as any)} style={[styles.shortcut, { backgroundColor: C.surface, borderColor: C.border }]}><Ionicons name={item.icon} size={21} color={C.primaryText} /><Text numberOfLines={1} adjustsFontSizeToFit minimumFontScale={0.8} style={[styles.shortcutText, { color: C.text }]}>{item.label}</Text></Pressable>)}</View>
      </FybeTarget>

      {/* Previsão: informação secundária e claramente marcada como estimativa */}
      <Card>
        <View style={styles.row}>
          <View style={{ flex: 1, gap: 6 }}>
            <StatusPill tone="neutral" icon="calculator-outline" label="Estimativa" />
            <Text style={[styles.title, { color: C.text }]}>Previsão da meta de peso</Text>
          </View>
          <AppButton size="sm" variant="ghost" label="Editar metas" onPress={() => router.push({ pathname: '/(tabs)/trends', params: { edit: '1' } })} />
        </View>
        <View style={styles.goalRow}>
          <View style={[styles.goalInfo, { backgroundColor: C.surface2 }]}><Text style={[styles.goalLabel, { color: C.textMuted }]}>PESO ATUAL</Text><Text style={[styles.goalNumber, { color: C.text }]}>{user?.weight || '—'} kg</Text></View>
          <View style={[styles.goalInfo, { backgroundColor: C.surface2 }]}><Text style={[styles.goalLabel, { color: C.textMuted }]}>META</Text><Text style={[styles.goalNumber, { color: C.text }]}>{user?.targetWeight || '—'} kg</Text></View>
        </View>
        <Text style={{ color: C.text, fontWeight: '700', marginTop: 12, fontSize: 14, lineHeight: 20 }}>
          {projection?.date ? `Por volta de ${projection.date.toLocaleDateString('pt-BR', { month: 'long', year: 'numeric' })} (cerca de ${projection.days} dias), mantendo a meta calórica todos os dias.` : projection?.days === 0 ? 'Sua meta atual é manter o peso.' : 'Preencha peso, meta e objetivo para ver uma estimativa.'}
        </Text>
        <Text style={[styles.disclaimer, { color: C.textMuted }]}>É um cálculo aproximado feito pelo app e pode variar bastante. Não é uma recomendação clínica: para orientação individual, converse com um nutricionista.</Text>
      </Card>
      <View style={{ height: 90 }} />
    </ScrollView>

    <Modal visible={visible} animationType="slide" presentationStyle="pageSheet" onRequestClose={closeMealForm}>
      <View style={[styles.modal, { backgroundColor: C.bg }]}>
        <View style={styles.row}>
          <View style={{ flex: 1 }}>
            <Text accessibilityRole="header" style={[styles.modalTitle, { color: C.text }]}>{editingMeal ? 'Corrigir refeição' : 'Registrar refeição'}</Text>
            <Text style={[styles.modalSubtitle, { color: C.textMuted }]}>Busque o alimento, adicione e informe quanto comeu em gramas. Confira o total antes de salvar.</Text>
          </View>
          <Pressable accessibilityRole="button" accessibilityLabel="Fechar sem salvar" onPress={closeMealForm} style={[styles.close, { backgroundColor: C.surface }]}><Ionicons name="close" size={22} color={C.text} /></Pressable>
        </View>
        <ScrollView showsVerticalScrollIndicator={false} keyboardShouldPersistTaps="handled" contentContainerStyle={{ gap: 18, paddingBottom: 30 }}>

          <View>
            <Text style={[styles.fieldLabel, { color: C.textMuted }]}>1. TIPO DE REFEIÇÃO</Text>
            <View style={styles.typeGrid} accessibilityRole="radiogroup">{MEAL_SECTIONS.map(section => {
              const active = type === section.key;
              return <Pressable key={section.key} accessibilityRole="radio" accessibilityState={{ checked: active }} accessibilityLabel={section.label} onPress={() => { setType(section.key); setFormError(''); }} style={[styles.typeOption, { borderColor: active ? C.primaryText : C.border, backgroundColor: active ? C.primarySoft : C.surface }]}>
                <Ionicons name={active ? 'radio-button-on' : 'radio-button-off'} size={18} color={active ? C.primaryText : C.textMuted} />
                <Text style={{ color: active ? C.primaryText : C.text, fontWeight: '800', fontSize: 13, flexShrink: 1 }}>{section.label}</Text>
              </Pressable>;
            })}</View>
          </View>

          <View>
            <Text style={[styles.fieldLabel, { color: C.textMuted }]}>2. BUSQUE O QUE VOCÊ COMEU</Text>
            <View style={[styles.searchBox, { borderColor: C.border, backgroundColor: C.surface }]}><Ionicons name="search-outline" size={19} color={C.textMuted} /><TextInput accessibilityLabel="Buscar alimento" value={foodSearch} onChangeText={setFoodSearch} placeholder="Ex.: arroz, feijão, frango" placeholderTextColor={C.textDim} style={[styles.searchInput, { color: C.text }]} />{!!foodSearch && <Pressable accessibilityRole="button" accessibilityLabel="Limpar busca" hitSlop={10} onPress={() => setFoodSearch('')}><Ionicons name="close-circle" size={20} color={C.textMuted} /></Pressable>}</View>
            <Text accessibilityLiveRegion="polite" style={[styles.searchHint, { color: C.textMuted }]}>{foodSearch.trim().length < 2 ? 'Digite pelo menos 2 letras para buscar.' : searchingFoods ? 'Buscando na tabela TACO…' : foodSearchError ? 'Busca indisponível no momento.' : `${foodResults.length} ${foodResults.length === 1 ? 'resultado' : 'resultados'} da tabela TACO · valores por 100 g`}</Text>
            <View style={[styles.foodResults, { borderColor: C.border, backgroundColor: C.surface }]}>
              {searchingFoods ? <View style={styles.noFood}><ActivityIndicator color={C.primaryText} /><Text style={{ color: C.textMuted, fontSize: 13 }}>Consultando alimentos…</Text></View> : foodSearchError ? <View style={styles.noFood}><Ionicons name="cloud-offline-outline" size={23} color={C.danger} /><Text style={{ color: C.textMuted, textAlign: 'center', fontSize: 13 }}>{friendlyError(new Error(foodSearchError), foodSearchError)}</Text><AppButton size="sm" variant="secondary" icon="refresh" label="Tentar novamente" onPress={() => setFoodSearch(value => (value.endsWith(' ') ? value.trimEnd() : `${value} `))} /></View> : foodResults.length ? foodResults.map((food, index) => {
                const added = selectedFoods.some(item => item.foodId === food.foodId);
                return <Pressable key={food.foodId} accessibilityRole="button" accessibilityState={{ disabled: added }} accessibilityLabel={`${food.description}, ${food.caloriesPer100g} quilocalorias por 100 gramas. ${added ? 'Já adicionado' : 'Adicionar'}`} disabled={added} onPress={() => addFood(food)} style={[styles.foodResult, index < foodResults.length - 1 && { borderBottomWidth: 1, borderBottomColor: C.border }]}><View style={[styles.foodResultIcon, { backgroundColor: added ? C.successSoft : C.primarySoft }]}><Ionicons name={added ? 'checkmark' : 'add'} size={18} color={added ? C.success : C.primaryText} /></View><View style={{ flex: 1, minWidth: 0 }}><Text numberOfLines={2} style={[styles.foodResultName, { color: C.text }]}>{food.description}</Text><Text numberOfLines={1} style={[styles.foodResultPortion, { color: C.textMuted }]}>{food.caloriesPer100g} kcal a cada 100 g</Text></View><Text style={{ color: added ? C.success : C.primaryText, fontSize: 12, fontWeight: '900' }}>{added ? 'Adicionado' : 'Adicionar'}</Text></Pressable>;
              }) : <View style={styles.noFood}><Ionicons name="search-outline" size={23} color={C.textMuted} /><Text style={{ color: C.textMuted, textAlign: 'center', fontSize: 13 }}>{foodSearch.trim().length < 2 ? 'Os alimentos encontrados aparecem aqui.' : 'Nenhum alimento encontrado. Tente um nome mais simples, como “arroz” ou “banana”.'}</Text></View>}
            </View>
          </View>

          <View>
            <Text style={[styles.fieldLabel, { color: C.textMuted }]}>3. CONFIRA AS PORÇÕES ({selectedDetails.length})</Text>
            {selectedDetails.length ? <View style={[styles.selectedList, { borderColor: C.border, backgroundColor: C.surface }]}>{selectedDetails.map((item, index) => {
              const invalid = item.grams <= 0;
              return <View key={item.foodId} style={[styles.selectedFood, index < selectedDetails.length - 1 && { borderBottomWidth: 1, borderBottomColor: C.border }]}>
                <View style={{ flex: 1, minWidth: 0 }}>
                  <Text numberOfLines={2} style={[styles.selectedFoodName, { color: C.text }]}>{item.description}</Text>
                  <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8, marginTop: 8, flexWrap: 'wrap' }}>
                    <Text style={{ color: C.textMuted, fontSize: 13, fontWeight: '700' }}>Quantidade</Text>
                    <TextInput accessibilityLabel={`Quantidade em gramas de ${item.description}`} value={item.gramsText} onChangeText={value => changeFoodGrams(item.foodId, value)} keyboardType="decimal-pad" placeholder="0" placeholderTextColor={C.textDim} style={[styles.gramInput, { color: C.text, borderColor: invalid ? C.danger : C.border, backgroundColor: C.surface2 }]} />
                    <Text style={{ color: C.text, fontSize: 14, fontWeight: '800' }}>gramas</Text>
                  </View>
                  {invalid ? <Text style={{ color: C.danger, fontSize: 12, marginTop: 5, fontWeight: '700' }}>Informe a quantidade em gramas.</Text> : <Text style={[styles.selectedFoodPortion, { color: C.textMuted }]}>{item.calories} kcal · Carb. {item.carbs ?? 0} g · Prot. {item.protein ?? 0} g · Gord. {item.fat ?? 0} g · Fibras {item.fiber ?? 0} g</Text>}
                </View>
                <Pressable accessibilityRole="button" accessibilityLabel={`Remover ${item.description}`} onPress={() => removeFood(item.foodId)} style={[styles.removeFoodButton, { backgroundColor: C.dangerSoft }]}><Ionicons name="trash-outline" size={18} color={C.danger} /></Pressable>
              </View>;
            })}</View> : <View style={[styles.emptySelection, { borderColor: C.border }]}><Ionicons name="restaurant-outline" size={24} color={C.textMuted} /><Text style={{ color: C.textMuted, fontSize: 13, textAlign: 'center' }}>Nenhum alimento adicionado. Escolha um resultado da busca acima.</Text></View>}
          </View>

          <View style={[styles.calculatedCard, { backgroundColor: C.surface, borderColor: C.border }]} accessible accessibilityLabel={`Total de ${typeLabel}: ${calculatedCalories} quilocalorias`}>
            <Text style={[styles.calculatedLabel, { color: C.textMuted }]}>TOTAL DE {typeLabel.toUpperCase()}</Text>
            <Text numberOfLines={1} adjustsFontSizeToFit minimumFontScale={0.7} style={[styles.calculatedValue, { color: C.text }]}>{calculatedCalories} kcal</Text>
            <View style={styles.calculatedMacros}>
              {[['Carboidratos', macroValues.carbs], ['Proteínas', macroValues.protein], ['Gorduras', macroValues.fat], ['Fibras', macroValues.fiber]].map(([label, value]) => <View key={String(label)} style={[styles.macroChip, { backgroundColor: C.surface2 }]}><Text style={{ color: C.textMuted, fontSize: 11, fontWeight: '700' }}>{label}</Text><Text style={{ color: C.text, fontSize: 14, fontWeight: '900' }}>{roundMacro(Number(value))} g</Text></View>)}
            </View>
          </View>

          <View><Text style={[styles.fieldLabel, { color: C.textMuted }]}>OBSERVAÇÃO (OPCIONAL)</Text><TextInput accessibilityLabel="Observação opcional" value={description} onChangeText={setDescription} placeholder="Ex.: preparado com pouco óleo" placeholderTextColor={C.textDim} multiline style={[styles.input, styles.textarea, { color: C.text, borderColor: C.border, backgroundColor: C.surface }]} /></View>
          <InlineNotice tone="info">Valores estimados com base na tabela TACO (4ª edição, NEPA/UNICAMP), por 100 g. O servidor recalcula o total pela quantidade registrada.</InlineNotice>
          {!!formError && <InlineNotice tone="danger" live>{formError}</InlineNotice>}
          <AppButton size="lg" icon="checkmark" busy={saving} disabled={!selectedDetails.length || invalidGrams} label={editingMeal ? 'Salvar correções' : `Salvar em ${typeLabel}`} onPress={() => void save()} />
          {(!selectedDetails.length || invalidGrams) && <Text style={{ color: C.textMuted, fontSize: 12, textAlign: 'center', marginTop: -8 }}>{!selectedDetails.length ? 'Adicione ao menos um alimento para salvar.' : 'Informe as gramas de todos os alimentos para salvar.'}</Text>}
        </ScrollView>
      </View>
    </Modal>
    <Modal visible={!!pendingDeleteMeal} animationType="fade" transparent onRequestClose={() => !deleting && setPendingDeleteMeal(null)}>
      <View style={{ flex: 1, justifyContent: 'center', padding: 24, backgroundColor: 'rgba(0,0,0,.5)' }}>
        <View accessibilityViewIsModal style={{ backgroundColor: C.surface, borderRadius: 22, padding: 22, gap: 13, maxWidth: 480, width: '100%', alignSelf: 'center' }}>
          <View style={{ width: 46, height: 46, borderRadius: 15, backgroundColor: C.dangerSoft, alignItems: 'center', justifyContent: 'center' }}><Ionicons name="trash-outline" size={22} color={C.danger} /></View>
          <Text accessibilityRole="header" style={{ color: C.text, fontSize: 19, fontWeight: '900' }}>Excluir esta refeição?</Text>
          <Text style={{ color: C.textMuted, lineHeight: 20 }}>{pendingDeleteMeal?.name} ({pendingDeleteMeal?.calories} kcal) será removida do diário e do histórico. Essa ação não pode ser desfeita.</Text>
          {!!deleteError && <InlineNotice tone="danger" live>{deleteError}</InlineNotice>}
          <View style={{ flexDirection: 'row', gap: 10, marginTop: 4 }}>
            <AppButton style={{ flex: 1 }} variant="secondary" label="Cancelar" disabled={deleting} onPress={() => setPendingDeleteMeal(null)} />
            <AppButton style={{ flex: 1 }} variant="danger" label="Excluir" busy={deleting} onPress={() => void deleteMeal()} />
          </View>
        </View>
      </View>
    </Modal>
  </View>;
}

const styles = StyleSheet.create({
  scroll: { padding: 20, gap: 14, width: '100%', maxWidth: 720, alignSelf: 'center' }, header: { flexDirection: 'row', alignItems: 'center', gap: 12 }, greeting: { fontSize: 24, fontWeight: '800' }, muted: { fontSize: 14, marginTop: 3, textTransform: 'capitalize' }, avatar: { width: 46, height: 46, borderRadius: 23, alignItems: 'center', justifyContent: 'center' }, avatarText: { color: '#fff', fontSize: 18, fontWeight: '800' }, row: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', gap: 12 }, title: { fontSize: 16, fontWeight: '800' }, goalRow: { flexDirection: 'row', gap: 10, marginTop: 14 }, goalInfo: { flex: 1, borderRadius: 13, padding: 12 }, goalLabel: { fontSize: 11, fontWeight: '800' }, goalNumber: { fontSize: 18, fontWeight: '900', marginTop: 3 }, disclaimer: { fontSize: 12, lineHeight: 18, marginTop: 8 },
  calorieCard: { borderRadius: 22, padding: 19, overflow: 'hidden', gap: 2 }, calorieEyebrow: { color: 'rgba(255,255,255,.9)', fontSize: 11, fontWeight: '900', letterSpacing: 1 }, calorieNumbers: { flexDirection: 'row', alignItems: 'baseline', flexWrap: 'wrap', columnGap: 6, marginTop: 3, minWidth: 0 }, calorieBig: { color: '#fff', fontSize: 40, fontWeight: '900', letterSpacing: -1, maxWidth: '100%' }, calorieUnit: { color: 'rgba(255,255,255,.92)', fontSize: 15, fontWeight: '700' }, progress: { height: 8, borderRadius: 4, backgroundColor: 'rgba(255,255,255,.28)', overflow: 'hidden', marginTop: 12 }, progressFill: { height: 8, backgroundColor: '#fff', borderRadius: 4 }, remaining: { color: 'rgba(255,255,255,.95)', fontSize: 13, marginTop: 8, lineHeight: 18 }, ctaButton: { marginTop: 14, minHeight: 52, borderRadius: 15, backgroundColor: '#fff', flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8 }, ctaText: { fontSize: 16, fontWeight: '900' },
  dailyMacroRow: { flexDirection: 'row', gap: 9 }, dailyMacroCard: { flex: 1, minWidth: 0, borderRadius: 15, borderWidth: 1, paddingHorizontal: 8, paddingVertical: 12, alignItems: 'center' }, dailyMacroDot: { width: 8, height: 8, borderRadius: 4, marginBottom: 5 }, dailyMacroValue: { maxWidth: '100%', fontSize: 17, fontWeight: '900' }, dailyMacroLabel: { maxWidth: '100%', fontSize: 12, marginTop: 2 },
  loading: { minHeight: 150, alignItems: 'center', justifyContent: 'center', gap: 9 }, mealCard: { borderWidth: 1, borderRadius: 18, overflow: 'hidden' }, mealCardHeader: { flexDirection: 'row', alignItems: 'center', gap: 11, padding: 14 }, mealIcon: { width: 40, height: 40, borderRadius: 13, alignItems: 'center', justifyContent: 'center' }, mealTitle: { fontSize: 15, fontWeight: '900' }, mealSummary: { fontSize: 13, marginTop: 2 }, addPill: { minHeight: 44, minWidth: 44, justifyContent: 'center', borderRadius: 12, paddingHorizontal: 12, flexDirection: 'row', alignItems: 'center', gap: 4 },
  entryList: { borderTopWidth: 1, paddingHorizontal: 14 }, entry: { paddingVertical: 12, gap: 10 }, entryContent: { flex: 1, minWidth: 0 }, entryName: { fontSize: 14, fontWeight: '800', flexShrink: 1 }, entryDescription: { fontSize: 13, lineHeight: 18, marginTop: 3 }, entryMacros: { fontSize: 12, marginTop: 5 }, entryKcal: { fontSize: 14, fontWeight: '900' }, entryActions: { flexDirection: 'row', gap: 8 }, entryAction: { minHeight: 44, flex: 1, borderWidth: 1, borderRadius: 12, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 6, paddingHorizontal: 10 }, entryNote: { fontSize: 12, lineHeight: 17 },
  diaryGroup: { gap: 14 }, shortcuts: { flexDirection: 'row', gap: 9, marginTop: 2 }, shortcut: { flex: 1, minHeight: 64, alignItems: 'center', justifyContent: 'center', borderRadius: 14, borderWidth: 1, paddingVertical: 10, paddingHorizontal: 4, gap: 5 }, shortcutText: { fontSize: 12, fontWeight: '700' },
  modal: { flex: 1, padding: 22, paddingTop: 28, gap: 20, width: '100%', maxWidth: 720, alignSelf: 'center' }, modalTitle: { fontSize: 24, fontWeight: '900' }, modalSubtitle: { fontSize: 13, marginTop: 3, lineHeight: 19 }, close: { width: 44, height: 44, borderRadius: 13, alignItems: 'center', justifyContent: 'center' }, fieldLabel: { fontSize: 12, fontWeight: '900', letterSpacing: .6, marginBottom: 8 }, typeGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 }, typeOption: { width: '48%', flexGrow: 1, minHeight: 48, borderWidth: 1.5, borderRadius: 14, padding: 12, flexDirection: 'row', alignItems: 'center', gap: 7 },
  searchBox: { minHeight: 50, borderWidth: 1, borderRadius: 14, paddingHorizontal: 13, flexDirection: 'row', alignItems: 'center', gap: 9 }, searchInput: { flex: 1, minWidth: 0, fontSize: 15, paddingVertical: 11 }, searchHint: { fontSize: 12, fontWeight: '700', marginTop: 9, marginBottom: 6 }, foodResults: { borderWidth: 1, borderRadius: 15, overflow: 'hidden' }, foodResult: { minHeight: 61, paddingHorizontal: 12, paddingVertical: 9, flexDirection: 'row', alignItems: 'center', gap: 10 }, foodResultIcon: { width: 34, height: 34, borderRadius: 11, alignItems: 'center', justifyContent: 'center' }, foodResultName: { fontSize: 14, fontWeight: '800' }, foodResultPortion: { fontSize: 12, marginTop: 3 }, noFood: { minHeight: 95, alignItems: 'center', justifyContent: 'center', padding: 15, gap: 8 },
  selectedList: { borderWidth: 1, borderRadius: 15, overflow: 'hidden' }, selectedFood: { padding: 12, gap: 10, flexDirection: 'row', alignItems: 'center' }, selectedFoodName: { fontSize: 14, fontWeight: '900' }, selectedFoodPortion: { fontSize: 12, lineHeight: 17, marginTop: 6 }, gramInput: { width: 90, minHeight: 44, borderWidth: 1.5, borderRadius: 10, paddingHorizontal: 10, paddingVertical: 7, fontSize: 16, fontWeight: '800' }, removeFoodButton: { width: 44, height: 44, borderRadius: 12, alignItems: 'center', justifyContent: 'center' }, emptySelection: { minHeight: 105, borderWidth: 1, borderStyle: 'dashed', borderRadius: 15, alignItems: 'center', justifyContent: 'center', padding: 18, gap: 7 },
  input: { borderWidth: 1, borderRadius: 14, padding: 14, fontSize: 15 }, textarea: { minHeight: 78, textAlignVertical: 'top' }, calculatedCard: { borderRadius: 16, borderWidth: 1, padding: 14, gap: 4 }, calculatedLabel: { fontSize: 11, fontWeight: '900', letterSpacing: .6 }, calculatedValue: { fontSize: 26, fontWeight: '900' }, calculatedMacros: { flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginTop: 6 }, macroChip: { borderRadius: 10, paddingHorizontal: 10, paddingVertical: 6, minWidth: 92 },
});
