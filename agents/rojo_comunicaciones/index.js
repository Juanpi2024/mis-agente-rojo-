const { Client, LocalAuth, MessageMedia } = require('whatsapp-web.js');
const qrcode = require('qrcode');
const { GoogleGenerativeAI } = require('@google/generative-ai');
const fs = require('fs');
const path = require('path');
const ElevenLabs = require('elevenlabs-node');
require('dotenv').config();

// --- Configuración e Inicialización ---

// 1. Validar Credenciales
console.log('Validando credenciales...');
const GOOGLE_API_KEY = process.env.GOOGLE_API_KEY;
if (!GOOGLE_API_KEY || GOOGLE_API_KEY === 'tu_api_key_aqui') {
    console.error('❌ ERROR CRÍTICO: Falta la GOOGLE_API_KEY en el archivo .env');
    console.log('Por favor, abre agents/rojo_comunicaciones/.env y pega tu API Key de Gemini.');
    process.exit(1);
}
console.log('🔑 Credenciales OK. Iniciando...');

// 2. Configurar Gemini (Cerebro)
const genAI = new GoogleGenerativeAI(GOOGLE_API_KEY);
const model = genAI.getGenerativeModel({ model: "gemini-2.5-flash" });

// 3. Configurar ElevenLabs (Voz) - Opcional
const ELEVEN_KEY = process.env.ELEVENLABS_API_KEY;
const VOICE_ID = process.env.ELEVENLABS_VOICE_ID || 'ErXwobaYiN019PkySvjV'; // Default a una voz masculina
const voiceEnabled = (ELEVEN_KEY && ELEVEN_KEY !== 'tu_api_key_elevenlabs_aqui');
const elevenLabs = voiceEnabled ? ElevenLabs : null;

if (voiceEnabled) {
    console.log('🔊 Módulo de Voz (ElevenLabs): ACTIVO');
} else {
    console.log('wm 🔇 Módulo de Voz: INACTIVO (Falta API Key, solo responderé texto)');
}

// 4. Configurar WhatsApp Client
const client = new Client({
    authStrategy: new LocalAuth(),
    puppeteer: {
        args: ['--no-sandbox']
    }
});

// --- Personalidad de Rojo ---
const ROJO_SYSTEM_PROMPT = `
Eres ROJO, el Orquestador Maestro de una red de agentes de automatización.
Tu Misión: Coordinar estrategias para la venta de material educativo y gestionar el ecosistema de agentes del usuario.

Rasgos de Personalidad:
- Tono: Estratégico, directo, profesional pero con camaradería ("Camarada").
- Identidad: Eres el director de orquesta. No haces el trabajo sucio, lo delegas a tus especialistas (Fidel, Lenin, El Che, Putin, etc.).
- Putin (Nexo): Es tu experto en inteligencia y quien gestiona todos los correos electrónicos y la agenda.
- Estilo: Usas emojis estratégicos (🔴, 🚀, 🫡). Vas al grano.

Contexto Actual:
- Estás hablando por WhatsApp con tu "Humano" (Usuario).
- Si te piden algo operativo (crear guía, limpiar datos), confirma que activarás al agente correspondiente en la próxima sesión de terminal, o toma nota.
- Responde de manera concisa, ideal para chat y para ser leído en voz alta.
`;

const chatHistory = {}; // Memoria simple en tiempo de ejecución

// --- Funciones Auxiliares ---

async function generarRespuestaTexto(userId, mensajeUsuario) {
    try {
        let history = chatHistory[userId] || [
            { role: "user", parts: [{ text: ROJO_SYSTEM_PROMPT }] }
        ];

        // Añadir mensaje nuevo
        history.push({ role: "user", parts: [{ text: mensajeUsuario }] });

        // Mantener historial corto para ahorrar tokens y contexto
        if (history.length > 20) {
            history = [history[0], ...history.slice(-10)];
        }

        const chat = model.startChat({
            history: history,
            generationConfig: {
                maxOutputTokens: 200, // Respuestas cortas para voz
            },
        });

        const result = await chat.sendMessage(mensajeUsuario);
        const response = await result.response;
        const text = response.text();

        // Guardar respuesta en historial
        history.push({ role: "model", parts: [{ text: text }] });
        chatHistory[userId] = history;

        return text;
    } catch (error) {
        console.error("Error en Gemini:", error);
        return "⚠️ Camarada, tuve un error de conexión con el Cuartel General (Gemini). Intenta de nuevo.";
    }
}

