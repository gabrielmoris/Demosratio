'use client';
import { useTranslations } from 'next-intl';
import { useLegislatura } from '@/src/context/legislaturaContext';
import { legislaturaLabel } from '@/lib/helpers/legislatura';

/** Shown while the data of a legislatura other than the current one is on screen. */
export function LegislaturaBanner() {
  const { selected, current, select } = useLegislatura();
  const t = useTranslations('legislatura');

  if (!selected || !current || selected.id === current.id) return null;

  return (
    <div
      role="status"
      className="w-full mb-6 flex flex-col sm:flex-row sm:items-center justify-between gap-2 rounded-md border border-drPurple border-opacity-30 bg-drlight px-4 py-2 text-sm text-contrast"
    >
      <span>{t('viewing-other', { roman: legislaturaLabel(selected.id) })}</span>
      <button
        type="button"
        onClick={() => select(current.id)}
        className="text-left font-bold text-drPurple hover:opacity-60 duration-300 whitespace-nowrap"
      >
        {t('back-to-current', { roman: legislaturaLabel(current.id) })} →
      </button>
    </div>
  );
}
