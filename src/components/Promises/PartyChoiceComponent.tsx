"use client";
import React, { ChangeEvent, useCallback, useState } from "react";
import { usePartiesContext } from "../Parties/PartyStateManager";
import Loading from "../Loading";
import Image from "next/image";
import { Campaign, Party } from "@/types/politicalParties";
import Dropdown from "../Dropdown";
import Input from "../Input";
import { useTranslations } from "next-intl";
import Button from "../Button";

export const PartyChoiceComponent = () => {
  const [promiseReadiness, setPromiseReadiness] = useState("");

  const t = useTranslations("parties");
  const {
    parties,
    loading,
    setPartyChoice,
    partyChoice,
    campaigns,
    setCampaignChoice,
    campaignChoice,
    structuredPromises,
  } = usePartiesContext();

  const onInputChange = useCallback(
    (e: ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
      const newValue = e.target.value;
      setPromiseReadiness(newValue);
    },
    []
  );

  const sendReadyness = () => {
    alert(promiseReadiness);
  };

  const handlePartychoice = (party: Party) => {
    if (party.id === partyChoice?.id) {
      setPartyChoice(undefined);
    } else {
      setPartyChoice(party);
    }
  };

  if (loading) {
    return <Loading />;
  }

  return (
    <div className="flex w-full flex-col justify-center align-center">
      {!partyChoice ? (
        <section className="w-full flex flex-row flex-wrap justify-center align-center gap-10 p-5 md:p-36">
          {parties.map((party) => {
            return (
              <div
                key={party.id + "- parties"}
                onClick={() => handlePartychoice(party)}
                className="border cursor-pointer duration-500 bg-white flex items-center justify-center border-drPurple h-28 w-28 rounded-md hover:-translate-y-1 hover:shadow-drPurple hover:shadow-sm"
              >
                <Image
                  className="w-auto"
                  src={party.logo_url}
                  width={100}
                  height={100}
                  alt={party.name + "logo"}
                  priority
                />
              </div>
            );
          })}
        </section>
      ) : (
        <section className="w-full flex flex-col items-center gap-10 p-5 md:px-36">
          <div
            key={partyChoice.id + "- partychoice"}
            onClick={() => handlePartychoice(partyChoice)}
            className={`${
              partyChoice.id === partyChoice?.id && "border-4"
            } border cursor-pointer duration-500 bg-white flex items-center justify-center border-drPurple h-28 w-28 rounded-md hover:-translate-y-1 hover:shadow-drPurple hover:shadow-sm`}
          >
            <Image
              src={partyChoice.logo_url}
              width={100}
              height={100}
              alt={partyChoice.name + "logo"}
              priority
            />
          </div>
          <div className="w-full flex flex-col gap-10 items-center justify-center">
            {campaigns[0] && (
              <Dropdown
                items={campaigns}
                choose={(item) => setCampaignChoice(item as Campaign)}
                choice={campaignChoice || campaigns[0]}
              />
            )}
            <div className="w-full flex flex-col xl:flex-row gap-5 xl:gap-20 justify-end items-end">
              <Input
                inputLabel={t("readiness-promise")}
                type="range"
                className="w-full xl:w-2/3"
                inputString={promiseReadiness}
                placeholder=""
                setInput={onInputChange}
                placeholderClass="h-12"
              />
              <Button
                onClick={sendReadyness}
                className="w-full xl:w-1/3"
                label={t("save-promise-readiness-btn")}
                type="submit"
              />
            </div>
          </div>

          <section className="w-full">
            {structuredPromises.map((subject) => {
              return (
                <div key={subject.id + "-subject"}>
                  <div
                    className="cursor-help text-xl font-bold font-drserif"
                    title={subject.description}
                  >
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
