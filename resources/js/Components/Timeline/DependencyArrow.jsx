export default function DependencyArrow({
    fromPct,
    toPct,
    rowFromIndex,
    rowToIndex,
    rowHeight = 40,
    color = 'var(--primary)',
}) {
    if (Math.abs(fromPct - toPct) < 0.5 && rowFromIndex === rowToIndex) return null;

    const markerId = `arrow-${rowFromIndex}-${rowToIndex}-${Math.round(fromPct)}-${Math.round(toPct)}`;
    const x1 = `${fromPct}%`;
    const x2 = `${toPct}%`;
    const y1 = rowFromIndex * rowHeight + rowHeight / 2;
    const y2 = rowToIndex * rowHeight + rowHeight / 2;
    const midX = `${(fromPct + toPct) / 2}%`;

    return (
        <svg
            className="absolute inset-0 pointer-events-none overflow-visible"
            style={{ width: '100%', height: '100%' }}
        >
            <defs>
                <marker
                    id={markerId}
                    markerWidth="6"
                    markerHeight="6"
                    refX="3"
                    refY="3"
                    orient="auto"
                >
                    <path d="M0,0 L0,6 L6,3 z" fill={color} />
                </marker>
            </defs>
            <path
                d={`M ${x1} ${y1} C ${midX} ${y1}, ${midX} ${y2}, ${x2} ${y2}`}
                fill="none"
                stroke={color}
                strokeWidth="1.5"
                strokeDasharray="4 2"
                opacity="0.7"
                markerEnd={`url(#${markerId})`}
            />
        </svg>
    );
}
