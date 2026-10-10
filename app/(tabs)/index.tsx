import { useAuth } from '@/context/auth';
import { useDiary, type MealFoodItem, type MealRecord } from '@/context/diary';
import { useAppLayout } from '@/hooks/useAppLayout';
import { usePremiumTheme } from '@/context/theme';
import { calculateCalorieGoal, calculateGoalProjection } from '@/utils/onboarding';
import { DiaryAPI, type FoodSearchResult } from '@/services/api';
import { formatFoodName, formatFoodText } from '@/utils/foodNames';
import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import { useEffect, useMemo, useState } from 'react';
import { ActivityIndicator, Alert, Modal, ScrollView, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';

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
type FoodDetail = FoodSelection & { grams: number; calories: number; carbs?: number; protein?: number; fat?: number; fiber?: number };

export default function HomeScreen() {
  const { user } = useAuth();
  const { mealsToday, caloriesToday, addMeal, updateMeal, removeMeal, ready } = useDiary();
  const { colors: C } = usePremiumTheme();
  const { topPad } = useAppLayout();
  const [visible, setVisible] = useState(false);
  const [deleteVisible, setDeleteVisible] = useState(false);
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
  const goal = user ? calculateCalorieGoal(user) : 0;
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
    const hasTacoDetails = items.length > 0 && items.every(item => item && Number(item.alimentoId) > 0 && Number(item.gramas ?? item.grams) > 0 && Number(item.calories) >= 0);
    if (!hasTacoDetails) {
      Alert.alert('Edição indisponível', 'Este registro não tem itens TACO vinculados. Exclua-o e registre novamente pela busca de alimentos para obter os cálculos atuais.');
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
    setDeleteVisible(false);
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
      setPendingDeleteMeal(null);
      setDeleteVisible(false);
    } catch {
      setDeleteError('Nao foi possivel excluir. Confira a conexao e tente novamente.');
    } finally { setDeleting(false); }
  };

  const save = async () => {
    if (!selectedDetails.length || selectedDetails.some(item => item.grams <= 0) || calculatedCalories <= 0) {
      setFormError('Adicione pelo menos um alimento à refeição.');
      return;
    }
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
      setVisible(false);
      setEditingMeal(null);
    } catch (error: unknown) {
      const message = error instanceof Error ? error.message : '';
      setFormError(!message || /failed to fetch|network request failed|load failed/i.test(message)
        ? 'Não foi possível conectar à API. Confira a conexão e tente novamente.'
        : message);
    } finally { setSaving(false); }
  };

  return <View style={{ flex: 1, backgroundColor: C.bg }}>
    <ScrollView contentContainerStyle={[styles.scroll, { paddingTop: topPad }]} showsVerticalScrollIndicator={false}>
      <View style={styles.header}><View style={{ flex: 1 }}><Text style={[styles.greeting, { color: C.text }]}>Olá, {user?.name?.split(' ')[0] || 'você'} 👋</Text><Text style={[styles.muted, { color: C.textMuted }]}>{new Date().toLocaleDateString('pt-BR', { weekday: 'long', day: 'numeric', month: 'long' })}</Text></View><TouchableOpacity onPress={() => router.push('/(tabs)/profile')} style={[styles.avatar, { backgroundColor: C.primary }]}><Text style={styles.avatarText}>{user?.name?.[0]?.toUpperCase() || 'U'}</Text></TouchableOpacity></View>

      <View style={[styles.card, { backgroundColor: C.surface }]}>
        <View style={styles.row}><Text style={[styles.title, { color: C.text }]}>Previsão da sua meta</Text><TouchableOpacity onPress={() => router.push({ pathname: '/(tabs)/trends', params: { edit: '1' } })}><Text style={[styles.add, { color: C.primary }]}>Editar</Text></TouchableOpacity></View>
        <View style={styles.goalRow}><View style={[styles.goalInfo, { backgroundColor: C.surface2 }]}><Text style={[styles.goalLabel, { color: C.textMuted }]}>ATUAL</Text><Text style={[styles.goalNumber, { color: C.text }]}>{user?.weight || '—'} kg</Text></View><View style={[styles.goalInfo, { backgroundColor: C.surface2 }]}><Text style={[styles.goalLabel, { color: C.textMuted }]}>META</Text><Text style={[styles.goalNumber, { color: C.text }]}>{user?.targetWeight || '—'} kg</Text></View></View>
        <View style={[styles.projection, { backgroundColor: C.primarySoft }]}><Ionicons name="calendar-outline" size={22} color={C.primary} /><View style={{ flex: 1 }}><Text style={{ color: C.text, fontWeight: '800' }}>{projection?.date ? `Previsão: ${projection.date.toLocaleDateString('pt-BR', { month: 'long', year: 'numeric' })}` : projection?.days === 0 ? 'Meta de manutenção ativa' : 'Preencha os dados para calcular a previsão'}</Text>{projection?.date && <Text style={[styles.hint, { color: C.textMuted }]}>{projection.days} dias estimados para {user?.goal?.toLowerCase()}.</Text>}</View></View>
        <Text style={[styles.disclaimer, { color: C.textDim }]}>Estimativa baseada na meta calórica e na constância diária. O ritmo real pode variar.</Text>
      </View>

      <View style={[styles.calorieCard, { backgroundColor: C.primary }]}>
        <View style={styles.calorieTextArea}><Text style={styles.calorieEyebrow}>CALORIAS DE HOJE</Text><View style={styles.calorieNumbers}><Text numberOfLines={1} adjustsFontSizeToFit minimumFontScale={0.65} style={styles.calorieBig}>{safeCalories}</Text><Text numberOfLines={1} style={styles.calorieUnit}>/ {goal || '—'} kcal</Text></View></View>
        <View style={styles.calorieIcon}><Ionicons name="flame" size={25} color="#fff" /></View>
        <View style={styles.progress}><View style={[styles.progressFill, { width: `${pct * 100}%` as any }]} /></View>
        <Text style={styles.remaining}>{goal ? `${Math.max(goal - safeCalories, 0)} kcal restantes` : 'Complete o perfil para calcular a meta.'}</Text>
      </View>
      <View style={styles.dailyMacroRow}>{[
        ['Carboidratos', dailyMacros.carbs, '#F97316'], ['Proteínas', dailyMacros.protein, '#3B82F6'], ['Gorduras', dailyMacros.fat, '#CA8A04'],
      ].map(([label, value, color]) => <View key={String(label)} style={[styles.dailyMacroCard, { backgroundColor: C.surface }]}><View style={[styles.dailyMacroDot, { backgroundColor: String(color) }]} /><Text numberOfLines={1} adjustsFontSizeToFit minimumFontScale={0.75} style={[styles.dailyMacroValue, { color: C.text }]}>{roundMacro(Number(value))}g</Text><Text numberOfLines={1} style={[styles.dailyMacroLabel, { color: C.textMuted }]}>{label}</Text></View>)}</View>

      <View style={styles.sectionHeading}><View><Text style={[styles.sectionTitle, { color: C.text }]}>Diário alimentar</Text><Text style={[styles.sectionSubtitle, { color: C.textMuted }]}>Registre o que você realmente consumiu.</Text></View><View style={{ flexDirection: 'row', alignItems: 'center', gap: 7 }}><TouchableOpacity accessibilityRole="button" accessibilityLabel="Corrigir ou excluir refeições" onPress={() => setDeleteVisible(true)} style={[styles.addCircle, { backgroundColor: C.surface2 }]}><Ionicons name="create-outline" size={18} color={C.primary} /></TouchableOpacity><TouchableOpacity onPress={() => openMealForm()} style={[styles.addMain, { backgroundColor: C.primary }]}><Ionicons name="add" size={19} color="#fff" /><Text style={{ color: '#fff', fontWeight: '900', fontSize: 12 }}>Adicionar</Text></TouchableOpacity></View></View>

      {!ready ? <View style={styles.loading}><ActivityIndicator color={C.primary} /><Text style={{ color: C.textMuted }}>Carregando refeições…</Text></View> : MEAL_SECTIONS.map(section => {
        const entries = grouped[section.key];
        const total = entries.reduce((sum, meal) => sum + meal.calories, 0);
        return <View key={section.key} style={[styles.mealCard, { backgroundColor: C.surface, borderColor: C.border }]}>
          <View style={styles.mealCardHeader}><View style={[styles.mealIcon, { backgroundColor: `${section.accent}18` }]}><Ionicons name={section.icon} size={20} color={section.accent} /></View><View style={{ flex: 1 }}><Text style={[styles.mealTitle, { color: C.text }]}>{section.label}</Text><Text style={[styles.mealSummary, { color: C.textMuted }]}>{entries.length ? `${entries.length} ${entries.length === 1 ? 'registro' : 'registros'}` : 'Nenhum registro'}</Text></View><Text style={[styles.mealTotal, { color: entries.length ? C.text : C.textDim }]}>{total} kcal</Text><TouchableOpacity accessibilityLabel={`Adicionar em ${section.label}`} onPress={() => openMealForm(section.key)} style={[styles.addCircle, { backgroundColor: C.primarySoft }]}><Ionicons name="add" size={20} color={C.primary} /></TouchableOpacity></View>
          {entries.length > 0 && <View style={[styles.entryList, { borderTopColor: C.border }]}>{entries.map((meal, index) => {
            const hasMacros = meal.carbs !== undefined || meal.protein !== undefined || meal.fat !== undefined || meal.fiber !== undefined;
            return <View key={meal.id} style={[styles.entry, index < entries.length - 1 && { borderBottomWidth: 1, borderBottomColor: C.border }]}><View style={styles.entryContent}><Text numberOfLines={1} style={[styles.entryName, { color: C.text }]}>{meal.name.replace(`${section.label} — `, '')}</Text>{!!meal.description && <Text numberOfLines={2} style={[styles.entryDescription, { color: C.textMuted }]}>{formatFoodText(meal.description)}</Text>}{hasMacros && <View style={styles.entryMacroRow}><Text style={[styles.entryMacro, { color: '#F97316' }]}>C {meal.carbs ?? 0}g</Text><Text style={[styles.entryMacro, { color: '#3B82F6' }]}>P {meal.protein ?? 0}g</Text><Text style={[styles.entryMacro, { color: '#CA8A04' }]}>G {meal.fat ?? 0}g</Text><Text style={[styles.entryMacro, { color: '#16A34A' }]}>F {meal.fiber ?? 0}g</Text></View>}</View><View style={[styles.entryKcalBadge, { backgroundColor: C.primarySoft }]}><Text numberOfLines={1} style={[styles.entryKcal, { color: C.primary }]}>{meal.calories} kcal</Text></View></View>;
          })}</View>}
        </View>;
      })}

      <View style={styles.shortcuts}>{[{ icon: 'water-outline' as const, label: 'Água', route: '/(tabs)/water' }, { icon: 'body-outline' as const, label: 'IMC', route: '/(tabs)/bmi' }, { icon: 'stats-chart-outline' as const, label: 'Evolução', route: '/(tabs)/trends' }, { icon: 'fitness-outline' as const, label: 'Medidas', route: '/nutri/tracking' }].map(item => <TouchableOpacity key={item.label} onPress={() => router.push(item.route as any)} style={[styles.shortcut, { backgroundColor: C.surface }]}><Ionicons name={item.icon} size={21} color={C.primary} /><Text style={[styles.shortcutText, { color: C.textMuted }]}>{item.label}</Text></TouchableOpacity>)}</View>
      <View style={{ height: 90 }} />
    </ScrollView>

    <Modal visible={visible} animationType="slide" presentationStyle="pageSheet" onRequestClose={closeMealForm}>
      <View style={[styles.modal, { backgroundColor: C.bg }]}>
        <View style={styles.row}><View style={{ flex: 1 }}><Text style={[styles.modalTitle, { color: C.text }]}>{editingMeal ? 'Corrigir refeição' : 'Registrar refeição'}</Text><Text style={[styles.modalSubtitle, { color: C.textMuted }]}>Pesquise o alimento, escolha a correspondência e informe o peso em gramas.</Text></View><TouchableOpacity onPress={closeMealForm} style={[styles.close, { backgroundColor: C.surface }]}><Ionicons name="close" size={22} color={C.text} /></TouchableOpacity></View>
        <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ gap: 16, paddingBottom: 30 }}>

          <View><Text style={[styles.fieldLabel, { color: C.textMuted }]}>TIPO DE REFEIÇÃO</Text><View style={styles.typeGrid}>{MEAL_SECTIONS.map(section => <TouchableOpacity key={section.key} onPress={() => { setType(section.key); setFormError(''); }} style={[styles.typeOption, { borderColor: type === section.key ? C.primary : C.border, backgroundColor: type === section.key ? C.primarySoft : C.surface }]}><Ionicons name={section.icon} size={18} color={type === section.key ? C.primary : C.textMuted} /><Text style={{ color: type === section.key ? C.primary : C.text, fontWeight: '800', fontSize: 11 }}>{section.label}</Text></TouchableOpacity>)}</View></View>
          <View>
            <Text style={[styles.fieldLabel, { color: C.textMuted }]}>ADICIONE O QUE VOCÊ COMEU</Text>
            <View style={[styles.searchBox, { borderColor: C.border, backgroundColor: C.surface }]}><Ionicons name="search-outline" size={19} color={C.textMuted} /><TextInput value={foodSearch} onChangeText={setFoodSearch} placeholder="Buscar arroz, feijão, frango..." placeholderTextColor={C.textDim} style={[styles.searchInput, { color: C.text }]} />{!!foodSearch && <TouchableOpacity accessibilityLabel="Limpar busca" onPress={() => setFoodSearch('')}><Ionicons name="close-circle" size={19} color={C.textDim} /></TouchableOpacity>}</View>
            <Text style={[styles.searchHint, { color: C.textMuted }]}>{foodSearch.trim().length < 2 ? 'Digite pelo menos 2 letras para buscar' : searchingFoods ? 'Buscando na base nutricional...' : foodSearchError ? 'Busca indisponível' : `${foodResults.length} resultados da TACO`}</Text>
            <View style={[styles.foodResults, { borderColor: C.border, backgroundColor: C.surface }]}>
              {searchingFoods ? <View style={styles.noFood}><ActivityIndicator color={C.primary} /><Text style={{ color: C.textMuted, fontSize: 12 }}>Consultando alimentos...</Text></View> : foodSearchError ? <View style={styles.noFood}><Ionicons name="cloud-offline-outline" size={23} color={C.textDim} /><Text style={{ color: C.textMuted, textAlign: 'center', fontSize: 12 }}>{foodSearchError}</Text></View> : foodResults.length ? foodResults.map((food, index) => {
                const added = selectedFoods.some(item => item.foodId === food.foodId);
                return <TouchableOpacity key={food.foodId} disabled={added} onPress={() => addFood(food)} style={[styles.foodResult, index < foodResults.length - 1 && { borderBottomWidth: 1, borderBottomColor: C.border }]}><View style={[styles.foodResultIcon, { backgroundColor: added ? C.successSoft : C.primarySoft }]}><Ionicons name={added ? 'checkmark' : 'add'} size={18} color={added ? C.success : C.primary} /></View><View style={{ flex: 1, minWidth: 0 }}><Text numberOfLines={2} style={[styles.foodResultName, { color: C.text }]}>{food.description}</Text><Text numberOfLines={1} style={[styles.foodResultPortion, { color: C.textMuted }]}>TACO · {food.caloriesPer100g} kcal/100 g</Text></View><Text style={{ color: added ? C.success : C.primary, fontSize: 10, fontWeight: '900' }}>{added ? 'ADICIONADO' : 'ADICIONAR'}</Text></TouchableOpacity>;
              }) : <View style={styles.noFood}><Ionicons name="search-outline" size={23} color={C.textDim} /><Text style={{ color: C.textMuted, textAlign: 'center', fontSize: 12 }}>{foodSearch.trim().length < 2 ? 'Os resultados reais aparecerão aqui.' : 'Nenhum resultado. Tente outro nome ou uma descrição mais simples.'}</Text></View>}
            </View>
          </View>

          <View>
            <Text style={[styles.fieldLabel, { color: C.textMuted }]}>MINHA REFEIÇÃO ({selectedDetails.length})</Text>
            {selectedDetails.length ? <View style={[styles.selectedList, { borderColor: C.border, backgroundColor: C.surface }]}>{selectedDetails.map((item, index) => <View key={item.foodId} style={[styles.selectedFood, index < selectedDetails.length - 1 && { borderBottomWidth: 1, borderBottomColor: C.border }]}><View style={{ flex: 1, minWidth: 0 }}><Text numberOfLines={2} style={[styles.selectedFoodName, { color: C.text }]}>{item.description}</Text><Text style={[styles.selectedFoodPortion, { color: C.textMuted }]}>{item.calories} kcal · {item.grams} g · C {item.carbs ?? 0} · P {item.protein ?? 0} · G {item.fat ?? 0} · F {item.fiber ?? 0}{item.brandName ? ` · ${item.brandName}` : ''}</Text><View style={{ flexDirection: 'row', alignItems: 'center', gap: 8, marginTop: 8 }}><TextInput accessibilityLabel={`Quantidade em gramas de ${item.description}`} value={item.gramsText} onChangeText={value => changeFoodGrams(item.foodId, value)} keyboardType="decimal-pad" placeholder="Gramas" placeholderTextColor={C.textDim} style={[styles.gramInput, { color: C.text, borderColor: C.border, backgroundColor: C.surface2 }]} /><Text style={{ color: C.textMuted, fontSize: 12 }}>g</Text></View></View><TouchableOpacity accessibilityLabel={`Remover ${item.description}`} onPress={() => removeFood(item.foodId)} style={[styles.removeFoodButton, { backgroundColor: C.dangerSoft }]}><Ionicons name="trash-outline" size={16} color={C.danger} /></TouchableOpacity></View>)}</View> : <View style={[styles.emptySelection, { borderColor: C.border }]}><Ionicons name="restaurant-outline" size={24} color={C.textDim} /><Text style={{ color: C.textMuted, fontSize: 12, textAlign: 'center' }}>Escolha um resultado e informe a quantidade em gramas.</Text></View>}
          </View>

          <View style={[styles.calculatedCard, { backgroundColor: C.primarySoft }]}><View style={[styles.calculatedIcon, { backgroundColor: C.primary }]}><Ionicons name="sparkles" size={21} color="#fff" /></View><View style={{ flex: 1, minWidth: 0 }}><Text style={[styles.calculatedLabel, { color: C.textMuted }]}>ESTIMATIVA DA REFEIÇÃO</Text><Text numberOfLines={1} adjustsFontSizeToFit minimumFontScale={0.7} style={[styles.calculatedValue, { color: C.text }]}>{calculatedCalories} kcal</Text><View style={styles.calculatedMacros}><Text style={{ color: '#F97316', fontSize: 10, fontWeight: '900' }}>C {roundMacro(macroValues.carbs)}g</Text><Text style={{ color: '#3B82F6', fontSize: 10, fontWeight: '900' }}>P {roundMacro(macroValues.protein)}g</Text><Text style={{ color: '#CA8A04', fontSize: 10, fontWeight: '900' }}>G {roundMacro(macroValues.fat)}g</Text><Text style={{ color: '#16A34A', fontSize: 10, fontWeight: '900' }}>F {roundMacro(macroValues.fiber)}g</Text></View></View></View>
          <View><Text style={[styles.fieldLabel, { color: C.textMuted }]}>OBSERVAÇÃO (OPCIONAL)</Text><TextInput value={description} onChangeText={setDescription} placeholder="Ex.: preparado com pouco óleo" placeholderTextColor={C.textDim} multiline style={[styles.input, styles.textarea, { color: C.text, borderColor: C.border, backgroundColor: C.surface }]} /></View>
          <View style={[styles.estimateNotice, { backgroundColor: C.warningSoft }]}><Ionicons name="information-circle-outline" size={18} color={C.warning} /><Text style={{ color: C.textMuted, flex: 1, fontSize: 10, lineHeight: 15 }}>Estimativas calculadas pelo Nutrifybe com valores por 100 g. Fonte: TACO 4ª edição, NEPA/UNICAMP. O backend recalcula os valores pela quantidade registrada.</Text></View>
          {!!formError && <View style={[styles.formError, { backgroundColor: C.dangerSoft }]}><Ionicons name="alert-circle-outline" size={17} color={C.danger} /><Text style={{ color: C.danger, flex: 1, fontSize: 12 }}>{formError}</Text></View>}
          <TouchableOpacity disabled={saving} onPress={() => void save()} style={[styles.saveButton, { backgroundColor: C.primary }]}>{saving ? <ActivityIndicator color="#fff" /> : <><Ionicons name="checkmark" size={20} color="#fff" /><Text style={styles.buttonText}>{editingMeal ? 'Salvar correções' : 'Salvar refeição'}</Text></>}</TouchableOpacity>
        </ScrollView>
      </View>
    </Modal>
    <Modal visible={deleteVisible} animationType="slide" transparent onRequestClose={() => setDeleteVisible(false)}>
      <View style={{ flex: 1, justifyContent: 'flex-end', backgroundColor: 'rgba(0,0,0,.45)' }}><View style={{ maxHeight: '75%', backgroundColor: C.bg, borderTopLeftRadius: 24, borderTopRightRadius: 24, padding: 20 }}>
        <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 12 }}><View><Text style={{ color: C.text, fontSize: 19, fontWeight: '900' }}>Gerenciar refeições</Text><Text style={{ color: C.textMuted, fontSize: 12, marginTop: 3 }}>Corrija ou exclua um registro de hoje.</Text></View><TouchableOpacity accessibilityLabel="Fechar" onPress={() => setDeleteVisible(false)}><Ionicons name="close-circle" size={28} color={C.textDim} /></TouchableOpacity></View>
        {!!deleteError && !pendingDeleteMeal && <Text style={{ color: C.danger, fontSize: 12, marginBottom: 8 }}>{deleteError}</Text>}
        <ScrollView>{mealsToday.length ? mealsToday.slice().reverse().map(meal => <View key={meal.id} style={{ flexDirection: 'row', alignItems: 'center', gap: 12, paddingVertical: 12, borderBottomWidth: 1, borderBottomColor: C.border }}><View style={{ flex: 1 }}><Text numberOfLines={1} style={{ color: C.text, fontWeight: '800' }}>{meal.name}</Text><Text style={{ color: C.textMuted, fontSize: 11, marginTop: 3 }}>{meal.calories} kcal · {new Date(meal.createdAt).toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })}</Text></View><TouchableOpacity accessibilityRole="button" accessibilityLabel={`Corrigir ${meal.name}`} onPress={() => openEditMeal(meal)} style={{ padding: 10 }}><Ionicons name="create-outline" size={20} color={C.primary} /></TouchableOpacity><TouchableOpacity accessibilityRole="button" accessibilityLabel={`Excluir ${meal.name}`} onPress={() => confirmDeleteMeal(meal)} style={{ padding: 10 }}><Ionicons name="trash-outline" size={20} color={C.danger} /></TouchableOpacity></View>) : <Text style={{ color: C.textMuted, textAlign: 'center', padding: 24 }}>Nenhuma refeição registrada hoje.</Text>}</ScrollView>
        <TouchableOpacity onPress={() => setDeleteVisible(false)} style={{ alignItems: 'center', padding: 14 }}><Text style={{ color: C.textMuted, fontWeight: '700' }}>Concluir</Text></TouchableOpacity>
      </View></View>
    </Modal>
    <Modal visible={!!pendingDeleteMeal} animationType="fade" transparent onRequestClose={() => !deleting && setPendingDeleteMeal(null)}>
      <View style={{ flex: 1, justifyContent: 'center', padding: 24, backgroundColor: 'rgba(0,0,0,.5)' }}>
        <View style={{ backgroundColor: C.surface, borderRadius: 22, padding: 22, gap: 13 }}>
          <View style={{ width: 46, height: 46, borderRadius: 15, backgroundColor: C.dangerSoft, alignItems: 'center', justifyContent: 'center' }}><Ionicons name="trash-outline" size={22} color={C.danger} /></View>
          <Text style={{ color: C.text, fontSize: 19, fontWeight: '900' }}>Excluir refeição?</Text>
          <Text style={{ color: C.textMuted, lineHeight: 20 }}>{pendingDeleteMeal?.name} será removida do diário e do histórico.</Text>
          {!!deleteError && <Text style={{ color: C.danger, fontSize: 12 }}>{deleteError}</Text>}
          <View style={{ flexDirection: 'row', gap: 10, marginTop: 4 }}>
            <TouchableOpacity disabled={deleting} onPress={() => setPendingDeleteMeal(null)} style={{ flex: 1, borderWidth: 1, borderColor: C.border, borderRadius: 13, minHeight: 48, alignItems: 'center', justifyContent: 'center' }}><Text style={{ color: C.text, fontWeight: '800' }}>Cancelar</Text></TouchableOpacity>
            <TouchableOpacity disabled={deleting} onPress={() => void deleteMeal()} style={{ flex: 1, backgroundColor: C.danger, borderRadius: 13, minHeight: 48, alignItems: 'center', justifyContent: 'center' }}>{deleting ? <ActivityIndicator color="#fff" /> : <Text style={{ color: '#fff', fontWeight: '900' }}>Excluir</Text>}</TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  </View>;
}

