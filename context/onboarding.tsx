import { createContext, useContext, useState, type ReactNode } from 'react';
import type { User } from '@/context/auth';

export type SelectedNutritionist = { id: number; nome: string; crn: string };
export type OnboardingDraft = {
  step: number;
  name: string;
  birthDate: string;
  sexo: string;
  goal: string;
  motivation: string;
  activityLevel: string;
  weight: string;
  height: string;
  targetWeight: string;
  waterGoal: string;
  restrictions: string[];
  healthNote: string;
  origin: string;
  followupPreference: 'later' | 'explore' | 'existing';
  nutritionist: SelectedNutritionist | null;
  nutriCode: string;
  email: string;
};

const initial: OnboardingDraft = {
  step: 0, name: '', birthDate: '', sexo: '', goal: '', motivation: '', activityLevel: '',
  weight: '', height: '', targetWeight: '', waterGoal: '', restrictions: [], healthNote: '', origin: '',
  followupPreference: 'later', nutritionist: null, nutriCode: '', email: '',
};

const OnboardingContext = createContext<{
  draft: OnboardingDraft;
  editing: boolean;
  update: (data: Partial<OnboardingDraft>) => void;
  reset: () => void;
  startEditing: (user: User) => void;
  finishEditing: () => void;
} | null>(null);

// Deliberately session-only: no health data or credentials in URLs or device storage.
export function OnboardingProvider({ children }: { children: ReactNode }) {
  const [draft, setDraft] = useState<OnboardingDraft>(initial);
  const [editing, setEditing] = useState(false);
  const reset = () => { setDraft(initial); setEditing(false); };
  const startEditing = (user: User) => {
    const step = user.origin ? 7 : user.restrictions ? 6 : user.targetWeight ? 5 : user.activityLevel ? 4 : user.motivation ? 3 : user.goal ? 2 : user.birthDate || user.sexo ? 1 : 0;
    setDraft({
      ...initial, step, name: user.name ?? '', birthDate: user.birthDate ?? '', sexo: user.sexo ?? '',
      goal: user.goal ?? '', motivation: user.motivation ?? '', activityLevel: user.activityLevel ?? '',
      weight: user.weight ?? '', height: user.height ?? '', targetWeight: user.targetWeight ?? '', waterGoal: user.waterGoal ?? '',
      restrictions: user.restrictions ? user.restrictions.split(',').map(item => item.trim()).filter(Boolean) : [],
      healthNote: user.healthNote ?? '', origin: user.origin ?? '', nutriCode: user.nutriCode ?? '', email: user.email ?? '',
      followupPreference: user.followupPreference === 'explore' || user.followupPreference === 'existing' ? user.followupPreference : 'later',
    });
    setEditing(true);
  };
  const finishEditing = () => { setEditing(false); setDraft(initial); };
  return <OnboardingContext.Provider value={{ draft, editing, update: data => setDraft(prev => ({ ...prev, ...data })), reset, startEditing, finishEditing }}>{children}</OnboardingContext.Provider>;
}

export function useOnboarding() {
  const value = useContext(OnboardingContext);
  if (!value) throw new Error('OnboardingProvider is required');
  return value;
}
