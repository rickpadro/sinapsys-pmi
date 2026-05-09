import { CheckCircle2 } from 'lucide-react';

const STEP_LABELS = ['Metodología', 'Datos', 'Confirmar'];

export default function WizardNav({ step }) {
    return (
        <div className="mb-6 flex items-center gap-2">
            {[1, 2, 3].map(s => (
                <div key={s} className="flex items-center gap-2">
                    <div
                        className="w-7 h-7 rounded-full text-xs font-bold flex items-center justify-center text-white"
                        style={{ backgroundColor: s <= step ? 'var(--primary)' : 'var(--border)' }}
                    >
                        {s < step ? <CheckCircle2 size={14} /> : s}
                    </div>
                    <span
                        className="text-xs"
                        style={{ color: s === step ? 'var(--foreground)' : 'var(--muted)' }}
                    >
                        {STEP_LABELS[s - 1]}
                    </span>
                    {s < 3 && <div className="w-8 h-px" style={{ backgroundColor: 'var(--border)' }} />}
                </div>
            ))}
        </div>
    );
}
