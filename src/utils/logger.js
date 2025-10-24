/**
 * Sistema de Logging
 * Centraliza logs da aplicação com diferentes níveis
 */

class Logger {
  constructor(module = 'App') {
    this.module = module;
  }

  _format(level, message, data = null) {
    const timestamp = new Date().toLocaleTimeString('pt-BR');
    const prefix = `[${timestamp}] [${this.module}] [${level}]`;
    return data ? `${prefix} ${message}` : `${prefix} ${message}`;
  }

  success(message, data = null) {
    console.log(`✅ ${this._format('SUCCESS', message, data)}`, data || '');
  }

  info(message, data = null) {
    console.log(`ℹ️  ${this._format('INFO', message, data)}`, data || '');
  }

  warn(message, data = null) {
    console.warn(`⚠️  ${this._format('WARN', message, data)}`, data || '');
  }

  error(message, error = null) {
    console.error(`❌ ${this._format('ERROR', message)}`, error || '');
  }

  debug(message, data = null) {
    if (process.env.DEBUG === 'true') {
      console.log(`🐛 ${this._format('DEBUG', message)}`, data || '');
    }
  }

  reminder(message) {
    console.log(`💧 ${this._format('REMINDER', message)}`);
  }
}

module.exports = Logger;
