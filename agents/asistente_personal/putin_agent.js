const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '../rojo_comunicaciones/.env') });
const nodemailer = require('nodemailer');

/**
 * Putin (Nexo) - Especialista en Inteligencia y Comunicaciones
 * Misión: Gestión de correos, agenda y filtrado de urgencias.
 */

async function sendEmailAsPutin(targetEmail, subject, text, html) {
    console.log(`🇷🇺 [Putin Nexo] Iniciando protocolo de comunicación hacia: ${targetEmail}`);

    // Validar que tenemos acceso a las credenciales en el .env del orquestador
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
            from: `"Putin (Nexo Communications)" <${process.env.SMTP_USER}>`,
            to: targetEmail,
            subject: `[NEXO] ${subject}`,
            text: text,
            html: `
                <div style="font-family: 'Courier New', Courier, monospace; border-left: 5px solid #000; padding: 20px; background-color: #f9f9f9;">
                    <div style="font-weight: bold; color: #d32f2f; margin-bottom: 10px;">🇷🇺 DISPACHO DE INTELIGENCIA - NEXO</div>
                    ${html}
                    <div style="margin-top: 30px; font-size: 0.8em; color: #555;">
                        --- DOCUMENTO CIFRADO Y AUTOMATIZADO ---<br>
                        <strong>Agente:</strong> Putin (Comunicaciones Nexo)<br>
                        <strong>Orquestación:</strong> Rojo Comunicaciones
                    </div>
                </div>
            `,
        });
        console.log('✅ [Putin Nexo] Comunicación enviada con éxito:', info.messageId);
        return true;
    } catch (error) {
        console.error('❌ [Putin Nexo] Error en la interconexión de correo:', error);
        return false;
    }
}

// Ejecución de prueba para la camarada Patty
if (require.main === module) {
    const target = 'yek.patty@gmail.com';
    const subject = 'Prueba de Automatización de Comunicaciones';
    const body = 'Camarada, esta es una prueba de automatización de mi nuevo protocolo de inteligencia y comunicaciones. Atentamente, Putin.';
    const htmlBody = `<p>${body}</p>`;

    sendEmailAsPutin(target, subject, body, htmlBody).then(success => {
        if (success) console.log('✅ Operación completada.');
        else process.exit(1);
    });
}

module.exports = { sendEmailAsPutin };
