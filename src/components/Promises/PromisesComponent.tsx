"use client";
import React from "react";
import { usePartiesContext } from "../admin/ManageParties/StateManager";
import Loading from "../Loading";
import Image from "next/image";

export const PromisesComponent = () => {
  // const t = useTranslations("promises");
  const { parties, loading } = usePartiesContext();

  if (loading) {
    return <Loading />;
  }

  return (
    <div className="flex flex-row flex-wrap gap-10 justify-center align-center">
      {parties.map((party) => {
        return (
          <div
            key={party.id}
            className="border cursor-pointer duration-500 bg-white flex items-center justify-center border-drPurple h-28 w-28 rounded-md hover:-translate-y-1 hover:shadow-drPurple hover:shadow-sm"
          >
            <Image
              src={party.logo_url}
              width={100}
              height={100}
              alt={party.name + "logo"}
            />
          </div>
        );
      })}
    </div>
  );
};
