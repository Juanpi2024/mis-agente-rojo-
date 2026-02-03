/**
 * 🛡️ EL CHE - Módulo DOCX Cleaner v2.1
 * Limpieza profunda de metadatos emulando "Inspeccionar documento" de Word
 */

const fs = require('fs');
const path = require('path');
const AdmZip = require('adm-zip');

/**
 * Analiza metadatos de un archivo DOCX
 * @param {string} filePath - Ruta al archivo DOCX
 * @returns {Object} Metadatos encontrados
 */
async function analyzeMetadata(filePath) {
    const metadata = {
        path: filePath,
        name: path.basename(filePath),
        hasMetadata: false,
        creator: null,
        lastModifiedBy: null,
        company: null,
        manager: null,
        hasComments: false,
        commentsCount: 0,
        hasRevisions: false,
        hasMacros: false,
        hasCustomXml: false,
        title: null
    };

    try {
        const zip = new AdmZip(filePath);

        // Analizar docProps/core.xml
        const coreXml = zip.getEntry('docProps/core.xml');
        if (coreXml) {
            const content = coreXml.getData().toString('utf8');

            const creatorMatch = content.match(/<dc:creator>(.*?)<\/dc:creator>/);
            if (creatorMatch && creatorMatch[1].trim()) {
                metadata.creator = creatorMatch[1].trim();
                metadata.hasMetadata = true;
            }

            const lastModMatch = content.match(/<cp:lastModifiedBy>(.*?)<\/cp:lastModifiedBy>/);
            if (lastModMatch && lastModMatch[1].trim()) {
                metadata.lastModifiedBy = lastModMatch[1].trim();
                metadata.hasMetadata = true;
            }

            const titleMatch = content.match(/<dc:title>(.*?)<\/dc:title>/);
            if (titleMatch && titleMatch[1].trim()) {
                metadata.title = titleMatch[1].trim();
            }
        }

        // Analizar docProps/app.xml
        const appXml = zip.getEntry('docProps/app.xml');
        if (appXml) {
            const content = appXml.getData().toString('utf8');

            const companyMatch = content.match(/<Company>(.*?)<\/Company>/);
            if (companyMatch && companyMatch[1].trim()) {
                metadata.company = companyMatch[1].trim();
                metadata.hasMetadata = true;
            }

            const managerMatch = content.match(/<Manager>(.*?)<\/Manager>/);
            if (managerMatch && managerMatch[1].trim()) {
                metadata.manager = managerMatch[1].trim();
                metadata.hasMetadata = true;
            }
        }

        // Buscar comentarios
        const commentsXml = zip.getEntry('word/comments.xml');
        if (commentsXml) {
            const content = commentsXml.getData().toString('utf8');
            const matches = content.match(/<w:comment /g);
            if (matches) {
                metadata.hasComments = true;
                metadata.commentsCount = matches.length;
                metadata.hasMetadata = true;
            }
        }

        // Buscar revisiones (track changes)
        const settingsXml = zip.getEntry('word/settings.xml');
        if (settingsXml) {
            const content = settingsXml.getData().toString('utf8');
            if (content.includes('<w:trackRevisions')) {
                metadata.hasRevisions = true;
            }
        }

        // Buscar Macros (vbaProject.bin suele indicar macros)
        if (zip.getEntry('word/vbaProject.bin') || zip.getEntry('word/vbaData.xml')) {
            metadata.hasMacros = true;
            metadata.hasMetadata = true;
        }

        // Buscar Custom XML
        const entries = zip.getEntries();
        if (entries.some(e => e.entryName.startsWith('customXml/'))) {
            metadata.hasCustomXml = true;
            metadata.hasMetadata = true;
        }

    } catch (err) {
        metadata.error = err.message;
    }

    return metadata;
}

/**
 * Genera el nombre de archivo limpio según las reglas del usuario:
 * - Solo texto (sin números)
 * - Agregar "_LIMPIO"
 * @param {string} originalName - Nombre original del archivo
 * @returns {string} Nombre limpio
 */
function cleanFileName(originalName) {
    const ext = path.extname(originalName);
    let name = path.basename(originalName, ext);

    // 1. Quitar números
    name = name.replace(/[0-9]/g, '');

    // 2. Limpiar guiones bajos duplicados o sobrantes por quitar los números
    name = name.replace(/_+/g, '_');
    name = name.replace(/^_|_$/g, '');

    // 3. Quitar la palabra "LIMPIO" o "LIMPIA" si ya la tiene para no duplicar
    name = name.replace(/_?(LIMPIO|LIMPIA)/gi, '');

    return `${name}_LIMPIO${ext}`;
}

