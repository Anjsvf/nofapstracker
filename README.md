# Documentação Fap Zero
**Aplicativo de Autocontrole e Monitoramento de Hábitos**

---

## Índice
1. [Visão Geral](#visão-geral)
2. [Recursos Principais](#recursos-principais)
3. [Arquitetura Técnica](#arquitetura-técnica)
4. [Instalação e Configuração](#instalação-e-configuração)
5. [Estrutura do Projeto](#estrutura-do-projeto)
6. [APIs e Serviços](#apis-e-serviços)
7. [Base de Dados](#base-de-dados)
8. [Sistema de Conquistas](#sistema-de-conquistas)
9. [Chat Global](#chat-global)
10. [Funcionalidades Offline](#funcionalidades-offline)
11. [Notificações](#notificações)
12. [Histórico e Relatórios](#histórico-e-relatórios)
13. [Configurações e Personalização](#configurações-e-personalização)
14. [Troubleshooting](#troubleshooting)


---

## Visão Geral

O **Fap Zero** é um aplicativo de autocontrole desenvolvido em React Native/Expo, projetado para ajudar usuários no desenvolvimento de disciplina pessoal através do monitoramento de hábitos saudáveis. O app oferece um sistema de conquistas gamificado, chat de apoio comunitário e funcionalidades offline robustas.

### Características Principais
- **Multiplataforma**: iOS, Android e Web
- **Funcionalidade Offline Completa**
- **Sistema de Conquistas Gamificado**
- **Chat Global com Suporte de Áudio**
- **Histórico Detalhado de Progresso**
- **Notificações Motivacionais**
- **Interface Moderna e Responsiva**

### Público-Alvo
Indivíduos buscando desenvolver autocontrole e disciplina pessoal através de monitoramento de hábitos e apoio comunitário.

---

## Recursos Principais

### 1. Timer de Progresso
- Contador em tempo real de dias, horas e minutos
- Visualização circular de progresso diário
- Indicadores visuais de status (ativo/pausado)
- Cálculo automático de sequências (streaks)

### 2. Sistema de Conquistas (Badges)
- **25+ badges únicos** organizados em 9 divisões
- Progressão desde "Iniciante" até "Deus Chad"
- Imagens personalizadas para cada conquista
- Sistema de divisões temáticas:
  - Divisão Zero (0-3 dias)
  - Divisão Beta (4-7 dias)
  - Divisão Resistência (10-14 dias)
  - Divisão Guerreiro (20-30 dias)
  - Divisão Prime (40-60 dias)
  - Divisão Lendária (70-90 dias)
  - Divisão Sigma (120-180 dias)
  - Divisão Chad (240-365 dias)
  - Divisão Imortal (366+ dias)

### 3. Chat Global
- Mensagens de texto em tempo real
- Mensagens de áudio com player integrado
- Sistema de reações com emojis
- Resposta a mensagens (threading)
- Indicador de usuários online
- Funcionalidade offline completa

### 4. Perfil e Histórico
- Estatísticas detalhadas de progresso
- Histórico completo de resets
- Calendário visual de resets
- Compartilhamento de progresso
- Dados de uso e engajamento

---

## Arquitetura Técnica

### Stack Tecnológica
```
Frontend:
- React Native 0.74+
- Expo SDK 51+
- TypeScript
- React Navigation 6
- Expo Router

Backend:
- Node.js/Express (não incluído no código)
- Socket.io para real-time
- Sistema de autenticação JWT

Base de Dados:
- SQLite (local) via expo-sqlite
- AsyncStorage para configurações
- Sincronização bidirecional

Notificações:
- Expo Notifications
- Notificações locais e push

Áudio:
- Expo AV para gravação/reprodução
- Suporte a formato M4A
```

### Padrões Arquiteturais
- **Repository Pattern** para acesso a dados
- **Service Layer** para lógica de negócio
- **Custom Hooks** para reutilização de lógica
- **Context API** para gerenciamento de estado global
- **Offline-First** approach

---

## Instalação e Configuração

### Pré-requisitos
```bash
Node.js 18+
Expo CLI
Android Studio / Xcode (para builds nativos)
```

### Configuração do Ambiente
```bash
# Clone do repositório
git clone [repository-url]
cd fap-zero

# Instalação de dependências
npm install

# Configuração de variáveis de ambiente
cp .env.example .env

# Variáveis necessárias
EXPO_PUBLIC_API_URL_DEV=http://localhost:3000
EXPO_PUBLIC_API_URL_PROD=https://api.fapzero.com
```

### Execução em Desenvolvimento
```bash
# Servidor de desenvolvimento
npm start

# Plataformas específicas
npm run android
npm run ios
npm run web
```

### Build para Produção
```bash
# Build EAS
eas build --platform all

# Build local
npm run build
```

---


---

## APIs e Serviços

### AuthService
```typescript
interface AuthService {
  register(username: string, email: string, password: string): Promise<AuthResult>
  login(email: string, password: string): Promise<AuthResult>
  verifyEmail(code: string, email: string): Promise<boolean>
  forgotPassword(email: string): Promise<boolean>
  resetPassword(email: string, code: string, newPassword: string): Promise<boolean>
  logout(): Promise<boolean>
}
```

### BadgeService
```typescript
interface BadgeService {
  getBadgeInfo(currentStreak: number): Badge | null
  getNextBadge(currentStreak: number): Badge | null
  getAllBadges(): Badge[]
  getBadgeProgress(currentStreak: number): BadgeProgress
  getBadgesByCategory(category: string): Badge[]
}
```

### StorageService
```typescript
interface StorageService {
  saveTimerState(timerState: TimerState): Promise<void>
  loadTimerState(): Promise<TimerState | null>
  incrementTotalResets(currentStreak: number): Promise<void>
  saveResetHistory(history: ResetHistoryEntry[]): Promise<void>
  loadResetHistory(): Promise<ResetHistoryEntry[]>
}
```

---

## Base de Dados

### Estrutura SQLite

#### Tabela Messages
```sql
CREATE TABLE messages (
  _id TEXT PRIMARY KEY,
  username TEXT NOT NULL,
  text TEXT NOT NULL,
  type TEXT NOT NULL DEFAULT 'text',
  audioUri TEXT,
  audioDuration INTEGER,
  timestamp TEXT NOT NULL,
  replyTo TEXT,
  reactions TEXT DEFAULT '{}',
  isOwn INTEGER NOT NULL DEFAULT 0,
  isSynced INTEGER NOT NULL DEFAULT 1,
  isPending INTEGER NOT NULL DEFAULT 0,
  tempId TEXT,
  createdAt TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
);
```

#### Tabela Sync Queue
```sql
CREATE TABLE sync_queue (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  messageId TEXT NOT NULL,
  action TEXT NOT NULL,
  data TEXT NOT NULL,
  createdAt TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
  attempts INTEGER NOT NULL DEFAULT 0,
  maxAttempts INTEGER NOT NULL DEFAULT 3
);
```

### AsyncStorage
- `timerState`: Estado atual do timer
- `username`: Nome do usuário
- `profileData`: Dados do perfil
- `resetHistory`: Histórico de resets

---

## Sistema de Conquistas

### Estrutura de Badge
```typescript
interface Badge {
  key: string
  name: string
  days: number
  category: string
  imageSource: ImageSource
}
```

### Divisões e Progressão
O sistema possui 25+ badges organizados em 9 divisões, cada uma representando marcos importantes no desenvolvimento de disciplina:

1. **Divisão Zero** (0-3 dias): Primeiros passos
2. **Divisão Beta** (4-7 dias): Construção de hábito
3. **Divisão Resistência** (10-14 dias): Desenvolvimento de força mental
4. **Divisão Guerreiro** (20-30 dias): Disciplina estabelecida
5. **Divisão Prime** (40-60 dias): Excelência pessoal
6. **Divisão Lendária** (70-90 dias): Conquistas raras
7. **Divisão Sigma** (120-180 dias): Elite de autodisciplina
8. **Divisão Chad** (240-365 dias): Maestria completa
9. **Divisão Imortal** (366+ dias): Transcendência

---

## Chat Global

### Recursos do Chat
- **Mensagens em tempo real** via WebSocket
- **Mensagens de áudio** com gravação e reprodução
- **Sistema de reações** com emojis personalizáveis
- **Threading** (resposta a mensagens)
- **Indicadores de status** (online/offline)
- **Sincronização offline** completa

### Funcionalidades Offline
- Armazenamento local de mensagens
- Fila de sincronização automática
- Indicadores visuais de status de envio
- Recuperação automática ao voltar online

### Sistema de Reações
```typescript
interface Reactions {
  [emoji: string]: string[] // Array de usernames
}
```

---

## Funcionalidades Offline

### Estratégia Offline-First
O aplicativo foi projetado para funcionar completamente offline, sincronizando quando há conectividade:

1. **Armazenamento Local**: SQLite + AsyncStorage
2. **Fila de Sincronização**: Operações pendentes
3. **Detecção de Rede**: Automática via NetInfo
4. **Reconciliação**: Merge inteligente de dados
5. **Retry Logic**: Tentativas automáticas de sincronização

### Componentes Offline
- Timer e badges funcionam 100% offline
- Chat armazena mensagens localmente
- Histórico mantido independente de conexão
- Notificações funcionam localmente

---

## Notificações

### Tipos de Notificação
1. **Conquistas de Badge**: Ao desbloquear nova conquista
2. **Marcos Diários**: Completar 24h de progresso
3. **Motivacionais**: Mensagens de encorajamento
4. **Lembretes**: Manter consistência (futuro)

### Implementação
```typescript
interface NotificationService {
  requestPermissions(): Promise<boolean>
  showBadgeNotification(badge: Badge): Promise<void>
  showDayCompletionNotification(streak: number): Promise<void>
}
```

---

## Histórico e Relatórios

### Calendário de Resets
- Visualização mensal de resets
- Diferentes cores para dias limpos vs. dias com reset
- Detalhamento por data com horários exatos
- Estatísticas de conquistas perdidas

### Estatísticas do Perfil
- Total de resets registrados
- Tempo no aplicativo
- Sequência atual e máxima
- Conquistas desbloqueadas

### Exportação de Dados
Funcionalidade futura para exportar histórico completo.

---

## Configurações e Personalização

### Setup Manual
- **Começar do Zero**: Nova jornada
- **Importar Progresso**: Continuar de outro app
- Validação de entrada de dados
- Desbloqueio automático de badges

### Preferências
- Notificações personalizáveis
- Temas (futuro)
- Idiomas (futuro)

---

## Troubleshooting

### Problemas Comuns

#### 1. Sincronização Falha
**Sintomas**: Mensagens não sincronizam
**Soluções**:
```typescript
// Força sincronização manual
await syncService.syncWithServer(username)

// Reset da base de dados
await databaseManager.resetDatabase()
```

#### 2. Timer Não Atualiza
**Sintomas**: Contador parado
**Soluções**:
- Verificar se o timer está ativo
- Recarregar estado do storage
- Verificar permissões de background

#### 3. Badges Não Desbloqueiam
**Sintomas**: Conquistas não aparecem
**Soluções**:
- Verificar cálculo de streak
- Forçar recálculo de badges
- Limpar cache local

#### 4. Chat Offline
**Sintomas**: Mensagens não enviam
**Soluções**:
- Verificar conectividade
- Limpar fila de sincronização
- Reconectar WebSocket

### Logs e Debug
```typescript
// Habilitar logs detalhados
console.log('DEBUG_MODE:', __DEV__)

// Verificar estado da base de dados
const stats = await databaseManager.getStats()
console.log('DB Stats:', stats)
```

---



---

## Contribuição e Desenvolvimento

### Padrões de Código
- TypeScript estrito
- ESLint + Prettier
- Conventional Commits
- Testes unitários (futuro)

### Processo de Deploy
1. Desenvolvimento em feature branches
2. Pull requests com review
3. Build automático via EAS
4. Deploy gradual por plataforma



---

*Documentação atualizada em: setembrom 2025*
*Versão do App: 1.0.7*