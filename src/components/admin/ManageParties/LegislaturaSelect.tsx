import { useTranslations } from 'next-intl';
import { useLegislatura } from '@/src/context/legislaturaContext';
import { legislaturaLabel } from '@/lib/helpers/legislatura';

/** Which legislatura the manage-parties page edits (also what the rest of the site shows). */
export function LegislaturaSelect() {
  const { legislaturas, selectedId, select } = useLegislatura();
  const t = useTranslations('manage-parties');

  if (legislaturas.length === 0) return null;

  return (
    <section className="w-full flex flex-col gap-2">
      <label htmlFor="legislatura-select" className="font-bold text-xl">
        {t('legislatura-select-label')}
      </label>
      <select
        id="legislatura-select"
        value={selectedId}
        onChange={e => select(Number(e.target.value))}
        className="w-full bg-white rounded-md border border-drPurple text-contrast font-medium text-sm px-5 py-2.5 focus:outline-none focus:ring-1 focus:ring-drgray"
      >
        {legislaturas.map(l => (
          <option key={l.id} value={l.id}>
            {t(l.is_current ? 'legislatura-option-current' : 'legislatura-option', {
              roman: legislaturaLabel(l.id),
            })}
          </option>
        ))}
      </select>
      <p className="text-sm text-drgray">{t('legislatura-select-hint')}</p>
    </section>
  );
}
