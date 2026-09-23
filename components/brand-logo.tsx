import { usePremiumTheme } from '@/context/theme';
import { Image, ImageStyle, StyleProp } from 'react-native';

type BrandLogoProps = {
  width?: number;
  height?: number;
  style?: StyleProp<ImageStyle>;
  markOnly?: boolean;
};

export function BrandLogo({ width = 220, height, style, markOnly = false }: BrandLogoProps) {
  const { isDark } = usePremiumTheme();
  const source = markOnly
    ? isDark ? require('../assets/images/icone-roxo.png') : require('../assets/images/logo512.png')
    : isDark
      ? require('../assets/images/logo-horizontal-escuro.png')
      : require('../assets/images/logo-horizontal-claro.png');

  const ratio = markOnly ? 1 : 4.34;
  return (
    <Image
      source={source}
      resizeMode="contain"
      style={[{ width, height: height ?? width / ratio }, style]}
      accessibilityLabel="NutriFybe"
    />
  );
}
