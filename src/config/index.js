/**
 * Configuração da Aplicação
 * Centraliza todas as constantes e configurações
 */

require('dotenv').config();

const CONFIG = {
  // Caminhos
  SESSION_PATH: process.env.SESSION_PATH || './session',
  DATA_PATH: process.env.DATA_PATH || './data',
  USERS_FILE: process.env.USERS_FILE || './data/users.json',
  LOGS_FILE: process.env.LOGS_FILE || './data/logs.json',

  // Horários
  BUSINESS_HOURS: {
    start: parseInt(process.env.BUSINESS_HOURS_START || '8'),
    end: parseInt(process.env.BUSINESS_HOURS_END || '22')
  },

  // Servidor
  PORT: process.env.PORT || 3000,
  OWNER_NUMBER: process.env.OWNER_NUMBER || '',
  BOT_NAME: process.env.BOT_NAME || 'Fitness Bot',

  // API - Ollama
  OLLAMA_BASE_URL: process.env.OLLAMA_BASE_URL || 'http://localhost:11434',
  OLLAMA_MODEL: process.env.OLLAMA_MODEL || 'gpt-oss:20b',

  // Lembretes
  REMINDER_CHECK_INTERVAL: 60 * 1000, // 1 minuto
  MIN_REMINDER_INTERVAL: 15, // 15 minutos
  MAX_REMINDER_INTERVAL: 240, // 4 horas

  // Validação
  MIN_AGE: 10,
  MAX_AGE: 80,
  MIN_WEIGHT: 30,
  MAX_WEIGHT: 200,
  MIN_WATER_GOAL: 1,
  MAX_WATER_GOAL: 10,

  // Debug
  DEBUG: process.env.DEBUG === 'true',
  LOG_INTERACTIONS: process.env.LOG_INTERACTIONS !== 'false'
};

module.exports = CONFIG;
