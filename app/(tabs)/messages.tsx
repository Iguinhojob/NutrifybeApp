import { usePremiumTheme } from '@/context/theme';
import { useMemo, useState } from 'react';
import { ScrollView, StyleSheet, Text, TextInput, TouchableOpacity, View, KeyboardAvoidingView, Platform } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

type Message = { id: number; text: string; from: 'user' | 'ai' | 'nutri'; time: string };

const AI_RESPONSES = [
  'Ótima pergunta! Com base no seu perfil, recomendo aumentar a ingestão de proteínas no café da manhã.',
  'Seu IMC está dentro da faixa saudável. Continue mantendo a consistência no plano alimentar!',
  'Para o seu objetivo de perder peso, um déficit de 300-400 kcal/dia é o ideal para resultados sustentáveis.',
  'Hidratação é fundamental! Tente beber pelo menos 2L de água por dia, especialmente antes das refeições.',
  'Que tal adicionar mais vegetais coloridos no almoço? Eles são ricos em fibras e micronutrientes.',
];

function getTime() {
  return new Date().toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' });
}

function AiChat({ colors, isDark }: { colors: any; isDark: boolean }) {
  const s = useMemo(() => chatStyles(colors, isDark), [colors, isDark]);
  const [messages, setMessages] = useState<Message[]>([
    { id: 1, text: 'Olá! Sou a NutrIA, sua assistente de nutrição. Como posso ajudar hoje?', from: 'ai', time: getTime() },
  ]);
  const [input, setInput] = useState('');
  const [mode, setMode] = useState<'nutria' | 'padrao'>('nutria');
  const [typing, setTyping] = useState(false);

  const PROMPTS = ['Como melhorar minha dieta?', 'Calcular meu IMC', 'Sugestão de lanche saudável', 'Dicas de hidratação'];

  const send = (text?: string) => {
    const msg = text || input.trim();
    if (!msg) return;
    const userMsg: Message = { id: Date.now(), text: msg, from: 'user', time: getTime() };
    setMessages(prev => [...prev, userMsg]);
    setInput('');
    setTyping(true);
    setTimeout(() => {
      const reply = AI_RESPONSES[Math.floor(Math.random() * AI_RESPONSES.length)];
      setMessages(prev => [...prev, { id: Date.now() + 1, text: reply, from: 'ai', time: getTime() }]);
      setTyping(false);
    }, 1200);
  };

  return (
    <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
      {/* Orb visual */}
      {messages.length === 1 && (
        <View style={s.orbWrap}>
          <View style={s.orb}>
            <View style={s.orbInner} />
            <View style={[s.orbHighlight, { top: 8, left: 12 }]} />
            <View style={[s.orbHighlight, { bottom: 10, right: 10, width: 12, height: 12, opacity: 0.3 }]} />
          </View>
          <Text style={s.orbLabel}>NutrIA</Text>
          <Text style={s.orbSub}>Modo {mode === 'nutria' ? 'Consultivo' : 'Direto'}</Text>
        </View>
      )}

      {/* Chips de modo */}
      <View style={s.modeRow}>
        {(['nutria', 'padrao'] as const).map(m => (
          <TouchableOpacity key={m} style={[s.modeChip, mode === m && s.modeChipActive]} onPress={() => setMode(m)}>
            <Text style={[s.modeChipText, mode === m && s.modeChipTextActive]}>
              {m === 'nutria' ? '✦ Modo NutrIA' : 'Padrão'}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      {/* Prompt cards */}
      {messages.length === 1 && (
        <ScrollView horizontal showsHorizontalScrollIndicator={false} style={s.promptsScroll}>
          {PROMPTS.map(p => (
            <TouchableOpacity key={p} style={s.promptCard} onPress={() => send(p)}>
              <Text style={s.promptText}>{p}</Text>
            </TouchableOpacity>
          ))}
        </ScrollView>
      )}

      {/* Mensagens */}
      <ScrollView style={s.msgList} contentContainerStyle={{ padding: 16, gap: 10 }}>
        {messages.map(m => (
          <View key={m.id} style={[s.msgRow, m.from === 'user' && s.msgRowUser]}>
            {m.from !== 'user' && (
              <View style={s.aiAvatar}>
                <Ionicons name="sparkles" size={14} color={colors.purpleAccent} />
              </View>
            )}
            <View style={[s.bubble, m.from === 'user' ? s.bubbleUser : s.bubbleAi]}>
              <Text style={[s.bubbleText, m.from === 'user' && s.bubbleTextUser]}>{m.text}</Text>
              <Text style={s.bubbleTime}>{m.time}</Text>
            </View>
          </View>
        ))}
        {typing && (
          <View style={s.msgRow}>
            <View style={s.aiAvatar}><Ionicons name="sparkles" size={14} color={colors.purpleAccent} /></View>
            <View style={s.bubbleAi}>
              <Text style={s.typingDots}>● ● ●</Text>
            </View>
          </View>
        )}
      </ScrollView>

      {/* Composer */}
      <View style={s.composer}>
        <TextInput
          style={s.composerInput}
          placeholder="Pergunte à NutrIA..."
          value={input}
          onChangeText={setInput}
          placeholderTextColor={colors.textDim}
          onSubmitEditing={() => send()}
        />
        <TouchableOpacity style={s.sendBtn} onPress={() => send()}>
          <Ionicons name="arrow-up" size={18} color={colors.bg} />
        </TouchableOpacity>
      </View>
    </KeyboardAvoidingView>
  );
}

export default function MessagesHubScreen() {
  const { colors, isDark } = usePremiumTheme();
  const s = useMemo(() => createStyles(colors, isDark), [colors, isDark]);
  const [tab, setTab] = useState<'hub' | 'ai' | 'nutri'>('hub');

  if (tab === 'ai') {
    return (
      <View style={s.screen}>
        <View style={s.chatHeader}>
          <TouchableOpacity onPress={() => setTab('hub')} style={s.backBtn}>
            <Ionicons name="arrow-back" size={20} color={colors.text} />
          </TouchableOpacity>
          <Text style={s.chatHeaderTitle}>NutrIA</Text>
          <View style={[s.onlineDot, { backgroundColor: colors.primary }]} />
        </View>
        <AiChat colors={colors} isDark={isDark} />
      </View>
    );
  }

  if (tab === 'nutri') {
    return (
      <View style={s.screen}>
        <View style={s.chatHeader}>
          <TouchableOpacity onPress={() => setTab('hub')} style={s.backBtn}>
            <Ionicons name="arrow-back" size={20} color={colors.text} />
          </TouchableOpacity>
          <Text style={s.chatHeaderTitle}>Nutricionista</Text>
          <View style={[s.onlineDot, { backgroundColor: '#FFC107' }]} />
        </View>
        <View style={s.nutriPlaceholder}>
          <Ionicons name="person-circle-outline" size={64} color={colors.textDim} />
          <Text style={s.nutriTitle}>Nenhum nutricionista vinculado</Text>
          <Text style={s.nutriSub}>Busque um nutricionista para iniciar o acompanhamento personalizado.</Text>
          <TouchableOpacity style={[s.findBtn, { backgroundColor: colors.ctaContrastBg }]}>
            <Text style={[s.findBtnText, { color: colors.ctaContrastText }]}>Buscar nutricionista</Text>
          </TouchableOpacity>
        </View>
      </View>
    );
  }

  return (
    <View style={s.screen}>
      <ScrollView contentContainerStyle={s.scroll}>
        <Text style={s.title}>Mensagens</Text>
        <Text style={s.subtitle}>Seu hub de comunicação</Text>

        <TouchableOpacity style={[s.hubCard, { backgroundColor: colors.aiBannerBg, borderColor: colors.aiBannerBorder }]} onPress={() => setTab('ai')}>
          <View style={s.hubCardIcon}>
            <Ionicons name="sparkles" size={28} color={colors.purpleAccent} />
          </View>
          <View style={s.hubCardInfo}>
            <Text style={[s.hubCardTitle, { color: colors.text }]}>NutrIA</Text>
            <Text style={[s.hubCardSub, { color: colors.textMuted }]}>Assistente de nutrição com IA</Text>
            <View style={[s.onlineBadge, { backgroundColor: colors.primary + '20' }]}>
              <View style={[s.onlineDot, { backgroundColor: colors.primary }]} />
              <Text style={[s.onlineBadgeText, { color: colors.primary }]}>Online agora</Text>
            </View>
          </View>
          <Ionicons name="chevron-forward" size={20} color={colors.textMuted} />
        </TouchableOpacity>

        <TouchableOpacity style={[s.hubCard, { backgroundColor: colors.surface, borderColor: colors.border }]} onPress={() => setTab('nutri')}>
          <View style={[s.hubCardIcon, { backgroundColor: colors.surface3 }]}>
            <Ionicons name="person-outline" size={28} color={colors.text} />
          </View>
          <View style={s.hubCardInfo}>
            <Text style={[s.hubCardTitle, { color: colors.text }]}>Nutricionista</Text>
            <Text style={[s.hubCardSub, { color: colors.textMuted }]}>Acompanhamento personalizado</Text>
            <View style={[s.onlineBadge, { backgroundColor: '#FFC10720' }]}>
              <View style={[s.onlineDot, { backgroundColor: '#FFC107' }]} />
              <Text style={[s.onlineBadgeText, { color: '#FFC107' }]}>Aguardando vínculo</Text>
            </View>
          </View>
          <Ionicons name="chevron-forward" size={20} color={colors.textMuted} />
        </TouchableOpacity>
      </ScrollView>
    </View>
  );
}

function createStyles(colors: any, isDark: boolean) {
  return StyleSheet.create({
    screen: { flex: 1, backgroundColor: colors.bg },
    scroll: { padding: 20, paddingTop: 56, gap: 14 },
    title: { fontSize: 26, fontWeight: '900', color: colors.text, letterSpacing: -1 },
    subtitle: { fontSize: 14, color: colors.textMuted, fontWeight: '500', marginBottom: 8 },
    hubCard: { flexDirection: 'row', alignItems: 'center', borderRadius: 20, padding: 18, borderWidth: 1, gap: 14 },
    hubCardIcon: { width: 56, height: 56, borderRadius: 18, backgroundColor: colors.purpleSoft, alignItems: 'center', justifyContent: 'center' },
    hubCardInfo: { flex: 1, gap: 4 },
    hubCardTitle: { fontSize: 17, fontWeight: '800' },
    hubCardSub: { fontSize: 13, fontWeight: '500' },
    onlineBadge: { flexDirection: 'row', alignItems: 'center', gap: 5, borderRadius: 999, paddingHorizontal: 8, paddingVertical: 3, alignSelf: 'flex-start' },
    onlineDot: { width: 6, height: 6, borderRadius: 3 },
    onlineBadgeText: { fontSize: 11, fontWeight: '700' },
    chatHeader: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 20, paddingTop: 56, paddingBottom: 12, backgroundColor: colors.bg, borderBottomWidth: 1, borderBottomColor: colors.border, gap: 12 },
    backBtn: { width: 36, height: 36, borderRadius: 12, backgroundColor: colors.surface, alignItems: 'center', justifyContent: 'center' },
    chatHeaderTitle: { flex: 1, fontSize: 17, fontWeight: '800', color: colors.text },
    nutriPlaceholder: { flex: 1, alignItems: 'center', justifyContent: 'center', padding: 32, gap: 12 },
    nutriTitle: { fontSize: 18, fontWeight: '800', color: colors.text, textAlign: 'center' },
    nutriSub: { fontSize: 14, color: colors.textMuted, textAlign: 'center', lineHeight: 22 },
    findBtn: { borderRadius: 999, paddingHorizontal: 24, paddingVertical: 14, marginTop: 8 },
    findBtnText: { fontSize: 15, fontWeight: '800' },
  });
}

function chatStyles(colors: any, isDark: boolean) {
  return StyleSheet.create({
    orbWrap: { alignItems: 'center', paddingTop: 24, paddingBottom: 8, gap: 8 },
    orb: { width: 80, height: 80, borderRadius: 40, backgroundColor: colors.purpleSoft, alignItems: 'center', justifyContent: 'center', position: 'relative' },
    orbInner: { width: 60, height: 60, borderRadius: 30, backgroundColor: colors.purpleAccent, opacity: 0.6 },
    orbHighlight: { position: 'absolute', width: 18, height: 18, borderRadius: 9, backgroundColor: '#fff', opacity: 0.5 },
    orbLabel: { fontSize: 16, fontWeight: '900', color: colors.text },
    orbSub: { fontSize: 12, color: colors.textMuted, fontWeight: '600' },
    modeRow: { flexDirection: 'row', gap: 8, paddingHorizontal: 16, paddingBottom: 8 },
    modeChip: { paddingHorizontal: 14, paddingVertical: 7, borderRadius: 999, backgroundColor: colors.surface, borderWidth: 1, borderColor: colors.border },
    modeChipActive: { backgroundColor: colors.purpleSoft, borderColor: colors.purpleAccent },
    modeChipText: { fontSize: 12, fontWeight: '700', color: colors.textMuted },
    modeChipTextActive: { color: colors.text },
    promptsScroll: { paddingHorizontal: 16, marginBottom: 8 },
    promptCard: { backgroundColor: colors.surface, borderRadius: 14, paddingHorizontal: 14, paddingVertical: 10, marginRight: 8, borderWidth: 1, borderColor: colors.border },
    promptText: { fontSize: 13, fontWeight: '600', color: colors.text },
    msgList: { flex: 1 },
    msgRow: { flexDirection: 'row', alignItems: 'flex-end', gap: 8 },
    msgRowUser: { flexDirection: 'row-reverse' },
    aiAvatar: { width: 28, height: 28, borderRadius: 10, backgroundColor: colors.purpleSoft, alignItems: 'center', justifyContent: 'center' },
    bubble: { maxWidth: '75%', borderRadius: 18, padding: 12 },
    bubbleAi: { backgroundColor: colors.surface, borderWidth: 1, borderColor: colors.border },
    bubbleUser: { backgroundColor: colors.bubbleMe },
    bubbleText: { fontSize: 14, color: colors.text, lineHeight: 20, fontWeight: '500' },
    bubbleTextUser: { color: colors.text },
    bubbleTime: { fontSize: 10, color: colors.textDim, marginTop: 4, textAlign: 'right' },
    typingDots: { fontSize: 16, color: colors.purpleAccent, letterSpacing: 4 },
    composer: { flexDirection: 'row', alignItems: 'center', gap: 10, padding: 16, borderTopWidth: 1, borderTopColor: colors.border, backgroundColor: colors.bg },
    composerInput: { flex: 1, backgroundColor: colors.surface, borderRadius: 999, paddingHorizontal: 16, paddingVertical: 10, fontSize: 14, color: colors.text, borderWidth: 1, borderColor: colors.border },
    sendBtn: { width: 40, height: 40, borderRadius: 20, backgroundColor: colors.text, alignItems: 'center', justifyContent: 'center' },
  });
}
