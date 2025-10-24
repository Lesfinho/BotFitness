/**
 * Formatador de Mensagens
 * Centraliza a formatação de mensagens para o WhatsApp
 */

class MessageFormatter {
  static formatStatus(user, userName) {
    const status = user.reminders ? '🟢 Ativo' : '🔴 Pausado';
    const intervalo = user.reminderInterval ? `${user.reminderInterval / 60000} minutos` : 'Não definido';

    return `
📊 *Seu Perfil de Hidratação*
👤 Nome: ${userName}
💧 Meta diária: ${user.waterGoal || '2.5'} litros
⏰ Intervalo: ${intervalo}
🔔 Lembretes: ${status}
📅 Cadastro: ${user.createdAt || 'Hoje'}
🏆 Dias seguidos: ${user.streak || 0}
    `;
  }

  static formatHelp() {
    return `
📚 *Comandos Disponíveis*

🚀 */start* - Iniciar/configurar lembretes
🛑 */stop* - Pausar lembretes
📊 */status* - Ver seu perfil
🎯 */meta* - Ajustar meta de água
⏰ */intervalo* - Mudar frequência
📈 */historico* - Ver progresso
🔄 */reset* - Reiniciar configurações
❓ */help* - Ver esta mensagem

💡 *Dica:* Você também pode conversar normalmente comigo!
    `;
  }

  static formatWelcome(userName) {
    return `Oi ${userName}! 👋
Sou seu parceiro de hidratação 💧

Posso te ajudar a beber mais água e cuidar da sua saúde!

Quer que eu monte sua meta diária?`;
  }

  static formatQuestionnaireStart(userName) {
    return `Show, ${userName}! 😄
Antes de definir seus lembretes, quero te conhecer rapidinho.

Fala pra mim: quantos anos você tem?`;
  }

  static formatActivityQuestion() {
    return `Agora me conta: você pratica atividade física?

1️⃣ Sedentário
2️⃣ Leve (1-2x/semana)
3️⃣ Moderado (3-4x/semana)
4️⃣ Intenso (5+/semana)`;
  }

  static formatSetupComplete(userName, waterGoal, interval) {
    return `Pronto ${userName}! 🎉
Vou te mandar lembretes a cada *${interval} minutos* durante o dia (entre 8h e 22h).

Sua meta é *${waterGoal} litros/dia* 💧

Se quiser parar depois, é só me avisar dizendo *"parar"*.
Para mudar o intervalo, diga *"intervalo"* e um novo tempo em minutos.`;
  }

  static formatReminderMessage(userName, waterGoal) {
    const mensagens = [
      `💧 Ei ${userName || ''}, hora da água! Seu corpo agradece!`,
      `🚰 ${userName || 'Campeão'}, que tal uma pausa pra hidratação?`,
      `💦 Lembrete amigo: água é vida, ${userName || 'querido'}!`,
      `💪 ${userName || ''}, mantenha o foco! Hora de mais um copo d'água!`,
      `🌊 Hidratação em dia = mais energia! Bora beber água, ${userName || 'amigo'}?`,
      `⚡ ${userName || ''}, seu corpo precisa de água pra funcionar bem!`,
      `🎯 Meta diária: ${waterGoal}L - Vamos alcançar juntos, ${userName || ''}!`,
      `🌟 Cada gole conta! Hora de se hidratar, ${userName || 'campeão'}!`,
      `🏃 Mantenha o ritmo, ${userName || ''}! Hora da sua dose de hidratação!`,
      `🌿 Momento zen: pare um pouquinho e beba água, ${userName || 'amigo'}!`
    ];

    return mensagens[Math.floor(Math.random() * mensagens.length)];
  }
}

module.exports = MessageFormatter;
