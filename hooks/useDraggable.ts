import { useCallback, useEffect, useRef, useState } from 'react';

interface Position {
  x: number;
  y: number;
}

export function useDraggable(initial: Position) {
  const [position, setPosition] = useState<Position>(initial);
  const draggingRef = useRef(false);
  const startRef = useRef<{ mouseX: number; mouseY: number; x: number; y: number } | null>(
    null,
  );

  const onMouseDown = useCallback((event: React.MouseEvent) => {
    event.preventDefault();
    draggingRef.current = true;
    startRef.current = {
      mouseX: event.clientX,
      mouseY: event.clientY,
      x: position.x,
      y: position.y,
    };
  }, [position]);

  useEffect(() => {
    const onMove = (event: MouseEvent) => {
      if (!draggingRef.current || !startRef.current) return;
      const dx = event.clientX - startRef.current.mouseX;
      const dy = event.clientY - startRef.current.mouseY;
      setPosition({ x: startRef.current.x + dx, y: startRef.current.y + dy });
    };

    const onUp = () => {
      draggingRef.current = false;
      startRef.current = null;
    };

    window.addEventListener('mousemove', onMove);
    window.addEventListener('mouseup', onUp);
    return () => {
      window.removeEventListener('mousemove', onMove);
      window.removeEventListener('mouseup', onUp);
    };
  }, []);

  const style: React.CSSProperties = {
    position: 'fixed',
    left: position.x,
    top: position.y,
  };

  return { style, onMouseDown };
}
