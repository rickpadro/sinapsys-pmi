# DDS · SinapSYS Projects v2.1

**Cierre de gaps de v2.0 + Fase 4 (P-01 a P-08)**

> Documento incremental. Asume que v2.0 ya está implementada (commit `4b58a97` — fases 1, 2 y 3 funcionales). Cierra los gaps estructurales detectados en auditoría y formaliza Fase 4.

---

| Campo | Valor |
|---|---|
| **Versión** | v2.1 |
| **Estado** | Diseño |
| **Tipo** | Incremento sobre v2.0 |
| **Stack** | Laravel 12 + Inertia.js 2 + React 19 + Tailwind v4 + shadcn/ui + MySQL 8 |
| **Fases** | Fase 3.5 (refactor obligatorio) + Fase 4 (8 features) |
| **Audiencia** | Equipo SinapSYS |
| **Autor** | SinapSYS Ecosistemas SAS de CV |
| **Fecha** | Mayo 2026 |
| **Predecesor** | DDS v2.0 (Mayo 2026) |

---

## Tabla de contenidos

1. [Contexto y objetivo](#1-contexto-y-objetivo)
2. [Auditoría de v2.0 — resumen ejecutivo](#2-auditoría-de-v20--resumen-ejecutivo)
3. [Fase 3.5 · Cierre de gaps estructurales](#3-fase-35--cierre-de-gaps-estructurales)
4. [Refactor backend · Form Requests + Service](#4-refactor-backend--form-requests--service)
5. [Refactor frontend · Componentes + Hooks](#5-refactor-frontend--componentes--hooks)
6. [Corrección documental · CLAUDE.md y rutas](#6-corrección-documental--claudemd-y-rutas)
7. [Fase 4 · Decisiones P-01 a P-08](#7-fase-4--decisiones-p-01-a-p-08)
8. [Roadmap de implementación v2.1](#8-roadmap-de-implementación-v21)
9. [Riesgos y mitigaciones](#9-riesgos-y-mitigaciones)
10. [Criterios de aceptación](#10-criterios-de-aceptación)

---

## 1. Contexto y objetivo

### Por qué este DDS

v2.0 está funcionalmente completa: las 7 migraciones nuevas existen, los 6 modelos Eloquent están, las rutas v2.0 funcionan, el comando `sinapsys:migrate-to-v2` migra proyectos PMI sin daño, y el Board/Timeline/Reports renderizan. El proyecto **EF-Ai360** se puede cargar hoy mismo en Scrum.

Sin embargo, una auditoría línea por línea contra el DDS v2.0 detectó deuda estructural que viola reglas no negociables del propio `CLAUDE.md` y compromete mantenibilidad futura.

### Objetivo del DDS v2.1

**Dos bloques de trabajo independientes:**

1. **Fase 3.5 (refactor obligatorio):** cerrar los 6 gaps estructurales detectados sin agregar features nuevas. Garantiza que el repo cumple las reglas que él mismo declara.

2. **Fase 4 (features pospuestas):** implementar las 8 decisiones abiertas (P-01 a P-08) del DDS v2.0 con orden y criterio.

### Lo que NO cambia

- Modelo de datos (BD intacta — cero migrations nuevas en Fase 3.5)
- Rutas existentes (cero breaking changes)
- Funcionalidad usuario-final (refactor invisible)
- Stack tecnológico (sin upgrades)

### Lo que sí cambia

- 6 Form Requests nuevos absorben validaciones inline
- 18 sub-componentes React extraídos de pages monolíticas
- 4 hooks personalizados creados
- 1 servicio (`CustomFieldResolver`) extraído
- `CLAUDE.md` corregido (Laravel 12, regla phase_tasks JSON derogada)
- Fase 4 agrega 8 features bajo bandera

---

## 2. Auditoría de v2.0 — resumen ejecutivo

Hallazgos de la revisión del repo `rickpadro/sinapsys-pmi` commit `4b58a97`.

### Cumplimiento por capa

| Capa | DDS v2.0 exige | Implementado | Estado |
|---|---|---|---|
| Migrations BD | 7 nuevas + 3 alter | 7 + 3 | ✅ 100% |
| Models Eloquent | 6 nuevos | 6 | ✅ 100% |
| Routes | 100% rutas v2.0 | 100% | ✅ 100% |
| Comando migración | `sinapsys:migrate-to-v2` | Implementado | ✅ 100% |
| Seeder templates | `MethodologyTemplatesSeeder` | Implementado | ✅ 100% |
| Controllers | 10 | 8 (2 fusionados) | ⚠️ 90% |
| Services | 6 | 5 | ⚠️ 83% |
| Form Requests | ~10 | 4 | ❌ 40% |
| Pages React | 10 | 7 (2 inline en otras) | ⚠️ 70% |
| Components React | 18 sub-componentes | 3 separados | ❌ 17% |
| Hooks personalizados | 4 | 0 | ❌ 0% |

### Gaps críticos (violaciones de regla)

> ⚠️ **Gap 1 · Validación inline en controllers**
>
> 6 ocurrencias de `$request->validate(...)` en controllers v2.0 (SectionController, CustomFieldController, ProjectRoleController × 2, BoardViewController, TaskStepController). Viola CLAUDE.md regla 2: *"Validación en Form Requests. Controllers no validan."*

> ⚠️ **Gap 2 · Componentes inline en pages**
>
> 18 componentes que el DDS lista como archivos separados están inline dentro de pages (Wizard 3 pasos en CreateWizard, charts inline en Burndown/Velocity, edición de sections inline en SectionList). Hoy ningún archivo pasa 300 líneas, pero el primer cambio de tamaño rompe la regla.

> ⚠️ **Gap 3 · Cero hooks personalizados**
>
> Los 4 hooks del DDS (`useDragDrop`, `useCustomFields`, `useMethodologyView`, `useBurndown`) no existen. Lógica de fetching y cálculo está inline en pages.

### Gaps menores

- **Gap 4:** `CustomFieldResolver` service no existe — lógica polimórfica inline en controllers
- **Gap 5:** `CLAUDE.md` dice "Laravel 11" pero `composer.json` declara `^12.0`
- **Gap 6:** `CLAUDE.md` regla 4 ("phase_tasks JSON. No entidades separadas") no marcada como derogada por v2.0
- **Gap 7:** Pages `/templates` y `/projects/{p}/sections` listadas en DDS v2.0 no existen (funcionalidad cubierta inline en otras pages — gap más documental que técnico)

---

## 3. Fase 3.5 · Cierre de gaps estructurales

Refactor obligatorio antes de Fase 4. Tiempo estimado: **2-3 días**.

### Filosofía del refactor

> **Cero cambios funcionales.**
>
> Después de Fase 3.5, el usuario no debe notar ninguna diferencia. Mismo Board, mismo Burndown, mismas rutas, misma BD. El refactor es 100% interno.

### Bloques de trabajo

#### Bloque A · Backend (1 día)
Form Requests nuevos + extracción de servicio `CustomFieldResolver`. Sin tocar BD, sin tocar rutas, sin tocar lógica de negocio.

#### Bloque B · Frontend (1.5 días)
Extracción de sub-componentes desde pages monolíticas. Creación de 4 hooks. Cero cambios visuales, cero cambios de comportamiento.

#### Bloque C · Documentación (0.5 día)
Corrección de `CLAUDE.md`. Actualización de comentarios obsoletos. Verificación de consistencia.

### Criterio de "hecho"

Para cada gap, el criterio es binario:

| Gap | Criterio de cierre |
|---|---|
| Gap 1 | `grep "->validate(" app/Http/Controllers/` retorna 0 líneas |
| Gap 2 | Cada componente del DDS v2.0 sección 7 existe como archivo separado |
| Gap 3 | Directorio `resources/js/Hooks/` existe con los 4 archivos |
| Gap 4 | `app/Services/CustomFieldResolver.php` existe y se usa en controllers |
| Gap 5 | `CLAUDE.md` dice "Laravel 12" |
| Gap 6 | `CLAUDE.md` regla 4 marcada como `~~tachada~~` o reemplazada |

---

## 4. Refactor backend · Form Requests + Service

### 4.1 Form Requests a crear

#### `ReorderSectionsRequest`

**Reemplaza:** `SectionController.php:54` validación inline.

```php
<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class ReorderSectionsRequest extends FormRequest
{
    public function authorize(): bool
    {
        $project = $this->route('project');
        return $this->user()->can('update', $project);
    }

    public function rules(): array
    {
        return [
            'order'   => ['required', 'array', 'min:1'],
            'order.*' => ['integer', 'exists:sections,id'],
        ];
    }
}
```

**Cambio en controller:**
```php
// Antes
public function reorder(Request $request, Project $project) {
    $request->validate(['order' => ['required', 'array']]);
    // ...
}

// Después
public function reorder(ReorderSectionsRequest $request, Project $project) {
    // request ya validado
}
```

#### `MoveTaskRequest`

**Reemplaza:** `BoardViewController.php:54` validación inline (drag-drop entre columnas).

```php
public function rules(): array
{
    return [
        'task_id'           => ['required', 'integer', 'exists:tasks,id'],
        'section_id'        => ['required', 'integer', 'exists:sections,id'],
        'order_in_section'  => ['required', 'integer', 'min:0'],
    ];
}
```

#### `UpsertCustomFieldValueRequest`

**Reemplaza:** validación inline de `CustomFieldController::upsertValue`.

```php
public function rules(): array
{
    return [
        'custom_field_id' => ['required', 'integer', 'exists:custom_fields,id'],
        'target_type'     => ['required', 'string', 'in:project,section,task,task_step'],
        'target_id'       => ['required', 'integer'],
        'value'           => ['nullable', 'string', 'max:5000'],
        'value_json'      => ['nullable', 'array'],
    ];
}
```

#### `StoreProjectRoleRequest` y `UpdateProjectRoleRequest`

**Reemplaza:** `ProjectRoleController.php:29` y `:49`.

```php
public function rules(): array
{
    return [
        'name'                       => ['required', 'string', 'max:50'],
        'permissions'                => ['required', 'array'],
        'permissions.can_edit'       => ['boolean'],
        'permissions.can_invite'     => ['boolean'],
        'permissions.can_delete'     => ['boolean'],
        'permissions.can_view_reports' => ['boolean'],
        'is_default'                 => ['boolean'],
        'order'                      => ['integer', 'min:0'],
    ];
}
```

#### `ReorderTaskStepsRequest`

**Reemplaza:** `TaskStepController.php:64`.

```php
public function rules(): array
{
    return [
        'order'   => ['required', 'array', 'min:1'],
        'order.*' => ['integer', 'exists:task_steps,id'],
    ];
}
```

#### `CreateProjectFromTemplateRequest`

**Para uso futuro en wizard — actualmente la lógica está en `ProjectController::storeFromTemplate` con validación inline.**

```php
public function rules(): array
{
    return [
        'template_id'   => ['required', 'integer', 'exists:methodology_templates,id'],
        'name'          => ['required', 'string', 'max:255'],
        'description'   => ['nullable', 'string'],
        'color'         => ['nullable', 'string', 'regex:/^#[0-9A-Fa-f]{6}$/'],
        'start_date'    => ['nullable', 'date'],
        'end_date'      => ['nullable', 'date', 'after_or_equal:start_date'],
    ];
}
```

### 4.2 Service `CustomFieldResolver`

**Propósito:** centralizar lógica polimórfica de lectura/escritura de custom field values. Hoy está inline en controllers, lo que duplica casts y dificulta extensión.

```php
<?php

namespace App\Services;

use App\Models\CustomField;
use App\Models\CustomFieldValue;
use Illuminate\Database\Eloquent\Model;

class CustomFieldResolver
{
    /** Recupera todos los valores de custom fields para una entidad target. */
    public function valuesFor(Model $target): array
    {
        return CustomFieldValue::where('target_type', $target->getMorphClass())
            ->where('target_id', $target->getKey())
            ->with('customField')
            ->get()
            ->mapWithKeys(fn($v) => [$v->customField->slug => $this->cast($v)])
            ->toArray();
    }

    /** Upsert de un valor con cast según field_type. */
    public function set(Model $target, CustomField $field, mixed $value): CustomFieldValue
    {
        return CustomFieldValue::updateOrCreate(
            [
                'custom_field_id' => $field->id,
                'target_type'     => $target->getMorphClass(),
                'target_id'       => $target->getKey(),
            ],
            $this->payloadFor($field, $value)
        );
    }

    /** Cast del valor leído según el tipo del field. */
    private function cast(CustomFieldValue $v): mixed
    {
        return match ($v->customField->field_type) {
            'number'        => is_numeric($v->value) ? (float) $v->value : null,
            'boolean'       => filter_var($v->value, FILTER_VALIDATE_BOOLEAN),
            'date'          => $v->value ? \Carbon\Carbon::parse($v->value) : null,
            'multi_select'  => $v->value_json ?? [],
            default         => $v->value,
        };
    }

    /** Decide si va en `value` (texto) o `value_json` (estructurado). */
    private function payloadFor(CustomField $field, mixed $value): array
    {
        if ($field->field_type === 'multi_select') {
            return ['value_json' => is_array($value) ? $value : [], 'value' => null];
        }
        return ['value' => is_scalar($value) ? (string) $value : null, 'value_json' => null];
    }
}
```

**Uso en controller (después del refactor):**
```php
public function upsertValue(UpsertCustomFieldValueRequest $req, CustomFieldResolver $resolver)
{
    $field  = CustomField::findOrFail($req->validated('custom_field_id'));
    $target = $this->resolveTarget($req->validated('target_type'), $req->validated('target_id'));
    $resolver->set($target, $field, $req->validated('value') ?? $req->validated('value_json'));
    return back();
}
```

### 4.3 Authorization (bonus)

Aprovechar el refactor para mover `authorize()` a los Form Requests (hoy hay inconsistencia: algunos controllers verifican ownership inline). Cada Request resuelve permisos según rol del usuario en el proyecto.

Patrón:
```php
public function authorize(): bool
{
    $project = $this->route('project') ?? $this->route('task')?->project;
    return $this->user()->can('update', $project);
}
```

Requiere `ProjectPolicy` (probablemente ya existe — validar). Si no existe, crear stub mínimo en este refactor.

---

## 5. Refactor frontend · Componentes + Hooks

### 5.1 Componentes a extraer

#### Components/Sections/

**Estado actual:** `SectionList.jsx` (230 líneas) contiene card, editor modal y lógica de drag.

**Refactor:**

| Componente nuevo | Líneas est. | Extraído de | Props |
|---|---|---|---|
| `SectionCard.jsx` | ~80 | `SectionList.jsx` | `section`, `onEdit`, `onDelete`, `dragHandleProps` |
| `SectionEditor.jsx` | ~100 | `SectionList.jsx` (modal inline) | `section?`, `onSave`, `onCancel`, `open` |
| `SectionReorderable.jsx` | ~50 | `SectionList.jsx` (wrapper @dnd-kit) | `sections`, `onReorder`, `children` |

**`SectionList.jsx` final:** ~50 líneas, solo orquestación.

#### Components/Board/

**Estado actual:** `BoardColumn.jsx` (104) y `BoardCard.jsx` (85) ya existen ✓.

**Refactor:** crear los 2 faltantes.

| Componente nuevo | Líneas est. | Propósito |
|---|---|---|
| `BoardDragLayer.jsx` | ~60 | Overlay visual durante drag (DragOverlay de @dnd-kit) |
| `BoardFilters.jsx` | ~120 | Filtros por assignee, prioridad, custom field. Hoy inline en `BoardView.jsx` |

#### Components/Timeline/

**Estado actual:** `TimelineView.jsx` (159 líneas) contiene Gantt + filas + header inline.

**Refactor:**

| Componente nuevo | Líneas est. | Propósito |
|---|---|---|
| `TimelineGantt.jsx` | ~100 | Contenedor del Gantt con CSS Grid |
| `TimelineRow.jsx` | ~60 | Fila por section o task con barra |
| `TimelineHeader.jsx` | ~50 | Escala temporal (días/semanas/meses) |

#### Components/CustomFields/

**Estado actual:** `CustomFields/Index.jsx` (196 líneas) tiene editor + lista inline.

**Refactor:**

| Componente nuevo | Líneas est. | Propósito |
|---|---|---|
| `CustomFieldEditor.jsx` | ~120 | Modal de definición (name, type, options, required) |
| `CustomFieldValueInput.jsx` | ~80 | Input dinámico según `field_type` |
| `CustomFieldDisplay.jsx` | ~40 | Render readonly para vistas no-editables |

#### Components/CreateWizard/

**Estado actual:** `Pages/Projects/CreateWizard.jsx` (269 líneas — el más cercano al límite) tiene los 3 pasos inline.

**Refactor:**

| Componente nuevo | Líneas est. | Propósito |
|---|---|---|
| `StepTemplate.jsx` | ~120 | Galería de templates (Scrum/PMI/Custom) con preview |
| `StepProjectData.jsx` | ~100 | Form: name, description, color, fechas |
| `StepConfirm.jsx` | ~80 | Preview de sections + custom fields del template + roles |
| `WizardNav.jsx` | ~50 | Breadcrumb superior + botones Atrás/Siguiente |

**`CreateWizard.jsx` final:** ~80 líneas, solo state machine de pasos.

#### Components/Reports/

**Estado actual:** `Burndown.jsx` (149) y `Velocity.jsx` (156) tienen Recharts inline.

**Refactor:**

| Componente nuevo | Líneas est. | Propósito |
|---|---|---|
| `BurndownChart.jsx` | ~100 | LineChart ideal vs real (reusable cross-page) |
| `VelocityChart.jsx` | ~80 | BarChart histórico de velocity |
| `SprintReportCard.jsx` | ~60 | Resumen por sprint (completion, story points) |

### 5.2 Hooks a crear

Directorio nuevo: `resources/js/Hooks/`.

#### `useDragDrop.js`

Abstrae configuración común de `@dnd-kit/core` (sensors, collision detection, modifiers).

```javascript
import { useSensors, useSensor, PointerSensor, KeyboardSensor } from '@dnd-kit/core';
import { sortableKeyboardCoordinates } from '@dnd-kit/sortable';

export function useDragDrop() {
    const sensors = useSensors(
        useSensor(PointerSensor, { activationConstraint: { distance: 8 } }),
        useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates }),
    );
    return { sensors };
}
```

#### `useCustomFields(projectId)`

Fetch + cache de definiciones de custom fields del proyecto.

```javascript
import { useState, useEffect } from 'react';
import { router } from '@inertiajs/react';

export function useCustomFields(projectId) {
    const [fields, setFields] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        // Inertia partial reload o axios directo según patrón del proyecto
        fetch(`/projects/${projectId}/custom-fields/list`)
            .then(r => r.json())
            .then(setFields)
            .finally(() => setLoading(false));
    }, [projectId]);

    return { fields, loading };
}
```

> Nota: este hook **requiere** un endpoint nuevo `GET /projects/{project}/custom-fields/list` que retorne JSON puro (no Inertia). Es la única excepción a la regla "controllers retornan Inertia::render", justificada por ser API interna del frontend. Marcar como `Route::get(...)->withoutMiddleware('inertia')`.

#### `useMethodologyView(project)`

Devuelve la vista correcta según `project.default_view`.

```javascript
export function useMethodologyView(project) {
    const view = project?.default_view ?? 'list';
    const path = {
        list:     `/projects/${project.id}`,
        board:    `/projects/${project.id}/board`,
        timeline: `/projects/${project.id}/timeline`,
        calendar: `/calendar?project=${project.id}`,
    };
    return { view, path: path[view] };
}
```

#### `useBurndown(projectId, sectionId)`

Calcula puntos restantes del chart.

```javascript
import { useState, useEffect } from 'react';

export function useBurndown(projectId, sectionId) {
    const [data, setData] = useState({ ideal: [], actual: [], loading: true });

    useEffect(() => {
        if (!sectionId) return;
        fetch(`/projects/${projectId}/reports/burndown/data?section=${sectionId}`)
            .then(r => r.json())
            .then(d => setData({ ...d, loading: false }));
    }, [projectId, sectionId]);

    return data;
}
```

### 5.3 Pages a crear/refactorizar

| Page | Acción | Razón |
|---|---|---|
| `Pages/Templates/Index.jsx` | Crear | DDS v2.0 lo lista; hoy galería está dentro de wizard |
| `Pages/Sections/Index.jsx` | Crear | Editor dedicado fuera de Show.jsx |
| `Pages/Projects/Show.jsx` | Verificar | No tocar si funciona |
| `Pages/Projects/CreateWizard.jsx` | Refactor | Reducir a orquestación pura |
| `Pages/Reports/Burndown.jsx` | Refactor | Usar `<BurndownChart>` y `useBurndown` |
| `Pages/Reports/Velocity.jsx` | Refactor | Usar `<VelocityChart>` |

---

## 6. Corrección documental · CLAUDE.md y rutas

### 6.1 Cambios obligatorios en CLAUDE.md

#### Cambio 1 · Stack version

```diff
- Laravel 11 + Inertia.js 2 + React 19 + Tailwind CSS v4 + shadcn/ui + MySQL 8 + Sanctum + Anthropic API + Recharts
+ Laravel 12 + Inertia.js 2 + React 19 + Tailwind CSS v4 + shadcn/ui + MySQL 8 + Sanctum + Anthropic API + Recharts
```

#### Cambio 2 · Regla 4 (phase_tasks JSON) — derogación explícita

```diff
- 4. **Phase tasks son JSON en `projects.phase_tasks`.** No entidades separadas.
+ 4. ~~**Phase tasks son JSON en `projects.phase_tasks`.** No entidades separadas.~~ **DEROGADA por DDS v2.0.** Sections son tabla normalizada (`sections`). El campo `projects.phase_tasks` se mantiene 1 release como deprecation y se elimina vía `php artisan sinapsys:cleanup-v1-fields`.
```

#### Cambio 3 · Sección "Reglas No Negociables" — agregar regla 9

```diff
+ 9. **Custom Fields polimórficos solo vía `CustomFieldResolver` service.** Nunca acceder `custom_field_values` directo desde controllers o componentes — usar el service para garantizar casts correctos.
```

#### Cambio 4 · Sección "Estructura" — agregar Hooks

```diff
- - `resources/js/Lib/` — Utilidades (cn, constants)
+ - `resources/js/Hooks/` — Hooks personalizados (useDragDrop, useCustomFields, useMethodologyView, useBurndown)
+ - `resources/js/Lib/` — Utilidades (cn, constants)
```

### 6.2 README.md — agregar sección v2.0/v2.1

Bloque a insertar:

```markdown
## Versionado

- **v1.x** — Plataforma PMI única. `phase_tasks` JSON.
- **v2.0** (commit 4b58a97) — Multi-metodología. Sections normalizadas, Custom Fields, Board view, reportes Scrum.
- **v2.1** — Refactor estructural + Fase 4 (real-time, dependencias, time tracking).

Ver `.docs/DDS_SinapSYS_Projects_v2.md` y `.docs/DDS_SinapSYS_Projects_v2.1.md`.
```

### 6.3 Rutas — endpoints nuevos requeridos por hooks

```php
// Para useCustomFields
Route::get('projects/{project}/custom-fields/list', [CustomFieldController::class, 'listJson'])
    ->name('custom-fields.list-json');

// Para useBurndown
Route::get('projects/{project}/reports/burndown/data', [BurndownReportController::class, 'data'])
    ->name('reports.burndown.data');
```

Ambos retornan `response()->json(...)` — excepción documentada a la regla 1 de CLAUDE.md.

---

## 7. Fase 4 · Decisiones P-01 a P-08

Resolución de los 8 pendientes del DDS v2.0 sección 11. **Cada P se evalúa con criterio: hacer ahora / posponer / descartar.**

### P-01 · Templates adicionales (Kanban / OKR / GTD)

**Decisión:** ✅ **HACER — solo Kanban puro.** OKR y GTD posponer.

**Justificación:** Kanban se obtiene casi gratis del modelo Scrum (sections como columnas, sin sprints, sin story points obligatorios). Aporta valor inmediato a equipos que no quieren ceremonial Scrum.

**Implementación:**
- 1 seeder addition: template `kanban` con sections `Por hacer / En progreso / En revisión / Hecho` y custom fields opcionales (etiqueta, bloqueo)
- 0 código backend nuevo
- 0 código frontend nuevo (vista Board ya existe)

**Esfuerzo:** 2h

### P-02 · Vista Calendar dedicada por proyecto

**Decisión:** ❌ **DESCARTAR.** La Calendar global ya muestra tareas con filtro por proyecto. Crear una page dedicada es duplicación.

**Justificación:** El Calendar actual con filtro por proyecto cubre el caso. Una page dedicada agrega mantenimiento sin valor diferencial. Si aparece demanda concreta de funcionalidad específica de calendar por proyecto (ej: vista de sprints como bloques), reabrir.

### P-03 · Subtareas anidadas multi-nivel (TaskStep → SubStep → ...)

**Decisión:** ❌ **DESCARTAR definitivamente.**

**Justificación:** 2 niveles (Task → TaskStep) cubren >95% de casos. Permitir anidamiento arbitrario:
- Complica drag-and-drop exponencialmente
- Rompe vista Board (¿cómo se visualiza un step de step en una card?)
- Aumenta carga cognitiva sin caso de uso real
- El patrón "épica > task > subtask" se modela con Sections jerárquicas en Fase 5 si surge

**Alternativa:** Si necesitas más granularidad, usa TaskStep + descripción rica. No anidación.

### P-04 · Dependencias entre tasks (predecesoras / Gantt real)

**Decisión:** ✅ **HACER en Fase 4.** Crítico para EF-Ai360 si entra en Ejecución.

**Modelo:**

```php
Schema::create('task_dependencies', function (Blueprint $table) {
    $table->id();
    $table->foreignId('task_id')->constrained()->cascadeOnDelete();
    $table->foreignId('depends_on_task_id')->constrained('tasks')->cascadeOnDelete();
    $table->enum('type', ['finish_to_start', 'start_to_start', 'finish_to_finish'])
          ->default('finish_to_start');
    $table->integer('lag_days')->default(0);
    $table->timestamps();

    $table->unique(['task_id', 'depends_on_task_id']);
});
```

**Validación crítica:** evitar ciclos. Service `DependencyValidator` con DFS antes de crear/actualizar.

**UI:**
- En Timeline: flechas conectoras entre barras
- En Task editor: nuevo tab "Dependencias" con multiselect de tasks
- Indicador visual en Board: ícono 🔗 si task tiene dependencias bloqueantes pendientes

**Esfuerzo:** 3-4 días

### P-05 · Real-time collaboration (Pusher / Reverb)

**Decisión:** ⏸️ **POSPONER a v2.2.** Requiere infraestructura.

**Justificación:** Útil pero no crítico para uso interno actual (1-3 usuarios concurrentes). Reverb requiere proceso WebSocket persistente — complica deploy en hosting compartido A2. Cuando el equipo crezca o EF-Ai360 sume más colaboradores, evaluar.

**Cuando se haga, qué eventos broadcast:**
- `TaskMoved` (drag-drop en Board)
- `SectionReordered`
- `TaskUpdated` (status, assignee)
- `CommentAdded` (cuando exista comments)

### P-06 · Webhooks / Integraciones externas

**Decisión:** ⏸️ **POSPONER hasta caso de uso concreto.**

**Justificación:** Sin un caso de uso específico (ej: "notificar a Slack cuando se cierra un sprint"), construir webhooks es over-engineering. Mejor reaccionar a la demanda.

**Cuando aparezca un caso, patrón base:**
- Tabla `webhooks` con `project_id`, `event`, `url`, `secret`, `active`
- Job `DispatchWebhook` con retry + signing HMAC
- UI mínima: 1 form en project settings

### P-07 · Time tracking real (cronómetro / actual_time)

**Decisión:** ✅ **HACER en Fase 4 — versión simple.** No cronómetro UI complejo, solo input manual.

**Modelo:**
```php
Schema::create('time_entries', function (Blueprint $table) {
    $table->id();
    $table->foreignId('task_id')->constrained()->cascadeOnDelete();
    $table->foreignId('user_id')->constrained();
    $table->integer('minutes');
    $table->date('logged_on');
    $table->text('description')->nullable();
    $table->timestamps();

    $table->index(['task_id', 'logged_on']);
});
```

**UI:**
- En task: botón "+ Registrar tiempo" → modal con minutos, fecha, descripción
- Mostrar suma vs `estimated_time` (Estimado: 4h · Reportado: 5.5h · Diferencia: +1.5h)
- Reporte: Tiempo total por usuario por proyecto

**Lo que NO hacemos:** cronómetro live, integración Toggl, facturación, timesheets aprobables. Eso es producto distinto.

**Esfuerzo:** 2 días

### P-08 · Mobile (PWA dedicada vs nativa)

**Decisión:** ✅ **HACER PWA en Fase 4** — ya hay manifest básico, completar.

**Justificación:** El repo ya sirve `/manifest.json` con icons. Falta:
1. Service Worker funcional (offline cache de shell + sync queue)
2. Push notifications via VAPID (DDS v2.0 lo mencionaba pero no se implementó)
3. UX adaptada a mobile en pages críticas (Board scrollable horizontal, Timeline pinch-to-zoom)

**No hacer:** app nativa. PWA cubre el caso, instala desde Safari iOS 16.4+ y Chrome Android.

**Esfuerzo:**
- Service Worker + Workbox: 1 día
- VAPID + push backend: 1.5 días
- Mobile UX tweaks: 1 día
- **Total: 3-4 días**

### Resumen de decisiones Fase 4

| ID | Decisión | Esfuerzo | Prioridad |
|---|---|---|---|
| P-01 | Hacer (solo Kanban) | 2h | Alta |
| P-02 | Descartar | — | — |
| P-03 | Descartar | — | — |
| P-04 | Hacer | 3-4 días | Alta |
| P-05 | Posponer v2.2 | — | — |
| P-06 | Posponer (reactivo) | — | — |
| P-07 | Hacer (versión simple) | 2 días | Media |
| P-08 | Hacer (PWA) | 3-4 días | Media |

**Total Fase 4:** ~9-11 días.

---

## 8. Roadmap de implementación v2.1

### Bloque obligatorio: Fase 3.5 (refactor)

| Día | Tareas | Entregable |
|---|---|---|
| 1 AM | Form Requests (6) + ajustar controllers | Validación 100% en Form Requests |
| 1 PM | `CustomFieldResolver` service + integración | Service activo, controllers limpios |
| 2 AM | Components/Sections + Components/Board | 5 componentes extraídos |
| 2 PM | Components/Timeline + Components/CustomFields | 6 componentes extraídos |
| 3 AM | Components/CreateWizard + Components/Reports | 7 componentes extraídos, CreateWizard de 269→80 líneas |
| 3 PM | Hooks (4) + correcciones CLAUDE.md/README | Hooks/ creado, docs corregidos |

**Total Fase 3.5:** 3 días.

### Bloque opcional: Fase 4 (features)

| Sem | Días | Foco | Entregable |
|---|---|---|---|
| 1 | 1 | P-01 Kanban template + P-04 migration `task_dependencies` | Seeder Kanban, BD lista para deps |
| 1 | 2-4 | P-04 implementación completa (controller, service, UI Timeline, Task editor) | Dependencias funcionales |
| 2 | 5-6 | P-07 time entries (BD + CRUD + UI mínima) | Time tracking básico |
| 2 | 7 | P-08.1 Service Worker + Workbox | PWA offline shell |
| 2 | 8-9 | P-08.2 VAPID + push notifications backend + frontend | Push funcional iOS 16.4+ |
| 3 | 10-11 | P-08.3 Mobile UX tweaks + testing | v2.1 lista para producción |

**Total Fase 4:** 11 días.

### Cronograma global

- **Fase 3.5 sola:** 3 días — recomendado mínimo absoluto
- **Fase 3.5 + P-04:** 7 días — si EF-Ai360 entra en Ejecución
- **v2.1 completa:** 14 días — si hay capacidad

---

## 9. Riesgos y mitigaciones

| # | Riesgo | Probabilidad | Impacto | Mitigación |
|---|---|---|---|---|
| **R1** | Refactor frontend rompe estado UI durante drag-drop | Media | Alto | Extraer 1 dominio a la vez (Sections, luego Board, etc). Smoke test después de cada extracción. |
| **R2** | Form Requests rompen flow de Inertia (redirect vs validation errors) | Baja | Medio | Verificar que `authorize() = false` retorna 403 esperado y que Inertia maneja errores con `useForm`. |
| **R3** | `CustomFieldResolver` cambia comportamiento de casts vs implementación inline actual | Media | Medio | Test unitario por cada `field_type` antes de migrar controllers. Comparar output con implementación previa. |
| **R4** | Hooks con fetch directo (no Inertia) requieren CSRF + sesión | Alta | Bajo | Usar `axios` con interceptor CSRF de Laravel ya configurado. Documentar en cada hook. |
| **R5** | P-04 dependencias circulares no detectadas | Media | Alto | DFS validator obligatorio en `StoreTaskDependencyRequest`. Test con casos: A→B→A, A→B→C→A. |
| **R6** | P-08 Service Worker cachea contenido stale en dev | Alta | Bajo | Workbox con `skipWaiting` + `clientsClaim`. Documentar `Ctrl+Shift+R` para refresh forzado. |
| **R7** | P-08 VAPID requires HTTPS — no funciona en dev local | Alta | Bajo | Documentar uso de `php artisan serve --port=443` con cert autofirmado o Cloudflare Tunnel. iOS Safari requiere HTTPS válido. |
| **R8** | Refactor incrementa LOC sin valor visible al usuario | Alta | Bajo | Comunicar a stakeholders que es deuda técnica acordada en DDS, no feature. Métrica: 0 cambios en `tests/` (si pasan, refactor está bien). |

---

## 10. Criterios de aceptación

### Fase 3.5 está hecha cuando:

- [ ] `grep -rn "->validate(" app/Http/Controllers/` retorna **0 líneas** en controllers v2.0
- [ ] `find app/Http/Requests -name "*.php" | wc -l` retorna **≥10** (4 existentes + 6 nuevos)
- [ ] `app/Services/CustomFieldResolver.php` existe y se importa en `CustomFieldController`
- [ ] `find resources/js/Components -name "*.jsx" | wc -l` aumenta en **≥18** archivos
- [ ] `resources/js/Hooks/` existe con **4 archivos** `.js`
- [ ] `wc -l resources/js/Pages/Projects/CreateWizard.jsx` retorna **≤120 líneas** (vs 269 original)
- [ ] `grep "Laravel 11" CLAUDE.md` retorna **0 líneas**
- [ ] `grep -A1 "Phase tasks son JSON" CLAUDE.md` muestra texto tachado o `DEROGADA`
- [ ] `php artisan test` pasa **100%** sin cambios en suite de tests
- [ ] Smoke test manual: crear proyecto Scrum desde wizard, mover task en Board, ver Burndown — **todo idéntico a v2.0**

### Fase 4 está hecha cuando (si se ejecuta):

- [ ] Template `kanban` aparece en wizard y crea sections correctas
- [ ] `task_dependencies` migration corre y validator rechaza ciclos
- [ ] Timeline muestra flechas conectoras entre tasks dependientes
- [ ] `time_entries` permite registrar minutos manualmente y suma vs estimado
- [ ] PWA instala desde iOS Safari y Chrome Android
- [ ] Push notification llega a dispositivo iOS 16.4+ tras `task assigned`

### Validación final v2.1

> ✅ **Antes de considerar v2.1 lista**
>
> 1. Cargar proyecto **EF-Ai360** completo (10 sprints)
> 2. Operar 1 sprint real con dependencies + time tracking
> 3. Push notification verificada en mínimo 1 dispositivo iOS y 1 Android
> 4. Burndown chart muestra datos reales de Scrum + time tracking
> 5. Cero regresiones en proyectos PMI existentes (matrix view, viability radar)
>
> Si los 5 puntos pasan, v2.1 está lista para considerar próximo DDS (v2.2).

---

**DDS · SinapSYS Projects v2.1 · Cierre de gaps + Fase 4**

*SinapSYS Ecosistemas SAS de CV · contacto@sinapsys.app · Mayo 2026*
