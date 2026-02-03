require('dotenv').config();
const { chromium } = require('playwright');
const path = require('path');
const fs = require('fs');

const EMAIL = process.env.PROFESOCIAL_EMAIL;
const PASSWORD = process.env.PROFESOCIAL_PASSWORD;

const CONFIG = {
    titulo: 'Planificación Clase a Clase: Abril | Lenguaje y Comunicación 1° Medio',
    precio: '6',
    archivoBase: 'D:\\Users\\Pablo\\Desktop\\ESCRITORIO TRABAJO 2023\\mi aula editado\\ENSEÑANZA MEDIA\\PRIMERO MEDIO\\LENGUAJE\\LENG. SIN DUA\\unidad 1 LIS\\abril\\PLANIFICACION_CLASE_A_CLASE__ABRIL_Y_1RA_SEMANA_MAYO',
    tags: ['Lenguaje', 'Primero Medio', 'Planificación', 'Abril', 'Unidad 1', 'DUA'],
    descripcion: `
        <strong>📅 Planificación Detallada Clase a Clase - Abril</strong><br><br>
        Continuidad de la Unidad 1 para la asignatura de <strong>Lenguaje y Comunicación</strong> en 1° Medio.<br><br>
        <strong>Características:</strong><ul>
        <li>✅ Objetivos de aprendizaje (OA) priorizados para el mes de abril.</li>
        <li>✅ Actividades centradas en comprensión lectora y análisis literario.</li>
        <li>✅ Propuestas de evaluación de proceso.</li>
        <li>✅ Formato optimizado para facilitar la labor docente (DUA).</li>
        </ul><br>
        <em>Material pedagógico estructurado y alineado con el currículo nacional chileno.</em>
    `
};

(async () => {
    console.log('🔴 LENIN: Lanzando publicación de Abril (Modo Ejemplar)...');

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

        console.log('📝 Accediendo al formulario...');
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

        // Determinar extensión real (.doc o .docx)
        let finalPath = CONFIG.archivoBase + '.docx';
        if (!fs.existsSync(finalPath)) {
            finalPath = CONFIG.archivoBase + '.doc';
        }

        if (!fs.existsSync(finalPath)) {
            throw new Error(`Archivo no encontrado: ${finalPath}`);
        }

        console.log(`   📁 Subiendo: ${path.basename(finalPath)}`);
        const fileInput = await page.$('input[type="file"]');
        await fileInput.setInputFiles(finalPath);
        await page.waitForTimeout(7000); // Tiempo generoso de subida

        await page.evaluate(() => {
            document.querySelectorAll('input[type="checkbox"]').forEach(cb => {
                if (!cb.checked) cb.click();
            });
        });

        console.log('🚀 ¡ENVIANDO PUBLICACIÓN FINAL!');

        // Ejecución de click final con secuencia robusta
        const clicked = await page.evaluate(() => {
            const btn = document.querySelector('input[type="submit"][name="commit"], button[name="commit"], .is-primary.is-large, button.is-primary.is-fullwidth');
            if (btn) { btn.click(); return true; }
            return false;
        });

        if (!clicked) {
            console.log('   ⚠️ Click JS falló, intentando Playwright click directo...');
            try {
                await page.click('button.is-primary.is-fullwidth', { timeout: 5000 });
            } catch (e) {
                await page.keyboard.press('Enter');
            }
        }

        await page.waitForNavigation({ waitUntil: 'networkidle', timeout: 30000 }).catch(() => console.log('   ⚠️ Navegación lenta tras publicar.'));
        console.log('🏁 URL Final:', page.url());

        if (page.url().includes('/posts/') && !page.url().includes('/new')) {
            console.log('✅ ÉXITO: Publicación de Abril confirmada.');
        } else {
            console.log('⚠️ Revisa manualmente, la URL no cambió como se esperaba.');
            await page.screenshot({ path: 'abril_check.png' });
        }

        await page.waitForTimeout(5000);

    } catch (err) {
        console.error('❌ ERROR:', err.message);
        await page.screenshot({ path: 'abril_error.png' });
    } finally {
        await browser.close();
    }
})();