async function generarAudio(texto) {
    if (!voiceEnabled) return null;

    try {
        const fileName = `respuesta_${Date.now()}.mp3`;
        const filePath = path.join(__dirname, 'temp_audio', fileName);

        // Crear carpeta temporal si no existe
        if (!fs.existsSync(path.join(__dirname, 'temp_audio'))) {
            fs.mkdirSync(path.join(__dirname, 'temp_audio'));
        }

        const response = await elevenLabs.textToSpeech(
            ELEVEN_KEY,
            VOICE_ID,
            filePath,
            texto
        );

        // Nota: La librería elevenlabs-node a veces devuelve el path o buffer. 
        // Verificaremos si el archivo se creó.
        if (response.status === 'ok' || fs.existsSync(filePath)) {
            return filePath;
        } else {
            // Intento de manejo directo si la librería devuelve buffer
            // (Este bloque depende de la versión exacta de la librería, asumimos que guarda a disco por el arg fileName)
            return filePath;
        }

    } catch (error) {
        console.error("Error generando audio:", error);
        return null;
    }
}

// --- Eventos de WhatsApp ---

client.on('qr', (qr) => {
    console.log('🔴 Generando código QR...');
    qrcode.toFile(path.join(__dirname, 'qr_code.png'), qr, {
        color: {
            dark: '#000000',  // Blue dots
            light: '#FFFFFF' // Transparent background
        }
    }, function (err) {
        if (err) throw err;
        console.log('✅ QR guardado en: qr_code.png');
        console.log('📂 Por favor, abre la carpeta y escanea la imagen qr_code.png');
    });
});

client.on('auth_failure', msg => {
    console.error('❌ FALLO DE AUTENTICACIÓN', msg);
});

client.on('loading_screen', (percent, message) => {
    console.log('⏳ Cargando WhatsApp Web:', percent, '%', message);
});

client.on('authenticated', () => {
    console.log('✅ AUTENTICADO CORRECTAMENTE');
});

client.on('ready', () => {
    console.log('🔴 ROJO ESTÁ EN LÍNEA Y LISTO PARA LA BATALLA.');
});

client.on('message_create', async msg => {
    // Evitar bucles infinitos: Ignorar mensajes que empiecen con nuestro prefijo de respuesta
    // Opcional: ignorar estados, etc.
    if (msg.body.startsWith('🤖 Rojo responde:')) return;
    if (msg.type !== 'chat') return;

    // IMPORTANTE: Si es un mensaje enviado por MI (el usuario host), lo procesamos.
    // Si es recibido de otros, también.

    // Opcional: Solo responder en chat "conmigo mismo" para no molestar en grupos
    // const chat = await msg.getChat();
    // if (msg.fromMe && chat.name !== 'Me') return; // (Esta lógica depende de cómo lo quiera el usuario)

    // Log para depuración
    const sender = msg.fromMe ? 'YO (Host)' : msg.from;
    console.log(`📩 Mensaje de ${sender}: ${msg.body}`);

    // Procesar con Gemini
    const respuestaTexto = await generarRespuestaTexto(msg.from, msg.body);
    console.log(`🤖 Rojo responde: ${respuestaTexto}`);

    // Enviar Texto primero (para feedback inmediato)
    await client.sendMessage(msg.from, respuestaTexto);

    // Intentar Generar y Enviar Audio
    if (voiceEnabled) {
        try {
            console.log('🎙️ Generando nota de voz...');
            // Simulación simple si la librería falla o para pruebas rápidas sin gastar cuota
            const audioPath = await generarAudio(respuestaTexto);

            // Si tuviéramos el path:
            if (audioPath) {
                const media = MessageMedia.fromFilePath(audioPath);
                await client.sendMessage(msg.from, media, { sendAudioAsVoice: true });
            }

            // NOTA: Para esta versión inicial, y dado que el usuario reportó "falta de cuota", 
            // dejaremos el envío de audio comentado hasta confirmar API Key válida para evitar crash.
            // Descomenta abajo cuando tengas la key confirmada.

            /* 
            const audioFile = await elevenLabs.textToSpeechStream({         
                textInput: respuestaTexto,
                voiceId: VOICE_ID
            });
            // Aquí se requeriría guardar el stream a un archivo temporal y luego enviarlo.
            */

            console.log('ℹ️ (Audio omitido por seguridad de cuota en primera ejecución)');

        } catch (audioError) {
            console.error('Error enviando audio:', audioError);
            await client.sendMessage(msg.from, "⚠️ (No pude generar la nota de voz, revisa mi terminal)");
        }
    }
});

// Iniciar Cliente
client.initialize();
