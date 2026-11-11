import Link from "next/link";

export const metadata = {
  title: "Page not found | Ahmed Almaz",
  robots: { index: false },
};

export default function NotFound() {
  return (
    <main className="flex min-h-svh flex-col items-center justify-center px-(--gutter) text-center">
      <p className="text-xs tracking-[0.3em] text-white/50 uppercase">
        Error 404
      </p>
      <h1 className="mt-5 text-5xl font-bold tracking-tight uppercase sm:text-7xl">
        Lost in space
      </h1>
      <p className="mt-5 max-w-md text-white/60">
        The page you are looking for does not exist or has been moved.
      </p>
      <Link
        href="/"
        className="mt-9 inline-flex items-center rounded-full bg-accent px-6 py-2.5 text-sm font-medium text-[#050a0f] transition-colors duration-300 hover:bg-accent/85"
      >
        Back to home
      </Link>
    </main>
  );
}
