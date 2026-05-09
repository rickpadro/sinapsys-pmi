import { Button } from '@/Components/ui/button';
import { Input } from '@/Components/ui/input';
import { Label } from '@/Components/ui/label';
import { PROJECT_TYPES, PRIORITIES, PROJECT_COLORS } from '@/Lib/constants';

const SELECT_STYLE = {
    backgroundColor: 'var(--background)',
    borderColor:     'var(--border)',
    color:           'var(--foreground)',
};

export default function StepProjectData({ data, setData, errors, onNext, onBack }) {
    return (
        <form onSubmit={e => { e.preventDefault(); onNext(); }}>
            <h2 className="mb-4 text-lg font-semibold" style={{ color: 'var(--foreground)' }}>
                Datos del proyecto
            </h2>
            <div className="space-y-5">
                <div>
                    <Label htmlFor="name">Nombre *</Label>
                    <Input
                        id="name"
                        value={data.name}
                        onChange={e => setData('name', e.target.value)}
                        className="mt-1"
                        autoFocus
                        required
                    />
                    {errors.name && <p className="mt-1 text-xs" style={{ color: 'var(--destructive)' }}>{errors.name}</p>}
                </div>

                <div className="grid gap-4 sm:grid-cols-2">
                    <div>
                        <Label>Tipo</Label>
                        <select
                            value={data.type}
                            onChange={e => setData('type', e.target.value)}
                            className="mt-1 w-full rounded-md border px-3 py-2 text-sm"
                            style={SELECT_STYLE}
                        >
                            {Object.entries(PROJECT_TYPES).map(([k, v]) => <option key={k} value={k}>{v}</option>)}
                        </select>
                    </div>
                    <div>
                        <Label>Prioridad</Label>
                        <select
                            value={data.priority}
                            onChange={e => setData('priority', Number(e.target.value))}
                            className="mt-1 w-full rounded-md border px-3 py-2 text-sm"
                            style={SELECT_STYLE}
                        >
                            {Object.entries(PRIORITIES).map(([k, v]) => <option key={k} value={k}>{v.icon} {v.label}</option>)}
                        </select>
                    </div>
                </div>

                <div>
                    <Label htmlFor="description">Descripción</Label>
                    <textarea
                        id="description"
                        value={data.description || ''}
                        onChange={e => setData('description', e.target.value)}
                        rows={3}
                        className="mt-1 w-full rounded-md border px-3 py-2 text-sm"
                        style={SELECT_STYLE}
                    />
                </div>

                <div>
                    <Label>Color</Label>
                    <div className="mt-2 flex flex-wrap gap-2">
                        {PROJECT_COLORS.map(c => (
                            <button
                                key={c}
                                type="button"
                                onClick={() => setData('color', c)}
                                className="h-8 w-8 rounded-full transition-transform"
                                style={{
                                    backgroundColor: c,
                                    outline:         data.color === c ? '2px solid var(--foreground)' : 'none',
                                    outlineOffset:   '2px',
                                    transform:       data.color === c ? 'scale(1.15)' : 'scale(1)',
                                }}
                            />
                        ))}
                    </div>
                </div>
            </div>

            <div className="mt-6 flex gap-3">
                <Button type="submit" disabled={!data.name.trim()}>Siguiente →</Button>
                <Button type="button" variant="outline" onClick={onBack}>← Volver</Button>
            </div>
        </form>
    );
}
