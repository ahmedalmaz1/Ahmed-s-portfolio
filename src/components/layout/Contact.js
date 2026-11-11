"use client";
import { useEffect, useRef, useState } from "react";
import { gsap, ScrollTrigger, useGSAP } from "@/lib/gsap";

const EMAIL = "hello@ahmedalmaz.com";
const TITLE = "Let's build your next world together.";

// Replace the placeholder links with the real profile URLs.
const GMAIL = `https://mail.google.com/mail/?view=cm&fs=1&to=${encodeURIComponent(EMAIL)}`;
const CHANNELS = [
  { label: "Gmail", href: `mailto:${EMAIL}`, icon: "gmail" },
  {
    label: "ArtStation",
    href: "https://www.artstation.com/ahmedalmaz",
    icon: "artstation",
  },
  { label: "LinkedIn", href: "https://www.linkedin.com/", icon: "linkedin" },
  { label: "Instagram", href: "https://www.instagram.com/", icon: "instagram" },
  { label: "Facebook", href: "https://www.facebook.com/", icon: "facebook" },
];

/* ---------- official brand glyphs (filled, 24x24, from Simple Icons, CC0) ---------- */
const PATHS = {
  gmail:
    "M24 5.457v13.909c0 .904-.732 1.636-1.636 1.636h-3.819V11.73L12 16.64l-6.545-4.91v9.273H1.636A1.636 1.636 0 0 1 0 19.366V5.457c0-2.023 2.309-3.178 3.927-1.964L5.455 4.64 12 9.548l6.545-4.91 1.528-1.145C21.69 2.28 24 3.434 24 5.457z",
  artstation:
    "M0 17.723l2.027 3.505h.001a2.424 2.424 0 0 0 2.164 1.333h13.457l-2.792-4.838H0zm24 .025c0-.484-.143-.935-.388-1.314L15.728 2.728a2.424 2.424 0 0 0-2.142-1.289H9.419L21.598 22.54l1.92-3.325c.378-.637.482-.919.482-1.467zm-11.129-3.462L7.428 4.858l-5.444 9.428h10.887z",
  linkedin:
    "M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z",
  instagram:
    "M7.0301.084c-1.2768.0602-2.1487.264-2.911.5634-.7888.3075-1.4575.72-2.1228 1.3877-.6652.6677-1.075 1.3368-1.3802 2.127-.2954.7638-.4956 1.6365-.552 2.914-.0564 1.2775-.0689 1.6882-.0626 4.947.0062 3.2586.0206 3.6671.0825 4.9473.061 1.2765.264 2.1482.5635 2.9107.308.7889.72 1.4573 1.388 2.1228.6679.6655 1.3365 1.0743 2.1285 1.38.7632.295 1.6361.4961 2.9134.552 1.2773.056 1.6884.069 4.9462.0627 3.2578-.0062 3.668-.0207 4.9478-.0814 1.28-.0607 2.147-.2652 2.9098-.5633.7889-.3086 1.4578-.72 2.1228-1.3881.665-.6682 1.0745-1.3378 1.3795-2.1284.2957-.7632.4966-1.636.552-2.9124.056-1.2809.0692-1.6898.063-4.948-.0063-3.2583-.021-3.6668-.0817-4.9465-.0607-1.2797-.264-2.1487-.5633-2.9117-.3084-.7889-.72-1.4568-1.3876-2.1228C21.2982 1.33 20.628.9208 19.8378.6165 19.074.321 18.2017.1197 16.9244.0645 15.6471.0093 15.236-.005 11.977.0014 8.718.0076 8.31.0215 7.0301.0839m.1402 21.6932c-1.17-.0509-1.8053-.2453-2.2287-.408-.5606-.216-.96-.4771-1.3819-.895-.422-.4178-.6811-.8186-.9-1.378-.1644-.4234-.3624-1.058-.4171-2.228-.0595-1.2645-.072-1.6442-.079-4.848-.007-3.2037.0053-3.583.0607-4.848.05-1.169.2456-1.805.408-2.2282.216-.5613.4762-.96.895-1.3816.4188-.4217.8184-.6814 1.3783-.9003.423-.1651 1.0575-.3614 2.227-.4171 1.2655-.06 1.6447-.072 4.848-.079 3.2033-.007 3.5835.005 4.8495.0608 1.169.0508 1.8053.2445 2.228.408.5608.216.96.4754 1.3816.895.4217.4194.6816.8176.9005 1.3787.1653.4217.3617 1.056.4169 2.2263.0602 1.2655.0739 1.645.0796 4.848.0058 3.203-.0055 3.5834-.061 4.848-.051 1.17-.245 1.8055-.408 2.2294-.216.5604-.4763.96-.8954 1.3814-.419.4215-.8181.6811-1.3783.9-.4224.1649-1.0577.3617-2.2262.4174-1.2656.0595-1.6448.072-4.8493.079-3.2045.007-3.5825-.006-4.848-.0608M16.953 5.5864A1.44 1.44 0 1 0 18.39 4.144a1.44 1.44 0 0 0-1.437 1.4424M5.8385 12.012c.0067 3.4032 2.7706 6.1557 6.173 6.1493 3.4026-.0065 6.157-2.7701 6.1506-6.1733-.0065-3.4032-2.771-6.1565-6.174-6.1498-3.403.0067-6.156 2.771-6.1496 6.1738M8 12.0077a4 4 0 1 1 4.008 3.9921A3.9996 3.9996 0 0 1 8 12.0077",
  facebook:
    "M9.101 23.691v-7.98H6.627v-3.667h2.474v-1.58c0-4.085 1.848-5.978 5.858-5.978.401 0 .955.042 1.468.103a8.68 8.68 0 0 1 1.141.195v3.325a8.623 8.623 0 0 0-.653-.036 26.805 26.805 0 0 0-.733-.009c-.707 0-1.259.096-1.675.309a1.686 1.686 0 0 0-.679.622c-.258.42-.374.995-.374 1.752v1.297h3.919l-.386 2.103-.287 1.564h-3.246v8.245C19.396 23.238 24 18.179 24 12.044c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.628 3.874 10.35 9.101 11.647Z",
};

