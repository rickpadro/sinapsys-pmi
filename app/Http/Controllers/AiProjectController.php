<?php

namespace App\Http\Controllers;

use App\Models\Project;
use App\Models\Task;
use App\Services\AnthropicService;
use Illuminate\Http\Request;
use Inertia\Inertia;

class AiProjectController extends Controller
{
    private const SYSTEM_PROMPT = <<<'PROMPT'
Eres un asistente especializado en crear proyectos bajo metodología PMI. Tu trabajo es conversar con el usuario para entender su idea de proyecto y generar una propuesta completa.

FLUJO:
1. Pregunta sobre la idea del proyecto de forma conversacional (1-3 preguntas máximo).
2. Cuando tengas suficiente información, genera la propuesta completa.

CAMPOS A EXTRAER (infiere valores razonables si el usuario no los da explícitamente):
- name: nombre descriptivo del proyecto (max 255 chars)
- type: uno de "saas", "idea", "negocio", "cliente", "interno"
- priority: 1=Crítica, 2=Alta, 3=Media, 4=Baja
- phase: 0=Inicio, 1=Planificación, 2=Ejecución, 3=Monitoreo, 4=Cierre (nuevos proyectos normalmente empiezan en 0)
- impact: 1-10 (impacto potencial del proyecto)
- effort: 1-10 (esfuerzo requerido)
- description: qué problema resuelve, 1-3 oraciones
- tags: array de 3-5 etiquetas relevantes
- viability_mercado: 1-10
- viability_financiero: 1-10
- viability_tecnico: 1-10
- viability_riesgo: 1-10 (mayor = mayor riesgo)
- color: un hex de esta paleta: #1D9E75, #185FA5, #BA7517, #993556, #4A6CF7, #9B59B6, #E67E22, #2ECC71, #E74C3C, #1ABC9C

TAREAS SUGERIDAS: genera 3-5 tareas por cada una de las 5 fases PMI:
- Fase 0 (Inicio): tareas de definición y evaluación inicial
- Fase 1 (Planificación): tareas de alcance, cronograma, presupuesto
- Fase 2 (Ejecución): tareas de desarrollo y construcción
- Fase 3 (Monitoreo): tareas de seguimiento y control
- Fase 4 (Cierre): tareas de entrega y documentación

REGLAS:
- Responde siempre en español
- Sé conciso y directo
- Cuando generes la propuesta, SIEMPRE incluye un bloque JSON entre marcadores ```json y ```. El JSON debe tener esta estructura exacta:
{
  "proposal": true,
  "project": { name, type, priority, phase, impact, effort, description, tags, viability_mercado, viability_financiero, viability_tecnico, viability_riesgo, color },
  "phase_tasks": {
    "0": ["tarea1", "tarea2", ...],
    "1": ["tarea1", "tarea2", ...],
    "2": ["tarea1", "tarea2", ...],
    "3": ["tarea1", "tarea2", ...],
    "4": ["tarea1", "tarea2", ...]
  }
}
- ANTES del JSON, escribe un breve resumen en texto natural de lo que propones.
- DESPUÉS del JSON, pregunta si el usuario quiere ajustar algo antes de confirmar.
PROMPT;

    public function create()
    {
        return Inertia::render('Projects/CreateAI');
    }

    public function chat(Request $request, AnthropicService $anthropic)
    {
        $request->validate([
            'messages' => ['required', 'array'],
            'messages.*.role' => ['required', 'in:user,assistant'],
            'messages.*.content' => ['required', 'string'],
        ]);

        $reply = $anthropic->chat(self::SYSTEM_PROMPT, $request->messages, 1500);

        return response()->json(['reply' => $reply]);
    }

    public function confirm(Request $request)
    {
        $request->validate([
            'project' => ['required', 'array'],
            'project.name' => ['required', 'string', 'max:255'],
            'project.type' => ['required', 'in:saas,idea,negocio,cliente,interno'],
            'project.priority' => ['required', 'integer', 'between:1,4'],
            'project.phase' => ['required', 'integer', 'between:0,4'],
            'project.impact' => ['required', 'integer', 'between:1,10'],
            'project.effort' => ['required', 'integer', 'between:1,10'],
            'project.description' => ['nullable', 'string'],
            'project.tags' => ['nullable', 'array'],
            'project.viability_mercado' => ['required', 'integer', 'between:1,10'],
            'project.viability_financiero' => ['required', 'integer', 'between:1,10'],
            'project.viability_tecnico' => ['required', 'integer', 'between:1,10'],
            'project.viability_riesgo' => ['required', 'integer', 'between:1,10'],
            'project.color' => ['required', 'regex:/^#[0-9A-Fa-f]{6}$/'],
            'tasks' => ['nullable', 'array'],
            'tasks.*' => ['array'],
            'tasks.*.name' => ['required', 'string'],
            'tasks.*.priority' => ['required', 'integer', 'between:1,4'],
            'tasks.*.category' => ['required', 'string'],
        ]);

        $user = $request->user();

        $nextSlot = ($user->projects()->max('sort_order') ?? -1) + 1;
        $project = $user->projects()->create(array_merge($request->project, ['sort_order' => $nextSlot]));

        // Create tasks from the confirmed list
        if ($request->tasks) {
            foreach ($request->tasks as $taskData) {
                $user->tasks()->create([
                    'project_id' => $project->id,
                    'name' => $taskData['name'],
                    'priority' => $taskData['priority'],
                    'category' => $taskData['category'] ?? 'desarrollo',
                    'due_date' => $taskData['due_date'] ?? null,
                ]);
            }
        }

        return redirect()->route('projects.show', $project)
            ->with('success', 'Proyecto creado con IA.');
    }
}
