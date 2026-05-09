import { useState } from 'react';
import { router } from '@inertiajs/react';
import DecisionCard from '@/Components/Decisions/DecisionCard';
import DecisionEditor from '@/Components/Decisions/DecisionEditor';
import { Input } from '@/Components/ui/input';
import { Search } from 'lucide-react';

const STATUS_FILTERS = ['all','pending','confirmed','rejected'];
const FILTER_LABELS  = { all:'Todas', pending:'Pendientes', confirmed:'Confirmadas', rejected:'Rechazadas' };

export default function DecisionsList({ decisions = [], canEdit, projectId, url }) {
    const [filter, setFilter]   = useState('all');
    const [search, setSearch]   = useState('');
    const [editor, setEditor]   = useState({ open:false, decision:null });

    const filtered = decisions.filter(d => {
        const matchStatus = filter === 'all' || d.status === filter;
        const matchSearch = !search || d.code.toLowerCase().includes(search.toLowerCase()) || d.title.toLowerCase().includes(search.toLowerCase());
        return matchStatus && matchSearch;
    });

    function handleConfirm(decision) {
        router.patch(url(`/projects/${projectId}/decisions/${decision.id}/confirm`), {}, { preserveScroll:true });
    }
    function handleReject(decision) {
        if (!confirm('¿Rechazar esta decisión?')) return;
        router.patch(url(`/projects/${projectId}/decisions/${decision.id}/reject`), {}, { preserveScroll:true });
    }

    return (
        <div className="space-y-3">
            <div className="flex flex-wrap items-center gap-2">
                <div className="relative flex-1 min-w-[160px]">
                    <Search size={13} className="absolute left-2.5 top-1/2 -translate-y-1/2" style={{ color:'var(--text-muted)' }}/>
                    <Input value={search} onChange={e=>setSearch(e.target.value)} placeholder="Buscar..." className="pl-7 h-8 text-xs"/>
                </div>
                <div className="flex gap-1">
                    {STATUS_FILTERS.map(s => (
                        <button key={s} onClick={() => setFilter(s)}
                            className="text-xs px-2.5 py-1 rounded-full border transition-colors"
                            style={{ borderColor:filter===s?'var(--primary)':'var(--border)', backgroundColor:filter===s?'var(--primary)':'transparent', color:filter===s?'#fff':'var(--text-muted)' }}>
                            {FILTER_LABELS[s]}
                        </button>
                    ))}
                </div>
            </div>

            {filtered.length === 0 ? (
                <p className="text-sm text-center py-6" style={{ color:'var(--text-muted)' }}>Sin resultados.</p>
            ) : filtered.map(d => (
                <DecisionCard key={d.id} decision={d} canEdit={canEdit}
                    onConfirm={() => handleConfirm(d)}
                    onReject={() => handleReject(d)}
                    onEdit={() => setEditor({open:true, decision:d})}/>
            ))}

            <DecisionEditor open={editor.open} onClose={() => setEditor({open:false, decision:null})} decision={editor.decision} projectId={projectId}/>
        </div>
    );
}
