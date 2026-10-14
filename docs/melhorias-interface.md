# Melhorias de interface — app do paciente

## Navegação
- A barra inferior passou de 6 para 5 abas: **Início, Plano, Chat, Evolução e Perfil**. Os rótulos ficaram em 12 pt, o item ativo usa ícone preenchido e a altura respeita a área segura do aparelho.
- O **Histórico** saiu da barra e continua acessível pelo botão "Histórico" do diário, pelos atalhos do Início e pela nova seção **Mais ferramentas** do Perfil, junto com Água, Medidas, IMC e Notificações. Antes, a tela de notificações não tinha nenhum caminho de acesso.

## Tela inicial
- Mostra primeiro o resumo do consumo do dia, com o botão **Registrar refeição** dentro do mesmo cartão.
- A meta do dia segue a mesma regra do gráfico da aba Evolução (`hooks/use-daily-goal.ts`): o plano do nutricionista tem prioridade e, sem plano, vale a estimativa do app. A origem da meta aparece escrita ("meta do seu plano alimentar" ou "meta estimada pelo app").
- No diário, cada registro tem os botões **Editar** e **Excluir** visíveis. Quando o registro não pode ser editado (não tem itens da tabela TACO), o botão aparece como "Não editável" e o motivo é explicado logo abaixo.
- A previsão da meta de peso desceu para o fim da tela, marcada como **Estimativa**, com o aviso de que pode variar e não é uma recomendação clínica.

## Registro de refeição
- Etapas numeradas: 1. tipo de refeição (opções acessíveis como "radio"), 2. busca na tabela TACO, 3. conferência das porções em **gramas**.
- Antes de salvar, um resumo mostra o total em kcal e os macronutrientes com o nome escrito por extenso.
- Uma quantidade inválida é sinalizada no próprio alimento. O botão de salvar fica desativado e explica o motivo.
- Depois de salvar ou excluir, um aviso de confirmação aparece na tela. Se der erro, a mensagem explica como tentar de novo e mantém os dados preenchidos.

## Estado do acompanhamento
- O componente `FollowUpStatusCard` mostra o estado no Início (versão compacta), no Plano, no Chat e no Perfil:
  - **Modo solo**: ações "Encontrar nutricionista" e "Tenho o ID do nutricionista";
  - **Aguardando resposta**: explica o que fica liberado depois do aceite e leva ao perfil do profissional;
  - **Acompanhamento ativo**: ações "Abrir conversa" e "Ver perfil do nutricionista".
- Cada estado tem ícone e texto, sem depender só da cor.

## Busca de nutricionistas
- Busca por nome, especialidade ou CRN, com filtros de especialidade montados a partir dos dados reais.
- Nome, especialidade e CRN ganharam destaque nos cartões. As notas vêm do endpoint `/api/nutricionistas/{id}/avaliacoes`: sem avaliações, aparece "Ainda sem avaliações".
- Busca sem resultado: oferece "Limpar filtros" e "Tenho o ID de um nutricionista". Antes, uma falha de conexão aparecia como lista vazia; agora mostra erro com a opção de tentar de novo.
- No perfil do profissional, "Perfil verificado" virou "Cadastro aprovado pela Nutrifybe", que só aparece se o status for `approved`. Anos de experiência e formas de atendimento só aparecem quando existem. O botão "Solicitar acompanhamento" vem acompanhado da lista dos dados compartilhados.

## Acessibilidade e consistência
- O ciano do tema claro foi escurecido para `#0E7490`, que dá contraste de 5,4:1 com texto branco (o ciano `#00BCD4` tinha 2,3:1). O ciano original continua disponível no token `brand`.
- Também foram ajustados para melhor contraste o vermelho, o verde, o amarelo, o texto secundário e os ícones inativos da barra nos dois temas. Novo token `primaryText` para links e textos de destaque.
- Novos componentes compartilhados em `components/ui-kit.tsx`: botão (mínimo de 44 pt de altura), cartão, selo de status, aviso, estados vazio, de carregamento e de erro, e aviso temporário (toast) com anúncio para leitores de tela.
- Conteúdo com largura máxima em telas grandes e ajustes para telas de 320 px.

## Correções encontradas no caminho
- `nutri/directory.tsx` chamava um hook depois de um `return` condicional, o que quebra a regra de hooks do React.
- Mensagem de erro com acentuação corrompida em `context/auth.tsx`.
- Em navegador (web), `Alert.alert` não aparece. No Perfil, os erros passaram a usar o aviso temporário.

## Sessão
- O login agora é mantido entre aberturas do app. O token fica guardado no armazenamento seguro do aparelho (`expo-secure-store`) e é apagado ao sair.

## Pendências que dependem da API ou de funcionalidade nova
- **Cancelar uma solicitação pendente**: não existe endpoint. O paciente fica aguardando até o nutricionista responder.
- **Recusa ou encerramento**: a API devolve o paciente ao modo solo sem guardar o motivo nem a data. Por isso o app não consegue mostrar "solicitação recusada" ou "vínculo encerrado".
- **Notificações**: ficam só em memória e se perdem ao fechar o app.
- **Anos de experiência, áreas de atuação e formas de atendimento**: só existem nos perfis de demonstração. A API não tem esses campos.
