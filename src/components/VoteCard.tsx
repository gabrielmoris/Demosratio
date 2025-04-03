import { memo, useMemo } from "react";
import { VotingData } from "../../types/proposal";
import { ExpandableText } from "./ExpandableText";

import Image from "next/image";
import ChartVotes from "./ChartVotes";
import Button from "./Button";
import { useTranslations } from "next-intl";
import { useRouter } from "../i18n/routing";
import { formatDate } from "@/lib/helpers/dateFormatters";

const VoteCardComponent = ({ vote }: { vote: VotingData }) => {
  const t = useTranslations("votecard-component");
  const route = useRouter();

  const onclickCTA = (e: React.MouseEvent<HTMLButtonElement>) => {
    e.preventDefault();
    route.push(`/parliament/${vote.id}`);
  };

  const memoizedProposals = useMemo(
    () => ({
      votes_against: vote.votes_against,
      votes_for: vote.votes_for,
      abstentions: vote.abstentions,
      parliament_presence: vote.parliament_presence,
      no_vote: vote.no_vote,
      id: vote.id,
    }),
    [vote]
  );

  return (
    <div className="flex flex-col gap-5 border bg-white border-drPurple border-opacity-30 p-8 md:px-20 rounded-md w-full hover:shadow-drPurple hover:shadow-sm">
      <p className="font-drserif text-sm font-bold">{vote.title}</p>
      <ExpandableText className="font-drsans text-sm" key={vote.id} maxLines={2} text={vote.expedient_text}></ExpandableText>
      <div className="w-full flex fllex-row items-center justify-start py-2 md:px-28 md:py-5 bg-drlight rounded-md">
        <ChartVotes proposals={memoizedProposals} />
      </div>
      <div className="flex flex-row w-full items-end justify-end">
        <Button onClick={onclickCTA} label={t("button-cta")} className="w-full md:w-1/3" />
      </div>

      <div className="flex justify-between items-end w-full">
        <div className="flex flex-row gap-5">
          <div className="flex flex-row justify-center items-cente gap-2">
            <Image className="w-5 h-5" src="/like-filled-icn.svg" alt="profile-icn" width={25} height={25} priority />
            {vote.likesAndDislikes?.likes}
          </div>
          <div className="flex flex-row justify-center items-center gap-2">
            <Image className="w-5 h-5" src="/dislike-filled-icn.svg" alt="profile-icn" width={25} height={25} priority />
            {vote.likesAndDislikes?.dislikes}
          </div>
        </div>
        <p className="text-drgray text-xs">{formatDate(vote.date)}</p>
      </div>
    </div>
  );
};

const MemoizedVoteCard = memo(VoteCardComponent);
export { MemoizedVoteCard as VoteCard };
