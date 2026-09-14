import { useAuth } from '@/context/auth';
import { usePremiumTheme } from '@/context/theme';
import { router } from 'expo-router';
import { useEffect, useState } from 'react';
import { Alert, KeyboardAvoidingView, Modal, Platform, ScrollView, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { GRAD } from '@/constants/darkTheme';

export default function ProfileScreen() {
  const { user, updateUser, logout } = useAuth();
  const { colors, isDark, toggleTheme } = usePremiumTheme();
  const [editing, setEditing]         = useState(false);
  const [logoutModal, setLogoutModal] = useState(false);
  const [form, setForm] = useState({ name: '', weight: '', height: '', goal: '', targetWeight: '', waterGoal: '' });

  useEffect(() => {
    if (user) setForm({ name: user.name || '', weight: user.weight || '', height: user.height || '', goal: user.goal || '', targetWeight: user.targetWeight || '', waterGoal: user.waterGoal || '' });
  }, [user]);

  const set = (key: string) => (val: string) => setForm(f => ({ ...f, [key]: val }));
  const save = () => { if (!form.name.trim()) return Alert.alert('Erro', 'Nome não pode ser vazio.'); updateUser(form); setEditing(false); Alert.alert('Sucesso', 'Perfil atualizado!'); };
  const cancelEdit = () => { if (user) setForm({ name: user.name || '', weight: user.weight || '', height: user.height || '', goal: user.goal || '', targetWeight: user.targetWeight || '', waterGoal: user.waterGoal || '' }); setEditing(false); };
  const handleLogout = () => { logout(); router.replace('/auth/login'); };
  const bmi = user?.weight && user?.height ? (parseFloat(user.weight) / Math.pow(parseFloat(user.height) / 100, 2)).toFixed(1) : '—';

  const FIELDS = [
    { key: 'name',         label: 'Nome',            keyboard: 'default' as const },
    { key: 'weight',       label: 'Peso (kg)',        keyboard: 'numeric' as const },
    { key: 'height',       label: 'Altura (cm)',      keyboard: 'numeric' as const },
    { key: 'targetWeight', label: 'Peso meta (kg)',   keyboard: 'numeric' as const },
    { key: 'waterGoal',    label: 'Meta de água (L)', keyboard: 'numeric' as const },
    { key: 'goal',         label: 'Objetivo',         keyboard: 'default' as const },
  ];

  const menuItems = [
    { icon: 'sunny-outline'              as const, label: isDark ? 'Modo claro' : 'Modo escuro', onPress: toggleTheme },
    { icon: 'settings-outline'           as const, label: 'Configurações',           onPress: () => router.push('/institutional/settings') },
    { icon: 'information-circle-outline' as const, label: 'Sobre Nós',               onPress: () => router.push('/institutional/about') },
    { icon: 'document-text-outline'      as const, label: 'Termos e Condições',      onPress: () => router.push('/institutional/terms') },
    { icon: 'shield-checkmark-outline'   as const, label: 'Política de Privacidade', onPress: () => router.push('/institutional/privacy') },
    { icon: 'log-out-outline'            as const, label: 'Sair da Conta',           onPress: () => setLogoutModal(true), danger: true },
  ];

  return (
    <KeyboardAvoidingView style={{ flex: 1, backgroundColor: colors.bg }} behavior={Platform.OS === 'ios' ? 'padding' : 'height'}>
      <ScrollView contentContainerStyle={s.scroll} showsVerticalScrollIndicator={false} keyboardShouldPersistTaps="handled">

        <View style={s.avatarSection}>
          <LinearGradient colors={GRAD} start={{x:0,y:0}} end={{x:1,y:1}} style={s.avatar}>
            <Text style={s.avatarText}>{user?.name?.[0]?.toUpperCase() || 'U'}</Text>
          </LinearGradient>
          <Text style={[s.userName,  { color: colors.text }]}>{user?.name}</Text>
          <Text style={[s.userEmail, { color: colors.textMuted }]}>{user?.email}</Text>
          <View style={[s.goalBadge, { backgroundColor: colors.surface2, borderColor: colors.border }]}>
            <Text style={[s.goalBadgeText, { color: colors.cyan }]}>{user?.goal || 'Sem objetivo'}</Text>
          </View>
        </View>

        {/* Métricas */}
        <View style={s.metricsRow}>
          {[
            { label: 'Peso',   value: user?.weight       ? `${user.weight}kg`       : '—' },
            { label: 'Altura', value: user?.height       ? `${user.height}cm`       : '—' },
            { label: 'IMC',    value: bmi },
            { label: 'Meta',   value: user?.targetWeight ? `${user.targetWeight}kg` : '—' },
          ].map(m => (
            <View key={m.label} style={[s.metricCard, { backgroundColor: colors.surface, borderColor: colors.cyan + '40' }]}>
              <Text style={[s.metricValue, { color: colors.cyan }]}>{m.value}</Text>
              <Text style={[s.metricLabel, { color: colors.textMuted }]}>{m.label}</Text>
            </View>
          ))}
        </View>

        {/* Dados pessoais */}
        <View style={[s.card, { backgroundColor: colors.surface, borderColor: colors.border }]}>
          <View style={s.cardHeader}>
            <Text style={[s.cardTitle, { color: colors.text }]}>Dados Pessoais</Text>
            <TouchableOpacity onPress={editing ? cancelEdit : () => setEditing(true)}>
              <Text style={[s.editBtn, { color: colors.cyan }]}>{editing ? 'Cancelar' : 'Editar'}</Text>
            </TouchableOpacity>
          </View>
          {FIELDS.map(({ key, label, keyboard }) => (
            <View key={key} style={[s.field, { borderBottomColor: colors.border }]}>
              <Text style={[s.fieldLabel, { color: colors.textMuted }]}>{label}</Text>
              {editing
                ? <TextInput style={[s.fieldInput, { color: colors.text, borderColor: colors.cyan + '60', backgroundColor: colors.surface2 }]} value={form[key as keyof typeof form]} onChangeText={set(key)} keyboardType={keyboard} placeholderTextColor={colors.textDim} placeholder={label} autoCorrect={false} />
                : <Text style={[s.fieldValue, { color: colors.text }]}>{user?.[key as keyof typeof user] || '—'}</Text>}
            </View>
          ))}
          {editing && (
            <LinearGradient colors={GRAD} start={{x:0,y:0}} end={{x:1,y:0}} style={s.saveBtn}>
              <TouchableOpacity onPress={save} style={s.saveBtnInner}>
                <Text style={s.saveBtnText}>Salvar alterações</Text>
              </TouchableOpacity>
            </LinearGradient>
          )}
        </View>

        {/* Menu */}
        <View style={[s.menu, { backgroundColor: colors.surface, borderColor: colors.border }]}>
          {menuItems.map((item, i) => (
            <TouchableOpacity key={i} style={[s.menuItem, i < menuItems.length - 1 && { borderBottomWidth: 1, borderBottomColor: colors.border }]} onPress={item.onPress}>
              <View style={[s.menuIconWrap, { backgroundColor: item.danger ? colors.danger + '20' : colors.surface2 }]}>
                <Ionicons name={item.icon} size={18} color={item.danger ? colors.danger : colors.cyan} />
              </View>
              <Text style={[s.menuLabel, { color: item.danger ? colors.danger : colors.text }]}>{item.label}</Text>
              <Ionicons name="chevron-forward" size={16} color={colors.textDim} />
            </TouchableOpacity>
          ))}
        </View>

        <Modal visible={logoutModal} transparent animationType="fade">
          <View style={s.overlay}>
            <View style={[s.modalBox, { backgroundColor: colors.surface, borderColor: colors.border }]}>
              <Text style={[s.modalTitle, { color: colors.text }]}>Sair da Conta</Text>
              <Text style={[s.modalText, { color: colors.textMuted }]}>Tem certeza que deseja sair?</Text>
              <View style={s.modalButtons}>
                <TouchableOpacity style={[s.modalBtnNo, { borderColor: colors.border }]} onPress={() => setLogoutModal(false)}>
                  <Text style={[s.modalBtnNoText, { color: colors.text }]}>Não</Text>
                </TouchableOpacity>
                <TouchableOpacity style={[s.modalBtnYes, { backgroundColor: colors.danger }]} onPress={handleLogout}>
                  <Text style={s.modalBtnYesText}>Sair</Text>
                </TouchableOpacity>
              </View>
            </View>
          </View>
        </Modal>

        <View style={{ height: 100 }} />
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const s = StyleSheet.create({
  scroll:         { padding: 20, paddingTop: 56, gap: 14 },
  avatarSection:  { alignItems: 'center', gap: 6, marginBottom: 4 },
  avatar:         { width: 80, height: 80, borderRadius: 40, alignItems: 'center', justifyContent: 'center' },
  avatarText:     { fontSize: 32, fontWeight: '900', color: '#fff' },
  userName:       { fontSize: 20, fontWeight: '900', letterSpacing: -0.5 },
  userEmail:      { fontSize: 13, fontWeight: '500' },
  goalBadge:      { borderRadius: 999, paddingHorizontal: 14, paddingVertical: 5, marginTop: 4, borderWidth: 1 },
  goalBadgeText:  { fontSize: 12, fontWeight: '700' },
  metricsRow:     { flexDirection: 'row', gap: 8 },
  metricCard:     { flex: 1, borderRadius: 14, padding: 12, alignItems: 'center', borderWidth: 1 },
  metricValue:    { fontSize: 15, fontWeight: '900' },
  metricLabel:    { fontSize: 10, fontWeight: '700', marginTop: 2 },
  card:           { borderRadius: 20, padding: 18, borderWidth: 1 },
  cardHeader:     { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 },
  cardTitle:      { fontSize: 15, fontWeight: '800' },
  editBtn:        { fontSize: 14, fontWeight: '700' },
  field:          { borderBottomWidth: 1, paddingVertical: 10 },
  fieldLabel:     { fontSize: 11, fontWeight: '700', marginBottom: 4, textTransform: 'uppercase', letterSpacing: 0.5 },
  fieldValue:     { fontSize: 15, fontWeight: '600' },
  fieldInput:     { fontSize: 15, borderWidth: 1, borderRadius: 10, padding: 10, fontWeight: '600' },
  saveBtn:        { borderRadius: 999, overflow: 'hidden', marginTop: 14 },
  saveBtnInner:   { padding: 14, alignItems: 'center' },
  saveBtnText:    { fontSize: 15, fontWeight: '800', color: '#fff' },
  menu:           { borderRadius: 20, overflow: 'hidden', borderWidth: 1 },
  menuItem:       { flexDirection: 'row', alignItems: 'center', padding: 16, gap: 12 },
  menuIconWrap:   { width: 36, height: 36, borderRadius: 10, alignItems: 'center', justifyContent: 'center' },
  menuLabel:      { flex: 1, fontSize: 15, fontWeight: '600' },
  overlay:        { flex: 1, backgroundColor: 'rgba(0,0,0,0.7)', alignItems: 'center', justifyContent: 'center' },
  modalBox:       { borderRadius: 24, padding: 24, width: '82%', gap: 12, borderWidth: 1 },
  modalTitle:     { fontSize: 18, fontWeight: '900', textAlign: 'center' },
  modalText:      { fontSize: 14, textAlign: 'center' },
  modalButtons:   { flexDirection: 'row', gap: 12, marginTop: 8 },
  modalBtnNo:     { flex: 1, padding: 14, borderRadius: 999, borderWidth: 1, alignItems: 'center' },
  modalBtnNoText: { fontSize: 15, fontWeight: '700' },
  modalBtnYes:    { flex: 1, padding: 14, borderRadius: 999, alignItems: 'center' },
  modalBtnYesText:{ fontSize: 15, color: '#fff', fontWeight: '700' },
});
