/* eslint-disable react-hooks/exhaustive-deps */
"use client";
import { useRequest } from "@/hooks/use-request";
import { CampaignForm } from "@/src/components/admin/ManageParties/CampaignForm";
import { PartyForm } from "@/src/components/admin/ManageParties/PartyForm";
import { usePartiesContext } from "@/src/components/admin/ManageParties/StateManager";
import Dropdown from "@/src/components/Dropdown";
import Loading from "@/src/components/Loading";
import { Party } from "@/types/parties";
import { Campaign } from "@/types/politicalParties";
import { useEffect, useState } from "react";

export default function ManagePartiesContent() {
  const [loading, setLoading] = useState(true);
  const { parties, setParties, partyChoice, setPartyChoice, campaigns, setCampaigns, campaignChoice, setCampaignChoice } = usePartiesContext();

  const { doRequest: getAllParties } = useRequest({
    url: "/api/parties",
    method: "get",
    onSuccess: (data: Party[]) => {
      setParties(data);
      setPartyChoice(data[0]);
      setLoading(false);
    },
  });

  const { doRequest: getPartyCampaign } = useRequest({
    url: `/api/parties/campaigns?party_id=${partyChoice?.id}`,
    method: "get",
    onSuccess: (data: Campaign[]) => {
      setCampaigns(data);
      setCampaignChoice(campaigns[campaigns.length - 1]);
      setLoading(false);
    },
  });

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      await getAllParties();
    };

    fetchData();
  }, []);

  useEffect(() => {
    if (partyChoice) {
      setLoading(true);
      getPartyCampaign();
    }
  }, [partyChoice]);

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
    <main className="w-full flex flex-col justify-center items-center gap-5 md:gap-10">
      <Dropdown items={parties} deleteItem={deleteParty} choose={(item) => setPartyChoice(item as Party)} choice={partyChoice || parties[0]} />
      {campaigns[0] && (
        <Dropdown
          items={campaigns}
          deleteItem={deleteCampaign}
          choose={(item) => setCampaignChoice(item as Campaign)}
          choice={campaignChoice || campaigns[0]}
        />
      )}

      <div className="w-full flex gap-5 flelx-col md:flex-row">
        <PartyForm />
        <CampaignForm />
      </div>
    </main>
  );
}
