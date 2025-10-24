/**
 * Serviço de IA
 * Integração com Ollama para respostas inteligentes com Streaming
 */

const Logger = require('../utils/logger');
const CONFIG = require('../config');

const logger = new Logger('AIService');

class AIService {
  constructor() {
    this.baseURL = CONFIG.OLLAMA_BASE_URL;
    this.model = CONFIG.OLLAMA_MODEL;
  }

  async generateResponse(message, context = {}) {
    try {
      const url = `${this.baseURL}/api/generate`;
      const body = {
        model: this.model,
        prompt: this._buildPrompt(message, context),
        stream: true
      };

      const res = await fetch(url, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body)
      });

      if (!res.ok) {
        throw new Error(`HTTP ${res.status}: ${res.statusText}`);
      }

      const reader = res.body.getReader();
      const decoder = new TextDecoder('utf-8');
      let fullResponse = '';

      while (true) {
        const { value, done } = await reader.read();
        if (done) break;

        const chunk = decoder.decode(value);
        const lines = chunk.split('\n');

        for (const line of lines) {
          if (line.trim() === '') continue;
          try {
            const json = JSON.parse(line);
            fullResponse += json.response || '';
          } catch (e) {
            // Ignorar linhas que não são JSON válido
          }
        }
      }

      return fullResponse.trim();
    } catch (error) {
      logger.warn('Ollama não disponível, usando fallback');
      return this.getFallbackResponse(message, context);
    }
  }

  _buildPrompt(message, context) {
    return `
      Você é um assistente fitness amigável e motivador especializado em hidratação.
      Responda em português de forma natural, curta e motivadora.
      Use emojis com moderação (💧 🚰 💪 😊)
      Seja encorajador mas não exagerado.
      
      Contexto do usuário:
      Nome: ${context.userName || 'Amigo'}
      Meta de água: ${context.waterGoal || '2.5'} litros/dia
      
      IMPORTANTE: Máximo 3-4 linhas de resposta para WhatsApp.
      
      Usuário: ${message}
      Assistente:`;
  }

  getFallbackResponse(message, context = {}) {
    const respostas = {
      saudacao: [
        `Oi ${context.userName || 'amigo'}! 👋 Como posso ajudar com sua hidratação hoje?`,
        `Olá ${context.userName || ''}! 💧 Pronto pra se hidratar?`,
        `E aí ${context.userName || 'amigo'}! 🚰 Vamos cuidar da sua saúde hoje?`
      ],
      motivacao: [
        `${context.userName || 'Amigo'}, lembre-se: água é vida! 💧`,
        `Cada gole conta para sua saúde! 💪`,
        `Mantendo o foco na hidratação! 🎯`
      ],
      agradecimento: [
        `Por nada! Estou aqui pra ajudar! 😊`,
        `Conte sempre comigo! 💪`,
        `É um prazer ajudar você! 🚰`
      ],
      default: [
        `Estou aqui para ajudar com sua hidratação! Use /help para ver os comandos 💧`,
        `Posso te ajudar a manter uma boa hidratação! Digite /help para mais informações 🚰`,
        `Vamos cuidar da sua saúde juntos! Use /help para ver como posso ajudar 💪`
      ]
    };

    let tipo = 'default';
    if (message.match(/^(oi|olá|ola|hey|e ai|eai)/i)) tipo = 'saudacao';
    if (message.match(/(obrigado|valeu|thanks)/i)) tipo = 'agradecimento';
    if (message.match(/(força|animo|vamo|bora)/i)) tipo = 'motivacao';

    const respostasDoTipo = respostas[tipo];
    return respostasDoTipo[Math.floor(Math.random() * respostasDoTipo.length)];
  }
}

module.exports = new AIService();
