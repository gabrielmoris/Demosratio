"use client";
import React, { useEffect, useState } from "react";
import { useTranslations } from "next-intl";
import { useParams } from "next/navigation";
import Loading from "@/src/components/Loading";
import { Link } from "@/src/i18n/routing";
import Image from "next/image";
import { TemaPromiseCard } from "@/src/components/Temas/TemaPromiseCard";
import { SubjectDeepDive, SubjectPartyData, SubjectProposal } from "@/types/temas";
import { formatDate } from "@/lib/helpers/dateFormatters";
import { Subject } from "@/types/politicalParties";

export default function TemaDeepDivePage() {
  const t = useTranslations("temas");
  const { id } = useParams();
  const [data, setData] = useState<SubjectDeepDive | null>(null);
  const [loading, setLoading] = useState(true);
  const [fetchError, setFetchError] = useState(false);

  useEffect(() => {
    if (!id) return;
    fetch(`/api/temas/${id}`)
      .then((res) => {
        if (!res.ok) throw new Error("Not found");
        return res.json();
      })
      .then((d: SubjectDeepDive) => {
        setData(d);
        setLoading(false);
      })
      .catch(() => {
        setFetchError(true);
        setLoading(false);
      });
  }, [id]);

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen gap-4">
        <Loading />
        <p className="text-drgray text-sm">{t("loading")}</p>
      </div>
    );
  }

  if (fetchError || !data) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen gap-4">
        <p className="text-drerror text-sm">{t("error")}</p>
        <Link href="/temas" className="text-drPurple text-sm hover:opacity-60 duration-300">
          ← {t("back")}
        </Link>
      </div>
    );
  }

  const { subject, stats, parties, relatedProposals } = data;
  const total = stats.totalPromises || 1;

  return (
    <main className="flex flex-col gap-8 pb-24 md:pb-8 font-drsans w-full max-w-4xl mx-auto">
      <div className="pt-4">
        <Link href="/temas" className="text-drPurple text-sm hover:opacity-60 duration-300">
          ← {t("back")}
        </Link>
      </div>

      <div className="flex flex-col gap-2">
        <h1 className="text-2xl font-bold font-drserif text-contrast">{subject.name}</h1>
        <p className="text-drgray text-sm max-w-2xl">{subject.description}</p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <StatBox value={stats.totalPromises} label={t("total-promises")} color="purple" />
        <StatBox value={stats.totalParties} label={t("parties-label")} color="gray" />
        <StatBox value={stats.totalVotes} label={t("votes-label")} color="gray" />
        <StatBox value={stats.supporting} label={t("supporting")} color="green" />
      </div>

      {/* Fulfillment distribution bar */}
      {stats.totalPromises > 0 && (
        <div className="bg-white border border-drlight rounded-lg p-4">
          <p className="text-sm font-semibold text-contrast mb-3">{t("stats-title")}</p>
          <div className="flex h-4 rounded-full overflow-hidden gap-0.5">
            {stats.supporting > 0 && (
              <div
                className="bg-green-400 rounded-l-full"
                style={{ width: `${(stats.supporting / total) * 100}%` }}
                title={`${t("supporting")}: ${stats.supporting}`}
              />
            )}
            {stats.partial > 0 && (
              <div
                className="bg-amber-400"
                style={{ width: `${(stats.partial / total) * 100}%` }}
                title={`${t("partial")}: ${stats.partial}`}
              />
            )}
            {stats.contradictory > 0 && (
              <div
                className="bg-red-400"
                style={{ width: `${(stats.contradictory / total) * 100}%` }}
                title={`${t("contradictory")}: ${stats.contradictory}`}
              />
            )}
            {stats.notAnalyzed > 0 && (
              <div
                className="bg-gray-200 rounded-r-full"
                style={{ width: `${(stats.notAnalyzed / total) * 100}%` }}
                title={`${t("not-analyzed")}: ${stats.notAnalyzed}`}
              />
            )}
          </div>
          <div className="flex flex-wrap gap-4 mt-3 text-xs text-drgray">
            {stats.supporting > 0 && (
              <span className="flex items-center gap-1.5">
                <span className="w-3 h-3 rounded-full bg-green-400 inline-block" />
                {t("supporting")} ({stats.supporting})
              </span>
            )}
            {stats.partial > 0 && (
              <span className="flex items-center gap-1.5">
                <span className="w-3 h-3 rounded-full bg-amber-400 inline-block" />
                {t("partial")} ({stats.partial})
              </span>
            )}
            {stats.contradictory > 0 && (
              <span className="flex items-center gap-1.5">
                <span className="w-3 h-3 rounded-full bg-red-400 inline-block" />
                {t("contradictory")} ({stats.contradictory})
              </span>
            )}
            {stats.notAnalyzed > 0 && (
              <span className="flex items-center gap-1.5">
                <span className="w-3 h-3 rounded-full bg-gray-300 inline-block" />
                {t("not-analyzed")} ({stats.notAnalyzed})
              </span>
            )}
          </div>
        </div>
      )}

      {/* Promises by party */}
      <section>
        <h2 className="text-xl font-bold font-drserif text-contrast mb-4">{t("by-party")}</h2>
        {parties.length === 0 ? (
          <div className="bg-gray-50 rounded-lg p-8 text-center border border-gray-200">
            <p className="text-drgray text-sm">{t("no-promises")}</p>
          </div>
        ) : (
          <div className="space-y-6">
            {parties.map((partyData) => (
              <PartySection key={partyData.party_id} partyData={partyData} subject={subject.name} />
            ))}
          </div>
        )}
      </section>

      {/* Related votes */}
      {relatedProposals.length > 0 && (
        <section>
          <h2 className="text-xl font-bold font-drserif text-contrast mb-4">{t("related-votes")}</h2>
          <div className="space-y-3">
            {relatedProposals.map((proposal) => (
              <RelatedVoteCard key={proposal.id} proposal={proposal} />
            ))}
          </div>
        </section>
      )}
    </main>
  );
}

