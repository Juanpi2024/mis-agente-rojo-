const { Client, LocalAuth, MessageMedia } = require('whatsapp-web.js');
const qrcode = require('qrcode');
const OpenAI = require('openai');
const fs = require('fs');
const path = require('path');
const { exec } = require('child_process');
const ElevenLabs = require('elevenlabs-node');
const { buscarContactos } = require('./contacts_manager');
require('dotenv').config();

process.on('uncaughtException', (err) => {
    console.error('❌ CRASH DETECTADO EN ROJO:', err);
});

process.on('unhandledRejection', (reason, promise) => {
    console.error('❌ PROMESA RECHAZADA SIN MANEJO:', reason);
});

console.log('🚀 Iniciando Agente Rojo (index.js)...');

// 1. Configurar OpenAI (Motor Principal)
const openai = new OpenAI({
    apiKey: process.env.OPENAI_API_KEY
});

// 2. Configurar Voz
const voiceEnabled = (process.env.ELEVENLABS_API_KEY && !process.env.ELEVENLABS_API_KEY.startsWith('#'));

// 3. Configurar WhatsApp Client
console.log('⏳ Inicializando motor WhatsApp...');
const client = new Client({
    authStrategy: new LocalAuth(),
    puppeteer: {
        headless: false,
        args: ['--no-sandbox', '--disable-setuid-sandbox'],
        timeout: 120000
    }
});

const ROJO_SYSTEM_PROMPT = `Eres ROJO, Comandante de Comunicaciones y Director de Orquesta de Juan Pablo.

REGLAS WHATSAPP:
1. Respuestas ULTRA CONCISAS: Máximo 2 líneas.
2. Solo confirma y delega. 
3. No seas intrusivo. Si no te llaman por tu nombre ("Rojo"), mantente al margen (esto es gestionado por el filtro de software, pero tenlo en mente).

ORQUESTACIÓN:
Para activar un agente, agrega al final: [[EXEC:agente|acción|parámetros]]

AGENTES DISPONIBLES (La Orquesta):
- gladys: Investigadora (research).
- lenin: Publicador ProfeSocial (publish).
- che: Pedagogo/Guías (crearGuia).
- putin: Email y Contactos (send, read_inbox).
- allende: CRM y Gestión Social (gestionar).
- xi: Finanzas y Auditoría (auditar).
- chavez: Marketing y Estrategia (crearCampaña).
- stalin: Limpieza de Datos y Archivos (clean).
- gramsci: Analista de Curriculum (analizar).
- pepe: Diplomacia y Síntesis (synthesize).

CONTEXTO SOCIAL:
(Se cargará dinámicamente desde knowledge_base.md)`;

const chatHistory = {};

async function activarAgente(messageObj, agentLine) {
    const [agent, action, ...paramsParts] = agentLine.split('|');
    const params = paramsParts.join('|');
    console.log(`🚀 [ORQUESTADOR] Activando agente: ${agent} para acción: ${action}`);

    let command = "";
    let cwd = "";
    let esperaRespuesta = false;

    switch (agent.toLowerCase()) {
        case 'gladys':
            command = `node agent.js "${params}" "presentation"`;
            cwd = path.join(__dirname, '../gladys_marin');
            break;
        case 'lenin':
            command = `node profesocial_bot.js "${params}"`;
            cwd = path.join(__dirname, '../publicador_profesocial');
            break;
        case 'che':
            command = `node index.js "${params}"`;
            cwd = path.join(__dirname, '../pedagogico');
            break;
        case 'putin':
            cwd = path.join(__dirname, '../asistente_personal');
            if (action === 'read_inbox') {
                command = `node putin_agent.js read_inbox`;
                esperaRespuesta = true;
            } else if (action === 'send') {
                command = `node putin_agent.js send "${params}"`;
            }
            break;
        case 'allende':
            command = `node allende_agent.js "${params}"`;
            cwd = path.join(__dirname, '../soporte_crm');
            break;
        case 'xi':
            command = `node xi_agent.js "${params}"`;
            cwd = path.join(__dirname, '../gestor_financiero');
            break;
        case 'chavez':
            command = `node chavez_agent.js "${params}"`;
            cwd = path.join(__dirname, '../marketing');
            break;
        case 'stalin':
            command = `node limpieza.js --clean "${params}"`; // Asumimos limpieza por defecto si se invoca
            cwd = path.join(__dirname, '../limpieza_datos');
            break;
        case 'gramsci':
            command = `node gramsci_agent.js "${params}"`;
            cwd = path.join(__dirname, '../analista_curriculum');
            break;
        case 'pepe':
            command = `node pepe_agent.js synthesize "${params}"`;
            cwd = path.join(__dirname, '../pepe_diplomacia');
            esperaRespuesta = true; // Pepe suele devolver texto sintetizado
            break;
    }

    if (command && cwd) {
        exec(command, { cwd }, async (err, stdout, stderr) => {
            if (err) {
                console.error(`❌ Error en ${agent}:`, err.message);
                return;
            }
            console.log(`✅ ${agent} finalizado.`);

            // Si el comando genera una respuesta que debe ir a WhatsApp (como read_inbox)
            if (esperaRespuesta && stdout) {
                await client.sendMessage(messageObj.from, `✅ *Informe de Putin:*\n\n${stdout}`);
            }
        });
    }
}

