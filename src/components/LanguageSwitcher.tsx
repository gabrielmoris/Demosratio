'use client';
import { useEffect, useRef, useState, useTransition } from 'react';
import { useLocale, useTranslations } from 'next-intl';
import { routing, usePathname, useRouter } from '@/src/i18n/routing';
import { codeToLanguage } from '@/src/locale';

type Locale = (typeof routing.locales)[number];

export function LanguageSwitcher({ onSelect }: { onSelect?: () => void }) {
  const locale = useLocale() as Locale;
  const pathname = usePathname();
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [isPending, startTransition] = useTransition();
  const ref = useRef<HTMLDivElement>(null);
  const t = useTranslations('language');

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

  const change = (next: Locale) => {
    setOpen(false);
    onSelect?.();
    if (next === locale) return;
    // Same page in the other language, keeping ?search=... and other params
    const search = typeof window !== 'undefined' ? window.location.search : '';
    startTransition(() => router.replace(`${pathname}${search}`, { locale: next }));
  };

  return (
    <div ref={ref} className="relative flex items-center justify-center">
      <button
        type="button"
        onClick={() => setOpen(!open)}
        title={t('title')}
        aria-label={t('aria-label', { language: codeToLanguage[locale] })}
        aria-haspopup="listbox"
        aria-expanded={open}
        disabled={isPending}
        className="min-w-7 lg:min-w-10 px-1 py-0.5 rounded font-drsans font-bold text-xs lg:text-sm uppercase tracking-wide text-drlight hover:opacity-60 duration-500 disabled:opacity-40"
      >
        {locale}
      </button>

      {open && (
        <ul
          role="listbox"
          aria-label={t('title')}
          className="absolute bottom-full right-0 mb-4 md:mb-0 md:bottom-0 md:right-auto md:left-full md:ml-4 min-w-40 py-1 z-50 bg-white rounded-md border border-drlight shadow-sm text-sm text-contrast"
        >
          <li className="px-3 py-1 text-xs text-drgray">{t('title')}</li>
          {routing.locales.map(code => (
            <li key={code} role="option" aria-selected={code === locale}>
              <button
                type="button"
                lang={code}
                onClick={() => change(code)}
                className={`w-full flex flex-row items-center justify-between gap-4 px-3 py-1.5 text-left hover:bg-drPurple hover:bg-opacity-20 ${
                  code === locale ? 'font-bold' : ''
                }`}
              >
                <span>{codeToLanguage[code]}</span>
                <span className="text-xs text-drgray uppercase">{code}</span>
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
