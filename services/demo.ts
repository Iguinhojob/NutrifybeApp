import type { Nutricionista } from './api';

// Frontend preview requested for this phase. No account, email or link is sent to the server.
export const DEMO_MODE = true;
export const DEMO_NUTRI_CODE = '1234';
export const DEMO_NUTRITIONIST: Nutricionista = {
  id: 1234, nome: 'Ana Souza', email: 'ana@example.test', crn: 'DEMO-1234',
  status: 'approved', ativo: 1, especialidade: 'Nutrição e bem-estar',
  descricao: 'Perfil de demonstração para testar o acompanhamento.',
};

export async function findNutritionist(code: string): Promise<Nutricionista | null> {
  if (DEMO_MODE) return code.trim() === DEMO_NUTRI_CODE ? DEMO_NUTRITIONIST : null;
  const { NutricionistasAPI } = await import('./api');
  if (!/^\d+$/.test(code.trim()) || !Number.isSafeInteger(Number(code))) return null;
  const nutri = await NutricionistasAPI.getById(Number(code));
  return nutri.ativo === 1 && nutri.status === 'approved' ? nutri : null;
}
