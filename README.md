# Nutrifybe — app do paciente

App mobile do Nutrifybe feito com **React Native + Expo (SDK 54)** e **Expo Router**. O paciente registra refeições (tabela TACO), água e medidas, encontra um nutricionista, envia a solicitação de acompanhamento, recebe o plano alimentar e conversa pelo chat.

A API e o site do nutricionista e do administrador ficam no repositório **TCC** (`api-java/` e `src/`). O app só se comunica com essa API, nunca diretamente com o banco de dados.

## Como rodar
1. Copie `.env.example` para `.env`.
2. Em `EXPO_PUBLIC_API_URL`, informe o endereço da API:
   - emulador Android: `http://10.0.2.2:8080`;
   - celular físico: o IP local do computador, por exemplo `http://192.168.0.10:8080`;
   - produção: a URL HTTPS pública da API.
3. Rode `npm install` e depois `npm start`.

O modo de demonstração (`EXPO_PUBLIC_DEMO_MODE=true`) usa perfis locais e não envia nada ao servidor. Deixe `false` para usar a API.

> Variáveis `EXPO_PUBLIC_*` ficam visíveis dentro do app. Nunca coloque senhas ou chaves nelas.

## Sessão
O token de acesso fica guardado no armazenamento seguro do aparelho (`expo-secure-store`). Assim, o paciente continua conectado ao reabrir o app. Ao tocar em "Sair", o token é apagado. Na versão web, o token fica no armazenamento do navegador.

## Estrutura
- `app/(tabs)`: Início (resumo do dia e diário), Plano, Chat, Evolução e Perfil, além de Histórico, Água e IMC, abertos pelos atalhos.
- `app/nutri`: busca de nutricionistas, perfil do profissional, solicitação, avaliação e medidas.
- `app/auth`: boas-vindas, cadastro em etapas, login e recuperação de senha.
- `components/ui-kit.tsx`: botões, cartões, avisos e estados de carregamento, vazio e erro compartilhados.
- `components/follow-up-status.tsx`: estado do acompanhamento (modo solo, aguardando resposta ou ativo).
- `context/`: autenticação, diário, tema e cadastro.
- `services/api.ts`: chamadas à API.

Os detalhes das mudanças de interface e as limitações conhecidas estão em `docs/melhorias-interface.md`.
