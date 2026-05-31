import { useTheme } from '@/context/theme';
import { ScrollView, StyleSheet, Text, View } from 'react-native';

const SECTIONS = [
  { title: '1. Aceitação dos Termos', text: 'Ao utilizar o Nutrifybe, você concorda com estes Termos e Condições. Se não concordar, não utilize o aplicativo.' },
  { title: '2. Uso do Serviço', text: 'O Nutrifybe é destinado a fins informativos e de acompanhamento nutricional. Não substitui consultas com profissionais de saúde.' },
  { title: '3. Conta do Usuário', text: 'Você é responsável por manter a confidencialidade de suas credenciais de acesso e por todas as atividades realizadas em sua conta.' },
  { title: '4. Conteúdo', text: 'As informações nutricionais fornecidas são baseadas em dados gerais e podem não ser adequadas para condições médicas específicas.' },
  { title: '5. Limitação de Responsabilidade', text: 'O Nutrifybe não se responsabiliza por decisões tomadas com base nas informações do aplicativo sem orientação profissional.' },
  { title: '6. Modificações', text: 'Reservamos o direito de modificar estes termos a qualquer momento. Notificaremos os usuários sobre mudanças significativas.' },
  { title: '7. Contato', text: 'Para dúvidas sobre os termos: termos@nutrifybe.com' },
];

export default function TermsScreen() {
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
