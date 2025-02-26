import Image from "next/image";
import { Link } from "../i18n/routing";

export default function Navbar() {
  return (
    <nav className="flex flex-col items-center justify-start min-h-screen bg-contrast w-16 fixed top-0 left-0 py-10 gap-10">
      <Link className="w-10 h-10 rounded-full" href="/login">
        <Image
          src="/anon-icn.svg"
          alt="promises-icn"
          width={50}
          height={50}
          priority
        />
      </Link>
      <Link
        className="w-10 h-10 rounded-full flex flex-col items-center justify-center"
        href="/promises"
      >
        <Image
          src="/promis-icn.svg"
          alt="promises-icn"
          width={50}
          height={50}
        />
      </Link>
      <Link
        className="w-10 h-10 rounded-full flex flex-col items-center justify-center"
        href="/parliament"
      >
        <Image
          src="/proposals-icn.svg"
          alt="proposals-icn"
          width={50}
          height={50}
        />
      </Link>
      <Link
        className="w-10 h-10 rounded-full flex flex-col items-center justify-center"
        href="/manifest"
      >
        <Image src="/what-icn.svg" alt="what-icn" width={50} height={50} />
      </Link>
    </nav>
  );
}
