/* eslint-disable react-hooks/exhaustive-deps */
"use client";
import React, { useState, useEffect, useCallback } from "react";
import { usePartiesContext } from "../Parties/PartyStateManager";
import { useRequest } from "@/hooks/use-request";
import { useTranslations } from "next-intl";
import Image from "next/image";
import { Campaign, Party, PromiseAnalysis } from "@/types/politicalParties";
import Dropdown from "../Dropdown";
import Loading from "../Loading";
import { PromisesWithAnalysisList } from "./PromiseWithAnalysisCard";
import Button from "../Button";
import { useUiContext } from "@/src/context/uiContext";
import { useAuth } from "@/src/context/authContext";
import { DashboardStats } from "./DashboardStats";

export const PromisesView = () => {
  const t = useTranslations("promises");
  const { showToast } = useUiContext();
  const user = useAuth();

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

  const [promiseReadiness, setPromiseReadiness] = useState<string>("50");
  const [showAllParties, setShowAllParties] = useState(false);
  const [analysesByPromise, setAnalysesByPromise] = useState<Record<number, PromiseAnalysis[]>>({});
  const [isLoadingAnalyses, setIsLoadingAnalyses] = useState(false);

  const onInputChange = useCallback((e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const newValue = e.target.value;
    setPromiseReadiness(newValue);
  }, []);

  const { doRequest: sendPromiseReadiness } = useRequest({
    url: `/api/parties/promises/readiness`,
    method: "post",
    onSuccess: () => {
      showToast({
        message: t("readiness-sent"),
        variant: "success",
        duration: 3000,
      });
    },
  });

  const { doRequest: getPromiseReadiness } = useRequest({
    url: `/api/parties/promises/readiness?campaign_id=${campaignChoice?.id}`,
    method: "get",
    onSuccess: (data) => {
      setPromiseReadiness(data.readiness || "0");
    },
  });

  useEffect(() => {
    if (campaignChoice) getPromiseReadiness();
  }, [campaignChoice]);

  // Fetch all analyses when party choice changes
  useEffect(() => {
    if (partyChoice?.id) {
      setIsLoadingAnalyses(true);
      fetch(`/api/parties/promises/all-analyses-by-party?party_id=${partyChoice.id}`)
        .then((res) => res.json())
        .then((data) => {
          if (data.analysis) {
            // Group analyses by promise_id
            const grouped: Record<number, PromiseAnalysis[]> = {};
            data.analysis.forEach((analysis: PromiseAnalysis) => {
              if (!grouped[analysis.promise_id]) {
                grouped[analysis.promise_id] = [];
              }
              grouped[analysis.promise_id].push(analysis);
            });
            setAnalysesByPromise(grouped);
          }
        })
        .catch((err) => console.error("Error fetching all analyses:", err))
        .finally(() => setIsLoadingAnalyses(false));
    }
  }, [partyChoice]);

  const sendReadyness = () => {
    if (!campaignChoice || !user.currentUser) return;
    sendPromiseReadiness({
      readiness_score: promiseReadiness,
      user_id: user.currentUser.id,
      campaign_id: campaignChoice.id,
    });
  };

  const handlePartychoice = (party: Party) => {
    if (party.id === partyChoice?.id) {
      setPartyChoice(undefined);
    } else {
      setPartyChoice(party);
      setShowAllParties(false);
    }
  };

  const displayedParties = showAllParties ? parties : parties.slice(0, 8);

  if (loading || isLoadingAnalyses) {
    return <Loading />;
  }

  return (
    <div className="flex flex-col lg:flex-row gap-6">
       {partyChoice && <DashboardStats partyId={partyChoice?.id || 0} className="flex md:hidden" />}
      <aside className="lg:w-72 flex-shrink-0 hidden md:inline">
        <div className="bg-white rounded-lg shadow-sm border md:border-gray-200 md:p-4 sticky top-4">
          <div className="flex items-center justify-between mb-4">
            <h2 className="font-bold text-contrast text-lg">{t("choose-party")}</h2>
            {parties.length > 8 && (
              <button
                onClick={() => setShowAllParties(!showAllParties)}
                className="text-sm text-drPurple hover:underline"
              >
                {showAllParties ? t("show-less") : t("show-more")}
              </button>
            )}
          </div>
          <div className="space-y-2">
            {displayedParties.map((party) => (
              <button
                key={party.id}
                onClick={() => handlePartychoice(party)}
                className={`w-full flex text-start md:text-center items-center gap-3 p-2 rounded-lg transition-all duration-200 ${
                  partyChoice?.id === party.id
                    ? "bg-drPurple/10 border-2 border-drPurple"
                    : "hover:bg-gray-50 border-2 border-transparent"
                }`}
              >
                {party.logo_url && (
                  <div className="w-10 h-10 flex-shrink-0">
                    <Image
                      src={party.logo_url}
                      width={40}
                      height={40}
                      alt={party.name}
                      className="w-full h-full object-contain"
                    />
                  </div>
                )}
                <span className={`text-sm font-medium ${partyChoice?.id === party.id ? "text-drPurple" : "text-gray-700"}`}>
                  {party.name}
                </span>
              </button>
            ))}
          </div>
        </div>
      </aside>

      <main className="flex-1 min-w-0">
        {partyChoice ? (
          <div className="bg-white rounded-lg shadow-sm md:border md:border-gray-200 md:p-6">
            <DashboardStats partyId={partyChoice?.id || 0} className="hidden md:flex" />
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-gray-200">
              <div className="flex items-center gap-4">
                <button
                  onClick={() => setPartyChoice(undefined)}
                  className="p-2 hover:bg-gray-100 rounded-full transition-colors"
                  title={t("back-to-parties")}
                >
                  <svg className="w-5 h-5 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                  </svg>
                </button>
                {partyChoice.logo_url && (
                  <div className="w-14 h-14">
                    <Image
                      src={partyChoice.logo_url}
                      width={56}
                      height={56}
                      alt={partyChoice.name}
                      className="w-full h-full object-contain"
                    />
                  </div>
                )}
                <div>
                  <h1 className="text-2xl font-bold font-drserif text-drPurple">{partyChoice.name}</h1>
                  {campaignChoice && (
                    <p className="text-sm text-gray-500">{t("campaign")}: {campaignChoice.year}</p>
                  )}
                </div>
              </div>
            </div>

            {campaigns.length > 0 && (
              <div className="py-4 border-b border-gray-200">
                <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
                  <div className="w-full sm:w-auto">
                    <Dropdown
                      items={campaigns}
                      choose={(item) => setCampaignChoice(item as Campaign)}
                      choice={campaignChoice || campaigns[0]}
                    />
                  </div>
                  <div className="w-full sm:w-auto flex gap-3 items-center mt-4 sm:mt-0">
                    <div className="flex-1 sm:flex-none min-w-[200px]">
                      <label className="block text-sm font-medium text-gray-700 mb-1">{t("readiness-promise")}</label>
                      <div className="flex items-center gap-3">
                        <div className="relative flex-1">
                          <input
                            type="range"
                            min="0"
                            max="100"
                            value={promiseReadiness}
                            onChange={onInputChange}
                            className="w-full h-3 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-drPurple"
                          />
                          <div className="flex justify-between text-xs text-gray-400 mt-1">
                            <span>0%</span>
                            <span>50%</span>
                            <span>100%</span>
                          </div>
                        </div>
                        <span className="text-sm font-bold text-drPurple w-12 text-right">{promiseReadiness}%</span>
                      </div>
                    </div>
                    <Button onClick={sendReadyness} label={t("save-promise-readiness-btn")} type="submit" />
                  </div>
                </div>
              </div>
            )}

            <div className="py-6">
              <h2 className="text-xl font-bold text-contrast mb-4">{t("promises-with-analysis")}</h2>

              {structuredPromises.length > 0 ? (
                <PromisesWithAnalysisList structuredPromises={structuredPromises} analysesByPromise={analysesByPromise} />
              ) : (
                <div className="text-center py-12 bg-gray-50 rounded-lg">
                  <p className="text-gray-500">{t("no-promises-available")}</p>
                </div>
              )}
            </div>
          </div>
        ) : (
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <div className="text-center mb-8">
              <h2 className="text-2xl font-bold font-drserif text-drPurple mb-2">{t("select-party-title")}</h2>
              <p className="text-gray-500">{t("select-party-description")}</p>
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-4 gap-4">
              {displayedParties.map((party) => (
                <button
                  key={party.id}
                  onClick={() => handlePartychoice(party)}
                  className="flex flex-col items-center p-4 bg-gray-50 hover:bg-drPurple/10 rounded-lg transition-all duration-200 border-2 border-transparent hover:border-drPurple"
                >
                  {party.logo_url && (
                    <div className="w-16 h-16 mb-3">
                      <Image
                        src={party.logo_url}
                        width={64}
                        height={64}
                        alt={party.name}
                        className="w-full h-full object-contain"
                      />
                    </div>
                  )}
                  <span className="text-sm font-medium text-gray-700 text-center">{party.name}</span>
                </button>
              ))}
            </div>
            {parties.length > 8 && (
              <div className="text-center mt-6">
                <button
                  onClick={() => setShowAllParties(!showAllParties)}
                  className="inline-flex items-center gap-2 px-4 py-2 text-drPurple hover:bg-drPurple/10 rounded-lg transition-colors"
                >
                  {showAllParties ? (
                    <>
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 15l7-7 7 7" />
                      </svg>
                      {t("show-less-parties")}
                    </>
                  ) : (
                    <>
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                      </svg>
                      {t("show-all-parties", { count: parties.length - 8 })}
                    </>
                  )}
                </button>
              </div>
            )}
          </div>
        )}
      </main>
    </div>
  );
};
