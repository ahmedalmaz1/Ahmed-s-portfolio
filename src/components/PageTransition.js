"use client";
import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
} from "react";
import { usePathname, useRouter } from "next/navigation";
import { gsap, ScrollTrigger } from "@/lib/gsap";
import { useLenis } from "@/components/SmoothScroll";

const IN = 1.3; // seconds
const OUT = 1.5;
const EASE = "power3.inOut";
const DIM = 0.55; // darkness of the old page while the panel moves
const CURVE_Y = 12; // vh, curved trailing edge of the vertical panel
const CURVE_X = 0; // vw, horizontal panel is a plain rectangle (no rounding)
const FAILSAFE = 4000; // ms, never leave the screen covered

const DIRS = {
  up: { axis: "y", sign: 1 },
  left: { axis: "x", sign: 1 },
  right: { axis: "x", sign: -1 },
};

const DETAIL = /^\/projects\/[^/]+\/?$/;

function directionFor(from, to) {
  if (DETAIL.test(to)) return "left"; // entering a project (or next project)
  if (DETAIL.test(from)) return "right"; // leaving a project
  return "up";
}

const curveOf = (axis) => (axis === "x" ? CURVE_X : CURVE_Y);
const extent = (axis) =>
  axis === "x" ? window.innerWidth : window.innerHeight;
// distance needed to hide the panel + its curved edge completely
const offscreen = (axis) => extent(axis) * (1 + curveOf(axis) / 100 + 0.01);

// flat leading edge, curved trailing edge, one element so the grain is continuous
function shapeFor(el, dir) {
  const { axis, sign } = DIRS[dir];
  const c = curveOf(axis);
  const s = el.style;
  s.top = s.right = s.bottom = s.left = s.width = s.height = "";

  if (axis === "y") {
    Object.assign(s, {
      top: "0",
      left: "0",
      right: "0",
      height: `${100 + c}vh`,
      borderRadius: `0 0 50% 50% / 0 0 ${c}vh ${c}vh`,
    });
  } else if (sign > 0) {
    Object.assign(s, {
      top: "0",
      bottom: "0",
      left: "0",
      width: `${100 + c}vw`,
      borderRadius: `0 ${c}vw ${c}vw 0 / 0 50% 50% 0`,
    });
  } else {
    Object.assign(s, {
      top: "0",
      bottom: "0",
      right: "0",
      width: `${100 + c}vw`,
      borderRadius: `${c}vw 0 0 ${c}vw / 50% 0 0 50%`,
    });
  }
}

/* ---------- scroll positions (survive client navigation and reloads) ---------- */

const POS_KEY = "scroll-positions";
let positions = null;

const loadPositions = () => {
  if (positions) return positions;
  try {
    positions = new Map(JSON.parse(sessionStorage.getItem(POS_KEY) || "[]"));
  } catch {
    positions = new Map();
  }
  return positions;
};

const savePosition = (path, lenis) => {
  const y = Math.round(lenis?.scroll ?? window.scrollY);
  const map = loadPositions();
  map.set(path, y);
  try {
    sessionStorage.setItem(POS_KEY, JSON.stringify([...map]));
  } catch {}
};

/* ---------- reveal subscription ---------- */

// module-level so any page can subscribe without prop drilling
const shared = { covered: false, listeners: new Set() };

/**
 * Run `fn` when the new page is being uncovered.
 * If no transition is running (first load, reload) it runs immediately.
 * Returns an unsubscribe function.
 */
export function onReveal(fn) {
  if (!shared.covered) {
    fn();
    return () => {};
  }
  shared.listeners.add(fn);
  return () => shared.listeners.delete(fn);
}

const Ctx = createContext(null);
export const usePageTransition = () => useContext(Ctx);

/*
  After a route change put the page where it belongs: the saved position
  (back / forward), the #hash target, or the top. Retries because the page
  may still be growing (dynamic imports, images).
*/
function settleScroll(lenis, restoreY) {
  const id = decodeURIComponent(window.location.hash.slice(1));
  let tries = 0;

  const attempt = () => {
    let y = 0;
    let found = true;

    if (restoreY != null) {
      y = restoreY;
    } else if (id) {
      const el = document.getElementById(id);
      found = !!el;
      if (el) y = Math.round(el.getBoundingClientRect().top + window.scrollY);
    }

    window.scrollTo(0, y);
    lenis?.scrollTo(y, { immediate: true, force: true });

    const done = found && Math.abs(window.scrollY - y) <= 2;
    if (!done && tries++ < 15) setTimeout(attempt, 100);
    else ScrollTrigger.refresh();
  };

  attempt();
}

