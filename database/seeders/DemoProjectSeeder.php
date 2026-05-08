<?php

namespace Database\Seeders;

use App\Models\AiMessage;
use App\Models\Project;
use App\Models\Task;
use App\Models\User;
use Illuminate\Database\Seeder;

class DemoProjectSeeder extends Seeder
{
    public function run(): void
    {
        $user = User::firstOrCreate(
            ['email' => 'admin@sinapsys.mx'],
            [
                'name' => 'Rick',
                'password' => bcrypt('password'),
            ]
        );

        $projects = [
            [
                'name' => 'ChatBot WhatsApp IA',
                'type' => 'saas',
                'priority' => 1,
                'phase' => 2,
                'impact' => 9,
                'effort' => 7,
                'description' => 'Bot conversacional para WhatsApp con IA generativa. Atiende clientes, agenda citas, responde FAQ.',
                'tags' => ['whatsapp', 'ia', 'chatbot', 'saas'],
                'viability_mercado' => 8,
                'viability_financiero' => 7,
                'viability_tecnico' => 8,
                'viability_riesgo' => 4,
                'color' => '#1D9E75',
                'tasks' => [
                    ['name' => 'Integrar API de WhatsApp Business', 'priority' => 1, 'category' => 'desarrollo', 'due_date' => now()->addDays(2)],
                    ['name' => 'Diseñar flujo de conversación principal', 'priority' => 2, 'category' => 'desarrollo', 'due_date' => now()->addDays(5)],
                    ['name' => 'Configurar modelo Claude para respuestas', 'priority' => 2, 'category' => 'desarrollo', 'due_date' => now()->addDays(7)],
                    ['name' => 'Landing page del producto', 'priority' => 3, 'category' => 'cliente', 'due_date' => now()->addDays(14)],
                    ['name' => 'Definir pricing tiers', 'priority' => 3, 'category' => 'admin', 'due_date' => now()->addDays(10)],
                ],
            ],
            [
                'name' => 'CFDI 4.0 — Facturación Electrónica',
                'type' => 'cliente',
                'priority' => 2,
                'phase' => 1,
                'impact' => 7,
                'effort' => 6,
                'description' => 'Sistema de facturación electrónica CFDI 4.0 para cliente contable. Timbrado, cancelación, complementos de pago.',
                'tags' => ['facturación', 'cfdi', 'sat', 'fiscal'],
                'viability_mercado' => 6,
                'viability_financiero' => 8,
                'viability_tecnico' => 7,
                'viability_riesgo' => 5,
                'color' => '#185FA5',
                'tasks' => [
                    ['name' => 'Revisar requerimientos SAT CFDI 4.0', 'priority' => 1, 'category' => 'desarrollo', 'due_date' => now()->subDays(1)],
                    ['name' => 'Contratar PAC de timbrado', 'priority' => 2, 'category' => 'admin', 'due_date' => now()],
                    ['name' => 'Diseñar schema de base de datos fiscal', 'priority' => 2, 'category' => 'desarrollo', 'due_date' => now()->addDays(3)],
                ],
            ],
            [
                'name' => 'Karts JR — Pista de Go-Karts',
                'type' => 'negocio',
                'priority' => 3,
                'phase' => 0,
                'impact' => 8,
                'effort' => 9,
                'description' => 'Plan de negocio para pista de go-karts eléctricos. Evaluación de terreno, permisos, inversión inicial.',
                'tags' => ['karts', 'negocio', 'inversión', 'entretenimiento'],
                'viability_mercado' => 7,
                'viability_financiero' => 5,
                'viability_tecnico' => 6,
                'viability_riesgo' => 7,
                'color' => '#BA7517',
                'tasks' => [
                    ['name' => 'Investigar proveedores de karts eléctricos', 'priority' => 3, 'category' => 'admin', 'due_date' => now()->addDays(20)],
                    ['name' => 'Cotizar terrenos zona norte', 'priority' => 3, 'category' => 'admin', 'due_date' => now()->addDays(15)],
                ],
            ],
            [
                'name' => 'Google Ads + Claude — Campañas IA',
                'type' => 'idea',
                'priority' => 2,
                'phase' => 0,
                'impact' => 7,
                'effort' => 4,
                'description' => 'Usar Claude para generar y optimizar campañas de Google Ads automáticamente. Copy, keywords, bidding suggestions.',
                'tags' => ['google-ads', 'ia', 'marketing', 'automatización'],
                'viability_mercado' => 8,
                'viability_financiero' => 6,
                'viability_tecnico' => 9,
                'viability_riesgo' => 3,
                'color' => '#993556',
                'tasks' => [
                    ['name' => 'Prototipar prompt de generación de ads', 'priority' => 2, 'category' => 'desarrollo', 'due_date' => now()->addDays(5)],
                    ['name' => 'Conectar API de Google Ads', 'priority' => 3, 'category' => 'desarrollo', 'due_date' => now()->addDays(12)],
                ],
            ],
            [
                'name' => 'SinapSYS Projects',
                'type' => 'interno',
                'priority' => 1,
                'phase' => 2,
                'impact' => 10,
                'effort' => 6,
                'description' => 'Esta misma plataforma. Sistema de gestión de proyectos PMI personal con IA.',
                'tags' => ['interno', 'pmi', 'gestión', 'ia'],
                'viability_mercado' => 10,
                'viability_financiero' => 10,
                'viability_tecnico' => 9,
                'viability_riesgo' => 2,
                'color' => '#4A6CF7',
                'tasks' => [
                    ['name' => 'Completar CRUD de proyectos', 'priority' => 1, 'category' => 'desarrollo', 'due_date' => now()],
                    ['name' => 'Implementar Vista Foco de tareas', 'priority' => 1, 'category' => 'desarrollo', 'due_date' => now()->addDays(1)],
                    ['name' => 'Integrar asistente IA por proyecto', 'priority' => 2, 'category' => 'desarrollo', 'due_date' => now()->addDays(4)],
                    ['name' => 'Exportar reportes PDF/Excel', 'priority' => 3, 'category' => 'desarrollo', 'due_date' => now()->addDays(8)],
                    ['name' => 'Deploy a A2 Hosting', 'priority' => 4, 'category' => 'soporte', 'due_date' => now()->addDays(14)],
                ],
            ],
        ];

        foreach ($projects as $projectData) {
            $tasks = $projectData['tasks'];
            unset($projectData['tasks']);

            $project = Project::create([
                'user_id' => $user->id,
                ...$projectData,
            ]);

            foreach ($tasks as $taskData) {
                Task::create([
                    'user_id' => $user->id,
                    'project_id' => $project->id,
                    ...$taskData,
                ]);
            }
        }
    }
}
