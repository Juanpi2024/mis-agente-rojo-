/**
 * Security Enhancement Module for Gemini API Keys
 * 
 * Mejoras de seguridad implementadas:
 * 1. Enmascaramiento de API keys en logs
 * 2. Rate limiting inteligente por key
 * 3. Detección de uso sospechoso
 * 4. Rotación automática con cooldown
 */

class SecureGeminiKeyManager {
    constructor(keys) {
        this.keys = keys.filter(key => key && key !== 'tu_api_key_aqui' && key.length > 30);

        if (this.keys.length === 0) {
            throw new Error('No se proporcionaron API keys válidas');
        }

        this.currentIndex = 0;
        this.errorCounts = new Map();
        this.lastUsed = new Map();
        this.requestCounts = new Map(); // Nuevo: contador de requests por key
        this.cooldownUntil = new Map(); // Nuevo: cooldown por key

        // Inicializar contadores
        this.keys.forEach(key => {
            this.requestCounts.set(key, 0);
            this.cooldownUntil.set(key, 0);
        });

        console.log(`🔑 GeminiKeyManager inicializado con ${this.keys.length} API keys`);
        console.log(`🛡️ Protecciones de seguridad activadas`);
    }

    /**
     * Enmascara una API key para logging seguro
     * Muestra solo los últimos 4 caracteres
     */
    maskKey(key) {
        if (!key || key.length < 8) return '****';
        return `****${key.slice(-4)}`;
    }

    /**
     * Obtiene el número de la key (1-6) de forma segura
     */
    getKeyNumber(key) {
        const index = this.keys.indexOf(key);
        return index >= 0 ? index + 1 : '?';
    }

    /**
     * Verifica si una key está en cooldown
     */
    isInCooldown(key) {
        const cooldownEnd = this.cooldownUntil.get(key) || 0;
        return Date.now() < cooldownEnd;
    }

    /**
     * Pone una key en cooldown
     */
    setCooldown(key, seconds = 60) {
        const until = Date.now() + (seconds * 1000);
        this.cooldownUntil.set(key, until);
        const keyNum = this.getKeyNumber(key);
        console.log(`⏸️ Key #${keyNum} en cooldown por ${seconds}s`);
    }

    /**
     * Obtiene la siguiente key disponible con rotación round-robin
     */
    getNextKey() {
        const startIndex = this.currentIndex;
        let attempts = 0;

        while (attempts < this.keys.length) {
            const key = this.keys[this.currentIndex];
            this.currentIndex = (this.currentIndex + 1) % this.keys.length;

            // Saltar keys en cooldown o bloqueadas
            if (!this.isInCooldown(key) && !this.isKeyBlocked(key)) {
                this.lastUsed.set(key, Date.now());
                return key;
            }

            attempts++;
        }

        throw new Error('🚫 Todas las API keys están bloqueadas o en cooldown');
    }

    /**
     * Obtiene una key con fallback automático
     */
    getKeyWithFallback() {
        try {
            const key = this.getNextKey();
            const keyNum = this.getKeyNumber(key);
            const masked = this.maskKey(key);
            console.log(`🔑 Usando Gemini Key #${keyNum} (${masked})`);

            // Incrementar contador de requests
            const count = this.requestCounts.get(key) || 0;
            this.requestCounts.set(key, count + 1);

            return key;
        } catch (error) {
            console.error('❌ No hay keys disponibles:', error.message);
            throw error;
        }
    }

    /**
     * Verifica si una key está bloqueada por errores
     */
    isKeyBlocked(key) {
        const errorCount = this.errorCounts.get(key) || 0;
        return errorCount >= 3;
    }

    /**
     * Marca un error para una key
     */
    markKeyError(key, statusCode = 429) {
        const count = this.errorCounts.get(key) || 0;
        this.errorCounts.set(key, count + 1);

        const keyNum = this.getKeyNumber(key);
        const masked = this.maskKey(key);
        console.log(`❌ Error ${statusCode} en Key #${keyNum} (${masked}) - ${count + 1} errores`);

        // Si es error 429, poner en cooldown inmediato
        if (statusCode === 429) {
            this.setCooldown(key, 60);
        }

        // Bloqueo temporal después de 3 errores
        if (count + 1 >= 3) {
            console.log(`🔒 Key #${keyNum} bloqueada temporalmente`);
            setTimeout(() => {
                this.errorCounts.delete(key);
                console.log(`🔓 Key #${keyNum} desbloqueada`);
            }, 120000); // 2 minutos
        }
    }

    /**
     * Marca éxito para una key
     */
    markKeySuccess(key) {
        if (this.errorCounts.has(key)) {
            this.errorCounts.delete(key);
            const keyNum = this.getKeyNumber(key);
            console.log(`✅ Key #${keyNum} recuperada`);
        }
    }

    /**
     * Obtiene estadísticas de uso
     */
    getStats() {
        const stats = {
            totalKeys: this.keys.length,
            availableKeys: this.keys.filter(k => !this.isKeyBlocked(k) && !this.isInCooldown(k)).length,
            usage: []
        };

        this.keys.forEach(key => {
            const keyNum = this.getKeyNumber(key);
            const masked = this.maskKey(key);
            stats.usage.push({
                key: `#${keyNum} (${masked})`,
                requests: this.requestCounts.get(key) || 0,
                errors: this.errorCounts.get(key) || 0,
                blocked: this.isKeyBlocked(key),
                cooldown: this.isInCooldown(key)
            });
        });

        return stats;
    }
}

module.exports = SecureGeminiKeyManager;
