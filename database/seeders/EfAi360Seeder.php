<?php

namespace Database\Seeders;

use App\Models\CustomField;
use App\Models\CustomFieldValue;
use App\Models\MethodologyTemplate;
use App\Models\Milestone;
use App\Models\Project;
use App\Models\ProjectDecision;
use App\Models\Risk;
use App\Models\RiskMitigation;
use App\Models\Task;
use App\Models\TaskDependency;
use App\Models\User;
use App\Services\CriticalPathCalculator;
use App\Services\ProjectFromTemplate;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\DB;

class EfAi360Seeder extends Seeder
{
    public function run(): void
    {
        $user = User::first();
        if (!$user) {
            $this->command->warn('No hay usuarios. Crea uno primero.');
            return;
        }

        DB::transaction(function () use ($user) {
            $project = $this->createProject($user);
            $this->applyTemplate($project);
            $sections = $this->updateSectionDates($project);
            $milestones = $this->createMilestones($project);
            $cf = $this->getCustomFields($project);
            $tasks = $this->createTasks($project, $sections, $milestones, $cf);
            $this->createRisks($project, $user, $tasks);
            $this->createDecisions($project, $user, $milestones);
            $this->createDependencies($tasks);
        });

        app(CriticalPathCalculator::class)->recalculate(
            Project::where('name', 'EF-Ai360')->first()
        );

        $this->command->info('EF-Ai360 cargado. CPM calculado.');
    }

    // ─── Project ─────────────────────────────────────────────────────────────

    private function createProject(User $user): Project
    {
        return Project::firstOrCreate(['name' => 'EF-Ai360'], [
            'user_id'     => $user->id,
            'methodology' => 'scrum',
            'default_view' => 'timeline',
            'color'       => '#D2491F',
            'priority'    => 1,
            'phase'       => 1,
            'impact'      => 5,
            'effort'      => 5,
            'description' => 'Estructurar Futuro — PWA Ejecutiva, Webs Constructora e Inmobiliaria, facturación DIAN, App Nativa Flutter.',
        ]);
    }

    // ─── Template ────────────────────────────────────────────────────────────

    private function applyTemplate(Project $project): void
    {
        if ($project->sections()->count() > 0) return;

        $template = MethodologyTemplate::where('slug', 'ef-ai360')->first();
        if ($template) {
            app(ProjectFromTemplate::class)->applyTemplate($project, $template);
        }
    }

    // ─── Section dates ────────────────────────────────────────────────────────

    private function updateSectionDates(Project $project): \Illuminate\Support\Collection
    {
        $dates = [
            'Sprint 0 · Setup'      => ['2026-06-01', '2026-06-14'],
            'Sprint 1'              => ['2026-06-15', '2026-06-28'],
            'Sprint 2'              => ['2026-06-29', '2026-07-12'],
            'Sprint 3'              => ['2026-07-13', '2026-07-26'],
            'Sprint 4'              => ['2026-07-27', '2026-08-09'],
            'Sprint 5'              => ['2026-08-10', '2026-08-23'],
            'Sprint 6'              => ['2026-08-24', '2026-09-06'],
            'Sprint 7'              => ['2026-09-07', '2026-09-20'],
            'Sprint 8'              => ['2026-09-21', '2026-10-04'],
            'Sprint 9'              => ['2026-10-05', '2026-11-01'],
        ];

        $sections = $project->sections()->get()->keyBy('name');
        foreach ($dates as $name => [$start, $end]) {
            $sections[$name]?->update(['start_date' => $start, 'end_date' => $end]);
        }

        return $sections;
    }

    // ─── Milestones ───────────────────────────────────────────────────────────

    private function createMilestones(Project $project): array
    {
        $defs = [
            'M1' => ['Definiciones cerradas',                    '2026-06-28', 'high',     '#F59E0B'],
            'M2' => ['PWA Ejecutiva en producción',              '2026-07-26', 'critical', '#E44258'],
            'M3' => ['Webs Constructora + Inmobiliaria piloto',  '2026-09-06', 'critical', '#E44258'],
            'M4' => ['Facturación DIAN integrada',               '2026-10-04', 'critical', '#E44258'],
            'M5' => ['Cierre SEDI + App Nativa en tiendas',      '2026-11-01', 'critical', '#E44258'],
        ];

        $milestones = [];
        $order = 0;
        foreach ($defs as $code => [$name, $date, $criticality, $color]) {
            $milestones[$code] = Milestone::firstOrCreate(
                ['project_id' => $project->id, 'name' => $name],
                compact('criticality', 'color') + [
                    'target_date' => $date,
                    'status'      => 'planned',
                    'order'       => $order++,
                ]
            );
        }
        return $milestones;
    }

