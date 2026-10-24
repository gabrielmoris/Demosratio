'use client';
import { CampaignForm } from '@/src/components/admin/ManageParties/CampaignForm';
import { AddPartyForm } from '@/src/components/admin/ManageParties/AddPartyForm';
import { LegislaturaSelect } from '@/src/components/admin/ManageParties/LegislaturaSelect';
import { LegislaturasManager } from '@/src/components/admin/ManageParties/LegislaturasManager';
import { useAdminSend } from '@/src/components/admin/ManageParties/useAdminSend';
import { usePartiesContext } from '@/src/components/Parties/PartyStateManager';
import Dropdown from '@/src/components/Dropdown';
import Loading from '@/src/components/Loading';
import { Campaign, Party } from '@/types/politicalParties';
import { PromiseForm } from '../admin/ManageParties/PromiseForm';
import { AiPromisesExtractor } from '../admin/ManageParties/AiPromisesExtractor';
import { SubjectsManager } from '../admin/ManageParties/SubjectsManager';
import { useRequest } from '@/hooks/use-request';
import { useTranslations } from 'next-intl';

export default function ManagePartiesContent() {
  const {
    loading,
    parties,
    promises,
    getAllParties,
    partyChoice,
    setPartyChoice,
    campaigns,
    campaignChoice,
    setCampaignChoice,
    getPartyPromises,
  } = usePartiesContext();

  const t = useTranslations('manage-parties');
  const send = useAdminSend();

  const { doRequest: deletePromiseReq } = useRequest({
    url: '/api/parties/promises',
    method: 'delete',
    onSuccess() {
      getPartyPromises();
    },
  });

  // A party is in a legislatura through its campaign: deleting it removes the party from the legislatura
  const deleteCampaign = async (id: number) => {
    if (
      await send('delete', '/api/parties/campaigns', { campaign_id: id }, t('campaign-removed'))
    ) {
      setPartyChoice(undefined);
      setCampaignChoice(undefined);
      getAllParties();
    }
  };

  const deletePromise = (id: number) => {
    deletePromiseReq({ promise_id: id });
  };

  if (loading) {
    return <Loading />;
  }

  const partyCampaign = partyChoice && campaignChoice?.party_id === partyChoice.id;

  return (
    <main className="w-full flex flex-col justify-center items-center gap-5 md:gap-10 mb-16 md:mb-0">
      <LegislaturaSelect />

      {parties[0] && (
        <div className="w-full flex flex-col gap-2">
          <Dropdown
            items={parties}
            choose={item => setPartyChoice(item as Party)}
            choice={partyChoice || t('choose-party')}
          />
          {partyChoice && (
            <button
              type="button"
              onClick={() => {
                setPartyChoice(undefined);
                setCampaignChoice(undefined);
              }}
              className="self-start text-sm text-drPurple hover:opacity-60 duration-300"
            >
              {t('add-another-party')}
            </button>
          )}
        </div>
      )}

      {partyCampaign && campaigns[0] && (
        <div className="w-full flex flex-col gap-2">
          <Dropdown
            items={campaigns}
            deleteItem={deleteCampaign}
            choose={item => setCampaignChoice(item as Campaign)}
            choice={campaignChoice || campaigns[0]}
          />
          <p className="text-xs text-drgray">{t('remove-from-legislatura-hint')}</p>
        </div>
      )}

      {partyCampaign && promises[0] && (
        <Dropdown
          items={promises}
          deleteItem={deletePromise}
          choose={() => null}
          choice={t('delete-promise')}
        />
      )}

      <div className="flex w-full h-full gap-8 flex-col xl:flex-row">
        {partyCampaign && <PromiseForm />}
        {!partyChoice && <AddPartyForm />}
        {partyCampaign && <CampaignForm />}
      </div>

      {partyCampaign && (
        <div className="flex w-full">
          <AiPromisesExtractor />
        </div>
      )}

      <div className="flex w-full">
        <LegislaturasManager />
      </div>

      <div className="flex w-full">
        <SubjectsManager />
      </div>
    </main>
  );
}
