/**
 * Gerenciador de Usuários
 * Centraliza todas as operações com usuários
 */

const Logger = require('../utils/logger');
const StorageService = require('../services/StorageService');

const logger = new Logger('UserManager');

class UserManager {
  constructor() {
    this.users = new Map();
  }

  async initialize() {
    this.users = await StorageService.loadUsers();
  }

  getUser(userId) {
    return this.users.get(userId) || null;
  }

  async setUser(userId, userData) {
    this.users.set(userId, userData);
    await StorageService.setUserData(userId, userData, this.users);
  }

  async createUser(userId, userName) {
    const newUser = {
      name: userName,
      step: 'idade',
      createdAt: new Date().toISOString(),
      reminders: false,
      streak: 0
    };
    await this.setUser(userId, newUser);
    logger.info(`Novo usuário criado: ${userName}`);
    return newUser;
  }

  async updateUserStep(userId, step, data = {}) {
    const user = this.getUser(userId);
    if (user) {
      user.step = step;
      Object.assign(user, data);
      await this.setUser(userId, user);
    }
  }

  async removeUser(userId) {
    this.users.delete(userId);
    await StorageService.saveUsers(this.users);
    logger.info(`Usuário removido: ${userId}`);
  }

  getAllUsers() {
    return Array.from(this.users.values());
  }

  getActiveUsers() {
    return this.getAllUsers().filter(u => u.reminders);
  }

  getUsersCount() {
    return this.users.size;
  }
}

module.exports = new UserManager();
