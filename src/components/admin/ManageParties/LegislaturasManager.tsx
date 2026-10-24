import { useEffect, useState } from 'react';
import { useTranslations } from 'next-intl';
import { useLegislatura } from '@/src/context/legislaturaContext';
import { DEFAULT_LEGISLATURA_ID, legislaturaLabel } from '@/lib/helpers/legislatura';
import { Legislatura } from '@/types/legislatura';
import { useAdminSend } from './useAdminSend';

const DATE_FIELDS = ['election_date', 'start_date', 'end_date'] as const;

type DateField = (typeof DATE_FIELDS)[number];
type Draft = { id: number } & Record<DateField, string>;

const toDraft = (l: Legislatura): Draft => ({
  id: l.id,
  election_date: l.election_date ?? '',
  start_date: l.start_date ?? '',
  end_date: l.end_date ?? '',
});

const toBody = (d: Draft) => ({
  id: d.id,
  election_date: d.election_date || null,
  start_date: d.start_date || null,
  end_date: d.end_date || null,
});

const emptyDraft = (id: number): Draft => ({ id, election_date: '', start_date: '', end_date: '' });

const inputClass =
  'w-full px-3 py-2 text-drgray rounded-md border border-drPurple focus:outline-none bg-white';
const actionClass = 'px-4 py-2 rounded-md text-sm whitespace-nowrap hover:opacity-80 duration-300';

/** Add, edit, delete and make current the legislaturas. */
export function LegislaturasManager() {
  const { legislaturas, reload } = useLegislatura();
  const send = useAdminSend();
  const t = useTranslations('manage-parties');

  // legislaturas come newest first
  const nextId = (legislaturas[0]?.id ?? DEFAULT_LEGISLATURA_ID - 1) + 1;

  const [drafts, setDrafts] = useState<Draft[]>([]);
  const [newDraft, setNewDraft] = useState<Draft>(emptyDraft(nextId));

  useEffect(() => {
    setDrafts(legislaturas.map(toDraft));
  }, [legislaturas]);

  useEffect(() => {
    setNewDraft(emptyDraft(nextId));
  }, [nextId]);

  const editDraft = (idx: number, field: DateField, value: string) =>
    setDrafts(prev => prev.map((d, i) => (i === idx ? { ...d, [field]: value } : d)));

  const isChanged = (draft: Draft) => {
    const original = legislaturas.find(l => l.id === draft.id);
    if (!original) return false;
    const before = toDraft(original);
    return DATE_FIELDS.some(field => before[field] !== draft[field]);
  };

  const save = async (draft: Draft) => {
    if (await send('patch', '/api/legislaturas', toBody(draft), t('legislaturas-saved'))) {
      await reload();
    }
  };

  const remove = async (draft: Draft) => {
    const roman = legislaturaLabel(draft.id);
    if (!window.confirm(t('legislaturas-confirm-delete', { roman }))) return;
    if (await send('delete', '/api/legislaturas', { id: draft.id }, t('legislaturas-deleted'))) {
      await reload();
    }
  };

  const makeCurrent = async (draft: Draft) => {
    const roman = legislaturaLabel(draft.id);
    if (!window.confirm(t('legislaturas-confirm-current', { roman }))) return;
    const ok = await send(
      'post',
      '/api/legislaturas/current',
      { id: draft.id },
      t('legislaturas-now-current', { roman })
    );
    if (ok) await reload();
  };

  const add = async () => {
    if (!(newDraft.id > 0)) return;
    if (await send('post', '/api/legislaturas', toBody(newDraft), t('legislaturas-saved'))) {
      await reload();
    }
  };

  return (
    <section className="flex flex-1 flex-col bg-white border border-drlight gap-6 rounded-md p-6 md:p-10">
      <div className="flex flex-col gap-1">
        <label className="font-bold text-xl">{t('legislaturas-label')}</label>
        <p className="text-sm text-drgray">{t('legislaturas-hint')}</p>
      </div>

      <ul className="flex flex-col gap-4">
        {drafts.map((draft, idx) => {
          const isCurrent = legislaturas.find(l => l.id === draft.id)?.is_current;
          return (
            <li key={draft.id} className="flex flex-col gap-3 rounded-md border border-drlight p-4">
              <div className="flex flex-col sm:flex-row gap-2 sm:items-center justify-between">
                <p className="font-drserif font-bold text-lg flex flex-row items-center gap-2">
                  {t('legislatura-option', { roman: legislaturaLabel(draft.id) })}
                  {isCurrent && (
                    <span className="font-drsans font-normal text-xs px-2 py-0.5 rounded-full bg-drlight text-contrast">
                      {t('legislaturas-current')}
                    </span>
                  )}
                </p>
                <div className="flex flex-row flex-wrap gap-2 shrink-0">
                  <button
                    type="button"
                    disabled={!isChanged(draft)}
                    onClick={() => save(draft)}
                    className={`${actionClass} bg-contrast text-drlight disabled:opacity-30 disabled:cursor-not-allowed`}
                  >
                    {t('legislaturas-save-btn')}
                  </button>
                  {!isCurrent && (
                    <>
                      <button
                        type="button"
                        onClick={() => makeCurrent(draft)}
                        className={`${actionClass} bg-drPurple text-white`}
                      >
                        {t('legislaturas-make-current')}
                      </button>
                      <button
                        type="button"
                        onClick={() => remove(draft)}
                        className={`${actionClass} bg-drlight text-contrast`}
                      >
                        {t('legislaturas-delete-btn')}
                      </button>
                    </>
                  )}
                </div>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                {DATE_FIELDS.map(field => (
                  <label key={field} className="flex flex-col gap-1 text-xs text-drgray">
                    {t(`legislaturas-${field}`)}
                    <input
                      type="date"
                      value={draft[field]}
                      onChange={e => editDraft(idx, field, e.target.value)}
                      className={inputClass}
                    />
                  </label>
                ))}
              </div>
            </li>
          );
        })}
      </ul>

      <div className="flex flex-col gap-3 rounded-md border border-dashed border-drPurple p-4">
        <div className="flex flex-col sm:flex-row gap-2 sm:items-end">
          <label className="flex flex-col gap-1 text-xs text-drgray sm:w-40">
            {t('legislaturas-number')}
            <div className="flex flex-row items-center gap-2">
              <input
                type="number"
                min={1}
                value={newDraft.id || ''}
                onChange={e => setNewDraft({ ...newDraft, id: Number(e.target.value) })}
                className={inputClass}
              />
              <span className="font-drserif font-bold text-base text-contrast">
                {newDraft.id > 0 ? legislaturaLabel(newDraft.id) : ''}
              </span>
            </div>
          </label>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 flex-1">
            {DATE_FIELDS.map(field => (
              <label key={field} className="flex flex-col gap-1 text-xs text-drgray">
                {t(`legislaturas-${field}`)}
                <input
                  type="date"
                  value={newDraft[field]}
                  onChange={e => setNewDraft({ ...newDraft, [field]: e.target.value })}
                  className={inputClass}
                />
              </label>
            ))}
          </div>
        </div>
        <button
          type="button"
          disabled={!(newDraft.id > 0)}
          onClick={add}
          className={`${actionClass} self-end bg-contrast text-drlight disabled:opacity-30 disabled:cursor-not-allowed`}
        >
          {t('legislaturas-add-btn')}
        </button>
      </div>
    </section>
  );
}
