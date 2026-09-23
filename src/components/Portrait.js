'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import { useToast } from '@/providers/ToastProvider';
import { cx } from '@/lib/cx';

const STORAGE_KEY = 'portfolio-photo';

export default function Portrait() {
  const portraitRef = useRef(null);
  const rafRef = useRef();
  const targetRef = useRef({ x: 0, y: 0 });
  const currentRef = useRef({ x: 0, y: 0, init: false });
  const pointerActiveRef = useRef(false);

  const [photo, setPhoto] = useState(null);
  const [dragOver, setDragOver] = useState(false);
  const [isOver, setIsOver] = useState(false);
  const { show } = useToast();

  useEffect(() => {
    try {
      const saved = window.localStorage.getItem(STORAGE_KEY);
      if (saved) setPhoto(saved);
    } catch {
      /* storage unavailable (private browsing, etc.) */
    }
  }, []);

  useEffect(() => {
    const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

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
        el.style.setProperty('--lx', `${cur.x.toFixed(1)}px`);
        el.style.setProperty('--ly', `${cur.y.toFixed(1)}px`);
      }
      if (!reduce) rafRef.current = requestAnimationFrame(tick);
    };

    rafRef.current = requestAnimationFrame(tick);
    return () => {
      if (rafRef.current) cancelAnimationFrame(rafRef.current);
    };
  }, []);

  const onPointerMove = useCallback((e) => {
    targetRef.current = { x: e.clientX, y: e.clientY };
    pointerActiveRef.current = true;
  }, []);
  const onPointerLeave = useCallback(() => {
    pointerActiveRef.current = false;
    setIsOver(false);
  }, []);

  const fromFile = useCallback(
    (file) => {
      if (!file || !file.type.startsWith('image/')) {
        show('Choose an image file.');
        return;
      }
      const url = URL.createObjectURL(file);
      const img = new Image();
      img.onload = () => {
        const scale = Math.min(1, 1000 / Math.max(img.width, img.height));
        const canvas = document.createElement('canvas');
        canvas.width = Math.round(img.width * scale);
        canvas.height = Math.round(img.height * scale);
        const ctx = canvas.getContext('2d');
        ctx?.drawImage(img, 0, 0, canvas.width, canvas.height);
        const data = canvas.toDataURL('image/jpeg', 0.86);
        URL.revokeObjectURL(url);
        setPhoto(data);
        try {
          window.localStorage.setItem(STORAGE_KEY, data);
        } catch {
          /* storage unavailable */
        }
        show('Photo added');
      };
      img.onerror = () => {
        URL.revokeObjectURL(url);
        show('That file could not be read as an image.');
      };
      img.src = url;
    },
    [show]
  );

  return (
    <div className="relative mx-auto w-[min(400px,80vw)] justify-self-center before:pointer-events-none before:absolute before:-inset-3.5 before:rounded-[50%_50%_40px_40px/38%_38%_40px_40px] before:border before:border-line">
      <div
        ref={portraitRef}
        onPointerMove={onPointerMove}
        onPointerLeave={onPointerLeave}
        onPointerEnter={() => setIsOver(true)}
        onDragEnter={(e) => {
          e.preventDefault();
          setDragOver(true);
        }}
        onDragOver={(e) => e.preventDefault()}
        onDragLeave={(e) => {
          e.preventDefault();
          setDragOver(false);
        }}
        onDrop={(e) => {
          e.preventDefault();
          setDragOver(false);
          fromFile(e.dataTransfer.files[0]);
        }}
        className={cx(
          'group relative aspect-[3/4] cursor-crosshair overflow-hidden rounded-[50%_50%_28px_28px/37.5%_37.5%_28px_28px] border bg-surface transition-colors',
          dragOver ? 'border-accent' : 'border-line'
        )}
      >
        {photo ? (
          // eslint-disable-next-line @next/next/no-img-element -- user-uploaded data URI, not an optimizable asset
          <img src={photo} alt="Portrait of Omar Khalil" className="absolute inset-0 h-full w-full object-cover object-[50%_20%]" />
        ) : (
          <svg
            viewBox="0 0 300 400"
            preserveAspectRatio="xMidYMid slice"
            aria-hidden="true"
            className="absolute inset-0 h-full w-full object-cover object-[50%_20%]"
          >
            <defs>
              <linearGradient id="phg" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0" stopColor="#15414A" />
                <stop offset="1" stopColor="#0A2329" />
              </linearGradient>
            </defs>
            <rect width="300" height="400" fill="url(#phg)" />
            <g fill="none" stroke="#1D4A52" strokeWidth={1}>
              <circle cx={150} cy={150} r={76} />
              <circle cx={150} cy={150} r={104} />
              <circle cx={150} cy={150} r={134} />
              <circle cx={150} cy={150} r={166} />
            </g>
            <circle cx={150} cy={146} r={50} fill="#2A6069" />
            <path d="M46 400C46 306 96 250 150 250s104 56 104 150z" fill="#2A6069" />
          </svg>
        )}

        <div className="bg-portrait-light pointer-events-none absolute inset-0" />

        <div
          aria-hidden="true"
          className={cx(
            'pointer-events-none absolute z-[1] h-[84px] w-[84px] -translate-x-1/2 -translate-y-1/2 transition-all duration-300',
            isOver ? 'scale-100 opacity-100' : 'scale-150 opacity-0'
          )}
          style={{ left: 'var(--lx, 50%)', top: 'var(--ly, 38%)' }}
        >
          <i className="absolute left-0 top-0 h-[18px] w-[18px] border-2 border-r-0 border-b-0 border-accent" />
          <i className="absolute right-0 top-0 h-[18px] w-[18px] border-2 border-l-0 border-b-0 border-accent" />
          <i className="absolute bottom-0 left-0 h-[18px] w-[18px] border-2 border-r-0 border-t-0 border-accent" />
          <i className="absolute bottom-0 right-0 h-[18px] w-[18px] border-2 border-l-0 border-t-0 border-accent" />
        </div>

        <label
          className={cx(
            'absolute bottom-[18px] left-1/2 z-[2] inline-flex h-10 -translate-x-1/2 cursor-pointer items-center whitespace-nowrap rounded-full border border-line bg-bg/80 px-[18px] text-sm font-medium backdrop-blur-sm transition-opacity',
            photo ? 'opacity-0 group-hover:opacity-100 group-focus-within:opacity-100' : 'opacity-100'
          )}
        >
          <input
            type="file"
            accept="image/*"
            aria-label="Upload your portrait photo"
            onChange={(e) => fromFile(e.target.files?.[0])}
            className="absolute inset-0 h-full w-full cursor-pointer opacity-0"
          />
          <span>{photo ? 'Change photo' : 'Add your photo'}</span>
        </label>
      </div>
    </div>
  );
}
