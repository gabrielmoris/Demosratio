"use client";
import { useCallback, useEffect, useRef, useState } from "react";
import { useInView } from "react-intersection-observer";
import { useRequest } from "@/hooks/use-request";
import Loading from "@/src/components/Loading";
import { VoteCard } from "@/src/components/VoteCard";
import { VotingData } from "@/src/types/proposal";
import Input from "@/src/components/Input";
import { useTranslations } from "next-intl";

export default function Parliament() {
  const [votes, setVotes] = useState<VotingData[]>([]);
  const [page, setPage] = useState(1);
  const [isLoading, setIsLoading] = useState(false);
  const [noMoreVotes, setNoMoreVotes] = useState(false);
  const [search, setSearch] = useState("");
  const [inputValue, setInputValue] = useState("");
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);

  const t = useTranslations("parliament");

  const { doRequest, errors } = useRequest({
    url: `http://localhost:3001/api/proposals${
      search && "/search"
    }?page=${page}${search && "&expedient_text=" + search}`,
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

  const onInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    e.preventDefault();
    const newValue = e.target.value;
    setInputValue(newValue); // Update the immediate input value

    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }

    timeoutRef.current = setTimeout(() => {
      setSearch(newValue);
      timeoutRef.current = null;
      setTimeout(() => {
        setIsLoading(true);
        setPage(0);
        setVotes([]);
        doRequest();
      }, 100);
    }, 1000);
  };

  return (
    <div className="flex flex-col items-center justify-items-center min-h-screen pb-20 gap-16 p-5 md:p-20 font-[family-name:var(--font-geist-sans)]">
      <main className="flex flex-col gap-8 justify-center items-center">
        <Input
          inputLabel={t("search-input")}
          inputString={inputValue}
          type="text"
          inputKey="search"
          placeholder=""
          setInput={onInputChange}
        />
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
