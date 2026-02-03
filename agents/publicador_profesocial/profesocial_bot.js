const LeninRedactor = require('./lenin_redactor');
const { chromium } = require('playwright');
const path = require('path');
const fs = require('fs');
require('dotenv').config(); // Buscar en el directorio actual del bot
require('dotenv').config({ path: path.join(__dirname, '../rojo_comunicaciones/.env') }); // Backup para otras keys como OpenAI

// Obtener credenciales
const EMAIL = process.env.PROFESOCIAL_EMAIL;
const PASSWORD = process.env.PROFESOCIAL_PASSWORD;

(async () => {
    const tema = process.argv[2] || "Guía DUA: Análisis de Noticias";
    const filePath = process.argv[3];
    const fixedPrice = process.argv[4];

    console.log(`🔴 LENIN: Iniciando secuencia para tema: ${tema}`);
    if (filePath) console.log(`📁 Archivo a cargar: ${filePath}`);

    // Validación de credenciales
    if (!EMAIL || !PASSWORD) {
        console.error('❌ ERROR CRÍTICO: Faltan credenciales PROFESOCIAL_EMAIL o PROFESOCIAL_PASSWORD');
        process.exit(1);
    }

    // FASE 0: Generar metadatos persuasivos con GPT-4
    const redactor = new LeninRedactor();
    const metadatos = await redactor.generarMetadatos(tema);

    if (!metadatos) {
        console.error('❌ ERROR: No se pudieron generar los metadatos.');
        process.exit(1);
    }

    // Usar precio fijo si se proporciona, sino el sugerido por la IA
    const precioFinal = fixedPrice || metadatos.precio_sugerido || 0;

    const browser = await chromium.launch({
        headless: false,
        slowMo: 100
    });

    const context = await browser.newContext({ viewport: { width: 1280, height: 800 } });
    const page = await context.newPage();

    try {
        // --- FASE 1: LOGIN ---
        console.log('🌍 Navegando a Login...');
        await page.goto('https://profe.social/users/sign_in', { waitUntil: 'networkidle' });

        // Verificar si ya estamos logueados o si necesitamos ingresar datos
        if (await page.isVisible('#user_email')) {
            console.log(`✍️ Ingresando usuario: ${EMAIL}`);
            await page.fill('#user_email', EMAIL);
            await page.fill('#user_password', PASSWORD);

            console.log('👆 Click en "Iniciar sesión"...');
            await Promise.all([
                page.waitForNavigation({ waitUntil: 'networkidle' }),
                page.click('button.is-primary.is-block')
            ]);
            console.log('✅ Login exitoso.');
        } else {
            console.log('ℹ️ Ya parece haber una sesión iniciada.');
        }

        // --- FASE 2: LLENAR FORMULARIO ---
        console.log('📝 Navegando a "Nueva Publicación"...');
        await page.goto('https://profe.social/posts/new', { waitUntil: 'networkidle' });

        console.log('✍️ Llenando metadatos...');

        // 1. TÍTULO
        await page.fill('#post_title', metadatos.titulo);
        console.log(`   ✓ Título: ${metadatos.titulo}`);

        // 2. PRECIO
        await page.fill('#post_coin_price', precioFinal.toString());
        console.log(`   ✓ Precio: ${precioFinal} coins`);

        // 3. DESCRIPCIÓN 
        await page.evaluate((html) => {
            const editor = document.querySelector('trix-editor');
            if (editor && editor.editor) {
                editor.editor.loadHTML(html);
            }
        }, metadatos.descripcionHTML);
        console.log('   ✓ Descripción persuasiva inyectada');

        // 4. EDAD
        await page.fill('#post_min_age', '12');
        await page.fill('#post_max_age', '18');

        // 5. TIPO
        await page.selectOption('#post_resource_type', 'lesson');

        // 6. ETIQUETAS
        console.log('🏷️ Insertando etiquetas IA...');
        const tagInputSelector = 'input[placeholder*="Etiquetas"]';
        for (const tag of metadatos.etiquetas) {
            await page.fill(tagInputSelector, tag);
            await page.press(tagInputSelector, 'Enter');
            await page.waitForTimeout(200);
        }

        // 7. CARGA DE ARCHIVO
        if (filePath && fs.existsSync(filePath)) {
            console.log('📁 Cargando archivo principal...');
            await page.setInputFiles('input[name="post[file]"]', filePath);
            console.log('   ✓ Archivo cargado correctamente');
        } else if (filePath) {
            console.error(`⚠️ Archivo no encontrado en: ${filePath}`);
        }

        // 8. DECLARACIÓN DE AUTORÍA
        console.log('⚖️ Aceptando términos de autoría...');
        await page.check('input#post_declared_ownership');

        // 9. PUBLICAR
        console.log('🚀 PUBLICANDO RECURSO...');
        await Promise.all([
            page.waitForNavigation({ waitUntil: 'networkidle' }),
            page.click('button[data-form-target="publishButton"]')
        ]);

        console.log('✅ PUBLICACIÓN EXITOSA.');
        console.log('✊ LENIN: "La organización lo es todo. ¡Avanzamos!"');

        // Screenshot para evidencia
        const screenshotPath = path.join(__dirname, `evidencia_${Date.now()}.png`);
        await page.screenshot({ path: screenshotPath, fullPage: true });
        console.log(`📸 Evidencia generada en: ${screenshotPath}`);

    } catch (error) {
        console.error('❌ ERROR DURANTE LA SECUENCIA:', error.message);
        try {
            const errorPath = path.join(__dirname, 'error_lenin.png');
            await page.screenshot({ path: errorPath });
        } catch (e) { }
    } finally {
        await browser.close();
        process.exit(0);
    }
})();
