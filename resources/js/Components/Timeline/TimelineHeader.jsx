export default function TimelineHeader({ months }) {
    return (
        <div className="relative h-8 border-b" style={{ borderColor: 'var(--border)' }}>
            {months.map((m, i) => (
                <div
                    key={i}
                    className="absolute top-0 h-full flex items-center justify-center text-[10px] border-r"
                    style={{
                        left: `${m.left}%`,
                        width: `${m.width}%`,
                        borderColor: 'var(--border)',
                        color: 'var(--text-muted)',
                    }}
                >
                    {m.width > 5 && m.label}
                </div>
            ))}
        </div>
    );
}
