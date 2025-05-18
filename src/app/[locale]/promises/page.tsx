"use client";
import React, { useState } from "react";
import { PartiesProvider } from "@/src/components/Parties/PartyStateManager";
import { PartyChoiceComponent } from "@/src/components/Promises/PartyChoiceComponent";
import { useTranslations } from "next-intl";
import { PromiseAnalysisComponentBase } from "@/src/components/Promises/PromiseAnalysusComponent";

export default function Promises() {
  const [showPromiseAnalysis, setShowPromiseAnalysis] = useState(false);

  const t = useTranslations("promises");

  return (
    <div className="flex flex-col w-full h-full justify-center items-center mb-24 md:mb-5 min-h-96 font-drsans">
      <main className="flex w-full flex-col items-center justify-center">
        <PartiesProvider structured>
          <div className="w-full bg-white shadow-sm rounded-lg p-4 md:p-6">
            <nav className="flex border-b border-gray-200 mb-6">
              <button
                onClick={() => setShowPromiseAnalysis(false)}
                className={`py-4 px-6 text-center border-b-2 font-medium text-sm ${
                  !showPromiseAnalysis
                    ? "border-drPurple text-drPurple"
                    : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
                }`}
              >
                {t("party_promises")}
              </button>
              <button
                onClick={() => setShowPromiseAnalysis(true)}
                className={`py-4 px-6 text-center border-b-2 font-medium text-sm ${
                  showPromiseAnalysis ? "border-drPurple text-drPurple" : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
                }`}
              >
                {t("party_analysis")}
              </button>
            </nav>

            {!showPromiseAnalysis && <PartyChoiceComponent />}

            {showPromiseAnalysis && <PromiseAnalysisComponentBase />}
          </div>
        </PartiesProvider>
      </main>
    </div>
  );
}
