# MEMORY.md - Memoria del Plan Maestro

## 🎯 Objetivo Global: Ecosistema de Agentes Automatizados

Crear una red de agentes orquestados por "Maestro" que gestionen el ciclo de vida de los proyectos del usuario, con prioridad en la **Venta de Material Educativo**.

## 📄 Protocolos de Operación

Para saber cómo llamar a cada agente, consulta el archivo [PROTOCOLS.md](./PROTOCOLS.md) donde están las palabras clave.

## 🏗️ Estructura de Agentes Especialistas (En Desarrollo)

### 1. **Fidel** (Especialista en Contenido Pedagógico)

- **Misión:** Generar guías, actividades y evaluaciones de alta calidad basadas en el currículum chileno.
- **Estado:** ✅ Analizando Guía "La Noticia" (Octubre).
- **Ubicación:** `agents/pedagogico/`

### 2. **El Che** (Custodio y Limpieza de Datos)

- **Misión:** Sanitizar archivos Word, eliminar metadatos y asegurar la privacidad antes de la venta.
- **Estado:** ✅ Limpiando Planificación Octubre.
- **Ubicación:** `agents/limpieza_datos/`

### 3. **Lenin** (Publicador ProfeSocial)

- **Misión:** Subir los materiales limpios a ProfeSocial, configurar precios, títulos y descripciones.
- **Estado:** ✅ Esperando material limpio de El Che.
- **Ubicación:** `agents/publicador_profesocial/`

### 4. **Stalin** (Estratega de Cobertura Curricular)

- **Misión:** Analizar Google Drive y Repositorio Local para identificar brechas de contenido y asegurar la cobertura del 100% del currículo.
- **Estado:** ✅ Escaneando 1° Medio.
- **Ubicación:** `agents/analista_curriculum/`

### 5. **Xi Jinping** (Estratega de Mercado y Marketing)

- **Misión:** Investigar ProfeSocial para detectar materiales más vendidos y sugerir nuevos títulos de alta conversión.
- **Estado:** ✅ Inicializado.
- **Ubicación:** `agents/marketing/`

### 6. **Putin** (Nexo Personal y Comunicaciones)

- **Misión:** Monitor de email, filtrado de urgencias y asistente de agenda.
- **Estado:** ✅ Inicializado.
- **Ubicación:** `agents/asistente_personal/`

### 7. **Marx** (Gestor Financiero / Contador)

- **Misión:** Extraer datos de imágenes de boletas y gestionar el registro de adquisiciones en Excel.
- **Estado:** ✅ Inicializado.
- **Ubicación:** `agents/gestor_financiero/`

### 8. **Mao** (Diseñador de Insights e Invitaciones)

- **Misión:** Diseñar encuestas psicosociales y educativas visualmente atractivas y generar dashboards estéticos.
- **Estado:** ✅ Inicializado.
- **Ubicación:** `agents/especialista_encuestas/`

### 9. **Ho Chi Minh** (Arquitecto de Datos y Web)

- **Misión:** Transformar datos de Excel (notas, asistencia) en páginas web responsivas y dashboards.
- **Estado:** ✅ Inicializado.
- **Ubicación:** `agents/visualizador_datos_web/`

### 10. **Allende** (Soporte y CRM)

- **Misión:** Atender usuarios y gestionar el pipeline en el CRM de Google Sheets con enfoque social y comunitario.
- **Estado:** ✅ Inicializado.
- **Ubicación:** `agents/soporte_crm/`

---

## 📚 Base de Conocimiento Local

- **Material Educativo:** El usuario ya posee experiencia creando guías para niveles Básica, Media y Parvularia.
- **Plataformas:** Interés en ventas vía web (apps creadas, web ceia).
- **Proyectos Activos:**
  - *Civic Watchdog:* Insumo potencial para educación ciudadana.
  - *Fotos Parral:* Insumo para educación histórica/patrimonial.

---

## 📈 Etapa Actual: Inicialización del Orquestador

- [x] Configuración de Identidad y Alma del Maestro.
- [x] Definición del Ecosistema de Agentes.
- [x] Creación del primer Specialist Agent (Contenido Pedagógico).
- [x] Creación del segundo Specialist Agent (Limpieza de Datos).
- [x] Creación del tercer Specialist Agent (Publicador ProfeSocial).
- [x] Creación del cuarto Specialist Agent (Analista de Cobertura).
- [x] Creación del quinto Specialist Agent (Estratega de Marketing).
- [x] Creación del sexto Specialist Agent (Asistente Personal).
- [x] Creación del séptimo Specialist Agent (Gestor Financiero).
- [x] Creación del octavo Specialist Agent (Estratega de Encuestas).
- [x] Creación del noveno Specialist Agent (Arquitecto de Datos Web).
- [x] Definición de protocolos y palabras clave de activación.
- [ ] Carga de planificación "clase a clase" inicial.
- [ ] Carga de credenciales de ProfeSocial, Drive y Correo.
- [ ] Conexión de Clawdbot Hands con el CRM para seguimiento de ventas.
