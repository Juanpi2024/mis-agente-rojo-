# 🚀 ESTRATEGIA DE DIFUSIÓN: WHATSAPP BROADCAST (ROJO + ALLENDE)

**Objetivo:** Enviar masivamente el link del Diagnóstico CEIA 2026 a la base de datos de alumnos.
**Agentes en Acción:** Allende (Gestión de Base de Datos) + Rojo (Motor de WhatsApp).

---

## 📋 PROTOCOLO DE ENVÍO

### 1. Preparación de la Base (Allende)

Allende procesará el archivo Excel/CSV con los números de teléfono.

- **Formato requerido:** Nivel (1° Medio, etc.), Nombre (opcional para saludo), Celular (Formato: 569...).
- **Limpieza:** El Che verificará que no haya números duplicados o mal formateados.

### 2. El Mensaje (Template Rojo)

Diseñamos un mensaje empático y respetuoso (estilo Allende):

> "Hola *[Nombre]*, te saluda el equipo del **CEIA**. 🏢
>
> Queremos que este 2026 sea tu mejor año escolar. Para apoyarte mejor, necesitamos conocer tu realidad (trabajo, conectividad, etc.).
>
> Es una encuesta **100% ANÓNIMA** y no te tomará más de 2 minutos. Tu voz es fundamental para mejorar nuestra escuela.
>
> 👇 Ingresa aquí:
> [LINK_HO_CHI_MINH_SURVEY]
>
> ¡Un gran abrazo y bienvenido/a a clases! 🫡🚩"

---

## 🛠️ INTEGRACIÓN TÉCNICA (Rojo API)

Si el usuario provee el archivo, Rojo ejecutará la secuencia:

1. **Iteración:** Leer fila por fila.
2. **Delay:** Espera de 10-20 segundos entre mensajes para evitar bloqueos.
3. **Registro:** Allende marcará en el CRM quién recibió el mensaje (sin vincular con la respuesta para asegurar el anonimato).

---

## 📊 REQUISITOS PARA INICIAR

- [ ] Archivo Excel/CSV con columna "Teléfono".
- [ ] Rojo conectado a WhatsApp (QR escaneado).
- [ ] URL final de la encuesta (index.html alojado o enviado como archivo).

---
*Allende: "Ningún estudiante se queda atrás cuando la comunicación es clara y humana."*
