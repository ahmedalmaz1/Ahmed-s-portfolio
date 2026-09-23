'use client';

import { useToast } from '@/providers/ToastProvider';

const EMAIL = 'hello@example.com';
const LINKS = ['ArtStation', 'Vimeo', 'LinkedIn', 'Download CV'];

export default function Contact() {
  const { show } = useToast();

  const copyEmail = async () => {
    try {
      await navigator.clipboard.writeText(EMAIL);
      show('Email copied');
    } catch {
      show('Could not copy automatically. Select and copy the email above.');
    }
  };

  return (
    <section id="contact" className="px-5 py-[clamp(88px,12vw,150px)] sm:px-8 md:px-16">
      <div className="mx-auto grid max-w-[1240px] grid-cols-1 gap-8 md:grid-cols-[5fr_7fr] md:gap-16">
        <h2 className="font-display text-[clamp(2rem,4.4vw,3.5rem)] font-bold leading-[1.05] tracking-[-0.02em]">
          Need a world built or a shot lit?
        </h2>
        <div>
          <p className="max-w-lg text-ink2">
            I&rsquo;m open to environment art and cinematic work, full-time or freelance. Email is the fastest way
            to reach me.
          </p>
          <div className="mt-7 flex flex-wrap items-center gap-4">
            <a
              href={`mailto:${EMAIL}`}
              className="bg-gradient-to-r from-accent to-accent bg-[length:0%_2px] bg-no-repeat bg-bottom font-display text-[clamp(1.3rem,3vw,2.1rem)] font-bold tracking-[-0.01em] transition-[background-size] duration-300 hover:bg-[length:100%_2px]"
            >
              {EMAIL}
            </a>
            <button
              type="button"
              onClick={copyEmail}
              className="inline-flex min-h-12 items-center justify-center rounded-full border border-line px-6 font-semibold transition-colors hover:border-muted"
            >
              Copy email
            </button>
          </div>
          <ul className="mt-9 flex flex-wrap gap-7">
            {LINKS.map((label) => (
              <li key={label}>
                <a
                  href="#"
                  onClick={(e) => {
                    e.preventDefault();
                    show('Placeholder link. Add your own URL.');
                  }}
                  className="border-b border-line pb-0.5 text-ink transition-colors hover:border-accent"
                >
                  {label}
                </a>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </section>
  );
}
