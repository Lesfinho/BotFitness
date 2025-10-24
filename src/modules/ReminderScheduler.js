/**
 * Agendador de Lembretes
 * Gerencia o sistema de lembretes personalizados
 */

const Logger = require('../utils/logger');
const UserManager = require('./UserManager');
const MessageFormatter = require('../services/MessageFormatter');
const CONFIG = require('../config');

const logger = new Logger('ReminderScheduler');

class ReminderScheduler {
  constructor(client) {
    this.client = client;
    this.isRunning = false;
  }

  start() {
    if (this.isRunning) {
      logger.warn('Agendador de lembretes já está rodando');
      return;
    }

    this.isRunning = true;
    logger.success('Agendador de lembretes iniciado');

    setInterval(() => this.checkAndSendReminders(), CONFIG.REMINDER_CHECK_INTERVAL);
  }

  stop() {
    this.isRunning = false;
    logger.info('Agendador de lembretes parado');
  }

  async checkAndSendReminders() {
    if (!this.isRunning) return;

    const now = Date.now();
    const hour = new Date().getHours();

    // Respeita horário comercial
    if (hour < CONFIG.BUSINESS_HOURS.start || hour > CONFIG.BUSINESS_HOURS.end) {
      return;
    }

    const activeUsers = UserManager.getActiveUsers();

    for (const user of activeUsers) {
      if (!user.reminderInterval) continue;

      const timeSinceLastReminder = now - (user.lastReminder || 0);

      if (timeSinceLastReminder >= user.reminderInterval) {
        await this.sendReminder(user);
      }
    }
  }

  async sendReminder(user) {
    try {
      // Encontra o ID do usuário no mapa
      const userId = Array.from(UserManager.users.entries()).find(
        ([, userData]) => userData === user
      )?.[0];

      if (!userId) return;

      const reminderMsg = MessageFormatter.formatReminderMessage(user.name, user.waterGoal);
      await this.client.sendMessage(userId, reminderMsg);

      // Atualiza last reminder
      user.lastReminder = Date.now();
      await UserManager.setUser(userId, user);

      logger.reminder(`Enviado para ${user.name} (intervalo: ${user.reminderInterval / 60000}min)`);
    } catch (err) {
      logger.error(`Erro ao enviar lembrete para ${user.name}:`, err);
    }
  }

  // Para testes
  async sendReminderNow(userId) {
    const user = UserManager.getUser(userId);
    if (!user) {
      logger.error(`Usuário ${userId} não encontrado`);
      return;
    }

    await this.sendReminder(user);
  }
}

module.exports = ReminderScheduler;
