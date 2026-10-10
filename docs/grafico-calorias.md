# Evolução diária de calorias

`components/GraficoEvolucaoCalorias.tsx` recebe `refeicoes`, `metaDiaria`, `macros` e, opcionalmente, `refeicoesPlanejadas`, `origemMeta` e `onEditarMeta`.
`EvolucaoCaloriasDiaria` conecta esse componente ao diário existente e à edição de meta. Não cria um segundo diário.

Biblioteca: `react-native-gifted-charts` (MIT), escolhida por já oferecer área em degradê, linha de referência e animações, usando `react-native-svg` e `expo-linear-gradient`, presentes no app. Documentação: https://github.com/Abhinandan-Kushwaha/react-native-gifted-charts

## Contrato da meta

- `GET /api/diario/meta`, com Bearer do paciente: `{ calorias, origem, editavel, refeicoes: [{ indice, nome, horario }] }`.
- `PUT /api/diario/meta`, mesmo Bearer, corpo `{ "calorias": 2000 }`: salva a meta pessoal e devolve o mesmo contrato. Valida inteiro positivo até 20.000; esse limite é técnico, não uma recomendação nutricional. Se houver meta de plano, retorna 409 para impedir sobrescrita acidental.
- Prioridade: `metaCalorias` ou `caloriasDiarias` do plano estruturado ativo; senão, soma das calorias de todas as refeições do plano (somente se todas estiverem informadas); senão, `Paciente.metaCalorias`; senão, padrão editável de 2.000 kcal. Prescrições profissionais e planos solo estruturados seguem a mesma regra.
- Um plano com `ativo: false` não define a meta. Prescrições antigas em texto permanecem legíveis, mas não são interpretadas como números.
- A coluna opcional `pacientes.meta_calorias` é criada pelo Hibernate com a configuração existente `ddl-auto=update` ao iniciar a API.

## Data, atualização e apresentação

O diário envia `entryDate` (data local) e `criadoEm` (instante real). A coluna opcional `diario_refeicoes.data_registro` preserva o dia escolhido mesmo após 21h em São Paulo. Registros antigos usam a data já existente; não se reescrevem históricos. Quando não há horário antigo disponível, o gráfico usa a ordem do plano ou café/almoço/lanche/jantar e informa “Sem horário”.

Cada registro salvo produz um ponto acumulado. Adicionar, corrigir ou remover uma refeição atualiza o gráfico através do contexto do diário. Marcar uma refeição prescrita também usa esse fluxo, com `referenciaId` persistida para não duplicar a mesma conclusão.

A curva e a barra animam por 600 ms. O cruzamento da meta pulsa discretamente na linha de referência; a preferência de movimento reduzido desativa as animações. A linha usa segmentos sem ultrapassar os valores registrados. Os pontos e os nomes das refeições podem ser tocados para consultar detalhes. Muitas refeições permitem rolagem horizontal.

As barras de macros comparam as quantidades consumidas em gramas entre si; não inventam metas de macros. Refeições restantes são as ainda não registradas do plano ou, sem plano, da rotina estimada de quatro refeições. Uma refeição repetida não consome dois horários diferentes. A estimativa divide a diferença da meta pela quantidade restante, e desaparece ao atingir a meta ou terminar os horários previstos.

As cores seguem o progresso: menos de 50% neutro, de 50% a menos de 90% ciano/roxo, de 90% a 100% verde, acima de 100% laranja. O tema acompanha a preferência do app; sem preferência salva, acompanha o sistema.

Fonte dos valores nutricionais: TACO 4ª edição, NEPA/UNICAMP. Valores aproximados por alimento médio.

## Verificações

`node scripts/check-calorie-evolution.cjs` verifica ordem, acumulado, faixas, remoção e estimativas. `npx tsc --noEmit` verifica o app. Em `api-java`, `mvn test` verifica a precedência e as alternativas de meta sem acessar o banco.
