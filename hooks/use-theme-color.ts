import { lightPremium } from '@/constants/theme';
import { usePremiumTheme } from '@/context/theme';

export function useThemeColor(
  props: { light?: string; dark?: string },
  colorName: keyof typeof lightPremium
) {
  const { colors, isDark } = usePremiumTheme();
  const colorFromProps = isDark ? props.dark : props.light;
  return colorFromProps ?? colors[colorName] ?? lightPremium[colorName];
}
