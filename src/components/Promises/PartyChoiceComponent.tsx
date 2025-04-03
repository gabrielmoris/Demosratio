"use client";
import React from "react";
import { usePartiesContext } from "../Parties/PartyStateManager";
import Loading from "../Loading";
import Image from "next/image";
import { Campaign, Party } from "@/types/politicalParties";
import Dropdown from "../Dropdown";

export const PartyChoiceComponent = () => {
  const { parties, loading, setPartyChoice, partyChoice, campaigns, setCampaignChoice, campaignChoice, structuredPromises } = usePartiesContext();

  if (loading) {
    return <Loading />;
  }

  const handlePartychoice = (party: Party) => {
    if (party.id === partyChoice?.id) {
      setPartyChoice(undefined);
    } else {
      setPartyChoice(party);
    }
  };

  return (
    <div className="flex w-full flex-row flex-wrap gap-10 justify-center align-center">
      {!partyChoice ? (
        parties.map((party) => {
          return (
            <div
              key={party.id + "- parties"}
              onClick={() => handlePartychoice(party)}
              className="border cursor-pointer duration-500 bg-white flex items-center justify-center border-drPurple h-28 w-28 rounded-md hover:-translate-y-1 hover:shadow-drPurple hover:shadow-sm"
            >
              <Image className="w-auto" src={party.logo_url} width={100} height={100} alt={party.name + "logo"} priority />
            </div>
          );
        })
      ) : (
        <section className="w-full flex flex-col items-center gap-10">
          <div
            key={partyChoice.id + "- partychoice"}
            onClick={() => handlePartychoice(partyChoice)}
            className={`${
              partyChoice.id === partyChoice?.id && "border-4"
            } border cursor-pointer duration-500 bg-white flex items-center justify-center border-drPurple h-28 w-28 rounded-md hover:-translate-y-1 hover:shadow-drPurple hover:shadow-sm`}
          >
            <Image src={partyChoice.logo_url} width={100} height={100} alt={partyChoice.name + "logo"} priority />
          </div>
          {campaigns[0] && (
            <Dropdown items={campaigns} choose={(item) => setCampaignChoice(item as Campaign)} choice={campaignChoice || campaigns[0]} />
          )}
          <section className="w-full">
            {structuredPromises.map((subject) => {
              return (
                <div key={subject.id + "-subject"}>
                  <div className="cursor-help text-xl font-bold font-drserif" title={subject.description}>
                    {subject.name}
                  </div>

                  <ul className="bold-roman-markers list-[upper-roman] list-inside py-4">
                    {subject.promises.map((promise) => (
                      <li className="my-2" key={promise.id + "-promise"}>
                        {promise.promise}
                      </li>
                    ))}
                  </ul>
                </div>
              );
            })}
          </section>
        </section>
      )}
    </div>
  );
};
