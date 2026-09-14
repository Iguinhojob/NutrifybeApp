// ── Paleta base ──────────────────────────────────────────────────────────────
const GREEN        = '#22C55E';
const GREEN_DARK   = '#16A34A';
const GREEN_LIGHT  = '#DCFCE7';
const GREEN_MID    = '#4ADE80';
const ORANGE       = '#F97316';
const ORANGE_LIGHT = '#FFF0E6';
const YELLOW       = '#EAB308';
const YELLOW_LIGHT = '#FEF9C3';
const RED          = '#EF4444';
const RED_LIGHT    = '#FEE2E2';
const BLUE         = '#3B82F6';

// ── Tema claro (padrão) ───────────────────────────────────────────────────────
export const lightTheme = {
  bg:          '#F7F8FA',
  surface:     '#FFFFFF',
  surface2:    '#F0FDF4',
  surface3:    '#DCFCE7',
  border:      '#E5E7EB',
  text:        '#111827',
  textMuted:   '#6B7280',
  textDim:     '#9CA3AF',
  primary:     GREEN,
  primaryDark: GREEN_DARK,
  primaryLight:GREEN_LIGHT,
  primaryMid:  GREEN_MID,
  orange:      ORANGE,
  orangeLight: ORANGE_LIGHT,
  yellow:      YELLOW,
  yellowLight: YELLOW_LIGHT,
  danger:      RED,
  dangerLight: RED_LIGHT,
  blue:        BLUE,
  success:     GREEN,
  warning:     YELLOW,
  white:       '#FFFFFF',
  // nav
  navBg:       '#FFFFFF',
  navBorder:   '#E5E7EB',
  navActive:   GREEN,
  navInactive: '#9CA3AF',
  // shadow
  shadow:      '#000000',
};

// ── Tema escuro ───────────────────────────────────────────────────────────────
export const darkTheme = {
  bg:          '#0F1A12',
  surface:     '#1A2E1E',
  surface2:    '#1F3824',
  surface3:    '#243F29',
  border:      '#2D4A33',
  text:        '#F0FDF4',
  textMuted:   '#86EFAC',
  textDim:     '#4ADE80',
  primary:     GREEN,
  primaryDark: GREEN_DARK,
  primaryLight:'#166534',
  primaryMid:  GREEN_MID,
  orange:      ORANGE,
  orangeLight: '#431407',
  yellow:      YELLOW,
  yellowLight: '#422006',
  danger:      RED,
  dangerLight: '#450A0A',
  blue:        BLUE,
  success:     GREEN,
  warning:     YELLOW,
  white:       '#FFFFFF',
  // nav
  navBg:       '#0F1A12',
  navBorder:   '#2D4A33',
  navActive:   GREEN_MID,
  navInactive: '#4ADE80',
  // shadow
  shadow:      '#000000',
};

export type AppTheme = typeof lightTheme;

// Gradiente verde
export const GRAD: [string, string]     = [GREEN, GREEN_DARK];
export const GRAD_REV: [string, string] = [GREEN_DARK, GREEN];
export const GRAD_WARM: [string, string]= [GREEN, ORANGE];

// Alias dark para compatibilidade (não usado em telas novas)
export const D = darkTheme;
