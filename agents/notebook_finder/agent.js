require('dotenv').config();
const { chromium } = require('playwright');
const nodemailer = require('nodemailer');

const LAPTOP_QUERY = 'Lenovo Legion 5i';

async function searchSoloTodo() {
    console.log(`Buscando "${LAPTOP_QUERY}" en SoloTodo...`);
    const browser = await chromium.launch({ headless: true });
    const page = await browser.newPage();
    try {
        await page.goto(`https://www.solotodo.cl/search?search=${encodeURIComponent(LAPTOP_QUERY)}`, { waitUntil: 'domcontentloaded' });
        await page.waitForTimeout(5000);

        const products = await page.evaluate(() => {
            // Material UI based selectors identified via browser inspection
            const items = Array.from(document.querySelectorAll('.MuiCardActionArea-root'));
            return items.map(item => {
                const name = item.querySelector('.MuiTypography-h5')?.innerText.trim();
                const price = item.querySelector('.MuiTypography-h2')?.innerText.trim();
                const link = item.querySelector('a[href^="/products/"]')?.href;
                return { name, price, url: link, store: 'SoloTodo' };
            }).filter(p => p.name && p.price);
        });
        await browser.close();
        return products;
    } catch (e) {
        console.error('Error searching SoloTodo:', e);
        await browser.close();
        return [];
    }
}

async function sendEmail(results) {
    if (results.length === 0) {
        console.log('No results found, skipping email.');
        return;
    }

    const transporter = nodemailer.createTransport({
        host: process.env.SMTP_HOST,
        port: process.env.SMTP_PORT,
        secure: process.env.SMTP_SECURE === 'true',
        auth: {
            user: process.env.SMTP_USER,
            pass: process.env.SMTP_PASS,
        },
    });

    const htmlContent = `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: auto; border: 1px solid #ddd; padding: 20px;">
            <h2 style="color: #d32f2f; border-bottom: 2px solid #d32f2f; padding-bottom: 10px;">Solicitud de Cotización Automatizada</h2>
            <p><strong>Producto:</strong> ${LAPTOP_QUERY}</p>
            <p>Se han identificado las siguientes ofertas disponibles en el mercado a través de SoloTodo:</p>
            
            <table style="width: 100%; border-collapse: collapse; margin-top: 10px;">
                <thead>
                    <tr style="background-color: #f5f5f5;">
                        <th style="border: 1px solid #ddd; padding: 8px; text-align: left;">Producto</th>
                        <th style="border: 1px solid #ddd; padding: 8px; text-align: left;">Precio</th>
                        <th style="border: 1px solid #ddd; padding: 8px; text-align: left;">Enlace</th>
                    </tr>
                </thead>
                <tbody>
                    ${results.slice(0, 10).map(r => `
                        <tr>
                            <td style="border: 1px solid #ddd; padding: 8px;">${r.name}</td>
                            <td style="border: 1px solid #ddd; padding: 8px; color: #2e7d32; font-weight: bold;">${r.price}</td>
                            <td style="border: 1px solid #ddd; padding: 8px;"><a href="${r.url}" style="color: #1976d2; text-decoration: none;">Ver tienda</a></td>
                        </tr>
                    `).join('')}
                </tbody>
            </table>
            
            <p style="margin-top: 20px; font-size: 0.9em; color: #666;">
                Este correo fue generado automáticamente por tu Agente Gamer. <br>
                <em>Nota: Los precios y disponibilidad están sujetos a cambios por parte de las tiendas.</em>
            </p>
        </div>
    `;

    try {
        await transporter.sendMail({
            from: `"Agente Gamer" <${process.env.SMTP_USER}>`,
            to: process.env.TARGET_EMAIL,
            subject: `Cotización: ${LAPTOP_QUERY}`,
            html: htmlContent,
        });
        console.log('Email enviado con éxito.');
    } catch (e) {
        console.error('Error enviando email:', e);
    }
}

async function main() {
    console.log(`Iniciando búsqueda: ${LAPTOP_QUERY}...`);
    const results = await searchSoloTodo();

    console.log('Resultados encontrados:', results.length);

    if (results.length > 0) {
        console.log('\n--- RESUMEN DE PRECIOS ---');
        results.slice(0, 5).forEach(r => console.log(`${r.name}: ${r.price}`));
        console.log('--------------------------\n');

        if (process.env.SMTP_USER && process.env.SMTP_USER !== 'profepablo2010@gmail.com' || process.env.SMTP_PASS && process.env.SMTP_PASS !== 'tu-contraseña-de-aplicacion') {
            await sendEmail(results);
        } else if (process.env.SMTP_USER === 'profepablo2010@gmail.com') {
            // If user is the target, check if password is set
            if (process.env.SMTP_PASS && process.env.SMTP_PASS !== 'tu-contraseña-de-aplicacion') {
                await sendEmail(results);
            } else {
                console.log('SMTP_PASS no configurado. No se envió correo.');
            }
        } else {
            console.log('SMTP_USER no configurado. No se envió correo.');
        }
    } else {
        console.log('No se encontraron resultados en SoloTodo. Intenta con una búsqueda más simple manual en https://www.solotodo.cl');
    }
}

main();
