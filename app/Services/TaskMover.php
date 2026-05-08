<?php

namespace App\Services;

use App\Models\Task;
use Illuminate\Support\Facades\DB;

class TaskMover
{
    public function move(Task $task, int $newSectionId, int $newOrder): void
    {
        DB::transaction(function () use ($task, $newSectionId, $newOrder) {
            $oldSectionId = $task->section_id;

            // Cerrar hueco en la sección origen
            if ($oldSectionId) {
                Task::where('section_id', $oldSectionId)
                    ->where('order_in_section', '>', $task->order_in_section)
                    ->decrement('order_in_section');
            }

            // Abrir espacio en la sección destino
            Task::where('section_id', $newSectionId)
                ->where('order_in_section', '>=', $newOrder)
                ->increment('order_in_section');

            $task->update([
                'section_id'       => $newSectionId,
                'order_in_section' => $newOrder,
            ]);
        });
    }
}
