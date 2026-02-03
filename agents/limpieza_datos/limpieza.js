/**
 * 🛡️ EL CHE - CUSTODIO DE PRIVACIDAD v2.0
 * Agente de limpieza de metadatos para documentos Office
 * 
 * Comandos:
 *   --scan, -s    Escanear y mostrar metadatos
 *   --audit, -a   Generar reporte detallado
 *   --clean, -c   Limpiar archivos (todos o específico)
 *   --deep        Limpieza profunda OOXML
 *   --help, -h    Mostrar ayuda
 */

const fs = require('fs');
const path = require('path');
const { Document, Packer, Paragraph, TextRun, HeadingLevel, AlignmentType } = require('docx');

// Módulos propios
const { scanDirectory, groupByType, filterPending } = require('./modules/scanner');
const { analyzeMetadata, cleanBasic, cleanDeep } = require('./modules/docx-cleaner');
const { C, printHeader, printSummary, printMetadataTable, printConversionNeeded, printCleanResult, printHelp, formatSize } = require('./modules/reporter');

// Configuración - Repositorio local de materiales
const DEPOSITOS_PATH = 'D:\\Users\\Pablo\\Desktop\\ESCRITORIO TRABAJO 2023\\mi aula editado\\ENSEÑANZA MEDIA';

// === CONVERTIR MD A DOCX ===
function parseMarkdown(mdText) {
    const lines = mdText.split('\n');
    const docChildren = [];

    lines.forEach(line => {
        const trimmed = line.trim();
        if (!trimmed) return;

        if (trimmed.startsWith('# ')) {
            docChildren.push(new Paragraph({
                text: trimmed.substring(2),
                heading: HeadingLevel.HEADING_1,
                spacing: { before: 200, after: 100 }
            }));
        } else if (trimmed.startsWith('## ')) {
            docChildren.push(new Paragraph({
                text: trimmed.substring(3),
                heading: HeadingLevel.HEADING_2,
                spacing: { before: 200, after: 100 }
            }));
        } else if (trimmed.startsWith('### ')) {
            docChildren.push(new Paragraph({
                text: trimmed.substring(4),
                heading: HeadingLevel.HEADING_3,
                spacing: { before: 200, after: 100 }
            }));
        } else if (trimmed.startsWith('- ')) {
            docChildren.push(new Paragraph({
                text: trimmed.substring(2),
                bullet: { level: 0 }
            }));
        } else {
            const parts = trimmed.split('**');
            const runs = parts.map((part, index) => {
                return new TextRun({
                    text: part,
                    bold: index % 2 === 1
                });
            });
            docChildren.push(new Paragraph({
                children: runs,
                alignment: AlignmentType.JUSTIFIED,
                spacing: { after: 100 }
            }));
        }
    });

    return docChildren;
}

async function convertMdToDocx(inputPath, outputPath = null) {
    if (!outputPath) {
        const dir = path.dirname(inputPath);
        const name = path.basename(inputPath, '.md');
        outputPath = path.join(dir, `${name}_LIMPIO.docx`);
    }

    const mdContent = fs.readFileSync(inputPath, 'utf-8');
    const children = parseMarkdown(mdContent);

    const doc = new Document({
        sections: [{
            properties: {},
            children: children,
        }],
    });

    const buffer = await Packer.toBuffer(doc);
    fs.writeFileSync(outputPath, buffer);

    return { success: true, outputPath };
}

