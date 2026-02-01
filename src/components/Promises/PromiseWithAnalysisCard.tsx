/* eslint-disable react-hooks/exhaustive-deps */
"use client";
import React, { useCallback, useState, useEffect, useMemo } from "react";
import { PartyPromise, PromiseAnalysis } from "@/types/politicalParties";
import { StatusBadge } from "./StatusBadge";
import Link from "next/link";
import { useParams } from "next/navigation";
import { useTranslations } from "next-intl";
import { useRequest } from "@/hooks/use-request";

interface PromiseWithAnalysisCardProps {
  promise: PartyPromise;
  partyId: number;
}

interface ExtendedAnalysis extends PromiseAnalysis {
  proposals?: {
    id: number;
    title: string;
    votes_for: number;
    votes_against: number;
    expedient_text: string;
    url: string;
  };
}

export const PromiseWithAnalysisCard = ({ promise, partyId }: PromiseWithAnalysisCardProps) => {
  const [isExpanded, setIsExpanded] = useState(false);
  const [allAnalyses, setAllAnalyses] = useState<ExtendedAnalysis[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const t = useTranslations("promises");
  const { locale } = useParams();

  const toggleExpand = useCallback(() => {
    setIsExpanded((prev) => !prev);
  }, []);

  const requestUrl = `/api/parties/promises/all-analysis?party_id=${partyId}&promise_id=${promise.id}`;

  const { doRequest: getAllAnalyses } = useRequest({
    url: requestUrl,
    method: "get",
    onSuccess: (data) => {
      if (data.analysis) {
        setAllAnalyses(data.analysis);
      }
      setIsLoading(false);
    },
  });

  useEffect(() => {
    if (isExpanded && allAnalyses.length === 0) {
      setIsLoading(true);
      getAllAnalyses();
    }
  }, [isExpanded]);

  // Group analyses by status
  const { supportingVotes, contradictingVotes, partialVotes } = useMemo(() => {
    const supporting = allAnalyses.filter((a) => a.fulfillment_status === "Supporting Evidence");
    const contradicting = allAnalyses.filter((a) => a.fulfillment_status === "Contradictory Evidence");
    const partial = allAnalyses.filter((a) => a.fulfillment_status === "Partial/Indirect Evidence");
    return { supportingVotes: supporting, contradictingVotes: contradicting, partialVotes: partial };
  }, [allAnalyses]);

  const overallStatus = useMemo(() => {
    if (supportingVotes.length > 0 && contradictingVotes.length === 0) {
      return { text: t("supporting"), type: "Supporting Evidence" as const };
    }
    if (contradictingVotes.length > 0 && supportingVotes.length === 0) {
      return { text: t("contradictory"), type: "Contradictory Evidence" as const };
    }
    if (supportingVotes.length > 0 || contradictingVotes.length > 0) {
      return { text: t("partial"), type: "Partial/Indirect Evidence" as const };
    }
    return null;
  }, [supportingVotes, contradictingVotes, t]);

  const totalVotes = supportingVotes.length + contradictingVotes.length + partialVotes.length;

  return (
    <div
      className={`bg-white rounded-lg border transition-all duration-300 ${
        isExpanded ? "border-drPurple shadow-md" : "border-gray-200 hover:border-drPurple/50"
      }`}
    >
      {/* Promise Header - Always Visible */}
      <div className="p-4 cursor-pointer" onClick={toggleExpand}>
        <div className="flex justify-between items-start gap-3">
          <div className="flex-1">
            <p className="text-base font-medium text-gray-900 leading-relaxed">{promise.promise}</p>
          </div>
          <div className="flex items-center gap-2 flex-shrink-0">
            {overallStatus && <StatusBadge status={overallStatus.type} statusText={overallStatus.text} />}
            <svg
              className={`w-5 h-5 text-gray-400 transform transition-transform duration-300 flex-shrink-0 ${
                isExpanded ? "rotate-180" : ""
              }`}
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" />
            </svg>
          </div>
        </div>
        {/* Vote counts summary */}
        {totalVotes > 0 && (
          <div className="flex gap-4 mt-3">
            {supportingVotes.length > 0 && (
              <span className="inline-flex items-center gap-1.5 text-sm text-green-600 bg-green-50 px-2 py-1 rounded-full">
                <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                  <path
                    fillRule="evenodd"
                    d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                    clipRule="evenodd"
                  />
                </svg>
                <span className="font-medium">{supportingVotes.length}</span>
                <span className="text-green-700">{t("votes-in-favor")}</span>
              </span>
            )}
            {contradictingVotes.length > 0 && (
              <span className="inline-flex items-center gap-1.5 text-sm text-red-600 bg-red-50 px-2 py-1 rounded-full">
                <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                  <path
                    fillRule="evenodd"
                    d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z"
                    clipRule="evenodd"
                  />
                </svg>
                <span className="font-medium">{contradictingVotes.length}</span>
                <span className="text-red-700">{t("votes-against")}</span>
              </span>
            )}
            {partialVotes.length > 0 && (
              <span className="inline-flex items-center gap-1.5 text-sm text-amber-600 bg-amber-50 px-2 py-1 rounded-full">
                <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                  <path
                    fillRule="evenodd"
                    d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-12a1 1 0 10-2 0v4a1 1 0 00.293.707l2.828 2.829a1 1 0 101.415-1.415L11 9.586V6z"
                    clipRule="evenodd"
                  />
                </svg>
                <span className="font-medium">{partialVotes.length}</span>
                <span className="text-amber-700">{t("votes-partial")}</span>
              </span>
            )}
          </div>
        )}
      </div>

      {/* Analysis Content - Expandable */}
      <div
        className={`transition-all duration-300 ease-in-out overflow-hidden ${
          isExpanded ? "max-h-[2000px] opacity-100" : "max-h-0 opacity-0"
        }`}
      >
        <div className="px-4 pb-4">
          {isLoading ? (
            <div className="flex justify-center py-4">
              <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-drPurple"></div>
            </div>
          ) : allAnalyses.length > 0 ? (
            <div className="space-y-4">
              {/* Supporting Evidence Section */}
              {supportingVotes.length > 0 && (
                <div className="bg-green-50 rounded-lg p-4 border border-green-200">
                  <h4 className="font-semibold text-green-800 text-sm uppercase tracking-wide mb-3 flex items-center gap-2">
                    <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                      <path
                        fillRule="evenodd"
                        d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                        clipRule="evenodd"
                      />
                    </svg>
                    {t("votes-supporting-promise")} ({supportingVotes.length})
                  </h4>
                  <div className="space-y-3">
                    {supportingVotes.map((analysis) => (
                      <AnalysisItem key={analysis.id} analysis={analysis} locale={locale as string} />
                    ))}
                  </div>
                </div>
              )}

              {/* Contradictory Evidence Section */}
              {contradictingVotes.length > 0 && (
                <div className="bg-red-50 rounded-lg p-4 border border-red-200">
                  <h4 className="font-semibold text-red-800 text-sm uppercase tracking-wide mb-3 flex items-center gap-2">
                    <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                      <path
                        fillRule="evenodd"
                        d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z"
                        clipRule="evenodd"
                      />
                    </svg>
                    {t("votes-contradicting-promise")} ({contradictingVotes.length})
                  </h4>
                  <div className="space-y-3">
                    {contradictingVotes.map((analysis) => (
                      <AnalysisItem key={analysis.id} analysis={analysis} locale={locale as string} />
                    ))}
                  </div>
                </div>
              )}

              {/* Partial Evidence Section */}
              {partialVotes.length > 0 && (
                <div className="bg-amber-50 rounded-lg p-4 border border-amber-200">
                  <h4 className="font-semibold text-amber-800 text-sm uppercase tracking-wide mb-3 flex items-center gap-2">
                    <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                      <path
                        fillRule="evenodd"
                        d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-12a1 1 0 10-2 0v4a1 1 0 00.293.707l2.828 2.829a1 1 0 101.415-1.415L11 9.586V6z"
                        clipRule="evenodd"
                      />
                    </svg>
                    {t("votes-partial-promise")} ({partialVotes.length})
                  </h4>
                  <div className="space-y-3">
                    {partialVotes.map((analysis) => (
                      <AnalysisItem key={analysis.id} analysis={analysis} locale={locale as string} />
                    ))}
                  </div>
                </div>
              )}
            </div>
          ) : (
            <div className="bg-gray-50 rounded-lg p-4 text-center border border-gray-200">
              <p className="text-gray-500 text-sm">{t("no-analysis-yet")}</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

// Individual analysis item component
const AnalysisItem = ({ analysis, locale }: { analysis: ExtendedAnalysis; locale: string }) => {

  return (
    <div className="bg-white rounded-lg p-4 shadow-sm border border-gray-100">
      <p className="text-gray-700 text-sm mb-3 leading-relaxed">{analysis.analysis_summary}</p>
      {analysis.proposals && (
        <div className="flex items-center justify-between">
          <Link
            href={`/${locale}/parliament/${analysis.proposal_id}`}
            className="inline-flex items-center gap-2 text-sm text-drPurple hover:underline"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
            </svg>
            <span className="font-medium truncate max-w-[250px]">{analysis.proposals.title}</span>
          </Link>
          <div className="flex items-center gap-3 text-xs text-gray-500">
            <span className="flex items-center gap-1 text-green-600">
              <svg className="w-3.5 h-3.5" fill="currentColor" viewBox="0 0 20 20">
                <path
                  fillRule="evenodd"
                  d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                  clipRule="evenodd"
                />
              </svg>
              {analysis.proposals.votes_for}
            </span>
            <span className="flex items-center gap-1 text-red-600">
              <svg className="w-3.5 h-3.5" fill="currentColor" viewBox="0 0 20 20">
                <path
                  fillRule="evenodd"
                  d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z"
                  clipRule="evenodd"
                />
              </svg>
              {analysis.proposals.votes_against}
            </span>
          </div>
        </div>
      )}
    </div>
  );
};

// Component to show structured promises grouped by subject with analysis
interface PromisesWithAnalysisListProps {
  structuredPromises: {
    id: number;
    name: string;
    description: string;
    promises: PartyPromise[];
  }[];
  partyId: number;
}

export const PromisesWithAnalysisList = ({ structuredPromises, partyId }: PromisesWithAnalysisListProps) => {

  return (
    <div className="space-y-6">
      {structuredPromises.map((subject) => (
        <div key={subject.id} className="animate-fadeIn">
          <div className="flex items-center gap-2 mb-3">
            <h3 className="text-lg font-bold font-drserif text-drPurple">{subject.name}</h3>
            <div
              className="w-5 h-5 text-gray-400 cursor-help flex-shrink-0"
              title={subject.description}
              tabIndex={0}
              role="tooltip"
            >
              <svg fill="currentColor" viewBox="0 0 20 20">
                <path
                  fillRule="evenodd"
                  d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z"
                  clipRule="evenodd"
                />
              </svg>
            </div>
          </div>
          <div className="space-y-3 ml-2 border-l-2 border-drPurple/20 pl-4">
            {subject.promises.map((promise) => (
              <PromiseWithAnalysisCard key={promise.id} promise={promise} partyId={partyId} />
            ))}
          </div>
        </div>
      ))}
    </div>
  );
};