/**
 * Limpieza profunda de un archivo DOCX
 * @param {string} inputPath - Ruta al archivo original
 * @param {string} outputPath - Ruta al archivo limpio (opcional)
 * @returns {Object} Resultado de la limpieza
 */
async function cleanDeep(inputPath, outputPath = null) {
    if (!outputPath) {
        const dir = path.dirname(inputPath);
        const newName = cleanFileName(path.basename(inputPath));
        outputPath = path.join(dir, newName);
    }

    try {
        const zip = new AdmZip(inputPath);
        let cleaned = [];

        // 1. Propiedades del documento e información personal (core.xml)
        const coreEntry = zip.getEntry('docProps/core.xml');
        if (coreEntry) {
            let content = coreEntry.getData().toString('utf8');
            content = content.replace(/<dc:creator>.*?<\/dc:creator>/g, '<dc:creator></dc:creator>');
            content = content.replace(/<cp:lastModifiedBy>.*?<\/cp:lastModifiedBy>/g, '<cp:lastModifiedBy></cp:lastModifiedBy>');
            content = content.replace(/<dc:title>.*?<\/dc:title>/g, '<dc:title></dc:title>');
            content = content.replace(/<dc:subject>.*?<\/dc:subject>/g, '<dc:subject></dc:subject>');
            content = content.replace(/<cp:keywords>.*?<\/cp:keywords>/g, '<cp:keywords></cp:keywords>');
            content = content.replace(/<dc:description>.*?<\/dc:description>/g, '<dc:description></dc:description>');

            zip.updateFile('docProps/core.xml', Buffer.from(content, 'utf8'));
            cleaned.push('Información personal (Autor, Creador)');
        }

        // 2. Propiedades de la aplicación (app.xml - Empresa, Manager)
        const appEntry = zip.getEntry('docProps/app.xml');
        if (appEntry) {
            let content = appEntry.getData().toString('utf8');
            content = content.replace(/<Company>.*?<\/Company>/g, '<Company></Company>');
            content = content.replace(/<Manager>.*?<\/Manager>/g, '<Manager></Manager>');
            content = content.replace(/<Application>.*?<\/Application>/g, '<Application></Application>');

            zip.updateFile('docProps/app.xml', Buffer.from(content, 'utf8'));
            cleaned.push('Propiedades de aplicación (Empresa, Manager)');
        }

        // 3. Comentarios, revisiones y versiones
        if (zip.getEntry('word/comments.xml')) {
            zip.deleteFile('word/comments.xml');
            cleaned.push('Comentarios');
        }
        if (zip.getEntry('word/commentsExtended.xml')) {
            zip.deleteFile('word/commentsExtended.xml');
            cleaned.push('Comentarios extendidos');
        }

        // 4. Datos XML personalizados
        const entries = zip.getEntries();
        const customXmlEntries = entries.filter(e => e.entryName.startsWith('customXml/'));
        for (const entry of customXmlEntries) {
            zip.deleteFile(entry.entryName);
        }
        if (customXmlEntries.length > 0) cleaned.push('Datos XML personalizados');

        // 5. Macros y controles ActiveX (Quitar vbaProject.bin)
        if (zip.getEntry('word/vbaProject.bin')) {
            zip.deleteFile('word/vbaProject.bin');
            cleaned.push('Macros (VBA Project)');
        }
        if (zip.getEntry('word/vbaData.xml')) {
            zip.deleteFile('word/vbaData.xml');
            cleaned.push('Datos de Macros');
        }

        // 6. Propiedades personalizadas
        if (zip.getEntry('docProps/custom.xml')) {
            zip.deleteFile('docProps/custom.xml');
            cleaned.push('Propiedades personalizadas');
        }

        // 7. Borrar thumbnails
        if (zip.getEntry('docProps/thumbnail.jpeg')) {
            zip.deleteFile('docProps/thumbnail.jpeg');
            cleaned.push('Miniatura del documento');
        }

        // Guardar archivo limpio
        zip.writeZip(outputPath);

        return {
            success: true,
            outputPath,
            cleaned: cleaned,
            cleanedCount: cleaned.length
        };

    } catch (err) {
        return { success: false, error: err.message };
    }
}

module.exports = {
    analyzeMetadata,
    cleanDeep,
    cleanFileName
};
