/**
 * Validadores
 * Funções para validar dados de entrada
 */

const validators = {
  isValidAge(age) {
    const num = parseInt(age);
    return !isNaN(num) && num >= 1 && num <= 120;
  },

  isValidWeight(weight) {
    const num = parseFloat(weight.toString().replace(',', '.'));
    return !isNaN(num) && num >= 30 && num <= 300;
  },

  isValidInterval(minutes) {
    const num = parseInt(minutes);
    return !isNaN(num) && num >= 15 && num <= 240;
  },

  isValidWaterGoal(liters) {
    const num = parseFloat(liters.toString().replace(',', '.'));
    return !isNaN(num) && num >= 1 && num <= 10;
  },

  isValidActivityLevel(level) {
    return [1, 2, 3, 4].includes(parseInt(level));
  },

  isValidPhoneNumber(number) {
    return number && number.includes('@c.us');
  },

  getErrorMessage(type) {
    const messages = {
      age: 'Por favor, digite uma idade válida (entre 10 e 120 anos)',
      weight: 'Digite um peso válido em kg (exemplo: 70)',
      interval: 'Digite um intervalo entre 15 e 240 minutos',
      waterGoal: 'Digite um valor entre 1 e 10 litros',
      activityLevel: 'Digite apenas o número da opção (1, 2, 3 ou 4)',
      phone: 'Número de telefone inválido'
    };
    return messages[type] || 'Entrada inválida';
  }
};

module.exports = validators;