// === COMANDO PRINCIPAL ===
async function main() {
    const args = process.argv.slice(2);
    const command = args[0] || '--help';

    // === HELP ===
    if (command === '--help' || command === '-h') {
        printHelp();
        return;
    }

    // === SCAN (básico) ===
    if (command === '--scan' || command === '-s') {
        console.log(`\n${C.cyan}${C.bold}🛡️ EL CHE: Escaneando repositorio...${C.reset}\n`);
        console.log(`${C.dim}📂 ${DEPOSITOS_PATH}${C.reset}\n`);

        const files = scanDirectory(DEPOSITOS_PATH);

        if (files.length === 0) {
            console.log(`${C.yellow}⚠️ No se encontraron archivos para procesar.${C.reset}`);
            return;
        }

        const grouped = groupByType(files);

        console.log(`${C.green}✅ Encontrados ${files.length} archivos:${C.reset}`);
        for (const [ext, fileList] of Object.entries(grouped)) {
            console.log(`   ${C.dim}${ext}:${C.reset} ${fileList.length}`);
        }
        console.log('');

        // Analizar DOCX
        const docxFiles = grouped['.docx'] || [];
        let withMetadata = 0;

        for (const file of docxFiles.slice(0, 20)) { // Límite para demo
            const meta = await analyzeMetadata(file.path);
            if (meta.hasMetadata) {
                withMetadata++;
                console.log(`${C.yellow}⚠️ ${file.name}${C.reset}`);
                if (meta.creator) console.log(`   ${C.dim}Autor:${C.reset} ${meta.creator}`);
                if (meta.hasComments) console.log(`   ${C.dim}Comentarios:${C.reset} ${meta.commentsCount}`);
            }
        }

        if (docxFiles.length > 20) {
            console.log(`\n${C.dim}... mostrando primeros 20 de ${docxFiles.length} archivos DOCX${C.reset}`);
        }

        console.log(`\n${C.bold}Resumen:${C.reset} ${withMetadata} archivos con metadatos detectados.`);
        console.log(`${C.dim}Usa --audit para un reporte completo.${C.reset}\n`);
        return;
    }

    // === AUDIT (reporte completo) ===
    if (command === '--audit' || command === '-a') {
        printHeader(DEPOSITOS_PATH);

        const files = scanDirectory(DEPOSITOS_PATH);
        const grouped = groupByType(files);

        const docxFiles = grouped['.docx'] || [];
        const docFiles = grouped['.doc'] || [];

        const filesWithMetadata = [];
        let cleanCount = 0;

        console.log(`${C.dim}Analizando ${docxFiles.length} archivos DOCX...${C.reset}\n`);

        for (const file of docxFiles) {
            const meta = await analyzeMetadata(file.path);
            if (meta.hasMetadata) {
                filesWithMetadata.push(meta);
            } else {
                cleanCount++;
            }
        }

        printSummary({
            clean: cleanCount,
            withMetadata: filesWithMetadata.length,
            needsConversion: docFiles.length,
            total: files.length
        });

        printMetadataTable(filesWithMetadata.slice(0, 20));

        if (filesWithMetadata.length > 20) {
            console.log(`${C.dim}... y ${filesWithMetadata.length - 20} más${C.reset}`);
        }

        printConversionNeeded(docFiles);

        console.log(`\n${C.dim}Usa --clean para limpiar todos los archivos con metadatos.${C.reset}\n`);
        return;
    }

    // === CLEAN ===
    if (command === '--clean' || command === '-c') {
        const targetPath = args[1];

        if (targetPath) {
            // Limpiar archivo específico
            console.log(`\n${C.cyan}${C.bold}🛡️ EL CHE: Limpiando archivo...${C.reset}\n`);

            const ext = path.extname(targetPath).toLowerCase();

            if (ext === '.docx') {
                const result = await cleanBasic(targetPath);
                printCleanResult(result);
            } else if (ext === '.md') {
                const result = await convertMdToDocx(targetPath);
                printCleanResult(result);
            } else {
                console.log(`${C.red}❌ Formato no soportado: ${ext}${C.reset}`);
            }
        } else {
            // Limpiar todos
            console.log(`\n${C.cyan}${C.bold}🛡️ EL CHE: Limpiando TODOS los archivos...${C.reset}\n`);

            const files = scanDirectory(DEPOSITOS_PATH);
            const grouped = groupByType(files);
            const docxFiles = (grouped['.docx'] || []).filter(f => !f.isClean);

            let cleaned = 0;
            let errors = 0;

            for (const file of docxFiles) {
                const meta = await analyzeMetadata(file.path);
                if (meta.hasMetadata) {
                    const result = await cleanBasic(file.path);
                    if (result.success) {
                        console.log(`${C.green}✓${C.reset} ${file.name}`);
                        cleaned++;
                    } else {
                        console.log(`${C.red}✗${C.reset} ${file.name}: ${result.error}`);
                        errors++;
                    }
                }
            }

            console.log(`\n${C.bold}Resultado:${C.reset} ${cleaned} limpiados, ${errors} errores.`);
            console.log('☭ STALIN: "No hay hombre, no hay problema. Datos limpios."');
            return;
        }

        // === DEEP ===
        if (command === '--deep') {
            const targetPath = args[1];

            if (!targetPath) {
                console.log(`${C.red}❌ Debes especificar un archivo para limpieza profunda.${C.reset}`);
                console.log(`${C.dim}Ejemplo: node limpieza.js --deep "C:\\ruta\\archivo.docx"${C.reset}`);
                return;
            }

            console.log(`\n${C.cyan}${C.bold}🛡️ EL CHE: Limpieza profunda OOXML...${C.reset}\n`);

            // Mostrar metadatos antes
            const metaBefore = await analyzeMetadata(targetPath);
            console.log(`${C.bold}Antes:${C.reset}`);
            console.log(`   Autor: ${metaBefore.creator || '(vacío)'}`);
            console.log(`   Modificado por: ${metaBefore.lastModifiedBy || '(vacío)'}`);
            console.log(`   Empresa: ${metaBefore.company || '(vacío)'}`);
            console.log(`   Comentarios: ${metaBefore.commentsCount || 0}`);
            console.log('');

            const result = await cleanDeep(targetPath);
            printCleanResult(result);

            if (result.success) {
                // Mostrar metadatos después
                const metaAfter = await analyzeMetadata(result.outputPath);
                console.log(`\n${C.bold}Después:${C.reset}`);
                console.log(`   Autor: ${metaAfter.creator || '(vacío)'}`);
                console.log(`   Modificado por: ${metaAfter.lastModifiedBy || '(vacío)'}`);
                console.log(`   Empresa: ${metaAfter.company || '(vacío)'}`);
                console.log(`   Comentarios: ${metaAfter.commentsCount || 0}`);
            }
            return;
        }

        // Comando no reconocido
        console.log(`${C.red}❌ Comando no reconocido: ${command}${C.reset}`);
        console.log(`${C.dim}Usa --help para ver los comandos disponibles.${C.reset}`);
    }

    main().catch(err => {
        console.error(`${C.red}❌ Error fatal: ${err.message}${C.reset}`);
        process.exit(1);
    });
