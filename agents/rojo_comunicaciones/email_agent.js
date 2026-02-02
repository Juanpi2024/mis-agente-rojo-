require('dotenv').config();
const nodemailer = require('nodemailer');

async function sendEmailTo(targetEmail, subject, text, html) {
    console.log(`Enviando correo a ${targetEmail}...`);

    const transporter = nodemailer.createTransport({
        host: process.env.SMTP_HOST,
        port: process.env.SMTP_PORT,
        secure: process.env.SMTP_SECURE === 'true',
        auth: {
            user: process.env.SMTP_USER,
            pass: process.env.SMTP_PASS,
        },
    });

    try {
        const info = await transporter.sendMail({
            from: `"Orquestador Rojo" <${process.env.SMTP_USER}>`,
            to: targetEmail,
            subject: subject,
            text: text,
            html: html,
        });
        console.log('✅ Correo enviado con éxito:', info.messageId);
        return true;
    } catch (error) {
        console.error('❌ Error enviando correo:', error);
        return false;
    }
}

// Ejecución de prueba solicitada por el usuario
if (require.main === module) {
    const target = 'yek.patty@gmail.com';
    const subject = 'Prueba de Automatización - Orquestador Rojo';
    const body = 'Hola, esta es una prueba de automatización enviada desde la orquesta de Rojo con la nueva configuración de seguridad.';
    const htmlBody = `
        <div style="font-family: sans-serif; border: 1px solid #d32f2f; padding: 20px; border-radius: 8px;">
            <h2 style="color: #d32f2f;">🫡 Saludos de Rojo</h2>
            <p>${body}</p>
            <hr>
            <p style="font-size: 0.8em; color: #666;">Enviado automáticamente por el Agente de Correo.</p>
        </div>
    `;

    sendEmailTo(target, subject, body, htmlBody).then(success => {
        if (success) console.log('Prueba completada satisfactoriamente.');
        else process.exit(1);
    });
}

module.exports = { sendEmailTo };
