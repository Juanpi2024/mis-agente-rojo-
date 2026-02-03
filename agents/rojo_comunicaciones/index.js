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
4. DIRECTIVA PRIME: Si el usuario pide una acción que corresponde a un agente (ej: enviar correo, buscar, publicar), DEBES USAR EL COMANDO [[EXEC]] OBLIGATORIAMENTE.
   - INCORRECTO: "Sí, enviaré el correo." (Sin comando)
   - CORRECTO: "Entendido. Procesando envío. [[EXEC:putin|send|destinatario|asunto|mensaje]]"

ORQUESTACIÓN:
Para activar un agente, agrega al final: [[EXEC:agente|acción|parámetros]]
IMPORTANTE: Los parámetros se separan por barras verticales '|'. Si un parámetro lleva espacios, NO uses comillas en el comando EXEC, simplemente escríbelo.

AGENTES DISPONIBLES (La Orquesta):
- gladys: Investigadora (research).
- lenin: Publicador ProfeSocial (publish).
- che: Pedagogo/Guías (crearGuia).
- putin: Email y Contactos (send, read_inbox).
  * Acciones: 
    - read_inbox: Revisa los últimos correos.
    - send|contacto|asunto|mensaje|path_adjunto(opcional): Envía correo a un contacto. Si hay adjunto, pon la ruta absoluta.
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

    // Construir string de argumentos: cada parte entre comillas para manejar espacios
    const args = paramsParts.map(p => `"${p.replace(/"/g, '\\"')}"`).join(' ');

    console.log(`🚀 [ORQUESTADOR] Activando agente: ${agent} para acción: ${action}`);
    console.log(`   📝 Argumentos: ${args}`);

    let command = "";
    let cwd = "";
    let esperaRespuesta = false;

    switch (agent.toLowerCase()) {
        case 'gladys':
            command = `node agent.js ${args} "presentation"`;
            cwd = path.join(__dirname, '../gladys_marin');
            break;
        case 'lenin':
            command = `node profesocial_bot.js ${args}`;
            cwd = path.join(__dirname, '../publicador_profesocial');
            break;
        case 'che':
            command = `node index.js ${args}`;
            cwd = path.join(__dirname, '../pedagogico');
            break;
        case 'putin':
            cwd = path.join(__dirname, '../asistente_personal');
            if (action === 'read_inbox') {
                command = `node putin_agent.js read_inbox`;
                esperaRespuesta = true;
            } else if (action === 'send') {
                command = `node putin_agent.js send ${args}`;
            }
            break;
        case 'allende':
            command = `node allende_agent.js ${args}`;
            cwd = path.join(__dirname, '../soporte_crm');
            break;
        case 'xi':
            command = `node xi_agent.js ${args}`;
            cwd = path.join(__dirname, '../gestor_financiero');
            break;
        case 'chavez':
            command = `node chavez_agent.js ${args}`;
            cwd = path.join(__dirname, '../marketing');
            break;
        case 'stalin':
            command = `node limpieza.js --clean ${args}`; // Asumimos limpieza por defecto si se invoca
            cwd = path.join(__dirname, '../limpieza_datos');
            break;
        case 'gramsci':
            command = `node gramsci_agent.js ${args}`;
            cwd = path.join(__dirname, '../analista_curriculum');
            break;
        case 'pepe':
            command = `node pepe_agent.js synthesize ${args}`;
            cwd = path.join(__dirname, '../pepe_diplomacia');
            esperaRespuesta = true;
            break;
    }

    if (command && cwd) {
        exec(command, { cwd }, async (err, stdout, stderr) => {
            if (err) {
                console.error(`❌ Error en ${agent}:`, err.message);
                return;
            }
            console.log(`✅ ${agent} finalizado.`);

            // Loguear siempre el output del agente para debugging
            if (stdout.trim()) console.log(`📄 Salida ${agent}: ${stdout.trim()}`);

            // Si el comando genera una respuesta que debe ir a WhatsApp (como read_inbox)
            if (esperaRespuesta && stdout) {
                await client.sendMessage(messageObj.from, `✅ *Informe de ${agent}:*\n\n${stdout}`);
            }
        });
    }
}

