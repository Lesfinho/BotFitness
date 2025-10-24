/**
 * Gerenciador de Comandos
 * Centraliza todos os comandos disponíveis
 */

const Logger = require('../utils/logger');
const UserManager = require('./UserManager');
const MessageFormatter = require('../services/MessageFormatter');
const StorageService = require('../services/StorageService');
const AIService = require('../services/AIService');

const logger = new Logger('CommandHandler');

class CommandHandler {
  constructor(client) {
    this.client = client;
  }

  async handleCommand(message, userId, userName) {
    const text = message.body.toLowerCase().trim();

    const commands = {
      'Come': () => this.cmdStart(message, userId, userName),
      '/stop': () => this.cmdStop(message, userId, userName),
      '/status': () => this.cmdStatus(message, userId, userName),
      '/help': () => this.cmdHelp(message),
      '/meta': () => this.cmdSetGoal(message, userId, userName),
      '/intervalo': () => this.cmdSetInterval(message, userId, userName),
      '/reset': () => this.cmdReset(message, userId),
      '/historico': () => this.cmdHistory(message, userId, userName)
    };

    for (const [cmd, handler] of Object.entries(commands)) {
      if (text.startsWith(cmd)) {
        try {
          await handler();
          logger.info(`Comando executado: ${cmd} por ${userName}`);
          await StorageService.logInteraction(userId, 'command', cmd);
        } catch (err) {
          logger.error(`Erro ao executar comando ${cmd}:`, err);
          await message.reply('❌ Houve um erro ao executar o comando. Tente novamente.');
        }
        return true;
      }
    }

    return false;
  }

  async cmdStart(message, userId, userName) {
    let user = UserManager.getUser(userId);

    // Se usuário já existe e completou questionnaire, /start não faz mais sentido
    if (user && !user.step) {
      await message.reply(
        `${userName}, você já está configurado! 🎯\n\nPara conversar comigo, é só enviar mensagens normais.\nUse /status para ver seus dados, ou /reset para começar do zero.`
      );
      return;
    }

    if (!user) {
      user = await UserManager.createUser(userId, userName);
    } else {
      user.step = 'idade';
      await UserManager.updateUserStep(userId, 'idade');
    }

    await message.reply(MessageFormatter.formatQuestionnaireStart(userName));
  }

  async cmdStop(message, userId, userName) {
    const user = UserManager.getUser(userId);

    // /stop não é mais necessário - usuário conversa com IA normalmente
    if (!user || !user.step) {
      await message.reply(
        `${userName}, você já está conversando comigo! 💧\n\nPara parar de receber *lembretes*, use /meta para alterar sua meta, ou /reset para começar do zero.`
      );
      return;
    }

    if (user) {
      await UserManager.updateUserStep(userId, user.step, { reminders: false });
      await message.reply(
        `Tudo bem ${userName}! 👍\nParei de mandar lembretes por enquanto.\nQuando quiser voltar, é só dizer *"/start"*!`
      );
    } else {
      await message.reply(`Você ainda não tinha lembretes ativos. Quer começar agora? 😄`);
    }
  }

  async cmdStatus(message, userId, userName) {
    const user = UserManager.getUser(userId);

    if (!user) {
      await message.reply(
        `Parece que você ainda não está cadastrado. Digite */start* para começar! 🚀`
      );
      return;
    }

    const status = MessageFormatter.formatStatus(user, userName);
    await message.reply(status);
  }

  async cmdHelp(message) {
    await message.reply(MessageFormatter.formatHelp());
  }

  async cmdSetGoal(message, userId, userName) {
    await UserManager.updateUserStep(userId, 'nova_meta');
    await message.reply('Qual sua nova meta diária de água em litros? (exemplo: 2.5)');
  }

  async cmdSetInterval(message, userId, userName) {
    await UserManager.updateUserStep(userId, 'novo_intervalo');
    await message.reply(
      'De quantos em quantos minutos quer receber lembretes? (exemplo: 30)'
    );
  }

  async cmdHistory(message, userId, userName) {
    const user = UserManager.getUser(userId);

    if (!user || !user.history || user.history.length === 0) {
      await message.reply(`${userName}, você ainda não tem histórico registrado! 📝`);
      return;
    }

    const lastDays = user.history.slice(-7);
    let report = `📈 *Seu Progresso (últimos 7 dias)*\n\n`;

    lastDays.forEach(day => {
      const percent = (day.consumed / day.goal * 100).toFixed(0);
      const bar = '█'.repeat(Math.floor(percent / 10)) + '░'.repeat(10 - Math.floor(percent / 10));
      report += `${day.date}: ${bar} ${percent}%\n`;
    });

    await message.reply(report);
  }

  async cmdReset(message, userId, userName) {
    await UserManager.removeUser(userId);
    await message.reply(
      `Tudo resetado, ${userName}! 🔄\nDigite */start* quando quiser começar de novo.`
    );
  }
}

module.exports = CommandHandler;
