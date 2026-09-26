"use client";
import { useEffect, useState } from "react";

const SECTIONS = ["about", "projects", "contact"];

function label(id) {
  return id.charAt(0).toUpperCase() + id.slice(1);
}

function NavLink({ id, className, onClick }) {
  return (
    <a href={`#${id}`} onClick={onClick} className={className}>
      {label(id)}
    </a>
  );
}

export default function Nav() {
  const [isOpen, setIsOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  // glass background appears after a little scrolling
  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 24);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  // while the menu is open: lock scroll, close on Escape, close if screen grows
  useEffect(() => {
    if (!isOpen) return;
    const onKey = (e) => e.key === "Escape" && setIsOpen(false);
    const mq = window.matchMedia("(min-width: 640px)");
    const onChange = (e) => e.matches && setIsOpen(false);

    document.body.style.overflow = "hidden";
    window.addEventListener("keydown", onKey);
    mq.addEventListener("change", onChange);
    return () => {
      document.body.style.overflow = "";
      window.removeEventListener("keydown", onKey);
      mq.removeEventListener("change", onChange);
    };
  }, [isOpen]);

  return (
    <>
      <header className="pointer-events-none fixed inset-x-0 top-0 z-50">
        <div
          aria-hidden="true"
          className={`absolute inset-0 -z-10 border-b border-line/60 bg-bg/70 backdrop-blur-md transition-opacity duration-300 ${
            scrolled && !isOpen ? "opacity-100" : "opacity-0"
          }`}
        />

        <div className="flex h-16 items-center justify-between px-4 sm:px-8 md:px-12">
          <a
            href="#top"
            aria-label="Ahmed Almaz, back to top"
            onClick={() => setIsOpen(false)}
            className="pointer-events-auto flex h-11 items-center text-ink2 font-display font-bold"
          >
            <span className="text-[8px] font-thin">Ahmed </span>
            <span className="text-md font-bold md:text-lg">Almaz</span>
          </a>

          {/* desktop nav (unchanged) */}
          <nav
            aria-label="Main"
            className="pointer-events-auto relative hidden gap-0.5 p-[5px] sm:flex"
          >
            {SECTIONS.map((id) => (
              <NavLink
                key={id}
                id={id}
                className="relative z-10 rounded-full px-4 py-2.5 text-md font-medium text-ink2 transition-colors duration-300 hover:text-muted"
              />
            ))}
          </nav>

          {/* mobile button: two lines that morph into an X */}
          <button
            type="button"
            onClick={() => setIsOpen((prev) => !prev)}
            aria-label={
              isOpen ? "Close navigation menu" : "Open navigation menu"
            }
            aria-expanded={isOpen}
            aria-controls="mobile-menu"
            className="pointer-events-auto relative flex h-11 w-11 items-center justify-center rounded-full border border-line bg-bg/40 backdrop-blur-sm transition-colors duration-300 hover:border-accent sm:hidden"
          >
            <span
              aria-hidden="true"
              className={`absolute h-[1.5px] w-5 rounded bg-ink transition-transform duration-300 ${
                isOpen ? "rotate-45" : "-translate-y-[4px]"
              }`}
            />
            <span
              aria-hidden="true"
              className={`absolute h-[1.5px] w-5 rounded bg-ink transition-transform duration-300 ${
                isOpen ? "-rotate-45" : "translate-y-[4px]"
              }`}
            />
          </button>
        </div>
      </header>

      <div
        id="mobile-menu"
        aria-hidden={!isOpen}
        className={`fixed inset-0 z-40 transition-[opacity,visibility] duration-300 sm:hidden ${
          isOpen ? "visible opacity-100" : "invisible opacity-0"
        }`}
      >
        <div className="absolute inset-0 bg-bg/95 backdrop-blur-xl" />
        <div
          aria-hidden="true"
          className="pointer-events-none absolute inset-0 opacity-10 mix-blend-overlay"
          style={{ backgroundImage: "var(--grain)" }}
        />

        <div
          aria-hidden="true"
          className="pointer-events-none absolute inset-x-4 bottom-4 top-20"
        >
          <i className="absolute left-0 top-0 h-4 w-4 border-l-2 border-t-2 border-accent/70" />
          <i className="absolute right-0 top-0 h-4 w-4 border-r-2 border-t-2 border-accent/70" />
          <i className="absolute bottom-0 left-0 h-4 w-4 border-b-2 border-l-2 border-accent/70" />
          <i className="absolute bottom-0 right-0 h-4 w-4 border-b-2 border-r-2 border-accent/70" />
        </div>

        <nav
          aria-label="Mobile"
          className="relative flex h-full flex-col justify-center px-8 pb-10 pt-20"
        >
          <ul>
            {SECTIONS.map((id, i) => (
              <li
                key={id}
                className={`border-b border-line/60 transition-all duration-500 ease-out first:border-t ${
                  isOpen
                    ? "translate-y-0 opacity-100"
                    : "translate-y-4 opacity-0"
                }`}
                style={{
                  transitionDelay: isOpen ? `${120 + i * 70}ms` : "0ms",
                }}
              >
                <a
                  href={`#${id}`}
                  onClick={() => setIsOpen(false)}
                  className="group flex items-baseline gap-5 py-5 text-ink transition-colors duration-300 active:text-accent"
                >
                  <span className="font-mono text-xs text-accent">
                    {String(i + 1).padStart(2, "0")}
                  </span>
                  <span className="font-display text-[clamp(2rem,10vw,2.75rem)] font-bold leading-none tracking-[-0.02em]">
                    {label(id)}
                  </span>
                </a>
              </li>
            ))}
          </ul>

          <p
            className={`mt-8 text-sm text-muted transition-all duration-500 ${
              isOpen ? "opacity-100" : "opacity-0"
            }`}
            style={{ transitionDelay: isOpen ? "400ms" : "0ms" }}
          >
            Environment and cinematic artist
          </p>
        </nav>
      </div>
    </>
  );
}
