import { useAuth } from '@/context/auth';
import { usePremiumTheme } from '@/context/theme';
import { ChatAPI, type ChatMessage } from '@/services/api';
import * as DocumentPicker from 'expo-document-picker';
import * as FileSystem from 'expo-file-system/legacy';
import * as ImagePicker from 'expo-image-picker';
import * as Sharing from 'expo-sharing';
import { useCallback, useEffect, useRef, useState } from 'react';
import { ActivityIndicator, Alert, FlatList, KeyboardAvoidingView, Platform, Pressable, StyleSheet, Text, TextInput, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';

const ALLOWED_TYPES = ['image/jpeg', 'image/png', 'image/webp', 'application/pdf', 'text/plain'];
const MAX_BYTES = 8 * 1024 * 1024;

export default function MessagesScreen() {
  const { user, vinculo } = useAuth();
  const { colors } = usePremiumTheme();
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [text, setText] = useState('');
  const [attachment, setAttachment] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const [error, setError] = useState('');
  const list = useRef<FlatList<ChatMessage>>(null);
  const linked = !!user?.id && vinculo?.status === 'ativo' && !!user.nutricionistaId;

  const refresh = useCallback(async () => {
    if (!linked) { setLoading(false); return; }
    try {
      const rows = await ChatAPI.messages();
      setMessages(rows); setError('');
    } catch (e: any) { setError(e?.message || 'Não foi possível carregar o chat.'); }
    finally { setLoading(false); }
  }, [linked]);

  useEffect(() => {
    void refresh();
    if (!linked) return;
    const timer = setInterval(() => void refresh(), 5000);
    return () => clearInterval(timer);
  }, [refresh, linked]);

  const addPicked = (asset: any) => {
    if (!asset) return;
    const type = asset.mimeType || asset.type || 'application/octet-stream';
    const size = asset.size ?? asset.fileSize;
    if (!ALLOWED_TYPES.includes(type.toLowerCase())) return Alert.alert('Formato não permitido', 'Escolha JPG, PNG, WEBP, PDF ou TXT.');
    if (size != null && size > MAX_BYTES) return Alert.alert('Arquivo muito grande', 'O limite por anexo é 8 MB.');
    setAttachment({ ...asset, mimeType: type });
  };

  const pickImage = async () => {
    try {
      const result = await ImagePicker.launchImageLibraryAsync({ mediaTypes: ['images'], quality: 0.85 });
      if (!result.canceled) addPicked(result.assets[0]);
    } catch { Alert.alert('Galeria indisponível', 'Não foi possível selecionar a foto.'); }
  };

  const pickFile = async () => {
    try {
      const result = await DocumentPicker.getDocumentAsync({ type: ALLOWED_TYPES, copyToCacheDirectory: true });
      if (!result.canceled) addPicked(result.assets[0]);
    } catch { Alert.alert('Arquivos indisponíveis', 'Não foi possível selecionar o arquivo.'); }
  };

  const send = async () => {
    if ((!text.trim() && !attachment) || sending) return;
    setSending(true); setError('');
    const form = new FormData();
    if (text.trim()) form.append('texto', text.trim());
    if (attachment) {
      const filePart = Platform.OS === 'web' && attachment.file
        ? attachment.file
        : { uri: attachment.uri, name: attachment.name || attachment.fileName || 'anexo', type: attachment.mimeType };
      form.append('arquivo', filePart as any);
    }
    try {
      await ChatAPI.send(form);
      setText(''); setAttachment(null);
      await refresh();
      setTimeout(() => list.current?.scrollToEnd({ animated: true }), 100);
    } catch (e: any) { setError(e?.message || 'Falha ao enviar a mensagem.'); }
    finally { setSending(false); }
  };

  const download = async (message: ChatMessage) => {
    try {
      const response = await ChatAPI.fetchAttachment(message.id);
      const blob = await response.blob();
      if (Platform.OS === 'web') {
        const url = URL.createObjectURL(blob);
        const anchor = document.createElement('a'); anchor.href = url; anchor.download = message.arquivoNome || 'anexo'; anchor.click();
        setTimeout(() => URL.revokeObjectURL(url), 30000);
        return;
      }
      const bytes = new Uint8Array(await blob.arrayBuffer());
      let binary = '';
      for (let i = 0; i < bytes.length; i += 0x8000) binary += String.fromCharCode(...bytes.subarray(i, i + 0x8000));
      const base64 = btoa(binary);
      const path = `${FileSystem.cacheDirectory}${(message.arquivoNome || 'anexo').replace(/[^a-zA-Z0-9._-]/g, '_')}`;
      await FileSystem.writeAsStringAsync(path, base64, { encoding: FileSystem.EncodingType.Base64 });
      if (await Sharing.isAvailableAsync()) await Sharing.shareAsync(path);
      else Alert.alert('Arquivo salvo', path);
    } catch (e: any) { setError(e?.message || 'Não foi possível abrir o anexo.'); }
  };

  const s = styles(colors);
  const renderMessage = ({ item }: { item: ChatMessage }) => {
    const mine = item.remetenteTipo === 'paciente';
    const isImage = item.arquivoTipo?.startsWith('image/');
    return <View style={[s.messageRow, mine ? s.mineRow : s.theirRow]}>
      <View style={[s.bubble, mine ? s.mineBubble : s.theirBubble]}>
        {!mine && <Text style={s.sender}>{item.remetenteNome}</Text>}
        {item.texto ? <Text style={s.messageText}>{item.texto}</Text> : null}
        {item.arquivoNome ? <Pressable onPress={() => void download(item)} style={s.fileCard} accessibilityRole="button" accessibilityLabel={`Abrir ${item.arquivoNome}`}>
          <Ionicons name={isImage ? 'image-outline' : 'document-text-outline'} size={22} color={colors.primaryDark} />
          <View style={{ flex: 1 }}><Text numberOfLines={1} style={s.fileName}>{item.arquivoNome}</Text><Text style={s.fileHint}>Toque para abrir ou compartilhar</Text></View>
          <Ionicons name="download-outline" size={19} color={colors.primaryDark} />
        </Pressable> : null}
        <Text style={s.time}>{new Date(item.criadoEm).toLocaleString('pt-BR', { dateStyle: 'short', timeStyle: 'short' })}</Text>
      </View>
    </View>;
  };

  if (!linked) return <SafeAreaView style={[s.page, { justifyContent: 'center', padding: 28 }]}>
    <View style={s.emptyCard}><Ionicons name="chatbubbles-outline" size={42} color={colors.primary} />
      <Text style={s.title}>Chat com nutricionista</Text>
      <Text style={s.subtitle}>{vinculo?.status === 'pendente' ? 'O chat será liberado quando o nutricionista aceitar seu vínculo.' : 'Vincule um nutricionista ao seu perfil para conversar por aqui.'}</Text>
    </View>
  </SafeAreaView>;

  return <SafeAreaView style={s.page} edges={['top', 'left', 'right']}>
    <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === 'ios' ? 'padding' : undefined} keyboardVerticalOffset={Platform.OS === 'ios' ? 8 : 0}>
      <View style={s.header}>
        <View style={s.avatar}><Ionicons name="person" size={21} color={colors.primaryDark} /></View>
        <View style={{ flex: 1 }}><Text style={s.title}>{vinculo?.nutricionista.nome || 'Nutricionista'}</Text><Text style={s.subtitle}>Seu nutricionista vinculado</Text></View>
        <View style={s.onlineDot} /><Text style={s.secure}>Privado</Text>
      </View>
      {loading ? <View style={s.loader}><ActivityIndicator color={colors.primary} /><Text style={s.subtitle}>Carregando conversa…</Text></View> :
        <FlatList ref={list} data={messages} keyExtractor={item => String(item.id)} renderItem={renderMessage} contentContainerStyle={s.list} onContentSizeChange={() => list.current?.scrollToEnd({ animated: false })} ListEmptyComponent={<Text style={s.emptyText}>Envie uma mensagem para iniciar sua conversa.</Text>} />}
      {error ? <Text style={s.error} accessibilityRole="alert">{error}</Text> : null}
      {attachment ? <View style={s.attachmentPreview}><Ionicons name="attach" size={18} color={colors.primaryDark} /><Text numberOfLines={1} style={{ flex: 1, color: colors.text }}>{attachment.name || attachment.fileName || 'Foto selecionada'}</Text><Pressable onPress={() => setAttachment(null)} accessibilityLabel="Remover anexo"><Ionicons name="close-circle" size={20} color={colors.textMuted} /></Pressable></View> : null}
      <View style={s.composer}>
        <Pressable onPress={() => void pickImage()} style={s.attachButton} accessibilityLabel="Anexar foto"><Ionicons name="image-outline" size={22} color={colors.primaryDark} /></Pressable>
        <Pressable onPress={() => void pickFile()} style={s.attachButton} accessibilityLabel="Anexar arquivo"><Ionicons name="attach" size={22} color={colors.primaryDark} /></Pressable>
        <TextInput value={text} onChangeText={setText} multiline maxLength={4000} placeholder="Mensagem…" placeholderTextColor={colors.textDim} style={s.input} accessibilityLabel="Escreva uma mensagem" />
        <Pressable onPress={() => void send()} disabled={sending || (!text.trim() && !attachment)} style={[s.sendButton, (sending || (!text.trim() && !attachment)) && { opacity: 0.5 }]} accessibilityLabel="Enviar mensagem">
          {sending ? <ActivityIndicator color="#fff" size="small" /> : <Ionicons name="send" size={19} color="#fff" />}
        </Pressable>
      </View>
    </KeyboardAvoidingView>
  </SafeAreaView>;
}

