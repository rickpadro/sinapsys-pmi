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

/**
 * Carga EF-Ai360 con el contenido real del plan v3.0 (44 US, 8 riesgos, 31 definiciones).
 * Fuente de verdad: .docs/plan_implementacion_EF-Ai360_v3.pdf
 * Idempotente: elimina el proyecto existente antes de recrearlo.
 */
class EfAi360Seeder extends Seeder
{
    public function run(): void
    {
        $user = User::first();
        if (!$user) {
            $this->command->warn('No hay usuarios. Crea uno primero.');
            return;
        }

        // Remove stale data before fresh load
        Project::where('name', 'EF-Ai360')->each(function ($p) {
            Task::where('project_id', $p->id)->each(fn($t) => TaskDependency::where('task_id', $t->id)->orWhere('depends_on_task_id', $t->id)->delete());
            $p->tasks()->delete();
            $p->milestones()->delete();
            $p->risks()->each(fn($r) => $r->mitigations()->delete());
            $p->risks()->delete();
            $p->decisions()->delete();
            $p->customFields()->each(fn($cf) => CustomFieldValue::where('custom_field_id', $cf->id)->delete());
            $p->customFields()->delete();
            $p->sections()->delete();
            $p->forceDelete();
        });

        DB::transaction(function () use ($user) {
            $project    = $this->createProject($user);
            $this->applyTemplate($project);
            $sections   = $this->updateSectionDates($project);
            $milestones = $this->createMilestones($project);
            $cf         = $this->getCustomFields($project);
            $tasks      = $this->createTasks($project, $sections, $milestones, $cf);
            $this->createRisks($project, $user, $tasks);
            $this->createDecisions($project, $user, $milestones);
            $this->createDependencies($tasks);
        });

        app(CriticalPathCalculator::class)->recalculate(
            Project::where('name', 'EF-Ai360')->first()
        );

        $this->command->info('EF-Ai360 cargado con contenido real del plan. CPM calculado.');
    }

    // ─── Project ─────────────────────────────────────────────────────────────

    private function createProject(User $user): Project
    {
        return Project::create([
            'user_id'      => $user->id,
            'name'         => 'EF-Ai360',
            'methodology'  => 'scrum',
            'default_view' => 'timeline',
            'color'        => '#D2491F',
            'priority'     => 1,
            'phase'        => 1,
            'impact'       => 5,
            'effort'       => 5,
            'description'  => 'Estructurar Futuro — Ecosistema Constructora + Inmobiliaria. 3 frontends + 1 backend modular FastAPI. PWA Ejecutiva (Sem 8) · Webs Operativas (Sem 14) · Facturación DIAN (Sem 18) · Cutover SEDI + App Nativa (Sem 20).',
        ]);
    }

    // ─── Template ────────────────────────────────────────────────────────────

    private function applyTemplate(Project $project): void
    {
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
        foreach ($dates as $name => [$s, $e]) {
            $sections[$name]?->update(['start_date' => $s, 'end_date' => $e]);
        }
        return $sections;
    }

    // ─── Milestones ───────────────────────────────────────────────────────────

