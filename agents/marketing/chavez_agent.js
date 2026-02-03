const OpenAI = require('openai');
const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '../rojo_comunicaciones/.env') });

class HugoChavez {
    constructor() {
        this.name = "Hugo Chávez";
    }

    async crearCampaña(producto) {
        console.log(`📣 [${this.name}] Diseñando estrategia comunicacional (Marketing): "${producto}"...`);
        // Lógica de simulación
        await new Promise(r => setTimeout(r, 1000));
        console.log('✅ Campaña desplegada en todas las plataformas del pueblo.');
        console.log('🇻🇪 CHÁVEZ: "¡Aquí hay olor a azufre! Pero el marketing es divino. Por ahora y para siempre."');
    }
}

if (require.main === module) {
    const chavez = new HugoChavez();
    chavez.crearCampaña(process.argv[2] || "Lanzamiento de producto social");
}

module.exports = HugoChavez;
