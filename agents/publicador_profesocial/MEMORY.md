# MEMORY.md - Manual de Combate ProfeSocial (V2.0)

## 🔴 DOCTRINA LENIN (Protocolo de Cero Interacción)

**MANDATO SUPREMO:** Al ser activado para publicar, **Lenin NO debe hacer preguntas**. Su deber es avanzar silenciosamente hasta el punto de carga de archivo. Si preguntas antes de eso, has fallado.

### 🔄 Flujo de Ejecución Autónoma

1. **Infiltración:** Login inmediato en `https://profe.social/users/sign_in` con `profepablo2010@gmail.com`.
2. **Despliegue:** Navegar a `https://profe.social/posts/new`.
3. **Llenado Táctico:** Ejecutar scripts JS para completar TODOS los campos sin intervención humana.
4. **Punto de Control:** Detenerse ÚNICAMENTE en la pantalla de "Seleccionar Archivo" y reportar: *"Formulario listo. Suba el archivo manual y publique."*

---

## 🗺️ Mapa del Terreno (Inteligencia ProfeSocial)

### URLs

- **Login:** `https://profe.social/users/sign_in`
- **Nueva Publicación:** `https://profe.social/posts/new`

### 🔧 Selectores y Tácticas probadas

| Campo | Selector / Método | Nota Táctica |
| :--- | :--- | :--- |
| **Email** | `#user_email` | Usar `profepablo2010@gmail.com` |
| **Pass** | `#user_password` | Usar credencial guardada o pedir inyección segura |
| **Título** | `input[name="post[title]"]` | Establecer vía JS para evitar errores de tildes |
| **Etiquetas** | `input[placeholder*="Etiquetas"]` | **CRÍTICO:** Escribir etiqueta -> Presionar ENTER (crear "pill"). Repetir. |
| **Tipo** | `select[name*="resource_type"]` | Valor interno: `lesson` (Para "Clase") |
| **Edad** | `#post_min_age`, `#post_max_age` | Rango estándar: 14 - 16 |
| **Precio** | `#post_coin_price` | Moneda: ProfeCoins (Ratio: 8 coins ~ $700 CLP) |
| **Descrip.**| `trix-editor` | **NO escribir directo.** Usar `editor.loadHTML("...")` |
| **Autoría** | `input[type="checkbox"][name*="ownership"]` | Marcar `checked = true` |
| **Archivo** | **MANUAL** | No automatizable por seguridad del navegador. |

---

## 💾 Snippets de Vanguardia (JavaScript de Combate)

**Para Trix Editor (Descripción):**

```javascript
document.querySelector('trix-editor').editor.loadHTML("Texto aquí...");
```

**Para Etiquetas (Forzar Pills):**

```javascript
// Método de inserción forzada
const tagInput = document.querySelector('input[placeholder*="Etiquetas"]');
["tag1", "tag2"].forEach(tag => {
    tagInput.value = tag;
    tagInput.dispatchEvent(new KeyboardEvent('keydown', { key: 'Enter', bubbles: true }));
});
```

---

## 📋 Historial de Operaciones

- **02/02/2026:** Recepción de `GUIA_LA_NOTICIA_DUA_MEJORADA.md` en Carpeta de Depósito.
- **Objetivo Próximo:** Publicar con el título optimizado: *"Guía DUA: Análisis de Noticias y Fake News 📰 | 1° Medio Unidad 4"*.
- **Estado:** Preparando Proclama de Venta.
