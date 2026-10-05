import AsyncStorage from '@react-native-async-storage/async-storage';
import { AppState } from 'react-native';
import { useAuth } from '@/context/auth';
import { DEMO_MODE } from '@/services/demo';
import { DiaryAPI, localDateString } from '@/services/api';
import { createContext, useContext, useEffect, useMemo, useState, type ReactNode } from 'react';

export type MealFoodItem = {
  foodId: string;
  name: string;
  quantity: number;
  portionLabel: string;
  grams: number;
  calories: number;
  carbs: number;
  protein: number;
  fat: number;
  caloriesPer100g?: number;
  carbsPer100g?: number;
  proteinPer100g?: number;
  fatPer100g?: number;
  dataSource?: string;
  dataType?: string;
  brandName?: string;
};

export type MealRecord = {
  id: string;
  name: string;
  description: string;
  calories: number;
  carbs?: number;
  protein?: number;
  fat?: number;
  items?: MealFoodItem[];
  createdAt: string;
  source?: string;
  referenceId?: string;
};
export type WaterRecord = { id: string; amountMl: number; createdAt: string };
export type MeasurementRecord = { id: string; weight?: string; waist?: string; hip?: string; arm?: string; bodyFat?: string; createdAt: string };
type DiaryState = { meals: MealRecord[]; water: WaterRecord[]; measurements: MeasurementRecord[] };

const EMPTY: DiaryState = { meals: [], water: [], measurements: [] };
const normalizeState = (value: unknown): DiaryState => {
  if (!value || typeof value !== 'object') return EMPTY;
  const candidate = value as Partial<DiaryState>;
  return {
    meals: Array.isArray(candidate.meals) ? candidate.meals
      .filter(item => item && Number.isFinite(Number(item.calories)))
      .map(item => ({
        ...item,
        calories: Number(item.calories),
        ...(Number.isFinite(Number(item.carbs)) ? { carbs: Number(item.carbs) } : {}),
        ...(Number.isFinite(Number(item.protein)) ? { protein: Number(item.protein) } : {}),
        ...(Number.isFinite(Number(item.fat)) ? { fat: Number(item.fat) } : {}),
      })) : [],
    water: Array.isArray(candidate.water) ? candidate.water.filter(item => item && Number.isFinite(Number(item.amountMl)) && Number(item.amountMl) > 0).map(item => ({ ...item, amountMl: Number(item.amountMl) })) : [],
    measurements: Array.isArray(candidate.measurements) ? candidate.measurements : [],
  };
};
const DiaryContext = createContext<{
  ready: boolean; mealsToday: MealRecord[]; historyMeals: MealRecord[]; allMeals: MealRecord[]; waterToday: WaterRecord[]; measurements: MeasurementRecord[];
  caloriesToday: number; waterTodayMl: number;
  addMeal: (data: Omit<MealRecord, 'id' | 'createdAt'>) => Promise<void>;
  updateMeal: (id: string, data: Omit<MealRecord, 'id' | 'createdAt'>) => Promise<void>;
  removeMeal: (id: string) => Promise<void>;
  addWater: (amountMl: number) => Promise<void>;
  removeWater: (id: string) => Promise<void>;
  addMeasurement: (data: Omit<MeasurementRecord, 'id' | 'createdAt'>) => Promise<void>;
} | null>(null);

const dateKey = (date: string) => /^\d{4}-\d{2}-\d{2}$/.test(date) ? date : localDateString(new Date(date));
const todayKey = () => localDateString();
const fromApiMeal = (meal: Awaited<ReturnType<typeof DiaryAPI.meals>>[number]): MealRecord => ({ id: String(meal.id), name: meal.mealType, description: meal.description, calories: meal.calories, carbs: meal.carbs, protein: meal.protein, fat: meal.fat, items: meal.items as MealFoodItem[], createdAt: meal.createdAt, source: 'manual', referenceId: meal.referenceId });
const fromApiWater = (record: Awaited<ReturnType<typeof DiaryAPI.water>>[number]): WaterRecord => ({ id: String(record.id), amountMl: record.amountMl, createdAt: record.createdAt });
const fromApiMeasurement = (record: Awaited<ReturnType<typeof DiaryAPI.measurements>>[number]): MeasurementRecord => ({ id: String(record.id), weight: record.weight, waist: record.waist, hip: record.hip, arm: record.arm, bodyFat: record.bodyFat, createdAt: record.createdAt });

