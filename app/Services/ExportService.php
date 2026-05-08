<?php

namespace App\Services;

use App\Models\User;
use Barryvdh\DomPDF\Facade\Pdf;
use Maatwebsite\Excel\Concerns\FromCollection;
use Maatwebsite\Excel\Concerns\ShouldAutoSize;
use Maatwebsite\Excel\Concerns\WithHeadings;
use Maatwebsite\Excel\Facades\Excel;

class ExportService
{
    private const PHASES = ['Inicio', 'Planificación', 'Ejecución', 'Monitoreo', 'Cierre'];
    private const PRIORITIES = [1 => 'Crítica', 2 => 'Alta', 3 => 'Media', 4 => 'Baja'];

    public function projectsPdf(User $user)
    {
        $projects = $user->projects()->orderBy('priority')->get();

        $pdf = Pdf::loadView('exports.projects', [
            'projects' => $projects,
            'phases' => self::PHASES,
            'priorities' => self::PRIORITIES,
        ]);

        return $pdf->download('sinapsys-proyectos.pdf');
    }

    public function projectsExcel(User $user)
    {
        $projects = $user->projects()->orderBy('priority')->get();

        $export = new class($projects) implements FromCollection, WithHeadings, ShouldAutoSize {
            private $projects;

            public function __construct($projects)
            {
                $this->projects = $projects;
            }

            public function headings(): array
            {
                return ['Nombre', 'Tipo', 'Fase', 'Prioridad', 'Impacto', 'Esfuerzo', 'Score', 'Mercado', 'Financiero', 'Técnico', 'Riesgo'];
            }

            public function collection()
            {
                $phases = ['Inicio', 'Planificación', 'Ejecución', 'Monitoreo', 'Cierre'];
                $priorities = [1 => 'Crítica', 2 => 'Alta', 3 => 'Media', 4 => 'Baja'];

                return $this->projects->map(fn ($p) => [
                    $p->name,
                    $p->type,
                    $phases[$p->phase] ?? '',
                    $priorities[$p->priority] ?? '',
                    $p->impact,
                    $p->effort,
                    $p->effort > 0 ? round($p->impact / $p->effort, 2) : 0,
                    $p->viability_mercado,
                    $p->viability_financiero,
                    $p->viability_tecnico,
                    $p->viability_riesgo,
                ]);
            }
        };

        return Excel::download($export, 'sinapsys-proyectos.xlsx');
    }

    public function tasksPdf(User $user)
    {
        $tasks = $user->tasks()->with('project:id,name')->orderBy('done')->orderBy('priority')->get();

        $pdf = Pdf::loadView('exports.tasks', [
            'tasks' => $tasks,
            'priorities' => self::PRIORITIES,
        ]);

        return $pdf->download('sinapsys-tareas.pdf');
    }

    public function tasksExcel(User $user)
    {
        $tasks = $user->tasks()->with('project:id,name')->orderBy('done')->orderBy('priority')->get();

        $export = new class($tasks) implements FromCollection, WithHeadings, ShouldAutoSize {
            private $tasks;

            public function __construct($tasks)
            {
                $this->tasks = $tasks;
            }

            public function headings(): array
            {
                return ['Nombre', 'Proyecto', 'Categoría', 'Prioridad', 'Fecha', 'Estado', 'Horas est.'];
            }

            public function collection()
            {
                $priorities = [1 => 'Crítica', 2 => 'Alta', 3 => 'Media', 4 => 'Baja'];

                return $this->tasks->map(fn ($t) => [
                    $t->name,
                    $t->project?->name ?? 'Sin proyecto',
                    $t->category,
                    $priorities[$t->priority] ?? '',
                    $t->due_date?->format('Y-m-d') ?? '',
                    $t->done ? 'Completada' : 'Pendiente',
                    $t->estimated_time ?? '',
                ]);
            }
        };

        return Excel::download($export, 'sinapsys-tareas.xlsx');
    }
}
