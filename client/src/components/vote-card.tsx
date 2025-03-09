import { memo } from "react";
import { VotingData } from "../types/proposal";
import { ExpandableText } from "./expandable-text";

const VoteCardComponent = ({ vote }: { vote: VotingData }) => {
  return (
    <div className="border border-drPurple border-opacity-30 p-8 rounded-md w-full cursor-pointer hover:shadow-drPurple hover:shadow-sm">
      <ExpandableText
        className="font-drserif text-sm font-bold"
        isExpandable={false}
        key={vote.id}
        maxLines={1}
        text={vote.expedient_text}
      ></ExpandableText>
    </div>
  );
};

const MemoizedVoteCard = memo(VoteCardComponent);
export { MemoizedVoteCard as VoteCard };
