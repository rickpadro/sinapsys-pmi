# SinapSYS Projects v3.0

Plataforma multi-metodología de gestión de proyectos complejos. Caso de validación: EF-Ai360 (10 sprints · 7 tracks · 8 riesgos · 31 decisiones · 5 hitos).

> Versión actual: **v3.0** (DDS v3.0 completo). Construida sobre v2.1 (refactor estructural + Kanban + dependencias + time tracking + PWA).

## Comandos

- `php artisan serve` — Servidor de desarrollo Laravel
- `npm run dev` — Vite dev server con HMR
- `npm run build` — Build de producción
- `php artisan migrate` — Ejecutar migraciones
- `php artisan migrate:fresh --seed` — Reset DB con datos de ejemplo
- `php artisan test` — Ejecutar tests
- `php artisan test --filter=Feature` — Solo tests de integración
- `php artisan sinapsys:recalculate-critical-path` — Recalcular CPM todos los proyectos
- `php artisan sinapsys:recalculate-critical-path {id}` — Recalcular CPM proyecto específico
- `php artisan sinapsys:check-deadlines` — Notificar tareas que vencen mañana (cron 08:00)
- `php artisan sinapsys:check-milestones` — Notificar hitos próximos (cron 08:15)
- `php artisan vapid:generate` — Generar par de llaves VAPID para push notifications

## Tech Stack

Laravel 12 + Inertia.js 2 + React 19 + Tailwind CSS v4 + shadcn/ui + MySQL 8 + Sanctum + Anthropic API + Recharts

## Arquitectura

### Estructura
- `app/Http/Controllers/` — Controllers de Inertia (retornan Inertia::render)
- `app/Models/` — Eloquent models (Project, Task, Section, Milestone, Risk, ProjectDecision, MemberCapacity)
- `app/Services/` — Lógica de negocio (Anthropic, CriticalPathCalculator, BurndownCalculator, VelocityCalculator, MilestoneTracker, RiskMatrixCalculator, CapacityPlanner, PushNotificationService)
- `app/Http/Requests/` — Form Requests con validación
- `resources/js/Pages/` — Páginas React (una por ruta)
- `resources/js/Components/` — Componentes React organizados por dominio
- `resources/js/Components/ui/` — Primitivas shadcn/ui
- `resources/js/Lib/` — Utilidades (cn, constants)
- `resources/js/Hooks/` — Hooks personalizados (useDragDrop, useCustomFields, useMethodologyView, useBurndown)
- `database/migrations/` — Migraciones MySQL

### Flujo de Datos
Browser → Inertia request → Laravel Controller → Eloquent → MySQL → Controller retorna Inertia::render(Page, props) → React renderiza con props del server.

### Patrones Clave
- Server-driven state: todo el estado viene como props via Inertia. No store global.
- Controllers retornan `Inertia::render('Page', $data)` — nunca JSON directo.
- Validación en Form Requests — nunca en controllers.
- Servicios para lógica compleja (IA, exports, cálculos).
- Soft delete en proyectos, hard delete en tareas.

## Reglas de Código

1. **Un componente por archivo.** Máximo 300 líneas. Si es más largo, extraer sub-componentes.
2. **Path alias:** `@/` para `resources/js/`. Configurar en `vite.config.js`.
3. **No barrel exports.** Importar directo del archivo fuente.
4. **Controllers delgados.** Lógica en Services o Model scopes.
5. **Colocar componentes con su página.** `Components/Projects/` para componentes usados en `Pages/Projects/`.

## Sistema de Diseño

### Colores (CSS custom properties)
- `--primary: #4A6CF7` — Botones, links, acentos
- `--background: #F6F7FB` / dark `#1A1B2E`
- `--surface: #FFFFFF` / dark `#232438`
- `--sidebar: #1E1F2B` / dark `#141521`
- `--text: #323338` / dark `#E8E8EA`
- `--muted: #676879` / dark `#9B9DB0`
- `--border: #E6E9EF` / dark `#2E3047`
- `--destructive: #E44258` — Errores, vencidas
- `--success: #00CA72` — Completado
- `--warning: #FDAB3D` — Prioridad alta

### Prioridades
- P1 Crítica: `#E44258` ▲ | P2 Alta: `#FDAB3D` ● | P3 Media: `#4A6CF7` ▸ | P4 Baja: `#C4C4C4` ○

### Tipografía
- Fuente: Inter, 14px body, 28px h1. Headings: 600-700 weight.

