"use client";

import Image from "next/image";
import { useEffect, useRef, useState } from "react";

export default function Portrait() {
  const portraitRef = useRef(null);
  const rafRef = useRef();
  const targetRef = useRef({ x: 0, y: 0 });
  const currentRef = useRef({ x: 0, y: 0, init: false });
  const pointerActiveRef = useRef(false);
  const [isOver, setIsOver] = useState(false);

  useEffect(() => {
    const reduce = window.matchMedia(
      "(prefers-reduced-motion: reduce)",
    ).matches;

    const tick = (now) => {
      const el = portraitRef.current;
      if (el) {
        const rect = el.getBoundingClientRect();
        let tx;
        let ty;
        if (pointerActiveRef.current) {
          tx = targetRef.current.x - rect.left;
          ty = targetRef.current.y - rect.top;
        } else {
          const s = now / 1000;
          tx = rect.width * (0.5 + 0.24 * Math.sin(s * 0.5));
          ty = rect.height * (0.4 + 0.16 * Math.sin(s * 0.37 + 1));
        }
        const cur = currentRef.current;
        if (!cur.init) {
          cur.x = tx;
          cur.y = ty;
          cur.init = true;
        }
        cur.x += (tx - cur.x) * 0.12;
        cur.y += (ty - cur.y) * 0.12;
        el.style.setProperty("--lx", `${cur.x.toFixed(1)}px`);
        el.style.setProperty("--ly", `${cur.y.toFixed(1)}px`);
      }
      if (!reduce) rafRef.current = requestAnimationFrame(tick);
    };

    rafRef.current = requestAnimationFrame(tick);
    return () => {
      if (rafRef.current) cancelAnimationFrame(rafRef.current);
    };
  }, []);

  const onPointerMove = (e) => {
    targetRef.current = { x: e.clientX, y: e.clientY };
    pointerActiveRef.current = true;
  };
  const onPointerLeave = () => {
    pointerActiveRef.current = false;
    setIsOver(false);
  };

  return (
    <div className="frame mx-auto w-[min(300px,60vw)] justify-self-center p-3.5">
      <div
        ref={portraitRef}
        onPointerMove={onPointerMove}
        onPointerLeave={onPointerLeave}
        onPointerEnter={() => setIsOver(true)}
        className="group relative aspect-[3/4] cursor-crosshair overflow-hidden rounded-md border border-line bg-surface"
      >
        <Image
          src="/user.webp"
          alt="Portrait of Ahmed Almaz"
          fill
          priority
          draggable={false}
          sizes="300px"
          className="object-cover object-[50%_20%]"
        />

        {/* cursor-following light */}
        <div className="bg-portrait-light pointer-events-none absolute inset-0" />

        {/* corner reticle that follows the light */}
        <div
          aria-hidden="true"
          className={`pointer-events-none absolute z-[1] h-[84px] w-[84px] -translate-x-1/2 -translate-y-1/2 transition-all duration-300 ${
            isOver ? "scale-100 opacity-100" : "scale-150 opacity-0"
          }`}
          style={{ left: "var(--lx, 50%)", top: "var(--ly, 38%)" }}
        >
          <i className="absolute left-0 top-0 h-[18px] w-[18px] border-2 border-r-0 border-b-0 border-accent" />
          <i className="absolute right-0 top-0 h-[18px] w-[18px] border-2 border-l-0 border-b-0 border-accent" />
          <i className="absolute bottom-0 left-0 h-[18px] w-[18px] border-2 border-r-0 border-t-0 border-accent" />
          <i className="absolute bottom-0 right-0 h-[18px] w-[18px] border-2 border-l-0 border-t-0 border-accent" />
        </div>
      </div>
    </div>
  );
}
