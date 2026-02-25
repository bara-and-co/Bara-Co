# 🛍️ Bara & Co — Guía completa de la tienda

> Bienvenida al manual de tu tienda online. Acá encontrás **paso a paso** cómo agregar productos, subir fotos, manejar el stock, publicar cambios y más. No necesitás saber nada de código.

---

## 📋 Tabla de contenidos

1. [Cómo entrar al panel de administración](#-cómo-entrar-al-panel-de-administración)
2. [La pantalla principal — qué es cada cosa](#-la-pantalla-principal--qué-es-cada-cosa)
3. [Agregar un producto nuevo](#-agregar-un-producto-nuevo)
4. [Cambiar el precio de un producto](#-cambiar-el-precio-de-un-producto)
5. [Subir fotos — desde el celular y la computadora](#-subir-fotos--desde-el-celular-y-la-computadora)
6. [Talles, colores y stock](#-talles-colores-y-stock)
7. [Desactivar un producto (sin eliminarlo)](#-desactivar-un-producto-sin-eliminarlo)
8. [Duplicar un producto](#-duplicar-un-producto)
9. [Eliminar un producto](#-eliminar-un-producto)
10. [Publicar los cambios en la tienda](#-publicar-los-cambios-en-la-tienda)
11. [Descargar fotos del catálogo web](#-descargar-fotos-del-catálogo-web)
12. [Mejorar una foto con IA gratis](#-mejorar-una-foto-con-ia-gratis)
13. [Exportar e importar productos (CSV)](#-exportar-e-importar-productos-csv)
14. [Preguntas frecuentes](#-preguntas-frecuentes)
15. [Guía de errores comunes](#-guía-de-errores-comunes)
16. [Soporte](#-soporte)

---

## 🔑 Cómo entrar al panel de administración

El panel está en:

```
https://bara-and-co.github.io/Bara-Co/admin.html
```

> 💡 **Tip:** Guardala como marcador en tu navegador para entrar rápido.

**Pasos:**

1. Abrí el link de arriba (o el archivo `admin.html` desde tu compu)
2. Escribí la contraseña: `baraadmin2026`
3. Presioná **Enter** o el botón **Ingresar**

> ⚠️ La sesión dura hasta que cerrás el navegador. No compartas la contraseña.

**Primera vez — configurar token de GitHub:**

Solo se hace una vez. Hacé clic en ⚙️ (arriba a la derecha) y seguí las instrucciones dentro del panel. Una vez guardado, no lo tenés que volver a hacer.

---

## 🖥️ La pantalla principal — qué es cada cosa

Cuando entrás al admin, vas a ver:

| Zona | Para qué sirve |
|------|----------------|
| **Estadísticas (4 recuadros)** | Total de productos, cuántos son visibles, cuántos están en oferta y cuántos son New |
| **Barra de búsqueda** | Escribís el nombre, marca o SKU y filtra en tiempo real |
| **Pestañas de categoría** | Filtrás por Hombre / Mujer / Accesorios / Sale / Sin stock |
| **Ordenar** | Reciente / A-Z / Precio ↑ / Precio ↓ |
| **Tarjetas de productos** | Cada producto con foto, nombre, precio y toggle de visibilidad |
| **Botón `+ Nuevo producto`** | Arriba a la derecha, dorado |

Al **pasar el mouse** sobre una tarjeta aparecen 4 íconos:
- ✏️ Editar
- 👁️ Vista previa
- 📋 Duplicar
- 🗑️ Eliminar

---

## ➕ Agregar un producto nuevo

1. Hacé clic en **`+ Nuevo producto`** (arriba a la derecha) o en la tarjeta con el **"+"** al final de la grilla
2. Completá las pestañas del formulario:

### Pestaña `Básico`

| Campo | Qué poner |
|-------|-----------|
| **Nombre \*** | Nombre del producto, ej: `Campera NOVA` |
| **Precio \*** | Solo el número, ej: `75000` |
| **Precio anterior** | Si tiene descuento, el precio viejo. Si no, dejalo vacío |
| **Categoría \*** | New Collection / Hombre / Mujer / Accesorios |
| **Subcategoría** | Camperas, Remeras, Pantalones, etc. |
| **Descripción** | Texto libre con detalles (opcional pero recomendado) |
| **Marca** | La marca cosida en la etiqueta de la prenda |
| **SKU** | Código interno tuyo, ej: `CAM-001-NEG` |
| **Keywords** | Palabras para la búsqueda interna, ej: `verano`, `oversize` |

> **\*** = campo obligatorio. Sin nombre, precio e imagen no se puede guardar.

### Pestaña `Fotos`

Subí la foto principal y todas las adicionales que quieras (ver [Subir fotos](#-subir-fotos--desde-el-celular-y-la-computadora) más abajo).

### Pestaña `Stock`

Seleccioná los colores y talles, y completá las cantidades (ver [Talles, colores y stock](#-talles-colores-y-stock)).

### Pestaña `Material` *(opcional)*

Podés cargar la composición de la tela (ej: 70% Algodón, 30% Poliéster) con los sliders y los presets rápidos. También podés marcar los cuidados (lavar a mano, no secar, etc.).

### Pestaña `Config`

- **Visible en tienda**: toggle para mostrar u ocultar el producto
- **Destacar en inicio**: aparece primero en la grilla
- **Outlet**: marca el producto con etiqueta especial
- **Precio de costo**: privado, te calcula el margen automáticamente

3. Hacé clic en ✅ **Guardar**
4. Publicá los cambios (ver [Publicar](#-publicar-los-cambios-en-la-tienda))

---

## 💰 Cambiar el precio de un producto

1. Entrá al panel → buscá el producto
2. Pasá el mouse por encima → clic en ✏️ **lápiz**
3. Cambiá el número en **"Precio ($)"**
   - Para mostrar descuento: poné el precio viejo en **"Precio anterior"** y el nuevo en **"Precio"**
   - Para quitar el descuento: dejá **"Precio anterior"** vacío
4. Clic en ✅ **Guardar**
5. Clic en 🚀 **"Publicar ahora"** (banner que aparece arriba)

---

## 📸 Subir fotos — desde el celular y la computadora

Las fotos se suben automáticamente a internet — no necesitás copiar ningún link.

### Desde la computadora

**Opción A — Arrastrar y soltar:**
Arrastrá una foto desde tu carpeta directamente al recuadro de la nube ☁️.

**Opción B — Seleccionar archivo:**
Hacé clic en el recuadro → se abre el explorador de archivos → elegís la foto.

### Desde el celular

1. Andá a la pestaña **Fotos** del producto
2. Tocá el recuadro con la nube ☁️
3. Elegí desde la galería o tomá una foto nueva
4. Esperá el badge verde **"✓ Imagen cargada"** — eso significa que ya se subió

### Fotos adicionales

Debajo de la foto principal hay una grilla de **fotos adicionales** (para mostrar distintos ángulos, colores, detalles):
- Hacé clic en el botón **"+ Agregar"**
- Para quitar una foto adicional, clic en la **"×"** que aparece sobre ella

### Pegar una URL de imagen

Si ya tenés la foto en internet (del proveedor, de una tienda anterior, etc.):
1. Tocá **"▶ O pegá una URL de imagen"** (debajo del recuadro)
2. Pegá el link
3. Clic en **"Usar"**

> ⚠️ Tamaño máximo por foto: **10MB**. Formatos aceptados: JPG, PNG, WEBP.

> 💡 Las mejores fotos para vender: fondo blanco o neutro, iluminación natural, relación **3:4** (alto mayor que ancho), mínimo **800×1067 px**.

---

## 📦 Talles, colores y stock

Todo esto está en la pestaña **`Stock`** del formulario.

### Colores

1. Hacé clic en los círculos de la paleta para seleccionar los colores que tiene el producto (quedan marcados con un tilde dorado ✓)
2. Para **agregar un color que no está**, usá el selector de colores abajo → ponés el nombre → **"Agregar"**
3. Para **quitar** un color, pasás el mouse encima del círculo → clic en la ×

### Talles

Los talles comunes ya están: S, M, L, XL, XXL, 36, 38, 40, 42, 44, 46, 48, Único.

- **Marcá los checkboxes** de los talles que tiene el producto
- **Talle personalizado**: escribís en el campo de texto → clic en **"Agregar"**
- **Talle "Único"**: para accesorios y productos sin talle

### Stock por color y talle

Cuando seleccionás colores Y talles, aparece automáticamente una **tabla** para cargar el stock de cada combinación:

```
         | S  | M  | L  | XL
---------|----|----|----|----|
Negro    | 3  | 2  | 5  | 1  
Blanco   | 0  | 4  | 2  | 3  
Azul     | 1  | 0  | 2  | 0  
```

- Las celdas con **0** se muestran como "Agotado" en la tienda (el talle sigue visible pero no se puede comprar)
- El total general se **calcula automáticamente** — no hace falta llenarlo a mano

> 💡 El stock que cargás se muestra en tiempo real en la página de producto: el cliente ve cuántas unidades quedan por talle y color antes de comprar.

---

## 👁️ Desactivar un producto (sin eliminarlo)

Ideal cuando algo está sin stock pero va a volver.

1. En la tarjeta del producto, **toggle abajo a la derecha** → pasa a gris y dice "Oculto"
2. El producto **desaparece de la tienda** pero lo seguís viendo en el admin (se ve atenuado)
3. Para volver a activarlo, tocás el toggle de nuevo
4. Publicá los cambios

También podés hacerlo desde adentro del producto: pestaña **Config** → toggle **"Visible en tienda"**.

---

## 📋 Duplicar un producto

Útil para productos similares (mismo precio, mismas fotos, diferente color).

1. Pasá el mouse por la tarjeta → clic en el ícono de **duplicar** 📋 (azul)
2. El nuevo producto se crea con el nombre *"(copia)"* y queda **oculto**
3. Abrilo, cambiá lo que necesitás, y activá el toggle para que sea visible

> 💡 El duplicado siempre empieza oculto para que no se publique accidentalmente.

---

## 🗑️ Eliminar un producto

1. Pasá el mouse por la foto → clic en el 🗑️ **ícono rojo**
2. Confirmá en la ventana que aparece

> ⚠️ **Eliminar es permanente.** Si el producto puede volver a tener stock, mejor **desactivarlo**.

---

## 🚀 Publicar los cambios en la tienda

Cada vez que hacés un cambio (agregar, editar, ocultar productos), aparece un **banner oscuro** arriba que dice cuántos cambios tenés sin publicar.

1. Hacé clic en **"Publicar ahora"**
2. Esperás unos segundos (ves un spinner)
3. Aparece el mensaje ✅ **"¡Publicado! La tienda se actualiza en ~1 minuto"**
4. Abrí la tienda en una pestaña nueva para verificar

> ⚠️ Si cerrás el admin sin publicar, los cambios **no se pierden** — se guardan en tu navegador hasta la próxima vez que entres.

> 💡 Si tenés el token configurado, los cambios se publican **automáticamente al guardar** cada producto. No necesitás hacer clic manual en "Publicar" cada vez.

---

## 📸 Descargar fotos del catálogo web

Podés descargar fotos de cualquier producto que ya esté en la tienda.

### Desde la computadora

1. Entrá a la tienda y abrí el producto
2. **Clic derecho** sobre la imagen → **"Guardar imagen como..."**

### Desde el celular

1. Abrí el producto en la tienda
2. Tocá la foto hasta que se amplíe
3. **Mantenés presionada** la foto → **"Guardar imagen"**
   - iPhone: "Añadir a Fotos"
   - Android: "Descargar imagen"

### Desde el panel admin (más directo)

1. Buscá el producto en el admin → clic en ✏️ editar
2. Andá a la pestaña **Fotos**
3. Clic derecho sobre la imagen → **"Guardar imagen como..."**

---

## 🤖 Mejorar una foto con IA gratis

### ✂️ Quitar el fondo

**[remove.bg](https://www.remove.bg/es)** — la mejor para ropa y personas

1. Subí tu foto
2. La IA saca el fondo en segundos
3. Descargá (gratis en resolución web)

### 🎨 Mejorar brillo, nitidez y colores

**[Adobe Express](https://www.adobe.com/express/)** — gratis, sin instalar nada

1. Clic en **"Editar foto"**
2. Subí la imagen
3. Ajustá brillo, contraste, saturación
4. Descargá

### ✨ Agrandar una foto sin perder calidad (upscaling)

Si la foto es chiquita o pixelada: **[Upscayl](https://upscayl.org/)**

1. Subí la foto → elegí "4x upscale" → descargá

---

## 📥 Exportar e importar productos (CSV)

### Exportar

Hacé clic en el ícono **↑** (arriba a la derecha, al lado de importar). Se descarga `productos_export.csv` que podés abrir con Excel o Google Sheets.

### Importar

1. Editá el CSV exportado con los cambios
2. Hacé clic en el ícono **↓** → seleccioná el archivo `.csv` o `.json`
3. Los productos se cargan automáticamente

> ⚠️ Al importar se **reemplazan todos los productos actuales**. Siempre exportá antes como respaldo.

---

## ❓ Preguntas frecuentes

**¿Por qué no se ve el cambio en la tienda?**
Porque no publicaste. Buscá el banner que dice "X cambios sin publicar" y hacé clic en "Publicar ahora". La tienda tarda ~1 minuto en actualizarse.

---

**¿Puedo usar el admin desde el celular?**
Sí, está optimizado para mobile. Todas las funciones están disponibles, aunque algunas son más cómodas desde la computadora.

---

**¿Los cambios se guardan automáticamente?**
Se guardan en tu navegador al instante. Para que aparezcan en la tienda hay que publicar.

---

**¿Cómo agrego un talle que no está en la lista?**
En la pestaña Stock, escribís el talle en el campo de texto abajo y hacés clic en **"Agregar"**.

---

**¿Cómo pongo un producto en Outlet?**
Abrí el producto → pestaña **Config** → toggle **"Outlet"**.

---

**¿Puedo tener el mismo producto en dos categorías?**
No directamente. Si querés que aparezca en "New Collection" y en "Hombre", elegí **New Collection** (tiene prioridad visual en la tienda).

---

**¿Qué hago si me equivoqué y eliminé algo?**
Si todavía no publicaste → recargá la página (se restaura desde la última versión publicada).  
Si ya publicaste → tenés que agregar el producto de nuevo.

---

**¿Qué hago si la tienda tarda más de 5 minutos en actualizarse?**
Recargá la tienda con `Ctrl + Shift + R` (Windows) o `Cmd + Shift + R` (Mac) para limpiar la caché.

---

**¿Puedo agregar fotos desde Instagram?**
Sí. Desde la web de Instagram en computadora → clic derecho en la foto del post → "Copiar dirección de imagen" → pegala en el campo URL del admin.

---

**¿Cómo cambio el número de WhatsApp o el botón de contacto?**
Eso requiere un cambio en el código. Avisale a tu desarrollador y lo actualiza en minutos.

---

**¿Necesito pagar algo?**
No. GitHub Pages es gratuito y el hosting no tiene costo.

---

## 🔧 Guía de errores comunes

| Error | Causa | Solución |
|-------|-------|----------|
| **Token vencido / Error 401** | El token de GitHub expiró | Generá uno nuevo en GitHub → Settings → Developer settings |
| **Sin permisos / Error 403** | El token no tiene el permiso `repo` | Generá un nuevo token con el tilde `repo` marcado |
| **La imagen no sube** | Archivo mayor a 10MB o conexión lenta | Reducí el tamaño o esperá mejor señal |
| **Cambios no se ven en tienda** | No publicaste | Clic en "Publicar ahora" en el banner |
| **Producto aparece sin foto** | La imagen no terminó de subir | Entrar al producto, volver a subir la foto, publicar |
| **No puedo entrar al admin** | Contraseña incorrecta | La contraseña es `baraadmin2026` |

---

## 📞 Soporte

Si algo no funciona o tenés dudas, contactá a tu desarrollador:

- **WhatsApp:** 3525300076
- **Email:** david@diazux.tech
---

*Bara & Co — Manual interno v2.0*
