"use client";
import { useRequest } from "@/hooks/use-request";
import ChartVotes from "@/src/components/ChartVotes";
import Loading from "@/src/components/Loading";
import { Proposal } from "@/src/types/proposal";
import Image from "next/image";
import Link from "next/link";
import { useTranslations } from "next-intl";
import { useParams } from "next/navigation";
import { useEffect, useState } from "react";
import { LiKesAndDislikes } from "@/src/types/likesAndDislikes";

export default function VotePage() {
  const [voteResults, setVoteResults] = useState<Proposal>();
  const [likesInfo, setLikesInfo] = useState<LiKesAndDislikes>();
  const [userLikes, setUserLikes] = useState<LiKesAndDislikes>();

  const t = useTranslations("votepage");
  const params = useParams();
  const id = params.id;

  const { doRequest } = useRequest({
    url: "http://localhost:3001/api/proposals/" + id,
    method: "get",
    onSuccess(data) {
      setVoteResults(data);
    },
  });

  const { doRequest: likesRequest } = useRequest({
    url: "http://localhost:3001/api/likes",
    method: "post",
    body: { proposal_id: id },
    onSuccess(data) {
      setLikesInfo(data);
    },
  });

  const { doRequest: userLikeRequest } = useRequest({
    url: "http://localhost:3001/api/likes/user",
    method: "post",
    body: { proposal_id: id },
    onSuccess(data) {
      setUserLikes(data);
    },
  });

  const { doRequest: onLikeProposal } = useRequest({
    url: "http://localhost:3001/api/likes/like",
    method: "post",
    body: { proposal_id: id },
    onSuccess() {
      console.log(userLikes);
      setUserLikes({
        ...userLikes,
        likes: 1,
        dislikes: userLikes?.dislikes || 0,
        proposal_id: Number(id),
      });
    },
  });

  const { doRequest: onDisLikeProposal } = useRequest({
    url: "http://localhost:3001/api/likes/dislike",
    method: "post",
    body: { proposal_id: id },
    onSuccess() {
      console.log(userLikes);
      setUserLikes({
        ...userLikes,
        likes: 1,
        dislikes: userLikes?.dislikes || 0,
        proposal_id: Number(id),
      });
    },
  });

  useEffect(() => {
    doRequest();
    likesRequest();
    userLikeRequest();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const goBack = () => {
    window.history.back();
  };

  const handleUserLikes = (status: "like" | "dislike") => {
    if (status === "like" && userLikes?.likes === 0) {
      onLikeProposal();
    } else if (status === "dislike" && userLikes?.dislikes === 0) {
      onDisLikeProposal();
    } else {
      // Here I must Handle the like, dislike, I should do both requests at the same time In case the user already like/dislikes
      // In the apo I have to check if it was before liked and then I should unlike or undislike if it was.
      console.log("check here the logic");
    }
  };

  if (voteResults) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen pb-20 gap-16 p-5 md:p-20 font-drnote">
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
          <p className="text-xs text-drgray">{voteResults.date}</p>
        </div>
        <h1 className="text-xl font-bold font-drserif">{voteResults.title}</h1>
        <h2 className="text-justify font-drnote text-drgray">
          {voteResults.expedient_text}
        </h2>
        <Link
          className="w-full text-drPurple hover:opacity-60 duration-500"
          href={voteResults.url}
          target="_blank"
        >
          {t("parliament-link")}
        </Link>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-5 w-full">
          {voteResults.votes_parties_json.map((party) => {
            return (
              <div
                key={party.party}
                className="flex justify-center items-center"
              >
                <ChartVotes
                  proposals={{
                    votes_against: party.against,
                    votes_for: party.for,
                    abstentions: party.abstain,
                    no_vote: party.noVote,
                    id: party.party,
                  }}
                  logo={`/parties/${party.party}.svg`}
                />
              </div>
            );
          })}
        </div>

        <div className="flex flex-row justify-start items-center w-full gap-5">
          <p className="font-bold text-xl">{t("your-opinion")}</p>
          <div className="flex flex-row justify-center items-cente gap-2">
            <Image
              onClick={() => handleUserLikes("like")}
              className="w-6 h-6 cursor-pointer"
              src={
                userLikes && userLikes?.likes > 0
                  ? "/like-filled-icn.svg"
                  : "/like-icn.svg"
              }
              alt="profile-icn"
              width={25}
              height={25}
              priority
            />
            {likesInfo?.likes}
          </div>
          <div className="flex flex-row justify-center items-center gap-2">
            <Image
              onClick={() => handleUserLikes("dislike")}
              className="w-6 h-6 cursor-pointer"
              src={
                userLikes && userLikes?.dislikes > 0
                  ? "/dislike-filled-icn.svg"
                  : "/dislike-icn.svg"
              }
              alt="profile-icn"
              width={25}
              height={25}
              priority
            />
            {likesInfo?.dislikes}
          </div>
        </div>
      </div>
    );
  } else {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen ">
        <Loading />
      </div>
    );
  }
}
