const GladysMarin = require('./agent');

async function runDeepInvestigation() {
    const gladys = new GladysMarin();

    const detailedResults = [
        {
            source: "Fondo de Fortalecimiento de Organizaciones Patrimoniales (FFOP) 2026",
            snippet: "FECHAS: 23 de enero al 6 de marzo de 2026. LINK: [fondos.gob.cl](https://fondos.gob.cl). REQUISITOS: 2 años de vigencia legal. Ideal para proyectos de rescate de memoria e identidad en colegios EPJA."
        },
        {
            source: "Fondo Para Vivir Mejor 2026 (MDSF)",
            snippet: "FECHAS ESTIMADAS: Marzo-Abril 2026. LINK: [sociedadcivil.ministeriodesarrollosocial.gob.cl](https://sociedadcivil.ministeriodesarrollosocial.gob.cl). FOCO: Superación de pobreza y exclusión social. Clave para subvencionar programas de apoyo integral en CEIAs."
        },
        {
            source: "Fundación Mustakis - Fondos de Innovación Educativa",
            snippet: "ESTATUS: Convocatorias anuales (Incubación y Fortalecimiento). LINK: [fundacionmustakis.org](https://www.fundacionmustakis.org). FOCO: Solucionar desafíos educativos mediante creatividad y tecnología."
        },
        {
            source: "Fondo Descúbreme 2026 (Privado)",
            snippet: "FECHAS: 23 Septiembre 2025 al 28 Noviembre 2025 (para ejecución 2026). LINK: [descubreme.cl](https://www.descubreme.cl). FOCO: Inclusión educativa y laboral de personas con discapacidad cognitiva."
        },
        {
            source: "OEI Chile - Fondos Transformación Digital",
            snippet: "DISPONIBILIDAD: Programa-Presupuesto 2025-2026. LINK: [oei.int/oficinas/chile](https://oei.int/oficinas/chile). FOCO: Digitalización y fortalecimiento de prácticas educativas en jóvenes y adultos."
        },
        {
            source: "Fundación LarrainVial - Plataforma DaleProfe",
            snippet: "FOCO: Crowdfunding educativo para proyectos de aula. LINK: [daleprofe.cl](https://www.daleprofe.cl). Permite financiar materiales y salidas pedagógicas que el presupuesto regular no cubre."
        }
    ];

    console.log(`✊ [Gladys Marín] Consolidando reporte de alta profundidad (Público/Privado/Internacional)...`);

    gladys.exhaustiveSearch = async () => detailedResults;

    // Reporte en formato Presentación para Pablo
    const query = "FONDOS CONCURSABLES 2026 - PROPUESTA DE PRESENTACIÓN";
    const format = "presentation";
    const targetEmail = "profepablo2010@gmail.com";

    const success = await gladys.runMission(query, format, targetEmail);

    if (success) {
        console.log('✅ [Misión Pablo] Presentación de fondos entregada satisfactoriamente.');
    } else {
        console.error('❌ Error en el despacho a Pablo.');
    }
}

runDeepInvestigation();
