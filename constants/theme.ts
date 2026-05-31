// ─── Paleta base ────────────────────────────────────────────────────────────
const palette = {
  purple:      '#7C5CBF',
  purpleLight: '#A78BDA',
  purpleSoft:  '#EDE8F8',
  purpleCard:  '#F5F0FD',
  mint:        '#86ef98',   // auth screens bg
  green:       '#22C55E',
  greenSoft:   '#DCFCE7',
  gold:        '#D4F53C',   // CTA / badge
  lilac:       '#C8AFE8',   // decorative bubbles
  pink:        '#F9A8D4',   // decorative bubbles
  red:         '#EF4444',
  redSoft:     '#FEE2E2',
  yellow:      '#F59E0B',
  yellowSoft:  '#FEF3C7',
  blue:        '#3B82F6',
};

// ─── Tema claro ──────────────────────────────────────────────────────────────
export const lightPremium = {
  // Fundos
  bg:          '#F4F1F9',
  surface:     '#FFFFFF',
  surface2:    '#FAF8FD',
  surface3:    '#EDE8F8',

  // Bordas
  border:      '#DDD8E8',

  // Textos
  text:        '#1A1035',
  textMuted:   '#6B6480',
  textDim:     '#A89FC0',

  // Marca / acento
  primary:     palette.purple,
  primaryDark: '#5B3FA0',
  primarySoft: palette.purpleSoft,
  purpleAccent: palette.purpleLight,
  purpleSoft:  palette.purpleSoft,
  purpleCard:  palette.purpleCard,

  // CTA
  gold:            palette.gold,
  ctaContrastBg:   palette.gold,
  ctaContrastText: '#1A1035',

  // Semânticas
  success:     palette.green,
  successSoft: palette.greenSoft,
  danger:      palette.red,
  dangerSoft:  palette.redSoft,
  warning:     palette.yellow,
  warningSoft: palette.yellowSoft,
  green:       palette.green,
  yellow:      palette.yellow,
  red:         palette.red,

  // Nav / banners
  navBg:          'rgba(244,241,249,0.96)',
  bubbleMe:        palette.purpleSoft,
  aiBannerBg:      palette.purpleSoft,
  aiBannerBorder:  palette.lilac,
  mintBannerBg:    '#F0FDF4',
  mintBannerBorder: palette.green,
  chipActiveBg:    palette.purpleSoft,

  // Auth
  authScreenBg: palette.mint,
  authCardBg:   '#FFFFFF',

  // Input
  inputBg: '#FAF8FD',

  // Compat aliases (para arquivos legados)
  background:    '#F4F1F9',
  card:          '#FFFFFF',
  tabBar:        'rgba(244,241,249,0.96)',
  tabBarActive:  '#1A1035',
  tabBarInactive:'#A89FC0',
  textSecondary: '#6B6480',
  white:         '#FFFFFF',
  secondary:     palette.purpleLight,
  primaryLight:  palette.purpleSoft,
  primaryDarkColor: '#5B3FA0',

  // icon (para collapsible legado)
  icon: '#6B6480',
};

// ─── Tema escuro ─────────────────────────────────────────────────────────────
export const darkPremium = {
  bg:          '#0F0C1A',
  surface:     '#1C1730',
  surface2:    '#251F3D',
  surface3:    '#2E2748',

  border:      '#3D3560',

  text:        '#F0ECFF',
  textMuted:   '#B8B0D0',
  textDim:     '#7A7295',

  primary:     '#9B7FD4',
  primaryDark: '#7C5CBF',
  primarySoft: '#2E2748',
  purpleAccent: '#C4A8F0',
  purpleSoft:  '#2E2748',
  purpleCard:  '#251F3D',

  gold:            palette.gold,
  ctaContrastBg:   palette.gold,
  ctaContrastText: '#0F0C1A',

  success:     '#34D399',
  successSoft: '#064E3B',
  danger:      '#F87171',
  dangerSoft:  '#450A0A',
  warning:     '#FBBF24',
  warningSoft: '#451A03',
  green:       '#34D399',
  yellow:      '#FBBF24',
  red:         '#F87171',

  navBg:          'rgba(15,12,26,0.97)',
  bubbleMe:        '#2E2748',
  aiBannerBg:      '#2E2748',
  aiBannerBorder:  '#7A7295',
  mintBannerBg:    '#064E3B',
  mintBannerBorder: '#34D399',
  chipActiveBg:    '#2E2748',

  authScreenBg: '#0F0C1A',
  authCardBg:   '#1C1730',
  inputBg:      '#251F3D',

  background:    '#0F0C1A',
  card:          '#1C1730',
  tabBar:        'rgba(15,12,26,0.97)',
  tabBarActive:  '#F0ECFF',
  tabBarInactive:'#7A7295',
  textSecondary: '#B8B0D0',
  white:         '#F0ECFF',
  secondary:     '#C4A8F0',
  primaryLight:  '#2E2748',
  primaryDarkColor: '#7C5CBF',

  icon: '#B8B0D0',
};

// ─── Paleta editorial (telas de auth) ────────────────────────────────────────
export const editorialPalette = {
  mint:    palette.mint,
  text:    '#1A1035',
  surface: '#FFFFFF',
  lilac:   palette.lilac,
  pink:    palette.pink,
  border:  '#DDD8E8',
};

// ─── Exports de compatibilidade ──────────────────────────────────────────────
export const LightColors = lightPremium;
export const DarkColors  = darkPremium;
export const Colors      = lightPremium;