export function DiaryProvider({ children }: { children: ReactNode }) {
  const { user } = useAuth();
  const [state, setState] = useState<DiaryState>(EMPTY);
  const [ready, setReady] = useState(false);
  const [currentDayKey, setCurrentDayKey] = useState(todayKey);
  const storageKey = user ? `nutrifybe:diary:${user.id}` : null;

  useEffect(() => {
    let timer: ReturnType<typeof setTimeout> | undefined;
    let mounted = true;
    const refreshDay = () => {
      if (!mounted) return;
      setCurrentDayKey(todayKey());
      if (timer) clearTimeout(timer);
      const now = new Date();
      const nextMidnight = new Date(now.getFullYear(), now.getMonth(), now.getDate() + 1);
      timer = setTimeout(refreshDay, Math.max(1000, nextMidnight.getTime() - now.getTime() + 50));
    };
    const subscription = AppState.addEventListener('change', status => {
      if (status === 'active') refreshDay();
    });
    refreshDay();
    return () => {
      mounted = false;
      if (timer) clearTimeout(timer);
      subscription.remove();
    };
  }, []);

  useEffect(() => {
    let active = true;
    setReady(false);
    if (!storageKey) { setState(EMPTY); setReady(true); return () => { active = false; }; }
    AsyncStorage.getItem(storageKey).then(async value => {
      if (!active) return;
      let cached: DiaryState = EMPTY;
      try { cached = value ? normalizeState(JSON.parse(value)) : EMPTY; } catch { cached = EMPTY; }
      setState(cached);
      if (DEMO_MODE) { setReady(true); return; }
      try {
        let [meals, water, measurements] = await Promise.all([DiaryAPI.meals(), DiaryAPI.water(), DiaryAPI.measurements()]);
        // Importa registros locais ainda sem ID do servidor; chaves estáveis tornam as tentativas repetidas idempotentes.
        const oldMeals = cached.meals.filter(record => !/^\d+$/.test(record.id));
        const oldWater = cached.water.filter(record => !/^\d+$/.test(record.id));
        const oldMeasurements = cached.measurements.filter(record => !/^\d+$/.test(record.id));
        if (oldMeals.length) meals = [...meals, ...await Promise.all(oldMeals.map(meal => DiaryAPI.addMeal({ mealType: meal.name, description: meal.description, calories: meal.calories, carbs: meal.carbs, protein: meal.protein, fat: meal.fat, items: meal.items, source: meal.source, referenceId: `legacy:${meal.id}`, createdAt: meal.createdAt })))];
        if (oldWater.length) water = [...water, ...await Promise.all(oldWater.map(record => DiaryAPI.addWater(record.amountMl, record.createdAt, `legacy:${record.id}`)))];
        if (oldMeasurements.length) measurements = [...measurements, ...await Promise.all(oldMeasurements.map(record => DiaryAPI.addMeasurement({ weight: record.weight, waist: record.waist, hip: record.hip, arm: record.arm, bodyFat: record.bodyFat, createdAt: record.createdAt, referenceId: `legacy:${record.id}` })))];
        if (!active) return;
        const unique = <T extends { id: number }>(items: T[]) => [...new Map(items.map(item => [item.id, item])).values()];
        const ordered = <T extends { id: number; createdAt: string }>(items: T[]) => unique(items).sort((a, b) => a.createdAt.localeCompare(b.createdAt));
        const next = { meals: ordered(meals).map(fromApiMeal), water: ordered(water).map(fromApiWater), measurements: ordered(measurements).map(fromApiMeasurement) };
        setState(next);
        await AsyncStorage.setItem(storageKey, JSON.stringify(next));
      } catch {
        // Mantém o último cache para consulta se a API estiver temporariamente indisponível.
      } finally {
        if (active) setReady(true);
      }
    }).catch(() => { if (active) { setState(EMPTY); setReady(true); } });
    return () => { active = false; };
  }, [storageKey]);

  const save = async (next: DiaryState) => {
    setState(next);
    if (storageKey) await AsyncStorage.setItem(storageKey, JSON.stringify(next));
  };
  const addMeal = async (data: Omit<MealRecord, 'id' | 'createdAt'>) => {
    const createdAt = new Date().toISOString();
    const record = !DEMO_MODE && user
      ? fromApiMeal(await DiaryAPI.addMeal({ mealType: data.name, description: data.description, calories: data.calories, carbs: data.carbs, protein: data.protein, fat: data.fat, items: data.items, source: data.source, referenceId: data.referenceId, createdAt }))
      : { ...data, id: `${Date.now()}-${Math.random()}`, createdAt };
    await save({ ...state, meals: [...state.meals, record] });
  };
  const updateMeal = async (id: string, data: Omit<MealRecord, 'id' | 'createdAt'>) => {
    const existing = state.meals.find(record => record.id === id);
    if (!existing) throw new Error('Refeicao nao encontrada');
    const record = !DEMO_MODE && user && /^\d+$/.test(id)
      ? fromApiMeal(await DiaryAPI.updateMeal(Number(id), { mealType: data.name, description: data.description, calories: data.calories, carbs: data.carbs, protein: data.protein, fat: data.fat, items: data.items, source: existing.source, referenceId: existing.referenceId }))
      : { ...existing, ...data, id: existing.id, createdAt: existing.createdAt };
    await save({ ...state, meals: state.meals.map(item => item.id === id ? record : item) });
  };
  const removeMeal = async (id: string) => {
    if (!DEMO_MODE && user && /^\d+$/.test(id)) await DiaryAPI.deleteMeal(Number(id));
    await save({ ...state, meals: state.meals.filter(record => record.id !== id) });
  };
  const addWater = async (amountMl: number) => {
    if (!Number.isFinite(amountMl) || amountMl <= 0) return;
    const createdAt = new Date().toISOString();
    const record = !DEMO_MODE && user
      ? fromApiWater(await DiaryAPI.addWater(amountMl, createdAt))
      : { amountMl, id: `${Date.now()}-${Math.random()}`, createdAt };
    await save({ ...state, water: [...state.water, record] });
  };
  const removeWater = async (id: string) => {
    if (!DEMO_MODE && user && /^\d+$/.test(id)) await DiaryAPI.deleteWater(Number(id));
    await save({ ...state, water: state.water.filter(record => record.id !== id) });
  };
  const addMeasurement = async (data: Omit<MeasurementRecord, 'id' | 'createdAt'>) => {
    const createdAt = new Date().toISOString();
    const record = !DEMO_MODE && user
      ? fromApiMeasurement(await DiaryAPI.addMeasurement({ ...data, createdAt }))
      : { ...data, id: `${Date.now()}-${Math.random()}`, createdAt };
    await save({ ...state, measurements: [...state.measurements, record] });
  };
  const value = useMemo(() => {
    const mealsToday = state.meals.filter(item => dateKey(item.createdAt) === currentDayKey);
    const historyMeals = state.meals.filter(item => dateKey(item.createdAt) < currentDayKey);
    const waterToday = state.water.filter(item => Number.isFinite(item.amountMl) && item.amountMl > 0 && dateKey(item.createdAt) === currentDayKey);
    return { ready, mealsToday, historyMeals, allMeals: state.meals, waterToday, measurements: state.measurements, caloriesToday: mealsToday.reduce((sum, item) => sum + item.calories, 0), waterTodayMl: waterToday.reduce((sum, item) => sum + item.amountMl, 0), addMeal, updateMeal, removeMeal, addWater, removeWater, addMeasurement };
  }, [ready, state, currentDayKey]);
  return <DiaryContext.Provider value={value}>{children}</DiaryContext.Provider>;
}

export function useDiary() {
  const value = useContext(DiaryContext);
  if (!value) throw new Error('DiaryProvider is required');
  return value;
}
