const { Client, LocalAuth } = require('whatsapp-web.js');
const qrcode = require('qrcode-terminal');
const fs = require('fs');
const path = require('path');

process.on('uncaughtException', (err) => {
    console.error('❌ CRASH DETECTADO:', err);
    process.exit(1);
});

console.log('🔵 Iniciando Script de Verificación de Conexión...');

const client = new Client({
    authStrategy: new LocalAuth({ clientId: 'verify_' + Date.now() }),
    puppeteer: {
        args: ['--no-sandbox']
    }
});

// Evento: Generación de QR
client.on('qr', (qr) => {
    console.log('✨ QR GENERADO (Escanea esto con tu celular):');
    qrcode.generate(qr, { small: true });

    // Guardar también imagen por si acaso
    try {
        require('qrcode').toFile(path.join(__dirname, 'qr_verify.png'), qr, {
            color: { dark: '#000000', light: '#FFFFFF' }
        });
        console.log('📂 QR también guardado como imagen: qr_verify.png');
    } catch (e) {
        console.log('⚠️ No se pudo guardar qr_verify.png (falta dependencia qrcode?), pero usa el de la terminal.');
    }
});

// Evento: Autenticado
client.on('authenticated', () => {
    console.log('✅ AUTENTICADO CORRECTAMENTE');
});

// Evento: Listo
client.on('ready', () => {
    console.log('🚀 CLIENTE LISTO. La conexión funciona.');
    console.log('Prueba enviando un mensaje "PING" a este número desde tu celular.');
});

// Evento: Mensaje (Ping-Pong)
client.on('message', async msg => {
    console.log('📩 Mensaje recibido:', msg.body);
    if (msg.body.toUpperCase() === 'PING') {
        try {
            await msg.reply('PONG 🏓 (Conexión verificada)');
            console.log('✅ Respuesta PONG enviada.');
        } catch (e) {
            console.error('❌ Error enviando PONG:', e);
        }
    }
});

client.initialize();
