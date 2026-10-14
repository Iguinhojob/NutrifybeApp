# Fybe — assistente de navegação do NutriFybe

O Fybe é o mascote do NutriFybe e funciona como um guia do app do paciente. Ele explica cada tela, responde dúvidas frequentes e conduz tutoriais que destacam os elementos reais da interface.

**O Fybe não é uma inteligência artificial.** Todo o conteúdo é fixo e está em `components/fybe/content.ts`. Não há chamadas a serviços externos, chaves de API nem dependências novas. O Fybe também não dá orientação nutricional ou clínica: ele só mostra onde ficam as funções do app.

## Onde aparece
- Nas telas logadas com barra de abas: Início, Plano, Chat, Evolução, Perfil, Histórico, Água e IMC.
- Não aparece na abertura, no login, no cadastro nem nas telas públicas.
- No chat com acompanhamento ativo, o botão flutuante cobriria o campo de mensagem. Por isso ele vai para o cabeçalho da conversa.

## Como funciona para o paciente
1. **Apresentação.** No primeiro acesso à tela Início depois do login, o Fybe se apresenta uma única vez, com as opções "Vamos lá!" (inicia o tour) e "Explorar sozinho". A apresentação pode ser vista de novo pelo painel.
2. **Botão flutuante.** Fica no canto inferior direito, acima da barra de abas e respeitando as áreas seguras. Some durante um tutorial e com o teclado aberto.
3. **Painel de ajuda.** No celular é uma folha que sobe da parte de baixo; em telas largas (a partir de 768 px), uma janela flutuante à direita. O painel tem:
   - o que dá para fazer na tela atual;
   - perguntas frequentes, com atalhos para outras telas;
   - os tutoriais, com a marca de concluído;
   - o tutorial pausado, se houver.
   Os atalhos só navegam: nenhuma ação do Fybe altera dados do paciente.
4. **Tutoriais.** O tutorial escurece a tela, contorna o elemento real e mostra um cartão com:
   - "Etapa n de m" e uma barra de progresso;
   - os botões Voltar, Próximo/Concluir e Pular, além do botão para fechar.

   A camada do tutorial não bloqueia toques, então o app continua utilizável.

## Tutoriais disponíveis
| Tutorial | Tela | Etapas |
|---|---|---|
| Conheça o NutriFybe | Início | resumo do dia, Registrar refeição, acompanhamento, diário, atalhos, encerramento |
| Registrar uma refeição | Início | botão, explicação do formulário, registros do dia, dias anteriores |
| Plano e acompanhamento | Plano | status do acompanhamento, plano atual, medidas |
| Acompanhar a evolução | Evolução | resumo da meta, gráficos, histórico de medidas |
| Perfil e ferramentas | Perfil | perfil nutricional, acompanhamento, mais ferramentas, configurações |

## Comportamento do motor de tutoriais
- **Elementos reais.** Cada elemento é marcado com `<FybeTarget id="...">` e encontrado pelo `id`, nunca por coordenadas fixas. A posição é medida a cada 150 ms e também a cada rolagem (na web), então o destaque acompanha a rolagem, a rotação e o tamanho da tela.
- **Rolagem automática.** O tutorial rola a tela até o elemento. Quando o elemento e o cartão não cabem juntos, o elemento vai para o topo. Elementos no fim da página ganham um espaço extra temporário (`FybeTourSpacer`), que só existe enquanto o tutorial está aberto naquela tela.
- **Elemento ausente.** Se o elemento não aparece em 1,2 s, o cartão mostra uma mensagem alternativa e o paciente segue para a próxima etapa normalmente.
- **Troca de tela.** Um tutorial de outra tela navega até ela sozinho. Se o paciente trocar de aba por conta própria, o tutorial é pausado e um aviso explica como continuar. O painel oferece "Continuar" (mesma etapa, na tela certa) ou "Recomeçar".
- **Sair da conta** encerra tutoriais e fecha o painel.

## Persistência
Ficam salvos só no aparelho, no AsyncStorage, com a chave `nutrifybe:fybe:v1`:
```json
{ "introSeen": true, "completed": { "apresentacao": true } }
```
Não são guardados dados pessoais, de saúde nem o conteúdo das telas.

## Acessibilidade
- Botões com nome acessível, área de toque mínima de 44 pt e rótulos em texto (o destaque é um contorno, não só uma cor).
- O painel e a apresentação são diálogos modais e fecham pelo botão, pelo fundo, pelo botão voltar do Android e pela tecla Esc na web.
- Ao abrir um tutorial na web, o foco do teclado vai para o texto da etapa. Nas etapas seguintes, o texto novo é anunciado por uma região `aria-live`. No celular, cada etapa é anunciada ao leitor de tela.
- Esc encerra o tutorial.
- A barra de progresso tem papel e valores acessíveis.
- Com "reduzir movimento" ativo no aparelho, o aceno do mascote e as animações de entrada são desligados.

## Arquivos
| Arquivo | Papel |
|---|---|
| `components/fybe/content.ts` | textos, ajuda por tela e etapas dos tutoriais |
| `components/fybe/FybeProvider.tsx` | estado, motor dos tutoriais, navegação, pausa e registro de elementos |
| `components/fybe/FybeTarget.tsx` | `FybeTarget`, `useFybeScroll` e `FybeTourSpacer` |
| `components/fybe/FybeButton.tsx` | botão flutuante e versão para cabeçalho |
| `components/fybe/FybePanel.tsx` | painel de ajuda |
| `components/fybe/FybeIntro.tsx` | apresentação inicial |
| `components/fybe/FybeTour.tsx` | camada do tutorial e mensagem de conclusão |
| `components/fybe/FybeLayer.tsx` | junta as camadas no layout raiz |
| `components/fybe/storage.ts` | preferências locais |
| `assets/images/fybe.png`, `fybe-avatar.png` | recortes da ilustração original `mascote.png`, sem redesenho |

## Como adicionar um tutorial
1. Marque o elemento na tela com `<FybeTarget id="tela.elemento">…</FybeTarget>`. O wrapper não muda o layout.
2. Se a tela rola, passe `ref={useFybeScroll('/caminho')}` ao `ScrollView`.
3. Acrescente o tutorial em `TUTORIALS`, com `route`, `target` e, se o elemento puder faltar, `fallback`.
4. Se quiser, ligue o tutorial à ajuda da tela pelo campo `tutorialId` em `SCREENS`.

## Testes
`tests/e2e/fybe_web.py` roda o app exportado para web, com a API simulada, em três tamanhos:
- celular de 390 x 844;
- celular pequeno de 320 x 568, com tema escuro e movimento reduzido;
- computador de 1280 x 800, incluindo a troca para paisagem.

O teste cobre:
- apresentação única;
- painel;
- navegação pelos tutoriais;
- destaque no elemento certo;
- elemento ausente;
- pausa e retomada;
- persistência;
- chat;
- teclado;
- erros de console.

As instruções de execução estão no começo do arquivo.

## Limitações
- O teste automatizado roda na versão web. No Android e no iOS, a medição usa `measureInWindow` e a rolagem usa `measureLayout`; essas partes não foram testadas em aparelho físico neste trabalho.
- Em telas muito baixas (celular deitado), o cartão pode cobrir parte do elemento destacado. O destaque continua visível e os botões funcionam.
- O Fybe existe só no app do paciente. O site do nutricionista pode receber uma versão parecida no futuro.
