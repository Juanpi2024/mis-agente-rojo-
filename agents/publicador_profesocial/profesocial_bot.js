require('dotenv').config();
const { chromium } = require('playwright');
const path = require('path');

// Obtener credenciales
const EMAIL = process.env.PROFESOCIAL_EMAIL;
const PASSWORD = process.env.PROFESOCIAL_PASSWORD;

(async () => {
    console.log('🔴 LENIN: Iniciando Secuencia de Publicación Automatizada...');

    // Validación básica de credenciales
    if (!EMAIL || !PASSWORD) {
        console.error('❌ ERROR CRÍTICO: Faltan credenciales en .env');
        process.exit(1);
    }

    const browser = await chromium.launch({
        headless: false,
        slowMo: 150 // Un poco más lento para que se vea bien
    });

    // Viewport estándar HD
    const context = await browser.newContext({ viewport: { width: 1280, height: 800 } });
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

        // --- FASE 2: LLENAR FORMULARIO ---
        console.log('📝 Navegando a "Nueva Publicación"...');
        await page.goto('https://profe.social/posts/new', { waitUntil: 'networkidle' });

        console.log('✍️ Llenando metadatos del recurso...');

        // 1. TÍTULO
        await page.fill('#post_title', 'Guía DUA: Análisis de Noticias y Fake News 📰 | 1° Medio Unidad 4');
        console.log('   ✓ Título establecido');

        // 2. PRECIO (0 ProfeCoins - GRATIS)
        await page.fill('#post_coin_price', '0');
        console.log('   ✓ Precio: 0 coins (GRATIS)');

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
        console.log('   ✓ Descripción establecida');

        // 4. EDAD (14 - 16)
        await page.fill('#post_min_age', '14');
        await page.fill('#post_max_age', '16');
        console.log('   ✓ Edad: 14-16 años');

        // 5. TIPO (Lección/Guía)
        await page.selectOption('#post_resource_type', 'lesson');
        console.log('   ✓ Tipo: Lección');

        // 6. ETIQUETAS
        const tags = ['Lenguaje', 'Primero Medio', 'Fake News', 'DUA', 'Ciudadanía'];
        console.log('🏷️ Insertando etiquetas...');
        const tagInputSelector = 'input[placeholder*="Etiquetas"]';

        for (const tag of tags) {
            await page.fill(tagInputSelector, tag);
            await page.press(tagInputSelector, 'Enter');
            await page.waitForTimeout(300);
        }
        console.log('   ✓ Etiquetas insertadas:', tags.join(', '));

        // --- FASE 3: CARGA DE ARCHIVO ---
        console.log('📁 Iniciando carga de archivo...');
        const archivoPath = path.resolve(__dirname, '../../depositos_materiales/ENSEÑANZA MEDIA/PRIMERO MEDIO/LENGUAJE/GUIA_LIMPIA_DUA.docx');

        const fileInput = await page.$('input[type="file"]');
        if (fileInput) {
            await fileInput.setInputFiles(archivoPath);
            console.log('   ✓ Archivo cargado:', path.basename(archivoPath));
        } else {
            console.log('   ⚠️ No se encontró input de archivo');
        }

        await page.waitForTimeout(2000);

        // --- FASE 4: MARCAR CASILLAS ---
        console.log('☑️ Marcando casillas obligatorias...');

        // Buscar y marcar checkbox de autoría/propiedad
        const checkboxSelectors = [
            'input[type="checkbox"][name*="ownership"]',
            'input[type="checkbox"][name*="author"]',
            'input[type="checkbox"][name*="original"]',
            'input[type="checkbox"][name*="terms"]',
            'input[type="checkbox"][name*="accept"]',
            '.checkbox input[type="checkbox"]',
            'input[type="checkbox"]'
        ];

        for (const selector of checkboxSelectors) {
            const checkboxes = await page.$$(selector);
            for (const checkbox of checkboxes) {
                const isChecked = await checkbox.isChecked();
                if (!isChecked) {
                    await checkbox.check();
                    console.log('   ✓ Casilla marcada');
                }
            }
        }

        // Screenshot antes de publicar
        const screenshotPath = path.join(__dirname, 'profesocial_form_filled.png');
        await page.screenshot({ path: screenshotPath, fullPage: true });
        console.log(`📸 Evidencia PRE-PUBLICACIÓN guardada`);

        // --- FASE 5: PUBLICAR ---
        console.log('🚀 Buscando botón de publicar...');

        // Intentar diferentes selectores para el botón de publicar
        const publishSelectors = [
            'button[type="submit"]',
            'input[type="submit"]',
            'button:has-text("Publicar")',
            'button:has-text("Crear")',
            'button:has-text("Enviar")',
            'button.is-primary',
            '.button.is-primary',
            'form button[type="submit"]'
        ];

        let published = false;
        for (const selector of publishSelectors) {
            try {
                const btn = await page.$(selector);
                if (btn) {
                    const btnText = await btn.textContent();
                    console.log(`   👆 Click en botón: "${btnText?.trim()}"`);

                    await Promise.all([
                        page.waitForNavigation({ waitUntil: 'networkidle', timeout: 30000 }).catch(() => { }),
                        btn.click()
                    ]);

                    published = true;
                    break;
                }
            } catch (e) {
                // Continuar con siguiente selector
            }
        }

        if (published) {
            console.log('✅ ¡PUBLICACIÓN ENVIADA!');
            await page.waitForTimeout(3000);

            // Screenshot de confirmación
            const proofPath = path.join(__dirname, 'profesocial_published.png');
            await page.screenshot({ path: proofPath, fullPage: true });
            console.log(`📸 Evidencia POST-PUBLICACIÓN guardada`);
            console.log('🔴 LENIN: Misión completada. URL actual:', page.url());
        } else {
            console.log('⚠️ No se encontró botón de publicar. Revisa manualmente.');
        }

        // Mantener navegador abierto 60 segundos para revisión
        console.log('⏳ Navegador abierto 60 segundos para revisión...');
        await page.waitForTimeout(60000);

    } catch (error) {
        console.error('❌ Error operacional:', error.message);
        await page.screenshot({ path: path.join(__dirname, 'op_error.png') });
    } finally {
        console.log('🔴 LENIN: Cerrando navegador...');
        await browser.close();
    }
})();