    // ─── Custom Fields ────────────────────────────────────────────────────────

    private function getCustomFields(Project $project): array
    {
        $project->load('customFields');
        return [
            'sp'   => $project->customFields->firstWhere('slug', 'story_points'),
            'type' => $project->customFields->firstWhere('slug', 'item_type'),
        ];
    }

    private function sp(array $cf, Task $task, float $points): void
    {
        if (!$cf['sp']) return;
        CustomFieldValue::firstOrCreate(
            ['custom_field_id' => $cf['sp']->id, 'target_type' => Task::class, 'target_id' => $task->id],
            ['value' => (string) $points]
        );
    }

    // ─── Tasks ────────────────────────────────────────────────────────────────

    private function createTasks(Project $project, $sections, array $milestones, array $cf): array
    {
        $tasks = [];
        $pid   = $project->id;
        $uid   = $project->user_id;

        $make = function (string $code, string $name, string $sectionName, int $sp,
            bool $blocker = false, ?string $milestoneKey = null,
            int $priority = 3, ?string $dueDate = null
        ) use ($project, $sections, $milestones, $cf, $uid, &$tasks) {
            $section = $sections[$sectionName] ?? null;
            if (!$section) return;

            $task = Task::firstOrCreate(
                ['project_id' => $project->id, 'name' => $name],
                [
                    'user_id'             => $uid,
                    'section_id'          => $section->id,
                    'priority'            => $priority,
                    'is_blocker'          => $blocker,
                    'on_critical_path'    => false,
                    'linked_milestone_id' => $milestoneKey ? $milestones[$milestoneKey]->id : null,
                    'order_in_section'    => count($tasks),
                    'status'              => 'todo',
                    'due_date'            => $dueDate ?? $section->end_date,
                ]
            );

            if ($sp > 0) $this->sp($cf, $task, $sp);
            $tasks[$code] = $task;
        };

        // ── Sprint 0 · Discovery (no story points) ─────────────────────────
        $make('S0-01', 'Setup inicial del monorepo',            'Sprint 0 · Setup', 0, false, null, 3);
        $make('S0-02', 'Definición de arquitectura de datos',   'Sprint 0 · Setup', 0, false, null, 1);
        $make('S0-03', 'Configuración CI/CD y pipelines',       'Sprint 0 · Setup', 0, false, null, 2);
        $make('S0-04', 'Definición de convenciones del equipo', 'Sprint 0 · Setup', 0, false, null, 3);

        // ── Sprint 1 ────────────────────────────────────────────────────────
        $make('US-101', 'Autenticación multi-tenant',           'Sprint 1', 8, false, null, 2);
        $make('US-102', 'SEDI Adapter — integración API',       'Sprint 1', 13, false, null, 1);
        $make('US-103', 'Dashboard CEO — KPIs ejecutivos',      'Sprint 1', 8, false, null, 2);
        $make('US-104', 'Gestión de usuarios y permisos',       'Sprint 1', 5, false, null, 3);
        $make('US-105', 'Módulo de reportes base',              'Sprint 1', 5, false, null, 3);
        $make('US-106', 'PWA shell + navegación principal',     'Sprint 1', 8, false, null, 2);

        // ── Sprint 2 ────────────────────────────────────────────────────────
        $make('US-201', 'Dashboard Constructora — resumen',     'Sprint 2', 8, false, null, 2);
        $make('US-202', 'Ocupancia detalle — vista propiedades','Sprint 2', 13, false, null, 2);
        $make('US-203', 'Alertas y notificaciones PWA',         'Sprint 2', 5, false, null, 3);
        $make('US-204', 'Módulo de contratos base',             'Sprint 2', 8, false, null, 2);
        $make('US-205', 'API SEDI — sincronización incremental','Sprint 2', 8, false, null, 1);
        $make('US-206', 'Tests de integración Sprint 1-2',      'Sprint 2', 3, false, null, 3);

        // ── Sprint 3 ────────────────────────────────────────────────────────
        $make('US-301', 'Módulo de pagos base',                 'Sprint 3', 8, false, null, 2);
        $make('US-302', 'Dashboard Inmobiliaria — resumen',     'Sprint 3', 8, false, null, 2);
        $make('US-303', 'Reportes financieros exportables',     'Sprint 3', 5, false, null, 3);
        $make('US-304', 'PWA offline — cache ServiceWorker',    'Sprint 3', 8, false, null, 2);
        $make('US-305', 'PWA Hardening + Performance audit',    'Sprint 3', 5, true,  'M2',  1);
        $make('US-306', 'Tests E2E Sprint 3',                   'Sprint 3', 3, false, null, 3);

        // ── Sprint 4 ────────────────────────────────────────────────────────
        $make('US-401', 'Módulo de inventario Inmobiliaria',    'Sprint 4', 8, false, null, 2);
        $make('US-402', 'Búsqueda y filtrado avanzado',         'Sprint 4', 5, false, null, 3);
        $make('US-403', 'Gestión documental — contratos',       'Sprint 4', 8, false, null, 2);
        $make('US-404', 'Notificaciones push — ocupancia',      'Sprint 4', 5, false, null, 3);
        $make('US-405', 'Analytics de uso PWA',                 'Sprint 4', 3, false, null, 4);

        // ── Sprint 5 ────────────────────────────────────────────────────────
        $make('US-501', 'Web Inmobiliaria — landing y catálogo','Sprint 5', 13, false, null, 1);
        $make('US-502', 'Web Inmobiliaria — detalle propiedad', 'Sprint 5', 8, false, null, 1);
        $make('US-503', 'Web Inmobiliaria — formulario contacto','Sprint 5', 5, false, null, 2);
        $make('US-504', 'Web Inmobiliaria — SEO + Analytics',   'Sprint 5', 5, false, null, 2);
        $make('US-505', 'Módulo CRM básico',                    'Sprint 5', 8, false, null, 2);
        $make('US-506', 'Tests integración Web Inmobiliaria',   'Sprint 5', 3, false, null, 3);

        // ── Sprint 6 ────────────────────────────────────────────────────────
        $make('US-601', 'Web Constructora — landing corporativa','Sprint 6', 13, false, null, 1);
        $make('US-602', 'Web Constructora — portafolio obras',  'Sprint 6', 8, false, null, 1);
        $make('US-603', 'Web Constructora — área de clientes',  'Sprint 6', 8, false, null, 2);
        $make('US-604', 'Integración CMS headless',             'Sprint 6', 8, false, null, 2);
        $make('US-605', 'Analytics y conversión Webs',          'Sprint 6', 5, false, null, 3);

        // ── Sprint 7 ────────────────────────────────────────────────────────
        $make('US-701', 'Motor de facturación interna',         'Sprint 7', 13, false, null, 1);
        $make('US-702', 'Catálogo de productos DIAN',           'Sprint 7', 8, false, null, 2);
        $make('US-703', 'Validación NIT y resoluciones',        'Sprint 7', 5, false, null, 2);
        $make('US-704', 'Web Constructora — hardening piloto',  'Sprint 7', 5, false, 'M3', 1);
        $make('US-705', 'PAC DIAN — sandbox integración',       'Sprint 7', 13, false, null, 1);
        $make('US-706', 'Tests facturación DIAN sandbox',       'Sprint 7', 5, false, null, 2);

        // ── Sprint 8 ────────────────────────────────────────────────────────
        $make('US-801', 'Facturación DIAN — producción',        'Sprint 8', 13, false, 'M4', 1);
        $make('US-802', 'Timbrado DIAN — flujo completo',       'Sprint 8', 13, true,  'M4', 1);
        $make('US-803', 'Notas crédito y débito DIAN',          'Sprint 8', 8, false, null, 2);
        $make('US-804', 'Migración SEDI — rehearsal',           'Sprint 8', 13, false, null, 1);
        $make('US-805', 'Reportes fiscales automáticos',        'Sprint 8', 5, false, null, 2);
        $make('US-806', 'Build candidata Flutter — S6',         'Sprint 8', 13, true,  null,  1);

        // ── Sprint 9 ────────────────────────────────────────────────────────
        $make('US-901', 'App Nativa — publicación stores',      'Sprint 9', 13, false, 'M5', 1);
        $make('US-902', 'Migración datos SEDI — producción',    'Sprint 9', 13, false, 'M5', 1);
        $make('US-903', 'Cutover facturación DIAN',             'Sprint 9', 8, true,  'M5', 1);
        $make('US-904', 'Modo Dual Standby — contingencia',     'Sprint 9', 8, false, null, 2);
        $make('US-905', 'QA final + smoke test producción',     'Sprint 9', 5, false, null, 2);
        $make('US-906', 'Documentación técnica y entrega',      'Sprint 9', 3, false, null, 3);

        // ── Continuous tracks ──────────────────────────────────────────────
        if (isset($sections['Track · Infra & DevOps'])) {
            $make('INF-01', 'Infraestructura K8s + ambientes', 'Track · Infra & DevOps', 0, false, null, 2);
            $make('INF-02', 'Pipelines CI/CD multi-stage',     'Track · Infra & DevOps', 0, false, null, 2);
            $make('INF-03', 'Gestión de secretos y variables', 'Track · Infra & DevOps', 0, false, null, 3);
        }
        if (isset($sections['Track · Observabilidad'])) {
            $make('OBS-01', 'Stack Prometheus + Grafana',       'Track · Observabilidad', 0, false, null, 2);
            $make('OBS-02', 'Alertas y dashboards de servicio', 'Track · Observabilidad', 0, false, null, 3);
        }
        if (isset($sections['Track · PAC DIAN'])) {
            $make('PAC-01', 'Integración PAC homologación',     'Track · PAC DIAN', 0, false, null, 1);
            $make('PAC-02', 'Certificados digitales DIAN',      'Track · PAC DIAN', 0, false, null, 1);
        }

        return $tasks;
    }

