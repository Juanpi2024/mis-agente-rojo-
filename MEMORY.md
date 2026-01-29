# MEMORY.md - Memoria del Plan Maestro

## 🎯 Objetivo Global: Ecosistema de Agentes Automatizados

Crear una red de agentes orquestados por "Maestro" que gestionen el ciclo de vida de los proyectos del usuario, con prioridad en la **Venta de Material Educativo**.

## 📄 Protocolos de Operación

Para saber cómo llamar a cada agente, consulta el archivo [PROTOCOLS.md](./PROTOCOLS.md) donde están las palabras clave.

## 🏗️ Estructura de Agentes Especialistas (En Desarrollo)

### 1. Agente Especialista en Contenido Pedagógico

- **Misión:** Generar guías, actividades y evaluaciones de alta calidad basadas en el currículum chileno.
- **Estado:** ✅ Inicializado. Esperando planificación "clase a clase".
- **Ubicación:** `agents/pedagogico/`

### 2. Agente Especialista en Limpieza de Datos (Custodio)

- **Misión:** Sanitizar archivos Word, eliminar metadatos y asegurar la privacidad antes de la venta.
- **Estado:** ✅ Inicializado.
- **Ubicación:** `agents/limpieza_datos/`

### 3. Agente Publicador ProfeSocial (E-commerce)

- **Misión:** Subir los materiales limpios a ProfeSocial, configurar precios, títulos y descripciones.
- **Estado:** ✅ Inicializado. Esperando credenciales y primer archivo.
- **Ubicación:** `agents/publicador_profesocial/`

### 4. Agente Analista de Cobertura Curricular (Estratega)

- **Misión:** Analizar Google Drive y Repositorio Local para identificar brechas de contenido y asegurar la cobertura del 100% del currículo.
- **Estado:** ✅ Inicializado.
- **Ubicación:** `agents/analista_curriculum/`

### 5. Agente Especialista en Marketing y Tendencias (Growth)

- **Misión:** Investigar ProfeSocial y otras plataformas para detectar materiales más vendidos, sugerir nuevos títulos de alta conversión e identificar nichos de mercado.
- **Estado:** ✅ Inicializado.
- **Ubicación:** `agents/marketing/`

### 6. Agente Asistente Personal y Gestor de Correo

- **Misión:** Filtrar inbox, identificar urgencias, rastrear ventas de ProfeSocial y redactar respuestas mimetizando la voz del humano.
- **Estado:** ✅ Inicializado.
- **Ubicación:** `agents/asistente_personal/`

### 7. Agente Gestor Financiero (Contador)

- **Misión:** Extraer datos de imágenes de boletas, organizar archivos contables y gestionar el registro de adquisiciones en Excel para colegios y negocios.
- **Estado:** ✅ Inicializado.
- **Ubicación:** `agents/gestor_financiero/`

### 8. Agente Especialista en Encuestas e Insights (Analista)

- **Misión:** Diseñar encuestas psicosociales y educativas visualmente atractivas, gestionar la recolección online y generar dashboards de resultados estéticos.
- **Estado:** ✅ Inicializado.
- **Ubicación:** `agents/especialista_encuestas/`

### 9. Agente Visualizador de Datos y Generador Web

- **Misión:** Transformar datos de Excel (notas, asistencia) en páginas web responsivas y dashboards para la comunidad educativa.
- **Estado:** ✅ Inicializado.
- **Ubicación:** `agents/visualizador_datos_web/`

### 10. Agente de Soporte y CRM

- **Misión:** Atender usuarios y gestionar el pipeline en el CRM de Google Sheets.

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