function StatBox({ value, label, color }: { value: number; label: string; color: "purple" | "green" | "gray" }) {
  const colorStyles = {
    purple: "bg-drlight text-drPurple",
    green: "bg-green-50 text-green-700",
    gray: "bg-gray-50 text-gray-700",
  };
  return (
    <div className={`${colorStyles[color]} rounded-lg p-4 flex flex-col gap-1`}>
      <span className="text-2xl font-bold">{value}</span>
      <span className="text-xs font-medium opacity-80">{label}</span>
    </div>
  );
}

function PartySection({ partyData, subject }: { partyData: SubjectPartyData , subject: Subject["name"] }) {
  const [collapsed, setCollapsed] = useState(false);

  return (
    <div className="bg-white border border-gray-200 rounded-lg overflow-hidden">
      <button
        onClick={() => setCollapsed((v: boolean) => !v)}
        className="w-full flex items-center gap-3 p-4 hover:bg-gray-50 transition-colors text-left"
      >
        {partyData.party_logo && (
          <div className="w-10 h-10 flex-shrink-0">
            <Image
              src={partyData.party_logo}
              width={40}
              height={40}
              alt={partyData.party_name}
              className="w-full h-full object-contain"
              onError={(e: React.SyntheticEvent<HTMLImageElement>) => {
                (e.target as HTMLImageElement).style.display = "none";
              }}
            />
          </div>
        )}
        <div className="flex-1 min-w-0">
          <p className="font-bold text-contrast text-base">{partyData.party_name}</p>
          <p className="text-xs text-drgray">{partyData.promises.length} promesas</p>
        </div>
        <svg
          className={`w-5 h-5 text-gray-400 transition-transform duration-300 flex-shrink-0 ${collapsed ? "rotate-180" : ""}`}
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
        </svg>
      </button>

      <div
        className={`transition-all duration-300 ease-in-out overflow-hidden ${
          collapsed ? "max-h-0 opacity-0" : "max-h-[9999px] opacity-100"
        }`}
      >
        <div className="px-4 pb-4 space-y-3 border-t border-gray-100 pt-3">
          {partyData.promises.map((promise) => (
            <TemaPromiseCard key={promise.id} promise={promise} party={partyData.party_id}  subject={subject} />
          ))}
        </div>
      </div>
    </div>
  );
}

function RelatedVoteCard({ proposal }: { proposal: SubjectProposal; }) {
  const total = proposal.votes_for + proposal.votes_against + proposal.abstentions + proposal.no_vote || 1;

  return (
    <Link
      href={`/parliament/${proposal.id}`}
      className="flex flex-col gap-3 bg-white border border-drPurple/20 rounded-lg p-4 hover:border-drPurple hover:shadow-sm transition-all duration-200 group"
    >
      <div className="flex items-start justify-between gap-3">
        <p className="text-sm font-semibold text-contrast group-hover:text-drPurple transition-colors line-clamp-2 flex-1">
          {proposal.title}
        </p>
      </div>

      <div className="flex h-2 rounded-full overflow-hidden bg-gray-100">
        <div className="bg-green-400" style={{ width: `${(proposal.votes_for / total) * 100}%` }} />
        <div className="bg-red-400" style={{ width: `${(proposal.votes_against / total) * 100}%` }} />
        <div className="bg-amber-300" style={{ width: `${(proposal.abstentions / total) * 100}%` }} />
      </div>

      <div className="flex items-center justify-between text-xs text-drgray">
        <span className="flex gap-3">
          <span className="text-green-600 font-medium">{proposal.votes_for} ✓</span>
          <span className="text-red-600 font-medium">{proposal.votes_against} ✗</span>
          <span className="text-amber-600">{proposal.abstentions} abs</span>
        </span>
        <span>{formatDate(proposal.date)}</span>
      </div>
    </Link>
  );
}
