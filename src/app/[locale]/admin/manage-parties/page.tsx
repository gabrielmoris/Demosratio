/* eslint-disable react-hooks/exhaustive-deps */
"use client";
import { useRequest } from "@/hooks/use-request";
import Dropdown from "@/src/components/Dropdown";
import Loading from "@/src/components/Loading";
import { Party } from "@/types/parties";
import { useEffect, useState } from "react";

export default function ManageParties() {
  const [parties, setParties] = useState<Party[]>([]);
  const [loading, setLoading] = useState(true);
  const [partyChoice, setPartyChoice] = useState<Party>();

  const { doRequest } = useRequest({
    url: "/api/parties",
    method: "get",
    onSuccess: (data: Party[]) => {
      setParties(data);
      setLoading(false);
    },
  });

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      await doRequest();
    };

    fetchData();
  }, []);

  const deleteParty = (id: number) => {
    console.log("DELETE PARTY WITH ID => ", id);
  };

  const handleClick = (item: Partial<Party>) => {
    console.log("Save this", item);
  };

  if (loading) {
    return <Loading />;
  }

  return (
    <div>
      <Dropdown handleClick={handleClick} items={parties} deleteItem={deleteParty} choose={setPartyChoice} choice={partyChoice || parties[0]} />
    </div>
  );
}
