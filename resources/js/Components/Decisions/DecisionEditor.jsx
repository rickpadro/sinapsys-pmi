import { useState, useEffect } from 'react';
import { router } from '@inertiajs/react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/Components/ui/dialog';
import { Button } from '@/Components/ui/button';
import { Input } from '@/Components/ui/input';
import { Label } from '@/Components/ui/label';
import { useUrl } from '@/Lib/utils';

const EMPTY = { code:'', title:'', description:'', status:'pending', blocks_description:'', tags:[] };
const SS = { backgroundColor:'var(--background)', borderColor:'var(--border)', color:'var(--foreground)' };

export default function DecisionEditor({ open, onClose, decision, projectId }) {
    const url = useUrl();
    const [form, setForm] = useState(EMPTY);
    const [processing, setP] = useState(false);

    useEffect(() => {
        if (open) setForm(decision
            ? { code:decision.code, title:decision.title, description:decision.description, status:decision.status, blocks_description:decision.blocks_description||'', tags:decision.tags||[] }
            : EMPTY);
    }, [open, decision]);

    function submit(e) {
        e.preventDefault(); setP(true);
        const path = decision ? url(`/projects/${projectId}/decisions/${decision.id}`) : url(`/projects/${projectId}/decisions`);
        router[decision?'put':'post'](path, form, { preserveScroll:true, onSuccess:()=>{ onClose(); setP(false); }, onError:()=>setP(false) });
    }

    return (
        <Dialog open={open} onOpenChange={v => !v && onClose()}>
            <DialogContent className="sm:max-w-lg">
                <DialogHeader><DialogTitle>{decision ? 'Editar decisión' : 'Nueva decisión'}</DialogTitle></DialogHeader>
                <form onSubmit={submit} className="space-y-4">
                    <div className="grid gap-4 sm:grid-cols-2">
                        <div><Label>Código *</Label><Input value={form.code} onChange={e=>setForm(p=>({...p,code:e.target.value}))} placeholder="DEF001" className="mt-1" required disabled={!!decision}/></div>
                        <div><Label>Estado</Label>
                            <select value={form.status} onChange={e=>setForm(p=>({...p,status:e.target.value}))} className="mt-1 w-full rounded-md border px-3 py-2 text-sm" style={SS}>
                                <option value="pending">Pendiente</option><option value="confirmed">Confirmada</option><option value="rejected">Rechazada</option>
                            </select>
                        </div>
                    </div>
                    <div><Label>Título *</Label><Input value={form.title} onChange={e=>setForm(p=>({...p,title:e.target.value}))} className="mt-1" required/></div>
                    <div><Label>Descripción *</Label><textarea value={form.description} onChange={e=>setForm(p=>({...p,description:e.target.value}))} rows={3} className="mt-1 w-full rounded-md border px-3 py-2 text-sm" style={SS} required/></div>
                    <div><Label>Bloquea (descripción libre)</Label><Input value={form.blocks_description} onChange={e=>setForm(p=>({...p,blocks_description:e.target.value}))} placeholder="Estrategia BI, Sprint 1..." className="mt-1"/></div>
                    <div className="flex justify-end gap-2 pt-2">
                        <Button type="button" variant="outline" onClick={onClose}>Cancelar</Button>
                        <Button type="submit" disabled={processing}>{processing?'Guardando...':decision?'Actualizar':'Crear'}</Button>
                    </div>
                </form>
            </DialogContent>
        </Dialog>
    );
}
