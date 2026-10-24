import axios from 'axios';
import { ChangeEvent, FormEvent, useCallback, useEffect, useState } from 'react';
import { useTranslations } from 'next-intl';
import Input from '@/src/components/Input';
import Button from '@/src/components/Button';
import Dropdown from '@/src/components/Dropdown';
import { FormWrapper } from '@/src/components/FormWrapper';
import { useLegislatura } from '@/src/context/legislaturaContext';
import { legislaturaLabel } from '@/lib/helpers/legislatura';
import { Party } from '@/types/politicalParties';
import { usePartiesContext } from '../../Parties/PartyStateManager';
import { useAdminSend } from './useAdminSend';

type Mode = 'existing' | 'new';

const toggleClass = (active: boolean) =>
  `flex-1 px-4 py-2 rounded-md text-sm border duration-300 ${
    active ? 'bg-contrast text-drlight border-contrast' : 'bg-white text-contrast border-drPurple'
  }`;

/**
 * Adds a party to the selected legislatura: an existing party or a new one, with its campaign
 * (year + PDF) in that legislatura. Parties without any campaign can be deleted from the list.
 */
export function AddPartyForm() {
  const { parties, getAllParties } = usePartiesContext();
  const { selected } = useLegislatura();
  const send = useAdminSend();
  const t = useTranslations('manage-parties');

  const defaultYear = String(
    selected?.election_date ? Number(selected.election_date.slice(0, 4)) : new Date().getFullYear()
  );

  const [allParties, setAllParties] = useState<Party[]>([]);
  const [loaded, setLoaded] = useState(false);
  const [mode, setMode] = useState<Mode>('existing');
  const [existingParty, setExistingParty] = useState<Party>();
  const [form, setForm] = useState({ name: '', logo_url: '', year: defaultYear, campaign_pdf_url: '' });
  const [saving, setSaving] = useState(false);

  const loadAllParties = useCallback(async () => {
    try {
      const { data } = await axios.get<Party[]>('/api/parties?all=true');
      setAllParties(data ?? []);
    } catch (error) {
      console.error('Error loading parties:', error);
    } finally {
      setLoaded(true);
    }
  }, []);

  useEffect(() => {
    loadAllParties();
  }, [loadAllParties]);

  // Parties not in this legislatura yet
  const available = allParties.filter(p => !parties.some(inLegislatura => inLegislatura.id === p.id));

  useEffect(() => {
    if (loaded && available.length === 0) setMode('new');
  }, [loaded, available.length]);

  const onInputChange = useCallback(
    (e: ChangeEvent<HTMLInputElement | HTMLTextAreaElement>, inputKey: string | undefined) => {
      e.preventDefault();
      if (inputKey) setForm(prev => ({ ...prev, [inputKey]: e.target.value }));
    },
    []
  );

  const deleteParty = async (id: number) => {
    if (await send('delete', '/api/parties', { party_id: id }, t('party-deleted'))) {
      if (existingParty?.id === id) setExistingParty(undefined);
      loadAllParties();
    }
  };

  const handleSubmit = async (e: FormEvent<Element>) => {
    e.preventDefault();
    if (!selected || saving) return;
    setSaving(true);

    try {
      let partyId = existingParty?.id;
      let partyName = existingParty?.name;

      if (mode === 'new') {
        const created = await send('post', '/api/parties', {
          name: form.name.trim(),
          logo_url: form.logo_url.trim(),
        });
        if (!created?.id) return;
        partyId = created.id;
        partyName = form.name.trim();
      }

      if (!partyId) return;

      const saved = await send(
        'post',
        '/api/parties/campaigns',
        {
          year: Number(form.year),
          party_id: partyId,
          campaign_pdf_url: form.campaign_pdf_url.trim(),
          legislatura_id: selected.id,
        },
        t('add-party-saved', { name: partyName ?? '', roman: legislaturaLabel(selected.id) })
      );

      // A new party exists now even if its campaign failed
      await loadAllParties();
      if (!saved) return;

      setForm({ name: '', logo_url: '', year: form.year, campaign_pdf_url: '' });
      setExistingParty(undefined);
      getAllParties();
    } finally {
      setSaving(false);
    }
  };

  if (!selected) return null;

  return (
    <FormWrapper onSubmit={handleSubmit}>
      <label className="font-bold text-xl">
        {t('add-party-label', { roman: legislaturaLabel(selected.id) })}
      </label>

      <div className="flex flex-row gap-2">
        <button
          type="button"
          disabled={available.length === 0}
          onClick={() => setMode('existing')}
          className={`${toggleClass(mode === 'existing')} disabled:opacity-30 disabled:cursor-not-allowed`}
        >
          {t('add-party-existing')}
        </button>
        <button type="button" onClick={() => setMode('new')} className={toggleClass(mode === 'new')}>
          {t('add-party-new')}
        </button>
      </div>

      {mode === 'existing' ? (
        <div className="flex flex-col gap-2">
          <Dropdown
            items={available}
            deleteItem={deleteParty}
            choose={item => setExistingParty(item as Party)}
            choice={existingParty || t('add-party-choose')}
          />
          <p className="text-xs text-drgray">{t('add-party-delete-hint')}</p>
        </div>
      ) : (
        <>
          <Input
            inputLabel={t('input-label-name')}
            inputObj={form}
            type="text"
            inputKey="name"
            placeholder={form.name}
            setInput={onInputChange}
            placeholderClass="h-12"
            required
          />
          <Input
            inputLabel={t('input-label-logo_url')}
            inputObj={form}
            type="text"
            inputKey="logo_url"
            placeholder={form.logo_url}
            setInput={onInputChange}
            placeholderClass="h-12"
            required
          />
        </>
      )}

      <Input
        inputLabel={t('input-canpaign-year')}
        inputObj={form}
        type="number"
        inputKey="year"
        placeholder={form.year}
        setInput={onInputChange}
        placeholderClass="h-12"
        required
      />
      <Input
        inputLabel={t('input-campaign-pdf')}
        inputObj={form}
        type="text"
        inputKey="campaign_pdf_url"
        placeholder={form.campaign_pdf_url}
        setInput={onInputChange}
        placeholderClass="h-12"
        required
      />

      <Button
        label={t('add-party-btn')}
        type="submit"
        isLoading={saving || (mode === 'existing' && !existingParty)}
      />
    </FormWrapper>
  );
}
