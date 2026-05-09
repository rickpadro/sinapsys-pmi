import { useState, useEffect } from 'react';
import { router } from '@inertiajs/react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/Components/ui/dialog';
import { Button } from '@/Components/ui/button';
import { Input } from '@/Components/ui/input';
import { Label } from '@/Components/ui/label';
import { useUrl } from '@/Lib/utils';

const EMPTY = { name:'', description:'', target_date:'', criticality:'medium', color:'' };
const SS = { backgroundColor:'var(--background)', borderColor:'var(--border)', color:'var(--foreground)' };

export default function MilestoneEditor({ open, onClose, milestone, projectId }) {
    const url = useUrl();
    const [form, setForm] = useState(EMPTY);
    const [processing, setProcessing] = useState(false);

    useEffect(() => {
        if (open) setForm(milestone ? { name:milestone.name, description:milestone.description||'', target_date:milestone.target_date||'', criticality:milestone.criticality||'medium', color:milestone.color||'' } : EMPTY);
    }, [open, milestone]);

    function handleSubmit(e) {
        e.preventDefault();
        setProcessing(true);
        const path = milestone ? url(`/projects/${projectId}/milestones/${milestone.id}`) : url(`/projects/${projectId}/milestones`);
        const method = milestone ? 'put' : 'post';
        router[method](path, form, { preserveScroll:true, onSuccess:() => { onClose(); setProcessing(false); }, onError:() => setProcessing(false) });
    }

    return (
        <Dialog open={open} onOpenChange={v => !v && onClose()}>
            <DialogContent className="sm:max-w-md">
                <DialogHeader><DialogTitle>{milestone ? 'Editar hito' : 'Nuevo hito'}</DialogTitle></DialogHeader>
                <form onSubmit={handleSubmit} className="space-y-4">
                    <div><Label>Nombre *</Label><Input value={form.name} onChange={e => setForm(p=>({...p,name:e.target.value}))} className="mt-1" required autoFocus /></div>
                    <div><Label>Descripción</Label><textarea value={form.description} onChange={e => setForm(p=>({...p,description:e.target.value}))} rows={2} className="mt-1 w-full rounded-md border px-3 py-2 text-sm" style={SS} /></div>
                    <div className="grid gap-4 sm:grid-cols-2">
                        <div><Label>Fecha objetivo *</Label><Input type="date" value={form.target_date} onChange={e => setForm(p=>({...p,target_date:e.target.value}))} className="mt-1" required /></div>
                        <div><Label>Criticidad</Label>
                            <select value={form.criticality} onChange={e => setForm(p=>({...p,criticality:e.target.value}))} className="mt-1 w-full rounded-md border px-3 py-2 text-sm" style={SS}>
                                <option value="low">Baja</option><option value="medium">Media</option><option value="high">Alta</option><option value="critical">Crítica</option>
                            </select>
                        </div>
                    </div>
                    <div className="flex justify-end gap-2 pt-2">
                        <Button type="button" variant="outline" onClick={onClose}>Cancelar</Button>
                        <Button type="submit" disabled={processing || !form.name.trim() || !form.target_date}>{processing ? 'Guardando...' : milestone ? 'Actualizar' : 'Crear'}</Button>
                    </div>
                </form>
            </DialogContent>
        </Dialog>
    );
}
