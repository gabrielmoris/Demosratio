"use client";
import { useRequest } from "@/hooks/use-request";
import ChartVotes from "@/src/components/ChartVotes";
import Loading from "@/src/components/Loading";
import { Proposal, RelatedPromise } from "@/types/proposal";
import Image from "next/image";
import Link from "next/link";
import { useTranslations } from "next-intl";
import { useParams } from "next/navigation";
import { useEffect, useMemo, useState } from "react";
import { LiKesAndDislikes } from "@/types/likesAndDislikes";
import { useAuth } from "@/src/context/authContext";
import { useUiContext } from "@/src/context/uiContext";
import { formatDate } from "@/lib/helpers/dateFormatters";
import { Logger } from "tslog";

const log = new Logger();

// Maps the numeric prefix of a Spanish congress expedient code to a human-readable label.
// Covers the most common types in Legislatura XV; unknown codes are silently ignored.
const PROPOSAL_TYPE_MAP: Record<string, string> = {
  "110": "Proyecto de Ley",
  "121": "Proposición de Ley",
  "122": "Proposición no de Ley",
  "125": "Moción",
  "132": "Pregunta Oral",
  "161": "Pregunta Oral al Gobierno",
  "180": "Interpelación Urgente",
};

function getProposalType(expedientText: string): string | null {
  const code = expedientText?.split("/")?.[0];
  return PROPOSAL_TYPE_MAP[code] ?? null;
}

const STATUS_STYLES = {
  "Supporting Evidence": {
    container: "bg-green-50 border-green-200",
    label: "text-green-800",
    badge: "bg-green-100 text-green-700",
  },
  "Contradictory Evidence": {
    container: "bg-red-50 border-red-200",
    label: "text-red-800",
    badge: "bg-red-100 text-red-700",
  },
  "Partial/Indirect Evidence": {
    container: "bg-amber-50 border-amber-200",
    label: "text-amber-800",
    badge: "bg-amber-100 text-amber-700",
  },
} as const;

const STATUS_LABEL_KEYS = {
  "Supporting Evidence": "status-supporting",
  "Contradictory Evidence": "status-contradicting",
  "Partial/Indirect Evidence": "status-partial",
} as const;

