import { useState } from 'react';
import { router } from '@inertiajs/react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/Components/ui/dialog';
import { Button } from '@/Components/ui/button';
import { Input } from '@/Components/ui/input';
import { Label } from '@/Components/ui/label';
import { useUrl } from '@/Lib/utils';
import { Clock } from 'lucide-react';

export default function TimeEntryForm({ open, onClose, task }) {
    const url = useUrl();
    const today = new Date().toISOString().slice(0, 10);
    const [form, setForm]             = useState({ hours: '', minutes: '', logged_on: today, description: '' });
    const [processing, setProcessing] = useState(false);
    const [error, setError]           = useState('');

    function totalMinutes() {
        return (parseInt(form.hours || 0) * 60) + parseInt(form.minutes || 0);
    }

    function handleSubmit(e) {
        e.preventDefault();
        const mins = totalMinutes();
        if (mins < 1)    { setError('Ingresa al menos 1 minuto.'); return; }
        if (mins > 1440) { setError('Máximo 24 horas por entrada.'); return; }
        setError('');
        setProcessing(true);
        router.post(url(`/tasks/${task.id}/time-entries`), {
            minutes:     mins,
            logged_on:   form.logged_on,
            description: form.description || null,
        }, {
            preserveScroll: true,
            onSuccess: () => {
                setForm({ hours: '', minutes: '', logged_on: today, description: '' });
                onClose();
                setProcessing(false);
            },
            onError: () => setProcessing(false),
        });
    }

    const INPUT_STYLE = {
        backgroundColor: 'var(--background)',
        borderColor:     'var(--border)',
        color:           'var(--foreground)',
    };

    return (
        <Dialog open={open} onOpenChange={v => !v && onClose()}>
            <DialogContent className="sm:max-w-sm">
                <DialogHeader>
                    <DialogTitle className="flex items-center gap-2">
                        <Clock size={16} /> Registrar tiempo
                    </DialogTitle>
                </DialogHeader>
                <p className="text-xs mb-3" style={{ color: 'var(--text-muted)' }}>
                    Tarea: <span style={{ color: 'var(--foreground)' }}>{task?.name}</span>
                </p>
                <form onSubmit={handleSubmit} className="space-y-4">
                    <div>
                        <Label>Tiempo trabajado</Label>
                        <div className="flex items-center gap-2 mt-1">
                            <div className="flex-1">
                                <Input
                                    type="number" min="0" max="23" placeholder="0"
                                    value={form.hours}
                                    onChange={e => setForm(p => ({ ...p, hours: e.target.value }))}
                                />
                                <p className="text-[10px] mt-0.5 text-center" style={{ color: 'var(--text-muted)' }}>horas</p>
                            </div>
                            <span className="text-lg font-bold pb-4" style={{ color: 'var(--text-muted)' }}>:</span>
                            <div className="flex-1">
                                <Input
                                    type="number" min="0" max="59" placeholder="0"
                                    value={form.minutes}
                                    onChange={e => setForm(p => ({ ...p, minutes: e.target.value }))}
                                />
                                <p className="text-[10px] mt-0.5 text-center" style={{ color: 'var(--text-muted)' }}>minutos</p>
                            </div>
                        </div>
                        {error && <p className="text-xs mt-1" style={{ color: 'var(--destructive)' }}>{error}</p>}
                    </div>

                    <div>
                        <Label htmlFor="logged-on">Fecha</Label>
                        <Input
                            id="logged-on" type="date" value={form.logged_on}
                            onChange={e => setForm(p => ({ ...p, logged_on: e.target.value }))}
                            className="mt-1"
                            max={today}
                        />
                    </div>

                    <div>
                        <Label htmlFor="time-desc">Descripción (opcional)</Label>
                        <textarea
                            id="time-desc" rows={2} value={form.description}
                            onChange={e => setForm(p => ({ ...p, description: e.target.value }))}
                            placeholder="¿Qué trabajaste?"
                            className="mt-1 w-full rounded-md border px-3 py-2 text-sm"
                            style={INPUT_STYLE}
                        />
                    </div>

                    <div className="flex justify-between items-center pt-1">
                        <span className="text-xs" style={{ color: 'var(--text-muted)' }}>
                            Total: {totalMinutes() > 0 ? `${Math.floor(totalMinutes() / 60)}h ${totalMinutes() % 60}m` : '—'}
                        </span>
                        <div className="flex gap-2">
                            <Button type="button" variant="outline" size="sm" onClick={onClose}>Cancelar</Button>
                            <Button type="submit" size="sm" disabled={processing || totalMinutes() < 1}>
                                {processing ? 'Guardando...' : 'Registrar'}
                            </Button>
                        </div>
                    </div>
                </form>
            </DialogContent>
        </Dialog>
    );
}
