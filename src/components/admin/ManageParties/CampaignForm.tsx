import Input from '@/src/components/Input';
import { usePartiesContext } from '../../Parties/PartyStateManager';
import { FormWrapper } from '@/src/components/FormWrapper';
import { useTranslations } from 'next-intl';
import Button from '@/src/components/Button';
import { ChangeEvent, FormEvent, useCallback, useEffect, useState } from 'react';
import { useLegislatura } from '@/src/context/legislaturaContext';
import { legislaturaLabel } from '@/lib/helpers/legislatura';
import { useAdminSend } from './useAdminSend';

/** Edits the year and PDF of the chosen party's campaign in the selected legislatura. */
export function CampaignForm() {
  const { campaignChoice, getPartyCampaign } = usePartiesContext();
  const { selectedId } = useLegislatura();
  const send = useAdminSend();
  const t = useTranslations('manage-parties');

  const [campaignToSave, setCampaignToSave] = useState({ year: '', campaign_pdf_url: '' });

  useEffect(() => {
    setCampaignToSave({
      year: campaignChoice?.year ? String(campaignChoice.year) : '',
      campaign_pdf_url: campaignChoice?.campaign_pdf_url ?? '',
    });
  }, [campaignChoice]);

  const onInputCampaignChange = useCallback(
    (e: ChangeEvent<HTMLInputElement | HTMLTextAreaElement>, inputKey: string | undefined) => {
      e.preventDefault();
      if (inputKey) setCampaignToSave(prev => ({ ...prev, [inputKey]: e.target.value }));
    },
    []
  );

  const handleSubmit = async (e: FormEvent<Element>) => {
    e.preventDefault();
    if (!campaignChoice) return;
    const saved = await send(
      'patch',
      '/api/parties/campaigns',
      {
        campaign_id: campaignChoice.id,
        year: Number(campaignToSave.year),
        campaign_pdf_url: campaignToSave.campaign_pdf_url,
      },
      t('campaign-saved')
    );
    if (saved) getPartyCampaign();
  };

  const legislaturaId = campaignChoice?.legislatura_id ?? selectedId;

  return (
    <FormWrapper onSubmit={handleSubmit}>
      <label className="font-bold text-xl">
        {legislaturaId
          ? t('edit-campaign-label', { roman: legislaturaLabel(legislaturaId) })
          : t('save-campaign-label')}
      </label>
      <Input
        inputLabel={t('input-canpaign-year')}
        inputObj={campaignToSave}
        type="number"
        inputKey="year"
        placeholder={campaignToSave.year}
        setInput={onInputCampaignChange}
        placeholderClass="h-12"
        required
      />
      <Input
        inputLabel={t('input-campaign-pdf')}
        inputObj={campaignToSave}
        type="text"
        inputKey="campaign_pdf_url"
        placeholder={campaignToSave.campaign_pdf_url}
        setInput={onInputCampaignChange}
        placeholderClass="h-12"
        required
      />
      <Button label={t('save-campaign-btn')} type="submit" />
    </FormWrapper>
  );
}
