import { usePremiumTheme } from '@/context/theme';
import { ScrollView, StyleSheet, Text, View } from 'react-native';

export default function AboutScreen() {
  const { colors } = usePremiumTheme();
  return (
    <ScrollView style={{ flex: 1, backgroundColor: colors.bg }} contentContainerStyle={s.scroll}>
      <View style={s.hero}>
        <View style={[s.iconCircle, { backgroundColor: colors.primary }]}>
          <Text style={{ fontSize: 36 }}>🥗</Text>
        </View>
        <Text style={[s.title, { color: colors.text }]}>Nutri<Text style={{ color: colors.primary }}>fybe</Text></Text>
        <Text style={[s.tagline, { color: colors.textMuted }]}>Sua nutrição inteligente</Text>
      </View>
      {[
        { title: 'Nossa Missão',  text: 'Ajudar pessoas a alcançarem seus objetivos de saúde através de um acompanhamento nutricional personalizado, simples e eficaz.' },
        { title: 'O que fazemos', text: 'O Nutrifybe oferece planos alimentares personalizados, registro diário de refeições, acompanhamento de progresso e análise de tendências.' },
        { title: 'Nossa Equipe',  text: 'Somos uma equipe apaixonada por saúde e tecnologia, comprometida em tornar a nutrição acessível para todos.' },
        { title: 'Versão',        text: 'Nutrifybe v1.0.0 · 2025' },
      ].map(sec => (
        <View key={sec.title} style={[s.card, { backgroundColor: colors.surface, shadowColor: '#000' }]}>
          <Text style={[s.cardTitle, { color: colors.primary }]}>{sec.title}</Text>
          <Text style={[s.cardText, { color: colors.textMuted }]}>{sec.text}</Text>
        </View>
      ))}
    </ScrollView>
  );
}

const s = StyleSheet.create({
  scroll:     { padding: 20, paddingTop: 20, gap: 12, alignItems: 'center' },
  hero:       { alignItems: 'center', paddingVertical: 24, gap: 8 },
  iconCircle: { width: 80, height: 80, borderRadius: 40, alignItems: 'center', justifyContent: 'center' },
  title:      { fontSize: 28, fontWeight: '900', letterSpacing: -1 },
  tagline:    { fontSize: 14, fontWeight: '500' },
  card:       { width: '100%', borderRadius: 16, padding: 16, gap: 8, shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.06, shadowRadius: 8, elevation: 2 },
  cardTitle:  { fontSize: 15, fontWeight: '800' },
  cardText:   { fontSize: 14, lineHeight: 22, fontWeight: '500' },
});
