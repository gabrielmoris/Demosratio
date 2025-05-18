import { FulfillmentStatus, PromiseAnalysis } from "@/types/politicalParties";
import { useTranslations } from "next-intl";
import Link from "next/link";
import React from "react";
import { StatusBadge } from "./StatusBadge";
import { useParams } from "next/navigation";

// Define the analysis card component function before memoizing it
const AnalysisCardBase = ({
  analysis,
  isExpanded,
  onToggleExpand,
}: {
  analysis: PromiseAnalysis;
  isExpanded: boolean;
  onToggleExpand: (id: number) => void;
}) => {
  const t = useTranslations("promises");
  const { locale } = useParams();

  const fullfillmentStatus = (status: FulfillmentStatus) => {
    switch (status) {
      case "Supporting Evidence":
        return t("supporting");
      case "Contradictory Evidence":
        return t("contradictory");
      case "Partial/Indirect Evidence":
        return t("partial");
      default:
        return status;
    }
  };

  return (
    <div className="bg-white rounded-lg border border-gray-200 overflow-hidden shadow-sm hover:shadow-md transition-shadow duration-300">
      <div className="p-5">
        <div className="flex justify-between items-start mb-3">
          <div className="flex-1">
            <StatusBadge status={analysis.fulfillment_status} statusText={fullfillmentStatus(analysis.fulfillment_status)} />
          </div>
          <button onClick={() => onToggleExpand(analysis.id)} className="ml-2 p-1 rounded-full hover:bg-gray-100">
            <svg
              className={`w-6 h-6 text-gray-500 transform transition-transform ${isExpanded ? "rotate-180" : ""}`}
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7"></path>
            </svg>
          </button>
        </div>

        <p className="text-md font-semibold leading-tight font-drserif text-contrast mb-1">{analysis.promise_text}</p>

        <div className={`transition-all duration-300 ease-in-out ${isExpanded ? "max-h-96 opacity-100" : "max-h-0 opacity-0 overflow-hidden"}`}>
          <div className="pt-4 border-t border-gray-200">
            <h4 className="font-medium underline text-gray-900 mb-2">{t("analysis") || "Analysis"}</h4>
            <p className="text-gray-700">{analysis.analysis_summary}</p>
          </div>
        </div>

        <div className="flex justify-between items-center mt-4">
          <div className="text-sm text-gray-500">
            {t("party")}: <span className="font-medium">{analysis.party_name}</span> • {t("campaign")}:{" "}
            <span className="font-medium">{analysis.campaign_year}</span>
          </div>
          <Link
            href={`/${locale}/parliament/${analysis.proposal_id}`}
            className="inline-flex items-center px-3 py-1.5 bg-drPurple text-white text-sm font-medium rounded-md hover:bg-opacity-90 transition-colors"
          >
            <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 9l3 3m0 0l-3 3m3-3H8m13 0a9 9 0 11-18 0 9 9 0 0118 0z"></path>
            </svg>
            {t("view-proposal") || "View Proposal"}
          </Link>
        </div>
      </div>
    </div>
  );
};

export const AnalysisCard = React.memo(AnalysisCardBase);
AnalysisCard.displayName = "AnalysisCard";
