"use client";
import React from "react";
import { usePartiesContext } from "../Parties/PartyStateManager";
import Loading from "../Loading";
import Image from "next/image";
import { Party } from "@/types/politicalParties";

export const PromisesComponent = () => {
  // const t = useTranslations("promises");
  const { parties, loading, setPartyChoice, partyChoice } = usePartiesContext();

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
    <div className="flex flex-row flex-wrap gap-10 justify-center align-center">
      {!partyChoice ? (
        parties.map((party) => {
          return (
            <div
              key={party.id}
              onClick={() => handlePartychoice(party)}
              className="border cursor-pointer duration-500 bg-white flex items-center justify-center border-drPurple h-28 w-28 rounded-md hover:-translate-y-1 hover:shadow-drPurple hover:shadow-sm"
            >
              <Image src={party.logo_url} width={100} height={100} alt={party.name + "logo"} />
            </div>
          );
        })
      ) : (
        <>
          <div
            key={partyChoice.id}
            onClick={() => handlePartychoice(partyChoice)}
            className={`${
              partyChoice.id === partyChoice?.id && "border-4"
            } border cursor-pointer duration-500 bg-white flex items-center justify-center border-drPurple h-28 w-28 rounded-md hover:-translate-y-1 hover:shadow-drPurple hover:shadow-sm`}
          >
            <Image src={partyChoice.logo_url} width={100} height={100} alt={partyChoice.name + "logo"} />
          </div>
        </>
      )}
    </div>
  );
};
