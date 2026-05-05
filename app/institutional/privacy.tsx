import { Colors } from '@/constants/theme';
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
