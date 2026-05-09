import { useState, useEffect } from 'react';
import { router } from '@inertiajs/react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/Components/ui/dialog';
import { Button } from '@/Components/ui/button';
import { Input } from '@/Components/ui/input';
import { Label } from '@/Components/ui/label';
import { useUrl } from '@/Lib/utils';

const EMPTY = { code:'', name:'', description:'', probability:'medium', impact:'medium', mitigation_plan:'', identified_on:'' };
const SS = { backgroundColor:'var(--background)', borderColor:'var(--border)', color:'var(--foreground)' };

export default function RiskEditor({ open, onClose, risk, projectId }) {
    const url = useUrl();
    const [form, setForm]     = useState(EMPTY);
    const [processing, setP]  = useState(false);

    useEffect(() => {
        if (open) setForm(risk ? { code:risk.code, name:risk.name, description:risk.description, probability:risk.probability, impact:risk.impact, mitigation_plan:risk.mitigation_plan||'', identified_on:risk.identified_on||'' } : { ...EMPTY, identified_on:new Date().toISOString().slice(0,10) });
    }, [open, risk]);

    function submit(e) {
        e.preventDefault(); setP(true);
        const path = risk ? url(`/projects/${projectId}/risks/${risk.id}`) : url(`/projects/${projectId}/risks`);
        router[risk?'put':'post'](path, form, { preserveScroll:true, onSuccess:()=>{ onClose(); setP(false); }, onError:()=>setP(false) });
    }

    return (
        <Dialog open={open} onOpenChange={v => !v && onClose()}>
            <DialogContent className="sm:max-w-lg">
                <DialogHeader><DialogTitle>{risk ? 'Editar riesgo' : 'Registrar riesgo'}</DialogTitle></DialogHeader>
                <form onSubmit={submit} className="space-y-4">
                    <div className="grid gap-4 sm:grid-cols-2">
                        <div><Label>Código *</Label><Input value={form.code} onChange={e=>setForm(p=>({...p,code:e.target.value}))} className="mt-1" placeholder="R1" required/></div>
                        <div><Label>Fecha identificado *</Label><Input type="date" value={form.identified_on} onChange={e=>setForm(p=>({...p,identified_on:e.target.value}))} className="mt-1" required/></div>
                    </div>
                    <div><Label>Nombre *</Label><Input value={form.name} onChange={e=>setForm(p=>({...p,name:e.target.value}))} className="mt-1" required/></div>
                    <div><Label>Descripción *</Label><textarea value={form.description} onChange={e=>setForm(p=>({...p,description:e.target.value}))} rows={2} className="mt-1 w-full rounded-md border px-3 py-2 text-sm" style={SS} required/></div>
                    <div className="grid gap-4 sm:grid-cols-2">
                        <div><Label>Probabilidad</Label>
                            <select value={form.probability} onChange={e=>setForm(p=>({...p,probability:e.target.value}))} className="mt-1 w-full rounded-md border px-3 py-2 text-sm" style={SS}>
                                <option value="low">Baja</option><option value="medium">Media</option><option value="high">Alta</option>
                            </select></div>
                        <div><Label>Impacto</Label>
                            <select value={form.impact} onChange={e=>setForm(p=>({...p,impact:e.target.value}))} className="mt-1 w-full rounded-md border px-3 py-2 text-sm" style={SS}>
                                <option value="low">Bajo</option><option value="medium">Medio</option><option value="high">Alto</option><option value="critical">Crítico</option>
                            </select></div>
                    </div>
                    <div><Label>Plan de mitigación</Label><textarea value={form.mitigation_plan} onChange={e=>setForm(p=>({...p,mitigation_plan:e.target.value}))} rows={2} className="mt-1 w-full rounded-md border px-3 py-2 text-sm" style={SS}/></div>
                    <div className="flex justify-end gap-2 pt-2">
                        <Button type="button" variant="outline" onClick={onClose}>Cancelar</Button>
                        <Button type="submit" disabled={processing}>{processing?'Guardando...':risk?'Actualizar':'Registrar'}</Button>
                    </div>
                </form>
            </DialogContent>
        </Dialog>
    );
}
