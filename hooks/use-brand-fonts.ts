import { Inter_400Regular, Inter_500Medium, Inter_600SemiBold, Inter_700Bold, useFonts } from '@expo-google-fonts/inter';

export function useBrandFonts() {
  const [loaded] = useFonts({ Inter_400Regular, Inter_500Medium, Inter_600SemiBold, Inter_700Bold });
  return {
    regular: loaded ? 'Inter_400Regular' : undefined,
    medium: loaded ? 'Inter_500Medium' : undefined,
    semibold: loaded ? 'Inter_600SemiBold' : undefined,
    bold: loaded ? 'Inter_700Bold' : undefined,
  };
}
