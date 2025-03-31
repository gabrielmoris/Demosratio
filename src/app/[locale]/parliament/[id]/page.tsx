"use client";
import { useRequest } from "@/hooks/use-request";
import ChartVotes from "@/src/components/ChartVotes";
import Loading from "@/src/components/Loading";
import { Proposal } from "@/types/proposal";
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
      showToast({
        message: t("no-logged-in"),
        variant: "info",
        duration: 3000,
      });
      return;
    }

    setIsFetching(true);
    try {
      if (status === "like") {
        await onLikeProposal();
      } else if (status === "dislike") {
        await onDisLikeProposal();
      }
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

  if (voteResults) {
    return (
      <section className="flex flex-col items-center justify-center min-h-screen pb-20 gap-16 font-drnote">
        <div className="w-full flex flex-row items-end justify-between">
          <Image
            onClick={goBack}
            className="hidden md:inline left-5 md:left-20 top-5 cursor-pointer w-5 h-5"
            src="/back-icn.svg"
            alt="profile-icn"
            width={30}
            height={30}
            priority
          />
          <p className="text-xs text-drgray">{formatDate(voteResults.date)}</p>
        </div>
        <h1 className="text-2xl font-bold font-drserif w-full">{voteResults.title}</h1>
        <h2 className="text-justify font-drnote text-drgray">{voteResults.expedient_text}</h2>
        <Link className="w-full text-drPurple hover:opacity-60 duration-500" href={voteResults.url} target="_blank">
          {t("parliament-link")}
        </Link>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-5 w-full">{memoizedChartVotes}</div>

        <div className="flex flex-row justify-start items-center w-full gap-5">
          <p className="font-bold text-xl">{t("your-opinion")}</p>
          <div className="flex flex-row justify-center items-cente gap-2">
            <Image
              onClick={() => handleUserLikes("like")}
              className="w-6 h-6 cursor-pointer"
              src={userLikes && userLikes?.likes > 0 ? "/like-filled-icn.svg" : "/like-icn.svg"}
              alt="profile-icn"
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
              src={userLikes && userLikes?.dislikes > 0 ? "/dislike-filled-icn.svg" : "/dislike-icn.svg"}
              alt="profile-icn"
              width={25}
              height={25}
              priority
            />
            <span>{likesInfo?.dislikes}</span>
          </div>
        </div>
      </section>
    );
  } else {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen">
        <Loading />
      </div>
    );
  }
}
