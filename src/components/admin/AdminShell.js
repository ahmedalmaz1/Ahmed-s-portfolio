"use client";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useEffect, useState, useSyncExternalStore } from "react";
import { getToken, logout, endSession, sessionTimeLeft } from "@/lib/admin/api";
import { DirtyContext, UNSAVED_MESSAGE, createDirtyStore } from "./dirty";
import { Spinner } from "./ui";

const NAV = [
  { href: "/admin/profile", label: "Profile" },
  { href: "/admin/projects", label: "Projects" },
  { href: "/admin/social", label: "Social links" },
];

const subscribe = () => () => {};
// true on the client when a valid token exists; false during SSR / hydration
const useHasSession = () => useSyncExternalStore(subscribe, () => getToken() !== null, () => null);

export default function AdminShell({ children }) {
  const hasSession = useHasSession();
  const pathname = usePathname();
  const router = useRouter();
  const [dirty] = useState(createDirtyStore);
  const [menu, setMenu] = useState(false);

  // Guard: no token -> login. Also log out automatically when the token expires.
  useEffect(() => {
    if (hasSession === false) return endSession("login");
    if (hasSession) {
      const timer = setTimeout(() => endSession("expired"), Math.min(sessionTimeLeft(), 2 ** 31 - 1));
      return () => clearTimeout(timer);
    }
  }, [hasSession]);

  if (!hasSession) {
    return (
      <div className="grid min-h-svh place-items-center text-mute">
        <Spinner />
      </div>
    );
  }

  const go = (e, href) => {
    e.preventDefault();
    if (dirty.get() && !window.confirm(UNSAVED_MESSAGE)) return;
    dirty.set(false);
    setMenu(false);
    router.push(href);
  };

  const links = NAV.map((item) => {
    const active = pathname.startsWith(item.href);
    return (
      <Link
        key={item.href}
        href={item.href}
        onClick={(e) => go(e, item.href)}
        aria-current={active ? "page" : undefined}
        className={`rounded-lg px-3 py-2.5 text-sm transition ${active ? "bg-panel2 text-ink" : "text-mute hover:bg-panel hover:text-ink"}`}
      >
        {item.label}
      </Link>
    );
  });

  return (
    <DirtyContext.Provider value={dirty}>
      <div className="min-h-svh md:grid md:grid-cols-[220px_1fr]">
        {/* mobile top bar */}
        <header className="sticky top-0 z-30 flex items-center justify-between border-b border-line bg-bg/95 px-4 py-3 backdrop-blur md:hidden">
          <span className="font-semibold">Admin</span>
          <button
            type="button"
            onClick={() => setMenu((v) => !v)}
            aria-expanded={menu}
            className="rounded-lg border border-line px-3 py-1.5 text-sm"
          >
            {menu ? "Close" : "Menu"}
          </button>
        </header>

        <aside
          className={`${menu ? "flex" : "hidden"} flex-col gap-1 border-b border-line bg-bg p-3 md:sticky md:top-0 md:flex md:h-svh md:border-b-0 md:border-r md:p-4`}
        >
          <p className="mb-3 hidden px-3 pt-2 font-semibold md:block">Admin</p>
          <nav className="flex flex-col gap-1">{links}</nav>
          <div className="mt-2 flex flex-col gap-1 border-t border-line pt-3 md:mt-auto">
            <a href="/" target="_blank" rel="noreferrer" className="rounded-lg px-3 py-2.5 text-sm text-mute hover:text-ink">
              View site ↗
            </a>
            <button
              type="button"
              onClick={() => {
                if (dirty.get() && !window.confirm(UNSAVED_MESSAGE)) return;
                logout();
              }}
              className="rounded-lg px-3 py-2.5 text-left text-sm text-mute hover:text-ink"
            >
              Log out
            </button>
          </div>
        </aside>

        <main className="mx-auto w-full max-w-3xl px-4 py-6 sm:px-6 md:py-10">{children}</main>
      </div>
    </DirtyContext.Provider>
  );
}