    // ─── Risks ────────────────────────────────────────────────────────────────

    private function createRisks(Project $project, User $user, array $tasks): void
    {
        $risks = [
            ['R1', 'Cambio de alcance tardío por stakeholders',         'high',   'critical', 'open'],
            ['R2', 'Retraso en portabilidad App Nativa Flutter',        'high',   'high',     'open'],
            ['R3', 'Rechazo en App Stores (políticas de tiendas)',      'medium', 'medium',   'open'],
            ['R4', 'Bloqueo PAC DIAN por cambios regulatorios',        'medium', 'high',     'open'],
            ['R5', 'Pérdida de datos en migración SEDI',               'high',   'high',     'open'],
            ['R6', 'Indisponibilidad del API SEDI en cutover',         'medium', 'critical', 'open'],
            ['R7', 'Refinement insuficiente en sprints tardíos',       'high',   'medium',   'open'],
            ['R8', 'Brecha de seguridad en módulo de facturación',     'high',   'high',     'open'],
        ];

        $mitigations = [
            'R2' => ['US-806', 'US-704'],
            'R3' => ['US-806'],
            'R4' => ['US-705', 'US-802'],
            'R5' => ['US-804'],
            'R8' => ['US-904'],
        ];

        foreach ($risks as $i => [$code, $name, $prob, $impact, $status]) {
            $risk = Risk::firstOrCreate(
                ['project_id' => $project->id, 'code' => $code],
                [
                    'name'          => $name,
                    'description'   => $name,
                    'probability'   => $prob,
                    'impact'        => $impact,
                    'status'        => $status,
                    'owner_id'      => $user->id,
                    'identified_on' => '2026-06-01',
                ]
            );

            foreach ($mitigations[$code] ?? [] as $usCode) {
                if (isset($tasks[$usCode])) {
                    RiskMitigation::firstOrCreate([
                        'risk_id' => $risk->id,
                        'task_id' => $tasks[$usCode]->id,
                    ], ['rationale' => "Mitiga $code directamente"]);
                }
            }
        }
    }

