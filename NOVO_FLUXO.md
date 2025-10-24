/**
 * 🤖 NOVO FLUXO DO BOT - VERSÃO FINAL
 * 
 * ✨ Após users.json → TODO vai para IA
 * ✨ Apenas /status, /meta, /intervalo, /historico, /reset funcionam
 * ✨ /start e /stop não são mais necessários
 */

// ============================================
// 📊 DIAGRAMA DO NOVO FLUXO
// ============================================

// ============================================
// 📊 DIAGRAMA COMPLETO DO FLUXO
// ============================================

/*

┌─────────────────────────────────────────────────────┐
│ 🚀 USUÁRIO NOVO ENVIA: [QUALQUER MENSAGEM]          │
│    ("oi", "ola", "teste", "opa", etc)               │
└──────────────┬──────────────────────────────────────┘
               │
               ▼
┌─────────────────────────────────────────────────────┐
│ Bot.js - handleMessage()                            │
│                                                     │
│ 1️⃣  Filtros básicos ✅                             │
│ 2️⃣  Extrai userId, userName                        │
│ 3️⃣  Verifica se é COMANDO (/) ← SEMPRE PRIMEIRO    │
│ 4️⃣  Verifica se user existe ✅ (NÃO)               │
│                                                     │
│ ➡️  RESULTADO: CRIA USUÁRIO + INICIA QUESTIONNAIRE │
└──────────────┬──────────────────────────────────────┘
               │
               ▼
┌─────────────────────────────────────────────────────┐
│ 📝 QUESTIONNAIRE (4 PERGUNTAS)                      │
│                                                     │
│ 1️⃣  "Qual é sua idade?"      → user.step='peso'   │
│ 2️⃣  "Qual é seu peso?"       → user.step='ativ'   │
│ 3️⃣  "Nível de atividade?"    → user.step='int'    │
│ 4️⃣  "Intervalo de lembretes?"→ user.step=null ✅  │
│                                                     │
│ 🎉 QUESTIONNAIRE COMPLETO!                         │
│    • Salvo em users.json                            │
│    • user.step = null ← CHAVE!                     │
│    • Inicia IA                                      │
└──────────────┬──────────────────────────────────────┘
               │
               ▼
┌─────────────────────────────────────────────────────┐
│ 🤖 BOT INTELIGENTE ATIVO                            │
│                                                     │
│ Usuário envia QUALQUER mensagem (NÃO-comando)      │
│                                                     │
│ Bot.js - handleMessage():                          │
│ 1. Verifica se é COMANDO (/) ← SIM? executa        │
│ 2. user existe e step=null? ← SIM? VAI PARA IA     │
│                                                     │
│ ➡️ AIService.generateResponse()                    │
│                                                     │
│ Ollama processa com CONTEXTO COMPLETO:             │
│ {                                                  │
│   message: "por que devo beber agua",              │
│   context: {                                       │
│     userName: "João",                              │
│     idade: 25,                                     │
│     peso: 70,                                      │
│     waterGoal: "2.8",                              │
│     reminderInterval: 120000,                      │
│     reminders: true                                │
│   }                                                │
│ }                                                  │
│                                                     │
│ 💬 IA responde personalizada! ✅                   │
└─────────────────────────────────────────────────────┘

*/

*/

// ============================================
// 🔧 CÓDIGO MODIFICADO
// ============================================

/*

FILE: src/core/Bot.js
====================

// ANTES:
if (!user) {
  user = await UserManager.createUser(userId, userName);
  await message.reply(`Oi ${userName}! 👋 Bem-vindo ao ${CONFIG.BOT_NAME}! 💧`);
  return; // ❌ PARAVA AQUI
}

// DEPOIS:
if (!user) {
  // ✅ NOVO USUÁRIO: Auto-inicia /start com QUALQUER mensagem
  user = await UserManager.createUser(userId, userName);
  await message.reply(`Oi ${userName}! 👋 Bem-vindo ao ${CONFIG.BOT_NAME}! 💧`);
  
  // Inicia questionnaire automaticamente (não importa qual foi a mensagem)
  await message.reply(MessageFormatter.formatQuestionnaireStart(userName));
  return;
}


FILE: src/modules/QuestionnaireFlow.js
======================================

// ANTES:
await message.reply(
  MessageFormatter.formatSetupComplete(userName, completedUser.waterGoal, intervalo)
);
logger.success(`Configuração concluída para ${userName}`);

// DEPOIS:
await message.reply(
  MessageFormatter.formatSetupComplete(userName, completedUser.waterGoal, intervalo)
);

// ✅ PERGUNTA FINAL
await message.reply(
  `${userName}, ficou tudo certo! 🎯\n\nTem mais alguma dúvida sobre hidratação ou seu objetivo de saúde? Estou aqui para ajudar! 💧`
);

logger.success(`Configuração concluída para ${userName}`);

*/

// ============================================
// 🧪 COMO TESTAR
// ============================================

