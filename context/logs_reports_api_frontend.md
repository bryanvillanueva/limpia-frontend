# Logs por equipo, reportes quincenales y API — Guía para frontend

Este documento resume los cambios implementados en el backend, la lógica de negocio y las rutas/endpoints que el frontend debe usar para registro diario, logs por equipo y reportes con exclusión (blacklist).

---

## 1. Resumen de cambios

### 1.1 Base de datos (ya aplicada)

- **billing_periods**: periodos de pago de 2 semanas (start_date = Lunes semana 1, end_date = Domingo semana 2). Ejemplo: 9 Mar–22 Mar.
- **billing_weeks**: una fila por semana (Lunes–Domingo), con `period_id` FK a `billing_periods`. Cada log se asigna a una semana según su `fecha`.
- **reports**: se extendió con `billing_period_id`, `created_at`, `updated_at`; `estado` incluye 'borrador', 'enviado', 'aprobado'.
- **report_excluded_logs**: blacklist por reporte (report_id, daily_site_log_id). Los totales del reporte se calculan excluyendo estos IDs.
- **daily_site_logs**: se añadieron `billing_week_id`, `entry_type` (SERVICE | BINS | CUSTOM), `display_value`.

### 1.2 Ciclo quincenal

- Los reportes se generan al final de las semanas 2 y 4; los pagos se procesan en semanas 1 y 3.
- La referencia está en BD: tablas `billing_weeks` y `billing_periods`. La primera semana definida es Lunes 9 Mar 2025 – Domingo 15 Mar 2025.
- El backend resuelve la semana y el periodo para cualquier fecha consultando esas tablas.

### 1.3 Logs diarios

- **Visibilidad**: los cleaners pueden ver los logs de su equipo (`GET /api/logs/team`), además de los propios (`GET /api/logs/my-logs`).
- **Registro tipo planner**: cada entrada puede ser SERVICE (horas del assignment), BINS (pago bins si hace_bins=1) o CUSTOM (valor manual). Se guardan `entry_type`, `display_value` y opcionalmente `observaciones`.
- **Semana de facturación**: al crear o actualizar un log, el backend asigna automáticamente `billing_week_id` según la `fecha` del log.
- **Un registro por usuario/sitio/fecha**: si el usuario vuelve a enviar un log para el mismo sitio y fecha, se actualiza el existente (upsert).

### 1.4 Reportes por usuario

- Cada usuario envía **su propio** reporte (user_id = usuario autenticado).
- Al generar el reporte puede indicar **qué logs excluir** (blacklist). Los totales se calculan solo con los logs no excluidos.
- Cleaner solo puede crear y ver sus propios reportes; admin/accountant pueden ver todos; solo accountant puede aprobar.

---

## 2. Lógica para el frontend

### 2.1 Obtener el periodo actual y si estamos en “semana de reporte”

1. Llamar **GET /api/reports/cycle** (opcionalmente con `?date=YYYY-MM-DD`).
2. La respuesta incluye:
   - `billing_week`: semana que contiene la fecha (id, start_date, end_date, period_id).
   - `billing_period`: periodo de 2 semanas (id, start_date, end_date).
   - `period_weeks`: lista de las 2 semanas del periodo.
   - `is_report_week`: `true` si la fecha cae en la última semana del periodo (semana de reporte).
3. Usar `billing_period.start_date` y `billing_period.end_date` como rango del periodo para pantallas de “Generar reporte” o “Mis logs del periodo”.

### 2.2 Registro diario (sitio a sitio)

1. **Pantalla “Mis sitios de hoy”**: **GET /api/logs/today** (cleaner). Devuelve sitios asignados al equipo del usuario con datos de assignment (horas_por_trabajador, hace_bins).
2. Por cada sitio que el usuario registra:
   - **POST /api/logs** con body:
     - `site_id`, `fecha` (YYYY-MM-DD) — obligatorios.
     - `entry_type`: `"SERVICE"` | `"BINS"` | `"CUSTOM"` — opcional (si no se envía, se usa lógica legacy con horas_trabajadas/solo_bins).
     - `display_value`: obligatorio si `entry_type === "CUSTOM"` (número ≥ 0).
     - `observaciones`: opcional.
   - Si ya existe un log para ese usuario, sitio y fecha, el backend hace UPDATE (no duplica).
3. Para editar un log ya creado: **PUT /api/logs/:id** con los campos a actualizar (entry_type, display_value, observaciones, estado, etc.). Si cambia `entry_type` a SERVICE o BINS, el backend recalcula `display_value` desde el assignment.

