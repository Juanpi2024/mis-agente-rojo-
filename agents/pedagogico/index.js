const OpenAI = require('openai');
const path = require('path');
const fs = require('fs');
require('dotenv').config({ path: path.join(__dirname, '../rojo_comunicaciones/.env') });

const openai = new OpenAI({
    apiKey: process.env.OPENAI_API_KEY
});

/**
 * El Che (Maestro Pedagogo) - Especialista en Materiales DUA
 */
class ElChePedagogo {
    constructor() {
        this.name = "El Che";
        this.motto = "La educación es una herramienta de liberación.";
    }

    async crearGuia(tema) {
        console.log(`📖 [${this.name}] Iniciando creación de Guía DUA para: ${tema}...`);

        try {
            const completion = await openai.chat.completions.create({
                model: 'gpt-4-turbo-preview',
                messages: [
                    {
                        role: 'system',
                        content: `Eres El Che, un maestro pedagogo experto en Diseño Universal para el Aprendizaje (DUA).
                        Tu misión es crear una GUÍA DE APRENDIZAJE de alta calidad.
                        Estructura:
                        1. Título Impactante.
                        2. Objetivo de Aprendizaje (OA).
                        3. Inicio (Activación de conocimientos).
                        4. Desarrollo (Contenido con andamiaje).
                        5. Cierre (Metacognición).
                        Usa un lenguaje motivador y pedagógicamente sólido. Salida en Markdown.`
                    },
                    { role: 'user', content: `Crea una guía DUA detallada sobre: ${tema}` }
                ]
            });

            const contenido = completion.choices[0].message.content;

            // Guardar en archivo
            const fileName = `guia_${tema.toLowerCase().replace(/ /g, '_')}_${Date.now()}.md`;
            const filePath = path.join(__dirname, fileName);
            fs.writeFileSync(filePath, contenido);

            console.log(`✅ [${this.name}] Guía creada con éxito: ${fileName}`);
            console.log('🇨🇺 CHE: "¡Hasta la victoria siempre! (Educativa). El conocimiento nos hace libres."');
            return contenido;
        } catch (error) {
            console.error("❌ [El Che] Error creando material:", error);
            return null;
        }
    }
}

// Ejecución si se llama directamente
if (require.main === module) {
    const che = new ElChePedagogo();
    const tema = process.argv[2] || "La importancia de la argumentación";
    che.crearGuia(tema);
}

module.exports = ElChePedagogo;
