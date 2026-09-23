import { useEffect, useRef } from 'react';

/**
 * Listens for pointer movement over `heroRef` and keeps a mutable ref of
 * normalized device coordinates (-1..1). A ref, not state, because this
 * feeds a useFrame loop every frame and must not trigger React re-renders.
 */
export function useHeroPointer(heroRef) {
  const pointerRef = useRef({ nx: 0, ny: 0, active: false });

  useEffect(() => {
    const el = heroRef.current;
    if (!el) return;

    const onMove = (e) => {
      const rect = el.getBoundingClientRect();
      pointerRef.current.nx = ((e.clientX - rect.left) / rect.width) * 2 - 1;
      pointerRef.current.ny = -(((e.clientY - rect.top) / rect.height) * 2 - 1);
      pointerRef.current.active = true;
    };
    const onLeave = () => {
      pointerRef.current.active = false;
    };

    el.addEventListener('pointermove', onMove);
    el.addEventListener('pointerleave', onLeave);
    el.addEventListener('pointercancel', onLeave);
    return () => {
      el.removeEventListener('pointermove', onMove);
      el.removeEventListener('pointerleave', onLeave);
      el.removeEventListener('pointercancel', onLeave);
    };
  }, [heroRef]);

  return pointerRef;
}
