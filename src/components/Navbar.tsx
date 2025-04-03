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
    url: "/api/users/signout",
    method: "post",
    body: {},
    onSuccess: () => {
      setOpenUser(false);
      updateCurrentUser();
    },
  });

  return (
    <nav className="flex flex-row md:flex-col items-center z-50 border-t md:border-t-0 border-drlight backdrop-blur-2xl justify-around md:justify-start bg-contrast w-screen h-16 bottom-0 left-0 md:w-16 md:min-h-screen fixed md:top-0 md:left-0 py-10 gap-2 lg:gap-10">
      {currentUser ? (
        <>
          <p
            onClick={() => setOpenUser(!openUser)}
            className="w-7 h-7 lg:w-10 lg:h-10 rounded-full flex flex-col items-center justify-start hover:opacity-60 cursor-pointer"
          >
            <Image src="/dr-icn.svg" alt="dr-icn" width={100} height={100} priority />
          </p>
          <div
            className={`flex flex-row md:flex-col gap-2 lg:gap-10 items-center justify-start ${openUser ? "relative" : "absolute"} ${
              openUser ? "opacity-100" : "opacity-0 pointer-events-none"
            }`}
            style={{
              transition: `${
                openUser ? "opacity 700ms ease-out, transform 300ms ease-in-out" : "opacity 300ms ease-out, transform 700ms ease-in-out"
              }`,
            }}
          >
            <Image
              onClick={() => doRequest()}
              className={`cursor-pointer w-7 h-7 lg:w-10 lg:h-10 transition-transform duration-500 ${
                openUser ? "transform-none" : "transform translate-y-2"
              }`}
              src="/exit-icn.svg"
              alt="anon-icn"
              width={50}
              height={50}
              priority
            />
            <Link
              className={`w-7 h-7 lg:w-10 lg:h-10 rounded-full flex flex-col items-center justify-center hover:opacity-60 transition-transform duration-500 ${
                openUser ? "transform-none" : "transform translate-y-2"
              }`}
              onClick={() => setOpenUser(false)}
              href="/profile"
            >
              <Image src="/profile-icn.svg" alt="profile-icn" width={50} height={50} priority />
            </Link>
            <hr className="border border-drlight h-[3rem] lg:h-0 lg:w-full opacity-55" />
          </div>
        </>
      ) : (
        <Link className="w-7 h-7 lg:w-10 lg:h-10 rounded-full flex flex-col items-center justify-center hover:opacity-60 duration-500" href="/login">
          <Image src="/anon-icn.svg" alt="anon-icn" width={50} height={50} priority />
        </Link>
      )}

      <Link
        onClick={() => setOpenUser(false)}
        className="w-7 h-7 lg:w-10 lg:h-10 rounded-full flex flex-col items-center justify-center hover:opacity-60 duration-500"
        href="/parliament"
      >
        <Image src="/proposals-icn.svg" alt="proposals-icn" width={50} height={50} />
      </Link>
      <Link
        onClick={() => setOpenUser(false)}
        className="w-7 h-7 lg:w-10 lg:h-10 rounded-full flex flex-col items-center justify-center hover:opacity-60 duration-500"
        href="/promises"
      >
        <Image src="/promis-icn.svg" alt="promises-icn" width={50} height={50} />
      </Link>
      <Link
        onClick={() => setOpenUser(false)}
        className="w-7 h-7 lg:w-10 lg:h-10 rounded-full flex flex-col items-center justify-center hover:opacity-60 duration-500"
        href="/manifest"
      >
        <Image src="/what-icn.svg" alt="what-icn" width={50} height={50} />
      </Link>
    </nav>
  );
}