    // ─── Decisions ────────────────────────────────────────────────────────────

    private function createDecisions(Project $project, User $user, array $milestones): void
    {
        $confirmed = [
            ['DEF001', 'Multi-tenancy por schema MySQL',              'Aislamiento de datos por tenant vía prefijo de tabla.'],
            ['DEF002', 'PWA como cliente principal (no nativa en S1)','Flutter solo desde S6 para evitar split temprano.'],
            ['DEF003', 'Laravel + Inertia + React stack',            'Stack interno estándar SinapSYS.'],
            ['DEF004', 'SEDI como fuente de verdad de datos',        'No duplicar datos — SEDI es master.'],
            ['DEF005', 'Autenticación JWT stateless',                'Compatible con multi-tenant y App Nativa.'],
            ['DEF006', 'CI/CD con GitHub Actions',                   'Pipelines por ambiente: dev, staging, prod.'],
            ['DEF007', 'DIAN vía PAC externo (no directo)',          'Certiventa como PAC primario.'],
            ['DEF008', 'Base de datos por tenant en prod',           'Escalabilidad y aislamiento legal.'],
            ['DEF009', 'Design system compartido Web + App',         'Tokens de diseño centralizados.'],
            ['DEF010', 'Facturación módulo separado',                'Desacoplado para certificación DIAN.'],
            ['DEF011', 'Observabilidad con Prometheus + Grafana',    'Stack open-source, self-hosted.'],
            ['DEF012', 'Pruebas E2E con Playwright',                 'Cobertura crítica en flujos de facturación.'],
            ['DEF013', 'Migración SEDI incremental (no big bang)',   'Por lotes nocturnos para zero downtime.'],
            ['DEF014', 'App stores: Google Play + App Store',        'iOS requiere cuenta developer activa.'],
            ['DEF015', 'Contratos en PDF generados en backend',      'No exponer lógica de generación al cliente.'],
            ['DEF016', 'Notificaciones push via FCM',                'Canal unificado para PWA y nativa.'],
            ['DEF017', 'SEO técnico para webs con SSR',              'Next.js para webs públicas.'],
            ['DEF018', 'Backup diario de base de datos',             'Retención 30 días, cifrado AES-256.'],
            ['DEF019', 'Rate limiting en API pública',               '100 req/min por tenant.'],
            ['DEF020', 'Soft delete en entidades críticas',          'Auditoría y recuperación habilitadas.'],
            ['DEF021', 'Logs estructurados en JSON',                 'Formato compatible con ELK stack.'],
            ['DEF022', 'Versionado semántico de la API',             'Breaking changes en major version.'],
            ['DEF023', 'Ambiente de staging espejo de prod',         'Misma infraestructura, datos anónimos.'],
            ['DEF024', 'Revisión de código obligatoria (2 aprobadores)', 'Protección de rama main.'],
            ['DEF025', 'Documentación OpenAPI auto-generada',        'Swagger en /api/docs.'],
        ];

        foreach ($confirmed as $i => [$code, $title, $desc]) {
            ProjectDecision::firstOrCreate(
                ['project_id' => $project->id, 'code' => $code],
                [
                    'title'       => $title,
                    'description' => $desc,
                    'status'      => 'confirmed',
                    'decided_by'  => $user->id,
                    'decided_on'  => '2026-06-01',
                    'order'       => $i,
                ]
            );
        }

        $pending = [
            ['DEF-P01', 'Estrategia BI y datos analíticos',        'Herramienta BI (Metabase vs custom)',              null,    null],
            ['DEF-P02', 'UX PWA — sistema de navegación final',    'Mockups ejecutivos pendientes de aprobación',     null,    null],
            ['DEF-P04', 'Formato Sprint Reviews para stakeholders','Define agenda y entregables de cada review',      'M1',   null],
            ['DEF-P06', 'Plan de migración SEDI detallado',        'Ventana de mantenimiento, rollback, rehearsal',   null,   'US-804'],
            ['DEF-P08', 'Criterios de aceptación App PWA exec',    'Define KPIs de adopción para lanzamiento',       'M2',   null],
            ['DEF-P09', 'Adapter SEDI — contrato de interfaz',     'Define contratos de datos con proveedor SEDI',   null,   'US-102'],
        ];

        foreach ($pending as $i => [$code, $title, $blocks, $msKey, $taskCode]) {
            ProjectDecision::firstOrCreate(
                ['project_id' => $project->id, 'code' => $code],
                [
                    'title'              => $title,
                    'description'        => $blocks,
                    'blocks_description' => $blocks,
                    'status'             => 'pending',
                    'order'              => 25 + $i,
                    'blocks_milestone_id' => $msKey ? $milestones[$msKey]->id : null,
                ]
            );
        }
    }