// --- FUNCIONES SENSORIALES (Audio y Visión) ---
async function procesarAudio(msg) {
    try {
        console.log('👂 [ROJO] Descargando nota de voz...');
        const media = await msg.downloadMedia();
        if (!media) throw new Error('No se pudo descargar el audio.');

        const buffer = Buffer.from(media.data, 'base64');
        const tempPath = path.join(__dirname, `temp_audio/audio_${Date.now()}.ogg`);

        if (!fs.existsSync(path.dirname(tempPath))) fs.mkdirSync(path.dirname(tempPath));
        fs.writeFileSync(tempPath, buffer);

        console.log('🎧 [ROJO] Transcribiendo con Whisper...');
        const transcription = await openai.audio.transcriptions.create({
            file: fs.createReadStream(tempPath),
            model: "whisper-1",
            language: "es" // Forzar español para mejor precisión
        });

        // Limpieza
        fs.unlinkSync(tempPath);

        console.log(`🗣️ [ROJO] Transcripción: "${transcription.text}"`);
        return transcription.text;
    } catch (error) {
        console.error('❌ Error en procesarAudio:', error);
        return null; // Fallback a texto vacío
    }
}

async function procesarImagen(msg) {
    try {
        console.log('👁️ [ROJO] Analizando imagen...');
        const media = await msg.downloadMedia();
        if (!media) throw new Error('No se pudo descargar la imagen.');

        // GPT-4o Vision acepta base64 directamente
        const base64Image = `data:${media.mimetype};base64,${media.data}`;

        const response = await openai.chat.completions.create({
            model: "gpt-4-turbo", // O gpt-4o cuando esté disponible full
            messages: [
                {
                    role: "user",
                    content: [
                        { type: "text", text: "Analiza esta imagen y describe qué ves. Si hay texto, transcríbelo. Si parece un error, diagnostícalo. Sé conciso." },
                        { type: "image_url", image_url: { url: base64Image } }
                    ]
                }
            ],
            max_tokens: 300
        });

        const analisis = response.choices[0].message.content;
        console.log(`👁️ [ROJO] Análisis visual: "${analisis}"`);
        return `[IMAGEN ANALIZADA]: ${analisis}`;
    } catch (error) {
        console.error('❌ Error en procesarImagen:', error);
        return '[Error analizando imagen]';
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

    // Ignorar mensajes de estado o sistema
    if (msg.type === 'e2e_notification' || msg.type === 'protocol_notification') return;

    // Detectar si es un mensaje relevante (Audio, Imagen o Texto dirigido a Rojo)
    let processingBody = msg.body;
    let isRelevante = false;

    // 1. Detección de Audio (PTT = Push To Talk / Nota de voz)
    if (msg.hasMedia && (msg.type === 'ptt' || msg.type === 'audio')) {
        console.log('🎤 Nota de voz detectada.');
        const transcripcion = await procesarAudio(msg);
        if (transcripcion) {
            processingBody = transcripcion; // Reemplazamos el cuerpo vacío por la transcripción
            isRelevante = true; // Asumimos que si me mandan un audio, es para que lo escuche
            await msg.react('👂'); // Feedback visual: "Escuchando"
        }
    }

    // 2. Detección de Imagen
    else if (msg.hasMedia && msg.type === 'image') {
        const analisis = await procesarImagen(msg);
        if (analisis) {
            // Si el usuario puso texto junto a la foto (caption), lo unimos
            processingBody = (msg.body ? msg.body + "\n" : "") + analisis;
            isRelevante = true; // Asumimos que si mandan foto, quieren análisis
            await msg.react('👁️'); // Feedback visual: "Viendo"
        }
    }

    // 3. Detección de Texto Normal
    else if (msg.type === 'chat' && msg.body) {
        if (msg.body.toLowerCase().includes('rojo')) {
            isRelevante = true;
        }
    }

    // Si no es relevante, ignorar
    if (!isRelevante) return;

    // Limpieza del prefijo "Rojo" si existe en texto transcrito o escrito
    const cleanBody = processingBody.replace(/^rojo[,:\s]*/i, '').trim();
    if (!cleanBody) return;

    console.log(`📩 PROCESANDO (Final): ${cleanBody}`);

    // Mostrar "Escribiendo..." mientras piensa
    const chat = await msg.getChat();
    await chat.sendStateTyping();

    const respuestaTexto = await generarRespuestaTexto(msg, cleanBody);
    console.log(`🤖 Respuesta: ${respuestaTexto}`);

    let respuestaFinal = respuestaTexto.startsWith('✅') ? respuestaTexto : `✅ ${respuestaTexto}`;
    await client.sendMessage(msg.from, respuestaFinal);
});

client.initialize();
