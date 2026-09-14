// ─── Modo Claro: Branco + Ciano ──────────────────────────────────────────────
// Primário: ciano (#06b6d4)
// Complementares: verde (#10b981), laranja (#f59e0b), vermelho (#ef4444)
export const lightPremium = {
  // Fundos
  bg:       '#F8FFFE',
  surface:  '#FFFFFF',
  surface2: '#F0FDFC',
  surface3: '#CCFBF1',

  // Bordas
  border: '#B2EBF2',

  // Textos
  text:      '#0A2A2E',
  textMuted: '#4A7A80',
  textDim:   '#90B8BC',

  // Primário — ciano
  primary:      '#06b6d4',
  primaryDark:  '#0891b2',
  primaryLight: '#22d3ee',
  primarySoft:  'rgba(6,182,212,0.1)',

  // Secundário — verde (complementar)
  secondary:     '#10b981',
  secondaryDark: '#059669',
  secondaryLight:'#34d399',
  secondarySoft: 'rgba(16,185,129,0.1)',

  // Acento — roxo suave (complementar)
  accent:     '#8b5cf6',
  accentSoft: 'rgba(139,92,246,0.1)',

  // Semânticas
  success:     '#10b981',
  successSoft: 'rgba(16,185,129,0.12)',
  warning:     '#f59e0b',
  warningSoft: 'rgba(245,158,11,0.12)',
  danger:      '#ef4444',
  dangerSoft:  'rgba(239,68,68,0.12)',
  green:       '#10b981',
  yellow:      '#f59e0b',
  red:         '#ef4444',
  blue:        '#3b82f6',

  // Nav / Tab bar
  navBg:          'rgba(248,255,254,0.96)',
  tabBar:         'rgba(248,255,254,0.96)',
  tabBarActive:   '#06b6d4',
  tabBarInactive: '#90B8BC',
  navActive:      '#06b6d4',
  navInactive:    '#90B8BC',
  navBorder:      '#B2EBF2',

  // Chat / banners
  bubbleMe:        'rgba(6,182,212,0.12)',
  aiBannerBg:      'rgba(6,182,212,0.07)',
  aiBannerBorder:  '#22d3ee',
  mintBannerBg:    'rgba(16,185,129,0.07)',
  mintBannerBorder:'#10b981',
  chipActiveBg:    'rgba(6,182,212,0.12)',

  // Auth
  authScreenBg: '#F0FDFC',
  authCardBg:   '#FFFFFF',
  inputBg:      '#F8FFFE',

  // Compat aliases
  background:       '#F8FFFE',
  card:             '#FFFFFF',
  purpleSoft:       'rgba(139,92,246,0.1)',
  purpleAccent:     '#8b5cf6',
  purpleCard:       'rgba(139,92,246,0.06)',
  ctaContrastBg:    '#06b6d4',
  ctaContrastText:  '#FFFFFF',
  gold:             '#f59e0b',
  textSecondary:    '#4A7A80',
  white:            '#FFFFFF',
  primaryLight:     'rgba(6,182,212,0.1)',
  primaryDarkColor: '#0891b2',
  icon:             '#4A7A80',
};

// ─── Modo Escuro: Preto + Roxo ───────────────────────────────────────────────
// Primário: roxo (#8b5cf6)
// Complementares: ciano (#22d3ee), verde (#34d399), laranja (#f59e0b)
export const darkPremium = {
  // Fundos
  bg:       '#0A0A0F',
  surface:  '#13111C',
  surface2: '#1C1830',
  surface3: '#251F3D',

  // Bordas
  border: '#2D2845',

  // Textos
  text:      '#F0ECFF',
  textMuted: '#9B8FC0',
  textDim:   '#5A5278',

  // Primário — roxo
  primary:      '#8b5cf6',
  primaryDark:  '#7c3aed',
  primaryLight: '#a78bfa',
  primarySoft:  'rgba(139,92,246,0.15)',

  // Secundário — ciano (complementar)
  secondary:     '#22d3ee',
  secondaryDark: '#06b6d4',
  secondaryLight:'#67e8f9',
  secondarySoft: 'rgba(34,211,238,0.12)',

  // Acento — verde (complementar)
  accent:     '#34d399',
  accentSoft: 'rgba(52,211,153,0.12)',

  // Semânticas
  success:     '#34d399',
  successSoft: 'rgba(52,211,153,0.15)',
  warning:     '#fbbf24',
  warningSoft: 'rgba(251,191,36,0.15)',
  danger:      '#f87171',
  dangerSoft:  'rgba(248,113,113,0.15)',
  green:       '#34d399',
  yellow:      '#fbbf24',
  red:         '#f87171',
  blue:        '#60a5fa',

  // Nav / Tab bar
  navBg:          'rgba(10,10,15,0.97)',
  tabBar:         'rgba(10,10,15,0.97)',
  tabBarActive:   '#a78bfa',
  tabBarInactive: '#3D3A52',
  navActive:      '#a78bfa',
  navInactive:    '#3D3A52',
  navBorder:      '#1E1B2E',

  // Chat / banners
  bubbleMe:        'rgba(139,92,246,0.18)',
  aiBannerBg:      'rgba(139,92,246,0.1)',
  aiBannerBorder:  '#5A5278',
  mintBannerBg:    'rgba(52,211,153,0.1)',
  mintBannerBorder:'#34d399',
  chipActiveBg:    'rgba(139,92,246,0.18)',

  // Auth
  authScreenBg: '#0A0A0F',
  authCardBg:   '#13111C',
  inputBg:      '#1C1830',

  // Compat aliases
  background:       '#0A0A0F',
  card:             '#13111C',
  purpleSoft:       'rgba(139,92,246,0.15)',
  purpleAccent:     '#a78bfa',
  purpleCard:       'rgba(139,92,246,0.08)',
  ctaContrastBg:    '#8b5cf6',
  ctaContrastText:  '#FFFFFF',
  gold:             '#fbbf24',
  textSecondary:    '#9B8FC0',
  white:            '#F0ECFF',
  primaryLight:     'rgba(139,92,246,0.15)',
  primaryDarkColor: '#7c3aed',
  icon:             '#9B8FC0',
};

// ─── Paleta editorial (auth screens legadas) ─────────────────────────────────
export const editorialPalette = {
  mint:    '#CCFBF1',
  text:    '#0A2A2E',
  surface: '#FFFFFF',
  lilac:   '#c4b5fd',
  pink:    '#f9a8d4',
  border:  '#B2EBF2',
};

// ─── Exports de compatibilidade ──────────────────────────────────────────────
export const LightColors = lightPremium;
export const DarkColors  = darkPremium;
export const Colors      = lightPremium;
