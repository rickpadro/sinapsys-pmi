<!DOCTYPE html>
<html>
<head>
    <meta charset="utf-8">
    <title>SinapSYS — Tareas</title>
    <style>
        body { font-family: sans-serif; font-size: 12px; color: #323338; }
        h1 { color: #4A6CF7; font-size: 20px; margin-bottom: 4px; }
        .subtitle { color: #676879; font-size: 11px; margin-bottom: 20px; }
        table { width: 100%; border-collapse: collapse; }
        th { background: #4A6CF7; color: white; text-align: left; padding: 6px 8px; font-size: 11px; }
        td { padding: 5px 8px; border-bottom: 1px solid #E6E9EF; font-size: 11px; }
        tr:nth-child(even) td { background: #F6F7FB; }
        .done { color: #00CA72; }
        .pending { color: #E44258; }
    </style>
</head>
<body>
    <h1>SinapSYS Tasks</h1>
    <p class="subtitle">Reporte generado el {{ now()->format('d/m/Y H:i') }}</p>

    <table>
        <thead>
            <tr>
                <th>Nombre</th>
                <th>Proyecto</th>
                <th>Categoría</th>
                <th>Prioridad</th>
                <th>Fecha</th>
                <th>Estado</th>
            </tr>
        </thead>
        <tbody>
            @foreach($tasks as $task)
            <tr>
                <td>{{ $task->name }}</td>
                <td>{{ $task->project?->name ?? '—' }}</td>
                <td>{{ $task->category }}</td>
                <td>{{ $priorities[$task->priority] ?? '' }}</td>
                <td>{{ $task->due_date?->format('d/m/Y') ?? '—' }}</td>
                <td class="{{ $task->done ? 'done' : 'pending' }}">
                    {{ $task->done ? 'Completada' : 'Pendiente' }}
                </td>
            </tr>
            @endforeach
        </tbody>
    </table>
</body>
</html>
