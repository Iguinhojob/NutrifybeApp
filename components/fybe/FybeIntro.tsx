import { usePremiumTheme } from '@/context/theme';
import { AppButton } from '@/components/ui-kit';
import { useEffect } from 'react';
import { Image, Modal, Pressable, StyleSheet, Text, View } from 'react-native';
import Animated, { useAnimatedStyle, useReducedMotion, useSharedValue, withDelay, withSequence, withTiming } from 'react-native-reanimated';
import { FYBE_FULL } from './assets';
import { PRESENTATION } from './content';
import { useFybe } from './FybeProvider';

/** Proporção da ilustração original (292 x 480), mantida para não deformar o personagem. */
const FYBE_RATIO = 292 / 480;

/** Apresentação do Fybe: aparece uma única vez, depois do primeiro acesso à tela Início. */
export function FybeIntro() {
  const fybe = useFybe();
  const { colors: C } = usePremiumTheme();
  const reduceMotion = useReducedMotion();
  const tilt = useSharedValue(0);
  const open = fybe.visible && fybe.introOpen;

  // Um aceno curto ao abrir (desativado quando o aparelho pede redução de movimento).
  useEffect(() => {
    if (!open || reduceMotion) return;
    tilt.value = withDelay(250, withSequence(withTiming(-6, { duration: 160 }), withTiming(6, { duration: 220 }), withTiming(-3, { duration: 180 }), withTiming(0, { duration: 160 })));
  }, [open, reduceMotion, tilt]);
  const waveStyle = useAnimatedStyle(() => ({ transform: [{ rotate: `${tilt.value}deg` }] }));

  return (
    <Modal visible={open} transparent animationType={reduceMotion ? 'none' : 'fade'} onRequestClose={() => fybe.answerIntro(false)} statusBarTranslucent>
      <View style={styles.root}>
        <Pressable style={[StyleSheet.absoluteFill, { backgroundColor: 'rgba(0,0,0,0.5)' }]} onPress={() => fybe.answerIntro(false)} accessibilityLabel="Fechar apresentação" accessibilityRole="button" />
        <View testID="fybe-intro" role="dialog" aria-modal aria-label="Apresentação do Fybe" accessibilityViewIsModal style={[styles.card, { backgroundColor: C.surface, borderColor: C.border }]}>
          <Animated.View style={[styles.art, waveStyle]}>
            <Image source={FYBE_FULL} style={styles.image} resizeMode="contain" accessibilityLabel="Fybe, o mascote do NutriFybe, acenando" accessibilityIgnoresInvertColors />
          </Animated.View>
          <Text style={[styles.title, { color: C.text }]} accessibilityRole="header">{PRESENTATION.title}</Text>
          <Text style={[styles.message, { color: C.textMuted }]}>{PRESENTATION.message}</Text>
          <View style={{ gap: 8, alignSelf: 'stretch' }}>
            <AppButton label={PRESENTATION.accept} icon="navigate" size="lg" full onPress={() => fybe.answerIntro(true)} />
            <AppButton label={PRESENTATION.decline} variant="ghost" full onPress={() => fybe.answerIntro(false)} />
          </View>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, alignItems: 'center', justifyContent: 'center', padding: 16 },
  card: { width: '100%', maxWidth: 400, borderRadius: 26, borderWidth: 1, paddingHorizontal: 22, paddingTop: 22, paddingBottom: 16, alignItems: 'center', gap: 10 },
  art: { height: 170, aspectRatio: FYBE_RATIO, transformOrigin: 'bottom' },
  image: { width: '100%', height: '100%' },
  title: { fontSize: 22, fontWeight: '900', textAlign: 'center', marginTop: 4 },
  message: { fontSize: 15, lineHeight: 22, textAlign: 'center', marginBottom: 6 },
});
