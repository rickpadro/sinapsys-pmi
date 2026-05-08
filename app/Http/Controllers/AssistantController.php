<?php

namespace App\Http\Controllers;

use App\Models\AiMessage;
use App\Models\Project;
use App\Services\AnthropicService;
use Illuminate\Http\Request;

class AssistantController extends Controller
{
    public function message(Request $request, Project $project, AnthropicService $anthropic)
    {
        abort_if(!$project->getRoleFor($request->user()->id), 403);

        $request->validate([
            'message' => ['required', 'string', 'max:2000'],
        ]);

        $phases     = ['Inicio', 'Planificación', 'Ejecución', 'Monitoreo', 'Cierre'];
        $priorities = [1 => 'Crítica', 2 => 'Alta', 3 => 'Media', 4 => 'Baja'];

        $systemPrompt = "Eres un asistente de proyectos PMI. Contexto del proyecto: " .
            "{$project->name}, tipo {$project->type}, " .
            "fase " . ($phases[$project->phase] ?? 'Desconocida') . ", " .
            "prioridad " . ($priorities[$project->priority] ?? 'Media') . ", " .
            "impacto {$project->impact}/10, esfuerzo {$project->effort}/10, " .
            "viabilidad mercado {$project->viability_mercado}/10, " .
            "financiero {$project->viability_financiero}/10, " .
            "técnico {$project->viability_tecnico}/10, " .
            "riesgo {$project->viability_riesgo}/10. " .
            "Descripción: " . ($project->description ?: 'Sin descripción') . ". " .
            "Responde en español, sé conciso y accionable.";

        $history = $project->aiMessages()
            ->orderBy('created_at')
            ->latest()
            ->take(20)
            ->get()
            ->reverse()
            ->values()
            ->map(fn ($m) => ['role' => $m->role, 'content' => $m->content])
            ->toArray();

        $history[] = ['role' => 'user', 'content' => $request->message];

        $reply = $anthropic->chat($systemPrompt, $history);

        AiMessage::create(['project_id' => $project->id, 'role' => 'user',      'content' => $request->message, 'created_at' => now()]);
        AiMessage::create(['project_id' => $project->id, 'role' => 'assistant', 'content' => $reply,            'created_at' => now()]);

        return back();
    }

    public function clear(Request $request, Project $project)
    {
        abort_if(!in_array($project->getRoleFor($request->user()->id), ['owner', 'manager']), 403);

        $project->aiMessages()->delete();

        return back();
    }
}
