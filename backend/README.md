# Nutrifybe API

API Spring Boot 3.5 / Java 21 para o app Expo. Os dados ficam em tabelas próprias `app_*` no SQL Server; o backend não altera tabelas legadas. Na primeira inicialização, Hibernate cria/atualiza essas tabelas.

## Executar localmente

1. Copie `.env.example` para `.env` e preencha credenciais do banco, `JWT_SECRET` e `ADMIN_API_KEY`. Não envie `.env` ao Git.
2. Configure as variáveis no terminal (ou use um carregador de `.env`) e execute `mvn spring-boot:run` nesta pasta.
3. Health check: `GET http://localhost:8080/actuator/health`.
4. No app, configure `EXPO_PUBLIC_API_URL` com a URL acessível do backend. Para celular físico, use o IP LAN do computador durante o desenvolvimento; `localhost` no celular aponta para o próprio celular.

Gere valores aleatórios diferentes para `JWT_SECRET` e `ADMIN_API_KEY`, com pelo menos 32 bytes. Defina as variáveis no painel de secrets do provedor Java. Para o SQL Server, use `DB_HOST=nutrifybe_db.mssql.somee.com`, `DB_NAME=nutrifybe_db`, `DB_USERNAME` e a senha atualizada no Somee. O usuário e a senha do banco existem somente no backend, nunca no app mobile.

O servidor de aplicação Java precisa alcançar o SQL Server do Somee pela porta TCP 1433. O Somee deve permitir conexões remotas a partir da rede/saída do servidor Java. Não exponha a porta do SQL Server ao app; somente a API HTTPS deve ser pública.

## API

- `POST /api/auth/register` — cria conta com senha derivada via PBKDF2 e retorna token JWT e perfil.
- `POST /api/auth/login` — autentica e retorna token JWT e perfil.
- `GET /api/pacientes/{id}`, `PUT /api/pacientes/{id}` — leitura/edição do próprio perfil; token de outro paciente recebe 403.
- `GET /api/nutricionistas`, `GET /api/nutricionistas/{id}` — lista/consulta nutricionistas ativos e aprovados.
- `GET/POST /api/solicitacoesPendentes`, `DELETE /api/solicitacoesPendentes/{id}` — solicitações do próprio paciente.
- `GET/POST /api/diario/refeicoes`, `DELETE /api/diario/refeicoes/{id}` — refeições e calorias do próprio paciente, filtradas por data.
- `GET/POST/DELETE /api/diario/agua` — registros de hidratação do próprio paciente, filtrados por data.
- `POST/PUT /api/admin/nutricionistas`, `GET/PATCH /api/admin/solicitacoesPendentes` — operações administrativas com `X-Admin-Key`.
- `GET /actuator/health` — disponibilidade da API.

As requisições de perfil e vínculo usam `Authorization: Bearer <token>`. Não há endpoint público que liste pacientes, e a resposta de perfil nunca inclui senha ou hash.

## Publicação

Construa o container com `docker build -t nutrifybe-api .` e publique-o num provedor que execute containers Java. Configure as variáveis listadas no `.env.example` no ambiente do provedor, habilite HTTPS e a origem CORS do app web. O Somee é o host do banco; esta entrega não publica automaticamente a API num host Java.

Contas que estejam apenas no banco antigo não são copiadas para `app_patients`; planeje a migração antes de cortar o backend antigo. O esquema novo é independente para evitar alterações destrutivas em tabelas preexistentes.
