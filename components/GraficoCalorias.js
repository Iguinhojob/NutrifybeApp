import React, { useEffect, useRef } from 'react';
import { Animated, Easing, StyleSheet, Text, View } from 'react-native';

const ALTURA = 220;
const MARCAS = [1, 0.75, 0.5, 0.25, 0];
const formatar = (valor) => valor.toLocaleString('pt-BR', { maximumFractionDigits: 1 });

export default function GraficoCalorias({ consumido = 0, meta = 2000, escuro = false }) {
  const animacao = useRef(new Animated.Value(0)).current;
  const total = Number.isFinite(consumido) ? Math.max(0, consumido) : 0;
  const objetivo = Number.isFinite(meta) && meta > 0 ? meta : 0;
  const proporcao = objetivo ? Math.min(total / objetivo, 1) : 0;
  const percentual = objetivo ? Math.round((total / objetivo) * 100) : 0;
  const ultrapassou = objetivo > 0 && total > objetivo;
  const atingiuMeta = objetivo > 0 && total === objetivo;

  useEffect(() => {
    const animation = Animated.timing(animacao, {
      toValue: proporcao,
      duration: 900,
      easing: Easing.out(Easing.cubic),
      useNativeDriver: false,
    });
    animation.start();
    return () => animation.stop();
  }, [animacao, proporcao]);

  const tema = escuro
    ? { card: '#17141F', texto: '#FFFFFF', suave: '#BFB5D4', grade: '#2A2538', barra: '#8B5CF6', meta: '#C4B5FD', ok: '#A78BFA' }
    : { card: '#FFFFFF', texto: '#1F2937', suave: '#6B7280', grade: '#E5E7EB', barra: '#06B6D4', meta: '#0E7490', ok: '#10B981' };
  const corBarra = ultrapassou ? '#F97316' : atingiuMeta ? tema.ok : tema.barra;
  const status = !objetivo ? 'Defina uma meta para acompanhar seu progresso.'
    : ultrapassou ? `Passou ${formatar(total - objetivo)} kcal`
      : atingiuMeta ? 'Meta atingida! 🎉' : `Faltam ${formatar(objetivo - total)} kcal`;

  return (
    <View style={[styles.card, { backgroundColor: tema.card, borderColor: tema.grade }]}>
      <Text style={[styles.titulo, { color: tema.texto }]}>Calorias do dia</Text>
      <Text style={[styles.subtitulo, { color: tema.suave }]}>
        {formatar(total)} de {objetivo ? formatar(objetivo) : '—'} kcal
      </Text>
      <View style={styles.area} accessibilityRole="progressbar" accessibilityLabel="Calorias consumidas no dia" accessibilityValue={{ min: 0, max: 100, now: Math.min(percentual, 100), text: objetivo ? `${percentual}% da meta. ${status}` : status }}>
        <View style={styles.eixo}>
          {MARCAS.map((marca) => <Text key={marca} style={[styles.eixoTexto, { color: tema.suave }]}>{objetivo ? formatar(Math.round(objetivo * marca)) : '—'}</Text>)}
        </View>
        <View style={styles.grafico}>
          {MARCAS.map((marca) => <View key={marca} style={[styles.linha, { top: (1 - marca) * ALTURA, backgroundColor: marca === 1 ? tema.meta : tema.grade }]} />)}
          <View style={styles.colunaBarra}>
            <Animated.View style={[styles.barra, { height: animacao.interpolate({ inputRange: [0, 1], outputRange: [0, ALTURA] }), backgroundColor: corBarra }]} />
          </View>
        </View>
      </View>
      <View style={styles.rodape}>
        <Text style={[styles.percentual, { color: corBarra }]}>{objetivo ? `${percentual}%` : '—'}</Text>
        <Text style={[styles.status, { color: tema.suave }]}>{status}</Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  card: { borderRadius: 16, borderWidth: 1, padding: 16, shadowColor: '#000', shadowOpacity: 0.08, shadowRadius: 10, shadowOffset: { width: 0, height: 4 }, elevation: 3 },
  titulo: { fontSize: 16, fontWeight: '700' },
  subtitulo: { fontSize: 13, marginBottom: 20, marginTop: 2 },
  area: { flexDirection: 'row', alignItems: 'center' },
  eixo: { height: ALTURA + 12, justifyContent: 'space-between', marginRight: 8 },
  eixoTexto: { fontSize: 10, textAlign: 'right', minWidth: 36 },
  grafico: { flex: 1, height: ALTURA },
  linha: { position: 'absolute', left: 0, right: 0, height: 1 },
  colunaBarra: { ...StyleSheet.absoluteFillObject, justifyContent: 'flex-end', alignItems: 'center' },
  barra: { width: 72, borderTopLeftRadius: 8, borderTopRightRadius: 8 },
  rodape: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginTop: 16, gap: 12 },
  percentual: { fontSize: 28, fontWeight: '800' },
  status: { fontSize: 13, flexShrink: 1, textAlign: 'right' },
});
