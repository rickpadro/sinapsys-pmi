<!DOCTYPE html>
<html>
<head>
    <meta charset="utf-8">
    <title>SinapSYS — Proyectos</title>
    <style>
        body { font-family: sans-serif; font-size: 12px; color: #323338; }
        h1 { color: #4A6CF7; font-size: 20px; margin-bottom: 4px; }
        .subtitle { color: #676879; font-size: 11px; margin-bottom: 20px; }
        table { width: 100%; border-collapse: collapse; }
        th { background: #4A6CF7; color: white; text-align: left; padding: 6px 8px; font-size: 11px; }
        td { padding: 5px 8px; border-bottom: 1px solid #E6E9EF; font-size: 11px; }
        tr:nth-child(even) td { background: #F6F7FB; }
    </style>
</head>
<body>
    <h1>SinapSYS Projects</h1>
    <p class="subtitle">Reporte generado el {{ now()->format('d/m/Y H:i') }}</p>

    <table>
        <thead>
            <tr>
                <th>Nombre</th>
                <th>Tipo</th>
                <th>Fase</th>
                <th>Prioridad</th>
                <th>Impacto</th>
                <th>Esfuerzo</th>
                <th>Score</th>
            </tr>
        </thead>
        <tbody>
            @foreach($projects as $project)
            <tr>
                <td><strong>{{ $project->name }}</strong></td>
                <td>{{ $project->type }}</td>
                <td>{{ $phases[$project->phase] ?? '' }}</td>
                <td>{{ $priorities[$project->priority] ?? '' }}</td>
                <td>{{ $project->impact }}</td>
                <td>{{ $project->effort }}</td>
                <td>{{ $project->effort > 0 ? round($project->impact / $project->effort, 2) : 0 }}</td>
            </tr>
            @endforeach
        </tbody>
    </table>
</body>
</html>
