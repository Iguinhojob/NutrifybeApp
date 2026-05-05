import { Colors } from '@/constants/theme';
import { ScrollView, StyleSheet, Text, View } from 'react-native';

export default function AboutScreen() {
  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <Text style={styles.logo}>🥗</Text>
      <Text style={styles.title}>Nutrifybe</Text>
      <Text style={styles.tagline}>Sua nutrição inteligente</Text>

      {[
        { title: 'Nossa Missão', text: 'Ajudar pessoas a alcançarem seus objetivos de saúde através de um acompanhamento nutricional personalizado, simples e eficaz.' },
        { title: 'O que fazemos', text: 'O Nutrifybe oferece planos alimentares personalizados, registro diário de refeições, acompanhamento de progresso e análise de tendências para que você mantenha uma alimentação saudável.' },
        { title: 'Nossa Equipe', text: 'Somos uma equipe apaixonada por saúde e tecnologia, comprometida em tornar a nutrição acessível para todos.' },
        { title: 'Versão', text: 'Nutrifybe v1.0.0' },
      ].map(section => (
        <View key={section.title} style={styles.section}>
          <Text style={styles.sectionTitle}>{section.title}</Text>
          <Text style={styles.sectionText}>{section.text}</Text>
        </View>
      ))}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.background },
  content: { padding: 24, gap: 20, alignItems: 'center' },
  logo: { fontSize: 64, marginTop: 16 },
  title: { fontSize: 28, fontWeight: 'bold', color: Colors.primary },
  tagline: { fontSize: 15, color: Colors.textSecondary, marginBottom: 8 },
  section: { width: '100%', backgroundColor: Colors.white, borderRadius: 14, padding: 16, gap: 8 },
  sectionTitle: { fontSize: 16, fontWeight: '700', color: Colors.text },
  sectionText: { fontSize: 14, color: Colors.textSecondary, lineHeight: 22 },
});
