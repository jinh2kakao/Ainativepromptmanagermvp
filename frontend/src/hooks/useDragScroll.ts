import { useRef, useState, useCallback, MouseEvent } from 'react';

interface UseDragScrollReturn {
    ref: React.RefObject<HTMLDivElement | null>;
    onMouseDown: (e: MouseEvent<HTMLDivElement>) => void;
    onMouseMove: (e: MouseEvent<HTMLDivElement>) => void;
    onMouseUp: () => void;
    onMouseLeave: () => void;
    isDragging: boolean;
}

export function useDragScroll(): UseDragScrollReturn {
    const ref = useRef<HTMLDivElement>(null);
    const [isDragging, setIsDragging] = useState(false);
    const [startX, setStartX] = useState(0);
    const [scrollLeft, setScrollLeft] = useState(0);

    const onMouseDown = useCallback((e: MouseEvent<HTMLDivElement>) => {
        if (!ref.current) return;
        setIsDragging(true);
        setStartX(e.pageX - ref.current.offsetLeft);
        setScrollLeft(ref.current.scrollLeft);
    }, []);

    const onMouseMove = useCallback((e: MouseEvent<HTMLDivElement>) => {
        if (!isDragging || !ref.current) return;
        e.preventDefault();
        const x = e.pageX - ref.current.offsetLeft;
        const walk = (x - startX) * 1.5; // Scroll speed multiplier
        ref.current.scrollLeft = scrollLeft - walk;
    }, [isDragging, startX, scrollLeft]);

    const onMouseUp = useCallback(() => {
        setIsDragging(false);
    }, []);

    const onMouseLeave = useCallback(() => {
        setIsDragging(false);
    }, []);

    return {
        ref,
        onMouseDown,
        onMouseMove,
        onMouseUp,
        onMouseLeave,
        isDragging,
    };
}
