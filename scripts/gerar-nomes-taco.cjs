// Generates display names only; the original TACO CSV and nutrient values stay intact.
const fs = require('fs');
const path = require('path');
const csv = fs.readFileSync(process.argv[2], 'utf8');
const overrides = {
  7: 'Aveia em flocos crua', 8: 'Biscoito doce de maisena',
  11: 'Biscoito wafer recheado de chocolate', 12: 'Biscoito wafer recheado de morango',
  13: 'Biscoito salgado cream cracker', 14: 'Mistura para bolo',
  15: 'Bolo de aipim pronto', 16: 'Bolo de chocolate pronto', 17: 'Bolo de coco pronto', 18: 'Bolo de milho pronto',
  21: 'Cereal de milho em flocos com sal', 22: 'Cereal de milho em flocos sem sal',
  23: 'Mingau infantil de milho', 24: 'Mistura de trigo, cevada e aveia para vitamina',
  25: 'Cereal matinal de milho', 26: 'Cereal matinal de milho com açúcar',
  27: 'Creme de arroz em pó', 28: 'Creme de milho em pó', 29: 'Curau de milho verde', 30: 'Mistura para curau de milho verde',
  37: 'Massa fresca de lasanha cozida', 38: 'Massa fresca de lasanha crua',
  40: 'Macarrão de trigo cru', 41: 'Macarrão de trigo com ovos cru',
  42: 'Amido de milho cru', 43: 'Fubá de milho cru', 46: 'Mingau tradicional em pó',
  47: 'Pamonha pré-cozida em barra para cozimento',
  48: 'Pão de forma de aveia', 50: 'Pão de forma de glúten', 51: 'Pão de forma de milho',
  52: 'Pão de forma integral de trigo', 53: 'Pão francês de trigo', 54: 'Pão sovado de trigo',
  59: 'Massa de pastel crua', 60: 'Massa de pastel frita', 63: 'Torrada de pão francês',
  90: 'Batata chips industrializada', 99: 'Biscoito de polvilho doce',
  114: 'Folhas de coentro desidratadas', 119: 'Espinafre da Nova Zelândia cru', 120: 'Espinafre da Nova Zelândia refogado',
  125: 'Broto de feijão cru', 131: 'Farofa de mandioca temperada', 135: 'Folha de mostarda crua', 136: 'Nhoque de batata cozido',
  158: 'Extrato de tomate', 159: 'Molho de tomate industrializado', 160: 'Purê de tomate', 161: 'Tomate para salada',
  171: 'Ameixa em calda enlatada', 176: 'Doce de banana em barra',
  198: 'Goiabada em pasta', 199: 'Goiabada cascão',
  224: 'Doce de mamão em calda drenado', 227: 'Doce de mamão verde em calda drenado',
  277: 'Atum em conserva em óleo', 319: 'Sardinha em conserva em óleo',
  324: 'Caldo de carne em tablete', 325: 'Caldo de galinha em tablete',
  330: 'Almôndegas bovinas cruas', 331: 'Almôndegas bovinas fritas',
  384: 'Carne bovina seca cozida', 385: 'Carne bovina seca crua',
  446: 'Bebida láctea de pêssego', 447: 'Creme de leite',
  456: 'Leite de vaca desnatado em pó', 459: 'Leite de vaca integral em pó',
  466: 'Queijo petit suisse de morango', 468: 'Requeijão cremoso', 469: 'Ricota',
  471: 'Café preparado por infusão a 10%', 472: 'Aguardente de cana', 473: 'Caldo de cana', 474: 'Cerveja pilsen',
  475: 'Chá de erva-doce preparado por infusão a 5%', 476: 'Chá mate preparado por infusão a 5%', 477: 'Chá preto preparado por infusão a 5%',
  478: 'Água de coco', 486: 'Clara de ovo de galinha cozida por 10 minutos',
  487: 'Gema de ovo de galinha cozida por 10 minutos', 488: 'Ovo de galinha inteiro cozido por 10 minutos',
  491: 'Achocolatado em pó', 502: 'Geleia de mocotó natural', 505: 'Maria-mole de coco queimado',
  511: 'Café torrado em pó', 512: 'Capuccino em pó', 514: 'Fermento biológico em tablete',
  515: 'Gelatina em pó de sabores variados', 519: 'Tempero à base de sal',
  520: 'Azeitona preta em conserva', 521: 'Azeitona verde em conserva',
  527: 'Baião de dois com arroz e feijão-de-corda', 529: 'Bife a cavalo com contrafilé',
  535: 'Molho cuxá', 542: 'Macarrão ao molho bolonhesa',
  557: 'Amendoim em grão cru', 579: 'Paçoca de amendoim', 580: 'Pé-de-moleque de amendoim',
  581: 'Farinha de soja', 582: 'Extrato de soja natural líquido', 583: 'Extrato de soja em pó', 584: 'Tofu (queijo de soja)',
  593: 'Semente de gergelim', 594: 'Semente de linhaça',
};
function format(original, id) {
  if (overrides[id]) return overrides[id];
  const parts = original.trim().split(/\s*,\s*/);
  let head = parts.shift();
  if (head === 'Carne' && parts[0] === 'bovina') {
    parts.shift();
    head = `${parts.shift()} bovino`;
    if (/^(capa|costela|fraldinha|língua|maminha|paleta|picanha)\b/.test(head)) head = head.replace(/bovino$/, 'bovina');
  } else if ((head === 'Frango' || head === 'Porco') && /^(asa|coração|coxa|fígado|filé|peito|sobrecoxa|bisteca|costela|lombo|orelha|pernil|rabo)$/.test(parts[0])) {
    head = `${parts.shift()} de ${head.toLowerCase()}`;
  } else if (/^(filé|posta)$/.test(parts[0])) {
    head = `${parts.shift()} de ${head.toLowerCase()}`;
  } else if (parts[0] === 'polpa') {
    parts.shift(); head = `Polpa de ${head.toLowerCase()}`;
  } else if (parts.includes('suco')) {
    parts.splice(parts.indexOf('suco'), 1); head = `Suco de ${head.toLowerCase()}`;
  } else if (parts[0] === 'suco concentrado') {
    parts.shift(); head = `Suco concentrado de ${head.toLowerCase()}`;
  } else if (['Lingüiça', 'Nhoque', 'Cereal matinal', 'Bebida láctea', 'Geléia'].includes(head) && parts.length) {
    head = `${head} de ${parts.shift()}`;
  }
  let name = [head, ...parts].join(' ').replace(/\s+/g, ' ').trim();
  name = name.replace(/Lingüiça/g, 'Linguiça').replace(/Geléia/g, 'Geleia').replace(/mingnon/g, 'mignon').replace(/contra-filé/g, 'contrafilé');
  name = name.replace(/\bpó\b/g, 'em pó').replace(/65%de/g, '65% de');
  return name[0].toLocaleUpperCase('pt-BR') + name.slice(1);
}
const names = {};
for (const line of csv.split(/\r?\n/).slice(1)) {
  if (!line.trim()) continue;
  const fields = line.match(/("(?:[^"]|"")*"|[^,]*)(,|$)/g).map(s => s.replace(/,$/, '').replace(/^"|"$/g, '').replace(/""/g, '"'));
  names[fields[1].trim()] = format(fields[1], Number(fields[0]));
}
for (const output of process.argv.slice(3)) {
  fs.mkdirSync(path.dirname(output), { recursive: true });
  fs.writeFileSync(output, JSON.stringify(names, null, 2) + '\n');
}
console.log(`Nomes de exibição gerados para ${Object.keys(names).length} alimentos.`);
