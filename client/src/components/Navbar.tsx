"use client";
import Image from "next/image";
import { Link } from "../i18n/routing";
import { useAuth } from "../context/authContext";
import { useState } from "react";
import { useRequest } from "@/hooks/use-request";

export default function Navbar() {
  const { currentUser, updateCurrentUser } = useAuth();
  const [openUser, setOpenUser] = useState(false);

  const { doRequest } = useRequest({
    url: "http://localhost:3002/api/users/signout",
    method: "post",
    body: {},
    onSuccess: () => {
      updateCurrentUser();
    },
  });

  return (
    <nav className="flex flex-row md:flex-col items-center justify-around md:justify-start bg-contrast w-screen h-16 bottom-0 left-0 md:w-16 md:min-h-screen fixed md:top-0 md:left-0 py-10 gap-10">
      {currentUser ? (
        <>
          <p
            onClick={() => setOpenUser(!openUser)}
            className="w-10 h-10 rounded-full flex flex-col items-center justify-center hover:opacity-60 duration-500 cursor-pointer"
          >
            <Image src="/dr-icn.svg" alt="dr-icn" width={50} height={50} priority />
          </p>
          {openUser && (
            <>
              <Image onClick={doRequest} className="cursor-pointer" src="/exit-icn.svg" alt="anon-icn" width={50} height={50} priority />
              <hr className="border border-drlight w-2/3 opacity-55" />
            </>
          )}
        </>
      ) : (
        <Link className="w-10 h-10 rounded-full flex flex-col items-center justify-center hover:opacity-60 duration-500" href="/login">
          <Image src="/anon-icn.svg" alt="anon-icn" width={50} height={50} priority />
        </Link>
      )}

      <Link className="w-10 h-10 rounded-full flex flex-col items-center justify-center hover:opacity-60 duration-500" href="/promises">
        <Image src="/promis-icn.svg" alt="promises-icn" width={50} height={50} />
      </Link>
      <Link className="w-10 h-10 rounded-full flex flex-col items-center justify-center hover:opacity-60 duration-500" href="/parliament">
        <Image src="/proposals-icn.svg" alt="proposals-icn" width={50} height={50} />
      </Link>
      <Link className="w-10 h-10 rounded-full flex flex-col items-center justify-center hover:opacity-60 duration-500" href="/manifest">
        <Image src="/what-icn.svg" alt="what-icn" width={50} height={50} />
      </Link>
    </nav>
  );
}
