<?php

namespace App\Http\Controllers;

use App\Services\ExportService;
use Illuminate\Http\Request;

class ExportController extends Controller
{
    public function projects(Request $request, string $format, ExportService $export)
    {
        return match ($format) {
            'pdf' => $export->projectsPdf($request->user()),
            'xlsx' => $export->projectsExcel($request->user()),
            default => abort(404),
        };
    }

    public function tasks(Request $request, string $format, ExportService $export)
    {
        return match ($format) {
            'pdf' => $export->tasksPdf($request->user()),
            'xlsx' => $export->tasksExcel($request->user()),
            default => abort(404),
        };
    }
}
