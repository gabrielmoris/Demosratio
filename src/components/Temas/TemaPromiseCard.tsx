"use client";
import { useState, useMemo, useCallback } from "react";
import { useTranslations } from "next-intl";
import { useParams } from "next/navigation";
import Link from "next/link";
import { StatusBadge } from "@/src/components/Promises/StatusBadge";
import { SubjectPromiseEntry } from "@/types/temas";
import { PromiseAnalysis } from "@/types/politicalParties";

interface TemaPromiseCardProps {
  promise: SubjectPromiseEntry;
}

const colorConfig = {
  green: { bg: "bg-green-50", border: "border-green-200", heading: "text-green-800", item: "bg-white border-green-100" },
  red: { bg: "bg-red-50", border: "border-red-200", heading: "text-red-800", item: "bg-white border-red-100" },
  amber: { bg: "bg-amber-50", border: "border-amber-200", heading: "text-amber-800", item: "bg-white border-amber-100" },
};

const AnalysisGroup = ({
  analyses,
  color,
  label,
  locale,
  viewVoteLabel,
}: {
  analyses: PromiseAnalysis[];
  color: "green" | "red" | "amber";
  label: string;
  locale: string;
  viewVoteLabel: string;
}) => {
  const c = colorConfig[color];
  return (
    <div className={`${c.bg} ${c.border} border rounded-lg p-3`}>
      <p className={`${c.heading} text-xs font-semibold uppercase tracking-wide mb-2`}>
        {label} ({analyses.length})
      </p>
      <div className="space-y-2">
        {analyses.map((analysis) => (
          <div key={analysis.id} className={`${c.item} border rounded p-3`}>
            <p className="text-sm text-gray-700 mb-2 leading-relaxed">{analysis.analysis_summary}</p>
            <Link
              href={`/${locale}/parliament/${analysis.proposal_id}`}
              className="inline-flex items-center gap-1 text-xs text-drPurple hover:underline"
            >
              <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
              {viewVoteLabel}
            </Link>
          </div>
        ))}
      </div>
    </div>
  );
};

export const TemaPromiseCard = ({ promise }: TemaPromiseCardProps) => {
  const [isExpanded, setIsExpanded] = useState(false);
  const t = useTranslations("temas");
  const { locale } = useParams();

  const toggleExpand = useCallback(() => setIsExpanded((prev: boolean) => !prev), []);

  const { supportingVotes, contradictingVotes, partialVotes } = useMemo(() => {
    const supporting = promise.analyses.filter((a) => a.fulfillment_status === "Supporting Evidence");
    const contradicting = promise.analyses.filter((a) => a.fulfillment_status === "Contradictory Evidence");
    const partial = promise.analyses.filter((a) => a.fulfillment_status === "Partial/Indirect Evidence");
    return { supportingVotes: supporting, contradictingVotes: contradicting, partialVotes: partial };
  }, [promise.analyses]);

  const overallStatus = useMemo(() => {
    if (promise.analyses.length === 0) return { text: t("not-analyzed"), type: "Contradictory Evidence" as const };
    if (supportingVotes.length > 0 && contradictingVotes.length > 0) return { text: t("partial"), type: "Partial/Indirect Evidence" as const };
    if (supportingVotes.length > 0) return { text: t("supporting"), type: "Supporting Evidence" as const };
    if (contradictingVotes.length > 0) return { text: t("contradictory"), type: "Contradictory Evidence" as const };
    return { text: t("partial"), type: "Partial/Indirect Evidence" as const };
  }, [promise.analyses.length, supportingVotes, contradictingVotes, t]);

  return (
    <div
      className={`rounded-lg border transition-all duration-300 ${
        isExpanded ? "border-drPurple shadow-sm" : "border-gray-200 hover:border-drPurple/50"
      }`}
    >
      <div className="p-4 cursor-pointer" onClick={toggleExpand}>
        <div className="flex justify-between items-start gap-3">
          <p className="text-sm font-medium text-gray-900 leading-relaxed flex-1">{promise.promise}</p>
          <div className="flex items-center gap-2 flex-shrink-0">
            <StatusBadge status={overallStatus.type} statusText={overallStatus.text} className="hidden md:flex" />
            <svg
              className={`w-5 h-5 text-gray-400 transition-transform duration-300 flex-shrink-0 ${isExpanded ? "rotate-180" : ""}`}
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
            </svg>
          </div>
        </div>

        <div className="flex flex-wrap gap-2 mt-3">
          {promise.campaign_year > 0 && (
            <span className="text-xs text-drPurple bg-drlight px-2 py-0.5 rounded-full">
              {t("campaign-year")} {promise.campaign_year}
            </span>
          )}
          {supportingVotes.length > 0 && (
            <span className="inline-flex items-center gap-1 text-xs text-green-700 bg-green-50 px-2 py-0.5 rounded-full">
              <span className="font-semibold">{supportingVotes.length}</span> {t("supporting")}
            </span>
          )}
          {contradictingVotes.length > 0 && (
            <span className="inline-flex items-center gap-1 text-xs text-red-700 bg-red-50 px-2 py-0.5 rounded-full">
              <span className="font-semibold">{contradictingVotes.length}</span> {t("contradictory")}
            </span>
          )}
          {partialVotes.length > 0 && (
            <span className="inline-flex items-center gap-1 text-xs text-amber-700 bg-amber-50 px-2 py-0.5 rounded-full">
              <span className="font-semibold">{partialVotes.length}</span> {t("partial")}
            </span>
          )}
          {promise.analyses.length === 0 && (
            <span className="text-xs text-gray-500 bg-gray-100 px-2 py-0.5 rounded-full">{t("not-analyzed")}</span>
          )}
        </div>
      </div>

      <div
        className={`transition-all duration-300 ease-in-out overflow-hidden ${
          isExpanded ? "max-h-[2000px] opacity-100" : "max-h-0 opacity-0"
        }`}
      >
        <div className="px-4 pb-4 space-y-3">
          {promise.analyses.length > 0 ? (
            <>
              {supportingVotes.length > 0 && (
                <AnalysisGroup
                  analyses={supportingVotes}
                  color="green"
                  label={t("votes-supporting-promise")}
                  locale={locale as string}
                  viewVoteLabel={t("view-vote")}
                />
              )}
              {contradictingVotes.length > 0 && (
                <AnalysisGroup
                  analyses={contradictingVotes}
                  color="red"
                  label={t("votes-contradicting-promise")}
                  locale={locale as string}
                  viewVoteLabel={t("view-vote")}
                />
              )}
              {partialVotes.length > 0 && (
                <AnalysisGroup
                  analyses={partialVotes}
                  color="amber"
                  label={t("votes-partial-promise")}
                  locale={locale as string}
                  viewVoteLabel={t("view-vote")}
                />
              )}
            </>
          ) : (
            <div className="bg-gray-50 rounded-lg p-4 text-center border border-gray-200">
              <p className="text-gray-500 text-sm">{t("no-related-votes")}</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
