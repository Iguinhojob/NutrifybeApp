import { useAuth } from '@/context/auth';
import { usePremiumTheme } from '@/context/theme';
import { useAppLayout } from '@/hooks/useAppLayout';
import { router } from 'expo-router';
import { useEffect, useState } from 'react';
import { Alert, KeyboardAvoidingView, Modal, Platform, ScrollView, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

const ACTIVITIES = ['Sedentário', 'Leve', 'Moderado', 'Intenso', 'Muito intenso'];
const PREFERENCES = ['Nenhuma', 'Vegetariana', 'Vegana', 'Sem lactose', 'Sem glúten', 'Outras'];
const MOMENTS: Record<string, string[]> = {
  'Perder peso': ['Organizar as refeições', 'Encontrar constância', 'Entender meus hábitos'],
  'Ganhar massa': ['Não treino', 'Estou começando', 'Já treino regularmente', 'Quero retomar meus treinos'],
  'Manter peso': ['Horários das refeições', 'Variedade no prato', 'Alimentação e movimento'],
  'Melhorar saúde': ['Ter mais disposição', 'Variar minha alimentação', 'Organizar minha rotina'],
};

export default function ProfileScreen() {
  const { user, updateUser, logout } = useAuth();
  const { colors, isDark, toggleTheme } = usePremiumTheme();
  const { topPad } = useAppLayout();
  const [editing, setEditing]         = useState(false);
  const [logoutModal, setLogoutModal] = useState(false);
  const [nutritionModal, setNutritionModal] = useState(false);
  const [form, setForm] = useState({ name: '' });
  const [nutritionForm, setNutritionForm] = useState({ activityLevel: '', motivation: '', restrictions: [] as string[] });

  useEffect(() => {
    if (user) setForm({ name: user.name || '' });
  }, [user]);

  const set = (key: string) => (val: string) => setForm(f => ({ ...f, [key]: val }));
  const save = () => { if (!form.name.trim()) return Alert.alert('Erro', 'Nome não pode ser vazio.'); updateUser(form); setEditing(false); Alert.alert('Sucesso', 'Perfil atualizado!'); };
  const cancelEdit = () => { if (user) setForm({ name: user.name || '' }); setEditing(false); };
  const handleLogout = () => { logout(); router.replace('/auth/login'); };
  const editNutritionProfile = () => {
    if (!user) return;
    setNutritionForm({ activityLevel: user.activityLevel || '', motivation: user.motivation || '', restrictions: user.restrictions ? user.restrictions.split(',').map(item => item.trim()).filter(Boolean) : [] });
    setNutritionModal(true);
  };
  const togglePreference = (label: string) => setNutritionForm(prev => {
    if (label === 'Nenhuma') return { ...prev, restrictions: ['Nenhuma'] };
    const current = prev.restrictions.filter(item => item !== 'Nenhuma' && !(label === 'Vegetariana' && item === 'Vegana') && !(label === 'Vegana' && item === 'Vegetariana'));
    return { ...prev, restrictions: current.includes(label) ? current.filter(item => item !== label) : [...current, label] };
  });
  const saveNutritionProfile = () => {
    if (!nutritionForm.activityLevel || !nutritionForm.motivation || !nutritionForm.restrictions.length) return Alert.alert('Confira as respostas', 'Preencha atividade diária, seu momento e preferências alimentares.');
    updateUser({ activityLevel: nutritionForm.activityLevel, motivation: nutritionForm.motivation, restrictions: nutritionForm.restrictions.join(', ') });
    setNutritionModal(false);
    Alert.alert('Perfil atualizado', 'Suas informações nutricionais foram alteradas.');
  };

  const menuItems = [
    { icon: 'person-add-outline' as const, label: user?.nutricionistaId ? 'Meu nutricionista' : 'Vincular nutricionista', onPress: () => router.push(user?.nutricionistaId ? '/(tabs)/plan' : '/auth/nutri-code') },
    { icon: 'sunny-outline'              as const, label: isDark ? 'Modo claro' : 'Modo escuro', onPress: toggleTheme },
    { icon: 'settings-outline'           as const, label: 'Configurações',           onPress: () => router.push('/institutional/settings') },
    { icon: 'information-circle-outline' as const, label: 'Sobre Nós',               onPress: () => router.push('/institutional/about') },
    { icon: 'document-text-outline'      as const, label: 'Termos e Condições',      onPress: () => router.push('/institutional/terms') },
    { icon: 'shield-checkmark-outline'   as const, label: 'Política de Privacidade', onPress: () => router.push('/institutional/privacy') },
    { icon: 'log-out-outline'            as const, label: 'Sair da Conta',           onPress: () => setLogoutModal(true), danger: true },
  ];

  return (
    <KeyboardAvoidingView style={{ flex: 1, backgroundColor: colors.bg }} behavior={Platform.OS === 'ios' ? 'padding' : 'height'}>
      <ScrollView contentContainerStyle={[s.scroll, { paddingTop: topPad }]} showsVerticalScrollIndicator={false} keyboardShouldPersistTaps="handled">

        <View style={s.avatarSection}>
          <View style={[s.avatar, { backgroundColor: colors.primary }]}>
            <Text style={s.avatarText}>{user?.name?.[0]?.toUpperCase() || 'U'}</Text>
          </View>
          <Text style={[s.userName,  { color: colors.text }]}>{user?.name}</Text>
          <Text style={[s.userEmail, { color: colors.textMuted }]}>{user?.email}</Text>
        </View>

        <View style={[s.card, { backgroundColor: colors.surface, shadowColor: '#000' }]}>
          <View style={s.cardHeader}><Text style={[s.cardTitle, { color: colors.text }]}>Seu perfil nutricional</Text><TouchableOpacity onPress={editNutritionProfile}><Text style={[s.editBtn, { color: colors.primary }]}>Editar</Text></TouchableOpacity></View>
          {[
            ['Atividade diária', user?.activityLevel], ['Seu momento', user?.motivation], ['Preferências alimentares', user?.restrictions],
          ].filter(([, value]) => !!value).map(([label, value]) => (
            <View key={label} style={[s.field, { borderBottomColor: colors.border }]}>
              <Text style={[s.fieldLabel, { color: colors.textMuted }]}>{label}</Text>
              <Text style={[s.fieldValue, { color: colors.text }]}>{value}</Text>
            </View>
          ))}
        </View>

        {/* Dados pessoais */}
        <View style={[s.card, { backgroundColor: colors.surface, shadowColor: '#000' }]}>
          <View style={s.cardHeader}>
            <Text style={[s.cardTitle, { color: colors.text }]}>Dados Pessoais</Text>
            <TouchableOpacity onPress={editing ? cancelEdit : () => setEditing(true)}>
              <Text style={[s.editBtn, { color: colors.primary }]}>{editing ? 'Cancelar' : 'Editar'}</Text>
            </TouchableOpacity>
          </View>
          <View style={[s.field, { borderBottomColor: colors.border }]}>
              <Text style={[s.fieldLabel, { color: colors.textMuted }]}>Nome</Text>
              {editing
                ? <TextInput style={[s.fieldInput, { color: colors.text, borderColor: colors.border, backgroundColor: colors.surface2 }]} value={form.name} onChangeText={set('name')} placeholderTextColor={colors.textMuted} placeholder="Nome" autoCorrect={false} />
                : <Text style={[s.fieldValue, { color: colors.text }]}>{user?.name || '—'}</Text>}
          </View>
          {editing && (
            <TouchableOpacity onPress={save} style={[s.saveBtn, { backgroundColor: colors.primary }]}>
              <Text style={s.saveBtnText}>Salvar alterações</Text>
            </TouchableOpacity>
          )}
        </View>

        {/* Menu */}
        <View style={[s.menu, { backgroundColor: colors.surface, shadowColor: '#000' }]}>
          {menuItems.map((item, i) => (
            <TouchableOpacity key={i} style={[s.menuItem, i < menuItems.length - 1 && { borderBottomWidth: 1, borderBottomColor: colors.border }]} onPress={item.onPress}>
              <View style={[s.menuIconWrap, { backgroundColor: item.danger ? colors.danger + '20' : colors.surface2 }]}>
                <Ionicons name={item.icon} size={18} color={item.danger ? colors.danger : colors.primary} />
              </View>
              <Text style={[s.menuLabel, { color: item.danger ? colors.danger : colors.text }]}>{item.label}</Text>
              <Ionicons name="chevron-forward" size={16} color={colors.textMuted} />
            </TouchableOpacity>
          ))}
        </View>

        <Modal visible={logoutModal} transparent animationType="fade">
          <View style={s.overlay}>
            <View style={[s.modalBox, { backgroundColor: colors.surface }]}>
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

        <Modal visible={nutritionModal} animationType="slide" presentationStyle="pageSheet">
          <ScrollView style={{ flex: 1, backgroundColor: colors.bg }} contentContainerStyle={{ padding: 24, paddingBottom: 50 }}>
            <Text style={{ color: colors.text, fontSize: 22, fontWeight: '900' }}>Editar perfil nutricional</Text>
            <Text style={{ color: colors.textMuted, marginTop: 5, marginBottom: 20 }}>Altere somente as informações exibidas neste cartão.</Text>
            <Text style={[s.optionTitle, { color: colors.textMuted }]}>ATIVIDADE DIÁRIA</Text>
            {ACTIVITIES.map(label => <TouchableOpacity key={label} onPress={() => setNutritionForm(prev => ({ ...prev, activityLevel: label }))} style={[s.option, { borderColor: nutritionForm.activityLevel === label ? colors.primary : colors.border, backgroundColor: nutritionForm.activityLevel === label ? colors.primarySoft : colors.surface }]}><Text style={{ color: nutritionForm.activityLevel === label ? colors.primary : colors.text, fontWeight: '700' }}>{label}</Text></TouchableOpacity>)}
            <Text style={[s.optionTitle, { color: colors.textMuted, marginTop: 16 }]}>SEU MOMENTO</Text>
            {(MOMENTS[user?.goal || ''] ?? MOMENTS['Melhorar saúde']).map(label => <TouchableOpacity key={label} onPress={() => setNutritionForm(prev => ({ ...prev, motivation: label }))} style={[s.option, { borderColor: nutritionForm.motivation === label ? colors.primary : colors.border, backgroundColor: nutritionForm.motivation === label ? colors.primarySoft : colors.surface }]}><Text style={{ color: nutritionForm.motivation === label ? colors.primary : colors.text, fontWeight: '700' }}>{label}</Text></TouchableOpacity>)}
            <Text style={[s.optionTitle, { color: colors.textMuted, marginTop: 16 }]}>PREFERÊNCIAS ALIMENTARES</Text>
            {PREFERENCES.map(label => <TouchableOpacity key={label} onPress={() => togglePreference(label)} style={[s.option, { borderColor: nutritionForm.restrictions.includes(label) ? colors.primary : colors.border, backgroundColor: nutritionForm.restrictions.includes(label) ? colors.primarySoft : colors.surface }]}><Text style={{ color: nutritionForm.restrictions.includes(label) ? colors.primary : colors.text, fontWeight: '700' }}>{label}</Text></TouchableOpacity>)}
            <TouchableOpacity onPress={saveNutritionProfile} style={[s.saveBtn, { backgroundColor: colors.primary, marginTop: 22 }]}><Text style={s.saveBtnText}>Salvar alterações</Text></TouchableOpacity>
            <TouchableOpacity onPress={() => setNutritionModal(false)} style={{ padding: 15, alignItems: 'center' }}><Text style={{ color: colors.textMuted, fontWeight: '700' }}>Cancelar</Text></TouchableOpacity>
          </ScrollView>
        </Modal>

        <View style={{ height: 100 }} />
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const s = StyleSheet.create({
  scroll:          { padding: 20, gap: 14 },
  avatarSection:   { alignItems: 'center', gap: 6, marginBottom: 4 },
  avatar:          { width: 80, height: 80, borderRadius: 40, alignItems: 'center', justifyContent: 'center' },
  avatarText:      { fontSize: 32, fontWeight: '900', color: '#fff' },
  userName:        { fontSize: 20, fontWeight: '900', letterSpacing: -0.5 },
  userEmail:       { fontSize: 13, fontWeight: '500' },
  goalBadge:       { borderRadius: 999, paddingHorizontal: 14, paddingVertical: 5, marginTop: 4, borderWidth: 1 },
  goalBadgeText:   { fontSize: 12, fontWeight: '700' },
  metricsRow:      { flexDirection: 'row', gap: 8 },
  metricCard:      { flex: 1, borderRadius: 14, padding: 12, alignItems: 'center', shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.05, shadowRadius: 4, elevation: 1 },
  metricValue:     { fontSize: 15, fontWeight: '900' },
  metricLabel:     { fontSize: 10, fontWeight: '700', marginTop: 2 },
  card:            { borderRadius: 20, padding: 18, shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.06, shadowRadius: 10, elevation: 3 },
  cardHeader:      { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 },
  cardTitle:       { fontSize: 15, fontWeight: '800' },
  editBtn:         { fontSize: 14, fontWeight: '700' },
  field:           { borderBottomWidth: 1, paddingVertical: 10 },
  fieldLabel:      { fontSize: 11, fontWeight: '700', marginBottom: 4, textTransform: 'uppercase', letterSpacing: 0.5 },
  fieldValue:      { fontSize: 15, fontWeight: '600' },
  fieldInput:      { fontSize: 15, borderWidth: 1, borderRadius: 10, padding: 10, fontWeight: '600' },
  saveBtn:         { borderRadius: 14, padding: 14, alignItems: 'center', marginTop: 14 },
  saveBtnText:     { fontSize: 15, fontWeight: '800', color: '#fff' },
  menu:            { borderRadius: 20, overflow: 'hidden', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.06, shadowRadius: 10, elevation: 3 },
  menuItem:        { flexDirection: 'row', alignItems: 'center', padding: 16, gap: 12 },
  menuIconWrap:    { width: 36, height: 36, borderRadius: 10, alignItems: 'center', justifyContent: 'center' },
  menuLabel:       { flex: 1, fontSize: 15, fontWeight: '600' },
  overlay:         { flex: 1, backgroundColor: 'rgba(0,0,0,0.5)', alignItems: 'center', justifyContent: 'center' },
  modalBox:        { borderRadius: 24, padding: 24, width: '82%', gap: 12 },
  modalTitle:      { fontSize: 18, fontWeight: '900', textAlign: 'center' },
  modalText:       { fontSize: 14, textAlign: 'center' },
  modalButtons:    { flexDirection: 'row', gap: 12, marginTop: 8 },
  modalBtnNo:      { flex: 1, padding: 14, borderRadius: 14, borderWidth: 1, alignItems: 'center' },
  modalBtnNoText:  { fontSize: 15, fontWeight: '700' },
  modalBtnYes:     { flex: 1, padding: 14, borderRadius: 14, alignItems: 'center' },
  modalBtnYesText: { fontSize: 15, color: '#fff', fontWeight: '700' },
  optionTitle:      { fontSize: 11, fontWeight: '800', letterSpacing: 0.6, marginBottom: 8 },
  option:           { borderWidth: 1, borderRadius: 12, padding: 13, marginBottom: 8 },
});
