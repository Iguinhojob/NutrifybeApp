# Nutrifybe

App mobile feito com Expo e API em Spring Boot conectada ao SQL Server do Somee.

## Mobile

1. Copie `.env.example` para `.env`.
2. Configure `EXPO_PUBLIC_API_URL` com o endereço da API.
3. Execute `npm install` e `npm start`.

Para Android Emulator, use `http://10.0.2.2:8080`. Para um celular físico, informe o IP local do computador durante o desenvolvimento. Em produção, configure uma URL HTTPS pública.

O modo de demonstração fica desligado por padrão. Para habilitá-lo localmente, use `EXPO_PUBLIC_DEMO_MODE=true`; no modo conectado, deixe-o como `false`.

## API e SQL Server

A API está em [backend](./backend/README.md). Ela guarda contas, metas, solicitações de vínculo, refeições e consumo de água nas tabelas `app_*`, sem alterar as tabelas legadas. As senhas são armazenadas com PBKDF2; o mobile recebe um token JWT e nunca acessa o SQL Server diretamente.

Configure `DB_USERNAME`, `DB_PASSWORD`, `JWT_SECRET` e `ADMIN_API_KEY` como variáveis de ambiente no provedor da API. Não coloque credenciais reais em arquivos versionáveis nem em variáveis `EXPO_PUBLIC_*`. O Somee fornece o SQL Server, mas a API Java precisa ser publicada separadamente num serviço que execute Java 21/containers.

As credenciais do SQL Server compartilhadas na conversa devem ser trocadas no painel do Somee antes da publicação. O backend não contém a senha enviada.
