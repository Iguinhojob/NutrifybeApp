// ── Paleta base ──────────────────────────────────────────────────────────────
const PURPLE       = '#9333EA';
const PURPLE_LIGHT = '#A855F7';
const PURPLE_SOFT  = 'rgba(147,51,234,0.15)';
const CYAN         = '#22d3ee';
const GREEN        = '#34d399';
const ORANGE       = '#F97316';
const YELLOW       = '#fbbf24';
const RED          = '#f87171';
const BLUE         = '#60a5fa';

// ── Tema claro ────────────────────────────────────────────────────────────────
export const lightTheme = {
  bg:          '#FFFFFF',
  surface:     '#F4FEFF',
  surface2:    '#E0F7FA',
  surface3:    '#B2EBF2',
  border:      '#B2EBF2',
  text:        '#0A1F22',
  textMuted:   '#4A7A80',
  textDim:     '#90B8BC',
  primary:     '#00BCD4',
  primaryDark: '#0097A7',
  primaryLight:'rgba(0,188,212,0.10)',
  primaryMid:  '#4DD0E1',
  cyan:        '#00BCD4',
  purple:      PURPLE,
  orange:      ORANGE,
  orangeLight: '#FFF0E6',
  yellow:      '#f59e0b',
  yellowLight: '#FEF9C3',
  danger:      '#ef4444',
  dangerLight: '#FEE2E2',
  blue:        '#3b82f6',
  success:     '#10b981',
  warning:     '#f59e0b',
  white:       '#FFFFFF',
  navBg:       '#FFFFFF',
  navBorder:   '#B2EBF2',
  navActive:   '#00BCD4',
  navInactive: '#90B8BC',
  shadow:      '#000000',
};

// ── Tema escuro ───────────────────────────────────────────────────────────────
export const darkTheme = {
  bg:          '#0A0A0F',
  surface:     '#13111C',
  surface2:    '#1C1830',
  surface3:    '#251F3D',
  border:      '#2D2845',
  text:        '#F0ECFF',
  textMuted:   '#9B8FC0',
  textDim:     '#5A5278',
  primary:     PURPLE,
  primaryDark: '#7C3AED',
  primaryLight: PURPLE_SOFT,
  primaryMid:  PURPLE_LIGHT,
  cyan:        CYAN,
  purple:      PURPLE,
  orange:      ORANGE,
  orangeLight: '#431407',
  yellow:      YELLOW,
  yellowLight: '#422006',
  danger:      RED,
  dangerLight: '#450A0A',
  blue:        BLUE,
  success:     GREEN,
  warning:     YELLOW,
  white:       '#F0ECFF',
  navBg:       '#0A0A0F',
  navBorder:   '#2D2845',
  navActive:   PURPLE_LIGHT,
  navInactive: '#3D3A52',
  shadow:      '#000000',
};

export type AppTheme = typeof lightTheme;

export const GRAD: [string, string]     = [PURPLE, '#7C3AED'];
export const GRAD_REV: [string, string] = ['#7C3AED', PURPLE];
export const GRAD_WARM: [string, string]= [PURPLE, CYAN];

export const D = darkTheme;
