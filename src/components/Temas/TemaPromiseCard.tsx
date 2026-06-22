"use client";
import {  useMemo } from "react";
import { useTranslations } from "next-intl";
import { StatusBadge } from "@/src/components/Promises/StatusBadge";
import { SubjectPromiseEntry } from "@/types/temas";
import { Party, Subject } from "@/types/politicalParties";
import { useRouter } from "@/src/i18n/routing";

interface TemaPromiseCardProps {
  promise: SubjectPromiseEntry;
  party: Party["id"];
  subject: Subject["name"]
}

export const TemaPromiseCard = ({ promise, party, subject }: TemaPromiseCardProps) => {
  const t = useTranslations("temas");
    const route = useRouter()

    const onclickCard = (e: React.MouseEvent<HTMLDivElement>) => {
    e.preventDefault();
    route.push(`/promises?party_id=${party}&subject=${encodeURIComponent(subject)}`);
  };
  


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
      className="rounded-lg border transition-all duration-300 border-gray-200 hover:border-drPurple/50"
      onClick={onclickCard}
    >
      <div className="p-4 cursor-pointer" >
        <div className="flex justify-between items-start gap-3">
          <p className="text-sm font-medium text-gray-900 leading-relaxed flex-1">{promise.promise}</p>
          <div className="flex items-center gap-2 flex-shrink-0">
            <StatusBadge status={overallStatus.type} statusText={overallStatus.text} className="hidden md:flex" />
            
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
    </div>
  );
};
