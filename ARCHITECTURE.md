## 📊 Estrutura Modularizada Completa

```
whatsapp-fitness-bot/
├── src/
│   ├── core/
│   │   ├── Bot.js                    # Classe principal que orquestra tudo
│   │   └── WhatsAppClient.js         # Encapsula cliente WhatsApp Web.js
│   │
│   ├── modules/
│   │   ├── UserManager.js            # CRUD de usuários e gerenciamento
│   │   ├── QuestionnaireFlow.js      # Fluxo do questionário interativo
│   │   ├── ReminderScheduler.js      # Agendador de lembretes
│   │   └── CommandHandler.js         # Parser e executor de comandos
│   │
│   ├── services/
│   │   ├── AIService.js              # Integração com Ollama
│   │   ├── StorageService.js         # Persistência de dados em JSON
│   │   └── MessageFormatter.js       # Formatação de mensagens
│   │
│   ├── config/
│   │   └── index.js                  # Configurações centralizadas
│   │
│   └── utils/
│       ├── logger.js                 # Sistema de logging
│       └── validators.js             # Validação de entrada
│
├── index.js                          # Ponto de entrada principal
├── package.json
├── .env.example
├── README.md
├── data/                             # Dados persistentes (auto-criado)
└── session/                          # Sessão WhatsApp (auto-criado)
```

## 🏗️ Arquitetura

### Fluxo de Dados

```
Mensagem WhatsApp
        ↓
    Bot.js (handler)
        ↓
    CommandHandler? → Comandos
        ↓ Não
    UserManager.step? → QuestionnaireFlow
        ↓ Não
    AIService → Resposta IA
        ↓
    Envia Mensagem de Volta
```

### Responsabilidades

| Camada | Responsabilidade |
|--------|------------------|
| **core/Bot.js** | Orquestração, event handlers, API REST |
| **core/WhatsAppClient.js** | Configuração e gerenciamento do cliente |
| **modules/UserManager.js** | CRUD de usuários, queries |
| **modules/QuestionnaireFlow.js** | Estados e validação do questionário |
| **modules/ReminderScheduler.js** | Agendamento e envio de lembretes |
| **modules/CommandHandler.js** | Routing e execução de comandos |
| **services/AIService.js** | Integração com IA local (Ollama) |
| **services/StorageService.js** | Leitura/escrita de arquivos JSON |
| **services/MessageFormatter.js** | Templates de mensagens formatadas |
| **config/index.js** | Variáveis de ambiente e constantes |
| **utils/logger.js** | Logging estruturado com emojis |
| **utils/validators.js** | Validação e mensagens de erro |

## 🔄 Fluxos Principais

### 1. Novo Usuário
```
User: "Oi"
  → Bot.js: sem usuário → UserManager.createUser()
  → Retorna mensagem de boas-vindas
```

### 2. Questionário
```
User: "/start"
  → CommandHandler.cmdStart()
  → UserManager.updateUserStep('idade')
  → Loop através de: idade → peso → atividade → intervalo
  → Cada resposta: QuestionnaireFlow.handleXxx()
  → ReminderScheduler.start() após conclusão
```

### 3. Comando
```
User: "/status"
  → CommandHandler.handleCommand()
  → Matches "/status" → cmdStatus()
  → MessageFormatter.formatStatus()
  → Envia mensagem formatada
```

### 4. Mensagem Normal
```
User: "Olá"
  → Não é comando, usuário completo
  → AIService.generateResponse()
  → Ollama processing ou Fallback
  → Envia resposta
```

### 5. Lembrete
```
ReminderScheduler.checkAndSendReminders() a cada 1 min
  → Filtra usuários ativos
  → Valida tempo desde último lembrete
  → MessageFormatter.formatReminderMessage()
  → Envia para cada usuário
  → Atualiza lastReminder
```

## 📝 Padrões Utilizados

- **Singleton**: UserManager, StorageService, AIService, QuestionnaireFlow
- **Factory**: UserManager.createUser()
- **Strategy**: AIService (IA vs Fallback)
- **Observer**: Event handlers do WhatsApp
- **Dependency Injection**: Passagem de `client` e `message`

## 🚀 Como Estender

### Adicionar Novo Comando
1. Crie método `cmdXxx` em `CommandHandler`
2. Adicione à lista de `commands`

### Adicionar Nova Etapa do Questionário
1. Crie método `handleXxx` em `QuestionnaireFlow`
2. Adicione case no switch de `handleQuestionnaireStep`

### Adicionar Novo Validador
1. Adicione método `isValidXxx` em `validators.js`
2. Use em `QuestionnaireFlow` ou `CommandHandler`

### Personalizar Mensagens
1. Adicione método `formatXxx` em `MessageFormatter`
2. Use em handlers apropriados

## ✅ Benefícios da Arquitetura

✅ **Testabilidade**: Cada módulo é independente e testável
✅ **Manutenibilidade**: Código organizado e com responsabilidades claras
✅ **Escalabilidade**: Fácil adicionar novos comandos/fluxos
✅ **Reusabilidade**: Services podem ser usados por múltiplos módulos
✅ **Legibilidade**: Estrutura clara e bem documentada
✅ **Isolamento**: Mudanças em um módulo não afetam os outros
