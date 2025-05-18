/* eslint-disable react-hooks/exhaustive-deps */
import React, { useState, useEffect, useCallback, useMemo } from "react";
import { usePartiesContext } from "../Parties/PartyStateManager";
import { useRequest } from "@/hooks/use-request";
import { useTranslations } from "next-intl";
import { PromiseAnalysis } from "@/types/politicalParties";
import { AnalysisCard } from "./AnalysisCard";

export const PromiseAnalysisComponentBase = () => {
  const [promiseAnalysis, setPromiseAnalysis] = useState<PromiseAnalysis[]>([]);
  const [expandedAnalysis, setExpandedAnalysis] = useState<Record<string, boolean>>({});

  // Export the memoized component with a display name
  const PromiseAnalysisComponent = React.memo(PromiseAnalysisComponentBase);
  PromiseAnalysisComponent.displayName = "PromiseAnalysisComponent";
  const [isLoading, setIsLoading] = useState(false);
  const [filteredStatus, setFilteredStatus] = useState("all");
  const [searchTerm, setSearchTerm] = useState("");

  const t = useTranslations("promises");
  const { partyChoice, campaignChoice } = usePartiesContext();

  // Memoize the URL to prevent recreating the request on every render
  const requestUrl = useMemo(() => {
    if (!partyChoice?.id || !campaignChoice?.year) return null;
    return `/api/parties/promises/analysis?party_id=${partyChoice.id}&campaign_year=${campaignChoice.year}`;
  }, [partyChoice?.id, campaignChoice?.year]);

  // Request to get promise analysis data
  const { doRequest: getPromiseAnalysis } = useRequest({
    url: requestUrl || "",
    method: "get",
    onSuccess: (data) => {
      setPromiseAnalysis(data.analysis || []);
      setIsLoading(false);
    },
  });

  useEffect(() => {
    if (requestUrl) {
      setIsLoading(true);
      getPromiseAnalysis();
    }
  }, [requestUrl]);

  // Toggle expanded state for an analysis
  const toggleExpand = useCallback((id: number) => {
    setExpandedAnalysis((prev) => ({
      ...prev,
      [id]: !prev[id],
    }));
  }, []);

  // Filter analyses by fulfillment status and search term
  const filteredAnalyses = useMemo(() => {
    return promiseAnalysis.filter((analysis) => {
      const matchesStatus = filteredStatus === "all" || analysis.fulfillment_status === filteredStatus;
      const matchesSearch =
        searchTerm === "" ||
        analysis.promise_text.toLowerCase().includes(searchTerm.toLowerCase()) ||
        analysis.analysis_summary.toLowerCase().includes(searchTerm.toLowerCase());

      return matchesStatus && matchesSearch;
    });
  }, [promiseAnalysis, filteredStatus, searchTerm]);

  const statusCounts = useMemo(() => {
    return promiseAnalysis.reduce(
      (counts, analysis) => {
        const status = analysis.fulfillment_status as "Supporting Evidence" | "Contradictory Evidence";
        counts[status] = (counts[status] || 0) + 1;
        return counts;
      },
      {
        "Supporting Evidence": 0,
        "Contradictory Evidence": 0,
      }
    );
  }, [promiseAnalysis]);

  return (
    <div className="w-full mt-8">
      <h2 className="text-2xl font-bold mb-6 text-drPurple">{t("promise-analysis-title") || "Promise Analysis"}</h2>

      {isLoading ? (
        <div className="flex justify-center py-8">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-drPurple"></div>
        </div>
      ) : promiseAnalysis.length === 0 ? (
        <div className="text-center py-8 bg-gray-50 rounded-lg border border-gray-200">
          <p className="text-gray-500">{t("no-analysis-available") || "No analysis available for this party and campaign."}</p>
        </div>
      ) : (
        <>
          {/* Analysis Filters */}
          <div className="flex flex-col lg:flex-row gap-4 mb-6 justify-between items-center">
            <div className="flex flex-wrap gap-2">
              <button
                onClick={() => setFilteredStatus("all")}
                className={`px-3 py-1 rounded-md text-sm font-medium ${
                  filteredStatus === "all" ? "bg-drPurple text-white" : "bg-gray-100 text-gray-800"
                }`}
              >
                All ({promiseAnalysis.length})
              </button>
              {Object.entries(statusCounts).map(([status, count]) => (
                <button
                  key={status}
                  onClick={() => setFilteredStatus(status)}
                  className={`px-3 py-1 rounded-md text-sm font-medium ${
                    filteredStatus === status ? "bg-drPurple text-white" : "bg-gray-100 text-gray-800"
                  }`}
                >
                  {status} ({count})
                </button>
              ))}
            </div>

            <div className="relative w-full lg:w-64">
              <input
                type="text"
                placeholder={t("search-promises")}
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-drPurple focus:border-drPurple"
              />
              <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
                <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"></path>
                </svg>
              </div>
            </div>
          </div>

          {/* Analysis Cards */}
          <div className="space-y-4">
            {filteredAnalyses.length === 0 ? (
              <div className="text-center py-8 bg-gray-50 rounded-lg border border-gray-200">
                <p className="text-gray-500">{t("no-matching-analysis")}</p>
              </div>
            ) : (
              filteredAnalyses.map((analysis) => (
                <AnalysisCard key={analysis.id} analysis={analysis} isExpanded={!!expandedAnalysis[analysis.id]} onToggleExpand={toggleExpand} />
              ))
            )}
          </div>
        </>
      )}
    </div>
  );
};
