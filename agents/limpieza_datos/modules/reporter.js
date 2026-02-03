/**
 * 🛡️ EL CHE - Módulo Reporter
 * Genera reportes detallados de auditoría
 */

const path = require('path');

// Colores ANSI para terminal
const C = {
    reset: '\x1b[0m',
    bold: '\x1b[1m',
    dim: '\x1b[2m',
    red: '\x1b[31m',
    green: '\x1b[32m',
    yellow: '\x1b[33m',
    blue: '\x1b[34m',
    magenta: '\x1b[35m',
    cyan: '\x1b[36m',
    white: '\x1b[37m',
    bgRed: '\x1b[41m',
    bgGreen: '\x1b[42m',
    bgYellow: '\x1b[43m'
};

/**
 * Formatea tamaño en bytes a formato legible
 */
function formatSize(bytes) {
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

/**
 * Imprime encabezado del reporte
 */
function printHeader(repositoryPath) {
    const date = new Date().toLocaleString('es-CL');
    console.log(`
${C.cyan}${C.bold}╔═══════════════════════════════════════════════════════════════════╗
║  🛡️  EL CHE - CUSTODIO DE PRIVACIDAD - REPORTE DE AUDITORÍA       ║
╚═══════════════════════════════════════════════════════════════════╝${C.reset}

${C.dim}📁 Repositorio:${C.reset} ${repositoryPath}
${C.dim}📅 Fecha:${C.reset} ${date}
${'─'.repeat(70)}
`);
}

/**
 * Imprime resumen estadístico
 */
function printSummary(stats) {
    console.log(`
${C.bold}📊 RESUMEN${C.reset}
${'─'.repeat(40)}
${C.green}✅ Archivos limpios:${C.reset}        ${stats.clean}
${C.yellow}⚠️  Con metadatos:${C.reset}          ${stats.withMetadata}
${C.red}🔴 Requieren conversión:${C.reset}   ${stats.needsConversion}
${C.blue}📄 Total escaneados:${C.reset}       ${stats.total}
${'─'.repeat(40)}
`);
}

/**
 * Imprime tabla de archivos con metadatos
 */
function printMetadataTable(filesWithMetadata) {
    if (filesWithMetadata.length === 0) {
        console.log(`\n${C.green}✅ No se encontraron archivos con metadatos sensibles.${C.reset}\n`);
        return;
    }

    console.log(`\n${C.bold}${C.yellow}⚠️  ARCHIVOS CON METADATOS DETECTADOS${C.reset}\n`);

    // Cabecera de tabla
    console.log(`${C.dim}┌${'─'.repeat(40)}┬${'─'.repeat(15)}┬${'─'.repeat(10)}┐${C.reset}`);
    console.log(`${C.dim}│${C.reset} ${C.bold}Archivo${C.reset}${' '.repeat(33)}${C.dim}│${C.reset} ${C.bold}Autor${C.reset}${' '.repeat(9)}${C.dim}│${C.reset} ${C.bold}Coment.${C.reset}${' '.repeat(2)}${C.dim}│${C.reset}`);
    console.log(`${C.dim}├${'─'.repeat(40)}┼${'─'.repeat(15)}┼${'─'.repeat(10)}┤${C.reset}`);

    for (const file of filesWithMetadata) {
        const name = file.name.length > 38 ? file.name.substring(0, 35) + '...' : file.name;
        const author = (file.creator || file.lastModifiedBy || '-').substring(0, 13);
        const comments = file.commentsCount || 0;

        console.log(`${C.dim}│${C.reset} ${name}${' '.repeat(Math.max(0, 39 - name.length))}${C.dim}│${C.reset} ${author}${' '.repeat(Math.max(0, 14 - author.length))}${C.dim}│${C.reset} ${comments}${' '.repeat(Math.max(0, 9 - String(comments).length))}${C.dim}│${C.reset}`);
    }

    console.log(`${C.dim}└${'─'.repeat(40)}┴${'─'.repeat(15)}┴${'─'.repeat(10)}┘${C.reset}`);
}

/**
 * Imprime archivos que necesitan conversión manual
 */
function printConversionNeeded(files) {
    if (files.length === 0) return;

    console.log(`\n${C.bold}${C.red}🔴 REQUIEREN CONVERSIÓN MANUAL (.doc → .docx)${C.reset}\n`);

    for (const file of files.slice(0, 10)) {
        console.log(`   ${C.dim}•${C.reset} ${file.name}`);
    }

    if (files.length > 10) {
        console.log(`   ${C.dim}... y ${files.length - 10} más${C.reset}`);
    }
}

/**
 * Imprime resultado de limpieza
 */
function printCleanResult(result) {
    if (result.success) {
        console.log(`${C.green}✅ Limpio:${C.reset} ${path.basename(result.outputPath)}`);
        if (result.cleaned && result.cleaned.length > 0) {
            for (const item of result.cleaned) {
                console.log(`   ${C.dim}├─${C.reset} ${item}`);
            }
        }
    } else {
        console.log(`${C.red}❌ Error:${C.reset} ${result.error}`);
    }
}

/**
 * Imprime ayuda
 */
function printHelp() {
    console.log(`
${C.cyan}${C.bold}🛡️ EL CHE - Custodio de Privacidad v2.0${C.reset}

${C.bold}Uso:${C.reset}
  node limpieza.js [comando] [opciones]

${C.bold}Comandos:${C.reset}
  ${C.green}--scan, -s${C.reset}              Escanear y mostrar metadatos
  ${C.green}--audit, -a${C.reset}             Generar reporte detallado de auditoría
  ${C.green}--clean, -c${C.reset}             Limpiar TODOS los archivos DOCX
  ${C.green}--clean <ruta>${C.reset}          Limpiar archivo específico
  ${C.green}--deep <ruta>${C.reset}           Limpieza profunda OOXML
  ${C.green}--help, -h${C.reset}              Mostrar esta ayuda

${C.bold}Ejemplos:${C.reset}
  node limpieza.js --scan
  node limpieza.js --audit
  node limpieza.js --clean "C:\\ruta\\archivo.docx"
  node limpieza.js --deep "C:\\ruta\\archivo.docx"

${C.bold}Repositorio configurado:${C.reset}
  D:\\Users\\Pablo\\Desktop\\ESCRITORIO TRABAJO 2023\\mi aula editado\\ENSEÑANZA MEDIA
`);
}

module.exports = {
    C,
    formatSize,
    printHeader,
    printSummary,
    printMetadataTable,
    printConversionNeeded,
    printCleanResult,
    printHelp
};
