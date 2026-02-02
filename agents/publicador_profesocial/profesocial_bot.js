require('dotenv').config();
const { chromium } = require('playwright');
const path = require('path');

// Obtener credenciales
const EMAIL = process.env.PROFESOCIAL_EMAIL;
const PASSWORD = process.env.PROFESOCIAL_PASSWORD;

(async () => {
    console.log('🔴 LENIN: Iniciando Secuencia de Login...');

    // Validación básica de credenciales
    if (!EMAIL || !PASSWORD) {
        console.error('❌ ERROR CRÍTICO: Faltan credenciales en .env');
        process.exit(1);
    }

    const browser = await chromium.launch({
        headless: false,
        slowMo: 100
    });

    // Viewport estándar HD
    const context = await browser.newContext({ viewport: { width: 1280, height: 720 } });
    const page = await context.newPage();

    try {
        // --- FASE 1: LOGIN ---
        console.log('🌍 Navegando a Login...');
        await page.goto('https://profe.social/users/sign_in', { waitUntil: 'networkidle' });

        console.log(`✍️ Ingresando usuario: ${EMAIL}`);
        await page.fill('#user_email', EMAIL);
        await page.fill('#user_password', PASSWORD);

        console.log('👆 Click en "Iniciar sesión"...');
        await Promise.all([
            page.waitForNavigation({ waitUntil: 'networkidle' }),
            page.click('button.is-primary.is-block')
        ]);

        console.log('✅ Login enviado. Verificando acceso...');
        await Promise.race([
            page.waitForSelector('.navbar-item.has-dropdown', { timeout: 10000 }),
            page.waitForURL('**/dashboard', { timeout: 10000 }),
            page.waitForURL('**/posts', { timeout: 10000 }),
            page.waitForSelector('a[href="/users/sign_out"]', { timeout: 10000 })
        ]);

        console.log('🚀 Acceso confirmado. Título:', await page.title());

        // --- FASE 2: PUBLICACIÓN ---
        console.log('📝 Navegando a "Nueva Publicación"...');
        await page.goto('https://profe.social/posts/new', { waitUntil: 'networkidle' });

        console.log('✍️ Llenando metadatos del recurso...');

        // 1. TÍTULO
        await page.fill('#post_title', 'Guía DUA: Análisis de Noticias y Fake News 📰 | 1° Medio Unidad 4');

        // 2. PRECIO (40 ProfeCoins)
        await page.fill('#post_coin_price', '40');

        // 3. DESCRIPCIÓN (Inyección en Trix)
        const descriptionHTML = `
            <strong>🌟 Guía Revolucionaria con Diseño Universal (DUA)</strong><br><br>
            ¿Cansado de guías estáticas? Esta herramienta conecta con la realidad digital de tus estudiantes.<br><br>
            <strong>Incluye:</strong><ul>
            <li>✅ <strong>Andamiaje DUA:</strong> Mapa conceptual inicial.</li>
            <li>✅ <strong>Glosario Integrado:</strong> Apoyo al vocabulario en contexto.</li>
            <li>✅ <strong>Desafío Fake News:</strong> Actividad práctica para redes sociales.</li>
            </ul><br>
            <em>Optimizado para Unidad 4 de 1° Medio - Formación Ciudadana.</em>
        `;
        await page.evaluate((html) => {
            const editor = document.querySelector('trix-editor');
            if (editor && editor.editor) {
                editor.editor.loadHTML(html);
            }
        }, descriptionHTML);

        // 4. EDAD (14 - 16)
        await page.fill('#post_min_age', '14');
        await page.fill('#post_max_age', '16');

        // 5. TIPO (Lección/Guía)
        await page.selectOption('#post_resource_type', 'lesson');

        // 6. ETIQUETAS
        const tags = ['Lenguaje', 'Primero Medio', 'Fake News', 'DUA', 'Ciudadanía'];
        console.log('🏷️ Insertando etiquetas...');
        // Selector corregido: Usamos el placeholder para encontrar el input visible
        const tagInputSelector = 'input[placeholder*="Etiquetas"]';

        for (const tag of tags) {
            await page.fill(tagInputSelector, tag);
            await page.press(tagInputSelector, 'Enter');
            await page.waitForTimeout(300);
        }

        console.log('✅ Formulario completado automáticamente.');

        const screenshotPath = path.join(__dirname, 'profesocial_form_filled.png');
        await page.screenshot({ path: screenshotPath, fullPage: true });
        console.log(`📸 Evidencia guardada en: ${screenshotPath}`);

        console.log('🔴 LENIN: Deteniendo operación. ESPERANDO SUBIDA MANUAL DE ARCHIVO...');
        console.log('⚠️  IMPORTANTE: El navegador permanecerá abierto 2 minutos para que subas el PDF.');

        await page.waitForTimeout(120000); // 2 minutos de espera

    } catch (error) {
        console.error('❌ Error operacional:', error);
        await page.screenshot({ path: path.join(__dirname, 'op_error.png') });
    } finally {
        await browser.close();
    }
})();
