const { Client, LocalAuth } = require('whatsapp-web.js');
const qrcode = require('qrcode-terminal');
require('dotenv').config();

// Configuración del Cliente
const client = new Client({
    authStrategy: new LocalAuth(),
    puppeteer: { args: ['--no-sandbox'] }
});

const TEST_NUMBER = '56984668005'; // Número proporcionado por el usuario
const SURVEY_LINK = 'https://tu-sitio-ceia.web.app/diagnostico'; // Link simulado (Ho Chi Minh)

const MESSAGE_TEMPLATE = `Hola, te saluda el equipo del CEIA. 🏢🔴 

Queremos que este 2026 sea tu mejor año escolar. Para apoyarte mejor, necesitamos conocer tu realidad. 

Es una encuesta **100% ANÓNIMA**. Tu voz es fundamental. 🫡🚩

👇 Ingresa aquí:
${SURVEY_LINK}

¡Bienvenido/a a clases!`;

const fs = require('fs');
const path = require('path');

client.on('qr', (qr) => {
    console.log('🔴 NUEVO QR GENERADO. Guardando en qr_test.png...');
    qrcode.generate(qr, { small: true });

    // Guardar también en archivo para que el usuario pueda verlo bien
    require('qrcode').toFile(path.join(__dirname, 'qr_test.png'), qr, {
        color: { dark: '#000000', light: '#FFFFFF' }
    });
});

client.on('authenticated', () => {
    console.log('✅ AUTENTICADO! (El escaneo funcionó)');
    console.log('⏳ Sincronizando... Iniciando "Modo Persistente" de envío.');

    // Intento cada 5 segundos hasta que funcione
    const interval = setInterval(async () => {
        console.log('⚡ Intentando enviar mensaje...');
        try {
            const chatId = `${TEST_NUMBER}@c.us`;
            const chat = await client.getChatById(chatId);
            await chat.sendMessage(MESSAGE_TEMPLATE);

            console.log(`✅✅✅ MENSAJE ENVIADO A ${TEST_NUMBER} ✅✅✅`);
            clearInterval(interval);
            setTimeout(() => process.exit(0), 5000);
        } catch (e) {
            console.log(`⚠️ Cliente aún cargando... reintentaremos en 5s. (Error: ${e.message})`);
        }
    }, 5000);
});

client.on('auth_failure', (msg) => {
    console.error('❌ FALLO DE AUTENTICACION:', msg);
});

client.on('loading_screen', (percent, message) => {
    console.log(`⏳ Cargando WhatsApp: ${percent}% - ${message}`);
});

client.on('ready', async () => {
    console.log('🔴 ROJO EN LÍNEA (READY). Ejecutando envío...');
    // ... (Código original de envío)
    console.log('🔴 ROJO EN LÍNEA. Ejecutando envío de prueba...');

    try {
        const chatId = `${TEST_NUMBER}@c.us`;
        await client.sendMessage(chatId, MESSAGE_TEMPLATE);
        console.log(`✅ Mensaje enviado con éxito a ${TEST_NUMBER}`);

        console.log('Cerrando sesión de prueba en 5 segundos...');
        setTimeout(() => process.exit(0), 5000);
    } catch (error) {
        console.error('❌ Error enviando el mensaje:', error);
        process.exit(1);
    }
});

client.initialize();