// Original brand colours, shown on hover.
const BRAND = {
  gmail: "#EA4335",
  artstation: "#13AFF0",
  linkedin: "#0A66C2",
  instagram: "url(#ig-grad)", // Instagram gradient (defined inside the icon)
  facebook: "#1877F2",
};

function Icon({ name, brand = false }) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill={brand ? BRAND[name] : "currentColor"}
      aria-hidden="true"
      className="h-[42%] w-[42%]"
    >
      {brand && name === "instagram" && (
        <defs>
          <linearGradient id="ig-grad" x1="0" y1="1" x2="1" y2="0">
            <stop offset="0%" stopColor="#FEDA75" />
            <stop offset="25%" stopColor="#FA7E1E" />
            <stop offset="50%" stopColor="#D62976" />
            <stop offset="75%" stopColor="#962FBF" />
            <stop offset="100%" stopColor="#4F5BD5" />
          </linearGradient>
        </defs>
      )}
      <path d={PATHS[name]} />
    </svg>
  );
}

/* ---------- one social button ---------- */
// Hover = soft magnetic pull + the circle fills with white like water rising
// from the bottom (with a gently moving wave on the surface). As the water
// passes, the icon takes its original brand colour, finishing at the top.
// Colour glow: once the circle is full, a soft bloom of the icon's own colour
// opens behind it, then fades out slowly.
const GLOW_COLOR = {
  gmail: "#EA4335",
  artstation: "#13AFF0",
  linkedin: "#0A66C2",
  facebook: "#1877F2",
};
const GLOW_BG = {
  instagram: "linear-gradient(45deg,#FEDA75,#FA7E1E,#D62976,#962FBF,#4F5BD5)",
};

const WAVE =
  "M0 5 Q12.5 0 25 5 T50 5 T75 5 T100 5 T125 5 T150 5 T175 5 T200 5 V10 H0 Z";
const EASE_WATER = "ease-[cubic-bezier(0.45,0,0.15,1)]";

