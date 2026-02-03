const path = require('path');
const fs = require('fs');
require('dotenv').config({ path: path.join(__dirname, '../rojo_comunicaciones/.env') });
const OpenAI = require('openai');

const openai = new OpenAI({
    apiKey: process.env.OPENAI_API_KEY
});

// Cargar identidad
let SYSTEM_PROMPT = "Eres Pepe Mujica. Tu misión es sintetizar información compleja en sabiduría simple.";
try {
    const identityPath = path.join(__dirname, 'pepe_identity.md');
    if (fs.existsSync(identityPath)) {
        SYSTEM_PROMPT = fs.readFileSync(identityPath, 'utf8');
    }
} catch (e) {
    console.error("⚠️ No se pudo cargar la identidad de Pepe.");
}

async function sintetizar(textoEntrada) {
    console.log(`🌿 [Pepe] Reflexionando sobre el texto recibido...`);

    try {
        const completion = await openai.chat.completions.create({
            model: 'gpt-4-turbo-preview',
            messages: [
                { role: 'system', content: SYSTEM_PROMPT },
                { role: 'user', content: `Pepe, por favor rescata lo importante de esto y dímelo en tus palabras (formato formal pero humano) para enviarlo o presentarlo: \n\n"${textoEntrada}"` }
            ],
            temperature: 0.7,
        });

        const respuesta = completion.choices[0].message.content;
        console.log(`\n📢 MENSAJE DE PEPE:\n${respuesta}\n`);
        return respuesta;
    } catch (error) {
        console.error("❌ Error en la reflexión:", error.message);
        return "Muchacho, la máquina falló, pero la intención sigue intacta. Inténtalo de nuevo.";
    }
}

// Ejecución directa para orquestación
if (require.main === module) {
    const action = process.argv[2];
    const input = process.argv[3];

    if (action === 'synthesize' && input) {
        sintetizar(input);
    } else {
        console.log("Uso: node pepe_agent.js synthesize 'TEXTO'");
    }
}

module.exports = { sintetizar };
