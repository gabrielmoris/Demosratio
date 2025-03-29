"use client";
import { createContext, useContext, useState } from "react";
import { Party } from "@/types/parties";
import { Campaign } from "@/types/politicalParties";

type PartiesContextType = {
  parties: Party[];
  setParties: React.Dispatch<React.SetStateAction<Party[]>>;
  partyChoice: Party | undefined;
  setPartyChoice: React.Dispatch<React.SetStateAction<Party | undefined>>;
  campaigns: Campaign[];
  setCampaigns: React.Dispatch<React.SetStateAction<Campaign[]>>;
  campaignChoice: Campaign | undefined;
  setCampaignChoice: React.Dispatch<React.SetStateAction<Campaign | undefined>>;
};

const PartiesContext = createContext<PartiesContextType | undefined>(undefined);

export function PartiesProvider({ children }: { children: React.ReactNode }) {
  const [parties, setParties] = useState<Party[]>([]);
  const [partyChoice, setPartyChoice] = useState<Party>();
  const [campaigns, setCampaigns] = useState<Campaign[]>([]);
  const [campaignChoice, setCampaignChoice] = useState<Campaign>();

  return (
    <PartiesContext.Provider value={{ parties, setParties, partyChoice, setPartyChoice, campaigns, setCampaigns, campaignChoice, setCampaignChoice }}>
      {children}
    </PartiesContext.Provider>
  );
}

export function usePartiesContext() {
  const context = useContext(PartiesContext);
  if (!context) throw new Error("Used outside PartiesProvider");
  return context;
}
