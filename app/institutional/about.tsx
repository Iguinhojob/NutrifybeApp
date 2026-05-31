import { useTheme } from '@/context/theme';
import { ScrollView, StyleSheet, Text, View } from 'react-native';

export default function AboutScreen() {
  const { colors } = useTheme();
  const s = styles(colors);

  return (
    <ScrollView style={s.container} contentContainerStyle={s.content}>
      <Text style={s.logo}>🥗</Text>
      <Text style={s.title}>Nutrifybe</Text>
      <Text style={s.tagline}>Sua nutrição inteligente</Text>

      {[
        { title: 'Nossa Missão', text: 'Ajudar pessoas a alcançarem seus objetivos de saúde através de um acompanhamento nutricional personalizado, simples e eficaz.' },
        { title: 'O que fazemos', text: 'O Nutrifybe oferece planos alimentares personalizados, registro diário de refeições, acompanhamento de progresso e análise de tendências para que você mantenha uma alimentação saudável.' },
        { title: 'Nossa Equipe', text: 'Somos uma equipe apaixonada por saúde e tecnologia, comprometida em tornar a nutrição acessível para todos.' },
        { title: 'Versão', text: 'Nutrifybe v1.0.0' },
      ].map(section => (
        <View key={section.title} style={s.section}>
          <Text style={s.sectionTitle}>{section.title}</Text>
          <Text style={s.sectionText}>{section.text}</Text>
        </View>
      ))}
    </ScrollView>
  );
}

const styles = (colors: ReturnType<typeof useTheme>['colors']) => StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background },
  content: { padding: 24, gap: 20, alignItems: 'center' },
  logo: { fontSize: 64, marginTop: 16 },
  title: { fontSize: 28, fontWeight: 'bold', color: colors.primary },
  tagline: { fontSize: 15, color: colors.textSecondary, marginBottom: 8 },
  section: { width: '100%', backgroundColor: colors.card, borderRadius: 14, padding: 16, gap: 8, borderWidth: 1, borderColor: colors.border },
  sectionTitle: { fontSize: 16, fontWeight: '700', color: colors.text },
  sectionText: { fontSize: 14, color: colors.textSecondary, lineHeight: 22 },
});
