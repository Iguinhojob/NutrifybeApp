import { useAuth } from '@/context/auth';
import { usePremiumTheme } from '@/context/theme';
import { useAppLayout } from '@/hooks/useAppLayout';
import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import { useEffect, useRef } from 'react';
import { Animated, StyleSheet, Text, TouchableOpacity, View } from 'react-native';

export default function SuccessScreen() {
  const { user } = useAuth();
  const { colors: C } = usePremiumTheme();
  const { bottomPad } = useAppLayout();
  const scale   = useRef(new Animated.Value(0)).current;
  const opacity = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.sequence([
      Animated.delay(200),
      Animated.parallel([
        Animated.spring(scale,   { toValue: 1, friction: 5, tension: 80, useNativeDriver: true }),
        Animated.timing(opacity, { toValue: 1, duration: 400, useNativeDriver: true }),
      ]),
    ]).start();
  }, []);

  return (
    <View style={[s.screen, { backgroundColor: C.bg }]}>
      <View style={[s.blob, { backgroundColor: C.primarySoft }]} />

      <Animated.View style={[s.content, { opacity }]}>
        <Animated.View style={[s.iconCircle, { backgroundColor: C.primary, shadowColor: C.primary, transform: [{ scale }] }]}>
          <Ionicons name="checkmark" size={48} color="#fff" />
        </Animated.View>

        <Text style={[s.title, { color: C.text }]}>
          Tudo pronto{user?.name ? `, ${user.name.split(' ')[0]}` : ''}! 🎉
        </Text>
        <Text style={[s.sub, { color: C.textMuted }]}>
          Seu perfil nutricional foi criado com sucesso. Vamos começar sua jornada?
        </Text>

        <View style={[s.summaryCard, { backgroundColor: C.surface, borderColor: C.border }]}>
          {[
            { icon: '🎯', label: 'Objetivo',  value: user?.goal || '—' },
            { icon: '🏃', label: 'Atividade', value: user?.activityLevel || '—' },
            { icon: '⚖️', label: 'Peso meta', value: user?.targetWeight ? `${user.targetWeight} kg` : '—' },
          ].map((item, i) => (
            <View key={i} style={[s.summaryRow, i < 2 && { borderBottomWidth: 1, borderBottomColor: C.border }]}>
              <Text style={s.summaryIcon}>{item.icon}</Text>
              <Text style={[s.summaryLabel, { color: C.textMuted }]}>{item.label}</Text>
              <Text style={[s.summaryValue, { color: C.text }]}>{item.value}</Text>
            </View>
          ))}
        </View>
      </Animated.View>

      <Animated.View style={[s.actions, { paddingBottom: bottomPad + 24, opacity }]}>
        <TouchableOpacity
          style={[s.btnPrimary, { backgroundColor: C.primary, shadowColor: C.primary }]}
          onPress={() => router.replace('/(tabs)')}
          activeOpacity={0.85}
        >
          <Text style={s.btnPrimaryText}>Começar agora</Text>
          <Ionicons name="arrow-forward" size={18} color="#fff" />
        </TouchableOpacity>
      </Animated.View>
    </View>
  );
}

const s = StyleSheet.create({
  screen:       { flex: 1 },
  blob:         { position: 'absolute', top: -120, right: -100, width: 340, height: 340, borderRadius: 170 },
  content:      { flex: 1, alignItems: 'center', justifyContent: 'center', paddingHorizontal: 28, gap: 20 },
  iconCircle:   { width: 110, height: 110, borderRadius: 36, alignItems: 'center', justifyContent: 'center',
                  shadowOffset: { width: 0, height: 12 }, shadowOpacity: 0.35, shadowRadius: 24, elevation: 16 },
  title:        { fontSize: 34, fontWeight: '900', textAlign: 'center', letterSpacing: -0.5 },
  sub:          { fontSize: 15, textAlign: 'center', lineHeight: 22 },
  summaryCard:  { width: '100%', borderRadius: 20, borderWidth: 1, overflow: 'hidden' },
  summaryRow:   { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 18, paddingVertical: 14, gap: 12 },
  summaryIcon:  { fontSize: 20, width: 28 },
  summaryLabel: { flex: 1, fontSize: 14, fontWeight: '500' },
  summaryValue: { fontSize: 14, fontWeight: '700' },
  actions:      { paddingHorizontal: 24 },
  btnPrimary:   { borderRadius: 16, height: 56, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8,
                  shadowOffset: { width: 0, height: 6 }, shadowOpacity: 0.35, shadowRadius: 16, elevation: 8 },
  btnPrimaryText:{ fontSize: 17, fontWeight: '800', color: '#fff' },
});
