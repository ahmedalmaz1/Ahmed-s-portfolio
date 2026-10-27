"use client";
import { useCallback, useEffect, useRef } from "react";
import { usePathname, useRouter } from "next/navigation";
import { ScrollTrigger } from "gsap/ScrollTrigger";

const HOME = "/";
const positions = new Map();
const state = { previous: null, pending: false, timer: 0 };

export function useGoBack() {
  const router = useRouter();

  return useCallback(() => {
    if (state.previous === HOME) {
      router.back();
      return;
    }
    if (positions.has(HOME)) {
      state.pending = true;
      router.push(HOME);
      return;
    }
    router.push(`${HOME}#projects`);
  }, [router]);
}

export default function ScrollRestoration({ lenisRef }) {
  const pathname = usePathname();
  const current = useRef(pathname);

  useEffect(() => {
    const mode = history.scrollRestoration;
    history.scrollRestoration = "manual";

    const onPop = () => {
      state.pending = true;
    };

    const onClick = (e) => {
      if (e.defaultPrevented || e.button !== 0) return;
      if (e.metaKey || e.ctrlKey || e.shiftKey || e.altKey) return;
      const link = e.target.closest?.("a[href]");
      if (!link || link.target === "_blank") return;
      if (link.origin !== location.origin) return;
      if (link.pathname === location.pathname) return;
      positions.set(location.pathname, window.scrollY);
      state.pending = false;
    };

    window.addEventListener("popstate", onPop);
    document.addEventListener("click", onClick, true);

    return () => {
      window.removeEventListener("popstate", onPop);
      document.removeEventListener("click", onClick, true);
      history.scrollRestoration = mode;
      clearTimeout(state.timer);
    };
  }, []);

  useEffect(() => {
    if (current.current === pathname) return;
    state.previous = current.current;
    current.current = pathname;
    clearTimeout(state.timer);

    if (!state.pending) return;
    state.pending = false;

    const y = positions.get(pathname) ?? 0;
    let tries = 0;

    const attempt = () => {
      const lenis = lenisRef.current;
      if (lenis) lenis.scrollTo(y, { immediate: true, force: true });
      else window.scrollTo(0, y);
      if (Math.abs(window.scrollY - y) > 2 && tries++ < 12) {
        state.timer = window.setTimeout(attempt, 100);
      }
    };

    requestAnimationFrame(() => {
      ScrollTrigger.refresh();
      attempt();
    });
  }, [pathname, lenisRef]);

  return null;
}
