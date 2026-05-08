# DDS · SinapSYS Projects v2.0

**Plataforma de gestión de proyectos multi-metodología — Scrum, PMI o Custom según necesidad**

> Inspirada en bloques de construcción tipo Asana, sin imponer paradigma.

---

| Campo | Valor |
|---|---|
| **Versión** | v2.0 |
| **Estado** | Diseño |
| **Stack** | Laravel 12 + Inertia.js 2 + React 19 + Tailwind v4 + shadcn/ui + MySQL 8 |
| **Fases** | 3 fases secuenciales |
| **Audiencia** | Equipo SinapSYS |
| **Autor** | SinapSYS Ecosistemas SAS de CV |
| **Fecha** | Mayo 2026 |

---

## Tabla de contenidos

1. [Resumen ejecutivo](#1-resumen-ejecutivo)
2. [Análisis del estado actual](#2-análisis-del-estado-actual)
3. [Visión target](#3-visión-target)
4. [Decisiones arquitectónicas (ADRs)](#4-decisiones-arquitectónicas-adrs)
5. [Modelo de datos detallado](#5-modelo-de-datos-detallado)
6. [Backend · Models, Controllers, Services, Requests](#6-backend--models-controllers-services-requests)
7. [Frontend · Pages, Components, Hooks](#7-frontend--pages-components-hooks)
8. [Plan de migración PMI → Sections](#8-plan-de-migración-pmi--sections)
9. [Roadmap de implementación](#9-roadmap-de-implementación)
10. [Riesgos técnicos y mitigaciones](#10-riesgos-técnicos-y-mitigaciones)
11. [Pendientes y decisiones abiertas](#11-pendientes-y-decisiones-abiertas)

---

## 1. Resumen ejecutivo

### El problema

SinapSYS Projects v1 está diseñada exclusivamente bajo metodología **PMI** (Inicio → Planificación → Ejecución → Monitoreo → Cierre). Cuando aparece un proyecto que requiere **Scrum** (sprints, user stories con story points, sprint goals, burndown, velocity), la plataforma no puede modelarlo correctamente. Forzar Scrum dentro del modelo PMI obliga a workarounds que comprometen la trazabilidad y los reportes.

El detonador concreto es el proyecto **EF-Ai360** (cliente Estructurar Futuro), planificado en Scrum con 10 sprints de 2 semanas. Cargarlo en SinapSYS Projects v1 obliga a perder estructura de sprints o a duplicar conceptos.

### La solución elegida — Camino C

**Plataforma multi-metodología basada en bloques de construcción**, inspirada en Asana. La metodología no se impone en el modelo de datos — se configura por proyecto mediante templates y campos personalizados.

El usuario elige metodología al crear el proyecto (Scrum, PMI o Custom). Internamente, todos los proyectos usan los mismos bloques: **Project → Sections → Tasks → Steps**. Los Custom Fields y la vista por defecto cambian según template, pero el modelo es uno solo.

### Lo que cambia

#### Modelo de datos
- `phase_tasks` JSON → tabla `sections` normalizada
- `steps` JSON → tabla `task_steps` normalizada
- Nueva tabla `custom_fields` y `custom_field_values`
- Nueva tabla `methodology_templates` (template aplicado)
- Nueva tabla `project_role_definitions` (roles configurables)
- `projects.methodology` (scrum / pmi / custom)
- `projects.default_view` (list / board / timeline / calendar)

#### UI / UX
- Selector de metodología al crear proyecto
- Vista **Board (Kanban)** alterna a vista List
- Vista **Timeline** tipo Gantt
- Editor de Sections con drag-and-drop
- Editor de Custom Fields por proyecto
- Reportes específicos: Burndown, Velocity (Scrum) · RadarChart, Matriz (PMI)
- Templates pre-configurados en wizard de creación

### Lo que se mantiene

- Toda la stack actual: Laravel 12 + Inertia + React 19 + Tailwind v4 + shadcn/ui + MySQL 8
- Reglas no negociables del CLAUDE.md (Inertia render, Form Requests, dark mode, Anthropic backend, 300 líneas máx por componente)
- Asistente IA por proyecto con Claude (contexto-aware)
- Login OTP passwordless + tradicional
- Exports PDF y Excel
- Calendar mensual/semanal
- Vista Foco para todas las tareas cross-project
- Funcionalidades PMI completas: RadarChart de Viabilidad, Matriz de Priorización (Eisenhower)

### Hallazgos críticos

> ⚠️ **Regla derogada del CLAUDE.md**
>
> La regla *"Phase tasks son JSON en projects.phase_tasks. No entidades separadas"* queda **DEROGADA** por este DDS. El nuevo modelo requiere `sections` como tabla real para soportar Sprint Goal, drag-drop, métricas y migración automática.

> ✅ **Compatibilidad hacia atrás garantizada**
>
> Los proyectos PMI cargados se migran automáticamente a Sections. La UI mantiene el aspecto y comportamiento PMI cuando el proyecto tiene `methodology = 'pmi'`. Cero acción del usuario requerida.

> 📋 **Fases del DDS**
>
> - **Fase 1 (MVP):** Sections normalizadas + Custom Fields básicos + vista Board. Tiempo estimado: 5-7 días.
> - **Fase 2:** Templates de metodología + roles configurables + wizard de creación. Tiempo estimado: 4-6 días.
> - **Fase 3:** Vistas avanzadas (Timeline/Gantt) + reportes Scrum (Burndown, Velocity) + reportes cross-project. Tiempo estimado: 6-8 días.
> - **Total estimado:** 15-21 días de desarrollo (3-4 semanas calendario con 1 dev senior).

---

## 2. Análisis del estado actual

Modelo de datos, controllers y componentes que existen hoy en SinapSYS Projects v1, basado en CLAUDE.md y el README del repo.

### Tablas actuales (confirmadas con el usuario)

| Tabla | Campos clave | Notas |
|---|---|---|
| `projects` | id, name, type, description, fase, prioridad, impacto, esfuerzo, viability_mercado, viability_financiero, viability_tecnico, viability_riesgo, color, tags (JSON), links (JSON), sort_order, url_xampp, phase_tasks (JSON), owner_id, deleted_at | Soft delete activo. Phase tasks como JSON. |
| `tasks` | id, project_id, title, prioridad, due_date, done (bool), assigned_to, estimated_time, notes, completed_at, steps (JSON) | Hard delete. Steps embebidos como JSON. |
| `project_members` | id, project_id, user_id, role (manager / contributor / viewer), invited_by, invitation_email, invitation_token, accepted_at | 3 roles fijos. Owner está en projects.owner_id. |
| `ai_messages` | id, project_id, role (user / assistant), content, created_at | Historial de chat por proyecto. |
| `users` | id, name, email, phone, password, is_admin, ... | Estándar Laravel + extras. |
| `login_otps` | id, identifier, code, expires_at, used_at | OTP para login passwordless. |
| `sessions, cache, jobs` | — | Infraestructura Laravel. |

### Limitaciones identificadas

#### Limitación 1 · Phase tasks como JSON
No permite reordenar fases con drag-drop persistente, agregar metadata a la fase (sprint goal, fechas), ni reportar por fase de manera eficiente con SQL nativo.

#### Limitación 2 · Steps como JSON
Los pasos de una tarea no pueden asignarse a personas distintas, no tienen fecha propia, y no se pueden reportar globalmente.

#### Limitación 3 · Roles fijos en BD
3 roles hard-coded (manager / contributor / viewer). No se puede crear un rol "Scrum Master" o "Stakeholder" sin migration.

#### Limitación 4 · Una sola metodología
Modelo PMI hard-coded en columnas (fase, viability_*). Imposible cargar un proyecto Scrum sin perder estructura.

#### Limitación 5 · Una sola vista
Solo vista List + Calendar + Matrix. No hay Board (Kanban) ni Timeline (Gantt). Limita la usabilidad para equipos ágiles.

#### Limitación 6 · Sin Custom Fields
No se pueden agregar campos personalizados por proyecto (story points, sprint goal, etiquetas custom, fields de cualquier tipo).

---

## 3. Visión target

Modelo conceptual nuevo basado en bloques reutilizables, inspirado en Asana express.

### Modelo conceptual de bloques

```
┌─────────────────────────────────────────────────────────────────┐
│                          PROJECT                                │
│   Contenedor principal · methodology · default_view · owner     │
│                  members · custom_fields                        │
└──────────────────┬──────────────────────────┬───────────────────┘
                   │                          │
        ┌──────────▼─────────────┐  ┌─────────▼──────────────────┐
        │       SECTION          │  │     CUSTOM FIELD           │
        │  Agrupador horizontal  │  │  Campos arbitrarios        │
        │  Sirve como Sprint     │  │  por proyecto              │
        │  o Fase                │  │                            │
        │  name · order ·        │  │  name · type ·             │
        │  sprint_goal ·         │  │  required · order          │
        │  start_date ·          │  │  applies_to                │
        │  end_date              │  │                            │
        └──────────┬─────────────┘  └────────────────────────────┘
                   │
        ┌──────────▼──────────────────────────────────────────────┐
        │                       TASK                              │
        │   Unidad de trabajo · pertenece a un Section            │
        │   assigned_to · status · due_date · prioridad           │
        │   estimated_time · notes · custom_field_values          │
        └──────────┬─────────────────────────┬─────────────────────┘
                   │                         │
        ┌──────────▼────────────┐  ┌─────────▼──────────────────┐
        │      TASK STEP        │  │      AI MESSAGE            │
        │  Subtarea dentro      │  │  Chat IA por proyecto      │
        │  de una Task          │  │  context-aware             │
        │  description · done · │  │  role · content            │
        │  order · assigned_to  │  │                            │
        └───────────────────────┘  └────────────────────────────┘
```

### Cómo se usa en Scrum vs PMI vs Custom

| Bloque | En Scrum | En PMI | En Custom |
|---|---|---|---|
| **Project** | Proyecto Scrum | Proyecto PMI | Lo que el usuario decida |
| **Section** | Sprint (S0-S9) | Fase PMI (Inicio, Planif, Ejec, Monit, Cierre) | Lo que el usuario configure |
| **Task** | User Story | Tarea PMI | Item genérico |
| **Task Step** | Subtarea técnica | Sub-paso del checklist | Sub-item |
| **Custom Fields** | story_points, sprint_goal, risk_level | impacto, esfuerzo, viabilidad_* | Cualquier campo |
| **Vista por defecto** | Board (Kanban) | List + Matrix | List |
| **Reportes** | Burndown, Velocity | RadarChart, Matriz Eisenhower | Genéricos |

### Principios de diseño

#### 1 · Modelo único, vistas múltiples
Un solo modelo de datos sirve a todas las metodologías. La diferencia visual está en templates, vistas y custom fields, no en tablas separadas.

#### 2 · Compatibilidad hacia atrás
Cero acción del usuario requerida tras la actualización. Los proyectos PMI v1 se migran automáticamente y se ven igual.

#### 3 · Metodología por configuración
El usuario elige metodología via wizard al crear proyecto. La metodología es un atributo del proyecto, no una propiedad inmutable.

#### 4 · Reportes contextuales
Burndown solo aparece si el proyecto tiene custom field `story_points`. RadarChart solo aparece si tiene viability_*. Sin pollución cruzada.

---

## 4. Decisiones arquitectónicas (ADRs)

Decisiones clave registradas con justificación. Usar como referencia ante dudas de implementación.

### ADR-001 · Sections como tabla normalizada

**Estado:** Accepted

**Decisión:** Reemplazar el campo `phase_tasks` JSON en projects por una tabla `sections` normalizada con FK a project.

**Justificación:** Sections necesitan metadatos propios (sprint_goal, fechas, owner), drag-and-drop con persistencia eficiente, y queries SQL para reportes (Burndown por sprint, distribución de tasks por fase). JSON embebido lo imposibilita.

**Trade-off:** Deroga la regla "phase_tasks JSON" del CLAUDE.md. Costo: 1 migration + 1 controller + 1 service. Beneficio: arquitectura limpia y escalable.

### ADR-002 · Steps como tabla normalizada

**Estado:** Accepted

**Decisión:** Reemplazar el campo `steps` JSON en tasks por una tabla `task_steps` con FK a task.

**Justificación:** Aunque steps simples bastan con JSON, normalizarlos abre la puerta a: asignación independiente, fechas por step, reportes globales, y consistencia con sections.

**Trade-off:** +1 tabla. Beneficio: simetría con sections + extensibilidad futura.

### ADR-003 · Custom Fields como entidad polimórfica

**Estado:** Accepted

**Decisión:** Crear tabla `custom_fields` (definición) + `custom_field_values` (valores polimórficos asignables a Project, Section, Task o Step).

**Justificación:** Una sola tabla de definición + una de valores soporta todas las metodologías y entidades. Tipos soportados: text, number, date, select, multi-select, boolean, url.

**Trade-off:** Queries con joins polimórficos. Beneficio: flexibilidad infinita sin migrations adicionales.

### ADR-004 · Roles configurables por proyecto

**Estado:** Accepted

**Decisión:** Crear tabla `project_role_definitions` con permisos granulares. La columna `role` en `project_members` deja de ser ENUM y referencia esta tabla por nombre.

**Justificación:** Cada proyecto puede definir roles propios (Scrum Master, Product Owner, Stakeholder, Auditor, etc.) con permisos específicos. Roles default vienen pre-cargados (manager, contributor, viewer).

### ADR-005 · Templates de metodología como seeds

**Estado:** Accepted

**Decisión:** Templates Scrum / PMI / Custom como datos seed (no como tablas hard-coded). Tabla `methodology_templates` contiene su definición JSON.

**Justificación:** Permite agregar templates futuros (Kanban, OKR, GTD) sin migrations. Cada template define: sections iniciales, custom fields, vista por defecto, roles default.

### ADR-006 · Migración PMI → Sections automática

**Estado:** Accepted

**Decisión:** Script de migración convierte cada proyecto PMI existente: las 5 fases PMI (Inicio, Planificación, Ejecución, Monitoreo, Cierre) se vuelven 5 records en `sections`. El contenido de `phase_tasks` JSON se distribuye apropiadamente.

**Justificación:** Cero acción del usuario. Compatibilidad hacia atrás garantizada. La migración es idempotente y reversible.

### ADR-007 · Vista Board sobre el mismo modelo de Tasks

**Estado:** Accepted

**Decisión:** La vista Board (Kanban) NO requiere modelo de datos separado. Usa Sections como columnas y Tasks como cards. Un toggle en la UI cambia entre List ↔ Board ↔ Timeline ↔ Calendar sin recargar datos.

**Justificación:** Simplicidad. Un solo modelo, múltiples renders. Drag-and-drop en Board actualiza `section_id` de la task vía endpoint.

### ADR-008 · Reportes específicos por metodología solo si hay datos

**Estado:** Accepted

**Decisión:** Burndown chart aparece SOLO si el proyecto tiene custom field `story_points` definido. RadarChart de Viabilidad aparece SOLO si tiene los 4 viability_*. La UI revisa la presencia de datos, no la metodología.

**Justificación:** Evita pollución de UI. Permite que un proyecto Scrum agregue RadarChart si quiere, o un proyecto Custom defina sus propios reportes.

### ADR-009 · Mantener stack actual sin cambios

**Estado:** Accepted

**Decisión:** No upgrade de framework, no nuevas librerías mayores. Solo agregar lo necesario: `react-beautiful-dnd` o `@dnd-kit/core` para drag-and-drop de Sections/Cards.

**Justificación:** Minimizar superficie de cambio. La feature requested es funcional, no técnica.

---

## 5. Modelo de datos detallado

Modelo target completo. Tablas existentes que se mantienen, tablas nuevas, tablas modificadas.

### Diagrama relacional

```
┌─────────────────────┐         ┌──────────────────────┐         ┌────────────────────┐
│     projects        │ 1     N │    sections (NEW)    │ 1     N │       tasks        │
├─────────────────────┤────────►├──────────────────────┤────────►├────────────────────┤
│ id (PK)             │         │ id (PK)              │         │ id (PK)            │
│ name, type, desc    │         │ project_id → projects│         │ project_id         │
│ methodology (NEW)   │         │ name, description    │         │ section_id (NEW)   │
│ default_view (NEW)  │         │ order (int)          │         │ title, prioridad   │
│ template_id (NEW)   │         │ sprint_goal (text)   │         │ due_date, done     │
│ prioridad, color    │         │ start_date, end_date │         │ assigned_to        │
│ tags, links         │         │ color, status        │         │ estimated_time     │
│ impacto, esfuerzo   │         │ timestamps           │         │ notes              │
│ viability_* (4)     │         └──────────────────────┘         │ completed_at       │
│ owner_id → users    │                                          │ order_in_section   │
│ deleted_at          │                                          │ status (NEW)       │
└─────────┬───────────┘                                          │ timestamps         │
          │                                                       └─────────┬──────────┘
          │ 1                                                              │ 1
          │                                                                │
          │ N                                                              │ N
          ▼                                                                ▼
┌──────────────────────────┐                                  ┌────────────────────────┐
│   custom_fields (NEW)    │                                  │   task_steps (NEW)     │
├──────────────────────────┤                                  ├────────────────────────┤
│ id (PK)                  │                                  │ id (PK)                │
│ project_id → projects    │                                  │ task_id → tasks        │
│ name, slug               │                                  │ description, done      │
│ field_type               │                                  │ order (int)            │
│ applies_to (enum)        │                                  │ assigned_to → users    │
│ options (JSON)           │                                  │ due_date (nullable)    │
│ required, order          │                                  │ completed_at           │
│ timestamps               │                                  │ timestamps             │
└────────┬─────────────────┘                                  └────────────────────────┘
         │ 1
         │
         │ N
         ▼
┌──────────────────────────────┐
│  custom_field_values (NEW)   │
├──────────────────────────────┤
│ id (PK)                      │
│ custom_field_id              │
│ target_type (poly)           │
│ target_id (poly)             │
│ value (text/JSON)            │
│ timestamps                   │
└──────────────────────────────┘

┌────────────────────────────────┐         ┌──────────────────────────┐
│  methodology_templates (NEW)   │         │  project_role_def (NEW)  │
├────────────────────────────────┤         ├──────────────────────────┤
│ id (PK)                        │         │ id (PK)                  │
│ slug (scrum/pmi/custom)        │         │ project_id → projects    │
│ name, description              │         │ name (e.g. Scrum Master) │
│ default_sections (JSON)        │         │ permissions (JSON)       │
│ default_fields (JSON)          │         │ is_default, order        │
│ default_view                   │         │ timestamps               │
│ default_roles (JSON)           │         └──────────────────────────┘
│ timestamps                     │
└────────────────────────────────┘

┌──────────────────────────────────┐
│  project_members (modified)      │
├──────────────────────────────────┤
│ id (PK)                          │
│ project_id → projects            │
│ user_id → users                  │
│ role_definition_id (NEW)         │
│ role (DEPRECATED, kept)          │
│ invited_by, invitation_*         │
└──────────────────────────────────┘
```

### Migrations · tablas nuevas

#### create_methodology_templates_table

```php
Schema::create('methodology_templates', function (Blueprint $table) {
    $table->id();
    $table->string('slug')->unique();              // scrum, pmi, custom, kanban, okr
    $table->string('name');
    $table->text('description')->nullable();
    $table->json('default_sections');              // [{name, order, sprint_goal?}]
    $table->json('default_fields');                // [{name, type, applies_to}]
    $table->string('default_view')->default('list');  // list, board, timeline, calendar
    $table->json('default_roles');                 // [{name, permissions}]
    $table->timestamps();
});
```

#### create_sections_table

```php
Schema::create('sections', function (Blueprint $table) {
    $table->id();
    $table->foreignId('project_id')->constrained()->cascadeOnDelete();
    $table->string('name');
    $table->text('description')->nullable();
    $table->text('sprint_goal')->nullable();
    $table->date('start_date')->nullable();
    $table->date('end_date')->nullable();
    $table->string('color', 7)->nullable();
    $table->enum('status', ['planned', 'active', 'completed'])->default('planned');
    $table->integer('order')->default(0);
    $table->timestamps();

    $table->index(['project_id', 'order']);
});
```

#### create_task_steps_table

```php
Schema::create('task_steps', function (Blueprint $table) {
    $table->id();
    $table->foreignId('task_id')->constrained()->cascadeOnDelete();
    $table->string('description');
    $table->boolean('done')->default(false);
    $table->integer('order')->default(0);
    $table->foreignId('assigned_to')->nullable()->constrained('users');
    $table->date('due_date')->nullable();
    $table->timestamp('completed_at')->nullable();
    $table->timestamps();

    $table->index(['task_id', 'order']);
});
```

#### create_custom_fields_tables

```php
Schema::create('custom_fields', function (Blueprint $table) {
    $table->id();
    $table->foreignId('project_id')->constrained()->cascadeOnDelete();
    $table->string('name');
    $table->string('slug');
    $table->enum('field_type', ['text', 'number', 'date', 'select', 'multi_select', 'boolean', 'url']);
    $table->enum('applies_to', ['project', 'section', 'task', 'task_step']);
    $table->json('options')->nullable();        // para select/multi_select
    $table->boolean('required')->default(false);
    $table->integer('order')->default(0);
    $table->timestamps();

    $table->unique(['project_id', 'slug']);
});

Schema::create('custom_field_values', function (Blueprint $table) {
    $table->id();
    $table->foreignId('custom_field_id')->constrained()->cascadeOnDelete();
    $table->morphs('target');                  // target_type + target_id
    $table->text('value')->nullable();         // para text, number, date, url, boolean
    $table->json('value_json')->nullable();    // para multi_select
    $table->timestamps();

    $table->index(['target_type', 'target_id']);
});
```

#### create_project_role_definitions_table

```php
Schema::create('project_role_definitions', function (Blueprint $table) {
    $table->id();
    $table->foreignId('project_id')->constrained()->cascadeOnDelete();
    $table->string('name');                    // e.g. Scrum Master, PO, Stakeholder
    $table->json('permissions');               // {can_edit_project, can_invite, ...}
    $table->boolean('is_default')->default(false);
    $table->integer('order')->default(0);
    $table->timestamps();

    $table->unique(['project_id', 'name']);
});
```

### Migrations · tablas modificadas

#### alter_projects_add_methodology_columns

```php
Schema::table('projects', function (Blueprint $table) {
    $table->string('methodology')->default('pmi')->after('type');
    $table->string('default_view')->default('list')->after('methodology');
    $table->foreignId('template_id')->nullable()->constrained('methodology_templates');
    // phase_tasks JSON se mantiene durante 1 release deprecation, luego se elimina
});
```

#### alter_tasks_add_section

```php
Schema::table('tasks', function (Blueprint $table) {
    $table->foreignId('section_id')->nullable()->after('project_id')
          ->constrained()->nullOnDelete();
    $table->integer('order_in_section')->default(0);
    $table->enum('status', ['todo', 'in_progress', 'done', 'blocked'])
          ->default('todo');
    // done (boolean) se mantiene; status agrega granularidad
    // steps JSON se mantiene durante deprecation
    $table->index(['section_id', 'order_in_section']);
});
```

#### alter_project_members_add_role_definition

```php
Schema::table('project_members', function (Blueprint $table) {
    $table->foreignId('role_definition_id')->nullable()
          ->constrained('project_role_definitions');
    // role (string) se mantiene como deprecated, sincronizado con role_definition
});
```

### Tablas que se mantienen sin cambios

- `users` — sin cambios
- `ai_messages` — sin cambios
- `login_otps` — sin cambios
- `sessions, cache, jobs` — infraestructura Laravel sin cambios

---

## 6. Backend · Models, Controllers, Services, Requests

Estructura de código backend siguiendo las convenciones de SinapSYS Projects.

### Modelos Eloquent

#### Modelos NUEVOS

- `app/Models/Section.php` — relaciones: belongsTo Project, hasMany Task, morphMany CustomFieldValue
- `app/Models/TaskStep.php` — relaciones: belongsTo Task, belongsTo User (assigned_to)
- `app/Models/CustomField.php` — relaciones: belongsTo Project, hasMany CustomFieldValue
- `app/Models/CustomFieldValue.php` — relaciones: belongsTo CustomField, morphTo target
- `app/Models/MethodologyTemplate.php` — relaciones: hasMany Project
- `app/Models/ProjectRoleDefinition.php` — relaciones: belongsTo Project, hasMany ProjectMember

#### Modelos MODIFICADOS

- `Project` — agregar relaciones: hasMany Section, hasMany CustomField, hasMany RoleDefinition · agregar accessor: `activeView` · agregar scope: `scrum()`, `pmi()`
- `Task` — agregar belongsTo Section · agregar hasMany TaskStep · agregar morphMany CustomFieldValue · scope `byStatus()`
- `ProjectMember` — agregar belongsTo ProjectRoleDefinition

### Controllers nuevos (Inertia)

| Controller | Endpoints | Ruta |
|---|---|---|
| `SectionController` | index, store, update, destroy, reorder | `/projects/{p}/sections` |
| `TaskStepController` | store, update, destroy, reorder, toggle | `/tasks/{t}/steps` |
| `CustomFieldController` | index, store, update, destroy, reorder | `/projects/{p}/custom-fields` |
| `CustomFieldValueController` | upsert, destroy | `/custom-field-values` |
| `MethodologyTemplateController` | index, show | `/templates` |
| `ProjectRoleController` | index, store, update, destroy | `/projects/{p}/roles` |
| `BoardViewController` | show, moveTask | `/projects/{p}/board` |
| `TimelineViewController` | show | `/projects/{p}/timeline` |
| `BurndownReportController` | show | `/projects/{p}/reports/burndown` |
| `VelocityReportController` | show | `/projects/{p}/reports/velocity` |

### Services (lógica de negocio)

#### Services NUEVOS

- `ProjectFromTemplate` — crea proyecto desde un template (sections, fields, roles iniciales)
- `SectionReorder` — drag-drop persistencia de orden
- `TaskMover` — mover task entre sections (con drag-drop en Board)
- `BurndownCalculator` — calcula puntos restantes vs ideal por sprint
- `VelocityCalculator` — promedio de story points completados por sprint
- `CustomFieldResolver` — recupera valores con tipos correctos por entidad

#### Services existentes a actualizar

- `Anthropic` — extender contexto del chat IA con: sections del proyecto, custom fields definidos, métricas Scrum si aplica
- `Export` — agregar formato Burndown PDF, Velocity PDF, Sprint Report
- `PriorityMatrix` — sin cambios (sigue usando impacto/esfuerzo)

### Form Requests

Siguiendo regla CLAUDE.md: validación SOLO en Form Requests, nunca en controllers.

- `StoreSectionRequest`, `UpdateSectionRequest`, `ReorderSectionsRequest`
- `StoreTaskStepRequest`, `UpdateTaskStepRequest`
- `StoreCustomFieldRequest`, `UpsertCustomFieldValueRequest`
- `CreateProjectFromTemplateRequest`
- `StoreProjectRoleRequest`, `UpdateProjectRoleRequest`
- `MoveTaskRequest` (Board drag-drop)

### Routes (resources/routes/web.php)

```php
Route::middleware(['auth'])->group(function () {
    // Sections
    Route::resource('projects.sections', SectionController::class);
    Route::post('projects/{project}/sections/reorder', [SectionController::class, 'reorder']);

    // Task Steps
    Route::resource('tasks.steps', TaskStepController::class)->except(['index', 'show']);
    Route::patch('tasks/{task}/steps/{step}/toggle', [TaskStepController::class, 'toggle']);

    // Custom Fields
    Route::resource('projects.custom-fields', CustomFieldController::class);
    Route::post('custom-field-values', [CustomFieldValueController::class, 'upsert']);

    // Templates
    Route::get('templates', [MethodologyTemplateController::class, 'index']);
    Route::post('projects/from-template', [ProjectController::class, 'storeFromTemplate']);

    // Vistas alternativas
    Route::get('projects/{project}/board', [BoardViewController::class, 'show']);
    Route::patch('projects/{project}/board/move-task', [BoardViewController::class, 'moveTask']);
    Route::get('projects/{project}/timeline', [TimelineViewController::class, 'show']);

    // Reportes Scrum
    Route::get('projects/{project}/reports/burndown', [BurndownReportController::class, 'show']);
    Route::get('projects/{project}/reports/velocity', [VelocityReportController::class, 'show']);

    // Roles configurables
    Route::resource('projects.roles', ProjectRoleController::class);
});
```

---

## 7. Frontend · Pages, Components, Hooks

Estructura React siguiendo convenciones de SinapSYS Projects (un componente por archivo, max 300 líneas, path alias @/).

### Páginas Inertia

| Ruta | Page component | Notas |
|---|---|---|
| `/projects/create` | `Pages/Projects/CreateWizard.jsx` | Wizard 3 pasos: template → datos → confirmar |
| `/projects/{p}` | `Pages/Projects/Show.jsx` | Refactor: incluye toggle de vista (List/Board/Timeline) |
| `/projects/{p}/board` | `Pages/Projects/BoardView.jsx` | Kanban con sections como columnas |
| `/projects/{p}/timeline` | `Pages/Projects/TimelineView.jsx` | Gantt simple con sections en eje Y |
| `/projects/{p}/sections` | `Pages/Sections/Index.jsx` | Editor de sections con drag-drop |
| `/projects/{p}/custom-fields` | `Pages/CustomFields/Index.jsx` | Editor de campos personalizados |
| `/projects/{p}/roles` | `Pages/Roles/Index.jsx` | Editor de roles configurables |
| `/projects/{p}/reports/burndown` | `Pages/Reports/Burndown.jsx` | Recharts LineChart |
| `/projects/{p}/reports/velocity` | `Pages/Reports/Velocity.jsx` | Recharts BarChart histórico |
| `/templates` | `Pages/Templates/Index.jsx` | Galería de templates |

### Componentes React clave

#### Components/Sections/
- `SectionList.jsx` — lista vertical con drag-drop
- `SectionCard.jsx` — card individual con name, dates, sprint_goal
- `SectionEditor.jsx` — modal de edición
- `SectionReorderable.jsx` — wrapper @dnd-kit

#### Components/Board/
- `BoardColumn.jsx` — columna por section
- `BoardCard.jsx` — task como card
- `BoardDragLayer.jsx` — overlay durante drag
- `BoardFilters.jsx` — filtros por assignee, prioridad, custom field

#### Components/Timeline/
- `TimelineGantt.jsx` — vista Gantt simple
- `TimelineRow.jsx` — fila por section o task
- `TimelineHeader.jsx` — escala de fechas

#### Components/CustomFields/
- `CustomFieldEditor.jsx` — define campo (name, type, options)
- `CustomFieldValueInput.jsx` — input dinámico según tipo
- `CustomFieldDisplay.jsx` — render readonly

#### Components/CreateWizard/
- `StepTemplate.jsx` — paso 1: galería de templates
- `StepProjectData.jsx` — paso 2: name, description, dates
- `StepConfirm.jsx` — paso 3: preview de sections + fields
- `WizardNav.jsx` — navegación + breadcrumb

#### Components/Reports/
- `BurndownChart.jsx` — Recharts LineChart con ideal vs real
- `VelocityChart.jsx` — Recharts BarChart histórico
- `SprintReportCard.jsx` — resumen del sprint

### Hooks personalizados

- `useDragDrop()` — abstrae @dnd-kit para sections y board
- `useCustomFields(projectId)` — fetcha definiciones del proyecto
- `useMethodologyView(project)` — devuelve la vista correcta según project.default_view
- `useBurndown(projectId, sectionId)` — calcula datos del chart

### Librerías nuevas a instalar

- `@dnd-kit/core` + `@dnd-kit/sortable` — drag-and-drop moderno (reemplazo de react-beautiful-dnd)
- `date-fns` — manejo de fechas para Timeline (si no está ya)

> **NO se instala:** ninguna librería de Gantt completa. La Timeline se construye con CSS Grid + componentes propios para mantener control y dark mode consistente.

---

## 8. Plan de migración PMI → Sections

Script automático de migración de datos. Idempotente, reversible, sin downtime.

### Estrategia general

> **Filosofía: cero acción del usuario**
>
> Tras desplegar v2.0, todos los proyectos PMI existentes deben verse y funcionar idénticamente, pero internamente con el nuevo modelo. El usuario no tiene que hacer NADA. La migración corre en deploy y es invisible.

### Pasos del script de migración

1. **Crear templates por defecto.** Seed que inserta en `methodology_templates` los 3 templates iniciales: scrum, pmi, custom.

2. **Asignar template PMI a proyectos existentes.** Update masivo: `UPDATE projects SET methodology = 'pmi', template_id = (SELECT id FROM methodology_templates WHERE slug = 'pmi')`

3. **Crear roles default por proyecto.** Para cada proyecto, insertar 3 records en `project_role_definitions`: manager, contributor, viewer (con permisos default).

4. **Crear sections desde fases PMI.** Para cada proyecto, crear 5 sections:

   ```php
   // Para cada project en projects:
   foreach (['Inicio', 'Planificación', 'Ejecución', 'Monitoreo', 'Cierre'] as $i => $name) {
       Section::create([
           'project_id' => $project->id,
           'name' => $name,
           'order' => $i,
           'status' => $project->fase === $name ? 'active' : 'planned',
       ]);
   }
   ```

5. **Migrar phase_tasks JSON a custom_field_values.** Cada checkitem del JSON pasa a ser un task_step de una task implícita por fase, o a un custom_field si es metadata.

6. **Migrar task.steps JSON a task_steps.** Para cada task, parsear su JSON y crear records en task_steps preservando orden y estado `done`.

7. **Asignar task.section_id.** Cada task se asocia con la section "Ejecución" por default (o la fase del proyecto si está específicamente marcada).

8. **Crear custom fields de viabilidad PMI.** Para cada proyecto, crear 4 custom fields: `viability_mercado`, `viability_financiero`, `viability_tecnico`, `viability_riesgo` aplicables al project. Los valores existentes en `projects.viability_*` se copian a `custom_field_values`.

9. **Sincronizar role con role_definition_id.** Para cada record en project_members, mapear el string role al record correspondiente en project_role_definitions.

10. **Verificar integridad.** Comando artisan que valida: cada proyecto tiene sections, cada task tiene section_id, cada step migrado coincide con el JSON original.

### Comando artisan

```bash
php artisan sinapsys:migrate-to-v2 {--dry-run}

# Output esperado:
Migrating 12 projects to v2.0...
✓ Templates seeded
✓ 12 projects assigned PMI template
✓ 36 role definitions created
✓ 60 sections created from PMI phases
✓ 187 tasks linked to sections
✓ 423 task steps migrated from JSON
✓ 48 custom fields created (viability_*)
✓ 48 custom field values copied
✓ Integrity check passed

Migration complete in 12.4s.
```

### Plan de rollback

> ⚠️ **Si algo sale mal post-deploy**
>
> 1. Las tablas viejas (`phase_tasks JSON` en projects, `steps JSON` en tasks) se mantienen por 1 release. Esto es deliberado para tener fallback.
>
> 2. Comando artisan `php artisan sinapsys:rollback-v2` revierte: drop de sections, task_steps, custom_*, restaurar projects.fase desde sections.active. Datos JSON intactos.
>
> 3. Después de 1 release de validación exitosa, ejecutar `php artisan sinapsys:cleanup-v1-fields` para eliminar columnas JSON deprecated.

---

## 9. Roadmap de implementación

3 fases secuenciales. Cada fase es entregable independiente y deja la plataforma funcional.

### Fase 1 · Mínimo viable Scrum (5-7 días)

**Objetivo:** Habilitar Scrum básico para EF-Ai360. Sections normalizadas + Custom Fields + vista Board. PMI sigue funcionando sin cambios visibles.

**Entregables:**
- Migrations: methodology_templates, sections, task_steps, custom_fields, custom_field_values
- Migration alter: projects (methodology, default_view, template_id), tasks (section_id, status, order_in_section)
- Models nuevos + relaciones en Project y Task
- Controllers: SectionController, TaskStepController, CustomFieldController, BoardViewController
- Service: SectionReorder, TaskMover
- Pages: BoardView.jsx, edit Show.jsx con toggle List ↔ Board
- Components: BoardColumn, BoardCard, SectionList, CustomFieldEditor
- Script de migración PMI → Sections (artisan command)
- Seeds: 3 templates iniciales (scrum, pmi, custom)

### Fase 2 · Templates + Roles configurables (4-6 días)

**Objetivo:** Wizard de creación de proyecto con selección de metodología. Roles configurables por proyecto.

**Entregables:**
- Migration: project_role_definitions
- Controllers: MethodologyTemplateController, ProjectRoleController
- Service: ProjectFromTemplate
- Pages: CreateWizard.jsx (3 pasos), Templates/Index.jsx, Roles/Index.jsx
- Components: StepTemplate, StepProjectData, StepConfirm, WizardNav
- Form Requests: CreateProjectFromTemplateRequest, StoreProjectRoleRequest
- Migration script: project_members.role → role_definition_id
- UI: editor de roles con permisos granulares

### Fase 3 · Vistas avanzadas + Reportes Scrum (6-8 días)

**Objetivo:** Vista Timeline (Gantt simple). Reportes Scrum: Burndown y Velocity. Reportes cross-project.

**Entregables:**
- Controllers: TimelineViewController, BurndownReportController, VelocityReportController
- Services: BurndownCalculator, VelocityCalculator
- Pages: TimelineView.jsx, Reports/Burndown.jsx, Reports/Velocity.jsx
- Components: TimelineGantt, TimelineRow, TimelineHeader, BurndownChart, VelocityChart, SprintReportCard
- Hook: useBurndown, useMethodologyView
- Extender Anthropic service: contexto incluye sections + métricas Scrum
- Extender Export service: PDF Burndown, PDF Velocity, Sprint Report
- Cleanup migration: drop de phase_tasks JSON y steps JSON deprecated

### Cronograma sugerido

| Sem | Días | Foco | Entregable |
|---|---|---|---|
| 1 | 1-2 | Migrations + Models nuevos | BD lista, modelos con relaciones |
| 1 | 3-4 | Backend Fase 1: Sections + TaskSteps + CustomFields | API CRUD funcional |
| 1 | 5 | Frontend Fase 1: Board view + integración | Vista Board funcional |
| 1 | 6-7 | Migración PMI + testing | Proyectos PMI migrados sin daño |
| 2 | 8-10 | Wizard de creación + templates | Crear proyecto Scrum desde wizard |
| 2 | 11-12 | Roles configurables | Editor de roles funcional |
| 3 | 13-15 | Vista Timeline + integración | Vista Gantt simple |
| 3 | 16-18 | Reportes Burndown + Velocity | Charts en producción |
| 3 | 19-21 | Cleanup, testing final, docs | v2.0 lista para EF-Ai360 |

---

## 10. Riesgos técnicos y mitigaciones

Riesgos identificados durante el diseño con su plan de mitigación.

| # | Riesgo | Probabilidad | Impacto | Mitigación |
|---|---|---|---|---|
| **R1** | Migración PMI rompe proyectos existentes | Media | Alto | Mantener phase_tasks JSON 1 release. Comando dry-run. Rollback automático. |
| **R2** | Custom fields polimórficos performance | Baja | Medio | Eager loading con `with('customFieldValues')`. Index en (target_type, target_id). Cache. |
| **R3** | Drag-and-drop con muchas tasks lentitud | Media | Medio | Virtual scrolling en Board (react-window). Debounce reorder. Optimistic UI. |
| **R4** | Wizard de creación añade fricción | Baja | Bajo | Skip wizard con "Crear rápido (Custom)". Wizard solo para primera vez por usuario. |
| **R5** | Roles configurables → permisos confusos | Media | Medio | 3 roles default pre-cargados. Tooltips en cada permiso. Validación en backend. |
| **R6** | Burndown chart sin datos = vista vacía | Media | Bajo | Empty state con CTA: "Define story_points para activar Burndown". |
| **R7** | Asistente IA no entiende nuevo modelo | Media | Medio | Refactor del prompt context: incluir sections, custom fields, métricas. Test con casos reales. |
| **R8** | Componentes > 300 líneas (rompe regla) | Media | Bajo | Code review estricto. Extraer subcomponents agresivamente (BoardColumn, BoardCard separados). |

---

## 11. Pendientes y decisiones abiertas

Decisiones que se posponen para después de Fase 1, o que requieren más investigación antes de implementar.

### P-01 · Templates adicionales
Después de Scrum/PMI/Custom, ¿agregar Kanban puro, OKR, GTD? Decidir cuando aparezca un proyecto que lo requiera.

### P-02 · Vistas adicionales
¿Agregar vista Calendar dedicada por proyecto? La Calendar global ya existe. Decidir según demanda.

### P-03 · Subtareas anidadas (multi-nivel)
Actualmente Task → TaskStep es 2 niveles. ¿Permitir TaskStep → SubStep → SubSubStep? Aumenta complejidad mucho. Posponer.

### P-04 · Dependencias entre tasks
¿Task A bloquea Task B (predecessor)? Crítico para Gantt real. Por ahora Timeline simple no las requiere. Fase 4 si se necesita.

### P-05 · Real-time collaboration
¿Ver cambios de otros usuarios en vivo (Pusher/Reverb)? Útil para Board. No crítico para uso interno actual. Fase 4.

### P-06 · Webhooks / Integraciones
¿Conectar con Slack, GitHub, GitLab para notificar? Posponer hasta tener un caso de uso concreto.

### P-07 · Time tracking real
Existe `estimated_time` pero no `actual_time`. Agregar timer/cronómetro requiere UI compleja. Decidir según necesidad.

### P-08 · Mobile
¿PWA dedicada o app nativa? La web actual es responsive pero no PWA. Decidir según uso real.

### Validación antes de Fase 4

> ✅ **Antes de seguir construyendo**
>
> Después de completar Fase 3, validar con uso real (al menos EF-Ai360 cargado y operando) antes de comprometer Fase 4. Los pendientes de arriba pueden ser irrelevantes en la práctica o pueden volverse críticos. La realidad operacional dirá.

---

**DDS · SinapSYS Projects v2.0 · Plataforma multi-metodología**

*SinapSYS Ecosistemas SAS de CV · contacto@sinapsys.app · Mayo 2026*
