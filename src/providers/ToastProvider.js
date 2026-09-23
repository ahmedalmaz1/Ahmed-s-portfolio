'use client';

import { createContext, useCallback, useContext, useRef, useState } from 'react';
import { cx } from '@/lib/cx';

const ToastContext = createContext(null);

export function useToast() {
  const ctx = useContext(ToastContext);
  if (!ctx) throw new Error('useToast must be used within <ToastProvider>');
  return ctx;
}

export default function ToastProvider({ children }) {
  const [message, setMessage] = useState(null);
  const [visible, setVisible] = useState(false);
  const timer = useRef();

  const show = useCallback((msg) => {
    setMessage(msg);
    setVisible(true);
    clearTimeout(timer.current);
    timer.current = setTimeout(() => setVisible(false), 2200);
  }, []);

  return (
    <ToastContext.Provider value={{ show }}>
      {children}
      <div
        role="status"
        aria-live="polite"
        className={cx(
          'fixed bottom-6 left-1/2 z-40 -translate-x-1/2 rounded-full border border-line bg-surface px-5 py-3 text-sm text-ink',
          'transition-all duration-200',
          visible ? 'translate-y-0 opacity-100' : 'pointer-events-none translate-y-4 opacity-0'
        )}
      >
        {message}
      </div>
    </ToastContext.Provider>
  );
}
