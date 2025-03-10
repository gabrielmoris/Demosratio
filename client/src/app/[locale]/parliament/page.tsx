"use client";
import { useRequest } from "@/hooks/use-request";
import { useEffect } from "react";
// import { useTranslations } from "next-intl";
// import Link from "next/link";

export default function Parliament() {
  const { doRequest, errors } = useRequest({
    url: "http://localhost:3001/api/proposals",
    method: "get",
  });

  // const t = useTranslations("landingpage");

  useEffect(() => {
    doRequest().then((data) => console.log(data));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <div className="flex flex-col items-center justify-items-center min-h-screen p-8 pb-20 gap-16 sm:p-20 font-[family-name:var(--font-geist-sans)]">
      <main className="flex flex-col gap-8 row-start-2 items-center sm:items-start"></main>
      {errors}
    </div>
  );
}
