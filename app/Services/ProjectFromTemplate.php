<?php

namespace App\Services;

use App\Models\CustomField;
use App\Models\MethodologyTemplate;
use App\Models\Project;
use App\Models\ProjectRoleDefinition;
use App\Models\Section;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Str;

class ProjectFromTemplate
{
    public function applyTemplate(Project $project, MethodologyTemplate $template): void
    {
        DB::transaction(function () use ($project, $template) {
            foreach ($template->default_sections as $section) {
                Section::create([
                    'project_id' => $project->id,
                    'name'       => $section['name'],
                    'order'      => $section['order'],
                    'status'     => $section['status'] ?? 'planned',
                ]);
            }

            foreach ($template->default_fields as $i => $field) {
                if (empty($field['name'])) continue;
                CustomField::firstOrCreate(
                    ['project_id' => $project->id, 'slug' => $field['slug'] ?? Str::slug($field['name'], '_')],
                    [
                        'name'       => $field['name'],
                        'field_type' => $field['field_type'],
                        'applies_to' => $field['applies_to'] ?? 'task',
                        'options'    => isset($field['options']) ? json_encode($field['options']) : null,
                        'order'      => $i,
                    ]
                );
            }

            foreach ($template->default_roles as $i => $role) {
                ProjectRoleDefinition::firstOrCreate(
                    ['project_id' => $project->id, 'name' => $role['name']],
                    [
                        'permissions' => $role['permissions'],
                        'is_default'  => true,
                        'order'       => $i,
                    ]
                );
            }
        });
    }
}
