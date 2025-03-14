"use client";
import { useCallback, useEffect, useState } from "react";
import { useInView } from "react-intersection-observer";
import { useRequest } from "@/hooks/use-request";
import Loading from "@/src/components/Loading";
import { VoteCard } from "@/src/components/VoteCard";
import { VotingData } from "@/src/types/proposal";

export default function Parliament() {
  const [votes, setVotes] = useState<VotingData[]>([]);
  const [page, setPage] = useState(1);
  const [isLoading, setIsLoading] = useState(false);
  const [noMoreVotes, setNoMoreVotes] = useState(false);

  const { doRequest, errors } = useRequest({
    url: `http://localhost:3001/api/proposals?page=${page}`,
    method: "get",
    onSuccess(data) {
      setVotes((prevVotes) => [...prevVotes, ...data.proposals]);
      setNoMoreVotes(votes.length + data.proposals.length === data.totalCount);
      setIsLoading(false);
    },
  });

  const loadVotes = useCallback(() => {
    if (isLoading || noMoreVotes) return;
    setIsLoading(true);
    setPage((prevPage) => prevPage + 1);
    doRequest();
  }, [isLoading, noMoreVotes, doRequest]);

  const { ref, inView } = useInView({
    threshold: 0,
  });

  useEffect(() => {
    if (inView) {
      loadVotes();
    }
  }, [inView, loadVotes]);

  return (
    <div className="flex flex-col items-center justify-items-center min-h-screen pb-20 gap-16 p-5 md:p-20 font-[family-name:var(--font-geist-sans)]">
      <main className="flex flex-col gap-8 justify-center items-center">
        {votes.map((vote) => (
          <VoteCard key={vote.id} vote={vote} />
        ))}
      </main>
      {errors}
      {isLoading && <Loading />}
      {!isLoading && <div ref={ref}></div>}
    </div>
  );
}
