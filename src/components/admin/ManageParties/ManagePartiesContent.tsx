"use client";
import { CampaignForm } from "@/src/components/admin/ManageParties/CampaignForm";
import { PartyForm } from "@/src/components/admin/ManageParties/PartyForm";
import { usePartiesContext } from "@/src/components/admin/ManageParties/StateManager";
import Dropdown from "@/src/components/Dropdown";
import Loading from "@/src/components/Loading";
import { Campaign, Party } from "@/types/politicalParties";
import { PromiseForm } from "./PromiseForm";
import { useRequest } from "@/hooks/use-request";

export default function ManagePartiesContent() {
  const {
    loading,
    parties,
    getAllParties,
    partyChoice,
    setPartyChoice,
    campaigns,
    campaignChoice,
    setCampaignChoice,
  } = usePartiesContext();

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
      getAllParties();
    },
  });

  const deleteParty = (id: number) => {
    deletePartyReq({ party_id: id });
  };

  const deleteCampaign = (id: number) => {
    deleteCampaignReq({ campaign_id: id });
  };

  if (loading) {
    return <Loading />;
  }

  return (
    <main className="w-full flex flex-col justify-center items-center gap-5 md:gap-10 mb-16 md:mb-0">
      <Dropdown
        items={parties}
        deleteItem={deleteParty}
        choose={(item) => setPartyChoice(item as Party)}
        choice={partyChoice || parties[0]}
      />
      {campaigns[0] && (
        <Dropdown
          items={campaigns}
          deleteItem={deleteCampaign}
          choose={(item) => setCampaignChoice(item as Campaign)}
          choice={campaignChoice || campaigns[0]}
        />
      )}

      {campaigns[0] && (
        <div className="flex w-full h-full">
          <PromiseForm />
        </div>
      )}
      <div className="flex w-full h-full gap-8 flex-col xl:flex-row">
        <PartyForm />
        <CampaignForm />
      </div>
    </main>
  );
}
