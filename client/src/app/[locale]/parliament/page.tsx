"use client";
// import { useTranslations } from "next-intl";
import { useEffect } from "react";
// import Link from "next/link";

export default function Parliament() {
  // const t = useTranslations("landingpage");

  useEffect(() => {
    fetchParliamentData().then((data) => console.log(data));
  }, []);

  return (
    <div className="flex flex-col items-center justify-items-center min-h-screen p-8 pb-20 gap-16 sm:p-20 font-[family-name:var(--font-geist-sans)]">
      <main className="flex flex-col gap-8 row-start-2 items-center sm:items-start"></main>
    </div>
  );
}

const fetchParliamentData = async () => {
  const rawData = await fetch("http://localhost:3001/api/proposals");
  const data = await rawData.json();
  return data;
};
