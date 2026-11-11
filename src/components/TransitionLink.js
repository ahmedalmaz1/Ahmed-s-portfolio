"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { usePageTransition } from "@/components/PageTransition";

export default function TransitionLink({
  href,
  direction,
  onClick,
  children,
  ...props
}) {
  const transition = usePageTransition();
  const pathname = usePathname();

  const handleClick = (e) => {
    onClick?.(e);
    if (e.defaultPrevented || !transition) return;
    if (e.button !== 0 || e.metaKey || e.ctrlKey || e.shiftKey || e.altKey)
      return;
    if (props.target && props.target !== "_self") return;

    const url = new URL(href, window.location.href);
    if (url.origin !== window.location.origin) return;
    if (url.pathname === pathname) return;

    e.preventDefault();
    transition.navigate(url.pathname + url.search + url.hash, { direction });
  };

  return (
    <Link href={href} {...props} onClick={handleClick}>
      {children}
    </Link>
  );
}
