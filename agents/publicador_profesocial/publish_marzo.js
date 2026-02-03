require('dotenv').config();
const { chromium } = require('playwright');
const path = require('path');
const fs = require('fs');

const EMAIL = process.env.PROFESOCIAL_EMAIL;
const PASSWORD = process.env.PROFESOCIAL_PASSWORD;

const CONFIG = {
    titulo: 'Planificación Clase a Clase: Febrero (Última Semana) y Marzo | Lenguaje y Comunicación 1° Medio',
    precio: '6',
    // La ruta proporcionada por el usuario
    archivoBase: 'D:\\Users\\Pablo\\Desktop\\ESCRITORIO TRABAJO 2023\\mi aula editado\\ENSEÑANZA MEDIA\\PRIMERO MEDIO\\LENGUAJE\\LENG. SIN DUA\\unidad 1 LIS\\marzo\\PLANIFICACION_CLASE_A_CLASE_FEBRERO_ULTIMA_SEMANA_Y_MARZO_93957_20210608_20200408_003526',
    tags: ['Lenguaje', 'Primero Medio', 'Planificación', 'Marzo', 'Febrero', 'Unidad 1'],
    descripcion: `
        <strong>📅 Planificación Detallada Clase a Clase - Febrero y Marzo</strong><br><br>
        Inicio del año escolar para la asignatura de <strong>Lenguaje y Comunicación</strong> en 1° Medio.<br><br>
        <strong>Características:</strong><ul>
        <li>✅ Planificación diagnóstica y nivelación inicial.</li>
        <li>✅ Objetivos de aprendizaje (OA) de la Unidad 1.</li>
        <li>✅ Actividades estructuradas para las primeras semanas del año.</li>
        </ul><br>
        <em>Estructura profesional y lista para el ingreso al aula en el primer trimestre.</em>
    `
};

(async () => {
    console.log('🔴 LENIN: Corrigiendo y lanzando Febrero-Marzo (Full Auto)...');

    if (!EMAIL || !PASSWORD) {
        console.error('❌ Faltan credenciales');
        process.exit(1);
    }

    const browser = await chromium.launch({ headless: false, slowMo: 100 });
    const context = await browser.newContext({ viewport: { width: 1280, height: 800 } });
    const page = await context.newPage();

    try {
        await page.goto('https://profe.social/users/sign_in', { waitUntil: 'networkidle' });
        if (await page.isVisible('#user_email')) {
            await page.fill('#user_email', EMAIL);
            await page.fill('#user_password', PASSWORD);
            await Promise.all([
                page.waitForNavigation({ waitUntil: 'networkidle' }),
                page.click('button.is-primary.is-block')
            ]);
        }

        await page.goto('https://profe.social/posts/new', { waitUntil: 'networkidle' });

        await page.waitForSelector('#post_title');
        await page.fill('#post_title', CONFIG.titulo);
        await page.fill('#post_coin_price', CONFIG.precio);

        await page.evaluate((html) => {
            const editor = document.querySelector('trix-editor');
            if (editor && editor.editor) {
                editor.editor.loadHTML('');
                editor.editor.insertHTML(html);
            }
        }, CONFIG.descripcion);

        await page.selectOption('#post_resource_type', 'lesson');
        await page.fill('#post_min_age', '14');
        await page.fill('#post_max_age', '16');

        const tagInputSelector = 'input[placeholder*="Etiquetas"]';
        for (const tag of CONFIG.tags) {
            await page.fill(tagInputSelector, tag);
            await page.press(tagInputSelector, 'Enter');
            await page.waitForTimeout(500);
        }

        // Determinar extensión real
        let finalPath = CONFIG.archivoBase + '.docx';
        if (!fs.existsSync(finalPath)) {
            finalPath = CONFIG.archivoBase + '.doc';
        }

        console.log(`   📁 Subiendo: ${path.basename(finalPath)}`);
        const fileInput = await page.$('input[type="file"]');
        await fileInput.setInputFiles(finalPath);
        await page.waitForTimeout(6000); // Espera generosa para la subida

        await page.evaluate(() => {
            document.querySelectorAll('input[type="checkbox"]').forEach(cb => {
                if (!cb.checked) cb.click();
            });
        });

        console.log('🚀 ¡PUBLICANDO CON CLICK ROBUSTO!');

        // Probamos una secuencia de clicks directos de Playwright (mejor que evaluate para eventos)
        const submitSelectors = [
            'input[type="submit"][name="commit"]',
            'button[type="submit"]',
            '.is-primary.is-large',
            'input[value*="Publicar"]'
        ];

        let clicked = false;
        for (const selector of submitSelectors) {
            try {
                const btn = await page.$(selector);
                if (btn && await btn.isVisible()) {
                    await btn.click({ force: true });
                    clicked = true;
                    console.log(`   ✅ Click realizado con selector: ${selector}`);
                    break;
                }
            } catch (e) { }
        }

        if (!clicked) {
            console.log('   ⚠️ Selectores fallaron, intentando Enter...');
            await page.keyboard.press('Enter');
        }

        // Esperamos un poco y verificamos URL
        await page.waitForTimeout(5000);
        console.log('🏁 URL Final reconocida:', page.url());

        if (page.url().includes('/posts/') && !page.url().includes('/new')) {
            console.log('✅ ÉXITO TOTAL: Publicación confirmada.');
        } else {
            console.log('⚠️ Revisa si el botón requiere un scroll previo o si hay errores en pantalla.');
            await page.screenshot({ path: 'marzo_final_check.png' });
        }

    } catch (err) {
        console.error('❌ ERROR CRÍTICO:', err.message);
        await page.screenshot({ path: 'marzo_error_fatal.png' });
    } finally {
        await browser.close();
    }
})();
