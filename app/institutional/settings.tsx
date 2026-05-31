import { usePremiumTheme } from '@/context/theme';
import { useMemo } from 'react';
import { ScrollView, StyleSheet, Switch, Text, TouchableOpacity, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

export default function SettingsScreen() {
  const { colors, isDark, toggleTheme } = usePremiumTheme();
  const s = useMemo(() => createStyles(colors, isDark), [colors, isDark]);

  return (
    <ScrollView style={s.screen} contentContainerStyle={s.scroll}>

      <View style={s.section}>
        <Text style={s.sectionTitle}>Aparência</Text>
        <View style={s.item}>
          <View style={s.itemLeft}>
            <View style={[s.iconWrap, { backgroundColor: colors.purpleSoft }]}>
              <Ionicons name="moon-outline" size={18} color={colors.primary} />
            </View>
            <Text style={s.itemLabel}>Modo escuro</Text>
          </View>
          <Switch
            value={isDark}
            onValueChange={toggleTheme}
            trackColor={{ false: colors.border, true: colors.primary }}
            thumbColor={colors.white}
          />
        </View>
      </View>

      <View style={s.section}>
        <Text style={s.sectionTitle}>Notificações</Text>
        <View style={s.item}>
          <View style={s.itemLeft}>
            <View style={[s.iconWrap, { backgroundColor: colors.purpleSoft }]}>
              <Ionicons name="notifications-outline" size={18} color={colors.primary} />
            </View>
            <Text style={s.itemLabel}>Lembretes de refeição</Text>
          </View>
          <Switch
            value={true}
            trackColor={{ false: colors.border, true: colors.primary }}
            thumbColor={colors.white}
          />
        </View>
        <View style={[s.item, { borderTopWidth: 1, borderTopColor: colors.border }]}>
          <View style={s.itemLeft}>
            <View style={[s.iconWrap, { backgroundColor: colors.purpleSoft }]}>
              <Ionicons name="water-outline" size={18} color={colors.primary} />
            </View>
            <Text style={s.itemLabel}>Lembrete de hidratação</Text>
          </View>
          <Switch
            value={true}
            trackColor={{ false: colors.border, true: colors.primary }}
            thumbColor={colors.white}
          />
        </View>
      </View>

      <View style={s.section}>
        <Text style={s.sectionTitle}>Dados</Text>
        <TouchableOpacity style={s.item}>
          <View style={s.itemLeft}>
            <View style={[s.iconWrap, { backgroundColor: colors.purpleSoft }]}>
              <Ionicons name="download-outline" size={18} color={colors.primary} />
            </View>
            <Text style={s.itemLabel}>Exportar dados</Text>
          </View>
          <Ionicons name="chevron-forward" size={16} color={colors.textDim} />
        </TouchableOpacity>
        <TouchableOpacity style={[s.item, { borderTopWidth: 1, borderTopColor: colors.border }]}>
          <View style={s.itemLeft}>
            <View style={[s.iconWrap, { backgroundColor: colors.dangerSoft }]}>
              <Ionicons name="trash-outline" size={18} color={colors.danger} />
            </View>
            <Text style={[s.itemLabel, { color: colors.danger }]}>Excluir conta</Text>
          </View>
          <Ionicons name="chevron-forward" size={16} color={colors.textDim} />
        </TouchableOpacity>
      </View>

    </ScrollView>
  );
}

function createStyles(colors: any, isDark: boolean) {
  return StyleSheet.create({
    screen:       { flex: 1, backgroundColor: colors.bg },
    scroll:       { padding: 20, gap: 14 },
    section:      { backgroundColor: colors.surface, borderRadius: 18, overflow: 'hidden', borderWidth: 1, borderColor: colors.border },
    sectionTitle: { fontSize: 11, fontWeight: '800', color: colors.textMuted, padding: 16, paddingBottom: 8, textTransform: 'uppercase', letterSpacing: 1 },
    item:         { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', padding: 14, paddingHorizontal: 16 },
    itemLeft:     { flexDirection: 'row', alignItems: 'center', gap: 12 },
    iconWrap:     { width: 34, height: 34, borderRadius: 10, alignItems: 'center', justifyContent: 'center' },
    itemLabel:    { fontSize: 15, color: colors.text, fontWeight: '600' },
  });
}
