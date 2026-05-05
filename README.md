# 🥗 Nutrifybe - App de Nutrição Inteligente

Aplicativo React Native completo para acompanhamento nutricional personalizado.

## 📱 Funcionalidades

### ✅ Autenticação
- **Splash Screen** com animação de loading
- **Login** com validação
- **Cadastro em 2 etapas**: "Sobre Você" + Finalização
- **Tela de Confirmação** de cadastro

### 🏠 Telas Principais (Tabs)
1. **Início (Home)**
   - Dashboard com resumo do dia (calorias, macros)
   - Calendário semanal interativo
   - Registro de refeições por dia (modal)
   - Botão para acessar dieta semanal

2. **Histórico**
   - Lista de dias com indicadores semáforo (verde/amarelo/vermelho)
   - Visualização de calorias e status por dia

3. **Tendências**
   - Gráfico de linha com evolução de calorias
   - Estatísticas: média, meta atingida, melhor/pior dia
   - Resumo semanal

4. **Dieta Semanal**
   - Plano alimentar completo para 7 dias
   - Detalhes de cada refeição (calorias, proteínas, carboidratos, gorduras)
   - Total de calorias por dia

5. **Perfil**
   - Visualização e edição de dados pessoais
   - Menu com opções: Configurações, Sobre Nós, Termos, Privacidade
   - Modal de confirmação para logout

### 📄 Telas Institucionais
- **Sobre Nós**: Missão e informações do app
- **Política de Privacidade**: Uso de dados
- **Termos e Condições**: Regras de uso
- **Configurações**: Notificações, aparência, dados

## 🚀 Como Executar

### Pré-requisitos
- Node.js instalado
- Expo CLI
- Emulador Android/iOS ou Expo Go no celular

### Instalação
```bash
cd d:\Inf3bm\pdmo
npm install
```

### Executar
```bash
# Iniciar servidor Expo
npm start

# Android
npm run android

# iOS
npm run ios

# Web
npm run web
```

## 📂 Estrutura do Projeto

```
pdmo/
├── app/
│   ├── (tabs)/              # Navegação principal
│   │   ├── index.tsx        # Home
│   │   ├── history.tsx      # Histórico
│   │   ├── trends.tsx       # Tendências
│   │   ├── diet.tsx         # Dieta Semanal
│   │   └── profile.tsx      # Perfil
│   ├── auth/                # Autenticação
│   │   ├── login.tsx
│   │   ├── about-you.tsx
│   │   ├── register.tsx
│   │   └── success.tsx
│   ├── institutional/       # Telas institucionais
│   │   ├── about.tsx
│   │   ├── privacy.tsx
│   │   ├── terms.tsx
│   │   └── settings.tsx
│   ├── _layout.tsx          # Layout raiz
│   └── index.tsx            # Splash Screen
├── context/
│   └── auth.tsx             # Contexto de autenticação
├── constants/
│   └── theme.ts             # Cores e tema
└── package.json
```

## 🎨 Paleta de Cores

- **Primary**: `#4CAF50` (Verde)
- **Secondary**: `#FF9800` (Laranja)
- **Success**: `#4CAF50` (Verde)
- **Warning**: `#FFC107` (Amarelo)
- **Danger**: `#F44336` (Vermelho)
- **Background**: `#F5F5F5` (Cinza claro)

## 🔐 Credenciais de Teste

Para testar o login, use qualquer email e senha com 6+ caracteres:
- Email: `teste@nutrifybe.com`
- Senha: `123456`

## 🔄 Fluxo do Usuário

1. **Splash Screen** (2.5s) → Login
2. **Login** ou **Cadastro** (Sobre Você → Registro → Sucesso)
3. **Home** (Dashboard + Calendário + Registro)
4. **Navegação** entre tabs (Home, Histórico, Tendências, Dieta, Perfil)
5. **Perfil** → Configurações/Institucional → Logout

## 📊 Dados Simulados

O app usa dados mockados para demonstração:
- Histórico de 7 dias com status variados
- Dieta semanal completa com 4 refeições/dia
- Gráfico de tendências com dados de calorias

## 🛠️ Tecnologias

- **React Native** 0.81.5
- **Expo** ~54.0
- **Expo Router** (navegação file-based)
- **TypeScript**
- **React Context API** (gerenciamento de estado)

## 📝 Próximos Passos

Para produção, considere adicionar:
- [ ] Backend real (API REST)
- [ ] Banco de dados (Firebase/Supabase)
- [ ] Autenticação real (JWT)
- [ ] Gráficos com biblioteca (Victory/Recharts)
- [ ] Notificações push
- [ ] Integração com wearables
- [ ] Modo offline
- [ ] Testes unitários

## 📄 Licença

Projeto educacional - Nutrifybe © 2025
