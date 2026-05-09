<?php

namespace Database\Seeders;

use App\Models\MethodologyTemplate;
use Illuminate\Database\Seeder;

class MethodologyTemplatesSeeder extends Seeder
{
    public function run(): void
    {
        $templates = [
            [
                'slug'        => 'pmi',
                'name'        => 'PMI',
                'description' => 'Gestión de proyectos según el estándar PMI con 5 grupos de procesos.',
                'default_view' => 'list',
                'default_sections' => [
                    ['name' => 'Inicio',        'order' => 0, 'status' => 'planned'],
                    ['name' => 'Planificación',  'order' => 1, 'status' => 'planned'],
                    ['name' => 'Ejecución',      'order' => 2, 'status' => 'planned'],
                    ['name' => 'Monitoreo',      'order' => 3, 'status' => 'planned'],
                    ['name' => 'Cierre',         'order' => 4, 'status' => 'planned'],
                ],
                'default_fields' => [
                    ['name' => 'Viabilidad Mercado',     'slug' => 'viability_mercado',     'field_type' => 'number', 'applies_to' => 'project'],
                    ['name' => 'Viabilidad Financiero',  'slug' => 'viability_financiero',  'field_type' => 'number', 'applies_to' => 'project'],
                    ['name' => 'Viabilidad Técnico',     'slug' => 'viability_tecnico',     'field_type' => 'number', 'applies_to' => 'project'],
                    ['name' => 'Viabilidad Riesgo',      'slug' => 'viability_riesgo',      'field_type' => 'number', 'applies_to' => 'project'],
                ],
                'default_roles' => [
                    ['name' => 'Manager',     'permissions' => ['can_edit' => true,  'can_invite' => true,  'can_delete' => false]],
                    ['name' => 'Colaborador', 'permissions' => ['can_edit' => false, 'can_invite' => false, 'can_delete' => false]],
                    ['name' => 'Observador',  'permissions' => ['can_edit' => false, 'can_invite' => false, 'can_delete' => false]],
                ],
            ],
            [
                'slug'        => 'scrum',
                'name'        => 'Scrum',
                'description' => 'Metodología ágil con sprints, user stories y story points.',
                'default_view' => 'board',
                'default_sections' => [
                    ['name' => 'Backlog',   'order' => 0, 'status' => 'planned'],
                    ['name' => 'Sprint 1',  'order' => 1, 'status' => 'active'],
                ],
                'default_fields' => [
                    ['name' => 'Story Points', 'slug' => 'story_points', 'field_type' => 'number', 'applies_to' => 'task'],
                    ['name' => 'Sprint Goal',  'slug' => 'sprint_goal',  'field_type' => 'text',   'applies_to' => 'section'],
                    ['name' => 'Tipo',         'slug' => 'item_type',    'field_type' => 'select',  'applies_to' => 'task',
                     'options' => ['User Story', 'Bug', 'Task', 'Spike', 'Epic']],
                ],
                'default_roles' => [
                    ['name' => 'Scrum Master',   'permissions' => ['can_edit' => true,  'can_invite' => true,  'can_delete' => false]],
                    ['name' => 'Product Owner',  'permissions' => ['can_edit' => true,  'can_invite' => true,  'can_delete' => false]],
                    ['name' => 'Dev Team',       'permissions' => ['can_edit' => false, 'can_invite' => false, 'can_delete' => false]],
                    ['name' => 'Stakeholder',    'permissions' => ['can_edit' => false, 'can_invite' => false, 'can_delete' => false]],
                ],
            ],
            [
                'slug'        => 'custom',
                'name'        => 'Custom',
                'description' => 'Configuración libre. Define tus propias secciones, campos y roles.',
                'default_view' => 'list',
                'default_sections' => [
                    ['name' => 'Por hacer',    'order' => 0, 'status' => 'planned'],
                    ['name' => 'En progreso',  'order' => 1, 'status' => 'active'],
                    ['name' => 'Completado',   'order' => 2, 'status' => 'planned'],
                ],
                'default_fields' => [],
                'default_roles' => [
                    ['name' => 'Manager',     'permissions' => ['can_edit' => true,  'can_invite' => true,  'can_delete' => false]],
                    ['name' => 'Colaborador', 'permissions' => ['can_edit' => false, 'can_invite' => false, 'can_delete' => false]],
                ],
            ],
            [
                'slug'        => 'kanban',
                'name'        => 'Kanban',
                'description' => 'Flujo continuo sin sprints. Visualiza el trabajo en columnas de estado.',
                'default_view' => 'board',
                'default_sections' => [
                    ['name' => 'Por hacer',    'order' => 0, 'status' => 'planned'],
                    ['name' => 'En progreso',  'order' => 1, 'status' => 'active'],
                    ['name' => 'En revisión',  'order' => 2, 'status' => 'planned'],
                    ['name' => 'Hecho',        'order' => 3, 'status' => 'planned'],
                ],
                'default_fields' => [
                    ['name' => 'Etiqueta',  'slug' => 'label',    'field_type' => 'select',  'applies_to' => 'task',
                     'options' => ['Bug', 'Feature', 'Mejora', 'Docs', 'Infra']],
                    ['name' => 'Bloqueo',   'slug' => 'blocker',  'field_type' => 'boolean', 'applies_to' => 'task'],
                ],
                'default_roles' => [
                    ['name' => 'Manager',     'permissions' => ['can_edit' => true,  'can_invite' => true,  'can_delete' => false]],
                    ['name' => 'Colaborador', 'permissions' => ['can_edit' => false, 'can_invite' => false, 'can_delete' => false]],
                ],
            ],
        ];

        foreach ($templates as $data) {
            MethodologyTemplate::updateOrCreate(['slug' => $data['slug']], $data);
        }
    }
}
