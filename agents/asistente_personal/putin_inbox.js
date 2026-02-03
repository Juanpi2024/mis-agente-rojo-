const { ImapFlow } = require('imapflow');
const { simpleParser } = require('mailparser');
const path = require('path');
const OpenAI = require('openai');
require('dotenv').config({ path: path.join(__dirname, '../rojo_comunicaciones/.env') });

const openai = new OpenAI({
    apiKey: process.env.OPENAI_API_KEY
});

class PutinInbox {
    constructor() {
        let host = process.env.SMTP_HOST.replace('smtp', 'imap');
        if (process.env.SMTP_USER.includes('gmail.com')) {
            host = 'imap.gmail.com';
        }

        this.client = new ImapFlow({
            host: host,
            port: 993,
            secure: true,
            auth: {
                user: process.env.SMTP_USER,
                pass: process.env.SMTP_PASS
            },
            logger: false
        });
    }

    async readLastEmails(limit = 5) {
        console.log(`🇷🇺 [Putin Inbox] Accediendo a la bandeja de entrada...`);
        let emails = [];

        try {
            await this.client.connect();
            console.log(`✅ [Putin Inbox] Conexión establecida.`);

            // Ver estado del buzón
            const status = await this.client.status('INBOX', { messages: true });
            console.log(`📊 [Putin Inbox] Mensajes en INBOX: ${status.messages}`);

            if (status.messages === 0) {
                await this.client.logout();
                return [];
            }

            let lock = await this.client.getMailboxLock('INBOX');
            try {
                // Fetch de los últimos 'limit' mensajes
                // imapflow fetch usa rangos o números. '1:*' son todos.
                // Usaremos un rango para los últimos N
                const start = Math.max(1, status.messages - limit + 1);
                const range = `${start}:*`;

                for await (let message of this.client.fetch(range, { source: true, envelope: true })) {
                    let parsed = await simpleParser(message.source);
                    emails.push({
                        from: parsed.from ? parsed.from.text : (message.envelope.from ? message.envelope.from[0].name : "Desconocido"),
                        subject: parsed.subject || message.envelope.subject || "(Sin asunto)",
                        date: parsed.date || message.envelope.date,
                        summary: await this.summarizeText(parsed.text || parsed.html || "")
                    });
                }
            } finally {
                lock.release();
            }

            await this.client.logout();
            // Revertir el orden para que los más nuevos salgan arriba
            return emails.reverse();

        } catch (error) {
            console.error('❌ [Putin Inbox] Error accediendo al correo:', error.message);
            try { await this.client.logout(); } catch (e) { }
            return null;
        }
    }

    async summarizeText(text) {
        if (!text || text.trim().length === 0) return "Sin contenido legible.";

        try {
            const completion = await openai.chat.completions.create({
                model: "gpt-4-turbo-preview",
                messages: [
                    {
                        role: "system",
                        content: "Resume este correo en una frase corta (máx 15 palabras) para WhatsApp. Indica el remitente y la intención principal."
                    },
                    { role: "user", content: text.substring(0, 2000) }
                ],
                max_tokens: 50
            });
            return completion.choices[0].message.content.trim();
        } catch (error) {
            return text.substring(0, 80).replace(/\n/g, ' ') + "...";
        }
    }
}

module.exports = PutinInbox;
