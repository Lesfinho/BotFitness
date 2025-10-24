/**
 * Serviço de Armazenamento
 * Gerencia leitura e escrita de dados persistentes
 */

const fs = require('fs').promises;
const path = require('path');
const Logger = require('../utils/logger');
const CONFIG = require('../config');

const logger = new Logger('StorageService');

class StorageService {
  constructor() {
    this.usersFile = CONFIG.USERS_FILE;
    this.logsFile = CONFIG.LOGS_FILE;
    this.ensureDirectories();
  }

  async ensureDirectories() {
    try {
      const dataDir = path.dirname(this.usersFile);
      await fs.mkdir(dataDir, { recursive: true });
    } catch (err) {
      logger.error('Erro ao criar diretório de dados:', err);
    }
  }

  async loadUsers() {
    try {
      const data = await fs.readFile(this.usersFile, 'utf8');
      const parsed = JSON.parse(data);
      logger.success(`${parsed.length} usuários carregados`);
      return new Map(parsed);
    } catch (err) {
      if (err.code === 'ENOENT') {
        logger.info('Arquivo de usuários não encontrado, criando novo');
        return new Map();
      }
      logger.error('Erro ao carregar usuários:', err);
      return new Map();
    }
  }

  async saveUsers(users) {
    try {
      const data = JSON.stringify(Array.from(users.entries()), null, 2);
      await fs.writeFile(this.usersFile, data);
      logger.success('Usuários salvos com sucesso');
    } catch (err) {
      logger.error('Erro ao salvar usuários:', err);
    }
  }

  async logInteraction(userId, type, content) {
    if (!CONFIG.LOG_INTERACTIONS) return;

    try {
      const log = {
        timestamp: new Date().toISOString(),
        userId,
        type,
        content
      };

      let logs = [];
      try {
        const data = await fs.readFile(this.logsFile, 'utf8');
        logs = JSON.parse(data);
      } catch (err) {
        // Arquivo não existe ainda
      }

      logs.push(log);
      await fs.writeFile(this.logsFile, JSON.stringify(logs, null, 2));
    } catch (err) {
      logger.warn('Erro ao salvar log:', err);
    }
  }

  async getUserData(userId, users) {
    return users.get(userId) || null;
  }

  async setUserData(userId, data, users) {
    users.set(userId, data);
    await this.saveUsers(users);
  }
}

module.exports = new StorageService();
