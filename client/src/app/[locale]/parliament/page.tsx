/* eslint-disable react-hooks/exhaustive-deps */
"use client";
import { useRequest } from "@/hooks/use-request";
import Loading from "@/src/components/Loading";
import { VoteCard } from "@/src/components/VoteCard";
import { VotingData } from "@/src/types/proposal";
import { useEffect, useState } from "react";
import { useInView } from "react-intersection-observer";

// import { useTranslations } from "next-intl";
// import Link from "next/link";

export default function Parliament() {
  const [votes, setVotes] = useState<VotingData[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [page, setPage] = useState(1);
  const [isLoadingMore, setIsLoadingMore] = useState(false);
  const [noMoreVotes, setNoMoreVotes] = useState<boolean>(false);

  // const t = useTranslations("landingpage");

  const { doRequest, errors } = useRequest({
    url: "http://localhost:3001/api/proposals?page=" + page,
    method: "get",
    onSuccess(data) {
      setLoading(false);
      setNoMoreVotes(votes.length === data.totalCount);
      setVotes([...votes, ...data.proposals]);
    },
  });

  const loadVotes = () => {
    if (isLoadingMore) return;
    setIsLoadingMore(true);
    setLoading(true);
    setPage(page + 1);
    doRequest();
    setIsLoadingMore(false);
  };

  const { ref, inView } = useInView({
    threshold: 0,
  });

  useEffect(() => {
    loadVotes();
  }, []);

  useEffect(() => {
    if (inView && !isLoadingMore && !noMoreVotes) {
      loadVotes();
    }
  }, [inView]);

  return (
    <div className="flex flex-col items-center justify-items-center min-h-screen pb-20 gap-16 p-5 md:p-20 font-[family-name:var(--font-geist-sans)]">
      <main className="flex flex-col gap-8 justify-center items-center">
        {votes?.length > 0 &&
          votes.map((vote) => {
            return <VoteCard key={vote.id} vote={vote} />;
          })}
      </main>
      {errors}
      <div ref={ref}></div>
      {loading && <Loading />}
    </div>
  );
}
