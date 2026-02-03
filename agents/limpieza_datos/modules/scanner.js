/**
 * 🛡️ EL CHE - Módulo Scanner
 * Escanea directorios recursivamente buscando archivos de Office
 */

const fs = require('fs');
const path = require('path');

const SUPPORTED_EXTENSIONS = ['.docx', '.doc', '.md', '.xlsx', '.xls', '.pdf'];

/**
 * Escanea un directorio recursivamente
 * @param {string} dir - Directorio a escanear
 * @param {Array} results - Acumulador de resultados
 * @returns {Array} Lista de archivos encontrados
 */
function scanDirectory(dir, results = []) {
    if (!fs.existsSync(dir)) {
        return results;
    }

    try {
        const items = fs.readdirSync(dir, { withFileTypes: true });

        for (const item of items) {
            const fullPath = path.join(dir, item.name);

            if (item.isDirectory()) {
                // Ignorar directorios de sistema
                if (!item.name.startsWith('.') && item.name !== 'node_modules') {
                    scanDirectory(fullPath, results);
                }
            } else {
                const ext = path.extname(item.name).toLowerCase();
                if (SUPPORTED_EXTENSIONS.includes(ext)) {
                    const stats = fs.statSync(fullPath);
                    results.push({
                        path: fullPath,
                        name: item.name,
                        ext: ext,
                        size: stats.size,
                        modified: stats.mtime,
                        isClean: item.name.includes('_LIMPIO')
                    });
                }
            }
        }
    } catch (err) {
        // Ignorar errores de acceso
    }

    return results;
}

/**
 * Agrupa archivos por tipo
 * @param {Array} files - Lista de archivos
 * @returns {Object} Archivos agrupados por extensión
 */
function groupByType(files) {
    return files.reduce((acc, file) => {
        const type = file.ext;
        if (!acc[type]) acc[type] = [];
        acc[type].push(file);
        return acc;
    }, {});
}

/**
 * Filtra archivos que ya están limpios
 * @param {Array} files - Lista de archivos
 * @returns {Array} Archivos que necesitan limpieza
 */
function filterPending(files) {
    return files.filter(f => !f.isClean);
}

module.exports = {
    scanDirectory,
    groupByType,
    filterPending,
    SUPPORTED_EXTENSIONS
};
