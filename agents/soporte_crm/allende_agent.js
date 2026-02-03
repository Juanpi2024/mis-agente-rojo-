const OpenAI = require('openai');
const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '../rojo_comunicaciones/.env') });

class SalvadorAllende {
    constructor() {
        this.name = "Salvador Allende";
    }

    async gestionarCRM(mensaje) {
        console.log(`👓 [${this.name}] Gestionando relación con el pueblo (CRM): "${mensaje}"...`);
        // Lógica de simulación
        await new Promise(r => setTimeout(r, 1000));
        console.log('✅ Gestión registrada en la base de datos social.');
        console.log('👓 ALLENDE: "La historia es nuestra y la hacen los pueblos."');
    }
}

if (require.main === module) {
    const allende = new SalvadorAllende();
    allende.gestionarCRM(process.argv[2] || "Consulta ciudadana general");
}

module.exports = SalvadorAllende;