function Social({ href, icon, label }) {
  const el = useRef(null);
  const spill = useRef(null);
  const tl = useRef(null);

  useEffect(() => () => tl.current?.kill(), []);

  const play = () => {
    if (!matchMedia("(hover: hover)").matches) return;
    if (matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    const glow = spill.current?.querySelector("[data-glow]");
    if (!glow) return;

    tl.current?.kill();
    // starts when the water is almost at the top (water = 1s)
    tl.current = gsap
      .timeline({ delay: 0.8 })
      .fromTo(
        glow,
        { opacity: 0, scale: 0.95 },
        { opacity: 0.5, scale: 1.5, duration: 0.55, ease: "power2.out" },
        0,
      )
      .to(
        glow,
        { opacity: 0, scale: 1.95, duration: 1.1, ease: "power2.out" },
        0.55,
      );
  };

  const stop = () => {
    tl.current?.kill();
    const root = spill.current;
    if (!root) return;
    gsap.to(root.querySelectorAll("[data-glow]"), {
      opacity: 0,
      duration: 0.25,
      overwrite: true,
    });
  };

  const move = (e) => {
    if (e.pointerType !== "mouse") return;
    if (matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    const r = el.current.getBoundingClientRect();
    const dx = e.clientX - (r.left + r.width / 2);
    const dy = e.clientY - (r.top + r.height / 2);
    gsap.to(el.current, {
      x: dx * 0.3,
      y: dy * 0.3,
      duration: 0.4,
      ease: "power3.out",
      overwrite: "auto",
    });
  };

  const leave = () => {
    stop();
    gsap.to(el.current, {
      x: 0,
      y: 0,
      duration: 1,
      ease: "elastic.out(1, 0.4)",
      overwrite: "auto",
    });
  };

  const external = !href.startsWith("mailto:");

  // On desktop open Gmail's compose window addressed to the same email.
  // On phones / tablets keep the normal mailto: so the user's mail app opens.
  const onClick = (e) => {
    if (icon !== "gmail") return;
    if (matchMedia("(pointer: coarse)").matches) return;
    e.preventDefault();
    window.open(GMAIL, "_blank", "noopener,noreferrer");
  };

  return (
    <a
      ref={el}
      href={href}
      target={external ? "_blank" : undefined}
      rel="noreferrer"
      aria-label={icon === "gmail" ? `Email me on Gmail (${EMAIL})` : label}
      onClick={onClick}
      onPointerEnter={play}
      onPointerMove={move}
      onPointerLeave={leave}
      className="group/s relative grid h-11 w-11 place-items-center rounded-full text-white focus-visible:outline focus-visible:outline-1 focus-visible:outline-offset-4 focus-visible:outline-white sm:h-12 sm:w-12 lg:h-14 lg:w-14"
    >
      {/* colour glow: soft bloom behind the circle */}
      <span
        ref={spill}
        aria-hidden="true"
        className="pointer-events-none absolute inset-0"
      >
        <span
          data-glow
          className="absolute inset-0 -z-10 rounded-full opacity-0 blur-[12px]"
          style={
            GLOW_BG[icon]
              ? { backgroundImage: GLOW_BG[icon] }
              : { backgroundColor: GLOW_COLOR[icon] }
          }
        />
      </span>

      {/* ring */}
      <span
        aria-hidden="true"
        className="absolute inset-0 rounded-full border border-white/25 transition-colors duration-700 group-hover/s:border-white"
      />

      {/* water */}
      <span
        aria-hidden="true"
        className="absolute inset-0 overflow-hidden rounded-full"
      >
        <span
          className={`absolute inset-0 translate-y-full transition-transform duration-1000 ${EASE_WATER} group-hover/s:translate-y-0 group-focus-visible/s:translate-y-0`}
        >
          <svg
            viewBox="0 0 100 10"
            preserveAspectRatio="none"
            className="absolute bottom-[calc(100%-1px)] left-0 h-[7px] w-full"
          >
            <path d={WAVE} fill="#fff">
              <animateTransform
                attributeName="transform"
                type="translate"
                from="0 0"
                to="-50 0"
                dur="1.6s"
                repeatCount="indefinite"
              />
            </path>
          </svg>
          <span className="block h-full w-full bg-white" />
        </span>
      </span>

      {/* base icon (white) */}
      <span className="relative grid h-full w-full place-items-center">
        <Icon name={icon} />
      </span>

      {/* brand-coloured icon, revealed bottom-up right behind the water */}
      <span
        aria-hidden="true"
        className={`absolute inset-0 grid place-items-center [clip-path:inset(100%_0_0_0)] transition-[clip-path] duration-700 ${EASE_WATER} group-hover/s:delay-300 group-hover/s:[clip-path:inset(0_0_0_0)] group-focus-visible/s:[clip-path:inset(0_0_0_0)]`}
      >
        <Icon name={icon} brand />
      </span>
    </a>
  );
}

export default function Contact() {
  const root = useRef(null);
  const [copied, setCopied] = useState(false);

  useGSAP(
    () => {
      const reduce = window.matchMedia(
        "(prefers-reduced-motion: reduce)",
      ).matches;
      const sec = root.current;
      const inner = sec.querySelector("[data-inner]");
      const lines = sec.querySelectorAll("[data-line]");
      const fades = sec.querySelectorAll("[data-fade]");
      const isMobile = () => window.innerWidth < 1024;

      if (reduce) {
        gsap.set(lines, { yPercent: 0 });
        gsap.set(fades, { opacity: 1, y: 0 });
        return;
      }

      // Scroll-scrubbed slide-up applied to the content, so the section
      // glides up while the showreel video dims into your texture.
      gsap.fromTo(
        inner,
        { y: () => (isMobile() ? 70 : 160) },
        {
          y: 0,
          ease: "none",
          force3D: true,
          scrollTrigger: {
            trigger: sec,
            start: "top 100%",
            end: "top 20%",
            scrub: 1,
            invalidateOnRefresh: true,
          },
        },
      );

      gsap.set(lines, { yPercent: 115 });
      gsap.set(fades, { opacity: 0, y: 24 });

      const tl = gsap.timeline({
        paused: true,
        defaults: { ease: "power4.out", force3D: true },
      });

      tl.to(lines, { yPercent: 0, duration: 1.3, stagger: 0.08 }, 0.1).to(
        fades,
        { opacity: 1, y: 0, duration: 1.1, stagger: 0.09 },
        0.5,
      );

      ScrollTrigger.create({
        trigger: sec,
        start: () => (isMobile() ? "top 78%" : "top 62%"),
        end: () => (isMobile() ? "bottom 12%" : "bottom 20%"),
        invalidateOnRefresh: true,
        onEnter: () => tl.timeScale(1).play(),
        onEnterBack: () => tl.timeScale(1).play(),
        onLeave: () => tl.timeScale(1.8).reverse(),
        onLeaveBack: () => tl.timeScale(1.8).reverse(),
      });
    },
    { scope: root },
  );

  useEffect(() => {
    if (!copied) return;
    const t = setTimeout(() => setCopied(false), 1800);
    return () => clearTimeout(t);
  }, [copied]);

  const copy = async () => {
    try {
      await navigator.clipboard.writeText(EMAIL);
      setCopied(true);
    } catch {
      setCopied(false);
    }
  };

  return (
    // No background and no shadow: the page texture shows through.
    // The showreel video is dimmed into that texture before this content appears.
    <section
      ref={root}
      data-showreel-next
      id="contact"
      className="relative z-10 flex min-h-svh flex-col justify-center overflow-hidden text-white"
    >
      <div
        data-inner
        className="mx-auto flex w-full max-w-5xl flex-col items-center px-5 py-24 text-center sm:px-10 sm:py-28 lg:px-14"
      >
        <h2
          aria-label={TITLE}
          className="text-balance text-[clamp(2.25rem,1.2rem+4.8vw,6rem)] font-light leading-[1.08] tracking-tight"
        >
          {TITLE.split(" ").map((w, i) => (
            <span
              key={i}
              aria-hidden="true"
              className="uppercase font-display font-semibold mr-[0.25em] inline-block overflow-hidden pb-[0.12em] align-top"
            >
              <span data-line className="inline-block">
                {w}
              </span>
            </span>
          ))}
        </h2>

        <p
          data-fade
          className="mt-6 max-w-lg text-base leading-relaxed text-neutral-400 opacity-0 sm:mt-8 sm:text-lg"
        >
          Have a cinematic, a game environment or a full world in mind? Tell me
          about it and I will get back to you within 24 hours.
        </p>

        <button
          data-fade
          type="button"
          onClick={copy}
          aria-label={`Copy email address ${EMAIL}`}
          className="group/mail relative mt-8 max-w-full truncate pb-1 text-lg font-light text-white opacity-0 transition-colors duration-500 hover:text-accent sm:mt-10 sm:text-2xl"
        >
          {copied ? "Copied to clipboard" : EMAIL}
          <span
            aria-hidden="true"
            className="absolute inset-x-0 bottom-0 h-px bg-white/20"
          />
          <span
            aria-hidden="true"
            className="absolute inset-x-0 bottom-0 h-px origin-left scale-x-0 bg-white transition-transform duration-700 ease-[cubic-bezier(0.76,0,0.24,1)] group-hover/mail:scale-x-100"
          />
        </button>

        <ul className="mt-14 flex flex-wrap items-center justify-center gap-x-3 gap-y-8 min-[360px]:gap-x-5 sm:mt-16 sm:gap-x-10 lg:gap-x-14">
          {CHANNELS.map((c) => (
            <li key={c.label} data-fade className="opacity-0">
              <Social {...c} />
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}
