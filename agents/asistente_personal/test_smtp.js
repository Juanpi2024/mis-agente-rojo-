const nodemailer = require('nodemailer');
require('dotenv').config({ path: '../rojo_comunicaciones/.env' });

async function test() {
    console.log('Probando conexión SMTP...');
    const transporter = nodemailer.createTransport({
        host: process.env.SMTP_HOST,
        port: 587,
        secure: false,
        auth: {
            user: process.env.SMTP_USER,
            pass: process.env.SMTP_PASS,
        },
        debug: true,
        logger: true
    });

    try {
        await transporter.verify();
        console.log('✅ Conexión SMTP exitosa con puerto 587');
    } catch (e) {
        console.error('❌ Error puerto 587:', e.message);
    }
}
test();
