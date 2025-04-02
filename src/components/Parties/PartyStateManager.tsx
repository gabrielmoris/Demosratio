/* eslint-disable react-hooks/exhaustive-deps */
/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";
import { createContext, useContext, useEffect, useState } from "react";
import { Campaign, Party, PartyPromise, Subject } from "@/types/politicalParties";
import { useRequest } from "@/hooks/use-request";

type PartiesContextType = {
  parties: Party[];
  setParties: React.Dispatch<React.SetStateAction<Party[]>>;
  partyChoice: Party | undefined;
  setPartyChoice: React.Dispatch<React.SetStateAction<Party | undefined>>;
  campaigns: Campaign[];
  setCampaigns: React.Dispatch<React.SetStateAction<Campaign[]>>;
  campaignChoice: Campaign | undefined;
  setCampaignChoice: React.Dispatch<React.SetStateAction<Campaign | undefined>>;
  subjectChoice: Subject | undefined;
  setSubjectChoice: React.Dispatch<React.SetStateAction<Subject | undefined>>;
  loading: boolean;
  setLoading: React.Dispatch<React.SetStateAction<boolean>>;
  getPartyCampaign: () => Promise<any>;
  getAllParties: () => Promise<any>;
  getPartyPromises: () => Promise<any>;
  subjects: Subject[];
  promises: PartyPromise[];
};

const PartiesContext = createContext<PartiesContextType | undefined>(undefined);

export function PartiesProvider({ children, structured = false }: { children: React.ReactNode; structured?: boolean }) {
  const [parties, setParties] = useState<Party[]>([]);
  const [partyChoice, setPartyChoice] = useState<Party>();
  const [campaigns, setCampaigns] = useState<Campaign[]>([]);
  const [campaignChoice, setCampaignChoice] = useState<Campaign>();
  const [subjects, setSubjects] = useState<Subject[]>([]);
  const [subjectChoice, setSubjectChoice] = useState<Subject>();
  const [promises, setPromises] = useState<PartyPromise[]>([]);

  const [loading, setLoading] = useState(true);

  const { doRequest: getAllParties } = useRequest({
    url: "/api/parties",
    method: "get",
    onSuccess: (data: Party[]) => {
      setParties(data);
      // setPartyChoice(data[0]); // I Could nitialize the first party. (Still in decission)
      setLoading(false);
    },
  });

  const { doRequest: getAllSubjects } = useRequest({
    url: "/api/parties/subjects",
    method: "get",
    onSuccess: (data: Subject[]) => {
      setSubjects(data);
      setSubjectChoice(data[0]);
    },
  });

  const { doRequest: getPartyPromises } = useRequest({
    url: `/api/parties/promises?party_id=${partyChoice?.id}&campaign_id=${campaignChoice?.id}`,
    method: "get",
    onSuccess: (data: PartyPromise[]) => {
      setPromises(data);
    },
  });

  const { doRequest: getPartyPromisesStructured } = useRequest({
    url: `/api/parties/promises?party_id=${partyChoice?.id}&campaign_id=${campaignChoice?.id}&structured=true`,
    method: "get",
    onSuccess: (data: PartyPromise[]) => {
      setPromises(data);
    },
  });

  const { doRequest: getPartyCampaign } = useRequest({
    url: `/api/parties/campaigns?party_id=${partyChoice?.id}`,
    method: "get",
    onSuccess: (data: Campaign[]) => {
      setCampaigns(data);
      if (data.length > 0) {
        setCampaignChoice(data[data.length - 1]);
      } else {
        setCampaignChoice(undefined);
      }
      setLoading(false);
    },
  });

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      await getAllParties();
      await getAllSubjects();
    };

    fetchData();
  }, []);

  useEffect(() => {
    if (partyChoice) {
      setLoading(true);
      getPartyCampaign();
    }
  }, [partyChoice]);

  useEffect(() => {
    if (partyChoice?.id && campaignChoice?.id) {
      if (structured) {
        getPartyPromisesStructured();
      } else {
        getPartyPromises();
      }
    }
  }, [partyChoice, campaignChoice]);

  return (
    <PartiesContext.Provider
      value={{
        getAllParties,
        getPartyCampaign,
        getPartyPromises,
        subjects,
        promises,
        loading,
        setLoading,
        parties,
        setParties,
        partyChoice,
        setPartyChoice,
        subjectChoice,
        setSubjectChoice,
        campaigns,
        setCampaigns,
        campaignChoice,
        setCampaignChoice,
      }}
    >
      {children}
    </PartiesContext.Provider>
  );
}

export function usePartiesContext() {
  const context = useContext(PartiesContext);
  if (!context) throw new Error("Used outside PartiesProvider");
  return context;
}
