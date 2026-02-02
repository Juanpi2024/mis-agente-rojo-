const fs = require('fs');
const path = require('path');
const { Document, Packer, Paragraph, TextRun, HeadingLevel, AlignmentType } = require('docx');

const SOURCE_PATH = path.join('c:', 'Users', 'Casa', 'clawd', 'depositos_materiales', 'ENSEÑANZA MEDIA', 'PRIMERO MEDIO', 'LENGUAJE', 'GUIA_LA_NOTICIA_DUA_MEJORADA.md');
const TARGET_PATH = path.join('c:', 'Users', 'Casa', 'clawd', 'depositos_materiales', 'ENSEÑANZA MEDIA', 'PRIMERO MEDIO', 'LENGUAJE', 'GUIA_LIMPIA_DUA.docx');

// Simple Markdown parser for specific structure
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
            // Check for bold text **text**
            const parts = trimmed.split('**');
            const runs = parts.map((part, index) => {
                return new TextRun({
                    text: part,
                    bold: index % 2 === 1 // Odd indices are inside ** **
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

async function main() {
    console.log(`🧼 EL CHE: Iniciando limpieza profunda...`);
    console.log(`📄 Leyendo fuente: ${SOURCE_PATH}`);

    if (!fs.existsSync(SOURCE_PATH)) {
        console.error('❌ Error: Archivo fuente no encontrado.');
        process.exit(1);
    }

    const mdContent = fs.readFileSync(SOURCE_PATH, 'utf-8');
    const children = parseMarkdown(mdContent);

    // Add footer with "Limpio" mark or just clear
    const doc = new Document({
        sections: [{
            properties: {},
            children: children,
        }],
    });

    console.log(`🔨 Generando documento limpio...`);
    const buffer = await Packer.toBuffer(doc);

    fs.writeFileSync(TARGET_PATH, buffer);
    console.log(`✅ Archivo sanitizado guardado en: ${TARGET_PATH}`);
}

main().catch(err => console.error(err));
