import { usePremiumTheme } from '@/context/theme';
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
  const { colors } = usePremiumTheme();
  return (
    <ScrollView style={{ flex: 1, backgroundColor: colors.bg }} contentContainerStyle={{ padding: 20, gap: 12 }}>
      <Text style={{ fontSize: 13, color: colors.textMuted, marginBottom: 4, fontWeight: '500' }}>Última atualização: Janeiro 2025</Text>
      {SECTIONS.map(section => (
        <View key={section.title} style={[s.card, { backgroundColor: colors.surface, shadowColor: '#000' }]}>
          <Text style={[s.cardTitle, { color: colors.primary }]}>{section.title}</Text>
          <Text style={[s.cardText, { color: colors.textMuted }]}>{section.text}</Text>
        </View>
      ))}
    </ScrollView>
  );
}

const s = StyleSheet.create({
  card:      { borderRadius: 16, padding: 16, gap: 8, shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.06, shadowRadius: 8, elevation: 2 },
  cardTitle: { fontSize: 15, fontWeight: '800' },
  cardText:  { fontSize: 14, lineHeight: 22, fontWeight: '500' },
});
