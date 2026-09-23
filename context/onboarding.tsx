import { createContext, useContext, useState, type ReactNode } from 'react';

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
  weight: '', height: '', targetWeight: '', restrictions: [], healthNote: '', origin: '',
  followupPreference: 'later', nutritionist: null, nutriCode: '', email: '',
};

const OnboardingContext = createContext<{
  draft: OnboardingDraft;
  update: (data: Partial<OnboardingDraft>) => void;
  reset: () => void;
} | null>(null);

// Deliberately session-only: no health data or credentials in URLs or device storage.
export function OnboardingProvider({ children }: { children: ReactNode }) {
  const [draft, setDraft] = useState<OnboardingDraft>(initial);
  return <OnboardingContext.Provider value={{ draft, update: data => setDraft(prev => ({ ...prev, ...data })), reset: () => setDraft(initial) }}>{children}</OnboardingContext.Provider>;
}

export function useOnboarding() {
  const value = useContext(OnboardingContext);
  if (!value) throw new Error('OnboardingProvider is required');
  return value;
}
