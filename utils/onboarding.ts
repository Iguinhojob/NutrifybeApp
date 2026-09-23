export const PASSWORD_MIN_LENGTH = 6;

export function passwordRules(password: string) {
  const length = Array.from(password).length;
  const sequential = ['0123456789', '9876543210', 'abcdefghijklmnopqrstuvwxyz', 'qwertyuiopasdfghjklzxcvbnm']
    .some(sequence => sequence.repeat(Math.ceil(password.length / sequence.length) + 1).includes(password.toLowerCase()));
  return [
    { label: 'Pelo menos 6 caracteres', ok: length >= PASSWORD_MIN_LENGTH },
    { label: 'Pelo menos uma letra maiúscula', ok: /[A-Z]/.test(password) },
    { label: 'Pelo menos um símbolo', ok: /[^A-Za-z0-9\s]/.test(password) },
    { label: 'Evite repetições e sequências comuns', ok: !sequential && new Set(password.toLowerCase()).size >= 5 && !/^(?:qwerty|password|senha|abcdef|\s)+$/i.test(password) },
  ];
}

export const isValidPassword = (value: string) => passwordRules(value).every(rule => rule.ok);
export const isValidEmail = (value: string) => /^[^\s@]+@[^\s@.]+(?:\.[^\s@.]+)+$/.test(value.trim()) && value.trim().length <= 254;
export const decimal = (value: string) => /^\d+(?:[.,]\d{1,2})?$/.test(value.trim()) ? Number(value.trim().replace(',', '.')) : NaN;

export function formatBirthDate(value: string) {
  return value.replace(/\D/g, '').slice(0, 8).replace(/^(\d{2})(\d)/, '$1/$2').replace(/^(\d{2}\/\d{2})(\d)/, '$1/$2');
}

export function ageFromBirthDate(value: string, today = new Date()): number | null {
  if (!/^\d{2}\/\d{2}\/\d{4}$/.test(value)) return null;
  const [day, month, year] = value.split('/').map(Number);
  const date = new Date(year, month - 1, day);
  if (date.getFullYear() !== year || date.getMonth() !== month - 1 || date.getDate() !== day || date > today) return null;
  const age = today.getFullYear() - year - (today.getMonth() < month - 1 || (today.getMonth() === month - 1 && today.getDate() < day) ? 1 : 0);
  return age >= 0 && age <= 120 ? age : null;
}

export function measurementError(weight: string, height: string, target: string, goal: string) {
  const w = decimal(weight), h = decimal(height), t = decimal(target);
  if (!Number.isFinite(w) || w < 20 || w > 500) return 'Confira seu peso em kg (entre 20 e 500).';
  if (!Number.isFinite(h) || h < 80 || h > 250) return 'Confira sua altura em cm (entre 80 e 250).';
  if (target && (!Number.isFinite(t) || t < 20 || t > 500)) return 'Confira o peso desejado ou deixe em branco para decidir depois.';
  if (target && goal === 'Perder peso' && t >= w) return 'O peso desejado deve ser menor que o atual. Você também pode decidir depois.';
  if (target && goal === 'Ganhar massa' && t <= w) return 'O peso desejado deve ser maior que o atual. Você também pode decidir depois.';
  return '';
}