const styles = (c: ReturnType<typeof usePremiumTheme>['colors']) => StyleSheet.create({
  page: { flex: 1, backgroundColor: c.bg },
  header: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 18, paddingVertical: 13, borderBottomColor: c.border, borderBottomWidth: StyleSheet.hairlineWidth, gap: 10, backgroundColor: c.surface },
  avatar: { height: 42, width: 42, borderRadius: 21, backgroundColor: c.primarySoft, alignItems: 'center', justifyContent: 'center' },
  title: { color: c.text, fontSize: 17, fontWeight: '700' }, subtitle: { color: c.textMuted, fontSize: 12, marginTop: 3 },
  onlineDot: { width: 8, height: 8, borderRadius: 4, backgroundColor: c.success }, secure: { color: c.textMuted, fontSize: 11 },
  list: { paddingHorizontal: 14, paddingVertical: 18, flexGrow: 1, justifyContent: 'flex-end' },
  messageRow: { width: '100%', flexDirection: 'row', marginBottom: 10 }, mineRow: { justifyContent: 'flex-end' }, theirRow: { justifyContent: 'flex-start' },
  bubble: { maxWidth: '86%', borderRadius: 17, paddingHorizontal: 13, paddingTop: 10, paddingBottom: 7, borderWidth: 1, borderColor: c.border },
  mineBubble: { backgroundColor: c.bubbleMe, borderBottomRightRadius: 5 }, theirBubble: { backgroundColor: c.surface, borderBottomLeftRadius: 5 },
  sender: { color: c.primaryDark, fontSize: 11, fontWeight: '700', marginBottom: 4 }, messageText: { color: c.text, fontSize: 15, lineHeight: 21 },
  time: { color: c.textDim, fontSize: 10, textAlign: 'right', marginTop: 5 },
  fileCard: { flexDirection: 'row', alignItems: 'center', gap: 9, padding: 10, borderRadius: 12, backgroundColor: c.primarySoft, minWidth: 190, maxWidth: 270, marginTop: 3 },
  fileName: { color: c.text, fontSize: 13, fontWeight: '600' }, fileHint: { color: c.textMuted, fontSize: 10, marginTop: 2 },
  emptyCard: { alignItems: 'center', padding: 26, borderRadius: 22, backgroundColor: c.surface, borderWidth: 1, borderColor: c.border },
  emptyText: { textAlign: 'center', color: c.textMuted, marginTop: 20, alignSelf: 'center' },
  loader: { flex: 1, alignItems: 'center', justifyContent: 'center', gap: 10 },
  error: { color: c.danger, backgroundColor: c.dangerSoft, marginHorizontal: 12, padding: 9, borderRadius: 8, fontSize: 12 },
  attachmentPreview: { marginHorizontal: 12, marginBottom: 6, flexDirection: 'row', alignItems: 'center', gap: 7, padding: 9, backgroundColor: c.surface, borderColor: c.border, borderWidth: 1, borderRadius: 10 },
  composer: { flexDirection: 'row', alignItems: 'flex-end', padding: 10, gap: 6, borderTopColor: c.border, borderTopWidth: StyleSheet.hairlineWidth, backgroundColor: c.surface },
  attachButton: { width: 38, height: 42, alignItems: 'center', justifyContent: 'center' },
  input: { flex: 1, maxHeight: 110, minHeight: 42, paddingHorizontal: 14, paddingVertical: 10, color: c.text, backgroundColor: c.bg, borderWidth: 1, borderColor: c.border, borderRadius: 22, fontSize: 15 },
  sendButton: { width: 42, height: 42, borderRadius: 21, backgroundColor: c.primary, alignItems: 'center', justifyContent: 'center' },
});
