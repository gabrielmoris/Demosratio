"use client";
import { useRequest } from "@/hooks/use-request";
import { useLocale } from "next-intl";
import Image from "next/image";
import { useRouter } from "next/navigation";
import React, { useState } from "react";

interface Props {
  id?: number;
  name: string;
  icon: string;
  link?: string;
  api?: string;
}

export const AdminPanel = ({ name, icon, link }: Props) => {
  const [isRunning, setIsRunning] = useState<boolean>(false);

  const router = useRouter();
  const locale = useLocale();

  const runRequest = () => {
    if (!link) {
      setIsRunning(true);
      doRequest();
    } else {
      router.push(`/${locale}/${link}`);
    }
  };

  const { doRequest } = useRequest({
    url: "/api/cron/parliament-data",
    method: "get",
    onSuccess: () => {
      setIsRunning(false);
    },
  });

  return (
    <div
      className="flex justify-start items-center cursor-pointer flex-row h-32 gap-5 md:gap-20 border bg-white border-drPurple border-opacity-30 p-8 md:px-20 rounded-md w-full hover:shadow-drPurple hover:shadow-sm"
      onClick={runRequest}
    >
      <Image
        alt={name}
        src={icon}
        width={50}
        height={50}
        className={`${isRunning ? "animate-spin" : ""}`}
      />
      <p className="font-bold text-xl md:text-2xl">{name}</p>
    </div>
  );
};
