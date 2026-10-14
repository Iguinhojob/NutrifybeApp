import { useEffect } from 'react';
import { Platform } from 'react-native';
import { FybeFloatingButton } from './FybeButton';
import { FybeIntro } from './FybeIntro';
import { FybePanel } from './FybePanel';
import { useFybe } from './FybeProvider';
import { FybeCelebration, FybeTour } from './FybeTour';

/** Tudo o que o Fybe desenha por cima das telas. Fica uma única vez no layout raiz. */
export function FybeLayer() {
  const fybe = useFybe();
  const { active, panelOpen, skip, closePanel } = fybe;

  // No navegador, a tecla Esc fecha o tutorial ou o painel.
  useEffect(() => {
    if (Platform.OS !== 'web' || typeof document === 'undefined') return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key !== 'Escape') return;
      if (active) skip();
      else if (panelOpen) closePanel();
    };
    document.addEventListener('keydown', onKey);
    return () => document.removeEventListener('keydown', onKey);
  }, [active, panelOpen, skip, closePanel]);

  return (
    <>
      <FybeTour />
      <FybeCelebration />
      <FybeFloatingButton />
      <FybePanel />
      <FybeIntro />
    </>
  );
}

