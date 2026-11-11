"use client";
import { useEffect, useState } from "react";
import { usePathname } from "next/navigation";
import { useLenis } from "@/components/SmoothScroll";

const SHOW_AFTER = 0.8; // fraction of the viewport height scrolled before it appears

export default function BackToHome() {
  const lenisRef = useLenis();
  const pathname = usePathname();
  const onHome = pathname === "/";
  const [show, setShow] = useState(false);

  useEffect(() => {
    if (!onHome) return; // the button only exists on the home page
    let raf = 0;
    const update = () => {
      raf = 0;
      setShow(window.scrollY > window.innerHeight * SHOW_AFTER);
    };
    const onScroll = () => {
      if (!raf) raf = requestAnimationFrame(update);
    };
    update();
    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", onScroll);
    return () => {
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", onScroll);
      if (raf) cancelAnimationFrame(raf);
    };
  }, [pathname, onHome]);

  const goHome = () => {
    const lenis = lenisRef.current;
    if (lenis) lenis.scrollTo(0, { duration: 1.6 });
    else window.scrollTo({ top: 0, behavior: "smooth" });
  };

  if (!onHome) return null;

  return (
    <button
      type="button"
      onClick={goHome}
      tabIndex={show ? 0 : -1}
      aria-hidden={!show}
      aria-label="Back to home"
      className={`group fixed bottom-[max(1rem,env(safe-area-inset-bottom))] right-4 z-[90] grid h-12 w-12 place-items-center rounded-full border border-white/15 bg-black/50 text-white shadow-[0_8px_30px_rgba(0,0,0,0.35)] backdrop-blur-xl backdrop-saturate-150 transition-[opacity,transform,background-color,border-color,box-shadow] duration-700 ease-out hover:border-white/35 hover:bg-white/[0.08] hover:shadow-[0_8px_30px_rgba(0,0,0,0.35),0_0_18px_rgba(255,255,255,0.08)] focus-visible:outline focus-visible:outline-1 focus-visible:outline-offset-4 focus-visible:outline-white sm:bottom-5 sm:right-5 sm:h-12 sm:w-12 lg:bottom-6 lg:right-6 lg:h-[52px] lg:w-[52px] ${
        show
          ? "translate-y-0 opacity-100"
          : "pointer-events-none translate-y-3 opacity-0"
      }`}
    >
      <svg
        viewBox="0 0 24 24"
        className="h-5 w-5 lg:h-[22px] lg:w-[22px]"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
        aria-hidden="true"
      >
        <path d="M12 19V5" />
        <path d="m5.5 11.5 6.5-6.5 6.5 6.5" />
      </svg>
    </button>
  );
}
