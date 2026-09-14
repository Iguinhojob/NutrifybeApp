import { usePremiumTheme } from '@/context/theme';
import { ScrollView, StyleSheet, Switch, Text, TouchableOpacity, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

export default function SettingsScreen() {
  const { colors, isDark, toggleTheme } = usePremiumTheme();
  return (
    <ScrollView style={{ flex: 1, backgroundColor: colors.bg }} contentContainerStyle={s.scroll}>

      <View style={[s.section, { backgroundColor: colors.surface, borderColor: colors.border }]}>
        <Text style={[s.sectionTitle, { color: colors.cyan }]}>Aparência</Text>
        <View style={s.item}>
          <View style={s.itemLeft}>
            <View style={[s.iconWrap, { backgroundColor: colors.surface2 }]}>
              <Ionicons name={isDark ? 'sunny-outline' : 'moon-outline'} size={18} color={colors.cyan} />
            </View>
            <Text style={[s.itemLabel, { color: colors.text }]}>{isDark ? 'Modo claro' : 'Modo escuro'}</Text>
          </View>
          <Switch value={isDark} onValueChange={toggleTheme} trackColor={{ false: colors.border, true: colors.cyan }} thumbColor="#fff" />
        </View>
      </View>

      <View style={[s.section, { backgroundColor: colors.surface, borderColor: colors.border }]}>
        <Text style={[s.sectionTitle, { color: colors.cyan }]}>Notificações</Text>
        {[{ icon: 'notifications-outline' as const, label: 'Lembretes de refeição' }, { icon: 'water-outline' as const, label: 'Lembrete de hidratação' }].map((item, i) => (
          <View key={i} style={[s.item, i > 0 && { borderTopWidth: 1, borderTopColor: colors.border }]}>
            <View style={s.itemLeft}>
              <View style={[s.iconWrap, { backgroundColor: colors.surface2 }]}><Ionicons name={item.icon} size={18} color={colors.cyan} /></View>
              <Text style={[s.itemLabel, { color: colors.text }]}>{item.label}</Text>
            </View>
            <Switch value={true} trackColor={{ false: colors.border, true: colors.cyan }} thumbColor="#fff" />
          </View>
        ))}
      </View>

      <View style={[s.section, { backgroundColor: colors.surface, borderColor: colors.border }]}>
        <Text style={[s.sectionTitle, { color: colors.cyan }]}>Dados</Text>
        <TouchableOpacity style={s.item}>
          <View style={s.itemLeft}>
            <View style={[s.iconWrap, { backgroundColor: colors.surface2 }]}><Ionicons name="download-outline" size={18} color={colors.cyan} /></View>
            <Text style={[s.itemLabel, { color: colors.text }]}>Exportar dados</Text>
          </View>
          <Ionicons name="chevron-forward" size={16} color={colors.textDim} />
        </TouchableOpacity>
        <TouchableOpacity style={[s.item, { borderTopWidth: 1, borderTopColor: colors.border }]}>
          <View style={s.itemLeft}>
            <View style={[s.iconWrap, { backgroundColor: colors.danger + '20' }]}><Ionicons name="trash-outline" size={18} color={colors.danger} /></View>
            <Text style={[s.itemLabel, { color: colors.danger }]}>Excluir conta</Text>
          </View>
          <Ionicons name="chevron-forward" size={16} color={colors.textDim} />
        </TouchableOpacity>
      </View>

    </ScrollView>
  );
}

const s = StyleSheet.create({
  scroll:       { padding: 20, paddingTop: 20, gap: 14 },
  section:      { borderRadius: 18, overflow: 'hidden', borderWidth: 1 },
  sectionTitle: { fontSize: 11, fontWeight: '800', padding: 16, paddingBottom: 8, textTransform: 'uppercase', letterSpacing: 1 },
  item:         { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', padding: 14, paddingHorizontal: 16 },
  itemLeft:     { flexDirection: 'row', alignItems: 'center', gap: 12 },
  iconWrap:     { width: 34, height: 34, borderRadius: 10, alignItems: 'center', justifyContent: 'center' },
  itemLabel:    { fontSize: 15, fontWeight: '600' },
});