    // ─── Dependencies ─────────────────────────────────────────────────────────

    private function createDependencies(array $tasks): void
    {
        $deps = [
            ['US-103', 'US-102'],
            ['US-202', 'US-103'],
            ['US-802', 'US-705'],
            ['US-806', 'US-501'],
            ['US-806', 'US-502'],
            ['US-806', 'US-503'],
            ['US-806', 'US-504'],
            ['US-902', 'US-804'],
            ['US-903', 'US-802'],
        ];

        foreach ($deps as [$task, $dependsOn]) {
            if (isset($tasks[$task], $tasks[$dependsOn])) {
                TaskDependency::firstOrCreate([
                    'task_id'          => $tasks[$task]->id,
                    'depends_on_task_id' => $tasks[$dependsOn]->id,
                ], ['type' => 'finish_to_start', 'lag_days' => 0]);
            }
        }

        // US-305 depends on all S3 tasks
        $s3Blockers = ['US-301', 'US-302', 'US-303', 'US-304', 'US-306'];
        foreach ($s3Blockers as $code) {
            if (isset($tasks['US-305'], $tasks[$code])) {
                TaskDependency::firstOrCreate([
                    'task_id'            => $tasks['US-305']->id,
                    'depends_on_task_id' => $tasks[$code]->id,
                ], ['type' => 'finish_to_start', 'lag_days' => 0]);
            }
        }
    }
}
