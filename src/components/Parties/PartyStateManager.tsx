/* eslint-disable react-hooks/exhaustive-deps */
'use client';
import { createContext, useContext, useEffect, useState } from 'react';
import {
  Campaign,
  Party,
  PartyPromise,
  StructuredPromises,
  Subject,
} from '@/types/politicalParties';
import { useRequest } from '@/hooks/use-request';
import { useLegislatura } from '@/src/context/legislaturaContext';
import { withLegislatura } from '@/lib/helpers/legislatura';

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
  getPartyCampaign: () => Promise<Campaign>;
  getAllParties: () => Promise<Party[]>;
  getAllSubjects: () => Promise<Subject[]>;
  getPartyPromises: () => Promise<PartyPromise[]>;
  subjects: Subject[];
  promises: PartyPromise[];
  structuredPromises: StructuredPromises[];
};

const PartiesContext = createContext<PartiesContextType | undefined>(undefined);

export function PartiesProvider({
  children,
  structured = false,
}: {
  children: React.ReactNode;
  structured?: boolean;
}) {
  const [parties, setParties] = useState<Party[]>([]);
  const [partyChoice, setPartyChoice] = useState<Party>();
  const [campaigns, setCampaigns] = useState<Campaign[]>([]);
  const [campaignChoice, setCampaignChoice] = useState<Campaign>();
  const [subjects, setSubjects] = useState<Subject[]>([]);
  const [subjectChoice, setSubjectChoice] = useState<Subject>();
  const [promises, setPromises] = useState<PartyPromise[]>([]);
  const [structuredPromises, setStructuredPromises] = useState<StructuredPromises[]>([]);

  const [loading, setLoading] = useState(true);

  // Pages using this provider are wrapped in LegislaturaScoped, so it mounts again when this changes
  const { selectedId } = useLegislatura();

  const { doRequest: getAllParties } = useRequest({
    url: withLegislatura('/api/parties', selectedId),
    method: 'get',
    onSuccess: (data: Party[]) => {
      setParties(data);
      // setPartyChoice(data[0]); // I Could initialize the first party. (Still in decission)
      setLoading(false);
    },
  });

  const { doRequest: getAllSubjects } = useRequest({
    url: '/api/parties/subjects',
    method: 'get',
    onSuccess: (data: Subject[]) => {
      setSubjects(data);
      setSubjectChoice(data[0]);
    },
  });

  const { doRequest: getPartyPromises } = useRequest({
    url: `/api/parties/promises?party_id=${partyChoice?.id}&campaign_id=${campaignChoice?.id}`,
    method: 'get',
    onSuccess: (data: PartyPromise[]) => {
      setPromises(data);
    },
  });

  const { doRequest: getPartyPromisesStructured } = useRequest({
    url: `/api/parties/promises?party_id=${partyChoice?.id}&campaign_id=${campaignChoice?.id}&structured=true`,
    method: 'get',
    onSuccess: (data: StructuredPromises[]) => {
      setStructuredPromises(data);
    },
  });

  const { doRequest: getPartyCampaign } = useRequest({
    url: withLegislatura(`/api/parties/campaigns?party_id=${partyChoice?.id}`, selectedId),
    method: 'get',
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
        getAllSubjects,
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
        structuredPromises,
      }}
    >
      {children}
    </PartiesContext.Provider>
  );
}

export function usePartiesContext() {
  const context = useContext(PartiesContext);
  if (!context) throw new Error('Used outside PartiesProvider');
  return context;
}
