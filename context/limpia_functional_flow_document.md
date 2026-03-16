# Documento Funcional Detallado – Sistema Limpia Cleaning

---

# 1. VISIÓN GENERAL DEL SISTEMA

La plataforma de Limpia Cleaning es un sistema web interno diseñado para gestionar:

- Usuarios y roles
- Equipos (máximo 2 miembros por equipo)
- Sitios y asignaciones
- Registro diario de trabajo
- Reportes quincenales automáticos
- Supplies e inventario
- Herramientas y vehículos
- Vacaciones y reemplazos
- Quejas (complaints)
- Comentarios e instrucciones por sitio
- Logs y notificaciones

Este documento describe el funcionamiento paso a paso para facilitar la construcción de las pantallas del sistema.

---

# 2. FLUJO GENERAL DE NAVEGACIÓN

## 2.1 Login

- Email
- Password
- Redirección automática según rol

## 2.2 Dashboard (según rol)

### Admin

- Resumen general:
  - Equipos activos
  - Sitios activos
  - Pedidos pendientes
  - Vacaciones pendientes
  - Quejas abiertas

### Manager

- Inventario
- Pedidos
- Herramientas
- Equipos

### Accountant

- Reportes quincenales
- Sitios y asignaciones
- Resumen financiero

### Cleaner

- Mis sitios de hoy
- Marcar trabajo diario
- Solicitar supplies
- Solicitar vacaciones
- Ver historial

---

# 3. MÓDULO DE USUARIOS

## Crear usuario

Campos:

- Nombre
- Apellido
- Dirección
- Teléfono
- Email
- Tipo de visa
- Fecha vencimiento visa
- Rol (admin, manager, accountant, cleaner)
- Equipo asignado

Reglas:

- Un usuario solo puede pertenecer a un equipo activo
- Cambio de equipo genera registro en user_team_history

Pantallas:

- Lista de usuarios
- Crear / Editar usuario
- Historial de equipo del usuario

---

# 4. MÓDULO DE EQUIPOS

## Crear equipo

- Número de equipo (único, varchar)
- Asignar hasta 2 miembros

Reglas:

- Máximo 2 usuarios por equipo
- Puede tener múltiples sitios

Pantallas:

- Lista de equipos
- Detalle del equipo
  - Miembros
  - Vehículo asignado
  - Herramientas asignadas
  - Sitios asignados

---

# 5. MÓDULO DE SITIOS

## Crear sitio

Campos:

- Dirección_linea1
- Dirección_linea2
- Suburb
- State
- Postcode
- Country
- Latitud
- Longitud
- Cliente asociado
- Contrato
- Información financiera

## Asignar sitio a equipo

Campos:

- Frecuencia
- Horas_por_trabajador
- Hace_bins
- Pago_bins
- Fecha_inicio_efectiva

Pantallas:

- Lista de sitios
- Perfil del sitio
  - Información general
  - Equipos asignados
  - Historial de visitas
  - Comentarios e instrucciones
  - Quejas asociadas

---

# 6. COMENTARIOS E INSTRUCCIONES (site_comments)

Objetivo:
Permitir que cleaners o managers dejen instrucciones importantes.

Campos:

- Sitio
- Autor
- Comentario
- Fecha
- Visibilidad

Pantalla:

- Sección tipo timeline dentro del perfil del sitio

---

# 7. REGISTRO DIARIO DE TRABAJO (daily_site_logs)

## Flujo diario para Cleaner

Pantalla: “Mis sitios de hoy”

Para cada sitio asignado:

- Campo: Horas trabajadas
- Toggle: Solo bins
- Observaciones
- Botón: Marcar como completado

Reglas:

- Solo bins activa interpretación interna como evento bins
- Si horas > horas asignadas → posible extra

Estado:

- Pendiente
- Confirmado

---

# 8. GENERACIÓN DE REPORTE QUINCENAL

Flujo:

1. El sistema consulta daily_site_logs por usuario y rango de fechas
2. Agrupa por sitio
3. Suma horas
4. Detecta bins y extras

Pantalla:

- Vista resumen por sitio
- Total horas
- Total bins
- Botón editar ajustes
- Botón enviar reporte

Solo Accountant puede aprobar.

---

# 9. SUPPLIES E INVENTARIO

## Inventario

Campos:

- Nombre
- Unidad
- Stock actual
- Stock mínimo
- Precio unitario
- Imagen
- Proveedor

Pantallas:

- Lista de inventario
- Crear supply
- Editar supply

## Pedidos

Cleaner:

- Crear pedido
- Agregar productos y cantidad

Manager/Admin:

- Aprobar
- Rechazar
- Marcar como completado

Al completar:

- Descuenta inventario

---

# 10. HERRAMIENTAS Y VEHÍCULOS

## Herramientas

- Nombre
- Estado
- Precio unitario
- Requiere mantenimiento
- Fecha último mantenimiento
- Ubicación (oficina o asignada)

## Vehículos

- Matrícula
- Tipo
- Marca
- Modelo
- Versión
- Comentarios
- Características
- Seguro
- Regos
- Próximo mantenimiento (fecha)
- Equipo asignado

## Historial de servicios de vehículo

Campos por service:
- Auto (snapshot: matrícula, tipo, marca, modelo, versión)
- Equipo (snapshot: número de equipo)
- Fecha de mantenimiento
- Km mantenimiento
- Precio
- Notas

Pantallas:

- Lista
- Asignar a equipo

---

# 11. VACACIONES

Cleaner:

- Solicitar vacaciones
  - Fecha inicio
  - Fecha fin
  - Días

Admin:

- Aprobar/Rechazar
- Asignar reemplazo

Pantalla:

- Calendario general
- Vista por equipo

---

# 12. QUEJAS (COMPLAINTS)

Campos:

- Sitio
- Reportado por
- Categoría
- Severidad
- Estado
- Equipo responsable

Pantallas:

- Lista de quejas
- Filtros por severidad
- Perfil del sitio muestra historial

---

# 13. LOGS Y NOTIFICACIONES

Logs:

- Usuario
- Acción
- Fecha
- Tabla afectada

Notificaciones:

- Cambio de sitio
- Cambio de horas
- Pedido aprobado
- Vacación aprobada

---

# 14. MAPS Y RUTAS

Uso de latitud y longitud almacenadas.

Pantallas futuras:

- Vista mapa diaria
- Ruta sugerida por equipo

---

# 15. RESUMEN DE EXPERIENCIA POR ROL

Admin:
Control total del sistema.

Manager:
Control operativo de inventario y equipos.

Accountant:
Control financiero y revisión de reportes.

Cleaner:
Registro simple y natural de trabajo diario.

---

Este documento define el comportamiento funcional completo actual del sistema y sirve como base para el diseño de todas las pantallas del frontend.
