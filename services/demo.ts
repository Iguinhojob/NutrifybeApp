import type { Nutricionista } from './api';

export type NutritionistProfile = Nutricionista & {
  rating?: number;
  reviewCount?: number;
  experienceYears?: number;
  bio?: string;
  focusAreas?: string[];
  consultationModes?: string[];
};

// Frontend preview requested for this phase. No account, email or link is sent to the server.
export const DEMO_MODE = true;
export const DEMO_NUTRI_CODE = '1234';
export const DEMO_NUTRITIONISTS: NutritionistProfile[] = [
  {
    id: 1234, nome: 'Ana Souza', email: 'ana@example.test', crn: 'TESTE-1234',
    status: 'approved', ativo: 1, especialidade: 'Nutrição e bem-estar',
    descricao: 'Acompanhamento para reeducação alimentar e construção de hábitos sustentáveis.',
    rating: 4.9, reviewCount: 84, experienceYears: 8,
    bio: 'Atendimento acolhedor, com estratégias que respeitam a rotina, a cultura alimentar e as preferências de cada pessoa.',
    focusAreas: ['Reeducação alimentar', 'Emagrecimento', 'Hábitos saudáveis'],
    consultationModes: ['Online', 'Presencial'],
  },
  {
    id: 2345, nome: 'Marcos Lima', email: 'marcos@example.test', crn: 'TESTE-2345',
    status: 'approved', ativo: 1, especialidade: 'Nutrição esportiva',
    descricao: 'Planejamento alimentar para desempenho, ganho de massa e rotina de treinos.',
    rating: 4.8, reviewCount: 61, experienceYears: 6,
    bio: 'Trabalha com praticantes de atividade física que buscam desempenho, recuperação e organização alimentar.',
    focusAreas: ['Ganho de massa', 'Performance', 'Composição corporal'],
    consultationModes: ['Online', 'Presencial'],
  },
  {
    id: 3456, nome: 'Carla Mendes', email: 'carla@example.test', crn: 'TESTE-3456',
    status: 'approved', ativo: 1, especialidade: 'Nutrição clínica',
    descricao: 'Acompanhamento alimentar individualizado com foco em saúde e qualidade de vida.',
    rating: 4.9, reviewCount: 103, experienceYears: 10,
    bio: 'Acompanhamento individual com escuta ativa e integração entre alimentação, sintomas e qualidade de vida.',
    focusAreas: ['Nutrição clínica', 'Saúde intestinal', 'Qualidade de vida'],
    consultationModes: ['Online'],
  },
];

export const DEMO_NUTRITIONIST = DEMO_NUTRITIONISTS[0];

export async function findNutritionist(code: string): Promise<Nutricionista | null> {
  if (DEMO_MODE) return DEMO_NUTRITIONISTS.find(nutritionist => String(nutritionist.id) === code.trim()) ?? null;
  const { NutricionistasAPI } = await import('./api');
  if (!/^\d+$/.test(code.trim()) || !Number.isSafeInteger(Number(code))) return null;
  const nutri = await NutricionistasAPI.getById(Number(code));
  return nutri.ativo === 1 && nutri.status === 'approved' ? nutri : null;
}

export function findDemoNutritionistById(id: number) {
  return DEMO_NUTRITIONISTS.find(nutritionist => nutritionist.id === id) ?? DEMO_NUTRITIONIST;
}

export async function listAvailableNutritionists(): Promise<NutritionistProfile[]> {
  if (DEMO_MODE) return DEMO_NUTRITIONISTS;
  const { NutricionistasAPI } = await import('./api');
  const nutritionists = await NutricionistasAPI.getAll();
  return nutritionists.filter(nutritionist => nutritionist.ativo === 1 && nutritionist.status === 'approved');
}
