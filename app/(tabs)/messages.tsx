import { usePremiumTheme } from '@/context/theme';
import { useRef, useState } from 'react';
import { FlatList, KeyboardAvoidingView, Platform, ScrollView, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { GRAD } from '@/constants/darkTheme';

const NUTRITIONISTS = [
  { id: '1', name: 'Dra. Ana Beatriz',  specialty: 'Nutrição Esportiva',  crn: 'CRN-3 12345', rating: 4.9, patients: 128, online: true,  avatar: '👩‍⚕️', bio: 'Especialista em nutrição esportiva e emagrecimento. 8 anos de experiência.',          initialMsg: 'Olá! Sou a Dra. Ana Beatriz, sua nutricionista. Como posso ajudar você hoje?' },
  { id: '2', name: 'Dr. Carlos Mendes', specialty: 'Nutrição Clínica',    crn: 'CRN-3 67890', rating: 4.7, patients: 95,  online: false, avatar: '👨‍⚕️', bio: 'Foco em doenças crônicas, diabetes e hipertensão. Atendimento humanizado.',          initialMsg: 'Oi! Sou o Dr. Carlos. Estou aqui para te ajudar a alcançar seus objetivos nutricionais!' },
  { id: '3', name: 'Dra. Fernanda Lima',specialty: 'Nutrição Funcional',  crn: 'CRN-3 54321', rating: 4.8, patients: 210, online: true,  avatar: '👩‍💼', bio: 'Nutrição funcional e integrativa. Especialista em saúde intestinal e imunidade.', initialMsg: 'Olá! Sou a Dra. Fernanda. Vamos trabalhar juntos para melhorar sua saúde de forma integral?' },
];
const NUTRI_RESPONSES: Record<string, string[]> = {
  '1': ['Para seu treino, recomendo aumentar a ingestão de carboidratos complexos 1h antes do exercício.', 'A proteína pós-treino é essencial! Tente consumir 20-30g em até 30 minutos após o exercício.', 'Hidratação é chave para a performance. Beba pelo menos 500ml antes de treinar.'],
  '2': ['Para controle glicêmico, prefira alimentos de baixo índice glicêmico nas refeições principais.', 'Reduza o sódio gradualmente — isso ajuda muito no controle da pressão arterial.', 'Fibras solúveis são suas aliadas! Aveia, maçã e leguminosas são ótimas opções.'],
  '3': ['A saúde intestinal é a base de tudo. Inclua probióticos naturais como kefir e iogurte.', 'Alimentos anti-inflamatórios como cúrcuma, gengibre e ômega-3 fazem toda a diferença.', 'Seu microbioma agradece quando você varia os vegetais. Tente comer pelo menos 30 tipos por semana!'],
};
const AI_RESPONSES = ['Com base no seu perfil, recomendo aumentar a ingestão de proteínas no café da manhã.', 'Seu IMC está dentro da faixa saudável. Continue mantendo a consistência no plano!', 'Para perder peso, um déficit de 300-400 kcal/dia é ideal para resultados sustentáveis.', 'Hidratação é fundamental! Beba pelo menos 2L de água por dia, especialmente antes das refeições.'];

type Msg = { id: number; text: string; from: 'user' | 'other'; time: string };
const getTime = () => new Date().toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' });

function ChatView({ title, subtitle, avatar, isAI, responses, initialMsg, onBack }: { title: string; subtitle: string; avatar: string; isAI?: boolean; responses: string[]; initialMsg: string; onBack: () => void }) {
  const { colors } = usePremiumTheme();
  const [messages, setMessages] = useState<Msg[]>([{ id: 1, text: initialMsg, from: 'other', time: getTime() }]);
  const [input, setInput]       = useState('');
  const [typing, setTyping]     = useState(false);
  const listRef = useRef<FlatList>(null);
  const PROMPTS = isAI ? ['Como melhorar minha dieta?', 'Sugestão de lanche', 'Dicas de hidratação', 'Calcular calorias'] : ['Revisar meu plano', 'Tenho uma dúvida', 'Ajustar refeições', 'Próxima consulta'];

  const send = (text?: string) => {
    const msg = (text ?? input).trim(); if (!msg) return;
    setMessages(prev => [...prev, { id: Date.now(), text: msg, from: 'user', time: getTime() }]);
    setInput(''); setTyping(true);
    setTimeout(() => {
      setMessages(prev => [...prev, { id: Date.now() + 1, text: responses[Math.floor(Math.random() * responses.length)], from: 'other', time: getTime() }]);
      setTyping(false);
      setTimeout(() => listRef.current?.scrollToEnd({ animated: true }), 100);
    }, 1000 + Math.random() * 800);
  };

  return (
    <KeyboardAvoidingView style={{ flex: 1, backgroundColor: colors.bg }} behavior={Platform.OS === 'ios' ? 'padding' : 'height'}>
      <View style={[cs.header, { backgroundColor: colors.bg, borderBottomColor: colors.border }]}>
        <TouchableOpacity onPress={onBack} style={[cs.backBtn, { backgroundColor: colors.surface }]}>
          <Ionicons name="arrow-back" size={20} color={colors.text} />
        </TouchableOpacity>
        <View style={[cs.headerAvatar, { backgroundColor: colors.surface2 }]}>
          <Text style={{ fontSize: 22 }}>{avatar}</Text>
        </View>
        <View style={{ flex: 1 }}>
          <Text style={[cs.headerTitle, { color: colors.text }]}>{title}</Text>
          <Text style={[cs.headerSub, { color: colors.textMuted }]}>{subtitle}</Text>
        </View>
        <View style={[cs.onlineDot, { backgroundColor: isAI ? colors.cyan : colors.warning }]} />
      </View>

      {messages.length === 1 && (
        <ScrollView horizontal showsHorizontalScrollIndicator={false} style={[cs.promptsScroll, { borderBottomColor: colors.border }]} contentContainerStyle={{ paddingHorizontal: 16, gap: 8 }}>
          {PROMPTS.map(p => (
            <TouchableOpacity key={p} style={[cs.promptCard, { backgroundColor: colors.surface, borderColor: colors.border }]} onPress={() => send(p)}>
              <Text style={[cs.promptText, { color: colors.text }]}>{p}</Text>
            </TouchableOpacity>
          ))}
        </ScrollView>
      )}

      <FlatList ref={listRef} data={messages} keyExtractor={m => String(m.id)} contentContainerStyle={{ padding: 16, gap: 10 }}
        onContentSizeChange={() => listRef.current?.scrollToEnd({ animated: true })}
        renderItem={({ item: m }) => (
          <View style={[cs.msgRow, m.from === 'user' && cs.msgRowUser]}>
            {m.from !== 'user' && <View style={[cs.otherAvatar, { backgroundColor: colors.surface2 }]}><Text style={{ fontSize: 14 }}>{avatar}</Text></View>}
            <View style={[cs.bubble, m.from === 'user' ? { backgroundColor: colors.cyan } : { backgroundColor: colors.surface, borderWidth: 1, borderColor: colors.border }]}>
              <Text style={[cs.bubbleText, { color: m.from === 'user' ? '#fff' : colors.text }]}>{m.text}</Text>
              <Text style={[cs.bubbleTime, { color: m.from === 'user' ? 'rgba(255,255,255,0.6)' : colors.textDim }]}>{m.time}</Text>
            </View>
          </View>
        )}
        ListFooterComponent={typing ? (
          <View style={cs.msgRow}>
            <View style={[cs.otherAvatar, { backgroundColor: colors.surface2 }]}><Text style={{ fontSize: 14 }}>{avatar}</Text></View>
            <View style={[cs.bubble, { backgroundColor: colors.surface, borderWidth: 1, borderColor: colors.border }]}>
              <Text style={[cs.bubbleText, { color: colors.textMuted, letterSpacing: 3 }]}>● ● ●</Text>
            </View>
          </View>
        ) : null}
      />

      <View style={[cs.composer, { borderTopColor: colors.border, backgroundColor: colors.bg }]}>
        <TextInput style={[cs.composerInput, { backgroundColor: colors.surface, color: colors.text, borderColor: colors.border }]} placeholder="Digite uma mensagem..." value={input} onChangeText={setInput} placeholderTextColor={colors.textDim} onSubmitEditing={() => send()} returnKeyType="send" multiline />
        <LinearGradient colors={GRAD} start={{x:0,y:0}} end={{x:1,y:0}} style={[cs.sendBtn, { opacity: input.trim() ? 1 : 0.4 }]}>
          <TouchableOpacity onPress={() => send()} style={{ width: '100%', height: '100%', alignItems: 'center', justifyContent: 'center' }}>
            <Ionicons name="arrow-up" size={18} color="#fff" />
          </TouchableOpacity>
        </LinearGradient>
      </View>
    </KeyboardAvoidingView>
  );
}

type ViewState = 'hub' | 'ai' | { nutriId: string };

export default function MessagesHubScreen() {
  const { colors } = usePremiumTheme();
  const [view, setView] = useState<ViewState>('hub');

  if (view === 'ai') return <ChatView title="NutrIA" subtitle="Assistente de IA · Online" avatar="✦" isAI responses={AI_RESPONSES} initialMsg="Olá! Sou a NutrIA, sua assistente de nutrição inteligente. Como posso ajudar hoje?" onBack={() => setView('hub')} />;
  if (typeof view === 'object') {
    const n = NUTRITIONISTS.find(x => x.id === view.nutriId)!;
    return <ChatView title={n.name} subtitle={`${n.specialty} · ${n.online ? 'Online' : 'Offline'}`} avatar={n.avatar} responses={NUTRI_RESPONSES[n.id]} initialMsg={n.initialMsg} onBack={() => setView('hub')} />;
  }

  return (
    <View style={{ flex: 1, backgroundColor: colors.bg }}>
      <ScrollView contentContainerStyle={s.scroll} showsVerticalScrollIndicator={false}>
        <Text style={[s.title, { color: colors.text }]}>Mensagens</Text>
        <Text style={[s.subtitle, { color: colors.textMuted }]}>Seu hub de comunicação</Text>

        {/* NutrIA */}
        <TouchableOpacity style={[s.hubCard, { backgroundColor: colors.surface2, borderColor: colors.cyan + '60' }]} onPress={() => setView('ai')}>
          <LinearGradient colors={GRAD} start={{x:0,y:0}} end={{x:1,y:1}} style={s.hubAvatarGrad}>
            <Ionicons name="sparkles" size={26} color="#fff" />
          </LinearGradient>
          <View style={s.hubInfo}>
            <Text style={[s.hubName, { color: colors.text }]}>NutrIA</Text>
            <Text style={[s.hubSpec, { color: colors.textMuted }]}>Assistente de nutrição com IA</Text>
            <View style={[s.badge, { backgroundColor: colors.cyan + '20' }]}>
              <View style={[s.badgeDot, { backgroundColor: colors.cyan }]} />
              <Text style={[s.badgeText, { color: colors.cyan }]}>Online agora</Text>
            </View>
          </View>
          <Ionicons name="chevron-forward" size={18} color={colors.textDim} />
        </TouchableOpacity>

        <Text style={[s.sectionTitle, { color: colors.textMuted }]}>Nutricionistas disponíveis</Text>
        {NUTRITIONISTS.map(n => (
          <TouchableOpacity key={n.id} style={[s.nutriCard, { backgroundColor: colors.surface, borderColor: colors.border }]} onPress={() => setView({ nutriId: n.id })}>
            <View style={s.nutriTop}>
              <View style={[s.nutriAvatar, { backgroundColor: colors.surface2 }]}>
                <Text style={{ fontSize: 28 }}>{n.avatar}</Text>
                {n.online && <View style={s.onlineIndicator} />}
              </View>
              <View style={{ flex: 1 }}>
                <Text style={[s.nutriName, { color: colors.text }]}>{n.name}</Text>
                <Text style={[s.nutriSpec, { color: colors.cyan }]}>{n.specialty}</Text>
                <Text style={[s.nutriCrn, { color: colors.textDim }]}>{n.crn}</Text>
              </View>
              <View style={{ alignItems: 'flex-end', gap: 4 }}>
                <View style={{ flexDirection: 'row', alignItems: 'center', gap: 3 }}>
                  <Ionicons name="star" size={12} color={colors.warning} />
                  <Text style={[s.ratingText, { color: colors.text }]}>{n.rating}</Text>
                </View>
                <Text style={[s.patientsText, { color: colors.textMuted }]}>{n.patients} pacientes</Text>
              </View>
            </View>
            <Text style={[s.nutriBio, { color: colors.textMuted }]}>{n.bio}</Text>
            <View style={s.nutriFooter}>
              <View style={[s.badge, { backgroundColor: n.online ? colors.cyan + '20' : colors.border }]}>
                <View style={[s.badgeDot, { backgroundColor: n.online ? colors.cyan : colors.textDim }]} />
                <Text style={[s.badgeText, { color: n.online ? colors.cyan : colors.textMuted }]}>{n.online ? 'Online' : 'Offline'}</Text>
              </View>
              <LinearGradient colors={GRAD} start={{x:0,y:0}} end={{x:1,y:0}} style={s.chatBtnGrad}>
                <View style={s.chatBtnInner}>
                  <Ionicons name="chatbubble-outline" size={13} color="#fff" />
                  <Text style={s.chatBtnText}>Iniciar chat</Text>
                </View>
              </LinearGradient>
            </View>
          </TouchableOpacity>
        ))}
        <View style={{ height: 100 }} />
      </ScrollView>
    </View>
  );
}

const s = StyleSheet.create({
  scroll:        { padding: 20, paddingTop: 56, gap: 12 },
  title:         { fontSize: 26, fontWeight: '900', letterSpacing: -1 },
  subtitle:      { fontSize: 14, fontWeight: '500', marginBottom: 4 },
  sectionTitle:  { fontSize: 12, fontWeight: '800', textTransform: 'uppercase', letterSpacing: 0.8, marginTop: 4 },
  hubCard:       { flexDirection: 'row', alignItems: 'center', borderRadius: 20, padding: 16, borderWidth: 1.5, gap: 14 },
  hubAvatarGrad: { width: 52, height: 52, borderRadius: 16, alignItems: 'center', justifyContent: 'center' },
  hubInfo:       { flex: 1, gap: 4 },
  hubName:       { fontSize: 16, fontWeight: '800' },
  hubSpec:       { fontSize: 13, fontWeight: '500' },
  nutriCard:     { borderRadius: 20, padding: 16, borderWidth: 1, gap: 10 },
  nutriTop:      { flexDirection: 'row', gap: 12, alignItems: 'flex-start' },
  nutriAvatar:   { width: 56, height: 56, borderRadius: 18, alignItems: 'center', justifyContent: 'center', position: 'relative' },
  onlineIndicator:{ position: 'absolute', bottom: 2, right: 2, width: 12, height: 12, borderRadius: 6, backgroundColor: '#34D399', borderWidth: 2, borderColor: '#fff' },
  nutriName:     { fontSize: 15, fontWeight: '800' },
  nutriSpec:     { fontSize: 13, fontWeight: '600', marginTop: 1 },
  nutriCrn:      { fontSize: 11, fontWeight: '500', marginTop: 1 },
  ratingText:    { fontSize: 13, fontWeight: '800' },
  patientsText:  { fontSize: 11, fontWeight: '500' },
  nutriBio:      { fontSize: 13, lineHeight: 19, fontWeight: '500' },
  nutriFooter:   { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  badge:         { flexDirection: 'row', alignItems: 'center', gap: 5, borderRadius: 999, paddingHorizontal: 10, paddingVertical: 4 },
  badgeDot:      { width: 6, height: 6, borderRadius: 3 },
  badgeText:     { fontSize: 11, fontWeight: '700' },
  chatBtnGrad:   { borderRadius: 999, overflow: 'hidden' },
  chatBtnInner:  { flexDirection: 'row', alignItems: 'center', gap: 5, paddingHorizontal: 14, paddingVertical: 7 },
  chatBtnText:   { fontSize: 12, fontWeight: '800', color: '#fff' },
});

const cs = StyleSheet.create({
  header:        { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 16, paddingTop: 56, paddingBottom: 12, borderBottomWidth: 1, gap: 10 },
  backBtn:       { width: 36, height: 36, borderRadius: 12, alignItems: 'center', justifyContent: 'center' },
  headerAvatar:  { width: 38, height: 38, borderRadius: 12, alignItems: 'center', justifyContent: 'center' },
  headerTitle:   { fontSize: 15, fontWeight: '800' },
  headerSub:     { fontSize: 11, fontWeight: '500' },
  onlineDot:     { width: 10, height: 10, borderRadius: 5 },
  promptsScroll: { paddingVertical: 10, borderBottomWidth: 1 },
  promptCard:    { borderRadius: 14, paddingHorizontal: 14, paddingVertical: 9, borderWidth: 1 },
  promptText:    { fontSize: 13, fontWeight: '600' },
  msgRow:        { flexDirection: 'row', alignItems: 'flex-end', gap: 8, marginBottom: 4 },
  msgRowUser:    { flexDirection: 'row-reverse' },
  otherAvatar:   { width: 30, height: 30, borderRadius: 10, alignItems: 'center', justifyContent: 'center' },
  bubble:        { maxWidth: '75%', borderRadius: 18, padding: 12 },
  bubbleText:    { fontSize: 14, lineHeight: 20, fontWeight: '500' },
  bubbleTime:    { fontSize: 10, marginTop: 4, textAlign: 'right' },
  composer:      { flexDirection: 'row', alignItems: 'flex-end', gap: 10, padding: 12, paddingBottom: Platform.OS === 'ios' ? 28 : 12, borderTopWidth: 1 },
  composerInput: { flex: 1, borderRadius: 20, paddingHorizontal: 16, paddingVertical: 10, fontSize: 14, borderWidth: 1, maxHeight: 100 },
  sendBtn:       { width: 40, height: 40, borderRadius: 20, overflow: 'hidden' },
});
