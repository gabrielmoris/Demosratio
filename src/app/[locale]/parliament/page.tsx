/* eslint-disable react-hooks/exhaustive-deps */
"use client";
import { useCallback, useEffect, useRef, useState } from "react";
import { useInView } from "react-intersection-observer";
import { useRequest } from "@/hooks/use-request";
import Loading from "@/src/components/Loading";
import { VoteCard } from "@/src/components/VoteCard";
import { VotingData } from "@/src/types/proposal";
import Input from "@/src/components/Input";
import { useTranslations } from "next-intl";
import SugestedSearch from "@/src/components/SugestedSearch";

export default function Parliament() {
  const [votes, setVotes] = useState<VotingData[]>([]);
  const [page, setPage] = useState(1);
  const [isLoading, setIsLoading] = useState(false);
  const [noMoreVotes, setNoMoreVotes] = useState(false);
  const [search, setSearch] = useState("");
  const [inputValue, setInputValue] = useState("");
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);

  const t = useTranslations("parliament");

  const { doRequest } = useRequest({
    url: `/api/spanish-proposals${search ? "/search" : ""}?page=${page}${
      search ? "&expedient_text=" + encodeURIComponent(search) : ""
    }`,
    method: "get",
    onSuccess(data) {
      setVotes((prevVotes) =>
        page === 1 ? data.proposals : [...prevVotes, ...data.proposals]
      );
      setNoMoreVotes(
        data.proposals.length === 0 || data.pagination.totalPages === page
      );
      setIsLoading(false);
    },
  });

  const loadVotes = useCallback(() => {
    if (isLoading || noMoreVotes) return;
    setIsLoading(true);
    doRequest();
  }, [isLoading, noMoreVotes, doRequest]);

  const { ref, inView } = useInView({
    threshold: 0.5,
  });

  useEffect(() => {
    if (inView && !isLoading && !noMoreVotes) {
      setPage((prevPage) => prevPage + 1);
    }
  }, [inView, isLoading, noMoreVotes]);

  useEffect(() => {
    loadVotes();
  }, [page, search]);

  const onInputChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
      const newValue = e.target.value;
      setInputValue(newValue);

      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }

      timeoutRef.current = setTimeout(() => {
        setSearch(newValue);
        setPage(1);
        setVotes([]);
        setNoMoreVotes(false);
      }, 500);
    },
    []
  );

  const sugestedSearch = (sugestedSearch: string) => {
    const event = {
      target: { value: sugestedSearch },
    } as React.ChangeEvent<HTMLInputElement>;
    onInputChange(event);
  };

  return (
    <main className="flex flex-col w-full items-center justify-items-center min-h-screen pb-20 gap-16 font-[family-name:var(--font-geist-sans)]">
      <section className="flex flex-col w-full gap-8 justify-center items-center">
        <Input
          inputLabel={t("search-input")}
          inputString={inputValue}
          type="text"
          inputKey="search"
          placeholder=""
          setInput={onInputChange}
        />
        {votes.length ? (
          votes.map((vote) => <VoteCard key={vote.id} vote={vote} />)
        ) : (
          <div className="flex flex-col items-center gap-10 justify-center w-full">
            {t("empty-search")}
            <SugestedSearch onClickFunction={sugestedSearch} />
          </div>
        )}
      </section>

      {isLoading && <Loading />}
      {!isLoading && !noMoreVotes && <div ref={ref}></div>}
    </main>
  );
}