export default function VotePage() {
  const t = useTranslations("votepage");
  const params = useParams();
  const user = useAuth();
  const { showToast } = useUiContext();
  const id = params.id;

  const [rawVoteResults, setRawVoteResults] = useState<Proposal>();
  const [isFetching, setIsFetching] = useState<boolean>();
  const [rawLikesInfo, setRawLikesInfo] = useState<LiKesAndDislikes>({
    likes: 0,
    dislikes: 0,
    proposal_id: Number(params.id),
  });
  const [rawUserLikes, setRawUserLikes] = useState<LiKesAndDislikes>({
    likes: 0,
    dislikes: 0,
    proposal_id: Number(params.id),
  });

  const voteResults = useMemo(() => rawVoteResults, [rawVoteResults]);
  const likesInfo = useMemo(() => rawLikesInfo, [rawLikesInfo]);
  const userLikes = useMemo(() => rawUserLikes, [rawUserLikes]);

  const { doRequest } = useRequest({
    url: "/api/spanish-proposals/" + id,
    method: "get",
    onSuccess(data) {
      setRawVoteResults(data);
    },
  });

  const { doRequest: likesRequest } = useRequest({
    url: "/api/spanish-proposals/likes",
    method: "post",
    body: { proposal_id: id },
    onSuccess(data) {
      setRawLikesInfo(data);
    },
  });

  const { doRequest: userLikeRequest } = useRequest({
    url: "/api/spanish-proposals/likes/user",
    method: "post",
    body: { proposal_id: id },
    onSuccess(data) {
      setRawUserLikes(data);
    },
  });

  const { doRequest: onLikeProposal } = useRequest({
    url: "/api/spanish-proposals/likes/like",
    method: "post",
    body: { proposal_id: Number(id) },
    onSuccess(data) {
      setRawLikesInfo(data);
      setRawUserLikes(data);
    },
  });

  const { doRequest: onDisLikeProposal } = useRequest({
    url: "/api/spanish-proposals/likes/dislike",
    method: "post",
    body: { proposal_id: Number(id) },
    onSuccess(data) {
      setRawLikesInfo(data);
      setRawUserLikes(data);
    },
  });

  useEffect(() => {
    const fetchData = async () => {
      setIsFetching(true);
      try {
        await doRequest();
        await likesRequest();
        if (user.currentUser) await userLikeRequest();
      } catch (error) {
        log.error("Error fetching data:", error);
      } finally {
        setIsFetching(false);
      }
    };

    if (!user.loading) fetchData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user]);

  const goBack = () => {
    window.history.back();
  };

  const handleUserLikes = async (status: "like" | "dislike") => {
    if (isFetching) return;
    if (!user.currentUser) {
      showToast({ message: t("no-logged-in"), variant: "info", duration: 3000 });
      return;
    }
    setIsFetching(true);
    try {
      if (status === "like") await onLikeProposal();
      else await onDisLikeProposal();
    } catch (error) {
      log.error("Error handling likes:", error);
    } finally {
      setIsFetching(false);
    }
  };

  const memoizedParties = useMemo(() => voteResults?.votes_parties_json || [], [voteResults?.votes_parties_json]);

  const memoizedChartVotes = useMemo(() => {
    if (!memoizedParties) return null;
    return memoizedParties.map((party) => {
      const proposals = {
        votes_against: party.against,
        votes_for: party.for,
        abstentions: party.abstain,
        no_vote: party.noVote,
        id: party.party,
      };
      return (
        <div key={party.party} className="flex justify-center items-center">
          <ChartVotes proposals={proposals} logo={`/parties/${proposals.id}.svg`} />
        </div>
      );
    });
  }, [memoizedParties]);

  const groupedRelatedPromises = useMemo(() => {
    const promises = voteResults?.relatedPromises ?? [];
    return {
      "Supporting Evidence": promises.filter((p) => p.fulfillment_status === "Supporting Evidence"),
      "Contradictory Evidence": promises.filter((p) => p.fulfillment_status === "Contradictory Evidence"),
      "Partial/Indirect Evidence": promises.filter((p) => p.fulfillment_status === "Partial/Indirect Evidence"),
    };
  }, [voteResults?.relatedPromises]);

  if (!voteResults) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen">
        <Loading />
      </div>
    );
  }

  const proposalType = getProposalType(voteResults.expedient_text);
  const total = voteResults.parliament_presence || (voteResults.votes_for + voteResults.votes_against + voteResults.abstentions + voteResults.no_vote);
  const hasRelatedPromises = (voteResults.relatedPromises?.length ?? 0) > 0;


  return (
    <section className="flex flex-col items-start justify-start min-h-screen pb-20 gap-8 font-drsans w-full max-w-4xl mx-auto">

      {/* Header: back + date + proposal type */}
      <div className="w-full flex flex-row items-center justify-between pt-4">
        <Image
          onClick={goBack}
          className="hidden md:inline cursor-pointer w-5 h-5"
          src="/back-icn.svg"
          alt="go back"
          width={30}
          height={30}
          priority
        />
        <div className="flex items-center gap-3 ml-auto">
          {proposalType && (
            <span className="text-xs font-medium bg-drPurple/10 text-drPurple px-2 py-1 rounded-full">
              {proposalType}
            </span>
          )}
          <p className="text-xs text-drgray">{formatDate(voteResults.date)}</p>
        </div>
      </div>

      {/* Title + expedient text + congress link */}
      <div className="w-full flex flex-col gap-3">
        <h1 className="text-2xl font-bold font-drserif w-full">{voteResults.title}</h1>
        <p className="text-justify font-drsans text-drgray">{voteResults.expedient_text}</p>
        <Link className="text-drPurple hover:opacity-60 duration-500 text-sm" href={voteResults.url} target="_blank">
          {t("parliament-link")}
        </Link>
      </div>

      {/* Aggregate vote bar */}
      <div className="w-full flex flex-col gap-3">
        <h2 className="text-lg font-bold font-drserif text-contrast">{t("vote-summary")}</h2>
        <div className="w-full h-5 rounded-full overflow-hidden flex bg-gray-100">
          {total > 0 && (
            <>
              <div
                className="bg-green-600 h-full"
                style={{ width: `${(voteResults.votes_for / total) * 100}%` }}
              />
              <div
                className="bg-red-500 h-full"
                style={{ width: `${(voteResults.votes_against / total) * 100}%` }}
              />
              <div
                className="bg-amber-400 h-full"
                style={{ width: `${(voteResults.abstentions / total) * 100}%` }}
              />
              <div
                className="bg-gray-300 h-full"
                style={{ width: `${(voteResults.no_vote / total) * 100}%` }}
              />
            </>
          )}
        </div>
        <div className="flex flex-wrap gap-x-5 gap-y-2 text-sm">
          <VoteStat color="bg-green-600" textColor="text-green-700" count={voteResults.votes_for} label={t("votes-for")} />
          <VoteStat color="bg-red-500" textColor="text-red-700" count={voteResults.votes_against} label={t("votes-against")} />
          <VoteStat color="bg-amber-400" textColor="text-amber-700" count={voteResults.abstentions} label={t("abstentions")} />
          <VoteStat color="bg-gray-300" textColor="text-gray-600" count={voteResults.no_vote} label={t("no-vote")} />
          <span className="text-gray-400 text-xs self-center">{t("present")}: {total}</span>
        </div>
      </div>

      {/* Per-party breakdown */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-5 w-full">{memoizedChartVotes}</div>

      {/* Related electoral promises */}
      <div className="w-full flex flex-col gap-4">
        <h2 className="text-lg font-bold font-drserif text-contrast">{t("related-promises")}</h2>
        {hasRelatedPromises ? (
          <div className="flex flex-col gap-3">
            {(["Supporting Evidence", "Contradictory Evidence", "Partial/Indirect Evidence"] as const).map((status) => {
              const items = groupedRelatedPromises[status];
              if (items.length === 0) return null;
              const styles = STATUS_STYLES[status];
              return (
                <div key={status} className={`rounded-lg border p-4 ${styles.container}`}>
                  <p className={`text-xs font-semibold uppercase tracking-wide mb-3 ${styles.label}`}>
                    {t(STATUS_LABEL_KEYS[status])} ({items.length})
                  </p>
                  <div className="flex flex-col gap-3">
                    {items.map((promise) => (
                      <RelatedPromiseCard key={promise.promise_id} promise={promise} badgeClass={styles.badge} />
                    ))}
                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          <p className="text-sm text-gray-500 bg-gray-50 rounded-lg p-4 border border-gray-200">
            {t("no-related-promises")}
          </p>
        )}
      </div>

      {/* User opinion */}
      <div className="flex flex-row justify-start items-center w-full gap-5">
        <p className="font-bold text-xl">{t("your-opinion")}</p>
        <div className="flex flex-row justify-center items-center gap-2">
          <Image
            onClick={() => handleUserLikes("like")}
            className="w-6 h-6 cursor-pointer"
            src={userLikes?.likes > 0 ? "/like-filled-icn.svg" : "/like-icn.svg"}
            alt="like"
            width={25}
            height={25}
            priority
          />
          <span>{likesInfo?.likes}</span>
        </div>
        <div className="flex flex-row justify-center items-center gap-2">
          <Image
            onClick={() => handleUserLikes("dislike")}
            className="w-6 h-6 cursor-pointer"
            src={userLikes?.dislikes > 0 ? "/dislike-filled-icn.svg" : "/dislike-icn.svg"}
            alt="dislike"
            width={25}
            height={25}
            priority
          />
          <span>{likesInfo?.dislikes}</span>
        </div>
      </div>
    </section>
  );
}

function VoteStat({ color, textColor, count, label }: { color: string; textColor: string; count: number; label: string }) {
  return (
    <span className="flex items-center gap-1.5">
      <span className={`w-3 h-3 rounded-full inline-block flex-shrink-0 ${color}`} />
      <span className={`font-semibold ${textColor}`}>{count}</span>
      <span className="text-gray-600">{label}</span>
    </span>
  );
}

function RelatedPromiseCard({ promise, badgeClass }: { promise: RelatedPromise; badgeClass: string }) {
  return (
    <div className="bg-white rounded-lg p-3 border border-gray-100 shadow-sm">
      <p className="text-sm text-gray-800 font-medium mb-1 leading-snug">{promise.promise_text}</p>
      <p className="text-xs text-gray-500 mb-2 leading-relaxed">{promise.analysis_summary}</p>
      <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${badgeClass}`}>
        {promise.party_name} · {promise.campaign_year}
      </span>
    </div>
  );
}