async function generarRespuestaTexto(msg, mensajeUsuario) {
    const userId = msg.from;
    try {
        // Cargar Base de Conocimiento y Memoria dinámicamente
        let knowledge = "";
        try {
            knowledge = fs.readFileSync(path.join(__dirname, 'knowledge_base.md'), 'utf8');
            const memory = fs.readFileSync(path.join(__dirname, '../../MEMORY.md'), 'utf8');
            knowledge += "\n\nMEMORIA GLOBAL:\n" + memory;
        } catch (e) {
            console.log("⚠️ No se pudo cargar knowledge_base o MEMORY.md");
        }

        const systemPrompt = ROJO_SYSTEM_PROMPT.replace('(Se cargará dinámicamente desde knowledge_base.md)', knowledge);

        if (!chatHistory[userId]) chatHistory[userId] = [{ role: 'system', content: systemPrompt }];
        let history = chatHistory[userId];

        // Lógica especial para contactos
        const lowerMsg = mensajeUsuario.toLowerCase();
        if (lowerMsg.includes('contacto') || lowerMsg.includes('busca a')) {
            const query = mensajeUsuario.replace(/rojo|busca|a|en|mis|contactos|de|gmail/gi, '').trim();
            if (query) {
                const results = buscarContactos(query);
                if (results.length > 0) {
                    const contactsStr = results.map(c => `- ${c.nombre}: ${c.correo} (${c.telefono})`).join('\n');
                    return `✅ He encontrado estos contactos:\n${contactsStr}`;
                } else {
                    return `⚠️ No encontré contactos para "${query}".`;
                }
            }
        }

        history.push({ role: 'user', content: mensajeUsuario });
        if (history.length > 20) history = [history[0], ...history.slice(-18)];

        const completion = await openai.chat.completions.create({
            model: 'gpt-4-turbo-preview',
            messages: history,
            max_tokens: 150,
            temperature: 0.5
        });

        let respuesta = completion.choices[0].message.content;
        const execMatch = respuesta.match(/\[\[EXEC:(.+?)\]\]/);
        if (execMatch) {
            activarAgente(msg, execMatch[1]);
            respuesta = respuesta.replace(/\[\[EXEC:.+?\]\]/, '').trim();
        }
        history.push({ role: 'assistant', content: respuesta });
        chatHistory[userId] = history;
        return respuesta;
    } catch (error) {
        console.error("Error en generarRespuestaTexto:", error);
        return "⚠️ Error de conexión con el Cuartel General.";
    }
}

client.on('qr', (qr) => {
    console.log('🔴 NUEVO QR GENERADO. Por favor, escanea la imagen qr_code.png en la carpeta del agente.');
    qrcode.toFile(path.join(__dirname, 'qr_code.png'), qr);
});

client.on('loading_screen', (percent, message) => {
    console.log(`⏳ Cargando WhatsApp: ${percent}% - ${message}`);
});

client.on('authenticated', () => {
    console.log('✅ SESIÓN AUTENTICADA.');
});

client.on('ready', () => console.log('🔴 ROJO EN LÍNEA Y LISTO.'));

client.on('message_create', async msg => {
    if (msg.body.startsWith('✅') || msg.body.startsWith('⚠️') || msg.body.startsWith('🤖')) return;
    if (msg.type !== 'chat' || !msg.body) return;

    const bodyLower = msg.body.toLowerCase();
    const isDirectedToRojo = bodyLower.includes('rojo');

    // Solo procesar si se menciona a Rojo o si es un comando del dueño dirigido a Rojo
    if (!isDirectedToRojo) return;

    // Limpiar el prefijo "Rojo"
    const cleanBody = msg.body.replace(/^rojo[,:\s]*/i, '').trim();
    if (!cleanBody) return;

    console.log(`📩 PROCESANDO: ${cleanBody}`);
    const respuestaTexto = await generarRespuestaTexto(msg, cleanBody);
    console.log(`🤖 Respuesta: ${respuestaTexto}`);

    let respuestaFinal = respuestaTexto.startsWith('✅') ? respuestaTexto : `✅ ${respuestaTexto}`;
    await client.sendMessage(msg.from, respuestaFinal);
});

client.initialize();
