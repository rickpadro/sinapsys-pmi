import {
    RadarChart,
    PolarGrid,
    PolarAngleAxis,
    PolarRadiusAxis,
    Radar,
    ResponsiveContainer,
} from 'recharts';

export default function ViabilityRadar({ project, size = 250 }) {
    const data = [
        { dimension: 'Mercado', value: project.viability_mercado },
        { dimension: 'Financiero', value: project.viability_financiero },
        { dimension: 'Técnico', value: project.viability_tecnico },
        { dimension: 'Riesgo (inv)', value: 10 - project.viability_riesgo },
    ];

    return (
        <ResponsiveContainer width="100%" height={size}>
            <RadarChart data={data} cx="50%" cy="50%" outerRadius="70%">
                <PolarGrid stroke="var(--border)" />
                <PolarAngleAxis
                    dataKey="dimension"
                    tick={{ fill: 'var(--text-muted)', fontSize: 12 }}
                />
                <PolarRadiusAxis
                    angle={90}
                    domain={[0, 10]}
                    tick={{ fill: 'var(--text-muted)', fontSize: 10 }}
                />
                <Radar
                    dataKey="value"
                    stroke={project.color}
                    fill={project.color}
                    fillOpacity={0.25}
                    strokeWidth={2}
                />
            </RadarChart>
        </ResponsiveContainer>
    );
}
