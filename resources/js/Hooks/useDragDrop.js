import { useState } from 'react';

export function useDragDrop() {
    const [dragging, setDragging] = useState(null);

    function onDragStart(item) {
        return (e) => {
            setDragging(item);
            if (e.dataTransfer) {
                e.dataTransfer.effectAllowed = 'move';
                Object.entries(item).forEach(([k, v]) => {
                    e.dataTransfer.setData(k, String(v));
                });
            }
        };
    }

    function onDragEnd() {
        setDragging(null);
    }

    return { dragging, onDragStart, onDragEnd };
}