export default function PageTransition({ children }) {
  const router = useRouter();
  const pathname = usePathname();
  const lenisRef = useLenis();

  const panel = useRef(null);
  const inner = useRef(null);
  const shade = useRef(null);

  const busy = useRef(false);
  const arrived = useRef(pathname); // the route currently on screen
  const trail = useRef([pathname]); // in-app history, to know if "back" is safe
  const dirRef = useRef("up");
  const restore = useRef(false); // restore the saved scroll on arrival
  const failsafe = useRef(0);

  // we own scroll restoration (the browser would fight Lenis)
  useEffect(() => {
    const mode = window.history.scrollRestoration;
    window.history.scrollRestoration = "manual";
    gsap.set(panel.current, { x: 0, y: 0, visibility: "hidden" });
    gsap.set(shade.current, { opacity: 0 });
    return () => {
      window.history.scrollRestoration = mode;
    };
  }, []);

  // put the panel in place for a direction (shape + visible), not yet moved
  const prepare = useCallback((dir) => {
    dirRef.current = dir;
    shapeFor(inner.current, dir);
    gsap.set(panel.current, { x: 0, y: 0, visibility: "visible" });
    gsap.set(shade.current, { opacity: 0, visibility: "visible" });
    return DIRS[dir];
  }, []);

  const reveal = useCallback(() => {
    if (!shared.covered) return;
    clearTimeout(failsafe.current);

    const { axis, sign } = DIRS[dirRef.current];
    const restoreY = restore.current
      ? loadPositions().get(arrived.current)
      : undefined;
    restore.current = false;

    // the panel hides everything, so it is safe to jump now
    settleScroll(lenisRef.current, restoreY);

    requestAnimationFrame(() => {
      ScrollTrigger.refresh();

      const fire = () => {
        shared.covered = false;
        const fns = [...shared.listeners];
        shared.listeners.clear();
        fns.forEach((fn) => fn());
      };

      gsap
        .timeline({
          delay: 0.1,
          onComplete: () => {
            gsap.set(panel.current, { x: 0, y: 0, visibility: "hidden" });
            gsap.set(shade.current, { opacity: 0, visibility: "hidden" });
            busy.current = false;
            lenisRef.current?.start();
          },
        })
        .to(
          panel.current,
          { [axis]: -sign * offscreen(axis), duration: OUT, ease: EASE },
          0,
        )
        .to(
          shade.current,
          { opacity: 0, duration: OUT * 0.8, ease: "power1.out" },
          0,
        )
        // content starts while the panel is still leaving
        .add(fire, OUT * 0.45);
    });
  }, [lenisRef]);

  // the new route is committed
  useEffect(() => {
    if (arrived.current === pathname) return;
    arrived.current = pathname;

    const t = trail.current;
    if (t.length > 1 && t[t.length - 2] === pathname) t.pop();
    else t.push(pathname);

    if (shared.covered) {
      reveal();
    } else if (restore.current) {
      // reduced motion: no panel, but still put the page back where it was
      settleScroll(lenisRef.current, loadPositions().get(pathname));
      restore.current = false;
    }
  }, [pathname, reveal, lenisRef]);

  /**
   * navigate(href, { direction, action, restore, to })
   *  action   custom navigation (e.g. router.back) instead of router.push(href)
   *  restore  put the target page back at its saved scroll position
   *  to       target pathname when there is no href (used with action)
   */
  const navigate = useCallback(
    (href, opts = {}) => {
      if (busy.current) return;

      const from = arrived.current;
      const to =
        opts.to ?? (href ? new URL(href, window.location.href).pathname : from);
      const dir = opts.direction ?? directionFor(from, to);
      const go = opts.action ?? (() => router.push(href));

      savePosition(from, lenisRef.current);
      restore.current = !!opts.restore;

      if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
        go();
        return;
      }

      busy.current = true;
      shared.covered = true;
      lenisRef.current?.stop();

      const { axis, sign } = prepare(dir);
      gsap.set(panel.current, { [axis]: sign * offscreen(axis) });

      gsap
        .timeline({
          onComplete: () => {
            go();
            failsafe.current = window.setTimeout(reveal, FAILSAFE);
          },
        })
        .to(panel.current, { [axis]: 0, duration: IN, ease: EASE }, 0)
        .to(
          shade.current,
          { opacity: DIM, duration: IN, ease: "power1.in" },
          0,
        );
    },
    [router, lenisRef, prepare, reveal],
  );

  const back = useCallback(() => {
    const t = trail.current;
    if (t.length > 1) {
      navigate(null, {
        to: t[t.length - 2],
        restore: true,
        action: () => router.back(),
      });
    } else {
      navigate("/#projects", { direction: "right" });
    }
  }, [navigate, router]);

  useEffect(() => {
    const onPop = () => {
      const to = window.location.pathname;
      const from = arrived.current;
      if (busy.current || to === from) return;

      savePosition(from, lenisRef.current);
      restore.current = true;

      if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

      busy.current = true;
      shared.covered = true;
      lenisRef.current?.stop();
      prepare(directionFor(from, to));
      gsap.set(shade.current, { opacity: DIM });
      failsafe.current = window.setTimeout(reveal, FAILSAFE);
    };

    window.addEventListener("popstate", onPop);
    return () => window.removeEventListener("popstate", onPop);
  }, [lenisRef, prepare, reveal]);

  useEffect(() => () => clearTimeout(failsafe.current), []);

  const value = useMemo(() => ({ navigate, back }), [navigate, back]);

  return (
    <Ctx.Provider value={value}>
      {children}

      {/* darkens the old page while the panel moves (depth) */}
      <div
        ref={shade}
        aria-hidden="true"
        className="pointer-events-none fixed inset-0 z-[79] bg-black"
        style={{ opacity: 0, visibility: "hidden" }}
      />

      {/* same surface as the site: bg colour + grain */}
      <div
        ref={panel}
        aria-hidden="true"
        className="fixed inset-0 z-[80]"
        style={{ visibility: "hidden" }}
      >
        <div ref={inner} className="grain absolute bg-bg" />
      </div>
    </Ctx.Provider>
  );
}
