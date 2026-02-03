const path = require('path');
const fs = require('fs');
require('dotenv').config({ path: path.join(__dirname, '../rojo_comunicaciones/.env') });
const { sendEmailAsPutin } = require('../asistente_personal/putin_agent');
const generateSlidesHTML = require('./slides_template');

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
     * Simula una búsqueda exhaustiva (En un entorno real, esto conectaría con APIs de búsqueda)
     * @param {string} query 
     */
    async exhaustiveSearch(query) {
        console.log(`🔍 [${this.name}] Iniciando búsqueda rebelde para: "${query}"...`);
        // Simulación de resultados encontrados
        const results = [
            { source: "Archivo Digital", snippet: `Información detallada sobre ${query} desde una perspectiva histórica.` },
            { source: "Prensa Independiente", snippet: `Visiones alternativas y críticas sobre ${query}.` },
            { source: "Base de Datos ProfeSocial", snippet: `Recursos y materiales relacionados con ${query}.` }
        ];
        return results;
    }

    /**
     * Formatea la información encontrada
     * @param {Array} results 
     * @param {string} format 'formal' | 'creative' | 'presentation' | 'video'
     */
    formatInformation(results, format = 'formal') {
        let content = "";

        switch (format) {
            case 'creative':
                content = `## ✨ Relato Crítico: La Verdad sobre el Tema\n\n`;
                results.forEach(r => {
                    content += `> *Desde ${r.source} emergió una chispa:* ${r.snippet}\n\n`;
                });
                content += `\n**Conclusión:** La información no se oculta ante la persistencia.`;
                break;

            case 'presentation':
                content = `# Propuesta de Presentación\n\n`;
                results.forEach((r, i) => {
                    content += `## Diapositiva ${i + 1}: ${r.source}\n- ${r.snippet}\n\n`;
                });
                break;

            case 'video':
                content = `# Guion de Video Sugerido\n\n`;
                content += `**[Escena 1: Intro]** Cámara fija. Gladys mira a cámara.\n *Texto:* "Hoy vamos a revelar lo que encontramos sobre..."\n\n`;
                results.forEach(r => {
                    content += `**[Escena: ${r.source}]** Insertar gráficos.\n *Voz en off:* ${r.snippet}\n\n`;
                });
                break;

            case 'formal':
            default:
                content = `# Informe de Inteligencia: ${new Date().toLocaleDateString()}\n\n`;
                results.forEach(r => {
                    content += `### Fuente: ${r.source}\n- ${r.snippet}\n\n`;
                });
                break;
        }

        return content;
    }

    /**
     * Ejecuta el flujo completo: Buscar -> Formatear -> Enviar
     */
    async runMission(query, format = 'formal', targetEmail = 'yek.patty@gmail.com') {
        const results = await this.exhaustiveSearch(query);
        let formattedContent = this.formatInformation(results, format);
        let presentationLink = "";

        // Si es formato presentación, generamos el archivo HTML premium
        if (format === 'presentation') {
            const htmlSlides = generateSlidesHTML(query, results);
            const outputDir = path.join(__dirname, 'outputs');
            if (!fs.existsSync(outputDir)) fs.mkdirSync(outputDir);

            const fileName = `presentacion_${Date.now()}.html`;
            const filePath = path.join(outputDir, fileName);
            fs.writeFileSync(filePath, htmlSlides);

            presentationLink = `<p style="background: #fdf2f2; padding: 15px; border-radius: 5px; border: 1px solid #eccaca;">
                📥 <strong>Archivo Generado:</strong> Se ha creado una presentación premium en:<br>
                <code>${filePath}</code>
            </p>`;

            console.log(`✨ [${this.name}] Presentación HTML generada en: ${filePath}`);
        }

        const subject = `[INFORME GLADYS] Hallazgos sobre ${query}`;
        const htmlBody = `
            <div style="font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; border: 2px solid #b71c1c; padding: 25px; border-radius: 10px;">
                <h1 style="color: #b71c1c; margin-top: 0;">✊ Gladys Marín Informa</h1>
                <p style="font-style: italic; color: #555;">"${this.motto}"</p>
                <hr style="border: 0.5px solid #eee;">
                <div style="line-height: 1.6;">
                    ${formattedContent.replace(/\n/g, '<br>')}
                </div>
                ${presentationLink}
                <div style="margin-top: 40px; font-size: 0.85em; border-top: 1px solid #ddd; padding-top: 10px; color: #777;">
                    <strong>Agente:</strong> Gladys Marín (Investigación y Formatos)<br>
                    <strong>Estado:</strong> Información liberada.
                </div>
            </div>
        `;

        console.log(`📧 [${this.name}] Entregando hallazgos al agente de correo...`);
        return await sendEmailAsPutin(targetEmail, subject, formattedContent, htmlBody);
    }
}

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
