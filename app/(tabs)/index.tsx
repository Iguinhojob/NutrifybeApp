import { useAuth } from '@/context/auth';
import { useDiary, type MealFoodItem, type MealRecord } from '@/context/diary';
import { useAppLayout } from '@/hooks/useAppLayout';
import { usePremiumTheme } from '@/context/theme';
import { calculateFood, FOOD_CATALOG, formatFoodQuantity, normalizeFoodSearch, type CalculatedFood } from '@/utils/foodCatalog';
import { calculateCalorieGoal, calculateGoalProjection } from '@/utils/onboarding';
import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import { useMemo, useState } from 'react';
import { ActivityIndicator, Modal, ScrollView, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';

type MealType = 'breakfast' | 'lunch' | 'dinner' | 'snack';
const POPULAR_FOOD_IDS = ['rice', 'beans', 'chicken', 'egg', 'french-bread', 'banana'];
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
type FoodSelection = { foodId: string; quantity: number };

export default function HomeScreen() {
  const { user } = useAuth();
  const { mealsToday, caloriesToday, addMeal, updateMeal, removeMeal, ready } = useDiary();
  const { colors: C } = usePremiumTheme();
  const { topPad } = useAppLayout();
  const [visible, setVisible] = useState(false);
  const [deleteVisible, setDeleteVisible] = useState(false);
  const [pendingDeleteMeal, setPendingDeleteMeal] = useState<MealRecord | null>(null);
  const [editingMeal, setEditingMeal] = useState<MealRecord | null>(null);
  const [legacyEditMode, setLegacyEditMode] = useState(false);
  const [legacyMealName, setLegacyMealName] = useState('');
  const [legacyMacros, setLegacyMacros] = useState({ calories: '', carbs: '', protein: '', fat: '' });
  const [deleteError, setDeleteError] = useState('');
  const [deleting, setDeleting] = useState(false);
  const [type, setType] = useState<MealType>(defaultMealType());
  const [foodSearch, setFoodSearch] = useState('');
  const [selectedFoods, setSelectedFoods] = useState<FoodSelection[]>([]);
  const [description, setDescription] = useState('');
  const [formError, setFormError] = useState('');
  const [saving, setSaving] = useState(false);
  const goal = user ? calculateCalorieGoal(user) : 0;
  const safeCalories = Number.isFinite(caloriesToday) ? caloriesToday : 0;
  const pct = goal ? Math.min(safeCalories / goal, 1) : 0;
  const projection = user ? calculateGoalProjection(user) : null;
  const grouped = useMemo(() => Object.fromEntries(MEAL_SECTIONS.map(section => [section.key, mealsToday.filter(meal => mealType(meal) === section.key)])) as Record<MealType, MealRecord[]>, [mealsToday]);
  const dailyMacros = useMemo(() => mealsToday.reduce((total, meal) => ({
    carbs: total.carbs + (meal.carbs ?? 0),
    protein: total.protein + (meal.protein ?? 0),
    fat: total.fat + (meal.fat ?? 0),
  }), { carbs: 0, protein: 0, fat: 0 }), [mealsToday]);
  const selectedDetails = useMemo(() => selectedFoods.map(selection => {
    const food = FOOD_CATALOG.find(item => item.id === selection.foodId);
    return food ? calculateFood(food, selection.quantity) : null;
  }).filter((item): item is CalculatedFood => item !== null), [selectedFoods]);
  const macroValues = useMemo(() => selectedDetails.reduce((total, item) => ({
    carbs: total.carbs + item.carbs,
    protein: total.protein + item.protein,
    fat: total.fat + item.fat,
  }), { carbs: 0, protein: 0, fat: 0 }), [selectedDetails]);
  const calculatedCalories = selectedDetails.reduce((total, item) => total + item.calories, 0);
  const normalizedSearch = normalizeFoodSearch(foodSearch);
  const filteredFoods = (normalizedSearch
    ? FOOD_CATALOG.filter(food => normalizeFoodSearch(`${food.name} ${food.aliases.join(' ')}`).includes(normalizedSearch))
    : POPULAR_FOOD_IDS.map(id => FOOD_CATALOG.find(food => food.id === id)).filter((food): food is (typeof FOOD_CATALOG)[number] => !!food)
  ).slice(0, 8);

  const openMealForm = (meal: MealType = defaultMealType()) => {
    setEditingMeal(null);
    setLegacyEditMode(false);
    setType(meal);
    setFoodSearch('');
    setSelectedFoods([]);
    setDescription('');
    setFormError('');
    setVisible(true);
  };

  const closeMealForm = () => {
    if (saving) return;
    setVisible(false);
    setEditingMeal(null);
    setLegacyEditMode(false);
  };

  const openEditMeal = (meal: MealRecord) => {
    const items = (meal.items ?? []) as MealFoodItem[];
    const availableItems = items.filter(item => FOOD_CATALOG.some(food => food.id === item.foodId));
    setEditingMeal(meal);
    setType(mealType(meal));
    setFoodSearch('');
    const hasCompleteFoodDetails = items.length > 0 && availableItems.length === items.length;
    setLegacyEditMode(!hasCompleteFoodDetails);
    if (hasCompleteFoodDetails) {
      const portions = availableItems.map(item => `${formatFoodQuantity(item.quantity)} ${item.portionLabel} de ${item.name} (~${item.grams} g)`).join(' • ');
      const savedDescription = meal.description ?? '';
      setDescription(savedDescription.startsWith(portions) ? savedDescription.slice(portions.length).replace(/^\s*•\s*/, '').trim() : savedDescription);
      setSelectedFoods(availableItems.map(item => ({ foodId: item.foodId, quantity: item.quantity })));
    } else {
      setDescription(meal.description ?? '');
      setSelectedFoods([]);
      setLegacyMealName(meal.name);
      setLegacyMacros({ calories: String(meal.calories), carbs: meal.carbs == null ? '' : String(meal.carbs), protein: meal.protein == null ? '' : String(meal.protein), fat: meal.fat == null ? '' : String(meal.fat) });
    }
    setFormError('');
    setDeleteError('');
    setDeleteVisible(false);
    setVisible(true);
  };

  const addFood = (foodId: string) => {
    setSelectedFoods(current => current.some(item => item.foodId === foodId) ? current : [...current, { foodId, quantity: 1 }]);
    setFormError('');
  };

  const changeFoodQuantity = (foodId: string, change: number) => {
    setSelectedFoods(current => current.map(item => item.foodId === foodId
      ? { ...item, quantity: Math.min(20, Math.max(0.5, item.quantity + change)) }
      : item));
  };

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
    if (legacyEditMode && editingMeal) {
      const calories = Number(legacyMacros.calories.replace(',', '.'));
      const optionalMacro = (value: string) => value.trim() ? Number(value.replace(',', '.')) : undefined;
      const carbs = optionalMacro(legacyMacros.carbs);
      const protein = optionalMacro(legacyMacros.protein);
      const fat = optionalMacro(legacyMacros.fat);
      const invalidMacro = [carbs, protein, fat].some(value => value !== undefined && (!Number.isFinite(value) || value < 0));
      if (!legacyMealName.trim() || !legacyMacros.calories.trim() || !Number.isFinite(calories) || calories < 0 || invalidMacro) {
        setFormError('Confira o nome e os valores nutricionais. Use apenas numeros iguais ou maiores que zero.');
        return;
      }
      setSaving(true);
      try {
        await updateMeal(editingMeal.id, { name: legacyMealName.trim(), description: description.trim(), calories, carbs, protein, fat, items: editingMeal.items, source: editingMeal.source, referenceId: editingMeal.referenceId });
        setVisible(false);
        setEditingMeal(null);
        setLegacyEditMode(false);
      } catch {
        setFormError('Nao foi possivel sincronizar a correcao. Confira a conexao e tente novamente.');
      } finally { setSaving(false); }
      return;
    }
    if (!selectedDetails.length || calculatedCalories <= 0) {
      setFormError('Adicione pelo menos um alimento à refeição.');
      return;
    }
    setSaving(true);
    try {
      const section = MEAL_SECTIONS.find(item => item.key === type)!;
      const foodNames = selectedDetails.slice(0, 3).map(item => item.name).join(', ');
      const extraFoods = selectedDetails.length > 3 ? ` +${selectedDetails.length - 3}` : '';
      const portions = selectedDetails.map(item => `${formatFoodQuantity(item.quantity)} ${item.portionLabel} de ${item.name} (~${item.grams} g)`).join(' • ');
      const data = {
        name: type === 'snack' ? `${foodNames}${extraFoods}` : `${section.label} — ${foodNames}${extraFoods}`,
        description: description.trim() ? `${portions} • ${description.trim()}` : portions,
        calories: calculatedCalories,
        carbs: roundMacro(macroValues.carbs),
        protein: roundMacro(macroValues.protein),
        fat: roundMacro(macroValues.fat),
        items: selectedDetails,
        source: editingMeal?.source ?? 'manual' as const,
        referenceId: editingMeal?.referenceId,
      };
      if (editingMeal) await updateMeal(editingMeal.id, data);
      else await addMeal(data);
      setVisible(false);
      setEditingMeal(null);
    } catch {
      setFormError('NÃ£o foi possÃ­vel sincronizar a refeiÃ§Ã£o. Confira a conexÃ£o e tente novamente.');
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

      <View style={styles.dailyMacroRow}>
        {[
          ['Carboidratos', dailyMacros.carbs, '#F97316'],
          ['Proteínas', dailyMacros.protein, '#3B82F6'],
          ['Gorduras', dailyMacros.fat, '#CA8A04'],
        ].map(([label, value, color]) => <View key={String(label)} style={[styles.dailyMacroCard, { backgroundColor: C.surface }]}><View style={[styles.dailyMacroDot, { backgroundColor: String(color) }]} /><Text numberOfLines={1} adjustsFontSizeToFit minimumFontScale={0.75} style={[styles.dailyMacroValue, { color: C.text }]}>{roundMacro(Number(value))}g</Text><Text numberOfLines={1} style={[styles.dailyMacroLabel, { color: C.textMuted }]}>{label}</Text></View>)}
      </View>

      <View style={styles.sectionHeading}><View><Text style={[styles.sectionTitle, { color: C.text }]}>Diário alimentar</Text><Text style={[styles.sectionSubtitle, { color: C.textMuted }]}>Registre o que você realmente consumiu.</Text></View><View style={{ flexDirection: 'row', alignItems: 'center', gap: 7 }}><TouchableOpacity accessibilityRole="button" accessibilityLabel="Corrigir ou excluir refeições" onPress={() => setDeleteVisible(true)} style={[styles.addCircle, { backgroundColor: C.surface2 }]}><Ionicons name="create-outline" size={18} color={C.primary} /></TouchableOpacity><TouchableOpacity onPress={() => openMealForm()} style={[styles.addMain, { backgroundColor: C.primary }]}><Ionicons name="add" size={19} color="#fff" /><Text style={{ color: '#fff', fontWeight: '900', fontSize: 12 }}>Adicionar</Text></TouchableOpacity></View></View>

      {!ready ? <View style={styles.loading}><ActivityIndicator color={C.primary} /><Text style={{ color: C.textMuted }}>Carregando refeições…</Text></View> : MEAL_SECTIONS.map(section => {
        const entries = grouped[section.key];
        const total = entries.reduce((sum, meal) => sum + meal.calories, 0);
        return <View key={section.key} style={[styles.mealCard, { backgroundColor: C.surface, borderColor: C.border }]}>
          <View style={styles.mealCardHeader}><View style={[styles.mealIcon, { backgroundColor: `${section.accent}18` }]}><Ionicons name={section.icon} size={20} color={section.accent} /></View><View style={{ flex: 1 }}><Text style={[styles.mealTitle, { color: C.text }]}>{section.label}</Text><Text style={[styles.mealSummary, { color: C.textMuted }]}>{entries.length ? `${entries.length} ${entries.length === 1 ? 'registro' : 'registros'}` : 'Nenhum registro'}</Text></View><Text style={[styles.mealTotal, { color: entries.length ? C.text : C.textDim }]}>{total} kcal</Text><TouchableOpacity accessibilityLabel={`Adicionar em ${section.label}`} onPress={() => openMealForm(section.key)} style={[styles.addCircle, { backgroundColor: C.primarySoft }]}><Ionicons name="add" size={20} color={C.primary} /></TouchableOpacity></View>
          {entries.length > 0 && <View style={[styles.entryList, { borderTopColor: C.border }]}>{entries.map((meal, index) => {
            const hasMacros = meal.carbs !== undefined || meal.protein !== undefined || meal.fat !== undefined;
            return <View key={meal.id} style={[styles.entry, index < entries.length - 1 && { borderBottomWidth: 1, borderBottomColor: C.border }]}><View style={styles.entryContent}><View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}><Text numberOfLines={1} style={[styles.entryName, { color: C.text }]}>{meal.name.replace(`${section.label} — `, '')}</Text>{meal.source === 'nutria' && <View style={[styles.aiTag, { backgroundColor: C.primarySoft }]}><Ionicons name="sparkles" size={10} color={C.primary} /><Text style={{ color: C.primary, fontSize: 9, fontWeight: '900' }}>NutriIA</Text></View>}</View>{!!meal.description && <Text numberOfLines={2} style={[styles.entryDescription, { color: C.textMuted }]}>{meal.description}</Text>}{hasMacros && <View style={styles.entryMacroRow}><Text style={[styles.entryMacro, { color: '#F97316' }]}>C {meal.carbs ?? 0}g</Text><Text style={[styles.entryMacro, { color: '#3B82F6' }]}>P {meal.protein ?? 0}g</Text><Text style={[styles.entryMacro, { color: '#CA8A04' }]}>G {meal.fat ?? 0}g</Text></View>}</View><View style={[styles.entryKcalBadge, { backgroundColor: C.primarySoft }]}><Text numberOfLines={1} style={[styles.entryKcal, { color: C.primary }]}>{meal.calories} kcal</Text></View></View>;
          })}</View>}
        </View>;
      })}

      <View style={styles.shortcuts}>{[{ icon: 'water-outline' as const, label: 'Água', route: '/(tabs)/water' }, { icon: 'body-outline' as const, label: 'IMC', route: '/(tabs)/bmi' }, { icon: 'stats-chart-outline' as const, label: 'Evolução', route: '/(tabs)/trends' }, { icon: 'fitness-outline' as const, label: 'Medidas', route: '/nutri/tracking' }].map(item => <TouchableOpacity key={item.label} onPress={() => router.push(item.route as any)} style={[styles.shortcut, { backgroundColor: C.surface }]}><Ionicons name={item.icon} size={21} color={C.primary} /><Text style={[styles.shortcutText, { color: C.textMuted }]}>{item.label}</Text></TouchableOpacity>)}</View>
      <View style={{ height: 90 }} />
    </ScrollView>

    <Modal visible={visible} animationType="slide" presentationStyle="pageSheet" onRequestClose={closeMealForm}>
      <View style={[styles.modal, { backgroundColor: C.bg }]}>
        <View style={styles.row}><View style={{ flex: 1 }}><Text style={[styles.modalTitle, { color: C.text }]}>{editingMeal ? 'Corrigir refeição' : 'Registrar refeição'}</Text><Text style={[styles.modalSubtitle, { color: C.textMuted }]}>Escolha os alimentos e ajuste as medidas caseiras.</Text></View><TouchableOpacity onPress={closeMealForm} style={[styles.close, { backgroundColor: C.surface }]}><Ionicons name="close" size={22} color={C.text} /></TouchableOpacity></View>
        <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ gap: 16, paddingBottom: 30 }}>
          {legacyEditMode ? <>
            <View style={[styles.emptySelection, { borderColor: C.border, gap: 10 }]}><Ionicons name="information-circle-outline" size={24} color={C.primary} /><Text style={{ color: C.textMuted, fontSize: 12, textAlign: 'center', lineHeight: 18 }}>Este registro não tem alimentos detalhados. Você pode corrigir os valores manualmente; a data original e os alimentos salvos serão preservados.</Text></View>
            <View><Text style={[styles.fieldLabel, { color: C.textMuted }]}>NOME DA REFEIÇÃO</Text><TextInput value={legacyMealName} onChangeText={setLegacyMealName} placeholder="Ex.: Almoço" placeholderTextColor={C.textDim} style={[styles.input, { color: C.text, borderColor: C.border, backgroundColor: C.surface }]} /></View>
            <View><Text style={[styles.fieldLabel, { color: C.textMuted }]}>CALORIAS (KCAL)</Text><TextInput value={legacyMacros.calories} onChangeText={value => setLegacyMacros(current => ({ ...current, calories: value.replace(/[^\d.,]/g, '') }))} keyboardType="decimal-pad" style={[styles.input, { color: C.text, borderColor: C.border, backgroundColor: C.surface }]} /></View>
            <View style={{ flexDirection: 'row', gap: 8 }}>{(['carbs', 'protein', 'fat'] as const).map((key, index) => <View key={key} style={{ flex: 1 }}><Text style={[styles.fieldLabel, { color: C.textMuted }]}>{['CARBOIDRATOS', 'PROTEÍNAS', 'GORDURAS'][index]} (G)</Text><TextInput value={legacyMacros[key]} onChangeText={value => setLegacyMacros(current => ({ ...current, [key]: value.replace(/[^\d.,]/g, '') }))} keyboardType="decimal-pad" placeholder="—" placeholderTextColor={C.textDim} style={[styles.input, { color: C.text, borderColor: C.border, backgroundColor: C.surface, paddingHorizontal: 8 }]} /></View>)}</View>
          </> : <>
          <View><Text style={[styles.fieldLabel, { color: C.textMuted }]}>TIPO DE REFEIÇÃO</Text><View style={styles.typeGrid}>{MEAL_SECTIONS.map(section => <TouchableOpacity key={section.key} onPress={() => { setType(section.key); setFormError(''); }} style={[styles.typeOption, { borderColor: type === section.key ? C.primary : C.border, backgroundColor: type === section.key ? C.primarySoft : C.surface }]}><Ionicons name={section.icon} size={18} color={type === section.key ? C.primary : C.textMuted} /><Text style={{ color: type === section.key ? C.primary : C.text, fontWeight: '800', fontSize: 11 }}>{section.label}</Text></TouchableOpacity>)}</View></View>
          <View>
            <Text style={[styles.fieldLabel, { color: C.textMuted }]}>ADICIONE O QUE VOCÊ COMEU</Text>
            <View style={[styles.searchBox, { borderColor: C.border, backgroundColor: C.surface }]}><Ionicons name="search-outline" size={19} color={C.textMuted} /><TextInput value={foodSearch} onChangeText={setFoodSearch} placeholder="Buscar arroz, feijão, frango..." placeholderTextColor={C.textDim} style={[styles.searchInput, { color: C.text }]} />{!!foodSearch && <TouchableOpacity accessibilityLabel="Limpar busca" onPress={() => setFoodSearch('')}><Ionicons name="close-circle" size={19} color={C.textDim} /></TouchableOpacity>}</View>
            <Text style={[styles.searchHint, { color: C.textMuted }]}>{normalizedSearch ? 'Resultados encontrados' : 'Alimentos mais usados'}</Text>
            <View style={[styles.foodResults, { borderColor: C.border, backgroundColor: C.surface }]}>
              {filteredFoods.length ? filteredFoods.map((food, index) => {
                const added = selectedFoods.some(item => item.foodId === food.id);
                const portion = calculateFood(food, 1);
                return <TouchableOpacity key={food.id} disabled={added} onPress={() => addFood(food.id)} style={[styles.foodResult, index < filteredFoods.length - 1 && { borderBottomWidth: 1, borderBottomColor: C.border }]}><View style={[styles.foodResultIcon, { backgroundColor: added ? C.successSoft : C.primarySoft }]}><Ionicons name={added ? 'checkmark' : 'add'} size={18} color={added ? C.success : C.primary} /></View><View style={{ flex: 1, minWidth: 0 }}><Text numberOfLines={1} style={[styles.foodResultName, { color: C.text }]}>{food.name}</Text><Text numberOfLines={1} style={[styles.foodResultPortion, { color: C.textMuted }]}>1 {food.portion.singular} · ~{portion.calories} kcal</Text></View><Text style={{ color: added ? C.success : C.primary, fontSize: 10, fontWeight: '900' }}>{added ? 'ADICIONADO' : 'ADICIONAR'}</Text></TouchableOpacity>;
              }) : <View style={styles.noFood}><Ionicons name="search-outline" size={23} color={C.textDim} /><Text style={{ color: C.textMuted, textAlign: 'center', fontSize: 12 }}>Esse alimento ainda não está no catálogo local.</Text></View>}
            </View>
          </View>

          <View>
            <Text style={[styles.fieldLabel, { color: C.textMuted }]}>MINHA REFEIÇÃO ({selectedDetails.length})</Text>
            {selectedDetails.length ? <View style={[styles.selectedList, { borderColor: C.border, backgroundColor: C.surface }]}>{selectedDetails.map((item, index) => <View key={item.foodId} style={[styles.selectedFood, index < selectedDetails.length - 1 && { borderBottomWidth: 1, borderBottomColor: C.border }]}><View style={{ flex: 1, minWidth: 0 }}><Text numberOfLines={1} style={[styles.selectedFoodName, { color: C.text }]}>{item.name}</Text><Text style={[styles.selectedFoodPortion, { color: C.textMuted }]}>{formatFoodQuantity(item.quantity)} {item.portionLabel} · ~{item.grams} g · {item.calories} kcal</Text></View><View style={styles.quantityControls}><TouchableOpacity accessibilityLabel={`Diminuir ${item.name}`} onPress={() => changeFoodQuantity(item.foodId, -0.5)} style={[styles.quantityButton, { backgroundColor: C.surface2 }]}><Ionicons name="remove" size={17} color={C.text} /></TouchableOpacity><Text style={[styles.quantityValue, { color: C.text }]}>{formatFoodQuantity(item.quantity)}</Text><TouchableOpacity accessibilityLabel={`Aumentar ${item.name}`} onPress={() => changeFoodQuantity(item.foodId, 0.5)} style={[styles.quantityButton, { backgroundColor: C.primarySoft }]}><Ionicons name="add" size={17} color={C.primary} /></TouchableOpacity><TouchableOpacity accessibilityLabel={`Remover ${item.name}`} onPress={() => removeFood(item.foodId)} style={[styles.removeFoodButton, { backgroundColor: C.dangerSoft }]}><Ionicons name="trash-outline" size={16} color={C.danger} /></TouchableOpacity></View></View>)}</View> : <View style={[styles.emptySelection, { borderColor: C.border }]}><Ionicons name="restaurant-outline" size={24} color={C.textDim} /><Text style={{ color: C.textMuted, fontSize: 12, textAlign: 'center' }}>Os alimentos adicionados aparecerão aqui para você ajustar a quantidade.</Text></View>}
          </View>

          <View style={[styles.calculatedCard, { backgroundColor: C.primarySoft }]}><View style={[styles.calculatedIcon, { backgroundColor: C.primary }]}><Ionicons name="sparkles" size={21} color="#fff" /></View><View style={{ flex: 1, minWidth: 0 }}><Text style={[styles.calculatedLabel, { color: C.textMuted }]}>ESTIMATIVA DA REFEIÇÃO</Text><Text numberOfLines={1} adjustsFontSizeToFit minimumFontScale={0.7} style={[styles.calculatedValue, { color: C.text }]}>{calculatedCalories} kcal</Text><View style={styles.calculatedMacros}><Text style={{ color: '#F97316', fontSize: 10, fontWeight: '900' }}>C {roundMacro(macroValues.carbs)}g</Text><Text style={{ color: '#3B82F6', fontSize: 10, fontWeight: '900' }}>P {roundMacro(macroValues.protein)}g</Text><Text style={{ color: '#CA8A04', fontSize: 10, fontWeight: '900' }}>G {roundMacro(macroValues.fat)}g</Text></View></View></View>
          </>}
          <View><Text style={[styles.fieldLabel, { color: C.textMuted }]}>OBSERVAÇÃO (OPCIONAL)</Text><TextInput value={description} onChangeText={setDescription} placeholder="Ex.: preparado com pouco óleo" placeholderTextColor={C.textDim} multiline style={[styles.input, styles.textarea, { color: C.text, borderColor: C.border, backgroundColor: C.surface }]} /></View>
          <View style={[styles.estimateNotice, { backgroundColor: C.warningSoft }]}><Ionicons name="information-circle-outline" size={18} color={C.warning} /><Text style={{ color: C.textMuted, flex: 1, fontSize: 10, lineHeight: 15 }}>Não precisa pesar. As medidas ajudam a estimar; tamanho da porção, marca e modo de preparo podem alterar os valores.</Text></View>
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
  selectedList: { borderWidth: 1, borderRadius: 15, overflow: 'hidden' }, selectedFood: { padding: 12, gap: 10 }, selectedFoodName: { fontSize: 13, fontWeight: '900' }, selectedFoodPortion: { fontSize: 10, lineHeight: 15, marginTop: 3 }, quantityControls: { flexDirection: 'row', alignItems: 'center', alignSelf: 'flex-end', gap: 7 }, quantityButton: { width: 32, height: 32, borderRadius: 10, alignItems: 'center', justifyContent: 'center' }, quantityValue: { minWidth: 25, textAlign: 'center', fontSize: 12, fontWeight: '900' }, removeFoodButton: { width: 32, height: 32, borderRadius: 10, alignItems: 'center', justifyContent: 'center', marginLeft: 4 }, emptySelection: { minHeight: 105, borderWidth: 1, borderStyle: 'dashed', borderRadius: 15, alignItems: 'center', justifyContent: 'center', padding: 18, gap: 7 },
  input: { borderWidth: 1, borderRadius: 14, padding: 14, fontSize: 14 }, textarea: { minHeight: 78, textAlignVertical: 'top' }, calculatedCard: { borderRadius: 16, padding: 13, flexDirection: 'row', alignItems: 'center', gap: 11 }, calculatedIcon: { width: 42, height: 42, borderRadius: 13, alignItems: 'center', justifyContent: 'center' }, calculatedLabel: { fontSize: 9, fontWeight: '900', letterSpacing: .7 }, calculatedValue: { fontSize: 23, fontWeight: '900', marginTop: 1 }, calculatedMacros: { flexDirection: 'row', flexWrap: 'wrap', gap: 9, marginTop: 3 }, estimateNotice: { borderRadius: 13, padding: 11, flexDirection: 'row', gap: 8, alignItems: 'flex-start' }, formError: { borderRadius: 12, padding: 11, flexDirection: 'row', gap: 7, alignItems: 'center' }, saveButton: { minHeight: 54, borderRadius: 15, alignItems: 'center', justifyContent: 'center', flexDirection: 'row', gap: 7 }, buttonText: { color: '#fff', fontSize: 15, fontWeight: '900' },
});
