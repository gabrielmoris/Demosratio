"use client";
import { Link } from "@/src/i18n/routing";
import Image from "next/image";
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
  const runRequest = () => {
    setIsRunning(true);
  };

  return link ? (
    <Link className="cursor-pointer" href={link}>
      <Image alt={name} src={icon} width={50} height={50} />
    </Link>
  ) : (
    <div className="cursor-pointer" onClick={runRequest}>
      <Image alt={name} src={icon} width={50} height={50} className={`${isRunning ? "animate-spin" : ""}`} />
    </div>
  );
};
