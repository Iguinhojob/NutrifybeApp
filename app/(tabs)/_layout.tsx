import { usePremiumTheme } from '@/context/theme';
import { Ionicons } from '@expo/vector-icons';
import { Tabs } from 'expo-router';

export default function TabsLayout() {
  const { colors } = usePremiumTheme();
  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarActiveTintColor:   colors.navActive,
        tabBarInactiveTintColor: colors.navInactive,
        tabBarStyle: {
          backgroundColor: colors.navBg,
          borderTopColor:  colors.navBorder,
          borderTopWidth:  1,
          height: 64,
          paddingBottom: 10,
          paddingTop: 6,
        },
        tabBarLabelStyle: { fontSize: 10, fontWeight: '600' },
      }}
    >
      <Tabs.Screen name="index"    options={{ title: 'Início',  tabBarIcon: ({ color, size }) => <Ionicons name="home"                    size={size} color={color} /> }} />
      <Tabs.Screen name="plan"     options={{ title: 'Plano',   tabBarIcon: ({ color, size }) => <Ionicons name="nutrition-outline"        size={size} color={color} /> }} />
      <Tabs.Screen name="messages" options={{ title: 'Chat',    tabBarIcon: ({ color, size }) => <Ionicons name="chatbubble-ellipses"      size={size} color={color} /> }} />
      <Tabs.Screen name="trends"   options={{ title: 'Evolução',tabBarIcon: ({ color, size }) => <Ionicons name="stats-chart"             size={size} color={color} /> }} />
      <Tabs.Screen name="profile"  options={{ title: 'Perfil',  tabBarIcon: ({ color, size }) => <Ionicons name="person"                  size={size} color={color} /> }} />
      <Tabs.Screen name="water"    options={{ href: null }} />
      <Tabs.Screen name="bmi"      options={{ href: null }} />
      <Tabs.Screen name="history"  options={{ href: null }} />
      <Tabs.Screen name="diet"     options={{ href: null }} />
    </Tabs>
  );
}
