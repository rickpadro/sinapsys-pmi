import { useState } from 'react';
import { router } from '@inertiajs/react';
import { Button } from '@/Components/ui/button';
import { Input } from '@/Components/ui/input';
import { Plus } from 'lucide-react';
import { useUrl } from '@/Lib/utils';

export default function SectionEditor({ projectId, open, onOpen, onClose }) {
    const url = useUrl();
    const [name, setName] = useState('');

    function handleSubmit(e) {
        e.preventDefault();
        if (!name.trim()) return;
        router.post(url(`/projects/${projectId}/sections`), { name: name.trim() }, {
            preserveScroll: true,
            onSuccess: () => { setName(''); onClose(); },
        });
    }

    if (!open) {
        return (
            <button
                onClick={onOpen}
                className="flex items-center gap-1.5 text-xs px-3 py-1.5 rounded border border-dashed w-full hover:bg-black/5 dark:hover:bg-white/5 transition-colors"
                style={{ borderColor: 'var(--border)', color: 'var(--text-muted)' }}
            >
                <Plus size={12} /> Agregar sección
            </button>
        );
    }

    return (
        <form onSubmit={handleSubmit} className="flex items-center gap-2">
            <Input
                value={name}
                onChange={e => setName(e.target.value)}
                placeholder="Nombre de la sección"
                autoFocus
                className="flex-1"
            />
            <Button type="submit" size="sm" disabled={!name.trim()}>Crear</Button>
            <Button type="button" variant="outline" size="sm" onClick={() => { setName(''); onClose(); }}>
                Cancelar
            </Button>
        </form>
    );
}
