"use client";
import { useCallback, useEffect, useRef, useState } from "react";
import { usePathname, useRouter } from "next/navigation";
import { gsap } from "@/lib/gsap";
import { usePageTransition } from "@/components/PageTransition";
import { useLenis } from "@/components/SmoothScroll";
import RollText from "@/lib/rollText";

const LINKS = [
  { label: "Home", href: "#top" },
  { label: "About", href: "#about" },
  { label: "Projects", href: "#projects" },
  { label: "Contact", href: "#contact" },
];

const EASE = "ease-[cubic-bezier(0.76,0,0.24,1)]";

export default function Navbar({ visible }) {
  const [open, setOpen] = useState(false);
  const lenisRef = useLenis();
  const bar = useRef(null);
  const router = useRouter();
  const pathname = usePathname();
  const transition = usePageTransition();
  const onHome = pathname === "/";

  // on other pages the section links point back to the home page
  const hrefOf = (href) => (onHome ? href : href === "#top" ? "/" : `/${href}`);

  useEffect(() => {
    if (!visible) return;
    gsap.fromTo(
      bar.current,
      { y: -24, opacity: 0 },
      { y: 0, opacity: 1, duration: 1, ease: "power3.out", delay: 0.4 },
    );
  }, [visible]);

  const toggle = useCallback(
    (next) => {
      setOpen(next);
      if (next) lenisRef.current?.stop();
      else lenisRef.current?.start();
    },
    [lenisRef],
  );

  useEffect(() => {
    if (!open) return;
    const onKey = (e) => e.key === "Escape" && toggle(false);
    const mq = matchMedia("(min-width: 768px)");
    const onMq = () => mq.matches && toggle(false);
    window.addEventListener("keydown", onKey);
    mq.addEventListener("change", onMq);
    return () => {
      window.removeEventListener("keydown", onKey);
      mq.removeEventListener("change", onMq);
    };
  }, [open, toggle]);

  const go = (e, href) => {
    e.preventDefault();
    toggle(false);

    if (!onHome) {
      const to = hrefOf(href);
      transition ? transition.navigate(to) : router.push(to);
      return;
    }

    const lenis = lenisRef.current;
    if (!lenis) return;

    if (href === "#top") {
      lenis.scrollTo(0, { duration: 1.4 });
      return;
    }

    const el = document.querySelector(href);
    if (!el) return;

    const target = () => el.getBoundingClientRect().top + lenis.scroll;

    lenis.scrollTo(target(), {
      duration: 1.4,
      onComplete: () => {
        if (Math.abs(target() - lenis.scroll) > 2) {
          lenis.scrollTo(target(), { duration: 0.6 });
        }
      },
    });
  };

  return (
    <>
      <header
        ref={bar}
        style={{ opacity: 0 }}
        className="fixed inset-x-0 top-0 z-50 bg-gradient-to-b from-black/20 to-transparent text-white"
      >
        <nav
          aria-label="Main"
          className="flex h-16 items-center justify-between px-(--gutter) pt-3 sm:h-20 sm:pt-0"
        >
          <a
            href={hrefOf("#top")}
            onClick={(e) => go(e, "#top")}
            className="flex items-center gap-3"
            aria-label="Ahmed Almaz, back to top"
          >
            <span className="text-xs font-light uppercase tracking-[0.35em]">
              Ahmed Almaz
            </span>
          </a>

          <ul className="hidden items-center gap-1 rounded-full border border-white/10 bg-black/50 p-1.5 shadow-[0_8px_30px_rgba(0,0,0,0.35)] backdrop-blur-xl backdrop-saturate-150 md:flex">
            {LINKS.map((l) => (
              <li key={l.href}>
                <a
                  href={hrefOf(l.href)}
                  onClick={(e) => go(e, l.href)}
                  aria-label={l.label}
                  className="group block rounded-full px-5 py-2 text-xs font-bold uppercase tracking-[0.3em] transition-colors duration-300 hover:bg-white/10"
                >
                  <RollText text={l.label} />
                </a>
              </li>
            ))}
          </ul>

          <button
            type="button"
            onClick={() => toggle(!open)}
            aria-expanded={open}
            aria-controls="mobile-menu"
            aria-label={open ? "Close menu" : "Open menu"}
            className="relative z-50 flex h-10 w-10 items-center justify-center md:hidden"
          >
            <span
              className={`absolute h-px w-6 bg-current transition-transform duration-500 ${EASE} ${open ? "rotate-45" : "-translate-y-1.5"}`}
            />
            <span
              className={`absolute h-px w-6 bg-current transition-transform duration-500 ${EASE} ${open ? "-rotate-45" : "translate-y-1.5"}`}
            />
          </button>
        </nav>
      </header>

      <div
        id="mobile-menu"
        className={`grain fixed inset-0 z-40 flex flex-col items-center justify-center gap-8 bg-black/75 backdrop-blur-md transition-opacity duration-500 ease-out md:hidden ${
          open ? "opacity-100" : "pointer-events-none opacity-0"
        }`}
        aria-hidden={!open}
      >
        {LINKS.map((l, i) => (
          <a
            key={l.href}
            href={hrefOf(l.href)}
            tabIndex={open ? 0 : -1}
            onClick={(e) => go(e, l.href)}
            style={{ transitionDelay: open ? `${150 + i * 70}ms` : "0ms" }}
            className={`font-display text-3xl font-light uppercase tracking-[0.25em] text-white transition-[opacity,transform,color] duration-500 ease-out hover:text-accent ${
              open ? "translate-y-0 opacity-100" : "translate-y-4 opacity-0"
            }`}
          >
            {l.label}
          </a>
        ))}
      </div>
    </>
  );
}
