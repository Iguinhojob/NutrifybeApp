import AsyncStorage from '@react-native-async-storage/async-storage';
import { useAuth } from '@/context/auth';
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
  source?: 'manual' | 'nutria';
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
  ready: boolean; mealsToday: MealRecord[]; allMeals: MealRecord[]; waterToday: WaterRecord[]; measurements: MeasurementRecord[];
  caloriesToday: number; waterTodayMl: number;
  addMeal: (data: Omit<MealRecord, 'id' | 'createdAt'>) => Promise<void>;
  addWater: (amountMl: number) => Promise<void>;
  removeWater: (id: string) => Promise<void>;
  addMeasurement: (data: Omit<MeasurementRecord, 'id' | 'createdAt'>) => Promise<void>;
} | null>(null);

const dateKey = (date: string) => new Date(date).toLocaleDateString('en-CA');
const todayKey = () => new Date().toLocaleDateString('en-CA');

export function DiaryProvider({ children }: { children: ReactNode }) {
  const { user } = useAuth();
  const [state, setState] = useState<DiaryState>(EMPTY);
  const [ready, setReady] = useState(false);
  const storageKey = user ? `nutrifybe:diary:${user.id}` : null;

  useEffect(() => {
    let active = true;
    setReady(false);
    if (!storageKey) { setState(EMPTY); setReady(true); return () => { active = false; }; }
    AsyncStorage.getItem(storageKey).then(value => {
      if (!active) return;
      try { setState(value ? normalizeState(JSON.parse(value)) : EMPTY); } catch { setState(EMPTY); }
      setReady(true);
    }).catch(() => { if (active) { setState(EMPTY); setReady(true); } });
    return () => { active = false; };
  }, [storageKey]);

  const save = async (next: DiaryState) => {
    setState(next);
    if (storageKey) await AsyncStorage.setItem(storageKey, JSON.stringify(next));
  };
  const addMeal = async (data: Omit<MealRecord, 'id' | 'createdAt'>) => {
    const record = { ...data, id: `${Date.now()}-${Math.random()}`, createdAt: new Date().toISOString() };
    await save({ ...state, meals: [...state.meals, record] });
  };
  const addWater = async (amountMl: number) => {
    if (!Number.isFinite(amountMl) || amountMl <= 0) return;
    const record = { amountMl, id: `${Date.now()}-${Math.random()}`, createdAt: new Date().toISOString() };
    await save({ ...state, water: [...state.water, record] });
  };
  const removeWater = async (id: string) => save({ ...state, water: state.water.filter(record => record.id !== id) });
  const addMeasurement = async (data: Omit<MeasurementRecord, 'id' | 'createdAt'>) => {
    const record = { ...data, id: `${Date.now()}-${Math.random()}`, createdAt: new Date().toISOString() };
    await save({ ...state, measurements: [...state.measurements, record] });
  };
  const value = useMemo(() => {
    const mealsToday = state.meals.filter(item => dateKey(item.createdAt) === todayKey());
    const waterToday = state.water.filter(item => Number.isFinite(item.amountMl) && item.amountMl > 0 && dateKey(item.createdAt) === todayKey());
    return { ready, mealsToday, allMeals: state.meals, waterToday, measurements: state.measurements, caloriesToday: mealsToday.reduce((sum, item) => sum + item.calories, 0), waterTodayMl: waterToday.reduce((sum, item) => sum + item.amountMl, 0), addMeal, addWater, removeWater, addMeasurement };
  }, [ready, state]);
  return <DiaryContext.Provider value={value}>{children}</DiaryContext.Provider>;
}

export function useDiary() {
  const value = useContext(DiaryContext);
  if (!value) throw new Error('DiaryProvider is required');
  return value;
}
