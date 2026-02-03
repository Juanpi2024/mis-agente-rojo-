require('dotenv').config({ path: require('path').join(__dirname, '../rojo_comunicaciones/.env') });
const OpenAI = require('openai');

const openai = new OpenAI({
    apiKey: process.env.OPENAI_API_KEY
});

/**
 * Lenin - Especialista en Redacción y Difusión Revolucionaria
 */
class LeninRedactor {
    async generarMetadatos(tema) {
        console.log(`🚩 [Lenin] Redactando metadatos estratégicos para: ${tema}...`);

        try {
            const completion = await openai.chat.completions.create({
                model: 'gpt-4-turbo-preview',
                messages: [
                    {
                        role: 'system',
                        content: `Eres Lenin, un experto en marketing educativo y redacción persuasiva. 
                        Tu misión es crear metadatos para un recurso en ProfeSocial que capten la atención y demuestren valor pedagógico.
                        Formato de salida: JSON con {titulo, descripcionHTML, etiquetas (array), precio_sugerido}.`
                    },
                    { role: 'user', content: `Crea los metadatos para un material sobre: ${tema}` }
                ],
                response_format: { type: "json_object" }
            });

            return JSON.parse(completion.choices[0].message.content);
        } catch (error) {
            console.error("❌ Error en redacción IA:", error);
            return null;
        }
    }
}

module.exports = LeninRedactor;
