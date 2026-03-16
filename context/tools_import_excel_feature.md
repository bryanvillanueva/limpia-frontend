# Importacion Masiva de Herramientas (CSV/XLSX)

## Objetivo

Permitir la carga masiva de herramientas (tools) desde un archivo `.csv` o `.xlsx`. Las herramientas pueden crearse solo (ubicacion en oficina) o crearse y asignarse a un equipo de inmediato (ubicacion asignada + equipo_id).

## Endpoint Backend

- **Metodo:** `POST`
- **URL:** `/api/tools/import`
- **Auth:** JWT requerido
- **Roles:** `admin`
- **Content-Type:** `multipart/form-data`
- **Campo de archivo:** `file`

## Formato del Archivo

El backend lee la primera hoja del archivo (en `.xlsx`) o el contenido del `.csv`.

### Columnas soportadas

#### Requeridas por fila
- `nombre` (alias: `name`)

#### Opcionales
- `code` (alias: `codigo`)
- `descripcion` (alias: `description`)
- `requiere_mantenimiento` (alias: `mantenimiento`)  
  Valores aceptados: `1/0`, `true/false`, `si/yes`. Por defecto 0.
- `fecha_ultimo_mantenimiento` (alias: `fecha_mantenimiento`)
- `precio_unitario` (alias: `precio`)
- `ubicacion` (alias: `location`)  
  Valores: **`oficina`** o **`asignada`**. Si se omite o está vacío, se trata como `oficina`.
- `equipo_id` (alias: `team_id`, `team`)  
  **Requerido** cuando `ubicacion` es `asignada`. Debe ser un ID válido de la tabla `teams`. Cuando `ubicacion` es `oficina`, debe estar vacío o se ignora.

## Reglas de negocio

- **Ubicacion `oficina`:** Solo se crea la herramienta. `equipo_id` queda en blanco (no asignada a equipo).
- **Ubicacion `asignada`:** Se crea la herramienta y se asigna al equipo indicado en `equipo_id`. Si `equipo_id` está vacío o no es válido, la fila falla.

De esta forma se cubren ambos escenarios: crear herramientas sin asignar y crear y asignar a un equipo en la misma importación.

## Comportamiento de validación

- Si una fila no cumple validaciones, esa fila falla y se reporta en `errors`.
- La importación es **parcial**: filas válidas se insertan aunque otras fallen.
- Si `ubicacion` no es `oficina` ni `asignada`, la fila falla con mensaje: `ubicacion debe ser "oficina" o "asignada"`.
- Si `ubicacion` es `asignada` y `equipo_id` está vacío: `equipo_id es requerido cuando ubicacion es asignada`.
- Si `equipo_id` no es un entero válido o no existe en `teams`: `equipo_id invalido` o `equipo_id X no existe`.
- Si `precio_unitario` viene informado y no es numérico: `precio_unitario invalido`.

## Respuesta del endpoint

```json
{
  "message": "Importacion completada con observaciones",
  "imported": 10,
  "failed": 1,
  "errors": [
    { "row": 5, "message": "equipo_id es requerido cuando ubicacion es asignada" }
  ]
}
```

`row` usa numeración de Excel/CSV (fila 1 = cabecera).

## Guía de integración frontend

1. UI de importación:
   - Selector de archivo (`.csv`, `.xlsx`)
   - Botón «Importar»
   - Resumen: `imported`, `failed`, lista de `errors` por fila

2. Request con `FormData`:

```js
const formData = new FormData();
formData.append('file', selectedFile);

const response = await fetch('/api/tools/import', {
  method: 'POST',
  headers: {
    Authorization: `Bearer ${token}`
  },
  body: formData
});

const result = await response.json();
```

3. UX recomendada:
   - Estado de carga durante subida y procesamiento
   - Si `failed > 0`, mostrar detalle de errores por fila
   - Ofrecer descarga de plantilla CSV de ejemplo

## Plantilla CSV sugerida

```csv
nombre,code,descripcion,requiere_mantenimiento,fecha_ultimo_mantenimiento,precio_unitario,ubicacion,equipo_id
Aspiradora Industrial,ASP-01,Uso pesado,1,2025-01-15,299.99,oficina,
Cubo y fregona,CUB-02,,0,,,asignada,3
Escalera ESC-03,Mantenimiento,1,,89.50,asignada,2
```

- Fila 1: herramienta solo en oficina (sin equipo).
- Fila 2 y 3: herramientas creadas y asignadas al equipo con ID 3 y 2 respectivamente.

**Nota:** El backend inserta también la columna `code` si existe en la tabla `tools`. Si tu esquema no tiene `code`, quita esa columna del `INSERT` en `controllers/tools.controller.js` (importTools).