### 2.3 Ver logs del equipo

- **GET /api/logs/team** (cleaner) devuelve todos los logs del equipo del usuario.
- Query opcional: `fecha`, `site_id`, `user_id` para filtrar (por ejemplo solo los de un compañero o un día).
- Útil para una vista “Logs del equipo” o para que el cleaner vea qué registró su compañero.

### 2.4 Generar reporte de cobro (con blacklist)

1. Obtener el periodo (p. ej. con **GET /api/reports/cycle** o con el `billing_period_id` que ya tengas).
2. Cargar los logs del usuario en ese periodo: **GET /api/reports/period-logs** con:
   - `billing_period_id=X` **o**
   - `fecha_inicio=YYYY-MM-DD` y `fecha_fin=YYYY-MM-DD`.
3. Mostrar la lista de logs y permitir al usuario **marcar los que quiere excluir** (blacklist).
4. Al enviar el reporte: **POST /api/reports/generate** con body:
   - `billing_period_id` **o** `fecha_inicio` + `fecha_fin`.
   - `excluded_log_ids`: array de IDs de `daily_site_logs` que el usuario excluye.
   - `estado`: opcional, por defecto `"enviado"` (puede ser `"borrador"`).
5. La respuesta incluye el reporte creado, `excluded_log_ids`, `summary` (totales) e `included_logs` (logs que sí cuentan).

### 2.5 Ver mis reportes y detalle

- **GET /api/reports/my-reports** (cleaner/admin/accountant): lista de reportes del usuario autenticado.
- **GET /api/reports/:id**: detalle de un reporte. Incluye:
  - Cabecera (user_id, fecha_inicio, fecha_fin, estado, etc.).
  - `excluded_log_ids`, `summary` (totales recalculados), `included_logs`.
- Cleaner solo puede ver reportes propios; admin/accountant pueden ver cualquiera. Solo accountant puede llamar **PUT /api/reports/:id/approve**.

---

## 3. API Routes y endpoints

Base URL de la API: **`/api`**. Todas las rutas requieren **Authorization: Bearer &lt;token&gt;** salvo las de login.

### 3.1 Logs (`/api/logs`)

| Método | Ruta | Roles | Descripción |
|--------|------|--------|-------------|
| GET | `/api/logs/today` | cleaner | Sitios asignados hoy al equipo del usuario (para “Mis sitios de hoy”). |
| GET | `/api/logs/my-logs` | cleaner | Logs del usuario autenticado. Query: `site_id`, `fecha`. |
| GET | `/api/logs/team` | cleaner | Logs del equipo del usuario. Query: `fecha`, `site_id`, `user_id`. |
| GET | `/api/logs` | admin, manager, accountant | Todos los logs. Query: `fecha`, `user_id`. |
| GET | `/api/logs/:id` | autenticado | Un log por ID. Cleaner solo si pertenece a su equipo. |
| POST | `/api/logs` | cleaner | Crear o actualizar log (upsert por user + site + fecha). Body: `site_id`, `fecha` [, `entry_type`, `display_value`, `observaciones`, `horas_trabajadas`, `solo_bins`]. |
| PUT | `/api/logs/:id` | cleaner, manager | Actualizar log. Body: `horas_trabajadas`, `solo_bins`, `observaciones`, `estado`, `entry_type`, `display_value`, `fecha`. |

**POST /api/logs — body mínimo para registro tipo planner:**

```json
{
  "site_id": 5,
  "fecha": "2025-03-10",
  "entry_type": "SERVICE",
  "observaciones": "Sin novedad"
}
```

Para valor custom:

```json
{
  "site_id": 5,
  "fecha": "2025-03-10",
  "entry_type": "CUSTOM",
  "display_value": 2.5,
  "observaciones": "Extra por pedido especial"
}
```

### 3.2 Reportes (`/api/reports`)

| Método | Ruta | Roles | Descripción |
|--------|------|--------|-------------|
| GET | `/api/reports/cycle` | todos los autenticados | Contexto del ciclo para una fecha. Query: `date` (opcional, YYYY-MM-DD). |
| GET | `/api/reports/period-logs` | cleaner, admin, accountant | Logs del usuario en un periodo. Query: `billing_period_id` o `fecha_inicio` + `fecha_fin`. |
| GET | `/api/reports/my-reports` | cleaner, admin, accountant | Lista de reportes del usuario autenticado. |
| GET | `/api/reports` | admin, accountant | Lista de todos los reportes. |
| GET | `/api/reports/:id` | cleaner, admin, accountant | Detalle de un reporte (cleaner solo los propios). |
| POST | `/api/reports/generate` | cleaner, admin, accountant | Generar reporte del usuario con opcional blacklist. |
| PUT | `/api/reports/:id/approve` | accountant | Aprobar reporte. |

