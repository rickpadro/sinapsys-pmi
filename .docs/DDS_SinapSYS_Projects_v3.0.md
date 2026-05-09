# DDS · SinapSYS Projects v3.0

**Gestión de proyectos complejos · Caso de validación EF-Ai360**

> Documento incremental. Asume v2.1 implementada (commit `d5a6169` — refactor + Fase 4 P-01/P-04/P-07/P-08). Cierra deuda heredada de v2.1 y agrega los 7 gaps detectados al intentar modelar EF-Ai360.

---

| Campo | Valor |
|---|---|
| **Versión** | v3.0 |
| **Estado** | Diseño |
| **Tipo** | Incremento mayor sobre v2.1 |
| **Stack** | Laravel 12 + Inertia.js 2 + React 19 + Tailwind v4 + shadcn/ui + MySQL 8 |
| **Predecesor** | DDS v2.1 (Mayo 2026, commit `d5a6169`) |
| **Caso de validación** | EF-Ai360 (Estructurar Futuro · 10 sprints · 7 tracks · 8 riesgos) |
| **Audiencia** | Equipo SinapSYS |
| **Autor** | SinapSYS Ecosistemas SAS de CV |
| **Fecha** | Mayo 2026 |

---

## Tabla de contenidos

1. [Contexto y objetivo](#1-contexto-y-objetivo)
2. [Deuda heredada de v2.1](#2-deuda-heredada-de-v21)
3. [Modelo conceptual ampliado](#3-modelo-conceptual-ampliado)
4. [Gap 1 · Milestones (hitos contractuales)](#4-gap-1--milestones-hitos-contractuales)
5. [Gaps 3+4 unificados · Section types](#5-gaps-34-unificados--section-types)
6. [Gaps 2+6 ampliado · Critical path + bloqueantes](#6-gaps-26-ampliado--critical-path--bloqueantes)
7. [Gap 5 · Risk register con mitigations](#7-gap-5--risk-register-con-mitigations)
8. [Gap 7 · Project decisions log](#8-gap-7--project-decisions-log)
9. [Gap 8 · Capacity planning por miembro](#9-gap-8--capacity-planning-por-miembro)
10. [PushController v2 · refactor + triggers reales](#10-pushcontroller-v2--refactor--triggers-reales)
11. [Roadmap de implementación](#11-roadmap-de-implementación)
12. [Plan de carga EF-Ai360](#12-plan-de-carga-ef-ai360)
13. [Riesgos y mitigaciones](#13-riesgos-y-mitigaciones)
14. [Criterios de aceptación](#14-criterios-de-aceptación)

---

## 1. Contexto y objetivo

### Origen del DDS

Al planear la carga del proyecto **EF-Ai360** (Estructurar Futuro, 10 sprints en 20 semanas, 7 tracks paralelos, 8 riesgos, 31 definiciones, 5 hitos contractuales) sobre SinapSYS Projects v2.1, se detectó que la plataforma cubre el ~60% de lo que el plan exige modelar. El 40% restante son piezas estructurales que no son "nice to have" — son **necesarias** para gestionar el proyecto sin que la herramienta sea un obstáculo.

v2.0 dio la base multi-metodología. v2.1 hizo el refactor y agregó Fase 4 (Kanban, dependencias básicas, time tracking, PWA). v3.0 cierra el salto desde "soporta Scrum académico" hasta "soporta gestión real de proyectos complejos con compromisos contractuales, riesgos formales y tracks paralelos".

### Lo que cambia

#### Modelo de datos
- Nueva tabla `milestones` (hitos contractuales con fecha dura)
- Nueva columna `sections.type` (sprint / discovery / continuous)
- Nueva tabla `risks` + `risk_mitigations` (pivote con tasks)
- Nueva tabla `project_decisions` (decision log / definiciones)
- Nueva tabla `member_capacities` (dedicación variable por miembro+sprint)
- Nueva columna `tasks.is_blocker` (flag explícito para critical path)
- Nueva tabla `push_subscriptions` ya existe en v2.1 — se mantiene
- Nueva tabla `notification_log` (auditoría de notificaciones enviadas)

#### Backend
- 4 servicios nuevos: `CriticalPathCalculator`, `MilestoneTracker`, `RiskMatrixCalculator`, `CapacityPlanner`
- 1 servicio refactor: `PushNotificationService` (envío real con minishlink/web-push)
- 2 jobs nuevos: `SendPushNotification`, `CheckUpcomingDeadlines` (cron)
- ~12 controllers/Form Requests nuevos

#### UI / UX
- Vista "Project Overview" rediseñada con widgets: milestones, riesgos, critical path, capacity
- Timeline con bandas para sections continuous + líneas verticales para milestones
- Burndown/Velocity excluyen sections discovery y continuous
- Matriz de riesgos prob×impacto interactiva
- Editor de capacities por miembro+sprint en wizard de creación

### Lo que se mantiene

- Stack tecnológico sin upgrades
- Modelo de v2.1 intacto (sections, tasks, custom fields, dependencies, time entries)
- Compatibilidad hacia atrás: proyectos PMI v1/v2/v2.1 siguen funcionando idénticos
- Reglas no negociables del CLAUDE.md (incluye refuerzo de regla 2 que se rompió en PushController)

### Hallazgos críticos

> ⚠️ **Deuda heredada de v2.1**
>
> Tres issues detectados en commit `d5a6169` se absorben en v3.0 en lugar de fixarse en parche:
> - PushController valida inline (regresión Fase 3.5)
> - `minishlink/web-push` no está en composer — push subscribe sin envío real
> - Cero tests de v2.1 — la carga de EF-Ai360 actuará como smoke test

> ✅ **Compatibilidad hacia atrás garantizada**
>
> Migración automática en deploy: proyectos existentes reciben `sections.type = 'sprint'` por default. PMI tradicional sigue idéntico.

> 🎯 **Caso de validación**
>
> El criterio binario de éxito de v3.0 es: **cargar EF-Ai360 completo (10 sprints, 7 tracks, 5 milestones, 8 riesgos, 31 definiciones) sin un solo workaround**. Si el modelo lo soporta nativamente, v3.0 está listo.

---

## 2. Deuda heredada de v2.1

Tres issues detectados en auditoría del commit `d5a6169`. Se absorben aquí porque arreglarlos requiere tocar el mismo código que v3.0 va a expandir.

### Issue 1 · Validación inline en PushController

**Estado:** `app/Http/Controllers/PushController.php` líneas 13 y 32 usan `$request->validate(...)`.

**Acción en v3.0:**
- Crear `StorePushSubscriptionRequest`
- Crear `DestroyPushSubscriptionRequest`
- Mover validación
- El `PushController` se reescribe completo en sección 10 — esta es la razón de no fixar antes.

### Issue 2 · Push no envía realmente

**Estado:** `PushController` solo persiste/borra suscripciones en BD. No existe código que envíe la notificación al endpoint del navegador.

**Acción en v3.0:**
- `composer require minishlink/web-push`
- Service `PushNotificationService` con `sendTo($subscription, $payload)`
- Job `SendPushNotification` para envío en queue con retry
- Cron `CheckUpcomingDeadlines` que dispara los 2 triggers definidos
- Tabla `notification_log` para auditoría

### Issue 3 · Sin tests v2.1

**Estado:** solo `tests/Unit/ExampleTest.php` y `tests/Feature/ExampleTest.php` (templates Laravel).

**Acción en v3.0:**
- La **carga de EF-Ai360** (sección 12) actúa como smoke test funcional integral
- Tests unitarios obligatorios para los 4 servicios nuevos: `CriticalPathCalculator`, `MilestoneTracker`, `RiskMatrixCalculator`, `CapacityPlanner`
- Tests de integración para los 2 triggers de push (24h deadline + 7d milestone)

---

## 3. Modelo conceptual ampliado

Vista de bloques de v3.0. **Sólido** = existe en v2.1. **Punteado** = nuevo en v3.0.

```
                            ┌──────────────────────┐
                            │       PROJECT        │
                            │  methodology · view  │
                            └──────────┬───────────┘
                                       │
        ┌──────────────┬───────────────┼─────────────┬────────────────┐
        │              │               │             │                │
        ▼              ▼               ▼             ▼                ▼
   ┌─────────┐   ┌──────────┐   ┌────────────┐ ┌──────────┐  ┌───────────────┐
   │ SECTION │   │ MILESTONE│   │   RISK     │ │ DECISION │  │MEMBER CAPACITY│
   │ + type  │   │ (NUEVO)  │   │  (NUEVO)   │ │ (NUEVO)  │  │   (NUEVO)     │
   │ (NUEVO) │   │          │   │            │ │          │  │               │
   └────┬────┘   └────┬─────┘   └─────┬──────┘ └──────────┘  └───────────────┘
        │             │               │
        ▼             │               │
   ┌─────────┐        │               │
   │  TASK   │        │               │
   │+is_blocker◄──────┘               │
   │ (NUEVO) │   linked_milestone_id  │
   └────┬────┘                        │
        │                             │
        │    ┌──────────────────┐     │
        ├───►│ TASK_DEPENDENCY  │     │
        │    │     (v2.1)       │     │
        │    └──────────────────┘     │
        │                             │
        │    ┌──────────────────┐     │
        └───►│ RISK_MITIGATION  │◄────┘
             │    (NUEVO pivot) │
             └──────────────────┘
```

### Cómo se mapea EF-Ai360 al modelo

| Concepto del plan EF-Ai360 | Modelado como |
|---|---|
| Sprint 0 (Setup/Discovery, sin código) | `Section` con `type = 'discovery'` |
| Sprints 1-9 (Scrum normal) | `Section` con `type = 'sprint'` |
| Track Infra & DevOps (S0-S9 continuo) | `Section` con `type = 'continuous'` |
| Track Observabilidad | `Section` con `type = 'continuous'` |
| Track PAC DIAN | `Section` con `type = 'continuous'` |
| Hito Sem 8 PWA producción | `Milestone` con `target_date = 2026-XX-XX` |
| Hito Sem 14 Webs piloto | `Milestone` |
| Hito Sem 18 DIAN integrada | `Milestone` |
| Hito Sem 20 Cierre SEDI | `Milestone` |
| US-101 a US-907 (63 user stories) | `Task` con `section_id` y `story_points` |
| US-305 "Bloqueante" | `Task.is_blocker = true` |
| US-802 "Bloqueante cutover" | `Task.is_blocker = true` + `linked_milestone_id` (Sem 18) |
| R1-R8 riesgos | `Risk` |
| "App Nativa portada desde S6 mitiga R2" | `RiskMitigation` (R2 → US-806, US-704...) |
| DEF001-DEF025 + DEF-P01..09 | `ProjectDecision` |
| Tech Lead 100%, Mobile 50%→100% S6 | `MemberCapacity` por miembro+section |

---

## 4. Gap 1 · Milestones (hitos contractuales)

### Modelo

```php
Schema::create('milestones', function (Blueprint $table) {
    $table->id();
    $table->foreignId('project_id')->constrained()->cascadeOnDelete();
    $table->string('name');
    $table->text('description')->nullable();
    $table->date('target_date');
    $table->date('actual_date')->nullable();
    $table->enum('status', ['planned', 'at_risk', 'met', 'missed'])->default('planned');
    $table->enum('criticality', ['low', 'medium', 'high', 'critical'])->default('medium');
    $table->string('color', 7)->nullable();
    $table->integer('order')->default(0);
    $table->timestamps();

    $table->index(['project_id', 'target_date']);
});
```

**Nueva columna en `tasks`:**
```php
Schema::table('tasks', function (Blueprint $table) {
    $table->foreignId('linked_milestone_id')->nullable()
          ->after('section_id')
          ->constrained('milestones')->nullOnDelete();
});
```

Permite vincular tasks "bloqueantes de cutover" a un milestone específico.

### Service `MilestoneTracker`

Calcula el status automático de un milestone según el avance de las tasks vinculadas y la cercanía de `target_date`:

```php
public function evaluateStatus(Milestone $milestone): string
{
    if ($milestone->actual_date) return 'met';

    $today = today();
    $daysUntil = $today->diffInDays($milestone->target_date, false);

    $linkedTasks = $milestone->linkedTasks();
    $pendingBlockers = $linkedTasks->where('is_blocker', true)
                                    ->where('done', false)->count();

    if ($daysUntil < 0) return 'missed';
    if ($daysUntil <= 7 && $pendingBlockers > 0) return 'at_risk';
    if ($daysUntil <= 14 && $pendingBlockers >= 2) return 'at_risk';

    return 'planned';
}
```

Corre vía cron diario + on-demand cuando se actualiza una task vinculada.

### Controller + Form Requests

| Componente | Propósito |
|---|---|
| `MilestoneController` | CRUD + `linkTasks()` |
| `StoreMilestoneRequest` | Validación creación |
| `UpdateMilestoneRequest` | Validación edición |
| `LinkTasksToMilestoneRequest` | Vincular múltiples tasks |

### UI

#### En Timeline
Línea vertical roja en `target_date` con etiqueta del milestone. Color según `criticality`. Cambio de color según `status` (`at_risk` parpadea suavemente).

#### En Project Overview (page nueva)
Widget "Próximos hitos" con cards horizontales:

```
┌─────────────────────────────────────────┐
│ 🎯 PWA en producción      Sem 8         │
│ 23 días restantes · ⚠ AT RISK           │
│ 2 bloqueantes pendientes (US-104, US-305)│
└─────────────────────────────────────────┘
```

#### Componentes React
- `Components/Milestones/MilestoneCard.jsx`
- `Components/Milestones/MilestoneTimelineMarker.jsx`
- `Components/Milestones/MilestoneEditor.jsx`
- `Pages/Projects/Milestones/Index.jsx`

### Triggers de notificación push
Cuando un milestone cambia a `at_risk` automáticamente → notificar al `project.owner_id` y a todos los miembros con rol `manager`.

---

## 5. Gaps 3+4 unificados · Section types

EF-Ai360 demanda dos casos especiales que el modelo actual de Section no resuelve:

1. **Sprint 0** — no es Scrum, no debe contar en Burndown/Velocity
2. **Tracks paralelos** (Infra, Obs, PAC) — corren a lo largo de todos los sprints, no tienen sprint goal

Ambos se resuelven con una sola columna nueva en `sections`.

### Migration

```php
Schema::table('sections', function (Blueprint $table) {
    $table->enum('type', ['sprint', 'discovery', 'continuous'])
          ->default('sprint')
          ->after('status');

    $table->index(['project_id', 'type']);
});
```

**Migración de datos:** todos los sections existentes reciben `type = 'sprint'`. Cero impacto en proyectos cargados.

### Lógica de cálculo · qué cambia

| Reporte / vista | Sprint | Discovery | Continuous |
|---|---|---|---|
| Burndown | Incluido | Excluido | Excluido |
| Velocity | Incluido | Excluido | Excluido |
| Critical path | Incluido | Incluido | Excluido (paralelo) |
| Capacity planning | Incluido | Excluido (sin SP) | Incluido (consume capacity) |
| Render Timeline | Barra horizontal estándar | Barra estándar con icono 🔍 | Banda horizontal que cruza todo el timeline |
| Render Board | Columna estándar | Columna estándar | Sección lateral fija |

### Updates en servicios existentes

#### `BurndownCalculator`
```php
// Antes
$sections = $project->sections()->get();

// Después
$sections = $project->sections()->where('type', 'sprint')->get();
```

#### `VelocityCalculator`
Mismo cambio.

#### `CriticalPathCalculator` (nuevo, ver sección 6)
Excluye explícitamente sections con `type = 'continuous'` para no inflar el path.

### UI

#### Templates actualizados
El Scrum template existente queda igual. El template **EF-Ai360** (nuevo, opcional) precarga:

```php
'default_sections' => [
    ['name' => 'Sprint 0 · Setup',     'order' => 0, 'type' => 'discovery'],
    ['name' => 'Sprint 1',             'order' => 1, 'type' => 'sprint'],
    ['name' => 'Sprint 2',             'order' => 2, 'type' => 'sprint'],
    // ... S3-S9
    ['name' => 'Track · Infra & DevOps',  'order' => 100, 'type' => 'continuous'],
    ['name' => 'Track · Observabilidad',  'order' => 101, 'type' => 'continuous'],
    ['name' => 'Track · PAC DIAN',        'order' => 102, 'type' => 'continuous'],
],
```

#### Editor de Section
Selector de tipo con explicación inline:
- 🏃 **Sprint** — sprint Scrum estándar, cuenta en Burndown
- 🔍 **Discovery** — fase exploratoria, no cuenta en métricas Scrum
- ➿ **Continuous** — track paralelo continuo, cruza todos los sprints

### Componentes React
- `Components/Sections/SectionTypeSelector.jsx`
- `Components/Timeline/ContinuousBand.jsx` (banda horizontal para tracks)
- Update `Components/Sections/SectionCard.jsx` con badge según type

---

## 6. Gaps 2+6 ampliado · Critical path + bloqueantes

v2.1 ya tiene `task_dependencies` y `DependencyValidator`. Lo que falta:

1. Flag explícito `tasks.is_blocker`
2. Cálculo de critical path
3. Visualización en Timeline y Board

### Migration

```php
Schema::table('tasks', function (Blueprint $table) {
    $table->boolean('is_blocker')->default(false)->after('status');
    $table->boolean('on_critical_path')->default(false)->after('is_blocker');
    $table->index(['project_id', 'is_blocker']);
    $table->index(['project_id', 'on_critical_path']);
});
```

`on_critical_path` se calcula y persiste (no se calcula on-the-fly por costo). Se recalcula cuando:
- Se crea/actualiza/elimina una dependencia
- Se cambia `due_date` o `estimated_time` de una task del proyecto
- Se ejecuta el cron diario `RecalculateCriticalPath`

### Service `CriticalPathCalculator`

Algoritmo CPM (Critical Path Method) clásico:

```php
class CriticalPathCalculator
{
    /** Recalcula y persiste on_critical_path para todas las tasks del proyecto. */
    public function recalculate(Project $project): array
    {
        $tasks = $project->tasks()
            ->whereHas('section', fn($q) => $q->where('type', '!=', 'continuous'))
            ->with('dependencies', 'dependents')
            ->get();

        $graph = $this->buildGraph($tasks);

        // Forward pass: earliest start/finish
        $this->forwardPass($graph);

        // Backward pass: latest start/finish
        $this->backwardPass($graph);

        // Critical path = nodes con slack = 0
        $criticalIds = collect($graph)->filter(fn($n) => $n['slack'] === 0)
                                       ->keys()->toArray();

        Task::whereIn('id', $criticalIds)->update(['on_critical_path' => true]);
        Task::where('project_id', $project->id)
            ->whereNotIn('id', $criticalIds)
            ->update(['on_critical_path' => false]);

        return $criticalIds;
    }
}
```

Tests unitarios obligatorios con 3 escenarios:
1. Cadena lineal A→B→C → todas críticas
2. Diamante A→B,C→D donde B>C → solo A,B,D críticas
3. Grafo con bloqueante explícito → bloqueante siempre crítico

### UI

#### Timeline
Tasks con `on_critical_path = true` se renderizan con **borde rojo grueso**.
Tasks con `is_blocker = true` reciben **icono ⚠** adicional.

#### Board
Cards en critical path con borde lateral rojo.

#### Project Overview
Widget "Critical Path":
```
🔴 Critical Path · 7 tasks
US-102 SEDI Adapter (8 SP) → US-103 Dashboard CEO (5 SP) →
US-202 Ocupancia (5 SP) → US-305 Hardening (5 SP) ⚠ BLOCKER →
🎯 PWA Sem 8

Total: 31 SP · Duración estimada: 18 días
```

### Componentes React
- Update `Components/Timeline/TimelineRow.jsx` para borde crítico
- Update `Components/Board/BoardCard.jsx` para borde crítico
- `Components/CriticalPath/CriticalPathWidget.jsx`
- `Components/Tasks/BlockerToggle.jsx`

---

## 7. Gap 5 · Risk register con mitigations

EF-Ai360 tiene 8 riesgos formales con probabilidad, impacto, mitigación, **y vínculo con US específicas que mitigan cada riesgo**. El plan dice textual: *"App Nativa portada desde S6 (no desde cero en S9)"* — eso es US-806 (Build Candidata Flutter) mitigando R2.

### Modelo

```php
Schema::create('risks', function (Blueprint $table) {
    $table->id();
    $table->foreignId('project_id')->constrained()->cascadeOnDelete();
    $table->string('code', 10);                    // R1, R2, ...
    $table->string('name');
    $table->text('description');
    $table->enum('probability', ['low', 'medium', 'high'])->default('medium');
    $table->enum('impact', ['low', 'medium', 'high', 'critical'])->default('medium');
    $table->enum('status', ['open', 'mitigated', 'materialized', 'closed'])->default('open');
    $table->text('mitigation_plan')->nullable();
    $table->foreignId('owner_id')->nullable()->constrained('users');
    $table->date('identified_on');
    $table->date('closed_on')->nullable();
    $table->timestamps();

    $table->unique(['project_id', 'code']);
    $table->index(['project_id', 'status']);
});

Schema::create('risk_mitigations', function (Blueprint $table) {
    $table->id();
    $table->foreignId('risk_id')->constrained()->cascadeOnDelete();
    $table->foreignId('task_id')->constrained()->cascadeOnDelete();
    $table->text('rationale')->nullable();          // por qué esta task mitiga el riesgo
    $table->timestamps();

    $table->unique(['risk_id', 'task_id']);
});
```

### Service `RiskMatrixCalculator`

Devuelve la matriz prob×impacto poblada y una métrica agregada:

```php
public function matrix(Project $project): array
{
    $risks = $project->risks()->where('status', 'open')->get();

    $matrix = [];
    foreach (['low', 'medium', 'high'] as $p) {
        foreach (['low', 'medium', 'high', 'critical'] as $i) {
            $matrix[$p][$i] = $risks->where('probability', $p)
                                     ->where('impact', $i)
                                     ->values()->all();
        }
    }

    return [
        'matrix'         => $matrix,
        'critical_count' => $risks->where('impact', 'critical')
                                   ->whereIn('probability', ['high'])->count(),
        'open_total'     => $risks->count(),
        'with_mitigation_plan' => $risks->whereNotNull('mitigation_plan')->count(),
    ];
}
```

### Controllers + Form Requests

| Componente | Endpoints |
|---|---|
| `RiskController` | index, store, update, destroy, materialize, close |
| `RiskMitigationController` | store, destroy (vincula/desvincula task) |
| `StoreRiskRequest` | code unico por project, prob/impact obligatorios |
| `UpdateRiskRequest` | similar |
| `LinkTaskToRiskRequest` | risk_id + task_id + rationale |

### UI

#### Page nueva `Pages/Projects/Risks/Index.jsx`
- Matriz 3×4 (prob × impact) con cards de riesgo en cada celda
- Esquina superior derecha (high × critical) con borde rojo
- Filtro por status
- Botón "Vincular task que mitiga"

#### En Task editor
Tab nuevo "Riesgos que mitiga" con multiselect de `risks` del proyecto.

#### En Project Overview
Widget "Top riesgos abiertos":
```
🔴 R1 · Alta · Crítica · Sprint 0 no resuelve accesos
   Mitigación: Escalamiento a CEO al final de Sem 1
   Tareas mitigantes: 0 ⚠
   
🟠 R2 · Alta · Alto · Sprint 9 no completa entregables
   Mitigación: App Nativa portada desde S6 + dry-runs
   Tareas mitigantes: US-806, US-804 ✓
```

### Componentes React
- `Components/Risks/RiskMatrix.jsx`
- `Components/Risks/RiskCard.jsx`
- `Components/Risks/RiskEditor.jsx`
- `Components/Risks/RiskMitigationsList.jsx`
- `Pages/Projects/Risks/Index.jsx`

### Triggers
Cuando un riesgo cambia status a `materialized` → push notification al owner del riesgo + manager del proyecto.

---

## 8. Gap 7 · Project decisions log

EF-Ai360 tiene 31 definiciones (DEF001-DEF025 confirmadas + DEF-P01..09 pendientes). Cada pendiente tiene un campo `BLOQUEA: X` que vincula la decisión con qué actividad bloquea.

### Modelo

```php
Schema::create('project_decisions', function (Blueprint $table) {
    $table->id();
    $table->foreignId('project_id')->constrained()->cascadeOnDelete();
    $table->string('code', 20);                     // DEF001, DEF-P01
    $table->string('title');
    $table->text('description');
    $table->enum('status', ['confirmed', 'pending', 'rejected'])->default('pending');
    $table->text('blocks_description')->nullable(); // texto libre: "Estrategia BI"
    $table->foreignId('blocks_section_id')->nullable()
          ->constrained('sections')->nullOnDelete();
    $table->foreignId('blocks_milestone_id')->nullable()
          ->constrained('milestones')->nullOnDelete();
    $table->foreignId('decided_by')->nullable()->constrained('users');
    $table->date('decided_on')->nullable();
    $table->json('tags')->nullable();
    $table->integer('order')->default(0);
    $table->timestamps();

    $table->unique(['project_id', 'code']);
    $table->index(['project_id', 'status']);
});
```

### Controllers + Form Requests

| Componente | Endpoints |
|---|---|
| `ProjectDecisionController` | index, store, update, destroy, confirm, reject |
| `StoreProjectDecisionRequest` | code único por project |
| `UpdateProjectDecisionRequest` | similar |

### UI

#### Page `Pages/Projects/Decisions/Index.jsx`
- Lista filtrable por status (confirmed / pending / rejected)
- Búsqueda por code o title
- Filtro por "bloquea sprint X" o "bloquea milestone Y"
- Quick action: "Marcar como confirmada" con timestamp + usuario

#### Widget en Project Overview
"Decisiones pendientes que bloquean":
```
⏳ DEF-P01 · Stack del BI actual
   Bloquea: Estrategia BI → Sprint 1

⏳ DEF-P04 · Acceso al Presidente
   Bloquea: Sprint Reviews → Milestone Sem 2
```

### Componentes React
- `Components/Decisions/DecisionsList.jsx`
- `Components/Decisions/DecisionCard.jsx`
- `Components/Decisions/DecisionEditor.jsx`
- `Pages/Projects/Decisions/Index.jsx`

### Sin triggers de notificación
Las decisiones son change-log. No disparan push.

---

## 9. Gap 8 · Capacity planning por miembro

EF-Ai360 demanda dedicación variable por miembro+sprint:
- Tech Lead 100% S0-S9
- Frontend Senior 100% S0-S9
- Frontend Mid 100% **desde S4** (0% antes)
- Mobile Flutter Senior 50% S0-S5, 100% S6-S9
- Scrum Master 50% S0-S9

Sin esto, **no se puede planificar SP por sprint contra capacidad real**.

### Modelo

```php
Schema::create('member_capacities', function (Blueprint $table) {
    $table->id();
    $table->foreignId('project_member_id')->constrained()->cascadeOnDelete();
    $table->foreignId('section_id')->constrained()->cascadeOnDelete();
    $table->decimal('dedication_pct', 5, 2)->default(100.00);  // 0-100
    $table->integer('available_hours_per_week')->default(40);
    $table->text('notes')->nullable();
    $table->timestamps();

    $table->unique(['project_member_id', 'section_id']);
});
```

### Service `CapacityPlanner`

```php
public function sprintCapacity(Section $sprint): array
{
    if ($sprint->type !== 'sprint') return ['n_a' => true];

    $weeks = $sprint->start_date->diffInWeeks($sprint->end_date) ?: 2;

    $members = $sprint->project->members()->with('user')->get();

    $totalHours = 0;
    $byMember = [];

    foreach ($members as $member) {
        $capacity = $member->capacities()->where('section_id', $sprint->id)->first();
        $pct = $capacity?->dedication_pct ?? 100;
        $hoursPerWeek = $capacity?->available_hours_per_week ?? 40;
        $hours = ($pct / 100) * $hoursPerWeek * $weeks;
        $totalHours += $hours;
        $byMember[$member->user->name] = $hours;
    }

    $plannedSp = $sprint->tasks()->sum('story_points');
    $estimatedHoursForSp = $plannedSp * 4; // factor configurable, default 4h/SP

    return [
        'total_hours_available' => $totalHours,
        'planned_story_points'  => $plannedSp,
        'estimated_hours'       => $estimatedHoursForSp,
        'utilization_pct'       => $totalHours > 0 ? round($estimatedHoursForSp / $totalHours * 100, 1) : 0,
        'overcommitted'         => $estimatedHoursForSp > $totalHours,
        'by_member'             => $byMember,
    ];
}
```

### UI

#### En wizard de creación
Después del paso "Sections" agregar paso opcional "Capacity":
- Tabla con miembros del proyecto en filas, sections (sprints) en columnas
- Celdas editables con `%` (0-100)
- Default 100% para todos

#### En Sprint card (Board / Timeline)
Indicador de capacidad:
```
Sprint 4 · Web Constructora MVP
📊 24/30 SP · 80% utilization · ✓ on track
👥 4 miembros · Mobile arranca este sprint
```

#### En Project Overview
Widget "Capacity heatmap" — calendario visual con colores:
- Verde: <70% utilization
- Amarillo: 70-90%
- Rojo: >90% (overcommitted)

### Componentes React
- `Components/Capacity/CapacityEditor.jsx` (matriz miembro × sprint)
- `Components/Capacity/CapacityHeatmap.jsx`
- `Components/Capacity/SprintCapacityIndicator.jsx`
- `Pages/Projects/Capacity/Index.jsx`

---

## 10. PushController v2 · refactor + triggers reales

Cierra Issues 1 y 2 de la deuda heredada de v2.1.

### Pre-requisitos

```bash
composer require minishlink/web-push
```

`composer.json` declara `minishlink/web-push`. La versión usa libcurl + extensiones GMP/MBString (verificar en hosting A2).

### `.env` (ya tiene placeholders en v2.1)

```env
VAPID_SUBJECT=mailto:contacto@sinapsys.app
VAPID_PUBLIC_KEY=...
VAPID_PRIVATE_KEY=...
```

Generación de keys:
```bash
php artisan vapid:generate
```

(Comando nuevo a crear: `app/Console/Commands/GenerateVapidKeys.php`)

### Refactor `PushController`

Validación movida a Form Requests:
- `StorePushSubscriptionRequest`
- `DestroyPushSubscriptionRequest`

```php
class PushController extends Controller
{
    public function subscribe(StorePushSubscriptionRequest $request): JsonResponse
    {
        $subscription = PushSubscription::updateOrCreate(
            ['endpoint' => $request->validated('endpoint')],
            [
                'user_id' => $request->user()->id,
                'p256dh'  => $request->validated('p256dh'),
                'auth'    => $request->validated('auth'),
            ]
        );

        return response()->json(['ok' => true, 'id' => $subscription->id]);
    }

    public function unsubscribe(DestroyPushSubscriptionRequest $request): JsonResponse
    {
        PushSubscription::where('endpoint', $request->validated('endpoint'))
            ->where('user_id', $request->user()->id)
            ->delete();

        return response()->json(['ok' => true]);
    }
}
```

### Service `PushNotificationService`

```php
use Minishlink\WebPush\WebPush;
use Minishlink\WebPush\Subscription;

class PushNotificationService
{
    private WebPush $webPush;

    public function __construct()
    {
        $this->webPush = new WebPush([
            'VAPID' => [
                'subject'    => config('webpush.vapid.subject'),
                'publicKey'  => config('webpush.vapid.public_key'),
                'privateKey' => config('webpush.vapid.private_key'),
            ],
        ]);
    }

    public function sendToUser(User $user, array $payload): array
    {
        $sent = [];
        foreach ($user->pushSubscriptions as $sub) {
            $this->queueSend($sub, $payload);
            $sent[] = $sub->id;
        }
        return $sent;
    }

    private function queueSend(PushSubscription $sub, array $payload): void
    {
        SendPushNotification::dispatch($sub, $payload);
    }

    public function rawSend(PushSubscription $sub, array $payload): bool
    {
        $subscription = Subscription::create([
            'endpoint' => $sub->endpoint,
            'publicKey' => $sub->p256dh,
            'authToken' => $sub->auth,
        ]);

        $report = $this->webPush->sendOneNotification($subscription, json_encode($payload));

        // Log
        NotificationLog::create([
            'user_id'        => $sub->user_id,
            'type'           => $payload['type'] ?? 'generic',
            'payload'        => $payload,
            'success'        => $report->isSuccess(),
            'response_code'  => $report->getResponse()?->getStatusCode(),
            'error_reason'   => $report->getReason(),
        ]);

        // Si la subscripción es inválida (410), borrarla
        if ($report->isSubscriptionExpired()) {
            $sub->delete();
        }

        return $report->isSuccess();
    }
}
```

### Job `SendPushNotification`

```php
class SendPushNotification implements ShouldQueue
{
    public function __construct(
        public PushSubscription $subscription,
        public array $payload,
    ) {}

    public function handle(PushNotificationService $service): void
    {
        $service->rawSend($this->subscription, $this->payload);
    }

    public $tries = 3;
    public $backoff = [60, 300, 900]; // 1min, 5min, 15min
}
```

### Tabla `notification_log`

```php
Schema::create('notification_log', function (Blueprint $table) {
    $table->id();
    $table->foreignId('user_id')->constrained()->cascadeOnDelete();
    $table->string('type');                      // 'task_deadline_24h', 'milestone_at_risk_7d'
    $table->json('payload');
    $table->boolean('success')->default(false);
    $table->integer('response_code')->nullable();
    $table->string('error_reason')->nullable();
    $table->timestamps();

    $table->index(['user_id', 'type', 'created_at']);
});
```

### Triggers definidos

#### Trigger 1 · Task con due_date a 24h y no done

**Cron diario** (Laravel scheduler) ejecuta `CheckUpcomingDeadlines`:

```php
class CheckUpcomingDeadlines extends Command
{
    protected $signature = 'sinapsys:check-deadlines';

    public function handle(PushNotificationService $service): int
    {
        $tomorrow = today()->addDay();

        $tasks = Task::where('done', false)
            ->whereNotNull('assigned_to')
            ->whereDate('due_date', $tomorrow)
            ->with('assignee', 'project')
            ->get();

        foreach ($tasks as $task) {
            $service->sendToUser($task->assignee, [
                'type'    => 'task_deadline_24h',
                'title'   => "⏰ Vence mañana: {$task->name}",
                'body'    => "Proyecto: {$task->project->name}",
                'url'     => route('projects.show', $task->project),
                'task_id' => $task->id,
            ]);
        }

        return Command::SUCCESS;
    }
}
```

#### Trigger 2 · Milestone a 7 días sin completar

**Cron diario** ejecuta `CheckUpcomingMilestones`:

```php
class CheckUpcomingMilestones extends Command
{
    public function handle(PushNotificationService $service, MilestoneTracker $tracker): int
    {
        $deadline = today()->addDays(7);

        $milestones = Milestone::whereDate('target_date', $deadline)
            ->whereNull('actual_date')
            ->with('project')
            ->get();

        foreach ($milestones as $milestone) {
            $status = $tracker->evaluateStatus($milestone);
            $milestone->update(['status' => $status]);

            $owner = $milestone->project->owner;
            $managers = $milestone->project->members()
                ->whereHas('roleDefinition', fn($q) => $q->where('name', 'Manager'))
                ->with('user')->get()->pluck('user');

            $recipients = collect([$owner])->merge($managers)->unique('id');

            foreach ($recipients as $user) {
                $service->sendToUser($user, [
                    'type'  => 'milestone_at_risk_7d',
                    'title' => "🎯 Hito en 7 días: {$milestone->name}",
                    'body'  => $status === 'at_risk'
                        ? '⚠ AT RISK · revisar bloqueantes'
                        : 'On track',
                    'url'   => route('projects.milestones.index', $milestone->project),
                    'milestone_id' => $milestone->id,
                ]);
            }
        }

        return Command::SUCCESS;
    }
}
```

### Scheduler

`app/Console/Kernel.php` (o `bootstrap/app.php` en Laravel 12):

```php
$schedule->command('sinapsys:check-deadlines')->dailyAt('08:00');
$schedule->command('sinapsys:check-milestones')->dailyAt('08:15');
$schedule->command('sinapsys:recalculate-critical-path')->dailyAt('06:00');
```

Hosting A2: configurar cron del sistema que invoque `php artisan schedule:run` cada minuto.

### Frontend · suscripción de usuario

Componente nuevo `Components/Push/PushOptIn.jsx`:
- Aparece en Profile/Settings
- Botón "Activar notificaciones"
- Llama `Notification.requestPermission()`
- Suscribe service worker con VAPID public key
- POST a `/push/subscribe` con endpoint + p256dh + auth
- Persiste estado en `users.push_enabled` (columna nueva)

### Tests obligatorios

- `tests/Feature/PushSubscribeTest.php` — subscribe/unsubscribe end-to-end
- `tests/Feature/CheckUpcomingDeadlinesTest.php` — fixture con 3 tasks (1 vence mañana, 1 hoy, 1 en 3d) → solo se notifica la de mañana
- `tests/Feature/CheckUpcomingMilestonesTest.php` — fixture con milestones en 5d, 7d, 10d → solo el de 7d notifica
- `tests/Unit/PushNotificationServiceTest.php` — mock de WebPush, verifica que log se crea y subs caducas se borran

---

## 11. Roadmap de implementación

3 fases secuenciales. Cada una entregable independiente.

### Fase 1 · Modelo de datos + servicios core (4 días)

**Día 1:** Migrations
- `milestones`, `risks`, `risk_mitigations`, `project_decisions`, `member_capacities`, `notification_log`
- Alter `sections` (type), `tasks` (is_blocker, on_critical_path, linked_milestone_id)
- Alter `users` (push_enabled)

**Día 2:** Models + relaciones
- `Milestone`, `Risk`, `RiskMitigation`, `ProjectDecision`, `MemberCapacity`, `NotificationLog`
- Updates en `Section`, `Task`, `Project`, `ProjectMember`

**Día 3:** Services nuevos
- `MilestoneTracker`
- `RiskMatrixCalculator`
- `CapacityPlanner`

**Día 4:** Service `CriticalPathCalculator` + tests unitarios obligatorios

### Fase 2 · Backend completo (3 días)

**Día 5:** Controllers + Form Requests
- `MilestoneController` + 3 requests
- `RiskController` + `RiskMitigationController` + 4 requests
- `ProjectDecisionController` + 2 requests
- `MemberCapacityController` + 2 requests

**Día 6:** Push refactor + triggers
- `composer require minishlink/web-push`
- Refactor `PushController` con Form Requests
- `PushNotificationService` + Job `SendPushNotification`
- Commands `CheckUpcomingDeadlines`, `CheckUpcomingMilestones`, `RecalculateCriticalPath`
- Scheduler config

**Día 7:** Updates en services existentes + tests
- `BurndownCalculator` y `VelocityCalculator` excluyen non-sprint
- Tests integración para 2 triggers de push
- Tests Critical Path 3 escenarios

### Fase 3 · Frontend completo (5 días)

**Día 8:** Components Milestones + Risks
- `Components/Milestones/*` (3 componentes)
- `Components/Risks/*` (4 componentes)
- Pages `Milestones/Index.jsx`, `Risks/Index.jsx`

**Día 9:** Components Decisions + Capacity
- `Components/Decisions/*` (3 componentes)
- `Components/Capacity/*` (3 componentes)
- Pages `Decisions/Index.jsx`, `Capacity/Index.jsx`

**Día 10:** Critical path UI + section types
- Update `TimelineRow`, `BoardCard` para borde crítico
- `CriticalPathWidget`
- `SectionTypeSelector`
- `ContinuousBand` para Timeline

**Día 11:** Project Overview rediseñado
- Page nueva `Pages/Projects/Overview.jsx` con widgets
- Wizard de creación con paso "Capacity"
- Template "EF-Ai360" en seeder

**Día 12:** Push frontend + smoke testing
- `Components/Push/PushOptIn.jsx`
- Service Worker actualizado para handle de payloads de los 2 triggers
- Smoke testing manual end-to-end

### Fase 4 · Carga EF-Ai360 (1 día)

**Día 13:** Sección 12 de este DDS — la carga es el smoke test final.

### Total v3.0: 13 días

| Fase | Días | Entregable |
|---|---|---|
| Fase 1 | 4 | BD + Models + Services core |
| Fase 2 | 3 | Backend completo + push real |
| Fase 3 | 5 | Frontend completo |
| Fase 4 | 1 | EF-Ai360 cargado y validado |

---

## 12. Plan de carga EF-Ai360

La carga es el **smoke test final** de v3.0. Si todo carga sin workarounds, v3.0 está listo.

### Pre-requisitos

- v3.0 desplegada en staging
- `php artisan migrate` ejecutado
- `php artisan db:seed --class=MethodologyTemplatesSeeder` (incluye template EF-Ai360)
- VAPID keys generadas en `.env` de staging
- Cron `schedule:run` activo

### Orden de carga

#### Paso 1 · Crear proyecto base

Wizard de creación → template "EF-Ai360" precargado:
- Nombre: `EF-Ai360`
- Cliente: `Estructurar Futuro`
- Methodology: `scrum`
- Default view: `timeline`
- Color: `#D2491F` (naranja del logo de cliente)
- Fechas: 2026-XX-XX a 2026-XX-XX (20 semanas)

Validación binaria: el template precarga las 13 sections (Sprint 0 + Sprints 1-9 + 3 tracks) con `type` correcto.

#### Paso 2 · Cargar miembros

6 miembros del plan:

| Usuario | Rol | Capacity por section |
|---|---|---|
| Tech Lead | Manager | 100% en todas |
| Frontend Sr | Dev Team | 100% en todas |
| Frontend Mid | Dev Team | 0% S0-S3, 100% S4-S9 |
| Mobile Flutter | Dev Team | 50% S0-S5, 100% S6-S9 |
| Scrum Master | Scrum Master | 50% en todas |
| DevOps part-time | Stakeholder | 30% en todas |

Validación: matriz de capacity coincide con el plan.

#### Paso 3 · Cargar 5 milestones

| Code | Nombre | Target date | Criticality |
|---|---|---|---|
| M1 | Definiciones cerradas | Sem 2 | high |
| M2 | PWA Ejecutiva en producción | Sem 8 | critical |
| M3 | Webs Constructora + Inmobiliaria piloto | Sem 14 | critical |
| M4 | Facturación DIAN integrada | Sem 18 | critical |
| M5 | Cierre SEDI + App Nativa en tiendas | Sem 20 | critical |

Validación: aparecen como líneas verticales en Timeline.

#### Paso 4 · Cargar 63 user stories

Las 63 US del plan distribuidas en sus sprints. Custom fields:
- `story_points` (number)
- `item_type` (select: User Story, Bug, Task, Spike)
- `track` (select: PWA, Web Constructora, Web Inmobiliaria, Backend, etc.)

Las 4 US bloqueantes (US-305, US-802, US-903, US-806) reciben `is_blocker = true`.

US-802 y US-903 reciben `linked_milestone_id = M5` (cutover).
US-305 recibe `linked_milestone_id = M2` (PWA).

Validación: Burndown de S0 muestra "no aplica" (es discovery). Burndown de S1 muestra ideal vs real.

#### Paso 5 · Cargar 8 riesgos

| Code | Prob | Impacto | Tasks que mitigan |
|---|---|---|---|
| R1 | high | critical | (ninguna inicial — escalamiento manual) |
| R2 | high | high | US-806 (Build Candidata Flutter S8), US-704 (Web Constructora antes de S9) |
| R3 | medium | medium | US-806 (submission temprana) |
| R4 | medium | high | US-705 (PAC Sandbox), US-802 (Timbrado DIAN) |
| R5 | high | high | US-804 (Migración Datos SEDI rehearsal) |
| R6 | medium | critical | (ninguna — gestión manual) |
| R7 | high | medium | (ninguna — refinement riguroso) |
| R8 | high | high | US-904 (Modo Dual Standby) |

Validación: matriz prob×impacto muestra R1 y R6 en celda crítica (rojo).

#### Paso 6 · Cargar 31 definiciones

25 confirmadas (DEF001-DEF025) con `status = 'confirmed'`.
6 pendientes (DEF-P01 a DEF-P09) con `status = 'pending'` y `blocks_description`:

| Code | Bloquea |
|---|---|
| DEF-P01 | Estrategia BI |
| DEF-P02 | UX PWA |
| DEF-P04 | Sprint Reviews → milestone_id = M1 |
| DEF-P06 | Plan de migración → linked task US-804 |
| DEF-P08 | App PWA → milestone_id = M2 |
| DEF-P09 | Adapter SEDI → linked task US-102 |

Validación: widget "Decisiones pendientes" en Overview muestra las 6 con su bloqueo.

#### Paso 7 · Crear dependencies entre tasks

Las dependencias del plan que se identifican explícitamente:
- US-103 (Dashboard CEO) ← depends_on US-102 (SEDI Adapter)
- US-202 (Ocupancia detalle) ← depends_on US-103
- US-305 (Hardening) ← depends_on todas las US del Sprint 3
- US-802 (Timbrado DIAN) ← depends_on US-705 (PAC Sandbox)
- US-806 (Build Flutter) ← depends_on US-501..504 (Web Inmobiliaria MVP)
- US-902 (Migración datos) ← depends_on US-804 (Migración rehearsal)
- US-903 (Cutover facturación) ← depends_on US-802

Ejecutar `php artisan sinapsys:recalculate-critical-path EF-Ai360`.

Validación: Critical Path widget muestra cadena desde US-102 hasta US-903 atravesando los 5 milestones.

### Criterios de validación de la carga

| Criterio | Estado esperado |
|---|---|
| 13 sections cargadas con `type` correcto | ✅ |
| Burndown S0 muestra "no aplica (discovery)" | ✅ |
| Burndown S1-S9 funcional con story_points | ✅ |
| Continuous bands visibles en Timeline para 3 tracks | ✅ |
| 5 milestones como líneas verticales en Timeline | ✅ |
| Critical path destacado con borde rojo en US bloqueantes | ✅ |
| Matriz de riesgos muestra R1, R6 en celda alta×crítica | ✅ |
| Capacity de Sprint 4 muestra "Frontend Mid arranca este sprint" | ✅ |
| Decisiones pendientes con bloqueos visibles en Overview | ✅ |
| Push notification se dispara cuando una task está a 24h de su due_date | ✅ |

Si los 10 criterios pasan: **v3.0 está validada en uso real**.

---

## 13. Riesgos y mitigaciones

| # | Riesgo | Probabilidad | Impacto | Mitigación |
|---|---|---|---|---|
| **R1** | Critical path con grafos grandes (>100 tasks) lento | Media | Medio | Persistir `on_critical_path` en BD, cron diario en lugar de on-the-fly. Si >500 tasks, recalcular incremental solo subgrafos afectados. |
| **R2** | minishlink/web-push requiere extensiones PHP no disponibles en hosting A2 | Alta | Alto | Verificar GMP/MBString en hosting antes de día 6. Plan B: usar Pusher Beams (SaaS) con cambio de service interface. |
| **R3** | Cron schedule:run no se ejecuta por config de hosting | Media | Alto | Verificar cron del sistema en pre-deploy. Plan B: invocar comandos via webhook desde GitHub Actions cada hora. |
| **R4** | Carga de EF-Ai360 revela gap no anticipado | Media | Medio | Reservar 0.5d de buffer para fix mientras se carga. Documentar workaround si aparece y posponer fix a v3.1. |
| **R5** | Capacity Planner overcomplica wizard de creación | Media | Bajo | Paso "Capacity" es opcional. Skip default = 100% para todos. |
| **R6** | Risk register se vuelve administrativo / nadie lo mantiene | Alta | Bajo | Solo tres campos obligatorios (name, prob, impact). Resto opcional. Push notification cuando un riesgo se materializa lo mantiene vivo. |
| **R7** | Notification spam si hay muchas tasks vencidas | Media | Medio | `notification_log` impide enviar duplicados (unique check user+type+task_id+día). |
| **R8** | Migration de v2.1→v3.0 con datos existentes rompe Burndown | Baja | Alto | Default `sections.type = 'sprint'` preserva comportamiento. Tests de no-regresión obligatorios antes de deploy. |

---

## 14. Criterios de aceptación

### v3.0 está hecha cuando:

#### Backend
- [ ] 6 migrations nuevas ejecutan limpio en BD existente sin pérdida de datos
- [ ] 6 models nuevos con relaciones definidas
- [ ] 4 services nuevos (`CriticalPathCalculator`, `MilestoneTracker`, `RiskMatrixCalculator`, `CapacityPlanner`) con tests unitarios al 100%
- [ ] PushNotificationService envía push real a 1 dispositivo iOS 16.4+ y 1 Android
- [ ] 2 commands (`CheckUpcomingDeadlines`, `CheckUpcomingMilestones`) corren via scheduler
- [ ] `grep "->validate(" app/Http/Controllers/PushController.php` retorna 0 (Issue 1 cerrado)
- [ ] `composer show minishlink/web-push` retorna versión instalada (Issue 2 cerrado)

#### Frontend
- [ ] Vista Project Overview muestra widgets: milestones, riesgos, critical path, capacity, decisiones pendientes
- [ ] Timeline muestra: barras tasks, líneas verticales milestones, bandas continuous, borde rojo critical path
- [ ] Burndown S0 muestra "no aplica" cuando section es type discovery
- [ ] Matriz de riesgos prob×impacto interactiva
- [ ] Wizard de creación incluye paso opcional de capacity
- [ ] Component `PushOptIn` permite activar notificaciones desde Profile

#### Tests
- [ ] `php artisan test` pasa al 100%
- [ ] Tests específicos para 4 services nuevos
- [ ] Tests de integración para 2 triggers de push (con fixtures de fechas)
- [ ] Smoke test E2E: cargar EF-Ai360 según sección 12 sin workarounds

#### Carga EF-Ai360 (sección 12)
- [ ] Los 10 criterios de validación de la carga pasan
- [ ] Cero workarounds usados
- [ ] Documentación de la carga generada como `docs/ef-ai360-load.md` para futuro reference

#### Documentación
- [ ] `CLAUDE.md` actualizado con nuevos services y reglas
- [ ] README versionado: v1.x → v2.0 → v2.1 → v3.0
- [ ] Migration guide v2.1 → v3.0 escrita

### Validación final v3.0

> ✅ **Antes de declarar v3.0 lista para producción**
>
> 1. EF-Ai360 cargado completo según sección 12 — **smoke test integral**
> 2. Equipo SinapSYS opera 1 sprint real (Sprint 1) en staging por 2 semanas
> 3. Push notification verificada llegando a iOS 16.4+ y Android
> 4. Critical path se mantiene correcto cuando se reasignan dependencias
> 5. Cero regresiones en proyectos PMI v1/v2/v2.1 existentes
>
> Si los 5 puntos pasan: deploy a producción y SinapSYS Projects v3.0 está listo para gestionar EF-Ai360 y proyectos similares.

---

**DDS · SinapSYS Projects v3.0 · Gestión de proyectos complejos**

*SinapSYS Ecosistemas SAS de CV · contacto@sinapsys.app · Mayo 2026*
*Caso de validación: EF-Ai360 (Estructurar Futuro)*
