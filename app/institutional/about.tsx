import { usePremiumTheme } from '@/context/theme';
import { useMemo } from 'react';
import { ScrollView, StyleSheet, Text, View } from 'react-native';

export default function AboutScreen() {
  const { colors, isDark } = usePremiumTheme();
  const s = useMemo(() => createStyles(colors, isDark), [colors, isDark]);

  return (
    <ScrollView style={s.screen} contentContainerStyle={s.scroll}>
      <View style={s.hero}>
        <Text style={s.logo}>🥗</Text>
        <Text style={s.title}>Nutrifybe</Text>
        <Text style={s.tagline}>Sua nutrição inteligente</Text>
      </View>

      {[
        { title: 'Nossa Missão', text: 'Ajudar pessoas a alcançarem seus objetivos de saúde através de um acompanhamento nutricional personalizado, simples e eficaz.' },
        { title: 'O que fazemos', text: 'O Nutrifybe oferece planos alimentares personalizados, registro diário de refeições, acompanhamento de progresso e análise de tendências para que você mantenha uma alimentação saudável.' },
        { title: 'Nossa Equipe', text: 'Somos uma equipe apaixonada por saúde e tecnologia, comprometida em tornar a nutrição acessível para todos.' },
        { title: 'Versão', text: 'Nutrifybe v1.0.0 · 2025' },
      ].map(section => (
        <View key={section.title} style={s.card}>
          <Text style={s.cardTitle}>{section.title}</Text>
          <Text style={s.cardText}>{section.text}</Text>
        </View>
      ))}
    </ScrollView>
  );
}

function createStyles(colors: any, isDark: boolean) {
  return StyleSheet.create({
    screen:    { flex: 1, backgroundColor: colors.bg },
    scroll:    { padding: 20, gap: 12, alignItems: 'center' },
    hero:      { alignItems: 'center', paddingVertical: 24, gap: 4 },
    logo:      { fontSize: 56 },
    title:     { fontSize: 26, fontWeight: '900', color: colors.text, letterSpacing: -1 },
    tagline:   { fontSize: 14, color: colors.textMuted, fontWeight: '500' },
    card:      { width: '100%', backgroundColor: colors.surface, borderRadius: 16, padding: 16, gap: 8, borderWidth: 1, borderColor: colors.border },
    cardTitle: { fontSize: 15, fontWeight: '800', color: colors.primary },
    cardText:  { fontSize: 14, color: colors.textMuted, lineHeight: 22, fontWeight: '500' },
  });
}
