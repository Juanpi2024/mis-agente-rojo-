const path = require('path');
const fs = require('fs');
require('dotenv').config({ path: path.join(__dirname, '../rojo_comunicaciones/.env') });
const OpenAI = require('openai');
const { sendEmailAsPutin } = require('../asistente_personal/putin_agent');
const generateSlidesHTML = require('./slides_template');

const openai = new OpenAI({
    apiKey: process.env.OPENAI_API_KEY
});

/**
 * Gladys Marín - Especialista en Búsqueda y Formateo
 * "Buscamos la información hasta debajo de las piedras."
 */
class GladysMarin {
    constructor() {
        this.name = "Gladys Marín";
        this.motto = "Buscamos la verdad con rebeldía y claridad.";
    }

    /**
     * Realiza una investigación profunda usando Inteligencia Artificial
     */
    async exhaustiveSearch(query) {
        console.log(`🔍 [${this.name}] Iniciando investigación PROFUNDA para: "${query}"...`);

        try {
            const completion = await openai.chat.completions.create({
                model: 'gpt-4-turbo-preview',
                messages: [
                    {
                        role: 'system',
                        content: `Eres Gladys Marín, una investigadora experta, crítica y exhaustiva. 
                        Tu misión es entregar un informe de inteligencia DETALLADO y FUERTE sobre el tema solicitado.
                        No entregues respuestas pobres. Busca ángulos históricos, técnicos, sociales y prácticos.
                        Formato de salida: JSON con un array de objetos {source, snippet}. Mínimo 5 fuentes detalladas.`
                    },
                    { role: 'user', content: `Investiga a fondo sobre: ${query}` }
                ],
                response_format: { type: "json_object" }
            });

            const response = JSON.parse(completion.choices[0].message.content);
            // Si la IA devuelve un objeto con un array dentro, lo extraemos. 
            // Esperamos algo como { "sources": [...] } o similar.
            const results = response.sources || response.resultados || response.results || Object.values(response)[0];

            return Array.isArray(results) ? results : [{ source: "Inteligencia Central", snippet: "Error procesando fuentes detalladas, pero la investigación continúa." }];

        } catch (error) {
            console.error("❌ Error en investigación IA:", error);
            return [
                { source: "Archivo Digital", snippet: `Información sobre ${query} (Recuperación de emergencia).` }
            ];
        }
    }

    /**
     * Formatea la información encontrada
     */
    formatInformation(results, format = 'formal') {
        let content = "";

        switch (format) {
            case 'creative':
                content = `## ✨ Relato Crítico: Análisis Profundo del Tema\n\n`;
                results.forEach(r => {
                    content += `### 💥 ${r.source}\n${r.snippet}\n\n`;
                });
                break;

            case 'presentation':
                content = `# Propuesta de Presentación Detallada\n\n`;
                results.forEach((r, i) => {
                    content += `## Diapositiva ${i + 1}: ${r.source}\n- ${r.snippet}\n\n`;
                });
                break;

            case 'formal':
            default:
                content = `# 📄 INFORME DE INTELIGENCIA ESTRATÉGICA: ${new Date().toLocaleDateString()}\n\n`;
                results.forEach(r => {
                    content += `### 🏢 Fuente: ${r.source}\n${r.snippet}\n\n---\n`;
                });
                break;
        }

        return content;
    }

    /**
     * Ejecuta el flujo completo: Buscar -> Formatear -> Enviar
     */
    async runMission(query, format = 'formal', targetEmail = 'profepablo2010@gmail.com') {
        const results = await this.exhaustiveSearch(query);
        let formattedContent = this.formatInformation(results, format);
        let presentationLink = "";

        // Si es formato presentación, generamos el archivo HTML
        if (format === 'presentation') {
            const htmlSlides = generateSlidesHTML(query, results);
            const outputDir = path.join(__dirname, 'outputs');
            if (!fs.existsSync(outputDir)) fs.mkdirSync(outputDir);

            const fileName = `presentacion_${Date.now()}.html`;
            const filePath = path.join(outputDir, fileName);
            fs.writeFileSync(filePath, htmlSlides);

            presentationLink = `<div style="background: #fff4f4; padding: 20px; border: 2px solid #b71c1c; margin-top: 20px;">
                <strong>📂 ARCHIVO ESTRATÉGICO GENERADO:</strong><br>
                Presentación HTML en: <code>${filePath}</code>
            </div>`;
        }

        const subject = `[INFORME GLADYS] ${query.toUpperCase()}`;
        const htmlBody = `
            <div style="font-family: Arial, sans-serif; border: 3px solid #b71c1c; padding: 30px; border-radius: 5px;">
                <h1 style="color: #b71c1c; border-bottom: 2px solid #b71c1c; padding-bottom: 10px;">🚩 Gladys Marín: Informe de Inteligencia</h1>
                <p style="font-style: italic;">"${this.motto}"</p>
                <div style="font-size: 1.1em; line-height: 1.6; color: #333;">
                    ${formattedContent.replace(/\n/g, '<br>')}
                </div>
                ${presentationLink}
                <div style="margin-top: 50px; border-top: 1px solid #ccc; padding-top: 20px; font-size: 0.9em; color: #666;">
                    <strong>Departamento:</strong> Investigación y Análisis Crítico<br>
                    <strong>Destino Primario:</strong> profepablo2010@gmail.com
                </div>
            </div>
        `;

        console.log(`📧 [${this.name}] Enviando investigación FUERTE a ${targetEmail}...`);
        return await sendEmailAs_Putin_Fixed(targetEmail, subject, formattedContent, htmlBody);
    }
}

// Función auxiliar para forzar el destinatario si no se indica otro
async function sendEmailAs_Putin_Fixed(email, subject, text, html) {
    const finalEmail = (email === 'yek.patty@gmail.com' || !email) ? 'profepablo2010@gmail.com' : email;
    return await sendEmailAsPutin(finalEmail, subject, text, html);
}

// Ejecución de prueba
if (require.main === module) {
    const gladys = new GladysMarin();
    const query = process.argv[2] || "Oportunidades de Financiamiento Educación 2026 Chile";
    const format = process.argv[3] || "formal";

    gladys.runMission(query, format).then(success => {
        if (success) {
            console.log('✅ Misión cumplida con éxito.');
            console.log('🚩 GLADYS: "¡A luchar, a luchar! El pueblo va a triunfar."');
        } else console.log('❌ Error en la entrega.');
    });
}

module.exports = GladysMarin;

// Ejecución de prueba si se llama directamente
if (require.main === module) {
    const gladys = new GladysMarin();
    const query = process.argv[2] || "Revolución Educativa";
    const format = process.argv[3] || "creative";

    gladys.runMission(query, format).then(success => {
        if (success) console.log('✅ Misión cumplida.');
        else console.log('❌ Falló la entrega del informe.');
    });
}

module.exports = GladysMarin;
