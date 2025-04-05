"use client";
import { CampaignForm } from "@/src/components/admin/ManageParties/CampaignForm";
import { PartyForm } from "@/src/components/admin/ManageParties/PartyForm";
import { usePartiesContext } from "@/src/components/Parties/PartyStateManager";
import Dropdown from "@/src/components/Dropdown";
import Loading from "@/src/components/Loading";
import { Campaign, Party } from "@/types/politicalParties";
import { PromiseForm } from "../admin/ManageParties/PromiseForm";
import { useRequest } from "@/hooks/use-request";
import { useTranslations } from "next-intl";

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
    getPartyCampaign,
    getPartyPromises,
  } = usePartiesContext();

  const t = useTranslations("manage-parties");

  const { doRequest: deletePartyReq } = useRequest({
    url: "/api/parties",
    method: "delete",
    onSuccess() {
      getAllParties();
    },
  });

  const { doRequest: deleteCampaignReq } = useRequest({
    url: "/api/parties/campaigns",
    method: "delete",
    onSuccess() {
      getPartyCampaign();
    },
  });

  const { doRequest: deletePromiseReq } = useRequest({
    url: "/api/parties/promises",
    method: "delete",
    onSuccess() {
      getPartyPromises();
    },
  });

  const deleteParty = (id: number) => {
    deletePartyReq({ party_id: id });
    setPartyChoice(undefined);
  };

  const deleteCampaign = (id: number) => {
    deleteCampaignReq({ campaign_id: id });
  };

  const deletePromise = (id: number) => {
    deletePromiseReq({ promise_id: id });
  };

  if (loading) {
    return <Loading />;
  }

  return (
    <main className="w-full flex flex-col justify-center items-center gap-5 md:gap-10 mb-16 md:mb-0">
      {parties[0] && (
        <Dropdown
          items={parties}
          deleteItem={deleteParty}
          choose={(item) => setPartyChoice(item as Party)}
          choice={partyChoice || t("choose-party")}
        />
      )}
      {campaigns[0] && (
        <Dropdown
          items={campaigns}
          deleteItem={deleteCampaign}
          choose={(item) => setCampaignChoice(item as Campaign)}
          choice={campaignChoice || campaigns[0]}
        />
      )}

      {promises[0] && (
        <Dropdown
          items={promises}
          deleteItem={deletePromise}
          choose={() => null}
          choice={t("delete-promise")}
        />
      )}

      <div className="flex w-full h-full gap-8 flex-col xl:flex-row">
        {campaigns[0] && <PromiseForm />}
        {!partyChoice && <PartyForm />}
        {partyChoice && <CampaignForm />}
      </div>
    </main>
  );
}
