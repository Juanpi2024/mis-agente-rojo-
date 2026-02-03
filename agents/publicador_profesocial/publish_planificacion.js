require('dotenv').config();
const { chromium } = require('playwright');
const path = require('path');

// Obtener credenciales
const EMAIL = process.env.PROFESOCIAL_EMAIL;
const PASSWORD = process.env.PROFESOCIAL_PASSWORD;

// CONFIGURACIÓN DE PUBLICACIÓN
const CONFIG = {
    titulo: 'Planificación Clase a Clase: Octubre | Lenguaje y Comunicación 1° Medio',
    precio: '6', // 6 coins facilitados por el usuario
    archivo: 'D:\\Users\\Pablo\\Desktop\\ESCRITORIO TRABAJO 2023\\mi aula editado\\ENSEÑANZA MEDIA\\PRIMERO MEDIO\\LENGUAJE\\LENG. SIN DUA\\unidad 4 LIS\\octubre\\LIMPIO\\PLANIFICACION_OCTUBRE_LIMPIA.docx',
    minAge: '14',
    maxAge: '16',
    resourceType: 'lesson', // Corregido: 'lesson' es el valor para Clase/Planificación
    tags: ['Lenguaje', 'Primero Medio', 'Planificación', 'Octubre', 'Unidad 4'],
    descripcion: `
        <strong>📅 Planificación Detallada Clase a Clase - Octubre</strong><br><br>
        Recurso pedagógico completo para la asignatura de <strong>Lenguaje y Comunicación</strong> en 1° Medio.<br><br>
        <strong>Características:</strong><ul>
        <li>✅ Objetivos de aprendizaje (OA) detallados.</li>
        <li>✅ Actividades secuenciadas para todo el mes.</li>
        <li>✅ Estrategias de evaluación sugeridas.</li>
        <li>✅ Optimizado para enseñanza media.</li>
        </ul><br>
        <em>Ideal para docentes que buscan una estructura clara y profesional para sus clases de Octubre.</em>
    `
};

(async () => {
    console.log('🔴 LENIN: Iniciando Secuencia de Publicación "Planificación Octubre" v2.2...');

    if (!EMAIL || !PASSWORD) {
        console.error('❌ ERROR: Faltan credenciales en .env');
        process.exit(1);
    }

    const browser = await chromium.launch({
        headless: false,
        slowMo: 150
    });

    const context = await browser.newContext({ viewport: { width: 1280, height: 800 } });
    const page = await context.newPage();

    try {
        // LOGIN
        console.log('🌍 Logueando en ProfeSocial...');
        await page.goto('https://profe.social/users/sign_in', { waitUntil: 'networkidle' });

        // Verificar si ya estamos logueados
        if (await page.isVisible('#user_email')) {
            await page.fill('#user_email', EMAIL);
            await page.fill('#user_password', PASSWORD);
            await Promise.all([
                page.waitForNavigation({ waitUntil: 'networkidle' }),
                page.click('button.is-primary.is-block')
            ]);
        }

        // NAVEGAR A NUEVA PUBLICACIÓN
        console.log('📝 Accediendo al formulario de nueva publicación...');
        await page.goto('https://profe.social/posts/new', { waitUntil: 'networkidle' });

        // LLENAR FORMULARIO CON ESPERAS EXPLÍCITAS
        console.log('✍️ Llenando Título...');
        await page.waitForSelector('#post_title');
        await page.fill('#post_title', CONFIG.titulo);

        console.log('✍️ Estableciendo Precio (6 coins)...');
        await page.fill('#post_coin_price', CONFIG.precio);

        // DESCRIPCIÓN (Trix Editor)
        console.log('✍️ Llenando Descripción en Trix...');
        await page.waitForSelector('trix-editor');
        await page.evaluate((html) => {
            const editor = document.querySelector('trix-editor');
            if (editor && editor.editor) {
                editor.editor.loadHTML('');
                editor.editor.insertHTML(html);
            }
        }, CONFIG.descripcion);

        console.log('🎯 Seleccionando tipo de recurso: Clase (' + CONFIG.resourceType + ')...');
        await page.selectOption('#post_resource_type', CONFIG.resourceType);

        await page.fill('#post_min_age', CONFIG.minAge);
        await page.fill('#post_max_age', CONFIG.maxAge);

        // ETIQUETAS
        const tagInputSelector = 'input[placeholder*="Etiquetas"]';
        console.log('🏷️ Insertando etiquetas...');
        for (const tag of CONFIG.tags) {
            await page.click(tagInputSelector);
            await page.fill(tagInputSelector, tag);
            await page.press(tagInputSelector, 'Enter');
            await page.waitForTimeout(600);
        }

        // ARCHIVO (Crucial)
        console.log('📁 Cargando archivo:', path.basename(CONFIG.archivo));
        const fileInput = await page.$('input[type="file"]');
        if (fileInput) {
            await fileInput.setInputFiles(CONFIG.archivo);
            console.log('   ⏳ Esperando procesamiento de archivo...');
            await page.waitForTimeout(5000); // Dar tiempo generoso para subida
        }

        // MARCAR CASILLAS OBLIGATORIAS
        console.log('☑️ Marcando declaraciones autoría...');
        await page.evaluate(() => {
            document.querySelectorAll('input[type="checkbox"]').forEach(cb => {
                if (!cb.checked) cb.click();
            });
        });

        // REVISIÓN FINAL
        console.log('⏳ Todo listo. Esperando 5 segundos para seguridad...');
        await page.waitForTimeout(5000);

        // CLICK EN EL BOTÓN DE ENVÍO REAL (El fucsia/rosado al fondo)
        console.log('🚀 ¡ENVIANDO PUBLICACIÓN FINAL!');
        const submitButton = await page.$('input[type="submit"][name="commit"], button[name="commit"], .is-primary.is-large');
        if (submitButton) {
            await submitButton.click();
            console.log('✅ Click en Publicar realizado.');
        } else {
            console.log('⚠️ No se encontró el botón de enviar. Intentando click por selector genérico...');
            await page.click('input[value*="Publicar"], button:has-text("Publicar")');
        }

        console.log('🎉 Esperando confirmación de redirección...');
        await page.waitForNavigation({ waitUntil: 'networkidle', timeout: 30000 }).catch(() => console.log('⚠️ Navegación demorada.'));

        console.log('🏁 URL Actual:', page.url());

        await page.waitForTimeout(20000); // Mantener abierto para que el usuario vea el éxito

    } catch (err) {
        console.error('❌ ERROR durante la publicación:', err.message);
        await page.screenshot({ path: 'publication_error_v2.png' });
    } finally {
        await browser.close();
    }
})();
