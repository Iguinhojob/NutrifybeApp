import { usePremiumTheme } from '@/context/theme';
import { useMemo, useRef, useState } from 'react';
import {
  FlatList, Image, KeyboardAvoidingView, Platform,
  ScrollView, StyleSheet, Text, TextInput,
  TouchableOpacity, View,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';

// ─── Dados de exemplo ────────────────────────────────────────────────────────
const NUTRITIONISTS = [
  {
    id: '1',
    name: 'Dra. Ana Beatriz',
    specialty: 'Nutrição Esportiva',
    crn: 'CRN-3 12345',
    rating: 4.9,
    patients: 128,
    online: true,
    avatar: '👩‍⚕️',
    bio: 'Especialista em nutrição esportiva e emagrecimento. 8 anos de experiência.',
    initialMsg: 'Olá! Sou a Dra. Ana Beatriz, sua nutricionista. Como posso ajudar você hoje?',
  },
  {
    id: '2',
    name: 'Dr. Carlos Mendes',
    specialty: 'Nutrição Clínica',
    crn: 'CRN-3 67890',
    rating: 4.7,
    patients: 95,
    online: false,
    avatar: '👨‍⚕️',
    bio: 'Foco em doenças crônicas, diabetes e hipertensão. Atendimento humanizado.',
    initialMsg: 'Oi! Sou o Dr. Carlos. Estou aqui para te ajudar a alcançar seus objetivos nutricionais!',
  },
  {
    id: '3',
    name: 'Dra. Fernanda Lima',
    specialty: 'Nutrição Funcional',
    crn: 'CRN-3 54321',
    rating: 4.8,
    patients: 210,
    online: true,
    avatar: '👩‍💼',
    bio: 'Nutrição funcional e integrativa. Especialista em saúde intestinal e imunidade.',
    initialMsg: 'Olá! Sou a Dra. Fernanda. Vamos trabalhar juntos para melhorar sua saúde de forma integral?',
  },
];

const NUTRI_RESPONSES: Record<string, string[]> = {
  '1': [
    'Para seu treino, recomendo aumentar a ingestão de carboidratos complexos 1h antes do exercício.',
    'A proteína pós-treino é essencial! Tente consumir 20-30g em até 30 minutos após o exercício.',
    'Hidratação é chave para a performance. Beba pelo menos 500ml antes de treinar.',
    'Seu plano está ótimo! Vamos ajustar as calorias conforme sua evolução.',
  ],
  '2': [
    'Para controle glicêmico, prefira alimentos de baixo índice glicêmico nas refeições principais.',
    'Reduza o sódio gradualmente — isso ajuda muito no controle da pressão arterial.',
    'Fibras solúveis são suas aliadas! Aveia, maçã e leguminosas são ótimas opções.',
    'Vamos revisar seus exames na próxima consulta para ajustar o plano.',
  ],
  '3': [
    'A saúde intestinal é a base de tudo. Inclua probióticos naturais como kefir e iogurte.',
    'Alimentos anti-inflamatórios como cúrcuma, gengibre e ômega-3 fazem toda a diferença.',
    'Seu microbioma agradece quando você varia os vegetais. Tente comer pelo menos 30 tipos por semana!',
    'Vamos trabalhar na permeabilidade intestinal com uma dieta rica em prebióticos.',
  ],
};

const AI_RESPONSES = [
  'Com base no seu perfil, recomendo aumentar a ingestão de proteínas no café da manhã.',
  'Seu IMC está dentro da faixa saudável. Continue mantendo a consistência no plano!',
  'Para perder peso, um déficit de 300-400 kcal/dia é ideal para resultados sustentáveis.',
  'Hidratação é fundamental! Beba pelo menos 2L de água por dia, especialmente antes das refeições.',
  'Que tal adicionar mais vegetais coloridos no almoço? São ricos em fibras e micronutrientes.',
  'O sono de qualidade é essencial para o metabolismo. Tente dormir 7-8h por noite.',
  'Mastigar devagar ajuda na digestão e na saciedade. Tente 20 mastigadas por garfada!',
];

type Msg = { id: number; text: string; from: 'user' | 'other'; time: string };

function getTime() {
  return new Date().toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' });
}

// ─── Chat genérico ────────────────────────────────────────────────────────────
function ChatScreen({
  title, subtitle, avatar, isAI, responses, initialMsg, colors, isDark, onBack,
}: {
  title: string; subtitle: string; avatar: string; isAI?: boolean;
  responses: string[]; initialMsg: string;
  colors: any; isDark: boolean; onBack: () => void;
}) {
  const s = useMemo(() => chatStyles(colors, isDark), [colors, isDark]);
  const [messages, setMessages] = useState<Msg[]>([
    { id: 1, text: initialMsg, from: 'other', time: getTime() },
  ]);
  const [input, setInput] = useState('');
  const [typing, setTyping] = useState(false);
  const listRef = useRef<FlatList>(null);

  const PROMPTS = isAI
    ? ['Como melhorar minha dieta?', 'Sugestão de lanche', 'Dicas de hidratação', 'Calcular calorias']
    : ['Revisar meu plano', 'Tenho uma dúvida', 'Ajustar refeições', 'Próxima consulta'];

  const send = (text?: string) => {
    const msg = (text ?? input).trim();
    if (!msg) return;
    const userMsg: Msg = { id: Date.now(), text: msg, from: 'user', time: getTime() };
    setMessages(prev => [...prev, userMsg]);
    setInput('');
    setTyping(true);
    setTimeout(() => {
      const reply = responses[Math.floor(Math.random() * responses.length)];
      setMessages(prev => [...prev, { id: Date.now() + 1, text: reply, from: 'other', time: getTime() }]);
      setTyping(false);
      setTimeout(() => listRef.current?.scrollToEnd({ animated: true }), 100);
    }, 1000 + Math.random() * 800);
  };

  return (
    <KeyboardAvoidingView style={{ flex: 1, backgroundColor: colors.bg }} behavior={Platform.OS === 'ios' ? 'padding' : 'height'}>
      {/* Header */}
      <View style={s.header}>
        <TouchableOpacity onPress={onBack} style={s.backBtn}>
          <Ionicons name="arrow-back" size={20} color={colors.text} />
        </TouchableOpacity>
        <View style={s.headerAvatar}>
          <Text style={{ fontSize: 22 }}>{avatar}</Text>
        </View>
        <View style={s.headerInfo}>
          <Text style={s.headerTitle}>{title}</Text>
          <Text style={s.headerSub}>{subtitle}</Text>
        </View>
        <View style={[s.onlineDot, { backgroundColor: isAI ? colors.primary : '#F59E0B' }]} />
      </View>

      {/* Prompt cards (só antes de enviar) */}
      {messages.length === 1 && (
        <ScrollView horizontal showsHorizontalScrollIndicator={false} style={s.promptsScroll} contentContainerStyle={{ paddingHorizontal: 16, gap: 8 }}>
          {PROMPTS.map(p => (
            <TouchableOpacity key={p} style={s.promptCard} onPress={() => send(p)}>
              <Text style={s.promptText}>{p}</Text>
            </TouchableOpacity>
          ))}
        </ScrollView>
      )}

      {/* Mensagens */}
      <FlatList
        ref={listRef}
        data={messages}
        keyExtractor={m => String(m.id)}
        contentContainerStyle={{ padding: 16, gap: 10 }}
        onContentSizeChange={() => listRef.current?.scrollToEnd({ animated: true })}
        renderItem={({ item: m }) => (
          <View style={[s.msgRow, m.from === 'user' && s.msgRowUser]}>
            {m.from !== 'user' && (
              <View style={s.otherAvatar}>
                <Text style={{ fontSize: 14 }}>{avatar}</Text>
              </View>
            )}
            <View style={[s.bubble, m.from === 'user' ? s.bubbleUser : s.bubbleOther]}>
              <Text style={[s.bubbleText, m.from === 'user' && s.bubbleTextUser]}>{m.text}</Text>
              <Text style={s.bubbleTime}>{m.time}</Text>
            </View>
          </View>
        )}
        ListFooterComponent={typing ? (
          <View style={s.msgRow}>
            <View style={s.otherAvatar}><Text style={{ fontSize: 14 }}>{avatar}</Text></View>
            <View style={s.bubbleOther}>
              <Text style={[s.bubbleText, { letterSpacing: 3 }]}>● ● ●</Text>
            </View>
          </View>
        ) : null}
      />

      {/* Composer */}
      <View style={s.composer}>
        <TextInput
          style={s.composerInput}
          placeholder="Digite uma mensagem..."
          value={input}
          onChangeText={setInput}
          placeholderTextColor={colors.textDim}
          onSubmitEditing={() => send()}
          returnKeyType="send"
          multiline
        />
        <TouchableOpacity style={[s.sendBtn, { opacity: input.trim() ? 1 : 0.4 }]} onPress={() => send()}>
          <Ionicons name="arrow-up" size={18} color={colors.bg} />
        </TouchableOpacity>
      </View>
    </KeyboardAvoidingView>
  );
}

// ─── Tela principal ───────────────────────────────────────────────────────────
type View_ = 'hub' | 'ai' | { nutriId: string };

export default function MessagesHubScreen() {
  const { colors, isDark } = usePremiumTheme();
  const s = useMemo(() => createStyles(colors, isDark), [colors, isDark]);
  const [view, setView] = useState<View_>('hub');

  // Chat NutrIA
  if (view === 'ai') {
    return (
      <ChatScreen
        title="NutrIA"
        subtitle="Assistente de IA · Online"
        avatar="✦"
        isAI
        responses={AI_RESPONSES}
        initialMsg="Olá! Sou a NutrIA, sua assistente de nutrição inteligente. Como posso ajudar hoje?"
        colors={colors}
        isDark={isDark}
        onBack={() => setView('hub')}
      />
    );
  }

  // Chat com nutricionista
  if (typeof view === 'object' && 'nutriId' in view) {
    const nutri = NUTRITIONISTS.find(n => n.id === view.nutriId)!;
    return (
      <ChatScreen
        title={nutri.name}
        subtitle={`${nutri.specialty} · ${nutri.online ? 'Online' : 'Offline'}`}
        avatar={nutri.avatar}
        responses={NUTRI_RESPONSES[nutri.id]}
        initialMsg={nutri.initialMsg}
        colors={colors}
        isDark={isDark}
        onBack={() => setView('hub')}
      />
    );
  }

  // Hub principal
  return (
    <View style={s.screen}>
      <ScrollView contentContainerStyle={s.scroll} showsVerticalScrollIndicator={false}>
        <Text style={s.title}>Mensagens</Text>
        <Text style={s.subtitle}>Seu hub de comunicação</Text>

        {/* NutrIA */}
        <TouchableOpacity
          style={[s.hubCard, { backgroundColor: colors.aiBannerBg, borderColor: colors.aiBannerBorder }]}
          onPress={() => setView('ai')}
        >
          <View style={[s.hubAvatar, { backgroundColor: colors.purpleSoft }]}>
            <Ionicons name="sparkles" size={26} color={colors.purpleAccent} />
          </View>
          <View style={s.hubInfo}>
            <Text style={s.hubName}>NutrIA</Text>
            <Text style={s.hubSpec}>Assistente de nutrição com IA</Text>
            <View style={[s.badge, { backgroundColor: colors.primary + '20' }]}>
              <View style={[s.badgeDot, { backgroundColor: colors.primary }]} />
              <Text style={[s.badgeText, { color: colors.primary }]}>Online agora</Text>
            </View>
          </View>
          <Ionicons name="chevron-forward" size={18} color={colors.textDim} />
        </TouchableOpacity>

        {/* Nutricionistas */}
        <Text style={s.sectionTitle}>Nutricionistas disponíveis</Text>
        {NUTRITIONISTS.map(n => (
          <TouchableOpacity
            key={n.id}
            style={[s.nutriCard, { backgroundColor: colors.surface, borderColor: colors.border }]}
            onPress={() => setView({ nutriId: n.id })}
          >
            <View style={s.nutriTop}>
              <View style={[s.nutriAvatar, { backgroundColor: colors.purpleSoft }]}>
                <Text style={{ fontSize: 28 }}>{n.avatar}</Text>
                {n.online && <View style={s.onlineIndicator} />}
              </View>
              <View style={s.nutriInfo}>
                <Text style={s.nutriName}>{n.name}</Text>
                <Text style={s.nutriSpec}>{n.specialty}</Text>
                <Text style={s.nutriCrn}>{n.crn}</Text>
              </View>
              <View style={s.nutriStats}>
                <View style={s.ratingRow}>
                  <Ionicons name="star" size={12} color={colors.gold} />
                  <Text style={s.ratingText}>{n.rating}</Text>
                </View>
                <Text style={s.patientsText}>{n.patients} pacientes</Text>
              </View>
            </View>
            <Text style={s.nutriBio}>{n.bio}</Text>
            <View style={s.nutriFooter}>
              <View style={[s.badge, { backgroundColor: n.online ? colors.primary + '20' : colors.border }]}>
                <View style={[s.badgeDot, { backgroundColor: n.online ? colors.primary : colors.textDim }]} />
                <Text style={[s.badgeText, { color: n.online ? colors.primary : colors.textMuted }]}>
                  {n.online ? 'Online' : 'Offline'}
                </Text>
              </View>
              <View style={[s.chatBtn, { backgroundColor: colors.ctaContrastBg }]}>
                <Ionicons name="chatbubble-outline" size={13} color={colors.ctaContrastText} />
                <Text style={[s.chatBtnText, { color: colors.ctaContrastText }]}>Iniciar chat</Text>
              </View>
            </View>
          </TouchableOpacity>
        ))}

        <View style={{ height: 100 }} />
      </ScrollView>
    </View>
  );
}

// ─── Estilos ──────────────────────────────────────────────────────────────────
function createStyles(colors: any, isDark: boolean) {
  return StyleSheet.create({
    screen:       { flex: 1, backgroundColor: colors.bg },
    scroll:       { padding: 20, paddingTop: 56, gap: 12 },
    title:        { fontSize: 26, fontWeight: '900', color: colors.text, letterSpacing: -1 },
    subtitle:     { fontSize: 14, color: colors.textMuted, fontWeight: '500', marginBottom: 4 },
    sectionTitle: { fontSize: 13, fontWeight: '800', color: colors.textMuted, textTransform: 'uppercase', letterSpacing: 0.8, marginTop: 4 },
    hubCard:      { flexDirection: 'row', alignItems: 'center', borderRadius: 20, padding: 16, borderWidth: 1, gap: 14 },
    hubAvatar:    { width: 52, height: 52, borderRadius: 16, alignItems: 'center', justifyContent: 'center' },
    hubInfo:      { flex: 1, gap: 4 },
    hubName:      { fontSize: 16, fontWeight: '800', color: colors.text },
    hubSpec:      { fontSize: 13, color: colors.textMuted, fontWeight: '500' },
    nutriCard:    { borderRadius: 20, padding: 16, borderWidth: 1, gap: 10 },
    nutriTop:     { flexDirection: 'row', gap: 12, alignItems: 'flex-start' },
    nutriAvatar:  { width: 56, height: 56, borderRadius: 18, alignItems: 'center', justifyContent: 'center', position: 'relative' },
    onlineIndicator: { position: 'absolute', bottom: 2, right: 2, width: 12, height: 12, borderRadius: 6, backgroundColor: '#22C55E', borderWidth: 2, borderColor: '#fff' },
    nutriInfo:    { flex: 1 },
    nutriName:    { fontSize: 15, fontWeight: '800', color: colors.text },
    nutriSpec:    { fontSize: 13, color: colors.purpleAccent, fontWeight: '600', marginTop: 1 },
    nutriCrn:     { fontSize: 11, color: colors.textDim, fontWeight: '500', marginTop: 1 },
    nutriStats:   { alignItems: 'flex-end', gap: 4 },
    ratingRow:    { flexDirection: 'row', alignItems: 'center', gap: 3 },
    ratingText:   { fontSize: 13, fontWeight: '800', color: colors.text },
    patientsText: { fontSize: 11, color: colors.textMuted, fontWeight: '500' },
    nutriBio:     { fontSize: 13, color: colors.textMuted, lineHeight: 19, fontWeight: '500' },
    nutriFooter:  { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
    badge:        { flexDirection: 'row', alignItems: 'center', gap: 5, borderRadius: 999, paddingHorizontal: 10, paddingVertical: 4 },
    badgeDot:     { width: 6, height: 6, borderRadius: 3 },
    badgeText:    { fontSize: 11, fontWeight: '700' },
    chatBtn:      { flexDirection: 'row', alignItems: 'center', gap: 5, borderRadius: 999, paddingHorizontal: 14, paddingVertical: 7 },
    chatBtnText:  { fontSize: 12, fontWeight: '800' },
  });
}

function chatStyles(colors: any, isDark: boolean) {
  return StyleSheet.create({
    header:       { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 16, paddingTop: 56, paddingBottom: 12, backgroundColor: colors.bg, borderBottomWidth: 1, borderBottomColor: colors.border, gap: 10 },
    backBtn:      { width: 36, height: 36, borderRadius: 12, backgroundColor: colors.surface, alignItems: 'center', justifyContent: 'center' },
    headerAvatar: { width: 38, height: 38, borderRadius: 12, backgroundColor: colors.purpleSoft, alignItems: 'center', justifyContent: 'center' },
    headerInfo:   { flex: 1 },
    headerTitle:  { fontSize: 15, fontWeight: '800', color: colors.text },
    headerSub:    { fontSize: 11, color: colors.textMuted, fontWeight: '500' },
    onlineDot:    { width: 10, height: 10, borderRadius: 5 },
    promptsScroll:{ paddingVertical: 10, borderBottomWidth: 1, borderBottomColor: colors.border },
    promptCard:   { backgroundColor: colors.surface, borderRadius: 14, paddingHorizontal: 14, paddingVertical: 9, borderWidth: 1, borderColor: colors.border },
    promptText:   { fontSize: 13, fontWeight: '600', color: colors.text },
    msgRow:       { flexDirection: 'row', alignItems: 'flex-end', gap: 8, marginBottom: 4 },
    msgRowUser:   { flexDirection: 'row-reverse' },
    otherAvatar:  { width: 30, height: 30, borderRadius: 10, backgroundColor: colors.purpleSoft, alignItems: 'center', justifyContent: 'center' },
    bubble:       { maxWidth: '75%', borderRadius: 18, padding: 12 },
    bubbleOther:  { backgroundColor: colors.surface, borderWidth: 1, borderColor: colors.border },
    bubbleUser:   { backgroundColor: colors.primary },
    bubbleText:   { fontSize: 14, color: colors.text, lineHeight: 20, fontWeight: '500' },
    bubbleTextUser:{ color: '#fff' },
    bubbleTime:   { fontSize: 10, color: colors.textDim, marginTop: 4, textAlign: 'right' },
    composer:     { flexDirection: 'row', alignItems: 'flex-end', gap: 10, padding: 12, paddingBottom: Platform.OS === 'ios' ? 28 : 12, borderTopWidth: 1, borderTopColor: colors.border, backgroundColor: colors.bg },
    composerInput:{ flex: 1, backgroundColor: colors.surface, borderRadius: 20, paddingHorizontal: 16, paddingVertical: 10, fontSize: 14, color: colors.text, borderWidth: 1, borderColor: colors.border, maxHeight: 100 },
    sendBtn:      { width: 40, height: 40, borderRadius: 20, backgroundColor: colors.text, alignItems: 'center', justifyContent: 'center' },
  });
}
