# Cadastro e acesso do app

O app esta configurado para usar o backend por `EXPO_PUBLIC_API_URL`. O modo demo e opcional e deve permanecer desligado nas builds conectadas (`EXPO_PUBLIC_DEMO_MODE=false`). O arquivo `.env.example` documenta esses valores; ajuste a URL para um endereco alcancavel pelo dispositivo antes de iniciar ou publicar.

## Fluxos conectados

- Login e cadastro usam `/api/auth/login` e `/api/auth/register`.
- Consulta de nutricionista e solicitacao de vinculo usam a API autenticada.
- Diario, agua e medidas usam os endpoints do backend; o armazenamento local serve como cache.

## Recuperacao de senha

A tela ainda nao esta integrada a uma API de recuperacao de senha para pacientes. O modo conectado informa que o recurso esta indisponivel; nao apresenta a simulacao local como uma alteracao real de credenciais. Para concluir esse fluxo, o backend precisa oferecer solicitacao e confirmacao de recuperacao com token e envio de e-mail.

## Modo de demonstracao

Quando `EXPO_PUBLIC_DEMO_MODE=true`, partes de autenticacao, vinculo e diario passam a usar dados locais/de exemplo. Nao use essa opcao em distribuicoes conectadas. O valor atual neste checkout e `false`.
