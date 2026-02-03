const fs = require('fs');
const path = require('path');

const CONTACTS_FILE = 'c:/Users/Casa/Downloads/base datos solo mayores y separados correos.csv';

/**
 * Busca contactos en el archivo CSV local.
 * @param {string} query - El nombre o apellido a buscar.
 * @returns {Array} - Lista de contactos encontrados.
 */
function buscarContactos(query) {
    if (!fs.existsSync(CONTACTS_FILE)) {
        console.error('Archivo de contactos no encontrado:', CONTACTS_FILE);
        return [];
    }

    try {
        const content = fs.readFileSync(CONTACTS_FILE, 'utf8');
        const lines = content.split('\n').filter(line => line.trim());

        // La primera línea es la cabecera
        const headers = lines[0].split(';');

        const results = [];
        const cleanQuery = query.toLowerCase().replace(/profe|profesora|asistente|sr|sra/gi, '').trim();
        const queryLower = cleanQuery || query.toLowerCase();

        for (let i = 1; i < lines.length; i++) {
            const cells = lines[i].split(';');
            if (cells.length < 4) continue;

            const nombre = cells[0] || '';
            const apellidoP = cells[1] || '';
            const apellidoM = cells[2] || '';
            const correo = cells[3] || '';
            const telefono = cells[4] || '';

            const nombreCompleto = `${nombre} ${apellidoP} ${apellidoM}`.toLowerCase();

            if (nombreCompleto.includes(queryLower) || correo.toLowerCase().includes(queryLower)) {
                const score = nombreCompleto.startsWith(queryLower) ? 2 : (nombre.toLowerCase().includes(queryLower) ? 1 : 0);
                results.push({
                    nombre: `${nombre} ${apellidoP} ${apellidoM}`.trim(),
                    correo,
                    telefono: telefono.trim(),
                    score
                });
            }
        }

        // Ordenar por score (mayor primero)
        results.sort((a, b) => b.score - a.score);

        return results.map(r => ({ nombre: r.nombre, correo: r.correo, telefono: r.telefono }));
    } catch (error) {
        console.error('Error al leer contactos:', error);
        return [];
    }
}

module.exports = { buscarContactos };
