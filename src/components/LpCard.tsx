import Image from "next/image";
import { Link } from "../i18n/routing";
import { useTranslations } from "next-intl";

interface Props {
  type: "promises" | "parliament";
}

export default function LpCard({ type }: Props) {
  const t = useTranslations("landingpage-card");
  return (
    <Link
      href={type === "promises" ? "/promises" : "/parliament"}
      className="relative bg-contrast flex items-start justify-start flex-col text-background p-5 rounded-md font-[family-name:var(--font-roboto-serif)] min-h-52 md:min-h-72 text-drlight hover:opacity-80 hover:-translate-y-1 w-full duration-500"
    >
      <h1>{type === "promises" ? t("promises") : t("parliament")}</h1>

      <Image
        className="absolute top-1/2 right-1/2 translate-x-1/2 -translate-y-1/2"
        src={type === "promises" ? "/promis-icn.svg" : "/proposals-icn.svg"}
        alt={type === "promises" ? "promises-icn" : "proposals-icn"}
        width={80}
        height={80}
      />
    </Link>
  );
}
