require('dotenv').config();
const { chromium } = require('playwright');
const path = require('path');

// Obtener credenciales
const EMAIL = process.env.PROFESOCIAL_EMAIL;
const PASSWORD = process.env.PROFESOCIAL_PASSWORD;

// CONFIGURACIÓN DE PUBLICACIONES (COLA DE TRABAJO)
const PUBLICATION_QUEUE = [
    {
        mes: 'Noviembre',
        titulo: 'Planificación Clase a Clase: Noviembre | Lenguaje y Comunicación 1° Medio',
        precio: '6',
        archivo: 'D:\\Users\\Pablo\\Desktop\\ESCRITORIO TRABAJO 2023\\mi aula editado\\ENSEÑANZA MEDIA\\PRIMERO MEDIO\\LENGUAJE\\LENG. SIN DUA\\unidad 4 LIS\\noviembre\\PLANIFICACION_CLASE_A_CLASE__NOVIEMBRE_.docx',
        tags: ['Lenguaje', 'Primero Medio', 'Planificación', 'Noviembre', 'Unidad 4'],
        descripcion: `
            <strong>📅 Planificación Detallada Clase a Clase - Noviembre</strong><br><br>
            Recurso pedagógico completo para la asignatura de <strong>Lenguaje y Comunicación</strong> en 1° Medio.<br><br>
            <strong>Contenido:</strong><ul>
            <li>✅ Planificación mensual estructurada.</li>
            <li>✅ Alineación con Objetivos de Aprendizaje.</li>
            <li>✅ Actividades diseñadas para el cierre de año.</li>
            </ul>
        `
    },
    {
        mes: 'Diciembre',
        titulo: 'Planificación Clase a Clase: Diciembre | Lenguaje y Comunicación 1° Medio',
        precio: '6',
        archivo: 'D:\\Users\\Pablo\\Desktop\\ESCRITORIO TRABAJO 2023\\mi aula editado\\ENSEÑANZA MEDIA\\PRIMERO MEDIO\\LENGUAJE\\LENG. SIN DUA\\unidad 4 LIS\\diciembre\\PLANIFICACION_CLASE_A_CLASE__DICIEMBRE.DOC',
        tags: ['Lenguaje', 'Primero Medio', 'Planificación', 'Diciembre', 'Unidad 4'],
        descripcion: `
            <strong>📅 Planificación Detallada Clase a Clase - Diciembre</strong><br><br>
            Cierre del año escolar para 1° Medio en <strong>Lenguaje y Comunicación</strong>.<br><br>
            <strong>Incluye:</strong><ul>
            <li>✅ Actividades de síntesis y evaluación final.</li>
            <li>✅ Estructura clara para las últimas semanas.</li>
            <li>✅ Material listo para aplicación en aula.</li>
            </ul>
        `
    }
];

(async () => {
    console.log('🔴 LENIN BULK: Iniciando Secuencia Masiva (Noviembre + Diciembre)...');

    if (!EMAIL || !PASSWORD) {
        console.error('❌ ERROR: Faltan credenciales');
        process.exit(1);
    }

    const browser = await chromium.launch({ headless: false, slowMo: 100 });
    const context = await browser.newContext({ viewport: { width: 1280, height: 800 } });
    const page = await context.newPage();

    try {
        // LOGIN ÚNICO
        console.log('🌍 Logueando en ProfeSocial...');
        await page.goto('https://profe.social/users/sign_in', { waitUntil: 'networkidle' });
        await page.fill('#user_email', EMAIL);
        await page.fill('#user_password', PASSWORD);
        await Promise.all([
            page.waitForNavigation({ waitUntil: 'networkidle' }),
            page.click('button.is-primary.is-block')
        ]);

        for (const item of PUBLICATION_QUEUE) {
            console.log(`\n🚀 PROCESANDO: Planificación de ${item.mes}...`);

            await page.goto('https://profe.social/posts/new', { waitUntil: 'networkidle' });

            // Llenar datos
            await page.fill('#post_title', item.titulo);
            await page.fill('#post_coin_price', item.precio);

            // Trix Description
            await page.evaluate((html) => {
                const editor = document.querySelector('trix-editor');
                if (editor && editor.editor) {
                    editor.editor.loadHTML('');
                    editor.editor.insertHTML(html);
                }
            }, item.descripcion);

            await page.selectOption('#post_resource_type', 'lesson');
            await page.fill('#post_min_age', '14');
            await page.fill('#post_max_age', '16');

            // Tags
            const tagInput = 'input[placeholder*="Etiquetas"]';
            for (const tag of item.tags) {
                await page.fill(tagInput, tag);
                await page.press(tagInput, 'Enter');
                await page.waitForTimeout(500);
            }

            // File
            console.log(`   📁 Cargando: ${path.basename(item.archivo)}`);
            const fileInput = await page.$('input[type="file"]');
            await fileInput.setInputFiles(item.archivo);
            await page.waitForTimeout(5000); // Espera subida

            // Checkboxes
            await page.evaluate(() => {
                document.querySelectorAll('input[type="checkbox"]').forEach(cb => {
                    if (!cb.checked) cb.click();
                });
            });

            // CLICK FINAL (Sin confirmación)
            console.log(`   📤 Enviando publicación...`);
            await page.waitForTimeout(2000); // Pequeña espera por si hay overlays

            // Selector más agresivo para el botón de envío real
            const submitSelectors = [
                'input[type="submit"]',
                'button[type="submit"]',
                '.is-primary.is-large',
                'input[value*="Publicar"]',
                'button:has-text("Publicar")'
            ];

            let clicked = false;
            for (const selector of submitSelectors) {
                try {
                    const btn = await page.$(selector);
                    if (btn && await btn.isVisible()) {
                        await btn.click();
                        clicked = true;
                        break;
                    }
                } catch (e) { }
            }

            if (!clicked) {
                console.log('   ⚠️ No se encontró botón por selectores estándar, forzando click por coordenadas o enter...');
                await page.keyboard.press('Enter');
            }

            await page.waitForNavigation({ waitUntil: 'networkidle', timeout: 30000 }).catch(() => console.log('   ⚠️ Navegación lenta tras publicar.'));
            console.log(`   ✅ Proceso de envío finalizado para: ${item.mes}`);

            // Espera breve entre publicaciones
            await page.waitForTimeout(3000);
        }

        console.log('\n🏁 PROCESO MASIVO COMPLETADO.');
        await page.waitForTimeout(10000);

    } catch (err) {
        console.error('❌ ERROR CRÍTICO:', err.message);
        await page.screenshot({ path: 'bulk_error.png' });
    } finally {
        await browser.close();
    }
})();