/*

PASSO 1: Abra 2 terminais

Terminal 1 - Rodar Ollama:
  ollama serve

Terminal 2 - Rodar Bot:
  npm start
  [Escaneie o QR code com WhatsApp]


PASSO 2: Envie primeira mensagem (QUALQUER):

  Você: "oi" (ou "ola", "teste", "opa", etc)
  
  Bot: "Oi João! 👋 Bem-vindo ao Fitness Bot! 💧"
  Bot: "Vamos começar? Qual é sua idade?"
  [Questionnaire iniciou automaticamente]


PASSO 3: Responda as 4 perguntas:

  Você: "25"
  Bot: "Legal! Qual seu peso aproximado (em kg)?"
  
  Você: "70"
  Bot: "Calculei sua meta: *2.80 litros/dia* 💧\n\nQual seu nível de atividade? (1-4)"
  
  Você: "2"
  Bot: "Meta ajustada: *3.10 litros/dia* 🎯\n\nDe quantos em quantos minutos quer lembretes?"
  
  Você: "30"
  Bot: "Parabéns! 🎉 Configuração concluída!"
  Bot: "João, ficou tudo certo! 🎯\n\nTem mais alguma dúvida? Estou aqui! 💧"
  [✅ Questionnaire COMPLETO - user.step = null]


PASSO 4: Converse com IA (qualquer mensagem = IA):

  Você: "Por que devo beber água?"
  Bot (IA): "Água é essencial para você manter seu corpo hidratado...
             Com base em seu peso (70kg) e idade (25 anos)..."
  
  Você: "Como posso lembrar de beber água?"
  Bot (IA): "Você configurou lembretes a cada 30 minutos.
             Além disso, você pode..."
  
  Você: "/status"
  Bot: "Seu perfil: 25 anos, 70kg, meta 3.10L/dia, lembretes a cada 30min"
  
  Você: "Qual é minha meta de água?"
  Bot (IA): "Sua meta é 3.10 litros por dia, calculada com base em..."


PASSO 5: Teste comandos úteis:

  /status      → Ver perfil
  /meta        → Mudar meta (Digite novo valor)
  /intervalo   → Mudar intervalo de lembretes
  /historico   → Ver progresso dos últimos 7 dias
  /reset       → Apagar dados e começar do zero

  [Qualquer outra coisa = IA responde]

*/

// ============================================
// ✅ MUDANÇAS IMPLEMENTADAS
// ============================================

/*

1️⃣  FILE: src/core/Bot.js
    • handleMessage() - ordem correta de verificação
    • Verifica COMANDO (/) SEMPRE PRIMEIRO
    • Se novo usuário → cria + inicia questionnaire
    • Se user.step=null → VAI PARA IA

2️⃣  FILE: src/modules/CommandHandler.js
    • cmdStart(): Se user existe e !step → "Já está configurado"
    • cmdStop(): Se !step → "Use /meta ou /reset"
    • Resultado: /start e /stop desativados para usuários prontos

3️⃣  FILE: src/modules/QuestionnaireFlow.js
    • handleInterval(): Adiciona pergunta "Tem alguma dúvida?"
    • Marca transição para IA

4️⃣  FILE: src/services/AIService.js
    • Implementado com fetch + streaming
    • Recebe contexto completo do usuário


🎯 LÓGICA FINAL
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

handleMessage(message) {
  
  1. Filtros básicos
     ├─ Ignora grupos, status, próprias mensagens
  
  2. Extrai userId, userName, msg
  
  3. Verifica COMANDO (/) ← SEMPRE PRIMEIRO
     ├─ /status, /meta, /intervalo, /historico, /reset → executam
     └─ /start, /stop → informam que não são necessários
  
  4. Se novo usuário (!user)
     ├─ Cria em UserManager
     ├─ Inicia questionnaire (step='idade')
     └─ return
  
  5. Se user.step existe
     ├─ Processa resposta do questionnaire
     ├─ Avança para próxima pergunta ou completa
     └─ return
  
  6. Se user.step = null (usuário pronto)
     ├─ Chama AIService.generateResponse()
     ├─ Passa contexto completo do usuário
     └─ IA responde personalizada ✅
}


📊 ESTADOS DO USUÁRIO
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

null (não existe)
  ↓
  Cria usuário com step='idade'
  ↓
step='idade'|'peso'|'atividade'|'intervalo'
  ↓
  Processa questionnaire
  ↓
step=null ← USER PRONTO!
  ↓
  TODO vai para IA 🤖


✨ COMANDOS APÓS QUESTIONNAIRE
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

/status     → Ver perfil (idade, peso, meta, etc)
/meta       → Mudar meta de água (você responde: "2.5")
/intervalo  → Mudar intervalo (você responde: "60")
/historico  → Ver progresso dos últimos 7 dias
/reset      → Apagar dados e começar do zero
/help       → Lista de comandos

Qualquer outra coisa → IA 🤖

*/
