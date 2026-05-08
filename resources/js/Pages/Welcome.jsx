export default function Welcome() {
    return (
        <div className="flex min-h-screen items-center justify-center" style={{ backgroundColor: 'var(--background)' }}>
            <div className="rounded-lg p-8 text-center" style={{ backgroundColor: 'var(--surface)', boxShadow: 'var(--shadow-card)' }}>
                <h1 className="text-3xl font-bold" style={{ color: 'var(--primary)' }}>
                    SinapSYS Projects
                </h1>
                <p className="mt-2" style={{ color: 'var(--muted)' }}>
                    Plataforma PMI — Scaffolding completo
                </p>
            </div>
        </div>
    );
}
