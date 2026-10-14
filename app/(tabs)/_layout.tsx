import { usePremiumTheme } from '@/context/theme';
import { Ionicons } from '@expo/vector-icons';
import { Tabs } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

/*
 * Barra inferior com as cinco áreas mais usadas. Histórico, Água e IMC continuam
 * disponíveis pelos atalhos da tela Início e pela seção "Mais ferramentas" do Perfil.
 */
export default function TabsLayout() {
  const { colors } = usePremiumTheme();
  const insets = useSafeAreaInsets();

  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarActiveTintColor: colors.navActive,
        tabBarInactiveTintColor: colors.navInactive,
        tabBarStyle: {
          backgroundColor: colors.navBg,
          borderTopColor: colors.border,
          borderTopWidth: 1,
          height: 68 + insets.bottom,
          paddingBottom: Math.max(insets.bottom, 10),
          paddingTop: 6,
        },
        tabBarLabelStyle: { fontSize: 12, fontWeight: '700' },
        tabBarItemStyle: { minHeight: 48 },
      }}
    >
      <Tabs.Screen name="index" options={{ title: 'Início', tabBarAccessibilityLabel: 'Início: resumo do dia e diário alimentar', tabBarIcon: ({ color, focused }) => <Ionicons name={focused ? 'home' : 'home-outline'} size={23} color={color} /> }} />
      <Tabs.Screen name="plan" options={{ title: 'Plano', tabBarAccessibilityLabel: 'Plano alimentar e acompanhamento', tabBarIcon: ({ color, focused }) => <Ionicons name={focused ? 'nutrition' : 'nutrition-outline'} size={23} color={color} /> }} />
      <Tabs.Screen name="messages" options={{ title: 'Chat', tabBarAccessibilityLabel: 'Conversa com o nutricionista', tabBarIcon: ({ color, focused }) => <Ionicons name={focused ? 'chatbubbles' : 'chatbubbles-outline'} size={23} color={color} /> }} />
      <Tabs.Screen name="trends" options={{ title: 'Evolução', tabBarAccessibilityLabel: 'Evolução de peso, medidas e calorias', tabBarIcon: ({ color, focused }) => <Ionicons name={focused ? 'stats-chart' : 'stats-chart-outline'} size={23} color={color} /> }} />
      <Tabs.Screen name="profile" options={{ title: 'Perfil', tabBarAccessibilityLabel: 'Perfil, configurações e mais ferramentas', tabBarIcon: ({ color, focused }) => <Ionicons name={focused ? 'person' : 'person-outline'} size={23} color={color} /> }} />

      {/* Telas acessadas por atalhos (sem item na barra) */}
      <Tabs.Screen name="history" options={{ href: null }} />
      <Tabs.Screen name="water" options={{ href: null }} />
      <Tabs.Screen name="bmi" options={{ href: null }} />
      <Tabs.Screen name="diet" options={{ href: null }} />
    </Tabs>
  );
}
