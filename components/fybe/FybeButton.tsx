import { usePremiumTheme } from '@/context/theme';
import { useEffect, useState } from 'react';
import { Image, Keyboard, Platform, Pressable, StyleSheet, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { FYBE_AVATAR } from './assets';
import { useFybe, useFybeOptional } from './FybeProvider';

/** Altura da barra de abas definida em app/(tabs)/_layout.tsx (68 + área segura inferior). */
const TAB_BAR_HEIGHT = 68;

function useKeyboardOpen() {
  const [open, setOpen] = useState(false);
  useEffect(() => {
    if (Platform.OS === 'web') return;
    const show = Keyboard.addListener(Platform.OS === 'ios' ? 'keyboardWillShow' : 'keyboardDidShow', () => setOpen(true));
    const hide = Keyboard.addListener(Platform.OS === 'ios' ? 'keyboardWillHide' : 'keyboardDidHide', () => setOpen(false));
    return () => { show.remove(); hide.remove(); };
  }, []);
  return open;
}

/** Botão flutuante do Fybe: fica acima da barra de abas, no canto inferior direito. */
export function FybeFloatingButton() {
  const fybe = useFybe();
  const { colors: C } = usePremiumTheme();
  const insets = useSafeAreaInsets();
  const keyboardOpen = useKeyboardOpen();

  const hidden = !fybe.visible || !!fybe.active || fybe.panelOpen || fybe.introOpen || fybe.floatingSuppressed || keyboardOpen;
  if (hidden) return null;

  return (
    <View pointerEvents="box-none" style={[StyleSheet.absoluteFill, { zIndex: 40 }]}>
      <Pressable
        testID="fybe-button"
        accessibilityRole="button"
        accessibilityLabel={fybe.paused ? 'Fybe, ajuda do NutriFybe. Há um tutorial pausado' : 'Fybe, ajuda do NutriFybe'}
        accessibilityHint="Abre as orientações desta tela e os tutoriais"
        onPress={fybe.openPanel}
        style={({ pressed }) => [
          styles.fab,
          { bottom: TAB_BAR_HEIGHT + insets.bottom + 12, right: 16 + insets.right, backgroundColor: C.surface, borderColor: C.primary, opacity: pressed ? 0.85 : 1 },
        ]}
      >
        <Image source={FYBE_AVATAR} style={styles.fabImage} accessibilityIgnoresInvertColors />
        {!!fybe.paused && <View style={[styles.badge, { backgroundColor: C.warning, borderColor: C.surface }]} />}
      </Pressable>
    </View>
  );
}

/** Versão compacta para cabeçalhos (ex.: chat, onde o botão flutuante cobriria o campo de mensagem). */
export function FybeInlineButton() {
  const fybe = useFybeOptional();
  const { colors: C } = usePremiumTheme();
  if (!fybe) return null;
  return (
    <Pressable
      testID="fybe-inline-button"
      accessibilityRole="button"
      accessibilityLabel="Fybe, ajuda do NutriFybe"
      accessibilityHint="Abre as orientações desta tela e os tutoriais"
      onPress={fybe.openPanel}
      hitSlop={6}
      style={({ pressed }) => [styles.inline, { borderColor: C.primary, backgroundColor: C.surface, opacity: pressed ? 0.85 : 1 }]}
    >
      <Image source={FYBE_AVATAR} style={styles.inlineImage} accessibilityIgnoresInvertColors />
    </Pressable>
  );
}

const styles = StyleSheet.create({
  fab: {
    position: 'absolute', width: 60, height: 60, borderRadius: 30, borderWidth: 2,
    alignItems: 'center', justifyContent: 'center',
    shadowColor: '#000', shadowOpacity: 0.18, shadowRadius: 10, shadowOffset: { width: 0, height: 4 }, elevation: 6,
  },
  fabImage: { width: 50, height: 50 },
  badge: { position: 'absolute', top: 0, right: 0, width: 16, height: 16, borderRadius: 8, borderWidth: 2 },
  inline: { width: 44, height: 44, borderRadius: 22, borderWidth: 1.5, alignItems: 'center', justifyContent: 'center' },
  inlineImage: { width: 36, height: 36 },
});
