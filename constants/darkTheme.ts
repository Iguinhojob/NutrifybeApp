// ── Tema escuro ──────────────────────────────────────────────────────────────
export const darkTheme = {
  bg:          '#0D0D1A',
  surface:     '#13131F',
  surface2:    '#1C1C2E',
  surface3:    '#22223A',
  border:      '#2A2A3E',
  text:        '#F0F0FF',
  textMuted:   '#8892A4',
  textDim:     '#4A5568',
  cyan:        '#00BCD4',
  purple:      '#7C5CBF',
  purpleLight: '#A78BDA',
  white:       '#FFFFFF',
  danger:      '#F87171',
  warning:     '#FBBF24',
  success:     '#34D399',
  green:       '#34D399',
  yellow:      '#FBBF24',
  red:         '#F87171',
  // nav
  navBg:       '#0D0D1A',
  navBorder:   '#2A2A3E',
  navActive:   '#00BCD4',
  navInactive: '#4A5568',
};

// ── Tema claro ───────────────────────────────────────────────────────────────
export const lightTheme = {
  bg:          '#FFFFFF',
  surface:     '#F5F9FF',
  surface2:    '#EBF4FF',
  surface3:    '#E0EFFF',
  border:      '#D0E8F5',
  text:        '#0A1628',
  textMuted:   '#4A6080',
  textDim:     '#9BB0C8',
  cyan:        '#00BCD4',
  purple:      '#7C5CBF',
  purpleLight: '#A78BDA',
  white:       '#FFFFFF',
  danger:      '#EF4444',
  warning:     '#F59E0B',
  success:     '#10B981',
  green:       '#10B981',
  yellow:      '#F59E0B',
  red:         '#EF4444',
  // nav
  navBg:       '#FFFFFF',
  navBorder:   '#D0E8F5',
  navActive:   '#00BCD4',
  navInactive: '#9BB0C8',
};

export type AppTheme = typeof darkTheme;

// Gradientes
export const GRAD: [string, string]     = ['#00BCD4', '#7C5CBF'];
export const GRAD_REV: [string, string] = ['#7C5CBF', '#00BCD4'];

// Alias para compatibilidade
export const D = darkTheme;