### Estilo
- Border radius: 6px botones, 8px cards, 12px modales
- Sombras: `0 1px 3px rgba(0,0,0,0.08)` cards
- Sidebar: 260px expandido, 64px colapsado
- Estética: Monday.com — limpio, denso, colores vibrantes por contexto

## Variables de Entorno

| Variable | Descripción |
|----------|-------------|
| `DB_DATABASE` | sinapsys_projects |
| `ANTHROPIC_API_KEY` | API key de Anthropic |
| `ANTHROPIC_MODEL` | claude-sonnet-4-20250514 |

## The Foreman

- Sé conciso. Sin openers ("Sure!") ni cierres genéricos.
- Piensa antes de actuar. Lee archivos existentes antes de escribir código.
- Prefiere editar archivos existentes sobre reescribirlos.
- No re-leas archivos que ya tienes en contexto.
- Prueba antes de declarar completo. Si funciona, avanza al siguiente paso.
- No refactorices código que ya pasa sus tests.
- No hagas sugerencias más allá del paso actual del build.
- Mantén soluciones simples. Tres líneas similares > abstracción prematura.
- Las instrucciones del usuario siempre sobreescriben este archivo.
- Return code first. Explicación solo si no es obvio.
- Al construir CRUD, escribe route handler + validación + lógica juntos en un solo paso.
- No agregues error handling para escenarios imposibles con el modelo de datos actual.

## Tool Call Awareness

- Prefiere operaciones pocas y grandes sobre muchas pequeñas.
- Lee todos los archivos relevantes al inicio de cada paso, no de uno en uno.
- Escribe archivos completos en una operación cuando sea posible.
- Si un paso toma más de 15 tool calls, reevalúa tu approach.

## Reglas No Negociables

1. **Controllers retornan `Inertia::render()` o `redirect()`.** Nunca `response()->json()`.
2. **Validación en Form Requests.** Controllers no validan.
3. **Nunca commitear `.env`.** `ANTHROPIC_API_KEY` nunca expuesta al frontend.
4. ~~**Phase tasks son JSON en `projects.phase_tasks`.** No entidades separadas.~~ **DEROGADA por DDS v2.0.** Sections son tabla normalizada (`sections`). El campo `projects.phase_tasks` se mantiene como deprecated.
5. **Colores hex validados** con regex en `ProjectRequest`.
6. **Dark mode obligatorio.** CSS custom properties, nunca colores hardcodeados.
7. **API Anthropic solo desde backend.** Frontend envía texto plano al controller.
8. **Un componente por archivo, máx 300 líneas.**
9. **Custom Fields polimórficos solo vía `CustomFieldResolver` service.** Nunca acceder `custom_field_values` directo desde controllers — usar el service para garantizar casts correctos.

## Modelos v3.0 (nuevos)

- `Milestone` — Hitos contractuales con estado auto-evaluado (planned/at_risk/met/missed)
- `Risk` — Registro de riesgos con probabilidad × impacto (heat score)
- `RiskMitigation` — Pivot: Risk ↔ Task con rationale
- `ProjectDecision` — Log de decisiones/definiciones (DEF-XXX) con bloqueos
- `MemberCapacity` — Dedicación % por ProjectMember+Section
- `NotificationLog` — Auditoría de push notifications enviadas

## Section Types (v3.0)

- `sprint` — Sprint Scrum estándar, cuenta en Burndown y Velocity
- `discovery` — Fase exploratoria, no aparece en métricas Scrum (ej: Sprint 0)
- `continuous` — Track paralelo continuo, cruza todos los sprints (ej: Infra & DevOps)

## Critical Path (v3.0)

- `CriticalPathCalculator` — CPM forward/backward pass, persiste `tasks.on_critical_path`
- Excluye sections `continuous` para no inflar el path
- Siempre incluye tareas `is_blocker = true` en el camino crítico
- Ejecutar tras cambios de dependencias: `php artisan sinapsys:recalculate-critical-path`

## Variables de Entorno (v3.0)

| Variable | Descripción |
|----------|-------------|
| `DB_DATABASE` | sinapsys_projects |
| `ANTHROPIC_API_KEY` | API key de Anthropic |
| `ANTHROPIC_MODEL` | claude-sonnet-4-20250514 |
| `VAPID_SUBJECT` | mailto: para push notifications |
| `VAPID_PUBLIC_KEY` | Llave pública VAPID |
| `VAPID_PRIVATE_KEY` | Llave privada VAPID |

## Blueprint

El blueprint de v2.0 está en `.iaaf/output/sinapsys-projects-blueprint.md`. La especificación v3.0 está en `.docs/DDS_SinapSYS_Projects_v3.0.md`.
