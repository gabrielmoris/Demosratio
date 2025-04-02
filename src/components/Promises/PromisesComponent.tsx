"use client";
import React from "react";
import { usePartiesContext } from "../admin/ManageParties/StateManager";
import Loading from "../Loading";

export const PromisesComponent = () => {
  // const t = useTranslations("promises");
  const { parties, loading } = usePartiesContext();

  if (loading) {
    return <Loading />;
  }

  return <div>{parties.length}</div>;
};
