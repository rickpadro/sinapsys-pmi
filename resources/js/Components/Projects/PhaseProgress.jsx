import { PMI_PHASES } from '@/Lib/constants';

export default function PhaseProgress({ currentPhase, color }) {
    return (
        <div className="flex items-center gap-1">
            {Object.entries(PMI_PHASES).map(([key, label]) => {
                const phase = Number(key);
                const isActive = phase <= currentPhase;
                const isCurrent = phase === currentPhase;

                return (
                    <div key={phase} className="flex flex-1 flex-col items-center gap-1">
                        <div
                            className="h-2 w-full rounded-full transition-colors"
                            style={{
                                backgroundColor: isActive ? color : 'var(--border)',
                            }}
                        />
                        <span
                            className="text-[10px] font-medium"
                            style={{
                                color: isCurrent ? color : 'var(--text-muted)',
                            }}
                        >
                            {label}
                        </span>
                    </div>
                );
            })}
        </div>
    );
}
