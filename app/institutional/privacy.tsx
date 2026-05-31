import { useTheme } from '@/context/theme';
import { ScrollView, StyleSheet, Text, View } from 'react-native';

const SECTIONS = [
  { title: '1. Coleta de Dados', text: 'Coletamos informações pessoais como nome, email, peso, altura e dados de alimentação para personalizar sua experiência no aplicativo.' },
  { title: '2. Uso das Informações', text: 'Suas informações são utilizadas exclusivamente para fornecer recomendações nutricionais personalizadas e melhorar nossos serviços.' },
  { title: '3. Compartilhamento', text: 'Não compartilhamos seus dados pessoais com terceiros sem seu consentimento explícito, exceto quando exigido por lei.' },
  { title: '4. Segurança', text: 'Utilizamos medidas de segurança técnicas e organizacionais para proteger seus dados contra acesso não autorizado.' },
  { title: '5. Seus Direitos', text: 'Você tem o direito de acessar, corrigir ou excluir seus dados pessoais a qualquer momento através das configurações do aplicativo.' },
  { title: '6. Contato', text: 'Para dúvidas sobre privacidade, entre em contato: privacidade@nutrifybe.com' },
];

export default function PrivacyScreen() {
  const { colors } = useTheme();
  const s = styles(colors);

  return (
    <ScrollView style={s.container} contentContainerStyle={s.content}>
      <Text style={s.updated}>Última atualização: Janeiro 2025</Text>
      {SECTIONS.map(section => (
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
  content: { padding: 20, gap: 12 },
  updated: { fontSize: 13, color: colors.textSecondary, marginBottom: 4 },
  section: { backgroundColor: colors.card, borderRadius: 14, padding: 16, gap: 8, borderWidth: 1, borderColor: colors.border },
  sectionTitle: { fontSize: 15, fontWeight: '700', color: colors.primary },
  sectionText: { fontSize: 14, color: colors.textSecondary, lineHeight: 22 },
});
