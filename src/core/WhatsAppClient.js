/**
 * Cliente WhatsApp
 * Encapsula a configuração do cliente WhatsApp Web.js
 */

const { Client, LocalAuth } = require('whatsapp-web.js');
const qrcode = require('qrcode-terminal');
const path = require('path');
const Logger = require('../utils/logger');
const CONFIG = require('../config');

const logger = new Logger('WhatsAppClient');

class WhatsAppClient {
  constructor() {
    this.client = null;
  }

  initialize() {
    this.client = new Client({
      authStrategy: new LocalAuth({
        dataPath: CONFIG.SESSION_PATH,
        clientId: 'fitness-bot'
      }),
      puppeteer: {
        headless: true,
        args: [
          '--no-sandbox',
          '--disable-setuid-sandbox',
          '--disable-gpu',
          '--disable-dev-shm-usage',
          '--disable-web-security',
          '--disable-features=site-per-process',
          '--no-first-run',
          '--no-zygote',
          '--single-process',
          '--disable-background-timer-throttling',
          '--disable-renderer-backgrounding',
          '--disable-backgrounding-occluded-windows',
          '--disable-ipc-flooding-protection'
        ]
      },
      qrMaxRetries: 3,
      restartOnAuthFail: true
    });

    return this.client;
  }

  setupEventHandlers(handlers) {
    if (!this.client) throw new Error('Cliente não inicializado');

    this.client.on('qr', handlers.onQR);
    this.client.on('ready', handlers.onReady);
    this.client.on('message', handlers.onMessage);
    this.client.on('disconnected', handlers.onDisconnected);
    this.client.on('auth_failure', handlers.onAuthFailure);
  }

  async start() {
    if (!this.client) throw new Error('Cliente não inicializado');
    logger.info('Inicializando cliente WhatsApp...');
    await this.client.initialize();
  }

  async stop() {
    if (this.client) {
      await this.client.destroy();
      logger.info('Cliente WhatsApp parado');
    }
  }

  getClient() {
    return this.client;
  }

  isReady() {
    return this.client && this.client.info;
  }
}

module.exports = WhatsAppClient;
