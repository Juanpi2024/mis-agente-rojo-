# Plan Futuro: WhatsApp Outbound (Contactos)

**Objetivo:** Permitir que la orquesta inicie conversaciones por WhatsApp con contactos guardados, no solo responder.

## Roles de la Orquesta

- **🧠 El Estratega (Salvador Allende - CRM):**
  - Responsable de "saber a quién escribir".
  - Capacidad de filtrar la base de datos (CSVs).
  - Genera el contenido del mensaje personalizado ("Hola Juan, vi que...").
- **🗣️ La Voz (Rojo - Comunicaciones):**
  - Recibe la orden de Allende.
  - Ejecuta el envío técnico a través de `whatsapp-web.js`.

## Propuesta Técnica

### 1. Nuevo Skill en `allende_agent.js`

Implementar función `enviarMensajeMasivo` o `contactarPersona`.

- **Input:** Criterio (ej: "Profesores de Parral") o Nombre ("Juan Pérez").
- **Proceso:**
    1. Buscar teléfono en CSV/Contactos.
    2. Redactar mensaje empático.
    3. Invocar a Rojo.

### 2. Nuevo Comando en `index.js` (Rojo)

Habilitar una acción interna (no vía WhatsApp, sino vía CLI o función interna) para enviar mensajes.

- **Comando:** `[[EXEC:rojo|send_whatsapp|numero|mensaje]]` (Reflexivo).
- O exponer una API interna para que los agentes "hablen" por WhatsApp.

## Flujo de Usuario (Ejemplo)

1. **Usuario:** "Rojo, dile a todos los profesores de la lista que mañana hay reunión".
2. **Rojo:** Detecta intención masiva -> Delega a **Allende**.
3. **Allende:**
    - Lee CSV de contactos.
    - Filtra "profesores".
    - Genera lista de números.
    - Por cada uno, genera comando de envío.
4. **Rojo:** Ejecuta envíos uno por uno.

---
**Próximos Pasos:**

1. Crear base de datos de "teléfonos" en CSV de contactos (actualmente solo correos).
2. Implementar lógica de bucle en Allende.
