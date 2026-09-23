# Prévia do cadastro e acesso

Esta etapa foi implementada como **frontend de demonstração**, a pedido do responsável pelo projeto. `services/demo.ts` mantém `DEMO_MODE = true`. Não desative esse modo antes de integrar e revisar a autenticação no servidor.

- Login: botão **Explorar demonstração sem cadastro**. Não autentica credenciais reais.
- Cadastro: nove etapas com objetivo e pergunta adaptativa, sexo, aniversário, movimento diário, medidas, preferências, origem e credenciais. Campos anteriores são preservados ao voltar.
- Nutricionista: selecione **Meu nutri está aqui**, digite **1234**, confira Ana Souza e confirme. O vínculo é aplicado ao concluir a conta de demonstração. IDs diferentes exibem erro. **Não tenho o código agora** segue sem vínculo; a conexão posterior está disponível no perfil e no plano.
- Recuperação: percurso de e-mail, prévia do link, nova senha e confirmação. Não envia e-mail, não cria token e não altera credenciais.
- O contexto de onboarding e os perfis de demonstração ficam apenas na memória da sessão. Recarregar o app descarta os dados. Senhas ficam no estado da tela, não são incluídas nos perfis, no armazenamento persistente ou nos parâmetros de navegação.

## Validações de interface

Datas reais (incluindo anos bissextos), e-mail, números decimais com vírgula ou ponto, medidas e coerência do peso desejado. A senha aceita frases, espaços e símbolos, de 15 a 128 caracteres, com bloqueio básico de sequências e repetições; confirmação obrigatória. Referência para comprimento e frases: [OWASP Authentication Cheat Sheet](https://cheatsheetseries.owasp.org/cheatsheets/Authentication_Cheat_Sheet.html). A checagem local não é um verificador completo de senhas vazadas.

Executar `node scripts/check-onboarding.cjs`, `npx tsc --noEmit` e lint nos arquivos alterados. Os fluxos visuais também devem ser conferidos no navegador e, antes da publicação, em builds nativos.

## Integração posterior

Revalidar no servidor todos os campos e a senha; definir autorização, sessão, política de menores, consentimento e persistência do perfil. Substituir a autenticação legada que consulta a lista de pacientes e compara senha no cliente. Adicionar hash de senha, respostas sem credenciais, controle de tentativas e recuperação para **pacientes** com tokens únicos/expiráveis e envio real de e-mail. O controlador público do site consultado nesta etapa suporta recuperação de nutricionistas/administradores, não confirma suporte a pacientes.

O cadastro com código deve validar o profissional e criar paciente/vínculo de forma atômica no backend, respeitando a regra de aprovação do nutricionista. Na prévia, o vínculo ativo é somente uma simulação. Não foram alterados ou publicados serviços no Render.
