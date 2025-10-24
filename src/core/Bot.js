/**
 * Bot Principal
 * Orquestra todos os módulos e serviços
 */

const express = require('express');
const qrcode = require('qrcode-terminal');
const Logger = require('../utils/logger');
const CONFIG = require('../config');
const WhatsAppClient = require('./WhatsAppClient');
const UserManager = require('../modules/UserManager');
const CommandHandler = require('../modules/CommandHandler');
const QuestionnaireFlow = require('../modules/QuestionnaireFlow');
const ReminderScheduler = require('../modules/ReminderScheduler');
const AIService = require('../services/AIService');
const StorageService = require('../services/StorageService');
const MessageFormatter = require('../services/MessageFormatter');

const logger = new Logger('FitnessBot');

class FitnessBot {
  constructor() {
    this.whatsappClient = new WhatsAppClient();
    this.reminderScheduler = null;
    this.commandHandler = null;
    this.isReady = false;
  }

  async initialize() {
    logger.success(`Iniciando ${CONFIG.BOT_NAME}...`);

    // Inicializar serviços
    await UserManager.initialize();
    logger.success('UserManager inicializado');

    // Configurar cliente WhatsApp
    this.whatsappClient.initialize();

    // Criar CommandHandler
    this.commandHandler = new CommandHandler(this.whatsappClient.getClient());

    // Criar ReminderScheduler
    this.reminderScheduler = new ReminderScheduler(this.whatsappClient.getClient());

    // Configurar event handlers
    this.whatsappClient.setupEventHandlers({
      onQR: this.handleQR.bind(this),
      onReady: this.handleReady.bind(this),
      onMessage: this.handleMessage.bind(this),
      onDisconnected: this.handleDisconnected.bind(this),
      onAuthFailure: this.handleAuthFailure.bind(this)
    });

    // Iniciar servidor API
    this.startAPI();

    // Iniciar cliente
    await this.whatsappClient.start();
  }

  async handleQR(qr) {
    logger.info('QR Code gerado:');
    qrcode.generate(qr, { small: true });
  }

  handleReady() {
    this.isReady = true;
    logger.success('Bot conectado com sucesso!');
    this.reminderScheduler.start();
  }

  handleDisconnected(reason) {
    this.isReady = false;
    logger.error(`Bot desconectado: ${reason}`);

    setTimeout(() => {
      logger.info('Tentando reconectar...');
      this.whatsappClient.getClient().initialize();
    }, 5000);
  }

  handleAuthFailure(msg) {
    logger.error(`Falha na autenticação: ${msg}`);
  }

  async handleMessage(message) {
    try {
      // Filtros básicos
      if (message.from.includes('@g.us') || message.from === 'status@broadcast' || message.fromMe) {
        return;
      }

      //Pega informação do nome do Usuario 
      const userId = message.from;
      const contact = await message.getContact();
      const userName = contact.pushname || contact.name || 'Amigo';
      const msg = message.body.toLowerCase().trim();

      // Log da interação
      await StorageService.logInteraction(userId, 'message', msg);

      // Verificar se é um comando
      if (await this.commandHandler.handleCommand(message, userId, userName)) {
        return;
      }

      // Obter ou criar usuário
      let user = UserManager.getUser(userId);
      if (!user) {
        // ✅ NOVO USUÁRIO: Auto-inicia /start com QUALQUER mensagem
        user = await UserManager.createUser(userId, userName);
        await message.reply(`Oi ${userName}! 👋 Bem-vindo ao ${CONFIG.BOT_NAME}! 💧`);
        
        // Inicia questionnaire automaticamente
        await message.reply(MessageFormatter.formatQuestionnaireStart(userName));
        return;
      }

      // Questionário em andamento
      if (user.step) {
        await QuestionnaireFlow.handleQuestionnaireStep(message, user, userId, userName);
        return;
      }

      // ✅ BOT INTELIGENTE: Usuário completo, step=null, qualquer mensagem vai para IA
      const aiResponse = await AIService.generateResponse(msg, {
        userId,
        userName,
        ...user
      });

      await message.reply(aiResponse);
    } catch (err) {
      logger.error('Erro ao processar mensagem:', err);
    }
  }

  startAPI() {
    const app = express();
    app.use(express.json());

    // Rotas de saúde
    app.get('/health', (req, res) => {
      res.json({
        status: this.isReady ? 'healthy' : 'unhealthy',
        timestamp: Date.now()
      });
    });

    // Status do bot
    app.get('/api/status', (req, res) => {
      res.json({
        status: this.isReady ? 'online' : 'offline',
        uptime: process.uptime(),
        users: {
          total: UserManager.getUsersCount(),
          active: UserManager.getActiveUsers().length
        },
        timestamp: new Date().toISOString()
      });
    });

    // Lista de usuários (apenas estatísticas)
    app.get('/api/users', (req, res) => {
      const users = UserManager.getAllUsers().map(u => ({
        name: u.name,
        active: u.reminders,
        goal: u.waterGoal,
        interval: u.reminderInterval / 60000
      }));
      res.json(users);
    });

    // Broadcast de mensagens (requer autenticação básica)
    app.post('/api/broadcast', async (req, res) => {
      const apiKey = req.headers['x-api-key'];
      if (apiKey !== CONFIG.API_KEY) {
        return res.status(401).json({ error: 'Unauthorized' });
      }

      const { message } = req.body;
      if (!message) {
        return res.status(400).json({ error: 'Message required' });
      }

      let sent = 0;
      for (const user of UserManager.getActiveUsers()) {
        try {
          const userId = Array.from(UserManager.users.entries()).find(
            ([, userData]) => userData === user
          )?.[0];

          if (userId) {
            await this.whatsappClient.getClient().sendMessage(userId, message);
            sent++;
          }
        } catch (err) {
          logger.error(`Erro ao enviar broadcast: ${err}`);
        }
      }

      res.json({ sent, total: UserManager.getUsersCount() });
    });

    app.listen(CONFIG.PORT, () => {
      logger.success(`API rodando em http://localhost:${CONFIG.PORT}`);
    });
  }

  async shutdown() {
    logger.info('Encerrando bot...');
    this.reminderScheduler.stop();
    await this.whatsappClient.stop();
    process.exit(0);
  }
}

module.exports = FitnessBot;
