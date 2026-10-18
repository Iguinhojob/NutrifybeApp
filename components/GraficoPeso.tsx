import { useEffect, useRef } from 'react';
import { Animated, Easing, StyleSheet, Text, View } from 'react-native';

type PontoPeso = { value: number | null; date: Date };
type Props = { pontos: PontoPeso[]; meta: number; escuro: boolean };
const ALTURA = 220;
const MARCAS = [1, 0.75, 0.5, 0.25, 0];
const formatar = (valor: number) => valor.toLocaleString('pt-BR', { maximumFractionDigits: 1 });

export default function GraficoPeso({ pontos, meta, escuro }: Props) {
  const animacao = useRef(new Animated.Value(0)).current;
  const registros = pontos.filter((p): p is PontoPeso & { value: number } => p.value != null && Number.isFinite(p.value) && p.value > 0 && Number.isFinite(p.date.getTime())).slice(-7);
  const objetivo = Number.isFinite(meta) && meta > 0 ? meta : null;
  const atual = registros.at(-1)?.value;
  const maximo = Math.max(10, Math.ceil(Math.max(...registros.map(p => p.value), objetivo ?? 0) / 10) * 10);
  const chave = registros.map(p => `${p.date.getTime()}:${p.value}`).join('|');

  useEffect(() => {
    animacao.setValue(0);
    const animation = Animated.timing(animacao, { toValue: 1, duration: 900, easing: Easing.out(Easing.cubic), useNativeDriver: false });
    animation.start();
    return () => animation.stop();
  }, [animacao, chave, objetivo]);

  const tema = escuro
    ? { card: '#17141F', texto: '#FFFFFF', suave: '#BFB5D4', grade: '#2A2538', barra: '#8B5CF6', meta: '#C4B5FD' }
    : { card: '#FFFFFF', texto: '#1F2937', suave: '#6B7280', grade: '#E5E7EB', barra: '#06B6D4', meta: '#0E7490' };
  const diferenca = atual != null && objetivo != null ? atual - objetivo : null;
  const status = diferenca == null ? 'Defina uma meta para acompanhar seu peso.' : Math.abs(diferenca) < 0.05 ? 'Peso igual à meta' : `${formatar(Math.abs(diferenca))} kg ${diferenca > 0 ? 'acima' : 'abaixo'} da meta`;

  return <View style={[styles.card, { backgroundColor: tema.card, borderColor: tema.grade }]}>
    <Text style={[styles.titulo, { color: tema.texto }]}>Evolução do peso</Text>
    <Text style={[styles.subtitulo, { color: tema.suave }]}>{atual != null ? `${formatar(atual)} kg` : 'Sem registros'} · Meta: {objetivo != null ? `${formatar(objetivo)} kg` : 'não definida'}</Text>
    {registros.length === 0 ? <View style={styles.vazio}><Text style={{ color: tema.suave, textAlign: 'center' }}>Registre seu peso para formar o gráfico.</Text></View> : <>
      <View style={styles.area} accessibilityLabel={`Histórico de peso. Último registro: ${formatar(atual!)} quilos. ${status}`}>
        <View style={styles.eixo}>{MARCAS.map(m => <Text key={m} style={[styles.rotuloEixo, { color: tema.suave }]}>{formatar(maximo * m)}</Text>)}</View>
        <View style={styles.grafico}>
          {MARCAS.map(m => <View key={m} style={[styles.linha, { top: (1 - m) * ALTURA, backgroundColor: tema.grade }]} />)}
          <View style={styles.colunas}>{registros.map((p, index) => <View key={`${p.date.getTime()}-${index}`} style={styles.coluna}>
            <Text numberOfLines={1} style={[styles.valor, { color: tema.texto }]}>{formatar(p.value)}</Text>
            <Animated.View style={[styles.barra, { backgroundColor: tema.barra, height: animacao.interpolate({ inputRange: [0, 1], outputRange: [0, p.value / maximo * ALTURA] }) }]} />
          </View>)}</View>
          {objetivo != null && <View pointerEvents="none" style={[styles.linhaMeta, { bottom: objetivo / maximo * ALTURA, borderColor: tema.meta }]} />}
        </View>
      </View>
      <View style={styles.datas}><View style={{ width: 44 }} />{registros.map((p, index) => <Text key={`${p.date.getTime()}-${index}`} style={[styles.data, { color: tema.suave }]}>{p.date.toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit' })}</Text>)}</View>
      {objetivo != null && <Text style={[styles.legenda, { color: tema.meta }]}>— Meta: {formatar(objetivo)} kg</Text>}
      <View style={styles.rodape}><Text style={[styles.atual, { color: tema.barra }]}>{formatar(atual!)} kg</Text><Text style={[styles.status, { color: tema.suave }]}>{status}</Text></View>
      <Text style={[styles.legenda, { color: tema.suave }]}>Últimos {registros.length} {registros.length === 1 ? 'registro' : 'registros'}</Text>
    </>}
  </View>;
}

const styles = StyleSheet.create({
  card: { borderRadius: 16, borderWidth: 1, padding: 16, shadowColor: '#000', shadowOpacity: 0.08, shadowRadius: 10, shadowOffset: { width: 0, height: 4 }, elevation: 3 },
  titulo: { fontSize: 16, fontWeight: '700' }, subtitulo: { fontSize: 13, marginTop: 2, marginBottom: 24 },
  vazio: { minHeight: 160, justifyContent: 'center', alignItems: 'center' },
  area: { flexDirection: 'row', alignItems: 'center' }, eixo: { height: ALTURA + 12, width: 36, justifyContent: 'space-between', marginRight: 8 },
  rotuloEixo: { fontSize: 10, textAlign: 'right' }, grafico: { height: ALTURA, flex: 1 },
  linha: { position: 'absolute', left: 0, right: 0, height: 1 }, linhaMeta: { position: 'absolute', left: 0, right: 0, borderTopWidth: 1.5, borderStyle: 'dashed' },
  colunas: { ...StyleSheet.absoluteFill, flexDirection: 'row', alignItems: 'flex-end' }, coluna: { flex: 1, alignItems: 'center', justifyContent: 'flex-end' },
  barra: { width: '65%', maxWidth: 44, borderTopLeftRadius: 6, borderTopRightRadius: 6 }, valor: { fontSize: 9, fontWeight: '700', marginBottom: 3 },
  datas: { flexDirection: 'row', marginTop: 6 }, data: { flex: 1, fontSize: 9, textAlign: 'center' },
  rodape: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginTop: 14, gap: 12 }, atual: { fontSize: 24, fontWeight: '800' },
  status: { fontSize: 13, flexShrink: 1, textAlign: 'right' }, legenda: { fontSize: 11, marginTop: 8, textAlign: 'center' },
});
