# Context Document for Codex / Claude Code

## Project: Limpia Cleaning – Internal Management Platform

---

# 1. PROJECT OVERVIEW

This project is a full web-based internal management system for **Limpia Cleaning**, a professional cleaning services company.

The goal of the platform is to centralize operational control including:

- Staff management
- Team assignments
- Site management
- Daily work logging
- Automatic fortnightly reports
- Inventory & supplies management
- Tools & vehicle tracking
- Vacation management
- Complaints tracking
- Financial visibility
- Internal notifications and audit logs

This system is not public-facing. It is an internal operational tool.

---

# 2. TECH STACK

## Frontend

- React
- Material UI
- Component-based architecture
- Reusable UI components
- Centralized theme configuration

## Backend

- Node.js
- Express
- REST API
- Route-based modular architecture (NOT monolithic)

## Database

- MySQL
- Normalized relational schema

---

# 3. FRONTEND ARCHITECTURE

## 3.1 Theme Configuration

There must be a central theme file used across the entire application.

### Light Mode Colors:

- Background: #ffffff
- Primary: #26614f
- Secondary/Surface: #dde7ee
- Text: #000000

### Dark Mode Colors:

- Background: #000000
- Primary: #26614f
- Secondary/Surface: #465a7e66
- Text: #ffffff

All components must use the theme instead of hardcoded colors.

---

## 3.2 Component Structure

The frontend must be modular and reusable.

There must be a `/components` directory and a `/utils` directory.

Reusable components include:

- Cards
- Modals
- Forms
- Buttons
- Tables
- Status badges
- Confirm dialogs
- Toggle switches
- Layout wrappers

Each screen should compose these reusable components instead of redefining structure.

All forms must:

- Support validation
- Be reusable
- Be configurable via props

---

# 4. BACKEND ARCHITECTURE

Express must be organized by feature modules, not one monolithic file.

Example structure:

```
/routes
  users.routes.js
  teams.routes.js
  sites.routes.js
  reports.routes.js
  supplies.routes.js
  tools.routes.js
  vacations.routes.js
  complaints.routes.js

/controllers
  users.controller.js
  teams.controller.js
  ...

/services
  report.service.js
  inventory.service.js

/middleware
  auth.js
  roleGuard.js
```

Routes must follow REST conventions.

Authentication: JWT-based.

Role-based authorization middleware must enforce permissions.

---

# 5. DATABASE STRUCTURE

## Core Tables

### users

- id
- nombre
- apellido
- direccion
- telefono
- email (unique)
- fecha_vencimiento_visa
- tipo_visa
- password_hash
- rol (admin, manager, accountant, cleaner)
- activo

### teams

- id
- numero (Varchar - unique)
- activo

Constraint:

- Maximum 2 active users per team

### user_team_history

- id
- user_id
- team_id
- fecha_inicio
- fecha_fin

### clients

- id
- nombre
- telefono
- direccion
- contacto_nombre
- contacto_email

### sites

- id
- direccion_linea1
- direccion_linea2
- suburb
- state
- postcode
- country
- latitud
- longitud
- cliente_id
- contrato
- finanzas
- activo

### team_site_assignments

- id
- team_id
- site_id
- frecuencia
- horas_por_trabajador
- hace_bins
- pago_bins
- fecha_inicio_efectiva
- activo

### site_comments

- id
- site_id
- autor_user_id
- comentario
- fecha
- visible_para

### daily_site_logs

- id
- user_id
- team_id
- site_id
- fecha
- horas_trabajadas
- solo_bins (boolean)
- observaciones
- estado

### reports

- id
- user_id
- fecha_inicio
- fecha_fin
- estado

Reports are generated from daily_site_logs.

### supplies

- id
- nombre
- descripcion
- unidad
- stock_actual
- stock_minimo
- precio_unitario
- imagen_url
- proveedor_id

### supply_orders

- id
- equipo_id
- user_id
- fecha
- estado

### supply_order_items

- id
- order_id
- supply_id
- cantidad

### tools

- id
- code
- nombre
- descripcion
- requiere_mantenimiento
- fecha_ultimo_mantenimiento
- precio_unitario
- ubicacion
- equipo_id

### cars

- id
- matricula
- tipo
- marca
- modelo
- version
- comentarios
- caracteristicas
- proximo_mantenimiento_fecha
- fecha_rego
- seguro_info
- equipo_id

### car_services

- id
- car_id
- equipo_id
- car_matricula
- car_tipo
- car_marca
- car_modelo
- car_version
- equipo_numero
- fecha_mantenimiento
- km_mantenimiento
- precio
- notas
- created_at

### vacation_requests

- id
- user_id
- fecha_inicio
- fecha_fin
- dias
- estado

### vacation_replacements

- id
- user_id_reemplazado
- user_id_reemplazo
- fecha_inicio
- fecha_fin

### complaints

- id
- site_id
- descripcion
- reportado_por
- categoria
- severidad
- estado
- asignado_team_id
- asignado_user_id

---

# 6. BUSINESS LOGIC PRINCIPLES

1. Cleaners log daily work using `daily_site_logs`.
2. They enter only:
   - horas_trabajadas
   - solo_bins toggle
3. System calculates payment internally.
4. Fortnightly reports are auto-generated from daily logs.
5. Site hour changes only apply from next billing cycle.
6. Inventory decreases only when order is marked completed.
7. All actions should be logged.

---

# 7. WORKFLOW PHILOSOPHY

- Keep UI simple for cleaners.
- Business logic handled in backend.
- Avoid duplicated logic between frontend and backend.
- Use services layer for calculations.
- Ensure scalable structure for future SaaS expansion.

---

# 8. DEVELOPMENT METHODOLOGY

- Work feature by feature.
- Build backend routes first.
- Then integrate frontend screens.
- Use reusable components.
- Keep state minimal and predictable.
- Ensure role-based access control from day one.

---

# 9. OBJECTIVES FOR AI CODING ASSISTANTS

When generating code:

- Follow modular architecture.
- Respect database structure.
- Avoid hardcoded values.
- Keep components reusable.
- Use clear naming conventions.
- Separate concerns (controller vs service).
- Keep logic clean and scalable.

This document defines the authoritative structure and philosophy of the Limpia Cleaning system.

All development decisions must align with this architecture.