**GET /api/reports/cycle — respuesta ejemplo:**

```json
{
  "date": "2025-03-15",
  "billing_week": { "id": 1, "start_date": "2025-03-09", "end_date": "2025-03-15", "period_id": 1 },
  "billing_period": { "id": 1, "start_date": "2025-03-09", "end_date": "2025-03-22" },
  "period_weeks": [
    { "id": 1, "start_date": "2025-03-09", "end_date": "2025-03-15" },
    { "id": 2, "start_date": "2025-03-16", "end_date": "2025-03-22" }
  ],
  "is_report_week": false
}
```

**GET /api/reports/period-logs — query:**

- `billing_period_id=1` **o** `fecha_inicio=2025-03-09&fecha_fin=2025-03-22`

**Respuesta:**

```json
{
  "billing_period_id": 1,
  "fecha_inicio": "2025-03-09",
  "fecha_fin": "2025-03-22",
  "logs": [ { "id", "user_id", "site_id", "fecha", "entry_type", "display_value", "sitio", "cliente_nombre", ... } ]
}
```

**POST /api/reports/generate — body:**

```json
{
  "billing_period_id": 1,
  "excluded_log_ids": [ 10, 12, 15 ],
  "estado": "enviado"
}
```

Alternativa por fechas:

```json
{
  "fecha_inicio": "2025-03-09",
  "fecha_fin": "2025-03-22",
  "excluded_log_ids": [ 10, 12 ],
  "estado": "borrador"
}
```

**Respuesta (201):**

```json
{
  "id": 1,
  "user_id": 3,
  "billing_period_id": 1,
  "fecha_inicio": "2025-03-09",
  "fecha_fin": "2025-03-22",
  "estado": "enviado",
  "excluded_log_ids": [ 10, 12, 15 ],
  "summary": { "user_id": 3, "nombre": "...", "apellido": "...", "total_logs": 8, "total_bins_entries": 2, "total_valor": 12.5 },
  "included_logs": [ ... ]
}
```

**GET /api/reports/:id — respuesta:** igual estructura de detalle: cabecera, `excluded_log_ids`, `summary`, `included_logs`.

### 3.3 Planner (`/api/planner`) — referencia

| Método | Ruta | Descripción |
|--------|------|-------------|
| GET | `/api/planner/my-team` | team_id y team_numero del usuario (para saber qué equipo usar en el planner). |
| GET | `/api/planner/:teamId/sites` | Sitios asignados al equipo (para dropdown “Agregar item”). |
| GET | `/api/planner/:teamId/:cycleWeek` | Grilla del planner (planes + items + day_totals). |
| POST | `/api/planner/item` | Crear/actualizar item. Body: team_id, site_id, cycle_week, day_of_week, entry_type [, display_value, item_comment]. |
| PATCH | `/api/planner/plan/:planId` | Actualizar plan (week_comment, active, color). |
| PATCH | `/api/planner/item/:itemId` | Actualizar item (entry_type, item_comment, display_value). |
| DELETE | `/api/planner/item/:itemId` | Eliminar item. |

---

## 4. Errores habituales y códigos

- **400**: Campos faltantes o inválidos (p. ej. `entry_type` no SERVICE/BINS/CUSTOM, `display_value` faltante en CUSTOM, fechas/período inválido).
- **403**: Sin acceso (cleaner intentando ver log/reporte de otro equipo u otro usuario).
- **404**: Recurso no encontrado (log, reporte, semana o periodo inexistente para la fecha).
- **409**: Conflicto (p. ej. duplicado). En logs no aplica porque se hace upsert por usuario/sitio/fecha.

Mensajes en español en `message`; en 500 suele incluirse también `error` con detalle técnico.

---

## 5. Archivos de backend relacionados

| Área | Archivos |
|------|----------|
| Ciclo | `services/billingCycle.service.js` |
| Logs | `controllers/logs.controller.js`, `routes/logs.routes.js` |
| Reportes | `controllers/reports.controller.js`, `routes/reports.routes.js` |
| Registro en index | `index.js`: `/api/logs`, `/api/reports` |

Este documento es la referencia para integrar el frontend con los endpoints de logs, reportes y ciclo quincenal.
