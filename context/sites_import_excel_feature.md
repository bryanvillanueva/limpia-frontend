# Importacion Masiva de Sitios (CSV/XLSX)

## Objetivo

Permitir la carga masiva de sitios desde un archivo `.csv` o `.xlsx` para acelerar el alta operativa.

La importacion crea registros en la tabla `sites` respetando la regla actual del sistema:
- cada sitio debe tener `direccion_linea1`
- cada sitio debe estar vinculado a un cliente (`cliente_id` o `cliente_nombre` resoluble)

## Endpoint Backend

- **Metodo:** `POST`
- **URL:** `/api/sites/import`
- **Auth:** JWT requerido
- **Roles:** `admin`
- **Content-Type:** `multipart/form-data`
- **Campo de archivo:** `file`

## Formato del Archivo

El backend lee la primera hoja del archivo (en `.xlsx`) o el contenido del `.csv`.

### Columnas soportadas

#### Requeridas por fila
- `direccion_linea1` (alias: `direccion`)
- Cliente:
  - `cliente_id` **o**
  - `cliente_nombre` (alias: `cliente`)

#### Opcionales
- `direccion_linea2`
- `suburb`
- `state` (alias: `estado`)
- `postcode` (alias: `codigo_postal`)
- `country` (alias: `pais`)
- `latitud`
- `longitud`
- `contrato`
- `finanzas`
- `activo`  
  Valores aceptados: `1/0`, `true/false`, `si/no`, `activo/inactivo`.
- `team_id` (alias: `team`)  
  Si está presente y es un ID de equipo válido, después de crear el sitio se asigna ese equipo al sitio en `team_site_assignments`. Si está vacío o ausente, solo se crea el sitio.

Cuando se asigna un equipo (`team_id` informado), se pueden incluir también las columnas de la asignación (tabla `team_site_assignments`). Si no se informan, se usan valores por defecto (NULL o 0 según el campo).

#### Columnas de asignación (cuando hay `team_id`)
- `frecuencia` (alias: `frequency`) — texto; opcional.
- `horas_por_trabajador` (alias: `horas_trabajador`, `horas`) — número; opcional.
- `hace_bins` (alias: `bins`) — 0/1 o true/false; por defecto 0.
- `pago_bins` — número; opcional.
- `fecha_asignacion` (alias: `fecha`) — fecha (YYYY-MM-DD o interpretable); si está vacía se usa la fecha actual.
- `assignment_activo` (alias: `asignacion_activo`, `tsa_activo`) — 0/1 para activo de la asignación; por defecto 1.

## Comportamiento de Validacion

- Si una fila no cumple validaciones, esa fila falla y se reporta en `errors`.
- La importacion es **parcial**: filas validas se insertan aunque otras fallen.
- Si `cliente_nombre` existe duplicado en DB, esa fila falla (evita asignacion ambigua).
- Si `team_id` viene informado pero no es un entero válido o no existe en la tabla `teams`, la fila falla con mensaje `team_id invalido` o `team_id X no existe`.

## Comportamiento con sitios ya existentes

El sistema identifica un sitio existente por **`direccion_linea1` + `cliente_id`** (mismo cliente y misma dirección línea 1).

- **Sitio no existe:** se crea el sitio y, si viene `team_id`, se asigna a ese equipo. Cuenta como `imported`.
- **Sitio existe y los datos son iguales (campo a campo):** no se modifica el registro del sitio. Si el Excel trae `team_id`, se actualiza solo la asignación: el sitio queda asignado al nuevo equipo (se desactivan otras asignaciones de ese sitio y se activa la del equipo indicado). No cuenta como `imported` (no se creó fila nueva en `sites`).
- **Sitio existe pero algún dato es distinto** (p. ej. `suburb`, `state`, `postcode`, etc.): no se actualiza el sitio ya existente. Se crea un **nuevo** sitio con los datos del Excel y se asigna al equipo del Excel si viene `team_id`. El sitio antiguo y su asignación (p. ej. al equipo 1) no se tocan. Cuenta como `imported`.

### Ejemplos

1. **Sitio 1 asignado al equipo 2.** Excel: mismo sitio, asignado al equipo 1. → El sitio pasa a estar asignado al equipo 1 (solo cambia la asignación).
2. **Sitio 1 sin equipo.** Excel: mismo sitio, asignado al equipo 3. → Se asigna el sitio al equipo 3.
3. **Sitio 1 asignado al equipo 1.** Excel: mismo direccion_linea1 + cliente pero `suburb` distinto y equipo 4. → No se modifica el sitio 1 (sigue con equipo 1). Se crea un sitio nuevo con el nuevo `suburb` y se asigna al equipo 4.

## Respuesta del Endpoint

```json
{
  "message": "Importacion completada con observaciones",
  "imported": 8,
  "failed": 2,
  "errors": [
    { "row": 4, "message": "cliente_id invalido" },
    { "row": 9, "message": "direccion_linea1 y cliente_id/cliente_nombre son requeridos" }
  ]
}
```

`row` usa numeracion de Excel/CSV (incluye header en la fila 1).

## Guia de Integracion Frontend

1. Crear UI de importacion con:
   - selector de archivo (`.csv,.xlsx`)
   - boton `Importar`
   - tabla/lista para mostrar resumen (`imported`, `failed`, `errors`)

2. Enviar request con `FormData`:

```js
const formData = new FormData();
formData.append('file', selectedFile);

const response = await fetch('/api/sites/import', {
  method: 'POST',
  headers: {
    Authorization: `Bearer ${token}`
  },
  body: formData
});

const result = await response.json();
```

3. UX recomendada:
   - mostrar estado de carga durante upload/procesamiento
   - si `failed > 0`, renderizar detalle de errores por fila
   - habilitar descarga de plantilla base (csv) para reducir errores de columnas

## Plantilla CSV Sugerida

```csv
direccion_linea1,direccion_linea2,suburb,state,postcode,country,cliente_id,team_id,frecuencia,horas_por_trabajador,hace_bins,pago_bins,fecha_asignacion,assignment_activo,contrato,finanzas,activo
123 Example St,,Sydney,NSW,2000,Australia,1,,,,,,,,Contrato A,Notas de finanzas,1
456 Demo Ave,Unit 2,Melbourne,VIC,3000,Australia,2,3,semanal,4,1,50,2025-03-01,1,Contrato B,,true
```

- Fila 1: solo sitio (sin equipo); no se usan columnas de asignación.
- Fila 2: sitio asignado al equipo 3 con frecuencia, horas, hace_bins, pago_bins, fecha_asignacion y activo de asignación. Las columnas de asignación son opcionales; si se omiten se usan NULL/0 o la fecha actual según el campo.
