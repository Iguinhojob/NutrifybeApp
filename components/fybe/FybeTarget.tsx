import { useEffect, useRef, type ReactNode } from 'react';
import { useWindowDimensions, View, type ScrollView, type StyleProp, type ViewStyle } from 'react-native';
import { useFybeOptional } from './FybeProvider';

/**
 * Marca um elemento real da tela para os tutoriais do Fybe.
 * O tutorial encontra o elemento pelo `id` (e não por coordenadas fixas),
 * então o destaque acompanha rolagem, tamanho de tela e mudanças de layout.
 * O wrapper não tem estilo próprio: só repassa `style` quando informado.
 */
export function FybeTarget({ id, children, style }: { id: string; children: ReactNode; style?: StyleProp<ViewStyle> }) {
  const register = useFybeOptional()?.registerTarget;
  const ref = useRef<View>(null);
  useEffect(() => register?.(id, ref), [id, register]);
  return (
    <View ref={ref} collapsable={false} style={style} testID={`fybe-target-${id}`}>
      {children}
    </View>
  );
}

/** Registra o ScrollView da tela para que o tutorial consiga rolar até o elemento destacado. */
export function useFybeScroll(pathname: string) {
  const register = useFybeOptional()?.registerScroll;
  const ref = useRef<ScrollView>(null);
  useEffect(() => register?.(pathname, ref), [pathname, register]);
  return ref;
}

/**
 * Espaço extra no fim da rolagem, só enquanto um tutorial está aberto nesta tela.
 * Permite levar ao topo os elementos que ficam no fim da página, para o cartão do tutorial não cobri-los.
 */
export function FybeTourSpacer({ pathname }: { pathname: string }) {
  const fybe = useFybeOptional();
  const { height } = useWindowDimensions();
  const step = fybe?.active ? fybe.active.tutorial.steps[fybe.active.index] : undefined;
  if (!step?.target || step.route?.pathname !== pathname) return null;
  return <View pointerEvents="none" style={{ height: Math.round(height * 0.4) }} />;
}
