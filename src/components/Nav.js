"use client";
import { TextAlignEnd, X } from "lucide-react";
import { useState } from "react";

const SECTIONS = ["about", "projects", "contact"];

function label(id) {
  return id.charAt(0).toUpperCase() + id.slice(1);
}

function NavLink({ id, className, onClick }) {
  return (
    <a key={id} href={`#${id}`} onClick={onClick} className={className}>
      {label(id)}
    </a>
  );
}

export default function Nav() {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <header className="pointer-events-none relative z-30 flex items-center justify-between px-4 pt-4 sm:px-8 md:px-12">
      <a
        href="#top"
        aria-label="Ahmed Almaz, back to top"
        className="pointer-events-auto flex h-11 items-center text-ink2 font-display font-bold"
      >
        <span className="text-[8px] font-thin">Ahmed </span>
        <span className="text-md font-bold md:text-lg">Almaz</span>
      </a>

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

      <div className="pointer-events-auto relative sm:hidden">
        <button
          type="button"
          onClick={() => setIsOpen((prev) => !prev)}
          aria-label={isOpen ? "Close navigation menu" : "Open navigation menu"}
          aria-expanded={isOpen}
          className="flex h-10 w-10 items-center justify-center rounded-full text-ink2 transition-colors duration-300 hover:text-ink"
        >
          {isOpen ? (
            <X size={25} strokeWidth={1.5} />
          ) : (
            <TextAlignEnd size={25} strokeWidth={1.5} />
          )}
        </button>

        {isOpen && (
          <nav
            aria-label="Mobile"
            className="fixed inset-x-0 top-17 border-y border-line bg-surface/95 p-2 shadow-xl backdrop-blur-md"
          >
            {SECTIONS.map((id) => (
              <NavLink
                key={id}
                id={id}
                onClick={() => setIsOpen(false)}
                className="block rounded-xl px-4 py-3 text-sm text-ink2 transition-colors duration-300 hover:bg-bg hover:text-ink"
              />
            ))}
          </nav>
        )}
      </div>
    </header>
  );
}
