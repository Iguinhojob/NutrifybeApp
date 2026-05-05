import { Colors } from '@/constants/theme';
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
  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <Text style={styles.updated}>Última atualização: Janeiro 2025</Text>
      {SECTIONS.map(s => (
        <View key={s.title} style={styles.section}>
          <Text style={styles.sectionTitle}>{s.title}</Text>
          <Text style={styles.sectionText}>{s.text}</Text>
        </View>
      ))}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.background },
  content: { padding: 20, gap: 12 },
  updated: { fontSize: 13, color: Colors.textSecondary, marginBottom: 4 },
  section: { backgroundColor: Colors.white, borderRadius: 14, padding: 16, gap: 8 },
  sectionTitle: { fontSize: 15, fontWeight: '700', color: Colors.primary },
  sectionText: { fontSize: 14, color: Colors.textSecondary, lineHeight: 22 },
});
