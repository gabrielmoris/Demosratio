"use client";
import { CampaignForm } from "@/src/components/admin/ManageParties/CampaignForm";
import { PartyForm } from "@/src/components/admin/ManageParties/PartyForm";
import { usePartiesContext } from "@/src/components/admin/ManageParties/StateManager";
import Dropdown from "@/src/components/Dropdown";
import Loading from "@/src/components/Loading";
import { Campaign, Party } from "@/types/politicalParties";
import { PromiseForm } from "./PromiseForm";

export default function ManagePartiesContent() {
  const { loading, parties, partyChoice, setPartyChoice, campaigns, campaignChoice, setCampaignChoice } = usePartiesContext();

  const deleteParty = (id: number) => {
    console.log("DELETE PARTY WITH ID => ", id);
  };

  const deleteCampaign = (id: number) => {
    console.log("DELETE CAMPAIGN WITH ID => ", id);
  };

  if (loading) {
    return <Loading />;
  }

  return (
    <main className="w-full flex flex-col justify-center items-center gap-5 md:gap-10 mb-16 md:mb-0">
      <Dropdown items={parties} deleteItem={deleteParty} choose={(item) => setPartyChoice(item as Party)} choice={partyChoice || parties[0]} />
      {campaigns[0] && (
        <Dropdown
          items={campaigns}
          deleteItem={deleteCampaign}
          choose={(item) => setCampaignChoice(item as Campaign)}
          choice={campaignChoice || campaigns[0]}
        />
      )}
      <div className="flex w-full h-full gap-5 flex-col xl:flex-row">
        <PartyForm />
        <CampaignForm />
      </div>
      <PromiseForm />
    </main>
  );
}