    private function createMilestones(Project $project): array
    {
        $defs = [
            'M1' => ['Definiciones cerradas',                    '2026-06-14', 'high',     '#F59E0B'],
            'M2' => ['PWA Ejecutiva en producción',              '2026-07-26', 'critical', '#E44258'],
            'M3' => ['Webs Constructora + Inmobiliaria en piloto','2026-09-06', 'critical', '#E44258'],
            'M4' => ['Facturación DIAN integrada y validada',    '2026-10-04', 'critical', '#E44258'],
            'M5' => ['Cierre SEDI + App Nativa en tiendas',      '2026-11-01', 'critical', '#E44258'],
        ];
        $milestones = [];
        $order = 0;
        foreach ($defs as $code => [$name, $date, $criticality, $color]) {
            $milestones[$code] = Milestone::create(compact('criticality', 'color') + [
                'project_id'  => $project->id,
                'name'        => $name,
                'target_date' => $date,
                'status'      => 'planned',
                'order'       => $order++,
            ]);
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
        if (!$cf['sp'] || $points <= 0) return;
        CustomFieldValue::create([
            'custom_field_id' => $cf['sp']->id,
            'target_type'     => Task::class,
            'target_id'       => $task->id,
            'value'           => (string) $points,
        ]);
    }

    // ─── Tasks (44 US reales del plan + S0 discovery + tracks) ───────────────

    private function createTasks(Project $project, $sections, array $milestones, array $cf): array
    {
        $tasks = [];
        $order = 0;

        $make = function (
            string $code, string $name, string $sectionName,
            int $sp, bool $blocker = false, ?string $milKey = null,
            int $priority = 3
        ) use ($project, $sections, $milestones, $cf, &$tasks, &$order) {
            $section = $sections[$sectionName] ?? null;
            if (!$section) return;

            $task = Task::create([
                'user_id'             => $project->user_id,
                'project_id'          => $project->id,
                'section_id'          => $section->id,
                'name'                => $name,
                'priority'            => $priority,
                'is_blocker'          => $blocker,
                'on_critical_path'    => false,
                'linked_milestone_id' => $milKey ? $milestones[$milKey]->id : null,
                'order_in_section'    => $order++,
                'status'              => 'todo',
                'due_date'            => $section->end_date,
                'estimated_time'      => $sp * 4, // 1 SP ≈ 4h for CPM
            ]);

            if ($sp > 0) $this->sp($cf, $task, $sp);
            $tasks[$code] = $task;
        };

        // ── Sprint 0 · Setup & Discovery ─────────────────────────────────
        $make('S0-01', 'Sesión kickoff — Validación KPIs + segmentación inversionistas', 'Sprint 0 · Setup', 0, false, null, 2);
        $make('S0-02', 'Auditoría funcional SEDI + entrevistas usuarios (Mayra, Edwin, Ángela, Rubén, Andrés)', 'Sprint 0 · Setup', 0, false, null, 1);
        $make('S0-03', 'Discovery técnico API SEDI — endpoints earthcdn.sedierp.com/Help', 'Sprint 0 · Setup', 0, false, null, 1);
        $make('S0-04', 'Reunión BI — decisión Plan A (reutilizar) vs Plan B (construir)', 'Sprint 0 · Setup', 0, false, null, 1);
        $make('S0-05', 'Revisión repo prototipo EF-Ai360 (anacrisgarcia0813-arch) — componentes rescatables', 'Sprint 0 · Setup', 0, false, null, 2);
        $make('S0-06', 'AWS account + IAM + VPC + RDS + S3 + CloudFront + Route53 + ECR + Secrets', 'Sprint 0 · Setup', 0, false, null, 2);
        $make('S0-07', 'Monorepo Turborepo + 4 pipelines CI/CD GitHub Actions diferenciados', 'Sprint 0 · Setup', 0, false, null, 2);
        $make('S0-08', 'Auth/SSO base FastAPI-Users + JWT + refresh tokens + RBAC granular', 'Sprint 0 · Setup', 0, false, null, 2);
        $make('S0-09', 'Selección de PAC DIAN — investigación Carvajal/Facture/DataICO/Cadena/HKA', 'Sprint 0 · Setup', 0, false, null, 1);
        $make('S0-10', 'Design tokens + Librería UI base derivada del prototipo EF-Ai360', 'Sprint 0 · Setup', 0, false, null, 3);

        // ── Sprint 1 · Foundation ─────────────────────────────────────────
        $make('US-101', 'LOGIN — biometría/PIN para acceso rápido sin teclear password',  'Sprint 1', 3, false, null, 2);
        $make('US-102', 'SEDI ADAPTER — consumo endpoints SEDI como fuente única durante coexistencia', 'Sprint 1', 8, false, null, 1);
        $make('US-103', 'DASHBOARD CEO BÁSICO — 4 KPIs: Ocupancia, Mora, Avance Obras, Ingresos del mes', 'Sprint 1', 5, false, null, 2);
        $make('US-104', 'LAYOUT RESPONSIVO — navegación UI optimizada para smartphone vertical', 'Sprint 1', 3, false, null, 3);

        // ── Sprint 2 · Drill-down y Cartera ──────────────────────────────
        $make('US-201', 'DRILL-DOWN KPI — navegar de KPI agregado al detalle por centro comercial', 'Sprint 2', 5, false, null, 2);
        $make('US-202', 'OCUPANCIA POR CENTRO — desagregada por Plaza Mayor, Centro Norte, Paseo del Valle', 'Sprint 2', 5, false, null, 2);
        $make('US-203', 'CARTERA POR ESTADO — al día / mora / jurídico con montos por estado', 'Sprint 2', 3, false, null, 2);
        $make('US-204', 'MORA DESTACADA — top deudores con días de mora y saldo', 'Sprint 2', 3, false, null, 2);
        $make('US-205', 'ALERTAS CRÍTICAS — mora +90, contratos por vencer, interventoría sin reporte', 'Sprint 2', 5, false, null, 2);

        // ── Sprint 3 · Inversionistas y Producción ────────────────────────
        $make('US-301', 'LOGIN INVERSIONISTA — credenciales segregadas, ve solo su información', 'Sprint 3', 3, false, null, 2);
        $make('US-302', 'MI INVERSIÓN — capital invertido, % participación, ROI actual, proyección', 'Sprint 3', 5, false, null, 2);
        $make('US-303', 'REPORTES PDF — reporte mensual/trimestral por proyecto, firmado digitalmente', 'Sprint 3', 5, false, null, 2);
        $make('US-304', 'PUSH NOTIFICATIONS — PWA via Service Worker + Firebase Cloud Messaging', 'Sprint 3', 5, false, null, 3);
        $make('US-305', 'HARDENING PRODUCCIÓN — testing seguridad, performance y carga pre-cutover', 'Sprint 3', 5, true, 'M2', 1);

        // ── Sprint 4 · Web Constructora MVP ───────────────────────────────
        $make('US-401', 'GANTT PROYECTOS — Gantt con avance plan vs real por etapa', 'Sprint 4', 8, false, null, 2);
        $make('US-402', 'SUBIR ACTAS — actas quincenales con fotos georreferenciadas y observaciones', 'Sprint 4', 8, false, null, 2);
        $make('US-403', 'VALIDAR ACTAS — aprobar/rechazar/observación con flujo de aprobación documentado', 'Sprint 4', 5, false, null, 2);
        $make('US-404', 'MÓDULO CONSTRUCTORA BACKEND — proyectos, fases, actas, etapas, contratistas', 'Sprint 4', 8, false, null, 1);

        // ── Sprint 5 · Web Inmobiliaria MVP ───────────────────────────────
        $make('US-501', 'SÁBANA OCUPANCIA — 3 centros con vista filtrable por estado', 'Sprint 5', 8, false, null, 2);
        $make('US-502', 'GESTIÓN CONTRATOS — alta, renovación, terminación, IPC del DANE para reajuste', 'Sprint 5', 8, false, null, 2);
        $make('US-503', 'PIPELINE PROSPECTOS — Kanban con etapas y conversión', 'Sprint 5', 5, false, null, 2);
        $make('US-504', 'MÓDULO INMOBILIARIA BACKEND — propiedades, contratos, ocupancia, prospectos, eventos BI', 'Sprint 5', 8, false, null, 1);

        // ── Sprint 6 · Cobranza + Interventor ────────────────────────────
        $make('US-601', 'GESTIÓN MOROSOS WHATSAPP — notificaciones WhatsApp + plantillas pre-aprobadas', 'Sprint 6', 8, false, null, 2);
        $make('US-602', 'ACUERDOS DE PAGO — cuotas, fechas y seguimiento automatizado', 'Sprint 6', 5, false, null, 2);
        $make('US-603', 'INFORMES INTERVENTORÍA — auditoría con fotos soporte y conformidad/no conformidad', 'Sprint 6', 5, false, null, 2);
        $make('US-604', 'SYNC CON PWA — datos de webs alimentan PWA del Presidente en tiempo cuasi-real', 'Sprint 6', 5, false, null, 2);

        // ── Sprint 7 · Comercial avanzado + Mapas + PAC sandbox ──────────
        $make('US-701', 'MAPA INTERACTIVO — locales por centro con disponibilidad visual', 'Sprint 7', 8, false, null, 2);
        $make('US-702', 'ASIGNACIÓN AGENTES — prospectos a Rubén/Andrés con balanceo', 'Sprint 7', 3, false, null, 3);
        $make('US-703', 'KPIS COMERCIALES — m² ocupado, precio promedio, tendencias 12 meses', 'Sprint 7', 5, false, null, 2);
        $make('US-704', 'PARTE LEGAL — checklist parte legal del proyecto y del inmueble (Mayra/Edwin)', 'Sprint 7', 8, false, 'M3', 1);
        $make('US-705', 'PAC SANDBOX — integración PAC sandbox para validar timbrado de pruebas', 'Sprint 7', 8, false, null, 1);

        // ── Sprint 8 · Financiera + DIAN + Migración ──────────────────────
        $make('US-801', 'INFORMES FINANCIEROS — mensuales, trimestrales y por proyecto Excel/PDF (Angélica)', 'Sprint 8', 8, false, null, 2);
        $make('US-802', 'TIMBRADO DIAN — facturas electrónicas con CUFE válido (Angélica)', 'Sprint 8', 13, true, 'M4', 1);
        $make('US-803', 'RETENCIONES — ReteFuente, ReteIVA, ReteICA según régimen del cliente', 'Sprint 8', 5, false, null, 2);
        $make('US-804', 'MIGRACIÓN DATOS SEDI — datos históricos críticos, rehearsal real', 'Sprint 8', 8, false, null, 1);
        $make('US-805', 'GARANTÍA POST-ENTREGA — tickets e incidencias de garantía de obra', 'Sprint 8', 5, false, null, 3);
        $make('US-806', 'BUILD CANDIDATA FLUTTER — App Nativa lista para submission a tiendas (portada desde S6)', 'Sprint 8', 8, true, null, 1);

        // ── Sprint 9 · Cutover + App Nativa + Hipercare ───────────────────
        $make('US-901', 'SMOKE TESTING PRE-CUTOVER — staging-mirror-prod completo (Día 1-2)', 'Sprint 9', 5, false, 'M5', 1);
        $make('US-902', 'MIGRACIÓN DATOS CRÍTICOS — cuentas por cobrar y contratos a producción (Día 3)', 'Sprint 9', 8, false, 'M5', 1);
        $make('US-903', 'CUTOVER FACTURACIÓN — timbrar todas las facturas desde plataforma nueva (Día 4-5)', 'Sprint 9', 8, true, 'M5', 1);
        $make('US-904', 'MODO DUAL STANDBY — SEDI accesible 5 días post-cutover como rollback emergencia', 'Sprint 9', 3, false, null, 2);
        $make('US-905', 'HIPERCARE INTENSIVO — atención bugs y soporte usuarios reales (Día 1-3)', 'Sprint 9', 8, false, null, 2);
        $make('US-906', 'SUBMISSION APP STORE — App Nativa a Apple Store y Google Play (Día 4)', 'Sprint 9', 5, false, 'M5', 1);
        $make('US-907', 'DOCUMENTACIÓN FINAL — técnica + manuales de usuario por rol (Día 5)', 'Sprint 9', 5, false, null, 3);

        // ── Tracks continuos ─────────────────────────────────────────────
        if (isset($sections['Track · Infra & DevOps'])) {
            $make('INF-S0', 'Infra S0: AWS account + VPC + RDS + S3 + ECR + monorepo + CI/CD',  'Track · Infra & DevOps', 0, false, null, 2);
            $make('INF-S1', 'Infra S1-3: ECS Fargate + ALB + RDS Multi-AZ + ElastiCache + WAF + FCM + SES', 'Track · Infra & DevOps', 0, false, null, 2);
            $make('INF-S4', 'Infra S4-6: 3x CloudFront + WhatsApp Business API + Mapbox', 'Track · Infra & DevOps', 0, false, null, 3);
            $make('INF-S7', 'Infra S7-8: ETL infra migración SEDI (Lambda + Step Functions) + audit trail', 'Track · Infra & DevOps', 0, false, null, 2);
            $make('INF-S9', 'Infra S9: Apple Developer + Google Play + signing keys + monitoring 24/7 + rollback', 'Track · Infra & DevOps', 0, false, null, 1);
        }
        if (isset($sections['Track · Observabilidad'])) {
            $make('OBS-S0', 'Observabilidad S0: Sentry org + integración backend + frontends + stack traces', 'Track · Observabilidad', 0, false, null, 2);
            $make('OBS-S3', 'Observabilidad S3: Loki + Grafana en EC2 + Promtail + dashboards por componente', 'Track · Observabilidad', 0, false, null, 2);
            $make('OBS-S6', 'Observabilidad S6: Alertas críticas Slack + métricas de negocio (KPIs sistema)', 'Track · Observabilidad', 0, false, null, 3);
            $make('OBS-S9', 'Observabilidad S9: Monitoreo 24/7 + alertas cutover + rollback triggers', 'Track · Observabilidad', 0, false, null, 1);
        }
        if (isset($sections['Track · PAC DIAN'])) {
            $make('PAC-S0', 'PAC S0: Investigación Carvajal/Facture/DataICO/Cadena/HKA + demos + decisión + contrato', 'Track · PAC DIAN', 0, false, null, 1);
            $make('PAC-S1', 'PAC S1-2: Credenciales sandbox + certificado digital persona jurídica + doc API', 'Track · PAC DIAN', 0, false, null, 1);
            $make('PAC-S7', 'PAC S7: Modelo datos facturación + integración API + pruebas timbrado básico', 'Track · PAC DIAN', 0, false, null, 1);
            $make('PAC-S9', 'PAC S9: Primera factura real + hipercare facturación + monitoreo primer mes', 'Track · PAC DIAN', 0, false, null, 1);
        }

        return $tasks;
    }

    // ─── Risks (exactos del plan — Página 18 del PDF) ─────────────────────────

    private function createRisks(Project $project, User $user, array $tasks): void
    {
        $risks = [
            ['R1', 'Sprint 0 no resuelve accesos SEDI/BI/Presidente',        'high',   'critical', 'Escalamiento a CEO cliente al final de Sem 1 si no hay avance'],
            ['R2', 'Sprint 9 no completa todos los entregables',              'high',   'high',     'App Nativa portada desde Sprint 6 + dry-runs migración'],
            ['R3', 'App Nativa rechazada en tiendas (Apple/Google)',          'medium', 'medium',   'Submission temprana en Sprint 8 + PWA como fallback'],
            ['R4', 'DIAN/PAC integración compleja',                           'medium', 'high',     'Selección de PAC en Sprint 0, sandbox en Sprint 7'],
            ['R5', 'Migración datos SEDI con inconsistencias',                'high',   'high',     'Dry-runs en Sprints 5 y 7, rollback plan documentado'],
            ['R6', 'Equipo no full-time durante todo el proyecto',            'medium', 'critical', 'Negociar dedicación al inicio, escalar si baja'],
            ['R7', 'KPIs cambian post-PWA',                                   'high',   'medium',   'Refinement riguroso, change requests vía PO'],
            ['R8', 'Bugs críticos post-cutover Sprint 9',                     'high',   'high',     'Modo dual SEDI/nueva plataforma 5 días + rollback'],
        ];

        $mitigations = [
            'R2' => ['US-806'],
            'R3' => ['US-806'],
            'R4' => ['US-705', 'US-802'],
            'R5' => ['US-804'],
            'R8' => ['US-904'],
        ];

        foreach ($risks as [$code, $name, $prob, $impact, $mitigation_plan]) {
            $risk = Risk::create([
                'project_id'      => $project->id,
                'code'            => $code,
                'name'            => $name,
                'description'     => $name,
                'probability'     => $prob,
                'impact'          => $impact,
                'status'          => 'open',
                'mitigation_plan' => $mitigation_plan,
                'owner_id'        => $user->id,
                'identified_on'   => '2026-06-01',
            ]);

            foreach ($mitigations[$code] ?? [] as $usCode) {
                if (isset($tasks[$usCode])) {
                    RiskMitigation::create([
                        'risk_id'   => $risk->id,
                        'task_id'   => $tasks[$usCode]->id,
                        'rationale' => $mitigation_plan,
                    ]);
                }
            }
        }
    }

    // ─── Decisions (exactas del plan — Páginas 19-21 del PDF) ────────────────

    private function createDecisions(Project $project, User $user, array $milestones): void
    {
        $confirmed = [
            ['DEF-001', 'Líneas de negocio',         'Arrendamientos comerciales (centros) + preventa locales + constructora propia'],
            ['DEF-002', 'Alcance excluido',           'NO maneja Administración de PH (Propiedad Horizontal)'],
            ['DEF-003', 'Origen del proyecto',        'Necesidad del Presidente — app móvil con indicadores para inversionistas'],
            ['DEF-004', 'ERP cliente',                'Cliente usa SEDI ERP. API documentada en earthcdn.sedierp.com/Help'],
            ['DEF-005', 'Arquitectura del sistema',   '3 frontends + 1 backend modular + servicios transversales + monorepo + SSO'],
            ['DEF-006', 'Estrategia de entrega',      'Camino 2: PWA primero, webs después en paralelo'],
            ['DEF-007', 'Contexto legal/regulatorio', 'Colombia: DIAN, Ley 820, Ley 1480, Ley 1581, IPC del DANE, COP'],
            ['DEF-008', 'Estrategia SEDI',            'Coexistencia corta + reemplazo total post-MVP'],
            ['DEF-009', 'BI existente',               'Existe BI funcionando que procesa SEDI + Excels + otras fuentes'],
            ['DEF-010', 'Decisión BI',                'Reutilizar si se comparte, construir propio si no'],
            ['DEF-011', 'Análisis de industria',      'Por funciones (anonimización), no por marcas'],
            ['DEF-012', 'Stack tecnológico',          '[PDF — contenido en tabla con salto de página]'],
            ['DEF-013', 'Datos e infraestructura',    '[PDF — contenido en tabla con salto de página]'],
            ['DEF-014', 'Industria real',             'Retail Real Estate + Commercial Construction (centros comerciales, no vivienda)'],
            ['DEF-015', 'Prototipo existente',        'Existe prototipo HTML EF-Ai360 v3 funcional y validado por el CEO'],
            ['DEF-016', 'Centros comerciales',        'Plaza Mayor + Centro Norte + Paseo del Valle (212 locales, 86%, $824M COP/mes)'],
            ['DEF-017', 'Proyectos construcción',     'Torre Norte (entrega Mar 2026) + Paseo del Valle (entrega Sep 2026)'],
            ['DEF-018', 'Rol Interventor',            'Figura de Interventor (auditoría independiente colombiana) tiene rol propio'],
            ['DEF-019', 'Módulo inversionistas',      'Inversionistas: % participación + ROI + distribuciones + reportes individuales PDF'],
            ['DEF-020', 'Estrategia comercial',       'Solo este cliente, sin productizar'],
            ['DEF-021', 'Tamaño del equipo',          '3-4 devs'],
            ['DEF-022', 'Prioridad del proyecto',     'Time-to-market'],
            ['DEF-023', 'Roles y KPIs',               '7 roles + 85 KPIs definidos: CEO, FIN, OBRA, COM, COB, INT, INV'],
            ['DEF-024', 'Metodología',                'Scrum, sprints de 2 semanas'],
            ['DEF-025', 'Duración',                   '20 semanas (10 sprints) con Sprint 9 sobrecargado'],
        ];

        foreach ($confirmed as $i => [$code, $title, $desc]) {
            ProjectDecision::create([
                'project_id'  => $project->id,
                'code'        => $code,
                'title'       => $title,
                'description' => $desc,
                'status'      => 'confirmed',
                'decided_by'  => $user->id,
                'decided_on'  => '2026-06-01',
                'order'       => $i,
            ]);
        }

        $pending = [
            ['DEF-P01', 'Stack del BI actual',                     'Stack BI (Power BI / Excel / Tableau / otro)',       'Estrategia BI',     null,  null],
            ['DEF-P02', 'Quién usa el BI directamente hoy',        'UX PWA y source de datos del Dashboard CEO',        'UX PWA',            null,  null],
            ['DEF-P04', 'Acceso al Presidente para discovery',     'Sin acceso, Sprint Reviews sin validación real',    'Sprint Reviews',    'M1',  null],
            ['DEF-P06', 'Auditoría funcional de SEDI',             'Plan de migración SEDI (qué módulos usa realmente)', 'Plan de migración', null,  'US-804'],
            ['DEF-P08', 'Cantidad y segmentación de inversionistas','Sin esto, módulo inversionistas no puede diseñarse', 'App PWA',           'M2',  null],
            ['DEF-P09', 'Discovery completo del API SEDI',         'Sin discovery, SEDI Adapter se construye a ciegas',  'Adapter SEDI',      null,  'US-102'],
        ];

        foreach ($pending as $i => [$code, $title, $blocks, $blocksDesc, $msKey, $taskCode]) {
            ProjectDecision::create([
                'project_id'         => $project->id,
                'code'               => $code,
                'title'              => $title,
                'description'        => $blocks,
                'blocks_description' => $blocksDesc,
                'status'             => 'pending',
                'order'              => 25 + $i,
                'blocks_milestone_id' => $msKey ? $milestones[$msKey]->id : null,
            ]);
        }
    }

    // ─── Dependencies (DDS sección 12, Paso 7) ───────────────────────────────

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

        foreach ($deps as [$task, $dep]) {
            if (isset($tasks[$task], $tasks[$dep])) {
                TaskDependency::create([
                    'task_id'            => $tasks[$task]->id,
                    'depends_on_task_id' => $tasks[$dep]->id,
                    'type'               => 'finish_to_start',
                    'lag_days'           => 0,
                ]);
            }
        }

        // US-305 depends on all other Sprint 3 tasks
        foreach (['US-301', 'US-302', 'US-303', 'US-304'] as $code) {
            if (isset($tasks['US-305'], $tasks[$code])) {
                TaskDependency::create([
                    'task_id'            => $tasks['US-305']->id,
                    'depends_on_task_id' => $tasks[$code]->id,
                    'type'               => 'finish_to_start',
                    'lag_days'           => 0,
                ]);
            }
        }
    }
}
