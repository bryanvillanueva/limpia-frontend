Objetivo funcional

Crear un Planner por ciclo de 4 semanas (Semana 1–4) donde un Cleaner organiza su semana por día (Lunes–Domingo) y agrega sitios con un tipo:

SERVICE → muestra el valor usando team_site_assignments.horas_por_trabajador

BINS → muestra el valor usando team_site_assignments.pago_bins (solo si hace_bins = 1)

Esto es solo planificación + información (orden y estimación visual), no es registro real de ejecución ni payroll.

Qué ya existe y se reutiliza
team_site_assignments (ya la tienes)

Aquí vive la "verdad" de configuración por equipo y sitio:

horas_por_trabajador

hace_bins (sí/no)

pago_bins

frecuencia (semanal/quincenal/mensual, como referencia)

✅ El planner no define pagos, solo trae estos valores para mostrarlos.

Nuevas tablas (planner)

1. team_site_cycle_plan (cabecera por semana)

Una fila por team + site + cycle_week.

Sirve para:

saber que ese sitio está planificado esa semana

guardar un comentario semanal (ej: "Semana 2: hacer extra fijo")

permitir activar/desactivar

CREATE TABLE `team_site_cycle_plan` (
`id` INT NOT NULL AUTO_INCREMENT,
`team_id` INT NOT NULL,
`site_id` INT NOT NULL,
`cycle_week` TINYINT NOT NULL, -- 1..4
`week_comment` VARCHAR(255) DEFAULT NULL,
`active` TINYINT(1) NOT NULL DEFAULT 1,
`created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
`updated_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
PRIMARY KEY (`id`),
UNIQUE KEY `uq_team_site_week` (`team_id`,`site_id`,`cycle_week`),
CONSTRAINT `fk_plan_team` FOREIGN KEY (`team_id`) REFERENCES `teams`(`id`),
CONSTRAINT `fk_plan_site` FOREIGN KEY (`site_id`) REFERENCES `sites`(`id`),
CONSTRAINT `chk_cycle_week` CHECK (`cycle_week` BETWEEN 1 AND 4)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

Campos de team_site_cycle_plan:

| Campo         | Tipo                  | Descripción                                            |
|---------------|-----------------------|--------------------------------------------------------|
| id            | INT AUTO_INCREMENT    | PK                                                     |
| team_id       | INT NOT NULL          | FK → teams.id                                          |
| site_id       | INT NOT NULL          | FK → sites.id                                          |
| cycle_week    | TINYINT NOT NULL      | Semana del ciclo (1–4)                                 |
| week_comment  | VARCHAR(255) NULL     | Comentario semanal opcional                            |
| active        | TINYINT(1) DEFAULT 1  | Activo/Inactivo                                        |
| created_at    | TIMESTAMP             | Fecha de creación                                      |
| updated_at    | TIMESTAMP             | Última actualización                                   |

Restricciones: UNIQUE(team_id, site_id, cycle_week), CHECK(cycle_week BETWEEN 1 AND 4)

---

2. team_site_cycle_plan_items (detalle por día, estilo Excel)

Una fila por "celda" del planner: día + tipo (SERVICE/BINS) + valor mostrado.

display_value es un snapshot del número (ej 0.25 / 1.50) para que el planner no "cambie solo" si luego editas el assignment.

assignment_id permite trazabilidad: "este valor vino de esta asignación".

CREATE TABLE `team_site_cycle_plan_items` (
`id` INT NOT NULL AUTO_INCREMENT,
`plan_id` INT NOT NULL,
`assignment_id` INT DEFAULT NULL,
`day_of_week` TINYINT NOT NULL, -- 1..7
`entry_type` ENUM('SERVICE','BINS') NOT NULL,
`display_value` DECIMAL(10,2) NOT NULL,
`item_comment` VARCHAR(255) DEFAULT NULL,
`created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
`updated_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
PRIMARY KEY (`id`),
UNIQUE KEY `uq_plan_day_type` (`plan_id`,`day_of_week`,`entry_type`),
CONSTRAINT `fk_item_plan` FOREIGN KEY (`plan_id`) REFERENCES `team_site_cycle_plan`(`id`) ON DELETE CASCADE,
CONSTRAINT `fk_item_assignment` FOREIGN KEY (`assignment_id`) REFERENCES `team_site_assignments`(`id`),
CONSTRAINT `chk_dow` CHECK (`day_of_week` BETWEEN 1 AND 7)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

Campos de team_site_cycle_plan_items:

| Campo          | Tipo                         | Descripción                                              |
|----------------|------------------------------|----------------------------------------------------------|
| id             | INT AUTO_INCREMENT           | PK                                                       |
| plan_id        | INT NOT NULL                 | FK → team_site_cycle_plan.id (CASCADE DELETE)             |
| assignment_id  | INT NULL                     | FK → team_site_assignments.id (trazabilidad del valor)    |
| day_of_week    | TINYINT NOT NULL             | Día de la semana (1=Lunes … 7=Domingo)                   |
| entry_type     | ENUM('SERVICE','BINS')       | Tipo de entrada                                          |
| display_value  | DECIMAL(10,2) NOT NULL       | Snapshot del valor (horas o pago_bins)                    |
| item_comment   | VARCHAR(255) NULL            | Comentario opcional del item                             |
| created_at     | TIMESTAMP                    | Fecha de creación                                        |
| updated_at     | TIMESTAMP                    | Última actualización                                     |

Restricciones: UNIQUE(plan_id, day_of_week, entry_type), CHECK(day_of_week BETWEEN 1 AND 7)

✅ Permite:

BINS lunes + BINS martes (dos items, distinto day_of_week)

SERVICE viernes (otro item)

SERVICE y BINS el mismo día (dos items con diferente entry_type)

---

Backend (Node/Express) — Reglas de acceso y endpoints
Roles y acceso

Cleaner: puede crear/editar/ver planner solo de su team.

Admin / Manager / Accountant: puede ver (y según tu política, editar) planner de cualquier team.

Cleaner de otro team: NO puede ver ni modificar planner ajeno.

👉 Esto se implementa como:

Auth middleware que añade req.user = { id, role, team_id }

Authorization:

si role ∈ {Admin, Manager, Accountant} → acceso permitido (con scopes si quieres)

si role == Cleaner → permitido solo si team_id coincide con el team_id del plan

Flujo de creación (lo que dijiste: "la crea el cleaner")

Cuando el cleaner agrega un item en el planner:

backend valida que existe team_site_assignments para ese team_id + site_id

según entry_type:

SERVICE → display_value = horas_por_trabajador

BINS → requiere hace_bins=1, display_value = pago_bins

crea/obtiene el team_site_cycle_plan (UPSERT por team_id+site_id+cycle_week)

inserta/actualiza el team_site_cycle_plan_items (UPSERT por plan_id+day_of_week+entry_type)

---

## API Endpoints (implementados)

Base URL: `/api/planner`

### 1. GET /api/planner/:teamId/:cycleWeek

Devuelve la grilla completa del planner para un equipo y semana del ciclo.

**Parámetros URL:**
- `teamId` (number) — ID del equipo
- `cycleWeek` (number) — Semana del ciclo (1–4)

**Headers:** `Authorization: Bearer <token>`

**Acceso:** Todos los roles autenticados. Cleaner solo puede ver su propio equipo.

**Respuesta exitosa (200):**
```json
{
  "plans": [
    {
      "plan_id": 1,
      "site_id": 5,
      "cycle_week": 1,
      "week_comment": "Semana normal",
      "active": 1,
      "direccion_linea1": "123 Main St",
      "suburb": "Richmond",
      "state": "VIC",
      "postcode": "3121",
      "cliente_nombre": "ABC Corp",
      "items": [
        {
          "item_id": 1,
          "plan_id": 1,
          "assignment_id": 10,
          "day_of_week": 1,
          "entry_type": "SERVICE",
          "display_value": "1.50",
          "item_comment": null
        },
        {
          "item_id": 2,
          "plan_id": 1,
          "assignment_id": 10,
          "day_of_week": 1,
          "entry_type": "BINS",
          "display_value": "25.00",
          "item_comment": "Bins extra"
        }
      ]
    }
  ],
  "day_totals": {
    "1": 26.50,
    "3": 2.00
  }
}
```

Si no hay datos: `{ "plans": [], "day_totals": {} }`

---

### 2. POST /api/planner/item

Crea o actualiza un item en el planner. El backend calcula `display_value` desde `team_site_assignments`.

**Headers:** `Authorization: Bearer <token>`

**Acceso:** Todos los roles autenticados. Cleaner solo puede crear items en su propio equipo.

**Body (JSON):**
```json
{
  "team_id": 1,
  "site_id": 5,
  "cycle_week": 1,
  "day_of_week": 1,
  "entry_type": "SERVICE",
  "item_comment": "Comentario opcional"
}
```

| Campo         | Tipo    | Requerido | Descripción                              |
|---------------|---------|-----------|------------------------------------------|
| team_id       | number  | Sí        | ID del equipo                            |
| site_id       | number  | Sí        | ID del sitio                             |
| cycle_week    | number  | Sí        | Semana del ciclo (1–4)                   |
| day_of_week   | number  | Sí        | Día de la semana (1–7, Lun–Dom)          |
| entry_type    | string  | Sí        | "SERVICE" o "BINS"                       |
| item_comment  | string  | No        | Comentario opcional                      |

**Validaciones:**
- `cycle_week` entre 1 y 4
- `day_of_week` entre 1 y 7
- `entry_type` debe ser "SERVICE" o "BINS"
- Debe existir `team_site_assignments` activa para team_id + site_id
- Si `entry_type` = "BINS", el assignment debe tener `hace_bins = 1`

**Respuesta exitosa (201):**
```json
{
  "message": "Item del planner creado/actualizado",
  "plan_id": 1,
  "item_id": 5,
  "entry_type": "SERVICE",
  "display_value": 1.50
}
```

**Errores:**
- 400 — Campos faltantes o inválidos
- 403 — Sin acceso al equipo
- 404 — No existe asignación activa
- 409 — Item duplicado

---

### 3. PATCH /api/planner/plan/:planId

Actualiza el comentario semanal y/o el estado activo de un plan (cabecera).

**Parámetros URL:**
- `planId` (number) — ID del plan

**Headers:** `Authorization: Bearer <token>`

**Acceso:** Todos los roles autenticados. Cleaner solo puede editar planes de su propio equipo.

**Body (JSON):**
```json
{
  "week_comment": "Semana 2: hacer extra fijo",
  "active": true
}
```

| Campo         | Tipo    | Requerido | Descripción                      |
|---------------|---------|-----------|----------------------------------|
| week_comment  | string  | No        | Comentario semanal               |
| active        | boolean | No        | Activo (true) / Inactivo (false) |

Al menos uno de los dos campos debe enviarse.

**Respuesta exitosa (200):**
```json
{
  "message": "Plan actualizado"
}
```

**Errores:**
- 400 — Ningún campo enviado
- 403 — Sin acceso al equipo
- 404 — Plan no encontrado

---

### 4. DELETE /api/planner/item/:itemId

Elimina un item específico del planner. Si el plan queda sin items, se elimina automáticamente el plan padre.

**Parámetros URL:**
- `itemId` (number) — ID del item

**Headers:** `Authorization: Bearer <token>`

**Acceso:** Todos los roles autenticados. Cleaner solo puede eliminar items de su propio equipo.

**Respuesta exitosa (200):**
```json
{
  "message": "Item eliminado"
}
```

**Errores:**
- 403 — Sin acceso al equipo
- 404 — Item no encontrado

---

### 5. GET /api/planner/:teamId/sites

Devuelve los sitios disponibles para un equipo (desde team_site_assignments activas). Útil para el dropdown "Agregar item" en el frontend.

**Parámetros URL:**
- `teamId` (number) — ID del equipo

**Headers:** `Authorization: Bearer <token>`

**Acceso:** Todos los roles autenticados. Cleaner solo puede ver sitios de su propio equipo.

**Respuesta exitosa (200):**
```json
[
  {
    "assignment_id": 10,
    "site_id": 5,
    "horas_por_trabajador": 1.50,
    "hace_bins": 1,
    "pago_bins": 25.00,
    "frecuencia": "semanal",
    "direccion_linea1": "123 Main St",
    "suburb": "Richmond",
    "state": "VIC",
    "postcode": "3121",
    "cliente_nombre": "ABC Corp"
  }
]
```

---

## Archivos del backend

| Archivo                                 | Descripción                                    |
|-----------------------------------------|------------------------------------------------|
| `controllers/planner.controller.js`     | Handlers de todos los endpoints del planner    |
| `routes/planner.routes.js`              | Definición de rutas Express                    |
| `index.js`                              | Registro de `/api/planner` (línea 23)          |

## Rutas registradas

| Método | Ruta                              | Controller            | Descripción                         |
|--------|-----------------------------------|-----------------------|-------------------------------------|
| GET    | /api/planner/:teamId/sites        | ctrl.getTeamSites     | Sitios disponibles del equipo       |
| GET    | /api/planner/:teamId/:cycleWeek   | ctrl.getWeekPlan      | Grilla del planner semanal          |
| POST   | /api/planner/item                 | ctrl.createItem       | Crear/actualizar item               |
| PATCH  | /api/planner/plan/:planId         | ctrl.updatePlan       | Editar cabecera del plan            |
| DELETE | /api/planner/item/:itemId         | ctrl.deleteItem       | Eliminar item                       |

---

Query útil: totales por día (columna "TIEMPO")

sumar display_value por día para semana y team.

El endpoint GET /api/planner/:teamId/:cycleWeek ya devuelve `day_totals` calculado desde el backend.

---

Frontend (React + Vite) — UI tipo Excel
Estructura visual recomendada

Una vista con:

Tabs o selector: Semana 1, 2, 3, 4

Columnas: Lunes…Domingo

Dentro de cada columna: una lista de "cards/rows" con:

nombre del sitio

tipo: SERVICE o BINS (badge)

valor: display_value

comentario (si existe)

Al final de cada columna: Total del día (SUM display_value)

Y además:

Panel lateral / modal "Add item":

seleccionar Site (dropdown con búsqueda) — usar GET /api/planner/:teamId/sites

seleccionar entry_type (SERVICE/BINS)

comentario opcional

(opcional) mostrar "valor estimado" antes de guardar (el endpoint de sites devuelve horas_por_trabajador y pago_bins)

Librerías recomendadas (React + Vite)

MUI (Material UI): ya lo usas, ideal para tablas, tabs, dialogs, chips.

@tanstack/react-query: cache + loading states + mutations limpias para crear/editar items.

react-hook-form + zod: formularios (modal add/edit) y validación.

dnd-kit (opcional): si quieres arrastrar sitios entre días/semanas tipo Excel/Kanban (drag & drop).

date-fns (si luego calculas week-cycle por fecha, aunque tu planner por ahora es manual).

Estado y datos

Mantén un estado por semana: planner[week][day] = items[]

Totales por día se pueden:

calcular en frontend (sum)

o traerlos ya calculados desde backend (mejor para consistencia) — el endpoint GET ya los incluye en `day_totals`

Reglas clave (para que no se rompa)

El planner NO guarda pagos reales; display_value es visual/orden.

display_value se obtiene siempre desde team_site_assignments al crear/editar un item.

Cleaner solo ve/edita su team; Admin/Manager/Accountant pueden ver todo.

UNIQUE(plan_id, day_of_week, entry_type) asegura:

máximo 1 SERVICE y 1 BINS por día por sitio en esa semana

pero permite SERVICE y BINS el mismo día
