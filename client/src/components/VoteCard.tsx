import { memo, useEffect, useState } from "react";
import { VotingData } from "../types/proposal";
import { ExpandableText } from "./ExpandableText";
import { useRequest } from "@/hooks/use-request";
import { LiKesAndDislikes } from "../types/likesAndDislikes";
import Image from "next/image";
import ChartVotes from "./ChartVotes";

const VoteCardComponent = ({ vote }: { vote: VotingData }) => {
  const [likesInfo, setLikesInfo] = useState<LiKesAndDislikes>();

  const { doRequest } = useRequest({
    url: "http://localhost:3001/api/likes",
    method: "post",
    body: { proposal_id: vote.id },
    onSuccess(data) {
      setLikesInfo(data);
    },
  });
  useEffect(() => {
    doRequest();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <div className=" flex flex-col gap-5 border bg-white border-drPurple border-opacity-30 p-8 md:px-20 rounded-md w-full cursor-pointer hover:shadow-drPurple hover:shadow-sm">
      <p className="font-drserif text-sm font-bold">{vote.title}</p>
      <ExpandableText className="font-drnote text-sm " isExpandable={false} key={vote.id} maxLines={2} text={vote.expedient_text}></ExpandableText>
      <div className="w-full flex fllex-row items-center justify-start py-2 md:px-28 md:py-5 bg-drlight rounded-md">
        <ChartVotes
          proposals={{
            votes_against: vote.votes_against,
            votes_for: vote.votes_for,
            abstentions: vote.abstentions,
            parliament_presence: vote.parliament_presence,
            no_vote: vote.no_vote,
            proposal_id: vote.id,
          }}
        />
      </div>

      <div className="flex justify-between items-end w-full">
        <div className="flex flex-row gap-5">
          <div className="flex flex-row justify-center items-cente gap-2">
            <Image src="/like-icn.svg" alt="profile-icn" width={25} height={25} priority />
            {likesInfo?.likes}
          </div>
          <div className="flex flex-row justify-center items-center gap-2">
            <Image src="/dislike-icn.svg" alt="profile-icn" width={25} height={25} priority />
            {likesInfo?.dislikes}
          </div>
        </div>
        <p className="text-drgray text-xs">{vote.date}</p>
      </div>
    </div>
  );
};

const MemoizedVoteCard = memo(VoteCardComponent);
export { MemoizedVoteCard as VoteCard };
