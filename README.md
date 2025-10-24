# 💧 WhatsApp Fitness Bot v2.0

Um bot de WhatsApp inteligente para ajudar usuários a manter uma boa hidratação diária com lembretes personalizados e IA local.

## 🎯 Características

- ✅ **IA Local** com Ollama (sem custos de API)
- ✅ **Lembretes Personalizados** com intervalo configurável por usuário
- ✅ **Cálculo Automático** de meta de água baseado em idade, peso e atividade
- ✅ **Persistência de Dados** com JSON
- ✅ **API REST** para monitoramento e broadcast
- ✅ **Sistema de Comandos** completo
- ✅ **Código Modularizado** e bem organizado
- ✅ **Logging Detalhado** para debugging

## 📋 Pré-requisitos

- Node.js 14+
- npm ou yarn
- Ollama instalado e rodando (opcional, mas recomendado)
- Conta do WhatsApp

## 🚀 Instalação

1. **Clone ou baixe o projeto**
```bash
cd whatsapp-fitness-bot
```

2. **Instale as dependências**
```bash
npm install
```

3. **Configure as variáveis de ambiente**
```bash
cp .env.example .env
# Edite o arquivo .env conforme necessário
```

4. **Inicie o Ollama** (em outro terminal)
```bash
ollama serve
```

5. **Execute o bot**
```bash
npm start
```

6. **Escaneie o QR Code** com seu WhatsApp

## 📁 Estrutura do Projeto

```
whatsapp-fitness-bot/
├── src/
│   ├── core/
│   │   ├── Bot.js                 # Classe principal do bot
│   │   └── WhatsAppClient.js      # Cliente WhatsApp encapsulado
│   │
│   ├── modules/
│   │   ├── UserManager.js         # Gerenciamento de usuários
│   │   ├── QuestionnaireFlow.js   # Fluxo do questionário
│   │   ├── ReminderScheduler.js   # Sistema de lembretes
│   │   └── CommandHandler.js      # Handler de comandos
│   │
│   ├── services/
│   │   ├── AIService.js           # Integração com Ollama
│   │   ├── StorageService.js      # Persistência de dados
│   │   └── MessageFormatter.js    # Formatação de mensagens
│   │
│   ├── config/
│   │   └── index.js               # Configurações centralizadas
│   │
│   └── utils/
│       ├── validators.js          # Validadores
│       └── logger.js              # Sistema de logging
│
├── data/                          # Dados (criado automaticamente)
├── session/                       # Sessão do WhatsApp (criado automaticamente)
├── index.js                       # Ponto de entrada
├── package.json
├── .env.example
└── README.md
```

## 💬 Comandos Disponíveis

| Comando | Descrição |
|---------|-----------|
| `/start` | Iniciar configuração e lembretes |
| `/stop` | Pausar lembretes |
| `/status` | Ver status e configurações |
| `/help` | Listar comandos disponíveis |
| `/meta` | Alterar meta diária de água |
| `/intervalo` | Alterar intervalo entre lembretes |
| `/historico` | Ver progresso (últimos 7 dias) |
| `/reset` | Resetar configurações |

## ⚙️ Configuração

### Variáveis de Ambiente

```bash
# Horários de funcionamento
BUSINESS_HOURS_START=8      # Começa às 8h
BUSINESS_HOURS_END=22       # Termina às 22h

# Porta da API
PORT=3000

# Ollama
OLLAMA_BASE_URL=http://localhost:11434
OLLAMA_MODEL=llama2

# Logging
DEBUG=false
LOG_INTERACTIONS=true
```

## 🤖 Modelos Ollama Disponíveis

Você pode usar diferentes modelos:

```bash
ollama pull llama2           # Recomendado
ollama pull mistral
ollama pull phi
ollama pull neural-chat
```

## 📊 API REST

### Status do Bot
```bash
GET http://localhost:3000/api/status
```

Resposta:
```json
{
  "status": "online",
  "uptime": 3600,
  "users": {
    "total": 5,
    "active": 3
  }
}
```

### Listar Usuários
```bash
GET http://localhost:3000/api/users
```

### Enviar Mensagem em Broadcast
```bash
POST http://localhost:3000/api/broadcast
Headers: X-API-Key: sua-chave-secreta
Body: {
  "message": "Olá a todos! Lembrem-se de beber água! 💧"
}
```

## 🔧 Desenvolvimento

### Adicionar Novo Comando

1. Crie o método em `CommandHandler.js`:
```javascript
async cmdMeuComando(message, userId, userName) {
  await message.reply('Resposta do comando');
}
```

2. Adicione à lista de comandos:
```javascript
const commands = {
  '/meucomando': () => this.cmdMeuComando(message, userId, userName),
  // ...
};
```

### Adicionar Nova Etapa do Questionário

1. Crie o método em `QuestionnaireFlow.js`:
```javascript
async handleNovaEtapa(message, user, userId, msg, userName) {
  // Lógica da etapa
}
```

2. Adicione ao switch em `handleQuestionnaireStep`:
```javascript
case 'nova_etapa':
  await this.handleNovaEtapa(message, user, userId, msg, userName);
  break;
```

## 📝 Logs

Os logs são salvos em:
- `data/logs.json` - Interações dos usuários

Para ativar debug:
```bash
DEBUG=true npm start
```

## 🐛 Troubleshooting

### Ollama não conecta
```bash
# Verifique se Ollama está rodando
ollama serve

# Testar conexão
curl http://localhost:11434/api/status
```

### QR Code não aparece
- Certifique-se que o terminal suporta emojis
- Aumente o tamanho da janela do terminal

### Bot desconecta frequentemente
- Verifique sua conexão de internet
- Aumente o `qrMaxRetries` em `WhatsAppClient.js`

## 📦 Scripts NPM

```bash
npm start       # Iniciar o bot
npm run dev     # Iniciar em modo desenvolvimento (com nodemon)
npm run lint    # Verificar estilo do código
npm test        # Executar testes
```

## 📄 Licença

MIT - Veja LICENSE para detalhes

## 🤝 Contribuindo

1. Fork o projeto
2. Crie uma branch para sua feature (`git checkout -b feature/AmazingFeature`)
3. Commit suas mudanças (`git commit -m 'Add some AmazingFeature'`)
4. Push para a branch (`git push origin feature/AmazingFeature`)
5. Abra um Pull Request

## 📞 Suporte

Para reportar bugs ou sugerir melhorias, abra uma issue no repositório.

---

Feito com 💧 e ❤️
