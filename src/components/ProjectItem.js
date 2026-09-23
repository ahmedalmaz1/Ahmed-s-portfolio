'use client';

import { useState } from 'react';
import CompareSlider from './CompareSlider';
import { useToast } from '@/providers/ToastProvider';
import { cx } from '@/lib/cx';

export default function ProjectItem({ project, defaultOpen = false }) {
  const [open, setOpen] = useState(defaultOpen);
  const { show } = useToast();
  const panelId = `panel-${project.slug}`;

  return (
    <li className="border-b border-line">
      <h3 className="text-inherit font-inherit">
        <button
          type="button"
          aria-expanded={open}
          aria-controls={panelId}
          onClick={() => setOpen((v) => !v)}
          className="group grid w-full grid-cols-[1fr_24px] items-center gap-3 py-6 text-left sm:grid-cols-[5fr_6fr_32px] sm:gap-6 sm:py-8"
        >
          <span
            className={cx(
              'font-display text-[clamp(1.5rem,3vw,2.3rem)] font-bold leading-[1.1] tracking-[-0.015em] transition-colors',
              open ? 'text-accent' : 'group-hover:text-accent'
            )}
          >
            {project.title}
          </span>
          <span className="col-start-1 row-start-2 text-muted sm:col-start-2 sm:row-start-1">{project.summary}</span>
          <span className="relative col-start-2 row-start-1 h-5 w-5 justify-self-end sm:col-start-3">
            <span className="absolute left-0 top-[9px] h-0.5 w-5 rounded-sm bg-ink" />
            <span
              className={cx(
                'absolute left-0 top-[9px] h-0.5 w-5 rounded-sm bg-ink transition-transform duration-300',
                open ? 'rotate-0' : 'rotate-90'
              )}
            />
          </span>
        </button>
      </h3>

      <div
        id={panelId}
        className={cx('grid overflow-hidden transition-[grid-template-rows] duration-300 ease-in-out', open ? 'grid-rows-[1fr]' : 'grid-rows-[0fr]')}
      >
        <div className="min-h-0 overflow-hidden">
          <div className="grid grid-cols-1 items-start gap-6 pb-10 sm:grid-cols-[4fr_7fr] sm:gap-8">
            <div>
              <p className="max-w-md text-ink2">{project.description}</p>
              <p className="mt-3.5 text-sm text-muted">{project.stack}</p>
              <ul className="mt-4.5 flex flex-wrap gap-6">
                {project.links.map((link) => (
                  <li key={link.label}>
                    <a
                      href={link.href}
                      onClick={(e) => {
                        if (link.href === '#') {
                          e.preventDefault();
                          show('Placeholder link. Add your own URL.');
                        }
                      }}
                      className="border-b border-line pb-0.5 text-ink transition-colors hover:border-accent"
                    >
                      {link.label}
                    </a>
                  </li>
                ))}
              </ul>
            </div>
            <CompareSlider options={project.scene} palette={project.palette} />
          </div>
        </div>
      </div>
    </li>
  );
}
