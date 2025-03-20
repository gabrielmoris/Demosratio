import LpCard from "@/src/components/LpCard";
import { useTranslations } from "next-intl";

export default function Home() {
  const t = useTranslations("landingpage");

  return (
    <section className="flex flex-col gap-8 md:gap-12 items-center sm:items-start">
      <div className="flex flex-col gap-5 md:gap-10">
        <h1 className="text-2xl font-semibold text-[#262835] font-[family-name:var(--font-roboto-serif)]">
          {t("title")}
        </h1>
        <p className="text-lg text-justify">{t("subtitle")}</p>
      </div>

      <div className="w-full flex flex-col md:flex-row gap-5 md:gap-20 justify-between items-center mb-20 md:mb-0">
        <LpCard type="parliament" />
        <LpCard type="promises" />
      </div>
    </section>
  );
}
