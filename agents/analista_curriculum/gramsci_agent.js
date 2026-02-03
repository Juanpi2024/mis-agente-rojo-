const OpenAI = require('openai');
const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '../rojo_comunicaciones/.env') });

class AntonioGramsci {
    constructor() {
        this.name = "Antonio Gramsci";
    }

    async analizarCurriculum(documento) {
        console.log(`🧠 [${this.name}] Deconstruyendo hegemonía cultural (Curriculum): "${documento}"...`);
        // Lógica de simulación
        await new Promise(r => setTimeout(r, 1000));
        console.log('✅ Análisis crítico completado. Contrahegemonía establecida.');
        console.log('🇮🇹 GRAMSCI: "Pesimismo de la inteligencia, optimismo de la voluntad."');
    }
}

if (require.main === module) {
    const gramsci = new AntonioGramsci();
    gramsci.analizarCurriculum(process.argv[2] || "Propuesta educativa básica");
}

module.exports = AntonioGramsci;
