/**
 * Fluxo do Questionário
 * Gerencia as etapas do questionário interativo
 */

const validators = require('../utils/validators');
const MessageFormatter = require('../services/MessageFormatter');
const UserManager = require('./UserManager');
const Logger = require('../utils/logger');

const logger = new Logger('QuestionnaireFlow');

class QuestionnaireFlow {
  async handleQuestionnaireStep(message, user, userId, userName) {
    const msg = message.body.toLowerCase().trim();

    switch (user.step) {
      case 'idade':
        await this.handleAge(message, user, userId, msg, userName);
        break;
      case 'peso':
        await this.handleWeight(message, user, userId, msg, userName);
        break;
      case 'atividade':
        await this.handleActivityLevel(message, user, userId, msg, userName);
        break;
      case 'intervalo':
        await this.handleInterval(message, user, userId, msg, userName);
        break;
      case 'nova_meta':
        await this.handleNewGoal(message, user, userId, msg);
        break;
      case 'novo_intervalo':
        await this.handleNewInterval(message, user, userId, msg);
        break;
    }
  }

  async handleAge(message, user, userId, msg, userName) {
    if (!validators.isValidAge(msg)) {
      await message.reply(validators.getErrorMessage('age'));
      return;
    }

    user.idade = parseInt(msg);
    await UserManager.updateUserStep(userId, 'peso', { idade: user.idade });
    await message.reply('Legal! Agora me fala seu peso aproximado (em kg).');
    logger.debug(`Idade registrada para ${userName}: ${user.idade}`);
  }

  async handleWeight(message, user, userId, msg, userName) {
    const peso = parseFloat(msg.replace(',', '.'));

    if (!validators.isValidWeight(peso)) {
      await message.reply(validators.getErrorMessage('weight'));
      return;
    }

    const multiplicador = this._calculateMultiplier(user.idade);
    const metaLitros = (peso * multiplicador).toFixed(2);

    await UserManager.updateUserStep(userId, 'atividade', {
      peso,
      waterGoal: metaLitros
    });

    await message.reply(
      `Calculei sua meta: *${metaLitros} litros/dia* 💧\n\n${MessageFormatter.formatActivityQuestion()}`
    );
    logger.debug(`Peso registrado para ${userName}: ${peso}kg, Meta: ${metaLitros}L`);
  }

  async handleActivityLevel(message, user, userId, msg, userName) {
    if (!validators.isValidActivityLevel(msg)) {
      await message.reply(validators.getErrorMessage('activityLevel'));
      return;
    }

    const atividade = parseInt(msg);
    const ajustes = [0, 0.3, 0.5, 0.8];
    const novaGoal = (parseFloat(user.waterGoal) + ajustes[atividade - 1]).toFixed(2);

    await UserManager.updateUserStep(userId, 'intervalo', {
      activityLevel: atividade,
      waterGoal: novaGoal
    });

    await message.reply(
      `Meta ajustada: *${novaGoal} litros/dia* 🎯\n\nÚltima pergunta: de quantos em quantos minutos quer os lembretes?\n(Digite o número, exemplo: 30 para meia hora)`
    );
    logger.debug(`Nível de atividade registrado para ${userName}: ${atividade}`);
  }

  async handleInterval(message, user, userId, msg, userName) {
    if (!validators.isValidInterval(msg)) {
      await message.reply(validators.getErrorMessage('interval'));
      return;
    }

    const intervalo = parseInt(msg);
    const completedUser = await UserManager.getUser(userId);

    await UserManager.updateUserStep(userId, null, {
      reminderInterval: intervalo * 60 * 1000,
      reminders: true,
      lastReminder: Date.now()
    });

    await message.reply(
      MessageFormatter.formatSetupComplete(userName, completedUser.waterGoal, intervalo)
    );
    
    // Pergunta final antes do bot inteligente ativar
    await message.reply(
      `${userName}, ficou tudo certo! 🎯\n\nTem mais alguma dúvida sobre hidratação ou seu objetivo de saúde? Estou aqui para ajudar! 💧`
    );
    
    logger.success(`Configuração concluída para ${userName}`);
  }

  async handleNewGoal(message, user, userId, msg) {
    const novaMeta = parseFloat(msg.replace(',', '.'));

    if (!validators.isValidWaterGoal(novaMeta)) {
      await message.reply(validators.getErrorMessage('waterGoal'));
      return;
    }

    await UserManager.updateUserStep(userId, null, {
      waterGoal: novaMeta.toFixed(2)
    });

    await message.reply(`Meta atualizada para ${novaMeta} litros/dia! 🎯`);
    logger.info(`Meta atualizada para usuário ${userId}: ${novaMeta}L`);
  }

  async handleNewInterval(message, user, userId, msg) {
    if (!validators.isValidInterval(msg)) {
      await message.reply(validators.getErrorMessage('interval'));
      return;
    }

    const novoIntervalo = parseInt(msg);
    await UserManager.updateUserStep(userId, null, {
      reminderInterval: novoIntervalo * 60 * 1000
    });

    await message.reply(`Intervalo atualizado para ${novoIntervalo} minutos! ⏰`);
    logger.info(`Intervalo atualizado para usuário ${userId}: ${novoIntervalo}min`);
  }

  _calculateMultiplier(age) {
    if (age < 30) return 0.040;
    if (age > 65) return 0.030;
    return 0.035;
  }
}

module.exports = new QuestionnaireFlow();
