import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Dimensions } from 'react-native';

export function useAppLayout() {
  const insets = useSafeAreaInsets();
  const { width: screenWidth } = Dimensions.get('window');
  const topPad    = insets.top + 12;
  const bottomPad = insets.bottom + 16;
  const isSmall   = screenWidth < 360;
  const isTablet  = screenWidth >= 600;
  return { insets, topPad, bottomPad, screenWidth, isSmall, isTablet };
}
