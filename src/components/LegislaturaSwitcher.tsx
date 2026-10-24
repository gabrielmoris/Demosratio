'use client';
import { useEffect, useRef, useState } from 'react';
import { useTranslations } from 'next-intl';
import { useLegislatura } from '@/src/context/legislaturaContext';
import { legislaturaLabel } from '@/lib/helpers/legislatura';

export function LegislaturaSwitcher({ onSelect }: { onSelect?: () => void }) {
  const { legislaturas, selected, current, select } = useLegislatura();
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);
  const t = useTranslations('legislatura');

  useEffect(() => {
    if (!open) return;
    const closeOnOutside = (e: MouseEvent) => {
      if (!ref.current?.contains(e.target as Node)) setOpen(false);
    };
    const closeOnEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setOpen(false);
    };
    document.addEventListener('mousedown', closeOnOutside);
    document.addEventListener('keydown', closeOnEscape);
    return () => {
      document.removeEventListener('mousedown', closeOnOutside);
      document.removeEventListener('keydown', closeOnEscape);
    };
  }, [open]);

  if (!selected) return null;

  const roman = legislaturaLabel(selected.id);
  const isPast = current && selected.id !== current.id;

  return (
    <div ref={ref} className="relative md:mt-auto flex items-center justify-center">
      <button
        type="button"
        onClick={() => setOpen(!open)}
        title={t('title')}
        aria-label={t('aria-label', { roman })}
        aria-haspopup="listbox"
        aria-expanded={open}
        className={`min-w-7 lg:min-w-10 px-1 py-0.5 rounded font-drserif font-bold text-xs lg:text-sm tracking-wide hover:opacity-60 duration-500 ${
          isPast ? 'text-contrast bg-drlight' : 'text-drlight'
        }`}
      >
        {roman}
      </button>

      {open && (
        <ul
          role="listbox"
          aria-label={t('title')}
          className="absolute bottom-full right-0 mb-4 md:mb-0 md:bottom-0 md:right-auto md:left-full md:ml-4 min-w-40 py-1 z-50 bg-white rounded-md border border-drlight shadow-sm text-sm text-contrast"
        >
          <li className="px-3 py-1 text-xs text-drgray">{t('title')}</li>
          {legislaturas.map(l => (
            <li key={l.id} role="option" aria-selected={l.id === selected.id}>
              <button
                type="button"
                onClick={() => {
                  select(l.id);
                  setOpen(false);
                  onSelect?.();
                }}
                className={`w-full flex flex-row items-center justify-between gap-4 px-3 py-1.5 text-left hover:bg-drPurple hover:bg-opacity-20 ${
                  l.id === selected.id ? 'font-bold' : ''
                }`}
              >
                <span className="font-drserif">{legislaturaLabel(l.id)}</span>
                {l.is_current && <span className="text-xs text-drgray">{t('current')}</span>}
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
