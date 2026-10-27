"use client";
import { useEffect, useRef, useState } from "react";
import gsap from "gsap";
import { useLenis } from "../SmoothScroll";
import RollText from "../../lib/rollText";

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

  useEffect(() => {
    if (!visible) return;
    gsap.fromTo(
      bar.current,
      { y: -24, opacity: 0 },
      { y: 0, opacity: 1, duration: 1, ease: "power3.out", delay: 0.4 },
    );
  }, [visible]);

  const toggle = (next) => {
    setOpen(next);
    next ? lenisRef.current?.stop() : lenisRef.current?.start();
  };

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
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open]);

  const go = (e, href) => {
    e.preventDefault();
    toggle(false);
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
            href="#top"
            onClick={(e) => go(e, "#top")}
            className="flex items-center gap-3"
            aria-label="Ahmed Almaz, back to top"
          >
            <span className="text-xs font-light uppercase tracking-[0.35em]">
              Ahmed Almaz
            </span>
          </a>

          <ul className="hidden items-center gap-10 md:flex">
            {LINKS.map((l) => (
              <li key={l.href}>
                <a
                  href={l.href}
                  onClick={(e) => go(e, l.href)}
                  aria-label={l.label}
                  className="group block py-2 text-xs uppercase tracking-[0.3em] font-bold"
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
            href={l.href}
            tabIndex={open ? 0 : -1}
            onClick={(e) => go(e, l.href)}
            style={{ transitionDelay: open ? `${150 + i * 70}ms` : "0ms" }}
            className={`text-3xl font-light uppercase tracking-[0.25em] text-white transition-[opacity,transform,color] duration-500 ease-out hover:text-accent ${
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