const styles = StyleSheet.create({
  scroll: { padding: 20, gap: 14 }, header: { flexDirection: 'row', alignItems: 'center' }, greeting: { fontSize: 23, fontWeight: '800' }, muted: { fontSize: 13, marginTop: 3, textTransform: 'capitalize' }, avatar: { width: 42, height: 42, borderRadius: 21, alignItems: 'center', justifyContent: 'center' }, avatarText: { color: '#fff', fontSize: 17, fontWeight: '800' }, card: { borderRadius: 20, padding: 18, shadowColor: '#000', shadowOpacity: .05, shadowRadius: 8, elevation: 2 }, row: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', gap: 12 }, title: { fontSize: 16, fontWeight: '800' }, add: { fontSize: 14, fontWeight: '700' }, goalRow: { flexDirection: 'row', gap: 10, marginTop: 14 }, goalInfo: { flex: 1, borderRadius: 13, padding: 12 }, goalLabel: { fontSize: 10, fontWeight: '800' }, goalNumber: { fontSize: 18, fontWeight: '900', marginTop: 3 }, projection: { flexDirection: 'row', alignItems: 'center', gap: 10, borderRadius: 13, padding: 12, marginTop: 10 }, hint: { fontSize: 12, marginTop: 2 }, disclaimer: { fontSize: 10, lineHeight: 15, marginTop: 8 },
  calorieCard: { borderRadius: 22, padding: 19, overflow: 'hidden' }, calorieTextArea: { paddingRight: 58, minWidth: 0 }, calorieEyebrow: { color: 'rgba(255,255,255,.7)', fontSize: 10, fontWeight: '900', letterSpacing: 1 }, calorieNumbers: { flexDirection: 'row', alignItems: 'baseline', flexWrap: 'wrap', columnGap: 6, marginTop: 3, minWidth: 0 }, calorieBig: { color: '#fff', fontSize: 37, fontWeight: '900', letterSpacing: -1, maxWidth: '100%' }, calorieUnit: { color: 'rgba(255,255,255,.76)', fontSize: 13, fontWeight: '700' }, calorieIcon: { position: 'absolute', right: 18, top: 18, width: 46, height: 46, borderRadius: 15, backgroundColor: 'rgba(255,255,255,.16)', alignItems: 'center', justifyContent: 'center' }, progress: { height: 7, borderRadius: 4, backgroundColor: 'rgba(255,255,255,.22)', overflow: 'hidden', marginTop: 15 }, progressFill: { height: 7, backgroundColor: '#fff', borderRadius: 4 }, remaining: { color: 'rgba(255,255,255,.78)', fontSize: 11, marginTop: 7 },
  dailyMacroRow: { flexDirection: 'row', gap: 9 }, dailyMacroCard: { flex: 1, minWidth: 0, borderRadius: 15, paddingHorizontal: 10, paddingVertical: 12, alignItems: 'center' }, dailyMacroDot: { width: 8, height: 8, borderRadius: 4, marginBottom: 5 }, dailyMacroValue: { maxWidth: '100%', fontSize: 17, fontWeight: '900' }, dailyMacroLabel: { maxWidth: '100%', fontSize: 9, marginTop: 2 },
  sectionHeading: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginTop: 3 }, sectionTitle: { fontSize: 19, fontWeight: '900' }, sectionSubtitle: { fontSize: 11, marginTop: 2 }, addMain: { borderRadius: 12, paddingHorizontal: 12, paddingVertical: 9, flexDirection: 'row', alignItems: 'center', gap: 5 }, loading: { minHeight: 150, alignItems: 'center', justifyContent: 'center', gap: 9 }, mealCard: { borderWidth: 1, borderRadius: 18, overflow: 'hidden' }, mealCardHeader: { flexDirection: 'row', alignItems: 'center', gap: 11, padding: 14 }, mealIcon: { width: 40, height: 40, borderRadius: 13, alignItems: 'center', justifyContent: 'center' }, mealTitle: { fontSize: 14, fontWeight: '900' }, mealSummary: { fontSize: 10, marginTop: 2 }, mealTotal: { fontSize: 12, fontWeight: '900' }, addCircle: { width: 34, height: 34, borderRadius: 11, alignItems: 'center', justifyContent: 'center' }, entryList: { borderTopWidth: 1, paddingHorizontal: 14 }, entry: { paddingVertical: 11, flexDirection: 'row', alignItems: 'flex-start', gap: 9 }, entryContent: { flex: 1, minWidth: 0 }, entryName: { fontSize: 12, fontWeight: '800', flexShrink: 1 }, entryDescription: { fontSize: 10, lineHeight: 14, marginTop: 3 }, entryMacroRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 5, marginTop: 6 }, entryMacro: { fontSize: 9, fontWeight: '900' }, entryKcalBadge: { flexShrink: 0, borderRadius: 99, paddingHorizontal: 8, paddingVertical: 5 }, entryKcal: { fontSize: 10, fontWeight: '900' }, aiTag: { borderRadius: 99, paddingHorizontal: 6, paddingVertical: 3, flexDirection: 'row', alignItems: 'center', gap: 3 },
  shortcuts: { flexDirection: 'row', gap: 9, marginTop: 2 }, shortcut: { flex: 1, alignItems: 'center', borderRadius: 14, paddingVertical: 13, gap: 6 }, shortcutText: { fontSize: 10, fontWeight: '700' },
  modal: { flex: 1, padding: 22, paddingTop: 28, gap: 20 }, modalTitle: { fontSize: 24, fontWeight: '900' }, modalSubtitle: { fontSize: 12, marginTop: 3 }, close: { width: 40, height: 40, borderRadius: 13, alignItems: 'center', justifyContent: 'center' }, fieldLabel: { fontSize: 10, fontWeight: '900', letterSpacing: .8, marginBottom: 8 }, typeGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 }, typeOption: { width: '48%', flexGrow: 1, borderWidth: 1, borderRadius: 14, padding: 12, flexDirection: 'row', alignItems: 'center', gap: 7 },
  searchBox: { minHeight: 50, borderWidth: 1, borderRadius: 14, paddingHorizontal: 13, flexDirection: 'row', alignItems: 'center', gap: 9 }, searchInput: { flex: 1, minWidth: 0, fontSize: 14, paddingVertical: 11 }, searchHint: { fontSize: 10, fontWeight: '800', marginTop: 9, marginBottom: 6 }, foodResults: { borderWidth: 1, borderRadius: 15, overflow: 'hidden' }, foodResult: { minHeight: 61, paddingHorizontal: 12, paddingVertical: 9, flexDirection: 'row', alignItems: 'center', gap: 10 }, foodResultIcon: { width: 34, height: 34, borderRadius: 11, alignItems: 'center', justifyContent: 'center' }, foodResultName: { fontSize: 12, fontWeight: '900' }, foodResultPortion: { fontSize: 10, marginTop: 3 }, noFood: { minHeight: 95, alignItems: 'center', justifyContent: 'center', padding: 15, gap: 7 },
  selectedList: { borderWidth: 1, borderRadius: 15, overflow: 'hidden' }, selectedFood: { padding: 12, gap: 10, flexDirection: 'row', alignItems: 'center' }, selectedFoodName: { fontSize: 13, fontWeight: '900' }, selectedFoodPortion: { fontSize: 10, lineHeight: 15, marginTop: 3 }, gramInput: { width: 105, borderWidth: 1, borderRadius: 10, paddingHorizontal: 10, paddingVertical: 7, fontSize: 14, fontWeight: '800' }, removeFoodButton: { width: 36, height: 36, borderRadius: 10, alignItems: 'center', justifyContent: 'center' }, emptySelection: { minHeight: 105, borderWidth: 1, borderStyle: 'dashed', borderRadius: 15, alignItems: 'center', justifyContent: 'center', padding: 18, gap: 7 },
  input: { borderWidth: 1, borderRadius: 14, padding: 14, fontSize: 14 }, textarea: { minHeight: 78, textAlignVertical: 'top' }, calculatedCard: { borderRadius: 16, padding: 13, flexDirection: 'row', alignItems: 'center', gap: 11 }, calculatedIcon: { width: 42, height: 42, borderRadius: 13, alignItems: 'center', justifyContent: 'center' }, calculatedLabel: { fontSize: 9, fontWeight: '900', letterSpacing: .7 }, calculatedValue: { fontSize: 23, fontWeight: '900', marginTop: 1 }, calculatedMacros: { flexDirection: 'row', flexWrap: 'wrap', gap: 9, marginTop: 3 }, estimateNotice: { borderRadius: 13, padding: 11, flexDirection: 'row', gap: 8, alignItems: 'flex-start' }, formError: { borderRadius: 12, padding: 11, flexDirection: 'row', gap: 7, alignItems: 'center' }, saveButton: { minHeight: 54, borderRadius: 15, alignItems: 'center', justifyContent: 'center', flexDirection: 'row', gap: 7 }, buttonText: { color: '#fff', fontSize: 15, fontWeight: '900' },
});
